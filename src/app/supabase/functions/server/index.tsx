import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_wrapper.tsx";
import { 
  extractFathomMeetingId, 
  fetchFathomTranscript, 
  parseFathomTranscript,
  testFathomConnection 
} from "./fathomClient.ts";
import * as rssFeeds from "./rss_feeds.tsx";
import { handleJamieExtract, handleJamieExtractFromFathom } from "./jamie_extract.ts";

/**
 * Retry helper for API calls with exponential backoff
 * Handles 503 (Service Unavailable) and other temporary failures
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or non-retryable error, return immediately
      if (response.ok || (response.status !== 503 && response.status !== 429 && response.status !== 500)) {
        return response;
      }
      
      // For 503/429/500 errors, retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5 seconds
        console.log(`⏳ Gemini API returned ${response.status}, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error;
      
      // Network errors - retry with backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`⏳ Network error calling Gemini API, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw lastError || new Error('All retry attempts failed');
}

// Timezone helper functions for server-side (Eastern Time)
const EASTERN_TZ = 'America/New_York';

function dateToLocalString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: EASTERN_TZ });
}

function getTodayLocal(): string {
  return dateToLocalString(new Date());
}

const app = new Hono();

// Log every single request for debugging
app.use('*', async (c, next) => {
  const method = c.req.method;
  const path = c.req.path;
  const url = c.req.url;
  console.log(`📥 INCOMING REQUEST: ${method} ${path}`);
  console.log(`🔗 Full URL: ${url}`);
  if (path.includes('documents')) {
    console.log(`🚨 DOCUMENTS REQUEST DETECTED! Method: ${method}, Path: ${path}`);
  }
  await next();
  console.log(`📤 RESPONSE SENT: ${method} ${path}`);
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// ========================================
// PUBLIC FATHOM WEBHOOK (NO AUTH REQUIRED)
// ========================================

// GET endpoint for testing - confirm the function is reachable
app.get("/integrations/status", async (c) => {
  console.log("✅ GET REQUEST RECEIVED AT BASE ENDPOINT");
  return c.json({ 
    success: true, 
    message: "SpoonFlow webhook endpoint is live!",
    endpoint: "/",
    methods: ["GET", "POST"],
    timestamp: new Date().toISOString()
  });
});

// TEST: Simple documents test endpoint
app.get("/documents-test", (c) => {
  console.log("🧪 DOCUMENTS TEST ENDPOINT HIT!");
  return c.json({ success: true, message: "Documents test endpoint works!", timestamp: new Date().toISOString() });
});

// Simplified public webhook for testing - accepts any POST data from Fathom
app.post("/", async (c) => {
  console.log("==========================================");
  console.log("🚨 FATHOM WEBHOOK HIT - POST REQUEST RECEIVED");
  console.log("==========================================");
  
  try {
    console.log("🎯 Processing webhook...");
    
    // Log all headers
    const headers: Record<string, string> = {};
    c.req.raw.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("📋 Headers:", JSON.stringify(headers, null, 2));
    
    // Get raw body
    const body = await c.req.json();
    console.log("📦 Raw Body:", JSON.stringify(body, null, 2));
    
    // Save raw payload for inspection
    const timestamp = Date.now();
    const webhookLog = {
      id: `webhook-${timestamp}`,
      timestamp: new Date().toISOString(),
      headers,
      body,
      source: 'fathom-webhook'
    };
    
    await kv.set(`fathom_webhook_test_${timestamp}`, webhookLog);
    console.log(`✅ Saved webhook payload: webhook-${timestamp}`);
    
    // Also add to a list for easy viewing
    const testLog = await kv.get("fathom_webhook_test_log") || { webhooks: [] };
    testLog.webhooks.unshift({
      id: `webhook-${timestamp}`,
      timestamp: webhookLog.timestamp,
      fieldCount: Object.keys(body).length,
      fields: Object.keys(body)
    });
    
    // Keep only last 20 test webhooks
    if (testLog.webhooks.length > 20) {
      testLog.webhooks = testLog.webhooks.slice(0, 20);
    }
    
    await kv.set("fathom_webhook_test_log", testLog);
    
    // Return 200 OK immediately
    return c.json({ 
      success: true, 
      message: "Webhook received and logged",
      webhookId: `webhook-${timestamp}`,
      timestamp: webhookLog.timestamp
    }, 200);
    
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    // Still return 200 to prevent Fathom from retrying
    return c.json({ 
      success: true, 
      error: "Error logged but returning 200 OK",
      details: String(error)
    }, 200);
  }
});

// Health check endpoint
app.get("/make-server-a89809a8/health", (c) => {
  console.log("🏥 Health check endpoint called");
  return c.json({ 
    status: "ok",
    service: "SpoonFlow Make Server",
    timestamp: new Date().toISOString(),
    endpoints: {
      webhookPOST: "/make-server-a89809a8",
      webhookGET: "/make-server-a89809a8",
      health: "/make-server-a89809a8/health",
      healthDb: "/make-server-a89809a8/health/db",
      fathomRecordings: "/make-server-a89809a8/fathom/recordings",
      fathomSyncLog: "/make-server-a89809a8/fathom/sync-log",
      webhookTestLog: "/make-server-a89809a8/fathom/webhook-test-log"
    }
  });
});

// Database health check endpoint
app.get("/make-server-a89809a8/health/db", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SPOONFLOW_URL');
    const serviceRoleKey = Deno.env.get('SPOONFLOW_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      return c.json({ 
        status: "error",
        message: "Missing environment variables",
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey
      }, 500);
    }
    
    // Try to perform a simple KV operation
    const testKey = "_health_check_" + Date.now();
    await kv.set(testKey, { timestamp: new Date().toISOString() });
    const result = await kv.get(testKey);
    await kv.del(testKey);
    
    return c.json({ 
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    const errorStr = String(error);
    
    return c.json({ 
      status: "error",
      database: "disconnected",
      error: errorStr.includes('<!DOCTYPE html>') ? "Cloudflare/Supabase connection error" : error.message,
      timestamp: new Date().toISOString()
    }, 503);
  }
});

// Quick Add Task endpoint - for iPhone Shortcuts and external integrations
app.post("/make-server-a89809a8/quick-add-task", async (c) => {
  try {
    // Log all headers for debugging
    console.log("📱 Quick-add-task request received");
    console.log("Headers:", Object.fromEntries(c.req.raw.headers.entries()));
    
    // Parse request body FIRST to see if we even get here
    const body = await c.req.json();
    console.log("Body received:", body);
    const { title, notes, dueDate, priority, taskType, contactName, contactId } = body;
    
    console.log("📅 DueDate value:", dueDate);
    console.log("📅 DueDate type:", typeof dueDate);
    
    // Verify API key from X-API-Key header (NOT from Authorization header)
    // Try multiple case variations since headers can be normalized differently
    const apiKey = c.req.header("X-API-Key") || c.req.header("x-api-key") || c.req.raw.headers.get("X-API-Key") || c.req.raw.headers.get("x-api-key");
    const validApiKey = Deno.env.get("iphone_shortcut_add_task");
    
    console.log("API Key received:", apiKey ? `present (${apiKey.substring(0, 20)}...)` : "missing");
    console.log("Valid API Key:", validApiKey ? `configured (${validApiKey.substring(0, 20)}...)` : "not configured");
    console.log("All header keys:", Array.from(c.req.raw.headers.keys()));
    
    if (!apiKey || apiKey !== validApiKey) {
      console.error("❌ Invalid or missing API key for quick-add-task");
      console.error(`Received: "${apiKey}", Expected: "${validApiKey}"`);
      return c.json({ error: "Unauthorized - invalid API key", message: "Missing X-API-Key header", code: 401 }, 401);
    }
    
    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return c.json({ error: "Title is required" }, 400);
    }
    
    // Load existing tasks
    const tasks = await kv.get("tasks") || [];
    
    // Create new task
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: notes || "",
      status: "toDo",
      priority: priority || undefined, // "high", "medium", "low"
      taskType: taskType || undefined, // "content", "business", "health", "personal"
      dueDate: dueDate || undefined, // ISO 8601 format
      contact: (contactName || contactId) ? {
        name: contactName || "",
        id: contactId || ""
      } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      estimatedDuration: 15 // default 15 minutes
    };
    
    // Add to tasks array
    tasks.push(newTask);
    await kv.set("tasks", tasks);
    
    console.log(`✅ Quick-add task created: ${newTask.id} - "${newTask.title}"`);
    console.log(`📅 Task dueDate saved as:`, newTask.dueDate);
    
    return c.json({ 
      success: true, 
      task: newTask,
      message: "Task created successfully"
    });
    
  } catch (error) {
    console.error("❌ Error in quick-add-task:", error);
    return c.json({ 
      error: "Failed to create task", 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// DEBUG: View full integrations object (remove in production)
app.get("/make-server-a89809a8/debug/integrations", async (c) => {
  try {
    const integrations = await kv.get("integrations") || {};
    return c.json({
      keys: Object.keys(integrations),
      full: integrations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// DEBUG: Search for contact backups
app.get("/make-server-a89809a8/debug/contact-backups", async (c) => {
  try {
    console.log('🔍 Searching for contact backups...');
    
    // Check specific contact keys
    const keys = [
      'spoonflow_contacts_backup',
      'app_contacts',
      'contacts_backup',
      'SUPABASE_CONTACTS_KEY'
    ];
    
    const results: Record<string, any> = {};
    
    for (const key of keys) {
      const value = await kv.get(key);
      if (value !== null && value !== undefined) {
        results[key] = {
          found: true,
          count: Array.isArray(value) ? value.length : 'N/A',
          preview: Array.isArray(value) ? value.slice(0, 2) : value
        };
      } else {
        results[key] = { found: false };
      }
    }
    
    // Also check for any keys with 'contact' prefix
    const contactPrefixItems = await kv.getByPrefix('contact');
    
    return c.json({
      specificKeys: results,
      prefixSearch: {
        count: contactPrefixItems.length,
        keys: contactPrefixItems.map(item => ({
          key: item.key,
          hasValue: !!item.value,
          count: Array.isArray(item.value) ? item.value.length : 'N/A'
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error searching for contact backups:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ========================================
// DOCUMENTS ENDPOINTS (MOVED UP FOR PRIORITY)
// ========================================

// GET documents - load all documents and folders
app.get("/make-server-a89809a8/documents", async (c) => {
  try {
    console.log("📄 GET /documents - Loading documents and folders [MOVED UP ENDPOINT]");
    
    const documentsData = await kv.get("documents_all");
    const foldersData = await kv.get("documents_folders");
    
    console.log("📄 Documents data from KV:", documentsData);
    console.log("📄 Folders data from KV:", foldersData);
    
    const documents = documentsData || [];
    const folders = foldersData || [];
    
    console.log("✅ Returning documents:", documents.length, "folders:", folders.length);
    
    return c.json({
      success: true,
      documents,
      folders
    });
  } catch (error) {
    console.error("❌ Error loading documents:", error);
    return c.json({ 
      success: false,
      error: "Error loading documents", 
      details: String(error) 
    }, 500);
  }
});

// POST documents - save all documents and folders
app.post("/make-server-a89809a8/documents", async (c) => {
  try {
    console.log("💾 Saving documents and folders [MOVED UP ENDPOINT]");
    
    const body = await c.req.json();
    const { documents, folders } = body;
    
    if (!documents || !folders) {
      return c.json({
        success: false,
        error: "Missing documents or folders in request body"
      }, 400);
    }
    
    // Save to KV store
    await kv.set("documents_all", documents);
    await kv.set("documents_folders", folders);
    
    console.log(`✅ Saved ${documents.length} documents and ${folders.length} folders`);
    
    return c.json({
      success: true,
      message: "Documents saved successfully",
      count: {
        documents: documents.length,
        folders: folders.length
      }
    });
  } catch (error) {
    console.error("❌ Error saving documents:", error);
    return c.json({ 
      success: false,
      error: "Error saving documents", 
      details: String(error) 
    }, 500);
  }
});

// ========================================
// KV STORE API
// ========================================

// Get a value by key
app.get("/make-server-a89809a8/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    console.log(`📖 Getting KV key: ${key}`);
    
    const value = await kv.get(key);
    
    if (value === null || value === undefined) {
      return c.json({ error: "Key not found" }, 404);
    }
    
    console.log(`✅ Found KV key: ${key}`);
    return c.json({ value });
  } catch (error) {
    console.error("❌ Error getting KV value:", error);
    return c.json({ error: error.message || String(error) }, 500);
  }
});

// Set a value by key
app.put("/make-server-a89809a8/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    
    // Check if request has a body
    const contentType = c.req.header("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`Invalid Content-Type for KV set: ${contentType}`);
      return c.json({ 
        error: "Content-Type must be application/json",
        received: contentType 
      }, 400);
    }
    
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return c.json({ 
        error: "Invalid JSON in request body",
        details: String(parseError) 
      }, 400);
    }
    
    const { value } = body;
    
    if (value === undefined) {
      return c.json({ 
        error: "Missing 'value' in request body" 
      }, 400);
    }
    
    console.log(`💾 Attempting to set KV key: ${key}`);
    await kv.set(key, value);
    console.log(`✅ Successfully set KV key: ${key}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error setting KV value:", error);
    return c.json({ 
      error: error.message || String(error),
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Delete a value by key
app.delete("/make-server-a89809a8/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting KV value:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug: Check environment variables
app.get("/make-server-a89809a8/debug/env", (c) => {
  const supabaseUrl = Deno.env.get('SPOONFLOW_URL');
  return c.json({ 
    supabaseUrl,
    fullCallbackUrl: `${supabaseUrl}/functions/v1/make-server-a89809a8/gmail/callback`
  });
});

// Debug endpoint to list available Gemini models
app.get("/make-server-a89809a8/debug/gemini-models", async (c) => {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return c.json({ error: "GEMINI_API_KEY not configured" }, 500);
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
    );
    
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ========================================
// JAMIE AI API
// ========================================

// Chat with Jamie - Proxy to Gemini
app.post("/make-server-a89809a8/jamie/chat", async (c) => {
  try {
    const { messages } = await c.req.json();
    console.log("🤖 POST /jamie/chat - Processing Jamie request");
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment");
      return c.json({ 
        error: "Gemini API key not configured",
        message: "Please add your Gemini API key to continue using Jamie's AI features."
      }, 500);
    }

    // Convert OpenAI-style messages to Gemini format
    // OpenAI uses: [{role: 'system'|'user'|'assistant', content: '...'}]
    // Gemini uses: {contents: [{role: 'user'|'model', parts: [{text: '...'}]}]}
    
    // Combine system message with first user message for Gemini
    const systemMessage = messages.find((m: any) => m.role === 'system');
    const conversationMessages = messages.filter((m: any) => m.role !== 'system');
    
    const geminiContents = conversationMessages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{
        text: msg.role === 'user' && systemMessage && conversationMessages.indexOf(msg) === 0
          ? `${systemMessage.content}\n\nUser: ${msg.content}`
          : msg.content
      }]
    }));

    console.log("📤 Sending request to Gemini API...");
    
    // Call Gemini API with retry logic
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 8192, // Increased from 2048 to allow for complete brain dump outlines
            topP: 0.95,
          },
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error: ${response.status} - ${errorText}`);
      
      // Return user-friendly error message for 503
      if (response.status === 503) {
        return c.json({ 
          error: 'Jamie is experiencing high demand right now. Please try again in a moment.',
          details: errorText 
        }, 503);
      }
      
      return c.json({ 
        error: `Gemini API error: ${response.statusText}`,
        details: errorText 
      }, response.status);
    }

    const data = await response.json();
    
    // Check for valid response
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ No text in Gemini response:", data);
      return c.json({ 
        error: "Invalid response from Gemini",
        details: JSON.stringify(data)
      }, 500);
    }
    
    console.log("✅ Jamie response generated successfully via Gemini");
    
    // Convert Gemini response back to OpenAI format for compatibility
    const geminiText = data.candidates[0].content.parts[0].text;
    return c.json({
      choices: [{
        message: {
          content: geminiText,
          role: 'assistant'
        }
      }]
    });
  } catch (error) {
    console.error("❌ Error in Jamie chat endpoint:", error);
    return c.json({ 
      error: "Failed to generate Jamie response", 
      details: String(error) 
    }, 500);
  }
});

// ========================================
// CONTACTS API
// ========================================

// Get all contacts
app.get("/make-server-a89809a8/contacts", async (c) => {
  try {
    console.log("📥 GET /contacts - Fetching all contacts");
    const contacts = await kv.get("contacts") || [];
    console.log(`✅ Found ${contacts.length} contacts`);
    return c.json(contacts);
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    return c.json({ error: "Failed to fetch contacts", details: String(error) }, 500);
  }
});

// Create contact
app.post("/make-server-a89809a8/contacts", async (c) => {
  try {
    const contactData = await c.req.json();
    console.log("📝 POST /contacts - Creating contact:", contactData);
    
    const contacts = await kv.get("contacts") || [];
    const newContact = {
      ...contactData,
      id: contactData.id || `contact-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    contacts.push(newContact);
    await kv.set("contacts", contacts);
    
    console.log(`✅ Contact created: ${newContact.id}`);
    return c.json(newContact);
  } catch (error) {
    console.error("❌ Error creating contact:", error);
    return c.json({ error: "Failed to create contact", details: String(error) }, 500);
  }
});

// Update contact
app.put("/make-server-a89809a8/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    console.log(`📝 PUT /contacts/${id} - Updating contact:`, updates);
    
    const contacts = await kv.get("contacts") || [];
    const index = contacts.findIndex((contact: any) => contact.id === id);
    
    if (index === -1) {
      console.log(`❌ Contact not found: ${id}`);
      return c.json({ error: "Contact not found" }, 404);
    }
    
    contacts[index] = {
      ...contacts[index],
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("contacts", contacts);
    console.log(`✅ Contact updated: ${id}`);
    return c.json(contacts[index]);
  } catch (error) {
    console.error("❌ Error updating contact:", error);
    return c.json({ error: "Failed to update contact", details: String(error) }, 500);
  }
});

// Delete contact
app.delete("/make-server-a89809a8/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️ DELETE /contacts/${id}`);
    
    const contacts = await kv.get("contacts") || [];
    const filtered = contacts.filter((contact: any) => contact.id !== id);
    
    if (filtered.length === contacts.length) {
      console.log(`❌ Contact not found: ${id}`);
      return c.json({ error: "Contact not found" }, 404);
    }
    
    await kv.set("contacts", filtered);
    console.log(`✅ Contact deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting contact:", error);
    return c.json({ error: "Failed to delete contact", details: String(error) }, 500);
  }
});

// ========================================
// TASKS API
// ========================================

// Get all tasks
app.get("/make-server-a89809a8/tasks", async (c) => {
  try {
    console.log("📥 GET /tasks - Fetching all tasks");
    const tasks = await kv.get("tasks") || [];
    console.log(`✅ Found ${tasks.length} tasks`);
    return c.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    return c.json({ error: "Failed to fetch tasks", details: String(error) }, 500);
  }
});

// Create task
app.post("/make-server-a89809a8/tasks", async (c) => {
  try {
    const taskData = await c.req.json();
    console.log("📝 POST /tasks - Creating task:", taskData);
    
    const tasks = await kv.get("tasks") || [];
    
    // Normalize contact data: support both legacy { id, name } and new contact_id
    let contact_id = taskData.contact_id;
    let contact = taskData.contact;
    
    // If contact is provided as an object, extract the id
    if (taskData.contact && typeof taskData.contact === 'object') {
      contact_id = taskData.contact.id || contact_id;
    }
    
    const newTask = {
      ...taskData,
      id: taskData.id || `task-${Date.now()}`,
      contact_id, // Store the contact_id
      contact, // Keep legacy contact object for backward compatibility
      status: taskData.status || 'toDo', // Default to toDo
      archived: taskData.archived !== undefined ? taskData.archived : false, // Default to not archived
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    await kv.set("tasks", tasks);
    
    console.log(`✅ Task created: ${newTask.id}`);
    return c.json(newTask);
  } catch (error) {
    console.error("❌ Error creating task:", error);
    return c.json({ error: "Failed to create task", details: String(error) }, 500);
  }
});

// Update task
app.put("/make-server-a89809a8/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    console.log(`📝 PUT /tasks/${id} - Updating task:`, updates);
    
    const tasks = await kv.get("tasks") || [];
    const index = tasks.findIndex((task: any) => task.id === id);
    
    if (index === -1) {
      console.log(`❌ Task not found: ${id}`);
      return c.json({ error: "Task not found" }, 404);
    }
    
    // Normalize contact data if being updated
    let contact_id = updates.contact_id || tasks[index].contact_id;
    let contact = updates.contact !== undefined ? updates.contact : tasks[index].contact;
    
    if (updates.contact && typeof updates.contact === 'object') {
      contact_id = updates.contact.id || contact_id;
    }
    
    tasks[index] = {
      ...tasks[index],
      ...updates,
      id, // Preserve ID
      contact_id,
      contact,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("tasks", tasks);
    console.log(`✅ Task updated: ${id}`);
    return c.json(tasks[index]);
  } catch (error) {
    console.error("❌ Error updating task:", error);
    return c.json({ error: "Failed to update task", details: String(error) }, 500);
  }
});

// Delete task
app.delete("/make-server-a89809a8/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️ DELETE /tasks/${id}`);
    
    const tasks = await kv.get("tasks") || [];
    const filtered = tasks.filter((task: any) => task.id !== id);
    
    if (filtered.length === tasks.length) {
      console.log(`❌ Task not found: ${id}`);
      return c.json({ error: "Task not found" }, 404);
    }
    
    await kv.set("tasks", filtered);
    console.log(`✅ Task deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    return c.json({ error: "Failed to delete task", details: String(error) }, 500);
  }
});

// ========================================
// INTEGRATIONS & OAUTH API
// ========================================

// Store integration tokens and settings
app.post("/make-server-a89809a8/integrations/:id/connect", async (c) => {
  try {
    const integrationId = c.req.param("id");
    const { accessToken, refreshToken, settings } = await c.req.json();
    console.log(`🔗 Connecting integration: ${integrationId}`);

    const integrations = await kv.get("integrations") || {};
    integrations[integrationId] = {
      connected: true,
      accessToken,
      refreshToken,
      settings,
      connectedAt: new Date().toISOString(),
      lastSynced: null
    };

    await kv.set("integrations", integrations);
    console.log(`✅ Integration connected: ${integrationId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error connecting integration:", error);
    return c.json({ error: "Failed to connect integration", details: String(error) }, 500);
  }
});

// Get connection status for all integrations (MUST come before /:id route!)
app.get("/make-server-a89809a8/integrations/status", async (c) => {
  try {
    console.log("🔍 [STATUS] Fetching integrations from KV store...");
    const integrations = await kv.get("integrations") || {};
    console.log("📊 [STATUS] Raw integrations from KV store:", JSON.stringify(integrations, null, 2));
    
    // Check if calendar token needs refresh
    let calendarAccessToken = null;
    let calendarNeedsReconnect = false;
    if (integrations.calendar?.connected) {
      console.log("✅ [STATUS] Calendar integration found, connected:", integrations.calendar.connected);
      console.log("📧 [STATUS] Calendar email:", integrations.calendar.email);
      const expiresAt = new Date(integrations.calendar.expiresAt);
      const now = new Date();
      
      if (expiresAt <= now && integrations.calendar.refreshToken) {
        // Token expired, refresh it
        try {
          calendarAccessToken = await refreshCalendarToken(integrations.calendar.refreshToken);
        } catch (error) {
          // Token refresh failed (likely expired/revoked) - it's already marked as disconnected in refreshCalendarToken
          console.log('⚠️ Calendar token refresh failed, marked as disconnected');
          calendarNeedsReconnect = true;
        }
      } else {
        calendarAccessToken = integrations.calendar.accessToken;
      }
    } else {
      console.log("❌ [STATUS] No calendar integration found or not connected");
    }
    
    // Check LinkedIn integration
    const linkedinIntegration = await kv.get('integration_linkedin');
    
    // If calendar needed reconnect, reload the integrations to get updated status
    if (calendarNeedsReconnect) {
      const updatedIntegrations = await kv.get("integrations") || {};
      integrations.calendar = updatedIntegrations.calendar;
    }
    
    const responseData = {
      gmail: integrations.gmail ? {
        connected: integrations.gmail.connected || false,
        email: integrations.gmail.email,
        lastSyncAt: integrations.gmail.lastSyncAt
      } : { connected: false },
      calendar: integrations.calendar ? {
        connected: integrations.calendar.connected || false,
        email: integrations.calendar.email,
        lastSyncAt: integrations.calendar.lastSyncAt,
        accessToken: calendarAccessToken // Only sent to authenticated clients
      } : { connected: false },
      fathom: {
        connected: !!Deno.env.get('CURRENT_FATHOM_API_KEY')
      },
      braveSearch: {
        connected: !!Deno.env.get('BRAVE_SEARCH_API_KEY')
      },
      linkedin: linkedinIntegration ? {
        connected: linkedinIntegration.connected || false,
        email: linkedinIntegration.email,
        name: linkedinIntegration.name,
        connectedAt: linkedinIntegration.connectedAt
      } : { connected: false }
    };
    
    console.log("📤 [STATUS] Returning response:", JSON.stringify(responseData, null, 2));
    return c.json(responseData);
  } catch (error) {
    console.error("❌ [STATUS] Error fetching integration status:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get integration status
app.get("/make-server-a89809a8/integrations/:id", async (c) => {
  try {
    const integrationId = c.req.param("id");
    const integrations = await kv.get("integrations") || {};
    const integration = integrations[integrationId];

    if (!integration) {
      return c.json({ connected: false });
    }

    return c.json({
      connected: integration.connected,
      lastSynced: integration.lastSynced,
      settings: integration.settings
    });
  } catch (error) {
    console.error("❌ Error fetching integration:", error);
    return c.json({ error: "Failed to fetch integration", details: String(error) }, 500);
  }
});

// Disconnect integration
app.post("/make-server-a89809a8/integrations/:id/disconnect", async (c) => {
  try {
    const integrationId = c.req.param("id");
    console.log(`🔌 Disconnecting integration: ${integrationId}`);

    const integrations = await kv.get("integrations") || {};
    delete integrations[integrationId];

    await kv.set("integrations", integrations);
    console.log(`✅ Integration disconnected: ${integrationId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error disconnecting integration:", error);
    return c.json({ error: "Failed to disconnect integration", details: String(error) }, 500);
  }
});

// Update integration settings
app.put("/make-server-a89809a8/integrations/:id/settings", async (c) => {
  try {
    const integrationId = c.req.param("id");
    const settings = await c.req.json();
    console.log(`⚙️ Updating settings for: ${integrationId}`);

    const integrations = await kv.get("integrations") || {};
    if (!integrations[integrationId]) {
      return c.json({ error: "Integration not connected" }, 404);
    }

    integrations[integrationId].settings = settings;
    integrations[integrationId].updatedAt = new Date().toISOString();

    await kv.set("integrations", integrations);
    console.log(`✅ Settings updated for: ${integrationId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error updating integration settings:", error);
    return c.json({ error: "Failed to update settings", details: String(error) }, 500);
  }
});

// ========================================
// GOOGLE CALENDAR SYNC
// ========================================

app.post("/make-server-a89809a8/integrations/google-calendar/sync", async (c) => {
  try {
    console.log("📅 Syncing Google Calendar...");

    const integrations = await kv.get("integrations") || {};
    const gcalIntegration = integrations["google-calendar"];

    if (!gcalIntegration || !gcalIntegration.connected) {
      return c.json({ error: "Google Calendar not connected" }, 400);
    }

    // TODO: Implement actual Google Calendar API sync
    // For now, update last synced timestamp
    gcalIntegration.lastSynced = new Date().toISOString();
    integrations["google-calendar"] = gcalIntegration;
    await kv.set("integrations", integrations);

    console.log("✅ Google Calendar synced");
    return c.json({ success: true, lastSynced: gcalIntegration.lastSynced });
  } catch (error) {
    console.error("❌ Error syncing Google Calendar:", error);
    return c.json({ error: "Failed to sync calendar", details: String(error) }, 500);
  }
});

// ========================================
// FATHOM WEBHOOK - OLD ENDPOINT DISABLED
// ========================================
// NOTE: This old endpoint has been commented out because a newer, better
// version exists further down in the file (around line 4059) that creates
// meeting dossiers instead of pending interactions.

/* OLD ENDPOINT - DISABLED
app.post("/make-server-a89809a8/webhooks/fathom", async (c) => {
  try {
    const fathomData = await c.req.json();
    console.log("🎙️ Received Fathom webhook:", fathomData);

    // Store as pending interaction for Post-Meeting Wizard
    const pendingInteractions = await kv.get("pending_fathom_interactions") || [];
    
    const pendingInteraction = {
      id: `fathom-${Date.now()}`,
      meeting_title: fathomData.title || fathomData.meeting_name,
      meeting_date: fathomData.date || getTodayLocal(), // Use local timezone
      meeting_time: fathomData.start_time || new Date().toLocaleTimeString('en-US', { timeZone: EASTERN_TZ, hour: 'numeric', minute: '2-digit', hour12: false }).slice(0, 5),
      participants: fathomData.participants || [],
      recording_url: fathomData.recording_url,
      transcript_url: fathomData.transcript_url,
      summary_text: fathomData.summary || fathomData.notes,
      calendar_event_id: fathomData.calendar_event_id,
      createdAt: new Date().toISOString(),
      processed: false
    };

    pendingInteractions.push(pendingInteraction);
    await kv.set("pending_fathom_interactions", pendingInteractions);

    console.log(`✅ Fathom interaction stored: ${pendingInteraction.id}`);
    return c.json({ success: true, id: pendingInteraction.id });
  } catch (error) {
    console.error("❌ Error processing Fathom webhook:", error);
    return c.json({ error: "Failed to process Fathom webhook", details: String(error) }, 500);
  }
});
*/

// Get pending Fathom interactions
app.get("/make-server-a89809a8/pending-interactions", async (c) => {
  try {
    const pendingInteractions = await kv.get("pending_fathom_interactions") || [];
    const unprocessed = pendingInteractions.filter((interaction: any) => !interaction.processed);
    return c.json(unprocessed);
  } catch (error) {
    console.error("❌ Error fetching pending interactions:", error);
    return c.json({ error: "Failed to fetch pending interactions", details: String(error) }, 500);
  }
});

// Mark Fathom interaction as processed
app.post("/make-server-a89809a8/pending-interactions/:id/process", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`✅ Processing Fathom interaction: ${id}`);

    const pendingInteractions = await kv.get("pending_fathom_interactions") || [];
    const updated = pendingInteractions.map((interaction: any) =>
      interaction.id === id
        ? { ...interaction, processed: true, processedAt: new Date().toISOString() }
        : interaction
    );

    await kv.set("pending_fathom_interactions", updated);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing interaction:", error);
    return c.json({ error: "Failed to process interaction", details: String(error) }, 500);
  }
});

// ========================================
// INTERACTIONS API
// ========================================

// Create or update interaction
app.post("/make-server-a89809a8/interactions", async (c) => {
  try {
    const interactionData = await c.req.json();
    console.log("📝 Creating/updating interaction:", interactionData);

    const interactions = await kv.get("interactions") || [];
    
    if (interactionData.id) {
      // Update existing
      const index = interactions.findIndex((i: any) => i.id === interactionData.id);
      if (index !== -1) {
        interactions[index] = {
          ...interactions[index],
          ...interactionData,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // Create new
      const newInteraction = {
        ...interactionData,
        id: `interaction-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      interactions.push(newInteraction);
      interactionData.id = newInteraction.id;
    }

    await kv.set("interactions", interactions);
    console.log(`✅ Interaction saved: ${interactionData.id}`);
    return c.json({ id: interactionData.id });
  } catch (error) {
    console.error("❌ Error saving interaction:", error);
    return c.json({ error: "Failed to save interaction", details: String(error) }, 500);
  }
});

// Get interactions for a contact
app.get("/make-server-a89809a8/interactions/contact/:contactId", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const interactions = await kv.get("interactions") || [];
    const contactInteractions = interactions.filter((i: any) => i.contact_id === contactId);
    return c.json(contactInteractions);
  } catch (error) {
    console.error("❌ Error fetching interactions:", error);
    return c.json({ error: "Failed to fetch interactions", details: String(error) }, 500);
  }
});

// ========================================
// CONTENT IDEAS API
// ========================================

// Get all content ideas
app.get("/make-server-a89809a8/content", async (c) => {
  try {
    console.log("📥 GET /content - Fetching all content ideas");
    const content = await kv.get("content") || [];
    console.log(`✅ Found ${content.length} content ideas`);
    return c.json(content);
  } catch (error) {
    console.error("❌ Error fetching content:", error);
    return c.json({ error: "Failed to fetch content", details: String(error) }, 500);
  }
});

// Create content idea
app.post("/make-server-a89809a8/content", async (c) => {
  try {
    const contentData = await c.req.json();
    console.log("📝 POST /content - Creating content idea:", contentData);
    
    const content = await kv.get("content") || [];
    const newContent = {
      ...contentData,
      id: contentData.id || `content-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    content.push(newContent);
    await kv.set("content", content);
    
    console.log(`✅ Content idea created: ${newContent.id}`);
    return c.json(newContent);
  } catch (error) {
    console.error("❌ Error creating content:", error);
    return c.json({ error: "Failed to create content", details: String(error) }, 500);
  }
});

// Update content idea
app.put("/make-server-a89809a8/content/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    console.log(`📝 PUT /content/${id} - Updating content:`, updates);
    
    const content = await kv.get("content") || [];
    const index = content.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      console.log(`❌ Content not found: ${id}`);
      return c.json({ error: "Content not found" }, 404);
    }
    
    content[index] = {
      ...content[index],
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("content", content);
    console.log(`✅ Content updated: ${id}`);
    return c.json(content[index]);
  } catch (error) {
    console.error("❌ Error updating content:", error);
    return c.json({ error: "Failed to update content", details: String(error) }, 500);
  }
});

// Delete content idea
app.delete("/make-server-a89809a8/content/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️ DELETE /content/${id}`);
    
    const content = await kv.get("content") || [];
    const filtered = content.filter((item: any) => item.id !== id);
    
    if (filtered.length === content.length) {
      console.log(`❌ Content not found: ${id}`);
      return c.json({ error: "Content not found" }, 404);
    }
    
    await kv.set("content", filtered);
    console.log(`✅ Content deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting content:", error);
    return c.json({ error: "Failed to delete content", details: String(error) }, 500);
  }
});

// ========================================
// GOALS API
// ========================================

// Get all goals
app.get("/make-server-a89809a8/goals", async (c) => {
  try {
    console.log("📥 GET /goals - Fetching all goals");
    const goals = await kv.get("goals") || [];
    console.log(`✅ Found ${goals.length} goals`);
    return c.json(goals);
  } catch (error) {
    console.error("❌ Error fetching goals:", error);
    return c.json({ error: "Failed to fetch goals", details: String(error) }, 500);
  }
});

// Create goal
app.post("/make-server-a89809a8/goals", async (c) => {
  try {
    const goalData = await c.req.json();
    console.log("📝 POST /goals - Creating goal:", goalData);
    
    const goals = await kv.get("goals") || [];
    const newGoal = {
      ...goalData,
      id: goalData.id || `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subGoals: goalData.subGoals || [],
      isActive: goalData.isActive !== undefined ? goalData.isActive : true,
      jamieGenerated: goalData.jamieGenerated || false,
    };
    
    goals.push(newGoal);
    await kv.set("goals", goals);
    
    console.log(`✅ Goal created: ${newGoal.id}`);
    return c.json(newGoal);
  } catch (error) {
    console.error("❌ Error creating goal:", error);
    return c.json({ error: "Failed to create goal", details: String(error) }, 500);
  }
});

// Update goal
app.put("/make-server-a89809a8/goals/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    console.log(`📝 PUT /goals/${id} - Updating goal:`, updates);
    
    const goals = await kv.get("goals") || [];
    const index = goals.findIndex((goal: any) => goal.id === id);
    
    if (index === -1) {
      console.log(`❌ Goal not found: ${id}`);
      return c.json({ error: "Goal not found" }, 404);
    }
    
    goals[index] = {
      ...goals[index],
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("goals", goals);
    console.log(`✅ Goal updated: ${id}`);
    return c.json(goals[index]);
  } catch (error) {
    console.error("❌ Error updating goal:", error);
    return c.json({ error: "Failed to update goal", details: String(error) }, 500);
  }
});

// Delete goal
app.delete("/make-server-a89809a8/goals/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️ DELETE /goals/${id}`);
    
    const goals = await kv.get("goals") || [];
    const filtered = goals.filter((goal: any) => goal.id !== id);
    
    if (filtered.length === goals.length) {
      console.log(`❌ Goal not found: ${id}`);
      return c.json({ error: "Goal not found" }, 404);
    }
    
    await kv.set("goals", filtered);
    console.log(`✅ Goal deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting goal:", error);
    return c.json({ error: "Failed to delete goal", details: String(error) }, 500);
  }
});

// Jamie breakdown - AI-assisted goal breakdown into sub-goals
app.post("/make-server-a89809a8/goals/:id/breakdown", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🤖 POST /goals/${id}/breakdown - Jamie breaking down goal`);
    
    const goals = await kv.get("goals") || [];
    const index = goals.findIndex((goal: any) => goal.id === id);
    
    if (index === -1) {
      console.log(`❌ Goal not found: ${id}`);
      return c.json({ error: "Goal not found" }, 404);
    }
    
    const goal = goals[index];
    
    // Jamie's AI logic to break down the goal into actionable sub-goals
    // For now, this is a smart template-based approach
    const subGoals = generateSubGoals(goal.title, goal.description, goal.timeframeType);
    
    goals[index] = {
      ...goal,
      subGoals,
      jamieGenerated: true,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("goals", goals);
    console.log(`✅ Jamie generated ${subGoals.length} sub-goals for goal: ${id}`);
    return c.json(goals[index]);
  } catch (error) {
    console.error("❌ Error in Jamie breakdown:", error);
    return c.json({ error: "Failed to break down goal", details: String(error) }, 500);
  }
});

// Helper function for Jamie to generate sub-goals
function generateSubGoals(title: string, description: string, timeframe: string) {
  // Smart breakdown based on common goal patterns
  const lowerTitle = title.toLowerCase();
  const lowerDesc = (description || "").toLowerCase();
  
  // Pattern matching for common goals
  if (lowerTitle.includes("launch") || lowerTitle.includes("website")) {
    return [
      { 
        id: `subgoal-${Date.now()}-1`,
        title: "Define project requirements and scope",
        description: "List all features, pages, and functionality needed",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-2`,
        title: "Design mockups and user flows",
        description: "Create visual designs and map out user journeys",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-3`,
        title: "Develop core functionality",
        description: "Build the main features and pages",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-4`,
        title: "Test and refine",
        description: "QA testing, bug fixes, and performance optimization",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-5`,
        title: "Deploy and announce",
        description: "Push to production and share with audience",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
    ];
  } else if (lowerTitle.includes("learn") || lowerTitle.includes("study")) {
    return [
      {
        id: `subgoal-${Date.now()}-1`,
        title: "Research and gather learning resources",
        description: "Find courses, books, tutorials, and materials",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-2`,
        title: "Create a learning schedule",
        description: "Block out dedicated study time in your routine",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-3`,
        title: "Complete foundational concepts",
        description: "Work through basics and core principles",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-4`,
        title: "Practice with hands-on projects",
        description: "Apply what you've learned through real examples",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
    ];
  } else if (lowerTitle.includes("write") || lowerTitle.includes("book") || lowerTitle.includes("blog")) {
    return [
      {
        id: `subgoal-${Date.now()}-1`,
        title: "Outline main topics and structure",
        description: "Create a detailed outline of what you'll cover",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-2`,
        title: "Set daily writing routine",
        description: "Establish consistent writing time each day",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-3`,
        title: "Complete first draft",
        description: "Write through the entire piece without editing",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-4`,
        title: "Edit and refine content",
        description: "Review, revise, and polish the writing",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
    ];
  } else {
    // Generic breakdown for any goal
    return [
      {
        id: `subgoal-${Date.now()}-1`,
        title: "Research and plan approach",
        description: "Understand requirements and create action plan",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-2`,
        title: "Break into smaller tasks",
        description: "Identify specific actionable steps",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-3`,
        title: "Execute core work",
        description: "Complete the main components of the goal",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `subgoal-${Date.now()}-4`,
        title: "Review and finalize",
        description: "Check quality and complete finishing touches",
        isDone: false,
        createdBy: "jamie",
        isRoutineLinked: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

// ========================================
// JAMIE AI - MEETING PREP
// ========================================

// Generate intelligent meeting prep suggestions
app.post("/make-server-a89809a8/jamie/meeting-prep", async (c) => {
  try {
    const { meetingId, contactId, meetingTitle, meetingDate, meetingTime } = await c.req.json();
    console.log(`🤖 Jamie generating meeting prep for contact: ${contactId}`);

    // If no contactId provided, return generic suggestions
    if (!contactId) {
      console.log(`⚠️ No contact ID provided, returning generic suggestions`);
      return c.json({
        suggestions: [
          {
            type: "general",
            icon: "clipboard",
            priority: "medium",
            title: "Review meeting agenda",
            description: "Prepare key discussion points and objectives for this meeting"
          },
          {
            type: "general",
            icon: "target",
            priority: "medium",
            title: "Define desired outcomes",
            description: "Clarify what you want to achieve by the end of this meeting"
          }
        ],
        context: {},
        contact: null
      });
    }

    // Fetch contact data
    const contacts = await kv.get("contacts") || [];
    const contact = contacts.find((c: any) => c.id === contactId);

    if (!contact) {
      console.log(`⚠️ Contact not found: ${contactId}, returning generic suggestions`);
      return c.json({ 
        suggestions: [
          {
            type: "general",
            icon: "clipboard",
            priority: "medium",
            title: "Review meeting agenda",
            description: "Prepare key discussion points and objectives for this meeting"
          },
          {
            type: "general",
            icon: "target",
            priority: "medium",
            title: "Define desired outcomes",
            description: "Clarify what you want to achieve by the end of this meeting"
          }
        ],
        context: {},
        contact: null
      });
    }

    // Fetch past interactions with this contact
    const interactions = await kv.get("interactions") || [];
    const contactInteractions = interactions.filter((i: any) => i.contact_id === contactId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Fetch tasks related to this contact
    const tasks = await kv.get("tasks") || [];
    const contactTasks = tasks.filter((t: any) => t.contact_id === contactId && t.status !== 'done' && !t.archived);

    // Fetch goals that might be relevant
    const goals = await kv.get("goals") || [];
    const activeGoals = goals.filter((g: any) => g.isActive);

    // Generate intelligent prep suggestions
    const suggestions = generateMeetingPrepSuggestions({
      contact,
      interactions: contactInteractions,
      tasks: contactTasks,
      goals: activeGoals,
      meetingTitle,
      meetingDate,
      meetingTime
    });

    // Generate context summary
    const context = {
      lastInteraction: contactInteractions[0] || null,
      totalInteractions: contactInteractions.length,
      pendingTasks: contactTasks.length,
      contactSince: contact.createdAt,
      relationship: contact.relationship || "professional",
      tags: contact.tags || [],
      company: contact.company || null,
      role: contact.title || null
    };

    console.log(`✅ Jamie generated ${suggestions.length} prep suggestions for ${contact.name}`);
    return c.json({
      suggestions,
      context,
      contact: {
        id: contact.id,
        name: contact.name,
        company: contact.company,
        title: contact.title,
        relationship: contact.relationship
      }
    });
  } catch (error) {
    console.error("❌ Error in Jamie meeting prep:", error);
    return c.json({ 
      error: "Failed to generate meeting prep", 
      details: String(error),
      suggestions: [],
      context: {}
    }, 500);
  }
});

// Helper function to generate intelligent meeting prep suggestions
function generateMeetingPrepSuggestions(data: {
  contact: any;
  interactions: any[];
  tasks: any[];
  goals: any[];
  meetingTitle?: string;
  meetingDate?: string;
  meetingTime?: string;
}) {
  const suggestions: any[] = [];
  const { contact, interactions, tasks, goals, meetingTitle } = data;

  // 1. Check for recent interactions and follow-ups
  if (interactions.length > 0) {
    const lastInteraction = interactions[0];
    const daysSinceLastContact = Math.floor(
      (new Date().getTime() - new Date(lastInteraction.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastContact > 30) {
      suggestions.push({
        type: "relationship",
        icon: "calendar",
        text: `Reconnect and catch up - it's been ${daysSinceLastContact} days since your last interaction`,
        priority: "high"
      });
    }

    // Check for follow-up items from last interaction
    if (lastInteraction.followUpNeeded || lastInteraction.nextSteps) {
      suggestions.push({
        type: "follow-up",
        icon: "check",
        text: lastInteraction.nextSteps 
          ? `Follow up on: ${lastInteraction.nextSteps}`
          : "Review action items from your last meeting",
        priority: "high"
      });
    }

    // Reference key discussion points
    if (lastInteraction.notes && lastInteraction.notes.length > 50) {
      const preview = lastInteraction.notes.substring(0, 80) + "...";
      suggestions.push({
        type: "context",
        icon: "message",
        text: `Reference previous discussion: "${preview}"`,
        priority: "medium"
      });
    }
  } else {
    // First time meeting this contact
    suggestions.push({
      type: "introduction",
      icon: "user",
      text: "This is your first recorded meeting - focus on building rapport and understanding their goals",
      priority: "high"
    });
  }

  // 2. Pending tasks related to this contact
  if (tasks.length > 0) {
    const urgentTasks = tasks.filter((t: any) => t.priority === "high" || t.flagged);
    
    if (urgentTasks.length > 0) {
      suggestions.push({
        type: "task",
        icon: "flag",
        text: `Discuss ${urgentTasks.length} flagged task${urgentTasks.length > 1 ? 's' : ''}: ${urgentTasks[0].title}${urgentTasks.length > 1 ? ` and ${urgentTasks.length - 1} more` : ''}`,
        priority: "high"
      });
    } else if (tasks.length > 0) {
      suggestions.push({
        type: "task",
        icon: "checklist",
        text: `Review ${tasks.length} pending task${tasks.length > 1 ? 's' : ''} related to ${contact.name}`,
        priority: "medium"
      });
    }
  }

  // 3. Contact-specific context
  if (contact.company) {
    suggestions.push({
      type: "business",
      icon: "building",
      text: `Discuss opportunities and challenges at ${contact.company}`,
      priority: "medium"
    });
  }

  if (contact.tags && contact.tags.length > 0) {
    const relevantTags = contact.tags.slice(0, 2).join(", ");
    suggestions.push({
      type: "context",
      icon: "tag",
      text: `Topics to explore: ${relevantTags}`,
      priority: "low"
    });
  }

  // 4. Relationship-specific suggestions
  if (contact.relationship === "client") {
    suggestions.push({
      type: "business",
      icon: "star",
      text: "Check on client satisfaction and identify upsell/expansion opportunities",
      priority: "medium"
    });
  } else if (contact.relationship === "prospect") {
    suggestions.push({
      type: "business",
      icon: "target",
      text: "Understand their pain points and present relevant solutions",
      priority: "high"
    });
  } else if (contact.relationship === "partner") {
    suggestions.push({
      type: "collaboration",
      icon: "handshake",
      text: "Explore collaboration synergies and partnership opportunities",
      priority: "medium"
    });
  }

  // 5. Meeting-specific context
  if (meetingTitle) {
    const lowerTitle = meetingTitle.toLowerCase();
    
    if (lowerTitle.includes("proposal") || lowerTitle.includes("pitch")) {
      suggestions.push({
        type: "preparation",
        icon: "presentation",
        text: "Prepare your pitch deck and key value propositions",
        priority: "high"
      });
    } else if (lowerTitle.includes("review") || lowerTitle.includes("check-in")) {
      suggestions.push({
        type: "preparation",
        icon: "clipboard",
        text: "Gather metrics, progress updates, and prepare status report",
        priority: "high"
      });
    } else if (lowerTitle.includes("strategy") || lowerTitle.includes("planning")) {
      suggestions.push({
        type: "preparation",
        icon: "strategy",
        text: "Come prepared with ideas, data, and strategic recommendations",
        priority: "medium"
      });
    }
  }

  // 6. Goal alignment
  if (goals.length > 0) {
    const relevantGoals = goals.filter((g: any) => {
      const goalText = (g.title + " " + (g.description || "")).toLowerCase();
      const contactName = contact.name.toLowerCase();
      const contactCompany = (contact.company || "").toLowerCase();
      return goalText.includes(contactName) || goalText.includes(contactCompany);
    });

    if (relevantGoals.length > 0) {
      suggestions.push({
        type: "goal",
        icon: "target",
        text: `Align on your goal: "${relevantGoals[0].title}"`,
        priority: "medium"
      });
    }
  }

  // 7. General best practices (only if we have few suggestions)
  if (suggestions.length < 4) {
    suggestions.push({
      type: "general",
      icon: "lightbulb",
      text: "Ask open-ended questions to understand their current priorities",
      priority: "low"
    });
    
    suggestions.push({
      type: "general",
      icon: "heart",
      text: "Listen actively and take notes on their challenges and goals",
      priority: "low"
    });
  }

  // Sort by priority and return top suggestions
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  return suggestions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 6); // Return top 6 suggestions
}

// ========================================
// THANK-YOU EMAIL GENERATION
// ========================================

app.post("/make-server-a89809a8/generate-thank-you-email", async (c) => {
  try {
    const { contactName, meetingTitle, summary, outcomes, prepNotes } = await c.req.json();
    console.log(`📧 Generating thank-you email for meeting: ${meetingTitle}`);

    // Generate email subject
    const subject = `Great connecting${meetingTitle ? ` - ${meetingTitle}` : ''}`;

    // Generate email body in Meredith's tone
    let body = `Hi ${contactName || 'there'},\n\n`;

    // Opening line
    body += `Thank you for taking the time to meet with me`;
    if (meetingTitle && !meetingTitle.toLowerCase().includes('call') && !meetingTitle.toLowerCase().includes('meeting')) {
      body += ` about ${meetingTitle.toLowerCase()}`;
    }
    body += `. I really enjoyed our conversation.\n\n`;

    // Reference key outcomes or summary if available
    if (outcomes && outcomes.trim()) {
      const outcomeText = outcomes.trim();
      // Keep it brief - just reference the main point
      const firstSentence = outcomeText.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length > 10 && firstSentence.length < 100) {
        body += `${firstSentence}. `;
      }
    } else if (summary && summary.trim() && summary.length < 150) {
      body += `${summary.trim()} `;
    }

    // Next steps or general forward-looking statement
    if (prepNotes?.purpose && prepNotes.purpose.trim()) {
      body += `I'm looking forward to exploring how we can move forward together.\n\n`;
    } else {
      body += `Let's keep the momentum going.\n\n`;
    }

    // Gentle call to action
    body += `If you're open to it, I'd love to continue our conversation. No rush on my end - whenever works best for you.\n\n`;

    // Uplifting close
    body += `Have a wonderful rest of your week!\n\n`;
    body += `Best,\n`;
    body += `Meredith`;

    console.log(`✅ Generated thank-you email`);
    return c.json({ subject, body });
  } catch (error) {
    console.error("❌ Error generating thank-you email:", error);
    return c.json({
      error: "Failed to generate thank-you email",
      details: String(error)
    }, 500);
  }
});

// ========================================
// EMAIL-TO-TASK WEBHOOK (Pipedream)
// ========================================

// Webhook endpoint for Pipedream email-to-task automation
app.post("/make-server-a89809a8/webhooks/email-to-task", async (c) => {
  try {
    const emailData = await c.req.json();
    console.log("📧 Received email-to-task webhook:", emailData);

    // Store as a new task
    const tasks = await kv.get("tasks") || [];
    
    const newTask = {
      id: `email-task-${Date.now()}`,
      title: emailData.subject || "Task from email",
      description: emailData.body || "",
      status: "toDo",
      priority: emailData.priority || "medium",
      source: "email",
      emailFrom: emailData.from,
      emailDate: emailData.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false
    };

    tasks.push(newTask);
    await kv.set("tasks", tasks);

    console.log(`✅ Email converted to task: ${newTask.id}`);
    return c.json({ success: true, taskId: newTask.id });
  } catch (error) {
    console.error("❌ Error processing email-to-task webhook:", error);
    return c.json({ error: "Failed to process email webhook", details: String(error) }, 500);
  }
});

// ========================================
// STRIPE PAYMENT INTEGRATION
// ========================================

// Create Stripe payment link for an invoice
app.post("/make-server-a89809a8/invoices/:invoiceId/create-payment-link", async (c) => {
  try {
    const invoiceId = c.req.param("invoiceId");
    const { amount, currency, description, invoiceNumber } = await c.req.json();
    
    console.log(`💳 Creating Stripe payment link for invoice: ${invoiceId}`);
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY not found in environment");
      return c.json({ 
        error: "Stripe not configured",
        message: "Please add your Stripe secret key to enable payment processing."
      }, 500);
    }

    // Create a Stripe payment link using the Payment Links API
    const paymentLinkResponse = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'line_items[0][price_data][currency]': currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': description || `Invoice ${invoiceNumber || invoiceId}`,
        'line_items[0][price_data][unit_amount]': Math.round(amount * 100).toString(), // Convert to cents
        'line_items[0][quantity]': '1',
        'metadata[invoice_id]': invoiceId,
        'metadata[invoice_number]': invoiceNumber || '',
        'after_completion[type]': 'hosted_confirmation',
        'after_completion[hosted_confirmation][custom_message]': 'Thank you for your payment! You will receive a confirmation email shortly.',
      }).toString()
    });

    if (!paymentLinkResponse.ok) {
      const errorText = await paymentLinkResponse.text();
      console.error(`❌ Stripe API error: ${paymentLinkResponse.status} - ${errorText}`);
      return c.json({ 
        error: `Stripe API error: ${paymentLinkResponse.statusText}`,
        details: errorText 
      }, paymentLinkResponse.status);
    }

    const paymentLink = await paymentLinkResponse.json();
    
    console.log(`✅ Payment link created: ${paymentLink.url}`);
    
    return c.json({
      success: true,
      paymentLinkUrl: paymentLink.url,
      paymentLinkId: paymentLink.id
    });
  } catch (error) {
    console.error("❌ Error creating Stripe payment link:", error);
    return c.json({ 
      error: "Failed to create payment link", 
      details: String(error) 
    }, 500);
  }
});

// Stripe webhook endpoint for payment events
app.post("/make-server-a89809a8/webhooks/stripe", async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const rawBody = await c.req.text();
    
    console.log("💳 Received Stripe webhook");
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error("❌ Stripe keys not configured");
      return c.json({ error: "Stripe not configured" }, 500);
    }

    // Verify webhook signature (simplified - in production use Stripe SDK)
    // For now, we'll process the webhook assuming it's valid
    // In production, you should verify the signature properly
    
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (err) {
      console.error("❌ Invalid JSON in webhook:", err);
      return c.json({ error: "Invalid payload" }, 400);
    }

    console.log(`📨 Stripe event type: ${event.type}`);

    // Handle payment success events
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const session = event.data.object;
      const invoiceId = session.metadata?.invoice_id;
      
      if (!invoiceId) {
        console.warn("⚠️ No invoice_id in metadata");
        return c.json({ received: true });
      }

      console.log(`✅ Payment succeeded for invoice: ${invoiceId}`);

      // Create a payment record
      const payments = await kv.get("stripe_payments") || [];
      
      const paymentRecord = {
        id: `stripe-payment-${Date.now()}`,
        invoiceId,
        stripePaymentId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
        currency: session.currency?.toUpperCase() || 'USD',
        paidAt: new Date().toISOString(),
        method: 'card',
        status: 'completed',
        customerEmail: session.customer_email || session.customer_details?.email,
        metadata: session.metadata
      };

      payments.push(paymentRecord);
      await kv.set("stripe_payments", payments);

      console.log(`✅ Payment record created: ${paymentRecord.id}`);

      // Note: The frontend will poll for payment updates or use webhooks
      // to update the invoice status automatically
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing Stripe webhook:", error);
    return c.json({ 
      error: "Webhook processing failed", 
      details: String(error) 
    }, 500);
  }
});

// Get payment status for an invoice
app.get("/make-server-a89809a8/invoices/:invoiceId/payment-status", async (c) => {
  try {
    const invoiceId = c.req.param("invoiceId");
    console.log(`📊 Checking payment status for invoice: ${invoiceId}`);
    
    const payments = await kv.get("stripe_payments") || [];
    const invoicePayments = payments.filter((p: any) => p.invoiceId === invoiceId);
    
    if (invoicePayments.length === 0) {
      return c.json({ 
        hasPaid: false,
        payments: []
      });
    }

    const totalPaid = invoicePayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    
    return c.json({
      hasPaid: true,
      payments: invoicePayments,
      totalPaid,
      currency: invoicePayments[0].currency
    });
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    return c.json({ 
      error: "Failed to check payment status", 
      details: String(error) 
    }, 500);
  }
});

// ========================================
// BRAND SETTINGS API
// ========================================

// Get brand settings
app.get("/make-server-a89809a8/brand-settings", async (c) => {
  try {
    console.log("📥 GET /brand-settings - Fetching brand settings");
    const settings = await kv.get("brand-settings") || {
      logo: null,
      primaryColor: '#9d92b5',
      secondaryColor: '#7a9cb5',
      headingFont: 'Lora (Serif)',
      bodyFont: 'Poppins (Sans-serif)',
      companyName: '',
      tagline: '',
      email: '',
      website: ''
    };
    console.log("✅ Brand settings fetched");
    return c.json(settings);
  } catch (error) {
    console.error("❌ Error fetching brand settings:", error);
    return c.json({ error: "Failed to fetch brand settings", details: String(error) }, 500);
  }
});

// Save brand settings
app.post("/make-server-a89809a8/brand-settings", async (c) => {
  try {
    const settings = await c.req.json();
    console.log("💾 POST /brand-settings - Saving brand settings");
    
    await kv.set("brand-settings", settings);
    
    console.log("✅ Brand settings saved successfully");
    return c.json({ success: true, settings });
  } catch (error) {
    console.error("❌ Error saving brand settings:", error);
    return c.json({ error: "Failed to save brand settings", details: String(error) }, 500);
  }
});

// ========================================
// FORM TEMPLATES API
// ========================================

// Get all form templates (including PDF templates)
app.get("/make-server-a89809a8/form-templates", async (c) => {
  try {
    console.log("📥 GET /form-templates - Fetching all form templates");
    const templates = await kv.get("form-templates") || [];
    const pdfTemplates = await kv.get("pdf-templates") || [];
    const allTemplates = [...templates, ...pdfTemplates];
    console.log(`✅ Found ${allTemplates.length} templates (${templates.length} form + ${pdfTemplates.length} PDF)`);
    return c.json(allTemplates);
  } catch (error) {
    console.error("❌ Error fetching form templates:", error);
    return c.json({ error: "Failed to fetch form templates", details: String(error) }, 500);
  }
});

// Save form template
app.post("/make-server-a89809a8/form-templates", async (c) => {
  try {
    const template = await c.req.json();
    console.log("💾 POST /form-templates - Saving form template:", template.name);
    
    const templates = await kv.get("form-templates") || [];
    templates.push(template);
    await kv.set("form-templates", templates);
    
    console.log("✅ Form template saved successfully");
    return c.json({ success: true, template });
  } catch (error) {
    console.error("❌ Error saving form template:", error);
    return c.json({ error: "Failed to save form template", details: String(error) }, 500);
  }
});

// Delete form template
app.delete("/make-server-a89809a8/form-templates/:id", async (c) => {
  try {
    const templateId = c.req.param("id");
    console.log("🗑️ DELETE /form-templates - Deleting template:", templateId);
    
    const templates = await kv.get("form-templates") || [];
    const templateIndex = templates.findIndex((t: any) => t.id === templateId);
    
    if (templateIndex === -1) {
      console.error(`❌ Template not found: ${templateId}`);
      return c.json({ error: "Not found" }, 404);
    }
    
    templates.splice(templateIndex, 1);
    await kv.set("form-templates", templates);
    
    console.log("✅ Form template deleted successfully");
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting form template:", error);
    return c.json({ error: "Failed to delete form template", details: String(error) }, 500);
  }
});

// ========================================
// PDF TEMPLATES API
// ========================================

// Get all PDF templates
app.get("/make-server-a89809a8/pdf-templates", async (c) => {
  try {
    console.log("📥 GET /pdf-templates - Fetching all PDF templates");
    const templates = await kv.get("pdf-templates") || [];
    console.log(`✅ Found ${templates.length} PDF templates`);
    return c.json(templates);
  } catch (error) {
    console.error("❌ Error fetching PDF templates:", error);
    return c.json({ error: "Failed to fetch PDF templates", details: String(error) }, 500);
  }
});

// Save PDF template
app.post("/make-server-a89809a8/pdf-templates", async (c) => {
  try {
    const template = await c.req.json();
    console.log("💾 POST /pdf-templates - Saving PDF template:", template.name);
    
    const templates = await kv.get("pdf-templates") || [];
    templates.push(template);
    await kv.set("pdf-templates", templates);
    
    console.log("✅ PDF template saved successfully");
    return c.json({ success: true, template });
  } catch (error) {
    console.error("❌ Error saving PDF template:", error);
    return c.json({ error: "Failed to save PDF template", details: String(error) }, 500);
  }
});

// ========================================
// LINKEDIN PROFILE SUMMARY API
// ========================================

// Generate summary from LinkedIn profile PDF or text
app.post("/make-server-a89809a8/generate-linkedin-summary", async (c) => {
  try {
    const { pdfBase64, profileText, contactName } = await c.req.json();
    console.log("🤖 POST /generate-linkedin-summary - Generating summary for:", contactName);
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment");
      return c.json({ 
        error: "Gemini API key not configured",
        message: "Please add your Gemini API key to continue using AI features."
      }, 500);
    }

    let extractedText = '';
    
    // If text is provided directly, use it
    if (profileText && profileText.trim()) {
      console.log("📝 Using provided profile text");
      extractedText = profileText.trim();
    }
    // Otherwise, try to extract from PDF
    else if (pdfBase64) {
      // Remove data URL prefix if present
      const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      console.log("📄 PDF data length:", base64Data.length);
      
      // Import PDF parsing library to extract text
      const { default: pdfParse } = await import('npm:pdf-parse@1.1.1');
      
      // Convert base64 to buffer
      const pdfBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Extract text from PDF
      console.log("📖 Extracting text from PDF...");
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;
      console.log("✅ Extracted text length:", extractedText.length);
    } else {
      console.error("❌ No PDF or text provided");
      return c.json({ error: "Please provide either a PDF file or profile text" }, 400);
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.error("❌ No text available");
      return c.json({ 
        error: "Could not extract text",
        details: "No text content found in the PDF or provided text" 
      }, 400);
    }
    
    // Now use OpenAI to generate summary from extracted text
    console.log("���� Sending text to Gemini API...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are analyzing a LinkedIn profile. Generate a concise, professional 2-3 sentence summary of this person's background, expertise, and current role. Focus on their key skills, experience, and what makes them unique. Be specific and highlight their most impressive achievements or expertise areas.

LinkedIn Profile Content:
${extractedText.substring(0, 10000)}

Generate a brief professional summary:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
          }
        })
      }
    );

    console.log("📡 Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini API error:", errorText);
      
      // Try to parse error for better message
      let errorMessage = "Failed to generate summary";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        // Use raw error text if JSON parsing fails
      }
      
      return c.json({ 
        error: errorMessage,
        details: errorText 
      }, 500);
    }

    const data = await response.json();
    console.log("📊 Gemini API response data:", JSON.stringify(data).substring(0, 200));
    
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!summary) {
      console.error("❌ No summary generated from response");
      return c.json({ 
        error: "No summary generated",
        details: "Gemini did not return any text in the response" 
      }, 500);
    }
    
    console.log("✅ Summary generated successfully from PDF");
    return c.json({ summary: summary.trim() });
  } catch (error) {
    console.error("❌ Error generating LinkedIn summary:", error);
    return c.json({ 
      error: "Failed to generate summary", 
      details: String(error),
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// ========================================
// FORM INSTANCES API
// ========================================

// Get all form instances
app.get("/make-server-a89809a8/form-instances", async (c) => {
  try {
    console.log("📥 GET /form-instances - Fetching all form instances");
    const instances = await kv.get("form-instances") || [];
    console.log(`✅ Found ${instances.length} instances`);
    return c.json(instances);
  } catch (error) {
    console.error("�� Error fetching form instances:", error);
    return c.json({ error: "Failed to fetch form instances", details: String(error) }, 500);
  }
});

// Save form instance
app.post("/make-server-a89809a8/form-instances", async (c) => {
  try {
    const instance = await c.req.json();
    console.log("💾 POST /form-instances - Saving form instance:", instance.name);
    
    const instances = await kv.get("form-instances") || [];
    instances.push(instance);
    await kv.set("form-instances", instances);
    
    console.log("✅ Form instance saved successfully");
    return c.json({ success: true, instance });
  } catch (error) {
    console.error("❌ Error saving form instance:", error);
    return c.json({ error: "Failed to save form instance", details: String(error) }, 500);
  }
});

// Update form instance
app.put("/make-server-a89809a8/form-instances/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    console.log("🔄 PUT /form-instances/:id - Updating form instance:", id);
    
    const instances = await kv.get("form-instances") || [];
    const index = instances.findIndex((i: any) => i.id === id);
    
    if (index === -1) {
      return c.json({ error: "Form instance not found" }, 404);
    }
    
    instances[index] = { ...instances[index], ...updates };
    await kv.set("form-instances", instances);
    
    console.log("✅ Form instance updated successfully");
    return c.json({ success: true, instance: instances[index] });
  } catch (error) {
    console.error("❌ Error updating form instance:", error);
    return c.json({ error: "Failed to update form instance", details: String(error) }, 500);
  }
});

// Delete form instance
app.delete("/make-server-a89809a8/form-instances/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log("🗑️ DELETE /form-instances/:id - Deleting form instance:", id);
    
    const instances = await kv.get("form-instances") || [];
    const filtered = instances.filter((i: any) => i.id !== id);
    
    if (filtered.length === instances.length) {
      return c.json({ error: "Form instance not found" }, 404);
    }
    
    await kv.set("form-instances", filtered);
    
    console.log("✅ Form instance deleted successfully");
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting form instance:", error);
    return c.json({ error: "Failed to delete form instance", details: String(error) }, 500);
  }
});

// ========================================
// GMAIL OAUTH & NEWSLETTER INTEGRATION
// ========================================

// Gmail OAuth: Initiate authorization flow (GET for direct navigation)
app.get("/make-server-a89809a8/gmail/authorize", async (c) => {
  try {
    console.log("📧 Initiating Gmail OAuth flow (GET)...");
    
    // Accept token from query param (since browser navigation can't send headers)
    const tokenFromQuery = c.req.query('token');
    const tokenFromHeader = c.req.header('Authorization')?.replace('Bearer ', '');
    const token = tokenFromQuery || tokenFromHeader;
    
    console.log("Token present:", !!token);
    
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    // Redirect directly to frontend to avoid Supabase auth requirement on callback
    const redirectUri = 'https://skill-stove-47070579.figma.site/?gmail_callback=true';
    
    console.log("Client ID:", clientId ? "✅ Set" : "❌ Not set");
    console.log("Redirect URI:", redirectUri);
    
    if (!clientId) {
      return c.html(`
        <html>
          <head><title>Configuration Error</title></head>
          <body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
            <h2>⚙️ Gmail Integration Not Configured</h2>
            <p>The GMAIL_CLIENT_ID environment variable is not set.</p>
            <p style="color: #666;">Please configure your Gmail OAuth credentials in the Supabase dashboard.</p>
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #EA4335; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Close
            </button>
          </body>
        </html>
      `);
    }

    const scope = 'https://www.googleapis.com/auth/gmail.readonly';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log("✅ Redirecting to Gmail OAuth:", authUrl);
    return c.redirect(authUrl);
  } catch (error) {
    console.error("❌ Error initiating Gmail OAuth:", error);
    return c.html(`
      <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
          <h2>❌ OAuth Initialization Failed</h2>
          <p>Error: ${String(error)}</p>
          <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #EA4335; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Close
          </button>
        </body>
      </html>
    `);
  }
});

// Gmail OAuth: Initiate authorization flow (POST to allow auth header)
app.post("/make-server-a89809a8/gmail/authorize", async (c) => {
  try {
    console.log("📧 Initiating Gmail OAuth flow (POST)...");
    
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    // Redirect directly to frontend to avoid Supabase auth requirement on callback
    const redirectUri = 'https://skill-stove-47070579.figma.site/?gmail_callback=true';
    
    console.log("Client ID:", clientId ? "✅ Set" : "❌ Not set");
    console.log("Redirect URI:", redirectUri);
    
    if (!clientId) {
      return c.json({ 
        error: 'Gmail integration not configured. Please set GMAIL_CLIENT_ID environment variable.' 
      }, 400);
    }

    const scope = 'https://www.googleapis.com/auth/gmail.readonly';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log("✅ Returning Gmail OAuth URL:", authUrl);
    return c.json({ authUrl });
  } catch (error) {
    console.error("❌ Error initiating Gmail OAuth:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Gmail OAuth: Exchange code for tokens (called by frontend with auth)
// Google redirects directly to frontend now, so no backend callback needed
app.post("/make-server-a89809a8/gmail/exchange", async (c) => {
  try {
    console.log("📧 Exchanging OAuth code for tokens...");
    
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }

    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');
    // MUST match the redirect_uri sent to Google
    const redirectUri = 'https://skill-stove-47070579.figma.site/?gmail_callback=true';

    if (!clientId || !clientSecret) {
      return c.json({ error: "Gmail credentials not configured" }, 500);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Token exchange failed:", errorText);
      return c.json({ error: "Failed to exchange code for tokens", details: errorText }, 500);
    }

    const tokens = await tokenResponse.json();
    console.log("✅ Tokens received, fetching user info...");

    // Fetch user email address
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    let userEmail = null;
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      userEmail = userInfo.email;
      console.log("✅ Connected account:", userEmail);
    }

    // Store tokens in KV
    const integrations = await kv.get("integrations") || {};
    integrations["gmail"] = {
      connected: true,
      email: userEmail, // Store the connected email address
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
      connectedAt: new Date().toISOString(),
      settings: {
        trackNewsletters: true,
        trackedSenders: [],
        trackedLabels: []
      }
    };

    await kv.set("integrations", integrations);
    console.log("✅ Gmail connected successfully");

    return c.json({ success: true, message: "Gmail connected successfully", email: userEmail });
  } catch (error) {
    console.error("❌ Error exchanging Gmail code:", error);
    return c.json({ error: "Failed to complete OAuth", details: String(error) }, 500);
  }
});

// Refresh Gmail access token
async function refreshGmailToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GMAIL_CLIENT_ID');
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

  console.log('🔄 Attempting to refresh Gmail token...');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gmail token refresh failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    
    // If token is invalid/expired, mark Gmail as disconnected
    if (errorText.includes('invalid_grant') || errorText.includes('expired or revoked')) {
      console.log('🔓 Marking Gmail as disconnected due to invalid token');
      const integrations = await kv.get("integrations") || {};
      if (integrations["gmail"]) {
        integrations["gmail"].connected = false;
        integrations["gmail"].accessToken = null;
        integrations["gmail"].refreshToken = null;
        integrations["gmail"].expiresAt = null;
        await kv.set("integrations", integrations);
      }
    }
    
    throw new Error(`Failed to refresh Gmail token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // Update stored token
  const integrations = await kv.get("integrations") || {};
  if (integrations["gmail"]) {
    integrations["gmail"].accessToken = data.access_token;
    integrations["gmail"].expiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();
    await kv.set("integrations", integrations);
    console.log('✅ Gmail token refreshed successfully');
  }

  return data.access_token;
}

// ========================================
// GOOGLE CALENDAR OAUTH & INTEGRATION
// ========================================

// Calendar OAuth: Initiate authorization flow (POST to allow auth header)
app.post("/make-server-a89809a8/calendar/authorize", async (c) => {
  try {
    console.log("📅 Initiating Google Calendar OAuth flow (POST)...");
    
    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    // Redirect directly to frontend to avoid Supabase auth requirement on callback
    const redirectUri = 'https://skill-stove-47070579.figma.site/?calendar_callback=true';
    
    console.log("Client ID:", clientId ? "✅ Set" : "❌ Not set");
    console.log("Redirect URI:", redirectUri);
    
    if (!clientId) {
      return c.json({ 
        error: 'Google Calendar integration not configured. Please set GOOGLE_CALENDAR_CLIENT_ID environment variable.' 
      }, 400);
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log("✅ Returning Google Calendar OAuth URL:", authUrl);
    return c.json({ authUrl });
  } catch (error) {
    console.error("❌ Error initiating Google Calendar OAuth:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Calendar OAuth: Exchange code for tokens (called by frontend with auth)
// Google redirects directly to frontend now, so no backend callback needed
app.post("/make-server-a89809a8/calendar/exchange", async (c) => {
  try {
    console.log("📅 Exchanging Calendar OAuth code for tokens...");
    
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }

    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');
    // MUST match the redirect_uri sent to Google
    const redirectUri = 'https://skill-stove-47070579.figma.site/?calendar_callback=true';

    if (!clientId || !clientSecret) {
      return c.json({ error: "Google Calendar credentials not configured" }, 500);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Token exchange failed:", errorText);
      return c.json({ error: "Failed to exchange code for tokens", details: errorText }, 500);
    }

    const tokens = await tokenResponse.json();
    console.log("✅ Tokens received, storing calendar connection...");

    // Fetch user email address
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    let userEmail = null;
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      userEmail = userInfo.email;
      console.log("✅ Connected account:", userEmail);
    }

    // Store tokens in KV
    const integrations = await kv.get("integrations") || {};
    integrations["calendar"] = {
      connected: true,
      email: userEmail, // Store the connected email address
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
      connectedAt: new Date().toISOString(),
      lastSyncAt: null
    };

    console.log("💾 Saving calendar integration to KV store:", JSON.stringify(integrations, null, 2));
    await kv.set("integrations", integrations);
    console.log("✅ Google Calendar connected successfully");
    
    // Verify it was saved
    const verification = await kv.get("integrations");
    console.log("🔍 Verification - read back from KV:", JSON.stringify(verification, null, 2));

    return c.json({ 
      success: true, 
      message: "Google Calendar connected successfully",
      email: userEmail 
    });
  } catch (error) {
    console.error("❌ Error exchanging Calendar code:", error);
    return c.json({ error: "Failed to complete OAuth", details: String(error) }, 500);
  }
});

// Disconnect Google Calendar
app.post("/make-server-a89809a8/calendar/disconnect", async (c) => {
  try {
    console.log("🔌 Disconnecting Google Calendar...");
    
    const integrations = await kv.get("integrations") || {};
    
    // Remove calendar connection
    if (integrations["calendar"]) {
      delete integrations["calendar"];
      await kv.set("integrations", integrations);
      console.log("✅ Google Calendar disconnected");
    }
    
    return c.json({ success: true, message: "Google Calendar disconnected" });
  } catch (error) {
    console.error("❌ Error disconnecting Calendar:", error);
    return c.json({ error: "Failed to disconnect", details: String(error) }, 500);
  }
});

// Debug: Check what's actually in the KV store
app.get("/make-server-a89809a8/debug/kv-integrations", async (c) => {
  try {
    const integrations = await kv.get("integrations") || {};
    console.log("🔍 DEBUG: Raw integrations from KV:", JSON.stringify(integrations, null, 2));
    return c.json({ 
      integrations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error reading KV store:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get list of user's Google Calendars
app.get("/make-server-a89809a8/calendar/list", async (c) => {
  try {
    console.log("📋 Fetching user's calendar list...");
    
    const integrations = await kv.get("integrations") || {};
    
    if (!integrations.calendar?.connected) {
      return c.json({ error: "Calendar not connected" }, 400);
    }
    
    // Check if token needs refresh
    let accessToken = integrations.calendar.accessToken;
    const expiresAt = new Date(integrations.calendar.expiresAt);
    const now = new Date();
    
    // Check if a previous refresh attempt failed (don't retry for 1 hour)
    if (integrations.calendar.refreshFailedAt) {
      const failedAt = new Date(integrations.calendar.refreshFailedAt);
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (failedAt > hourAgo) {
        console.log("⏸️ Skipping refresh - previous attempt failed recently");
        return c.json({ 
          error: "Calendar disconnected", 
          message: "Your Calendar token has expired. Please reconnect your Google Calendar.",
          needsReconnect: true 
        }, 401);
      }
    }
    
    if (expiresAt <= now && integrations.calendar.refreshToken) {
      console.log("🔄 Token expired, refreshing...");
      try {
        accessToken = await refreshCalendarToken(integrations.calendar.refreshToken);
      } catch (error) {
        console.error("❌ Failed to refresh token:", error);
        return c.json({ 
          error: "Calendar disconnected", 
          message: "Your Calendar token has expired. Please reconnect your Google Calendar.",
          needsReconnect: true 
        }, 401);
      }
    }
    
    // Fetch calendar list from Google
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to fetch calendar list:", errorText);
      return c.json({ error: "Failed to fetch calendars", details: errorText }, 500);
    }
    
    const data = await response.json();
    
    // Get user's selected calendars from storage
    const calendarPrefs = await kv.get("calendar_preferences") || { selectedCalendars: [] };
    
    // Map calendar IDs to custom muted colors (internal tools palette)
    const calendarColorMap: Record<string, string> = {
      'c_c335af726b18d27166b2f36c1c5d9fbb1fd92649a49eacfc0816adf890038992@group.calendar.google.com': '#e09470', // Virtual Appts - muted orange
      'c_a180db3bb003b2be8eaebb1e9f7d6c347b424b9dd139e634de4962fa1329e5c5@group.calendar.google.com': '#c6686d', // Medical Appts - muted red
      'meredith@empowerhealthstrategies.com': '#5b8ea3', // EHS Mtgs - muted teal
      'c_63de4d845029e69906675f62e92609302f7fbd4aea58aaa3da8834fb1e7e033c@group.calendar.google.com': '#d4c48f', // Gildergold Family - muted yellow
      'c_db8c7da6c97cceca59f02acc7b2f85d3bd4606dcf8e32e39a78149e74ca81ea1@group.calendar.google.com': '#b08a65', // Common Grounds - muted brown
      '3vdm7g8e0c8sr9l58nvgvi4jqv8jl1r5@import.calendar.google.com': '#a89bb4', // Life - muted purple
    };
    
    // Transform to our format
    const calendars = data.items.map((cal: any) => {
      // Determine color - check for special calendar names first, then ID map
      let color = calendarColorMap[cal.id] || cal.backgroundColor || '#a8988f';
      if (cal.summary && cal.summary.includes('2026_Spring')) {
        color = '#b9cdcf'; // Custom color for _2026_Spring calendar
      }
      // CM Fellowship calendars (classroom IDs) get sage green color
      if ((cal.summary && cal.summary.includes('CM Fellowship')) || cal.id.includes('classroom')) {
        color = '#83a292'; // Muted sage green for CM Fellowship
      }
      
      return {
        id: cal.id,
        name: cal.summary,
        description: cal.description || null,
        color: color,
        primary: cal.primary || false,
        accessRole: cal.accessRole,
        selected: calendarPrefs.selectedCalendars.includes(cal.id) || cal.primary // Auto-select primary calendar
      };
    });
    
    console.log(`✅ Found ${calendars.length} calendars`);
    
    return c.json({ calendars });
  } catch (error) {
    console.error("❌ Error fetching calendar list:", error);
    return c.json({ error: "Failed to fetch calendars", details: String(error) }, 500);
  }
});

// Fetch events from Google Calendar
app.get("/make-server-a89809a8/calendar/events", async (c) => {
  try {
    console.log("📅 Fetching calendar events...");
    
    const integrations = await kv.get("integrations") || {};
    
    if (!integrations.calendar?.connected || !integrations.calendar.accessToken) {
      console.log("ℹ️ Calendar not connected - returning empty events list");
      return c.json({ events: [], timeMin: null, timeMax: null });
    }
    
    // Check if token needs refresh
    let accessToken = integrations.calendar.accessToken;
    const expiresAt = new Date(integrations.calendar.expiresAt);
    const now = new Date();
    
    // Check if a previous refresh attempt failed (don't retry for 1 hour)
    if (integrations.calendar.refreshFailedAt) {
      const failedAt = new Date(integrations.calendar.refreshFailedAt);
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (failedAt > hourAgo) {
        console.log("⏸️ Skipping refresh - previous attempt failed recently");
        return c.json({ 
          events: [],
          error: "Calendar disconnected", 
          message: "Your Calendar token has expired. Please reconnect your Google Calendar.",
          needsReconnect: true 
        });
      }
    }
    
    if (expiresAt <= now && integrations.calendar.refreshToken) {
      console.log("🔄 Calendar token expired, refreshing...");
      try {
        accessToken = await refreshCalendarToken(integrations.calendar.refreshToken);
        console.log("✅ Calendar token refreshed");
      } catch (error) {
        console.error("❌ Failed to refresh calendar token:", error);
        return c.json({ 
          events: [],
          error: "Calendar disconnected", 
          message: "Your Calendar token has expired. Please reconnect your Google Calendar.",
          needsReconnect: true 
        });
      }
    }
    
    // Get time range from query params (default to 30 days back and 90 days forward)
    const timeMin = c.req.query('timeMin') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = c.req.query('timeMax') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get calendar preferences to see which calendars to fetch
    const prefs = await kv.get("calendar_preferences") || {};
    const selectedCalendars = (prefs.selectedCalendars || [])
      .filter((id: any) => typeof id === 'string' && id.length > 0); // Filter out non-string values
    
    console.log(`📅 Fetching events from ${selectedCalendars.length} calendars between ${timeMin} and ${timeMax}`);
    console.log(`📋 Selected calendar IDs:`, selectedCalendars);
    
    // Check if CM Fellowship is in the list
    const hasCMFellowship = selectedCalendars.some((id: string) => id.includes('classroom'));
    console.log(`🎓 CM Fellowship calendar ${hasCMFellowship ? 'IS' : 'IS NOT'} in selected calendars`);
    
    // If no calendars selected, return empty events
    if (selectedCalendars.length === 0) {
      console.log("ℹ️ No calendars selected - returning empty events list");
      return c.json({ events: [], timeMin, timeMax });
    }
    
    const allEvents: any[] = [];
    
    // Fetch events from each selected calendar
    for (const calendarId of selectedCalendars) {
      try {
        const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` + 
          `timeMin=${encodeURIComponent(timeMin)}&` +
          `timeMax=${encodeURIComponent(timeMax)}&` +
          `singleEvents=true&` +
          `orderBy=startTime&` +
          `maxResults=250`;
        
        const response = await fetch(eventsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const events = data.items || [];
          
          // Add calendarId to each event
          events.forEach((event: any) => {
            event.calendarId = calendarId;
          });
          
          allEvents.push(...events);
          console.log(`✅ Fetched ${events.length} events from calendar ${calendarId}`);
        } else if (response.status === 503) {
          // 503 Service Unavailable - Google Calendar API is temporarily unavailable for this calendar
          // This is typically temporary, so just warn and continue
          console.warn(`⚠️ Calendar temporarily unavailable (503): ${calendarId}. Skipping for now.`);
        } else if (response.status === 404) {
          // 404 Not Found - Calendar might have been deleted or access revoked
          console.warn(`⚠️ Calendar not found (404): ${calendarId}. It may have been deleted or shared access revoked.`);
        } else if (response.status === 403) {
          // 403 Forbidden - Access denied
          console.warn(`⚠️ Access denied to calendar (403): ${calendarId}. Check permissions.`);
        } else {
          console.error(`❌ Failed to fetch events from calendar ${calendarId}: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error fetching events from calendar ${calendarId}:`, error);
      }
    }
    
    console.log(`✅ Total events fetched: ${allEvents.length}`);
    
    // 🎨 FETCH CALENDAR LIST TO GET COLOR MAPPINGS
    try {
      const calendarListResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (calendarListResponse.ok) {
        const calendarListData = await calendarListResponse.json();
        
        // Map calendar IDs to custom muted colors (internal tools palette)
        const calendarColorMap: Record<string, string> = {
          'c_c335af726b18d27166b2f36c1c5d9fbb1fd92649a49eacfc0816adf890038992@group.calendar.google.com': '#e09470', // Virtual Appts - muted orange
          'c_a180db3bb003b2be8eaebb1e9f7d6c347b424b9dd139e634de4962fa1329e5c5@group.calendar.google.com': '#c6686d', // Medical Appts - muted red
          'meredith@empowerhealthstrategies.com': '#5b8ea3', // EHS Mtgs - muted teal
          'c_63de4d845029e69906675f62e92609302f7fbd4aea58aaa3da8834fb1e7e033c@group.calendar.google.com': '#d4c48f', // Gildergold Family - muted yellow
          'c_db8c7da6c97cceca59f02acc7b2f85d3bd4606dcf8e32e39a78149e74ca81ea1@group.calendar.google.com': '#b08a65', // Common Grounds - muted brown
          '3vdm7g8e0c8sr9l58nvgvi4jqv8jl1r5@import.calendar.google.com': '#a89bb4', // Life - muted purple
        };
        
        // Build color map from calendar list
        const colorsByCalendarId: Record<string, string> = {};
        calendarListData.items.forEach((cal: any) => {
          // Determine color - check for special calendar names first, then ID map
          let color = calendarColorMap[cal.id] || cal.backgroundColor || '#a8988f';
          if (cal.summary && cal.summary.includes('2026_Spring')) {
            color = '#b9cdcf'; // Custom color for _2026_Spring calendar
          }
          // CM Fellowship calendars (classroom IDs) get sage green color
          if ((cal.summary && cal.summary.includes('CM Fellowship')) || cal.id.includes('classroom')) {
            color = '#83a292'; // Muted sage green for CM Fellowship
          }
          colorsByCalendarId[cal.id] = color;
        });
        
        console.log('🎨 Built color map for', Object.keys(colorsByCalendarId).length, 'calendars');
        
        // Add color to each event
        allEvents.forEach((event: any) => {
          if (event.calendarId && colorsByCalendarId[event.calendarId]) {
            event.color = colorsByCalendarId[event.calendarId];
          } else {
            event.color = '#a8988f'; // Default muted peach
          }
        });
        
        console.log('✅ Added colors to all events');
      } else {
        console.warn('⚠️ Failed to fetch calendar list for colors, using default');
        // Add default color to all events
        allEvents.forEach((event: any) => {
          event.color = '#a8988f'; // Default muted peach
        });
      }
    } catch (colorError) {
      console.warn('⚠️ Error fetching calendar colors, using default:', colorError);
      // Add default color to all events
      allEvents.forEach((event: any) => {
        event.color = '#a8988f'; // Default muted peach
      });
    }
    
    return c.json({ 
      events: allEvents,
      timeMin,
      timeMax
    });
  } catch (error) {
    console.error("❌ Error fetching calendar events:", error);
    return c.json({ error: "Failed to fetch calendar events", details: String(error) }, 500);
  }
});

// Update selected calendars
app.post("/make-server-a89809a8/calendar/select", async (c) => {
  try {
    console.log("💾 Updating calendar selection...");
    
    const { calendarIds } = await c.req.json();
    
    if (!Array.isArray(calendarIds)) {
      return c.json({ error: "calendarIds must be an array" }, 400);
    }
    
    // Validate that all IDs are strings
    const validCalendarIds = calendarIds.filter(id => typeof id === 'string' && id.length > 0);
    
    if (validCalendarIds.length !== calendarIds.length) {
      console.warn(`⚠️ Filtered out ${calendarIds.length - validCalendarIds.length} invalid calendar IDs`);
    }
    
    // Store selected calendar IDs
    await kv.set("calendar_preferences", {
      selectedCalendars: validCalendarIds,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Saved ${validCalendarIds.length} selected calendars`);
    console.log(`📋 Calendar IDs being saved:`, validCalendarIds);
    
    // Check if CM Fellowship is in the list
    const hasCMFellowship = validCalendarIds.some((id: string) => id.includes('classroom'));
    console.log(`🎓 CM Fellowship ${hasCMFellowship ? 'IS' : 'IS NOT'} in the saved list`);
    
    return c.json({ success: true, selectedCount: validCalendarIds.length });
  } catch (error) {
    console.error("❌ Error updating calendar selection:", error);
    return c.json({ error: "Failed to update selection", details: String(error) }, 500);
  }
});

// Clean up calendar preferences (remove invalid IDs)
app.post("/make-server-a89809a8/calendar/cleanup", async (c) => {
  try {
    console.log("🧹 Cleaning up calendar preferences...");
    
    const prefs = await kv.get("calendar_preferences") || {};
    const selectedCalendars = prefs.selectedCalendars || [];
    
    // Filter to only valid string IDs
    const validCalendarIds = selectedCalendars.filter((id: any) => typeof id === 'string' && id.length > 0);
    
    console.log(`📊 Before cleanup: ${selectedCalendars.length} calendars`);
    console.log(`📊 After cleanup: ${validCalendarIds.length} calendars`);
    console.log(`🗑️ Removed: ${selectedCalendars.length - validCalendarIds.length} invalid entries`);
    
    // Save cleaned data
    await kv.set("calendar_preferences", {
      selectedCalendars: validCalendarIds,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ 
      success: true, 
      before: selectedCalendars.length,
      after: validCalendarIds.length,
      removed: selectedCalendars.length - validCalendarIds.length
    });
  } catch (error) {
    console.error("❌ Error cleaning up calendar preferences:", error);
    return c.json({ error: "Failed to cleanup", details: String(error) }, 500);
  }
});

// Get selected calendars
app.get("/make-server-a89809a8/calendar/selected", async (c) => {
  try {
    const prefs = await kv.get("calendar_preferences") || {};
    const selectedCalendars = prefs.selectedCalendars || [];
    
    console.log("📖 Retrieved selected calendars:", selectedCalendars);
    return c.json({ calendarIds: selectedCalendars });
  } catch (error) {
    console.error("❌ Error getting selected calendars:", error);
    return c.json({ error: "Failed to get selected calendars", details: String(error) }, 500);
  }
});

// Update per-calendar interaction creation settings
app.post("/make-server-a89809a8/calendar/interaction-setting", async (c) => {
  try {
    console.log("💾 Updating calendar interaction setting...");
    
    const { calendarId, autoCreateInteractions } = await c.req.json();
    
    if (!calendarId) {
      return c.json({ error: "calendarId is required" }, 400);
    }
    
    // Get existing settings or initialize
    let settings = await kv.get("calendar_interaction_settings") || {};
    
    // Update setting for this calendar
    settings[calendarId] = autoCreateInteractions;
    
    // Store updated settings
    await kv.set("calendar_interaction_settings", settings);
    
    console.log(`✅ Updated interaction setting for calendar ${calendarId}: ${autoCreateInteractions}`);
    
    return c.json({ success: true, calendarId, autoCreateInteractions });
  } catch (error) {
    console.error("❌ Error updating calendar interaction setting:", error);
    return c.json({ error: "Failed to update interaction setting", details: String(error) }, 500);
  }
});

// Get calendar interaction settings
app.get("/make-server-a89809a8/calendar/interaction-settings", async (c) => {
  try {
    const settings = await kv.get("calendar_interaction_settings") || {};
    console.log("📖 Retrieved calendar interaction settings:", settings);
    return c.json({ settings });
  } catch (error) {
    console.error("❌ Error getting calendar interaction settings:", error);
    return c.json({ error: "Failed to get interaction settings", details: String(error) }, 500);
  }
});

// Create a new event in Google Calendar (for time blocks)
app.post("/make-server-a89809a8/calendar/create-event", async (c) => {
  try {
    console.log("📅 Creating calendar event...");
    
    const integrations = await kv.get("integrations") || {};
    
    if (!integrations.calendar?.connected || !integrations.calendar.accessToken) {
      return c.json({ error: "Calendar not connected" }, 401);
    }
    
    const accessToken = integrations.calendar.accessToken;
    const eventData = await c.req.json();
    
    // Get the primary calendar ID (or use the SpoonFlow calendar if it exists)
    let calendarId = 'primary';
    
    // Try to get/create SpoonFlow dedicated calendar
    const prefs = await kv.get("calendar_preferences") || {};
    if (prefs.spoonflowCalendarId) {
      calendarId = prefs.spoonflowCalendarId;
    } else {
      // Try to create a dedicated SpoonFlow calendar
      try {
        const createCalendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: 'SpoonFlow Time Blocks',
            description: 'Time blocks created by SpoonFlow',
            timeZone: 'America/New_York'
          })
        });
        
        if (createCalendarResponse.ok) {
          const newCalendar = await createCalendarResponse.json();
          calendarId = newCalendar.id;
          
          // Save the calendar ID for future use
          await kv.set("calendar_preferences", {
            ...prefs,
            spoonflowCalendarId: calendarId,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`✅ Created SpoonFlow calendar: ${calendarId}`);
        }
      } catch (createError) {
        console.warn('⚠️ Could not create SpoonFlow calendar, using primary:', createError);
      }
    }
    
    // Create the event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create event: ${error}`);
    }
    
    const event = await response.json();
    console.log(`✅ Created event: ${event.id}`);
    
    return c.json({ eventId: event.id, event });
  } catch (error) {
    console.error("❌ Error creating calendar event:", error);
    return c.json({ error: "Failed to create event", details: String(error) }, 500);
  }
});

// Update an existing event in Google Calendar
app.patch("/make-server-a89809a8/calendar/update-event/:eventId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    console.log(`📅 Updating calendar event: ${eventId}`);
    
    const integrations = await kv.get("integrations") || {};
    
    if (!integrations.calendar?.connected || !integrations.calendar.accessToken) {
      return c.json({ error: "Calendar not connected" }, 401);
    }
    
    const accessToken = integrations.calendar.accessToken;
    const eventData = await c.req.json();
    
    // Determine which calendar the event is in
    const prefs = await kv.get("calendar_preferences") || {};
    const calendarId = prefs.spoonflowCalendarId || 'primary';
    
    // Update the event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update event: ${error}`);
    }
    
    const event = await response.json();
    console.log(`✅ Updated event: ${event.id}`);
    
    return c.json({ success: true, event });
  } catch (error) {
    console.error("❌ Error updating calendar event:", error);
    return c.json({ error: "Failed to update event", details: String(error) }, 500);
  }
});

// Delete an event from Google Calendar
app.delete("/make-server-a89809a8/calendar/delete-event/:eventId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    console.log(`📅 Deleting calendar event: ${eventId}`);
    
    const integrations = await kv.get("integrations") || {};
    
    if (!integrations.calendar?.connected || !integrations.calendar.accessToken) {
      return c.json({ error: "Calendar not connected" }, 401);
    }
    
    const accessToken = integrations.calendar.accessToken;
    
    // Determine which calendar the event is in
    const prefs = await kv.get("calendar_preferences") || {};
    const calendarId = prefs.spoonflowCalendarId || 'primary';
    
    // Delete the event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Failed to delete event: ${error}`);
    }
    
    console.log(`✅ Deleted event: ${eventId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting calendar event:", error);
    return c.json({ error: "Failed to delete event", details: String(error) }, 500);
  }
});

// ========================================
// JAMIE SCHEDULING INTELLIGENCE
// ========================================

// Get Jamie's scheduling configuration
app.get("/make-server-a89809a8/jamie/scheduling-config", async (c) => {
  try {
    console.log("📅 Jamie: Getting scheduling configuration...");
    
    // Hardcoded for Meredith's scheduling rules
    // TODO: Make this configurable per user
    const schedulingConfig = {
      meetingDays: [3, 4], // Wednesday = 3, Thursday = 4 (JavaScript Date.getDay())
      meetingHours: {
        start: 13, // 1:00 PM
        end: 15.5  // 3:30 PM (15:30)
      },
      standardDuration: 30, // minutes
      bufferAfterMeetings: 30, // minutes
      maxMeetingsPerDay: 2,
      timezone: "America/New_York"
    };
    
    return c.json({ config: schedulingConfig });
  } catch (error) {
    console.error("❌ Error getting scheduling config:", error);
    return c.json({ error: "Failed to get scheduling config", details: String(error) }, 500);
  }
});

// Check availability for Jamie
app.post("/make-server-a89809a8/jamie/check-availability", async (c) => {
  try {
    console.log("📅 Jamie: Checking availability...");
    
    const { startDate, endDate, duration } = await c.req.json();
    
    if (!startDate || !endDate) {
      return c.json({ error: "startDate and endDate are required" }, 400);
    }
    
    // Get calendar integration
    const integrations = await kv.get("integrations") || {};
    
    if (!integrations.calendar?.connected || !integrations.calendar.accessToken) {
      return c.json({ 
        error: "Calendar not connected",
        message: "Please connect your Google Calendar first" 
      }, 400);
    }
    
    // Check if token needs refresh
    let accessToken = integrations.calendar.accessToken;
    const expiresAt = new Date(integrations.calendar.expiresAt);
    const now = new Date();
    
    if (expiresAt <= now && integrations.calendar.refreshToken) {
      console.log("🔄 Calendar token expired, refreshing...");
      try {
        accessToken = await refreshCalendarToken(integrations.calendar.refreshToken);
      } catch (error) {
        return c.json({ 
          error: "Calendar token expired",
          message: "Please reconnect your Google Calendar" 
        }, 401);
      }
    }
    
    // Get selected calendars
    const prefs = await kv.get("calendar_preferences") || {};
    const selectedCalendars = (prefs.selectedCalendars || [])
      .filter((id: any) => typeof id === 'string' && id.length > 0);
    
    if (selectedCalendars.length === 0) {
      return c.json({ 
        error: "No calendars selected",
        message: "Please select at least one calendar in settings" 
      }, 400);
    }
    
    // Fetch events in date range
    const allEvents: any[] = [];
    
    for (const calendarId of selectedCalendars) {
      try {
        const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` + 
          `timeMin=${encodeURIComponent(startDate)}&` +
          `timeMax=${encodeURIComponent(endDate)}&` +
          `singleEvents=true&` +
          `orderBy=startTime&` +
          `maxResults=250`;
        
        const response = await fetch(eventsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const events = data.items || [];
          allEvents.push(...events);
        }
      } catch (error) {
        console.error(`❌ Error fetching events from calendar ${calendarId}:`, error);
      }
    }
    
    // Get scheduling rules
    const schedulingConfig = {
      meetingDays: [3, 4], // Wednesday, Thursday
      meetingHours: { start: 13, end: 15.5 }, // 1:00 PM - 3:30 PM
      standardDuration: duration || 30,
      bufferAfterMeetings: 30,
      maxMeetingsPerDay: 2,
      timezone: "America/New_York"
    };
    
    // Calculate available slots
    const availableSlots = calculateAvailableSlots(
      new Date(startDate),
      new Date(endDate),
      allEvents,
      schedulingConfig
    );
    
    console.log(`✅ Found ${availableSlots.length} available slots`);
    
    return c.json({ 
      availableSlots,
      config: schedulingConfig,
      eventsCount: allEvents.length
    });
  } catch (error) {
    console.error("❌ Error checking availability:", error);
    return c.json({ error: "Failed to check availability", details: String(error) }, 500);
  }
});

// Helper function to calculate available slots
function calculateAvailableSlots(
  startDate: Date,
  endDate: Date,
  events: any[],
  config: any
): any[] {
  const slots: any[] = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Check if this is a meeting day (Wednesday = 3, Thursday = 4)
    if (config.meetingDays.includes(dayOfWeek)) {
      // Get events for this day
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayEvents = events.filter(event => {
        const eventStart = event.start?.dateTime ? new Date(event.start.dateTime) : null;
        if (!eventStart) return false;
        return eventStart >= dayStart && eventStart <= dayEnd;
      });
      
      // Check if already at max meetings for the day
      if (dayEvents.length >= config.maxMeetingsPerDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Generate possible time slots
      const meetingStartHour = config.meetingHours.start;
      const meetingEndHour = config.meetingHours.end;
      const durationMinutes = config.standardDuration;
      const bufferMinutes = config.bufferAfterMeetings;
      const slotIntervalMinutes = durationMinutes + bufferMinutes;
      
      // Start at 1:00 PM, check slots every (duration + buffer)
      let currentSlotStart = meetingStartHour * 60; // Convert to minutes from midnight
      const endMinutes = meetingEndHour * 60;
      
      while (currentSlotStart + durationMinutes <= endMinutes) {
        const slotStartHour = Math.floor(currentSlotStart / 60);
        const slotStartMin = currentSlotStart % 60;
        const slotEndMin = currentSlotStart + durationMinutes;
        const slotEndHour = Math.floor(slotEndMin / 60);
        const slotEndMinute = slotEndMin % 60;
        
        const slotStart = new Date(currentDate);
        slotStart.setHours(slotStartHour, slotStartMin, 0, 0);
        
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(slotEndHour, slotEndMinute, 0, 0);
        
        // Check if slot conflicts with existing events (including buffer)
        const hasConflict = dayEvents.some(event => {
          const eventStart = event.start?.dateTime ? new Date(event.start.dateTime) : null;
          const eventEnd = event.end?.dateTime ? new Date(event.end.dateTime) : null;
          
          if (!eventStart || !eventEnd) return false;
          
          // Add buffer after event
          const eventEndWithBuffer = new Date(eventEnd);
          eventEndWithBuffer.setMinutes(eventEndWithBuffer.getMinutes() + bufferMinutes);
          
          // Check overlap
          return (slotStart < eventEndWithBuffer && slotEnd > eventStart);
        });
        
        if (!hasConflict) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            duration: durationMinutes,
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
            meetingsScheduledThatDay: dayEvents.length,
            remainingSlotsForDay: config.maxMeetingsPerDay - dayEvents.length - 1
          });
        }
        
        // Move to next slot
        currentSlotStart += slotIntervalMinutes;
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
}

// Refresh Calendar access token
async function refreshCalendarToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');

  console.log('🔄 Attempting to refresh Calendar token...');
  
  if (!clientId || !clientSecret) {
    console.error('❌ Missing Calendar OAuth credentials');
    throw new Error('Missing Calendar OAuth credentials (CLIENT_ID or CLIENT_SECRET)');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // If token is invalid/revoked, mark calendar as disconnected
    if (errorText.includes('invalid_grant') || errorText.includes('expired or revoked')) {
      console.log('🔓 Calendar token expired/revoked - marking as disconnected');
      const integrations = await kv.get("integrations") || {};
      if (integrations["calendar"]) {
        integrations["calendar"].connected = false;
        integrations["calendar"].accessToken = null;
        integrations["calendar"].refreshToken = null;
        integrations["calendar"].refreshFailedAt = new Date().toISOString();
        await kv.set("integrations", integrations);
      }
      throw new Error('TOKEN_EXPIRED_OR_REVOKED');
    }
    
    // For other errors, log and throw
    console.error('❌ Failed to refresh Calendar token:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Failed to refresh Calendar token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // Update stored token
  const integrations = await kv.get("integrations") || {};
  if (integrations["calendar"]) {
    integrations["calendar"].accessToken = data.access_token;
    integrations["calendar"].expiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();
    await kv.set("integrations", integrations);
    console.log('✅ Calendar token refreshed and stored');
  }

  return data.access_token;
}

// Get Gmail access token (auto-refresh if needed)
async function getGmailAccessToken(): Promise<string | null> {
  const integrations = await kv.get("integrations") || {};
  const gmailIntegration = integrations["gmail"];

  if (!gmailIntegration || !gmailIntegration.connected) {
    console.error("❌ Gmail not connected in KV store");
    return null;
  }

  console.log("📋 Gmail integration found, checking token expiry...");
  console.log("📋 Token expires at:", gmailIntegration.expiresAt);

  // Check if token is expired
  const expiresAt = new Date(gmailIntegration.expiresAt);
  const now = new Date();

  console.log("📋 Current time:", now.toISOString());
  console.log("📋 Token expired?", expiresAt <= now);

  if (expiresAt <= now) {
    console.log("🔄 Token expired, refreshing...");
    try {
      return await refreshGmailToken(gmailIntegration.refreshToken);
    } catch (error) {
      console.error("❌ Failed to refresh token:", error);
      // Re-check if Gmail was disconnected during refresh
      const updatedIntegrations = await kv.get("integrations") || {};
      if (!updatedIntegrations["gmail"]?.connected) {
        console.log("🔓 Gmail was disconnected during refresh");
        return null;
      }
      throw error;
    }
  }

  console.log("✅ Token still valid, returning existing token");
  return gmailIntegration.accessToken;
}

// Fetch newsletters from Gmail
app.post("/make-server-a89809a8/gmail/fetch-newsletters", async (c) => {
  try {
    console.log("📧 Fetching newsletters from Gmail...");

    const accessToken = await getGmailAccessToken();
    if (!accessToken) {
      console.error("❌ No access token available");
      return c.json({ error: "Gmail not connected" }, 401);
    }

    console.log("✅ Got access token, length:", accessToken.length);

    const integrations = await kv.get("integrations") || {};
    const settings = integrations["gmail"]?.settings || {};
    const trackedSenders = settings.trackedSenders || [];
    const trackedLabels = settings.trackedLabels || [];

    console.log(`📬 Tracked senders: ${trackedSenders.join(', ')}`);

    // Build Gmail query
    let query = 'in:inbox';
    
    if (trackedSenders.length > 0) {
      const senderQuery = trackedSenders.map((s: string) => `from:${s}`).join(' OR ');
      query = `${query} (${senderQuery})`;
    }

    if (trackedLabels.length > 0) {
      const labelQuery = trackedLabels.map((l: string) => `label:${l}`).join(' OR ');
      query = `${query} (${labelQuery})`;
    }

    // Limit to last 7 days (using local timezone)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dateStr = dateToLocalString(weekAgo).replace(/-/g, '/');
    query = `${query} after:${dateStr}`;

    console.log(`🔍 Gmail query: ${query}`);

    // Fetch message list
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error("❌ Gmail API error (status " + listResponse.status + "):", errorText);
      
      // Parse error if JSON
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        console.error("❌ Detailed error:", JSON.stringify(errorJson, null, 2));
        
        // Check for common errors
        if (errorJson.error && errorJson.error.code === 403) {
          errorDetails = "Gmail API is not enabled. Please enable it in Google Cloud Console: https://console.cloud.google.com/apis/library/gmail.googleapis.com";
        } else if (errorJson.error && errorJson.error.code === 401) {
          errorDetails = "Access token is invalid or expired. Try disconnecting and reconnecting Gmail.";
        } else {
          errorDetails = errorJson.error?.message || errorText;
        }
      } catch (e) {
        // Not JSON, already logged as text
      }
      
      return c.json({ 
        error: "Failed to fetch emails", 
        details: errorDetails, 
        status: listResponse.status,
        rawError: errorText
      }, 500);
    }

    const listData = await listResponse.json();
    const messageIds = listData.messages || [];

    console.log(`📨 Found ${messageIds.length} newsletters`);

    // Fetch full message details
    const newsletters = [];
    for (const { id } of messageIds.slice(0, 10)) { // Limit to 10 for now
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        
        // Extract headers
        const headers = msgData.payload.headers;
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';

        // Extract body
        let bodyHtml = '';
        let bodyText = '';

        if (msgData.payload.parts) {
          const htmlPart = msgData.payload.parts.find((p: any) => p.mimeType === 'text/html');
          const textPart = msgData.payload.parts.find((p: any) => p.mimeType === 'text/plain');
          
          if (htmlPart?.body?.data) {
            bodyHtml = atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
          if (textPart?.body?.data) {
            bodyText = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
        } else if (msgData.payload.body?.data) {
          bodyText = atob(msgData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }

        newsletters.push({
          email_id: id,
          sender_name: from.split('<')[0].trim(),
          sender_email: from.match(/<(.+)>/)?.[1] || from,
          subject,
          received_at: new Date(date).toISOString(),
          email_html: bodyHtml,
          email_text: bodyText
        });
      }
    }

    console.log(`✅ Fetched ${newsletters.length} newsletter details`);
    return c.json({ newsletters });

  } catch (error) {
    console.error("❌ Error fetching newsletters:", error);
    
    // Check if this is a token refresh error
    const errorMessage = String(error);
    if (errorMessage.includes('Failed to refresh Gmail token') || errorMessage.includes('invalid_grant')) {
      return c.json({ 
        error: "Gmail authentication expired", 
        details: "Please reconnect your Gmail account in Settings > Integrations",
        reconnect: true 
      }, 401);
    }
    
    return c.json({ error: "Failed to fetch newsletters", details: String(error) }, 500);
  }
});

// Update Gmail settings (work Gmail for drafts)
app.put("/make-server-a89809a8/gmail/settings", async (c) => {
  try {
    const settings = await c.req.json();
    console.log("⚙️ Updating Gmail settings:", settings);

    const integrations = await kv.get("integrations") || {};
    if (!integrations["gmail"] || !integrations["gmail"].connected) {
      return c.json({ error: "Gmail not connected" }, 400);
    }

    integrations["gmail"].settings = {
      ...integrations["gmail"].settings,
      ...settings
    };

    await kv.set("integrations", integrations);
    console.log("✅ Gmail settings updated");
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error updating Gmail settings:", error);
    return c.json({ error: "Failed to update settings", details: String(error) }, 500);
  }
});

// ========================================
// RSS FEEDS (Blogs & Substacks)
// ========================================

app.get("/make-server-a89809a8/rss-feeds", rssFeeds.getRssFeeds);
app.post("/make-server-a89809a8/rss-feeds/add", rssFeeds.addRssFeed);
app.post("/make-server-a89809a8/rss-feeds/remove", rssFeeds.removeRssFeed);
app.post("/make-server-a89809a8/rss-feeds/fetch", rssFeeds.fetchAllRssFeeds);

// ========================================
// JAMIE AI - Extract meeting data from text or Fathom URL
// ========================================

app.post("/make-server-a89809a8/jamie/extract-from-text", handleJamieExtract);
app.post("/make-server-a89809a8/jamie/extract-from-fathom", handleJamieExtractFromFathom);

// ========================================
// WEB SEARCH API (Brave Search)
// ========================================

// Search the web for articles/content
app.post("/make-server-a89809a8/web-search", async (c) => {
  try {
    const { query, count = 5, freshness } = await c.req.json();
    
    // Validate query length (Brave Search max is 400 characters)
    if (!query || typeof query !== 'string') {
      return c.json({ 
        error: "Invalid query",
        message: "Query must be a non-empty string"
      }, 400);
    }
    
    // Truncate query if too long, but warn about it
    const MAX_QUERY_LENGTH = 400;
    let searchQuery = query.trim();
    
    if (searchQuery.length > MAX_QUERY_LENGTH) {
      console.warn(`⚠️ Query too long (${searchQuery.length} chars), truncating to ${MAX_QUERY_LENGTH} chars`);
      console.warn(`📝 Original query: ${searchQuery.substring(0, 100)}...`);
      
      // Extract key search terms from the beginning
      searchQuery = searchQuery.substring(0, MAX_QUERY_LENGTH).trim();
      
      // Try to end at a word boundary
      const lastSpace = searchQuery.lastIndexOf(' ');
      if (lastSpace > MAX_QUERY_LENGTH * 0.8) {
        searchQuery = searchQuery.substring(0, lastSpace);
      }
    }
    
    console.log(`🔍 Web search request: "${searchQuery}" (count: ${count})`);
    
    const braveApiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');
    if (!braveApiKey) {
      console.error("❌ BRAVE_SEARCH_API_KEY not found in environment");
      return c.json({ 
        error: "Brave Search API key not configured",
        message: "Please add your Brave Search API key to continue using web search features."
      }, 500);
    }

    // Build Brave Search API URL
    const params = new URLSearchParams({
      q: searchQuery,
      count: count.toString(),
      search_lang: 'en',
      safesearch: 'moderate',
    });

    // Add freshness filter if specified (e.g., "pd" for past day, "pw" for past week, "pm" for past month)
    if (freshness) {
      params.append('freshness', freshness);
    }

    console.log(`📤 Calling Brave Search API with params:`, params.toString());

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': braveApiKey
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Brave Search API error: ${response.status} - ${errorText}`);
      return c.json({ 
        error: `Brave Search API error: ${response.statusText}`,
        details: errorText 
      }, response.status);
    }

    const data = await response.json();
    console.log(`✅ Brave Search returned ${data.web?.results?.length || 0} results`);

    // Extract and format the results
    const results = (data.web?.results || []).map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.description,
      age: result.age, // e.g., "2 days ago"
      publishedDate: result.page_age, // ISO date if available
      favicon: result.profile?.img, // Site favicon
      siteName: result.profile?.name, // e.g., "TechCrunch"
    }));

    return c.json({ 
      query,
      results,
      total: data.web?.results?.length || 0
    });

  } catch (error) {
    console.error("❌ Error performing web search:", error);
    return c.json({ 
      error: "Failed to perform web search", 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  console.log(`❌ 404 Not Found: ${c.req.method} ${c.req.url}`);
  return c.json({ error: "Not found" }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error("❌ Unhandled error:", err);
  return c.json({ 
    error: "Internal server error", 
    details: err.message,
    stack: err.stack 
  }, 500);
});

// Schedule Settings endpoints
app.get("/make-server-a89809a8/schedule-settings", async (c) => {
  try {
    const settings = await kv.get('schedule_settings');
    return c.json({ settings: settings || null });
  } catch (error) {
    console.error('Error loading schedule settings:', error);
    return c.json({ error: 'Failed to load schedule settings', details: error.message }, 500);
  }
});

app.post("/make-server-a89809a8/schedule-settings", async (c) => {
  try {
    const body = await c.req.json();
    const { settings } = body;
    
    if (!settings) {
      return c.json({ error: 'Missing settings in request body' }, 400);
    }
    
    await kv.set('schedule_settings', settings);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving schedule settings:', error);
    return c.json({ error: 'Failed to save schedule settings', details: error.message }, 500);
  }
});

// ========================================
// FATHOM API INTEGRATION
// ========================================

// Test Fathom API connection
app.get("/make-server-a89809a8/fathom/test", async (c) => {
  try {
    const fathomApiKey = Deno.env.get('CURRENT_FATHOM_API_KEY');
    
    if (!fathomApiKey) {
      return c.json({ 
        connected: false, 
        error: "CURRENT_FATHOM_API_KEY not configured" 
      }, 400);
    }

    const isConnected = await testFathomConnection(fathomApiKey);
    
    return c.json({ connected: isConnected });
  } catch (error) {
    console.error("❌ Fathom connection test error:", error);
    return c.json({ 
      connected: false, 
      error: error.message 
    }, 500);
  }
});

// Fetch and parse Fathom transcript from URL
app.post("/make-server-a89809a8/fathom/fetch", async (c) => {
  try {
    const { fathomUrl } = await c.req.json();
    
    if (!fathomUrl) {
      return c.json({ error: "fathomUrl is required" }, 400);
    }

    const fathomApiKey = Deno.env.get('CURRENT_FATHOM_API_KEY');
    
    if (!fathomApiKey) {
      return c.json({ 
        error: "Fathom API key not configured",
        message: "Please add your Fathom API key in Settings to use this feature. You can still save the meeting notes manually without importing from Fathom.",
        requiresApiKey: true
      }, 400);
    }

    console.log(`🎥 Fetching Fathom transcript from URL: ${fathomUrl}`);

    // Extract meeting ID from URL
    const meetingId = extractFathomMeetingId(fathomUrl);
    
    if (!meetingId) {
      return c.json({ 
        error: "Invalid Fathom URL",
        message: "Could not extract meeting ID from the provided URL. You can still save the URL and fill in notes manually.",
        invalidUrl: true
      }, 400);
    }

    console.log(`📋 Extracted meeting ID: ${meetingId}`);

    // Fetch transcript from Fathom API
    const transcript = await fetchFathomTranscript(meetingId, fathomApiKey);
    
    console.log(`✅ Retrieved transcript for: ${transcript.title}`);

    // Parse into our Meeting Dossier format
    const parsedData = parseFathomTranscript(transcript);
    
    console.log(`✅ Parsed Fathom data - ${parsedData.actionItems.length} action items, ${parsedData.thingsDiscussed.length} topics`);

    return c.json({
      success: true,
      data: parsedData,
      metadata: {
        title: transcript.title,
        startTime: transcript.start_time,
        endTime: transcript.end_time
      }
    });
  } catch (error) {
    console.error("❌ Error fetching Fathom transcript:", error);
    
    // Provide helpful error messages for common issues
    let userMessage = "Failed to fetch Fathom transcript. You can still save the meeting notes manually.";
    let useWebhooks = false;
    
    if (error.message?.includes('dns error') || error.message?.includes('failed to lookup')) {
      userMessage = "⚠️ Fathom's REST API is not publicly accessible. Fathom uses webhook-based integration. For now, save the URL and fill in notes manually. Set up webhooks in Settings for automatic import.";
      useWebhooks = true;
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      userMessage = "Fathom API authentication failed. Please check your API key in Settings. You can still save notes manually.";
    } else if (error.message?.includes('404')) {
      userMessage = "Meeting not found in Fathom. Please verify the URL is correct. You can still save notes manually.";
    }
    
    return c.json({ 
      error: "Failed to fetch Fathom transcript",
      message: userMessage,
      technicalDetails: error.message,
      canContinueManually: true,
      useWebhooks
    }, 500);
  }
});

// Test Fathom API connectivity
app.get("/make-server-a89809a8/fathom/test", async (c) => {
  const fathomApiKey = Deno.env.get('CURRENT_FATHOM_API_KEY');
  
  if (!fathomApiKey) {
    return c.json({ 
      success: false,
      error: "CURRENT_FATHOM_API_KEY not configured",
      message: "Please add your Fathom API key to environment variables"
    });
  }

  const diagnostics = {
    apiKeyPresent: true,
    apiKeyPrefix: fathomApiKey.substring(0, 10) + '...',
    tests: []
  };

  // Test 1: Try to reach api.fathom.video
  try {
    console.log('🧪 Test 1: Testing api.fathom.video/v1/calls');
    const response = await fetch('https://api.fathom.video/v1/calls', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fathomApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    diagnostics.tests.push({
      name: 'api.fathom.video/v1/calls',
      success: true,
      status: response.status,
      statusText: response.statusText,
      message: `API reachable, returned ${response.status}`
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'api.fathom.video/v1/calls',
      success: false,
      error: error.message,
      message: 'Failed to connect - DNS or network issue'
    });
  }

  // Test 2: Try listing user's own calls (proper authenticated endpoint)
  try {
    console.log('🧪 Test 2: Testing authenticated call to list user calls');
    const response = await fetch('https://api.fathom.video/v1/calls?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fathomApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    const responseText = await response.text();
    
    diagnostics.tests.push({
      name: 'api.fathom.video/v1/calls?limit=1 (list calls)',
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      message: response.ok 
        ? `✅ API is working! Status ${response.status}. Your API key is valid.`
        : `API returned ${response.status}. Response: ${responseText.substring(0, 200)}`,
      responsePreview: responseText.substring(0, 300)
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'api.fathom.video/v1/calls?limit=1 (list calls)',
      success: false,
      error: error.message,
      message: 'Failed to connect - DNS or network issue'
    });
  }

  // Test 3: Check if using testFathomConnection helper
  try {
    console.log('🧪 Test 3: Using testFathomConnection helper function');
    const connectionWorks = await testFathomConnection(fathomApiKey);
    diagnostics.tests.push({
      name: 'testFathomConnection() helper',
      success: connectionWorks,
      message: connectionWorks 
        ? '✅ Helper function confirms API connection works'
        : '❌ Helper function could not connect to API'
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'testFathomConnection() helper',
      success: false,
      error: error.message,
      message: 'Helper function threw an error'
    });
  }

  return c.json(diagnostics);
});

// Webhook endpoint for Fathom - Auto-creates meeting notes
app.post("/make-server-a89809a8/webhooks/fathom", async (c) => {
  try {
    const webhookData = await c.req.json();
    
    console.log("🔔 Fathom webhook received:", JSON.stringify(webhookData, null, 2));

    // Verify webhook signature (if Fathom provides one)
    const webhookSecret = Deno.env.get('CURRENT_FATHOM_WEBHOOK_SECRET');
    const signature = c.req.header('x-fathom-signature') || c.req.header('x-webhook-signature');
    
    if (webhookSecret && signature) {
      console.log('🔐 Webhook signature received:', signature);
    }

    // Extract meeting data from webhook payload
    const meetingData = webhookData.data || webhookData.meeting || webhookData;
    
    const {
      id: fathomMeetingId,
      title,
      start_time,
      end_time,
      summary,
      transcript,
      transcript_segments,
      action_items,
      participants,
      recording_url,
      share_url
    } = meetingData;

    console.log(`📋 Processing meeting: ${title || 'Untitled'} (ID: ${fathomMeetingId})`);
    console.log(`🔗 Share URL from webhook: ${share_url}`);
    console.log(`🔗 Recording URL from webhook: ${recording_url}`);
    console.log(`🆔 Will store with meeting ID: ${fathomMeetingId}`);

    // Parse action items
    const parsedActionItems = (action_items || []).map((item: any) => ({
      text: typeof item === 'string' ? item : item.text || item.description,
      completed: false
    }));

    // Create a unique key for this meeting
    const meetingDate = start_time ? new Date(start_time).toISOString().split('T')[0] : getTodayLocal();
    const meetingKey = `meeting_dossier_${meetingDate}_${fathomMeetingId}`;

    // Store the auto-generated meeting dossier
    await kv.set(meetingKey, {
      id: fathomMeetingId,
      meetingTitle: title || 'Untitled Meeting',
      fathomUrl: share_url || `https://app.fathom.video/call/${fathomMeetingId}`,
      summary: summary || '',
      transcript: transcript || '', // 📝 Store full transcript for Jamie's reference
      thingsDiscussed: [],
      outcomes: '',
      actionItems: parsedActionItems,
      questionsAnswered: [],
      recordingUrl: recording_url || share_url || '',
      participants: participants || [],
      createdAt: new Date().toISOString(),
      source: 'fathom_webhook',
      autoGenerated: true,
      startTime: start_time,
      endTime: end_time
    });

    // Also store a reference in a webhook log
    const webhookLogKey = `fathom_webhook_log_${Date.now()}`;
    await kv.set(webhookLogKey, {
      meetingKey,
      meetingId: fathomMeetingId,
      shareUrl: share_url,
      meetingTitle: title,
      receivedAt: new Date().toISOString(),
      processed: true
    });

    // CRITICAL: Also store in the format Jamie expects (fathom:webhook:ID)
    // This allows the Post-Meeting Wizard to fetch data via Jamie extract
    const jamieWebhookKey = `fathom:webhook:${fathomMeetingId}`;
    await kv.set(jamieWebhookKey, JSON.stringify({
      id: fathomMeetingId,
      title,
      start_time,
      end_time,
      summary,
      transcript,
      transcript_segments,
      action_items,
      participants,
      recording_url,
      share_url
    }));

    console.log(`✅ Auto-created meeting dossier: ${meetingKey}`);
    console.log(`   - Jamie webhook key: ${jamieWebhookKey}`);
    console.log(`   - Title: ${title}`);
    console.log(`   - Action Items: ${parsedActionItems.length}`);

    return c.json({ 
      success: true,
      message: "Meeting notes auto-created from Fathom webhook",
      meetingKey,
      preview: {
        title: title,
        actionItems: parsedActionItems.length
      }
    });
  } catch (error) {
    console.error("❌ Error processing Fathom webhook:", error);
    
    // Still return 200 so Fathom doesn't retry excessively
    return c.json({ 
      success: false,
      error: "Failed to process webhook",
      message: error.message
    }, 200);
  }
});

// Debug endpoint to test if webhook endpoint is reachable
app.get("/make-server-a89809a8/webhooks/fathom/test", async (c) => {
  console.log('🧪 Webhook test endpoint called');
  const totalWebhooks = (await kv.getByPrefix('fathom_webhook_log_')).length;
  return c.json({
    success: true,
    message: "✅ Webhook endpoint is reachable!",
    timestamp: new Date().toISOString(),
    webhookUrl: "POST to https://spoonflowsupabaseproject.supabase.co/functions/v1/make-server-a89809a8/webhooks/fathom",
    totalWebhooksReceived: totalWebhooks,
    instructions: totalWebhooks === 0 ? "No webhooks received yet. Please configure the webhook in Fathom settings." : `${totalWebhooks} webhooks received successfully.`
  });
});

// Simple debug endpoint to view raw webhook IDs
app.get("/make-server-a89809a8/debug/webhook-ids", async (c) => {
  try {
    const logs = await kv.getByPrefix('fathom_webhook_log_');
    
    return c.json({
      totalWebhooks: logs.length,
      webhookData: logs.map(log => ({
        meetingId: log.meetingId,
        shareUrl: log.shareUrl,
        title: log.meetingTitle,
        receivedAt: log.receivedAt
      }))
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Get all webhook-generated meeting notes (for debugging/viewing)
app.get("/make-server-a89809a8/webhooks/fathom/meetings", async (c) => {
  try {
    console.log('🔍 Fetching webhook meetings...');
    const logs = await kv.getByPrefix('fathom_webhook_log_');
    console.log(`📊 Found ${logs.length} webhook logs:`, JSON.stringify(logs, null, 2));
    
    const meetings = [];

    for (const log of logs) {
      console.log('📝 Processing log:', log);
      if (log.meetingKey) {
        console.log(`   -> Looking up meeting: ${log.meetingKey}`);
        const meetingData = await kv.get(log.meetingKey);
        if (meetingData) {
          console.log(`   -> ✅ Found meeting data`);
          meetings.push({
            ...meetingData,
            loggedAt: log.receivedAt
          });
        } else {
          console.log(`   -> ⚠️ Meeting data not found for key: ${log.meetingKey}`);
        }
      } else {
        console.log('   -> ⚠️ Log has no meetingKey property');
      }
    }

    console.log(`✅ Returning ${meetings.length} meetings`);

    return c.json({
      success: true,
      count: meetings.length,
      meetings: meetings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  } catch (error) {
    console.error("❌ Error fetching webhook meetings:", error);
    return c.json({ 
      error: "Failed to fetch meetings",
      message: error.message
    }, 500);
  }
});

// Debug endpoint: Check webhook data for specific meeting ID
app.post("/make-server-a89809a8/webhooks/fathom/debug", async (c) => {
  try {
    const { meetingId } = await c.req.json();
    
    console.log(`🔍 Debugging webhook data for meeting ID: ${meetingId}`);
    
    // Get all webhook logs
    const allLogs = await kv.getByPrefix('fathom_webhook_log_');
    console.log(`📊 Total webhook logs: ${allLogs.length}`);
    
    // Find matching log
    const matchingLog = allLogs.find(log => log.meetingId === meetingId);
    
    // Get all meeting dossiers
    const allDossiers = await kv.getByPrefix('meeting_dossier_');
    console.log(`📋 Total meeting dossiers: ${allDossiers.length}`);
    
    return c.json({
      success: true,
      searchedFor: meetingId,
      webhookLogs: {
        total: allLogs.length,
        allMeetingIds: allLogs.map(log => log.meetingId),
        matchingLog: matchingLog || null
      },
      dossiers: {
        total: allDossiers.length,
        allDossierIds: allDossiers.map(d => d.id).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return c.json({ 
      error: 'Debug failed',
      message: error.message 
    }, 500);
  }
});

// Comprehensive debug endpoint: View ALL Fathom webhook data
app.get("/make-server-a89809a8/webhooks/fathom/debug/all", async (c) => {
  try {
    console.log('🔍 Fetching comprehensive Fathom webhook debug data...');
    
    // Get all webhook logs
    const webhookLogs = await kv.getByPrefix('fathom_webhook_log_');
    
    // Get all fathom:webhook: keys (what Jamie looks for)
    const jamieWebhookKeys = await kv.getByPrefix('fathom:webhook:');
    
    // Get all meeting dossiers created from webhooks
    const meetingDossiers = await kv.getByPrefix('meeting_dossier_');
    
    // Parse Jamie webhook data
    const jamieWebhooks = jamieWebhookKeys.map(entry => {
      try {
        const data = JSON.parse(entry.value);
        const meetingId = entry.key.replace('fathom:webhook:', '');
        return {
          meetingId,
          title: data.title,
          shareUrl: data.share_url,
          hasTranscript: !!data.transcript,
          hasSummary: !!data.summary,
          actionItemsCount: data.action_items?.length || 0,
          startTime: data.start_time
        };
      } catch (e) {
        return {
          key: entry.key,
          error: 'Failed to parse',
          rawValue: entry.value?.substring(0, 100)
        };
      }
    });
    
    // Parse webhook logs
    const parsedLogs = webhookLogs.map(log => ({
      meetingId: log.meetingId,
      meetingTitle: log.meetingTitle,
      shareUrl: log.shareUrl,
      receivedAt: log.receivedAt,
      meetingKey: log.meetingKey
    }));
    
    return c.json({
      success: true,
      summary: {
        totalWebhookLogs: webhookLogs.length,
        totalJamieKeys: jamieWebhookKeys.length,
        totalMeetingDossiers: meetingDossiers.length,
        lastWebhookReceived: webhookLogs.length > 0 
          ? webhookLogs.sort((a, b) => 
              new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
            )[0].receivedAt 
          : 'Never'
      },
      webhookLogs: parsedLogs.sort((a, b) => 
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      ),
      jamieWebhookData: jamieWebhooks.sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }),
      instructions: {
        message: "This shows all Fathom webhooks received by SpoonFlow",
        jamieWebhookKeys: "These are the keys Jamie looks for when you paste a Fathom URL",
        webhookLogs: "These are logs of webhook POST requests received from Fathom",
        howToTest: "Go to Fathom Settings → Integrations → Webhooks and send a test webhook"
      }
    });
  } catch (error) {
    console.error('❌ Error fetching debug data:', error);
    return c.json({
      error: 'Failed to fetch debug data',
      message: error.message
    }, 500);
  }
});

// ========================================
// LINKEDIN OAUTH API
// ========================================

// Initiate LinkedIn OAuth flow (returns auth URL)
app.post("/make-server-a89809a8/linkedin/authorize", async (c) => {
  try {
    console.log("🔗 POST /linkedin/authorize - Initiating LinkedIn OAuth");
    
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    if (!clientId) {
      console.error("❌ LINKEDIN_CLIENT_ID not configured");
      return c.json({ error: "LinkedIn integration not configured. Please add LINKEDIN_CLIENT_ID in Settings." }, 400);
    }
    
    // Return auth URL to frontend (same pattern as Gmail/Calendar)
    const redirectUri = 'https://skill-stove-47070579.figma.site/?linkedin_callback=true';
    const scope = 'openid profile email w_member_social'; // Scopes for profile access and posting
    const state = Math.random().toString(36).substring(7); // Random state for CSRF protection
    
    // Store state in KV for validation
    await kv.set(`linkedin_oauth_state_${state}`, { timestamp: Date.now() });
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
    
    console.log("✅ Returning LinkedIn OAuth URL");
    return c.json({ authUrl });
  } catch (error) {
    console.error("❌ Error initiating LinkedIn OAuth:", error);
    return c.json({ error: "Failed to initiate OAuth", details: String(error) }, 500);
  }
});

// Exchange LinkedIn auth code for access token
app.post("/make-server-a89809a8/linkedin/exchange", async (c) => {
  try {
    const { code, redirectUri } = await c.req.json();
    console.log("🔄 POST /linkedin/exchange - Exchanging code for token");
    console.log("📝 Redirect URI:", redirectUri);
    console.log("📝 Code (first 20 chars):", code?.substring(0, 20));
    
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error("❌ LinkedIn credentials not configured");
      return c.json({ error: "LinkedIn integration not configured" }, 500);
    }
    
    console.log("✅ LinkedIn credentials found");
    console.log("📝 Client ID:", clientId?.substring(0, 10) + "...");
    
    // Exchange code for access token
    console.log("📤 Sending token exchange request to LinkedIn...");
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });
    
    console.log("📥 LinkedIn response status:", tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("❌ Failed to exchange code:", error);
      console.error("❌ Status:", tokenResponse.status);
      console.error("❌ Status Text:", tokenResponse.statusText);
      return c.json({ 
        error: "Failed to obtain access token", 
        details: error,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText 
      }, 400);
    }
    
    const tokenData = await tokenResponse.json();
    console.log("✅ Successfully obtained access token");
    
    // Get user profile info
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!profileResponse.ok) {
      console.error("❌ Failed to fetch user profile");
      return c.json({ error: "Failed to fetch profile" }, 400);
    }
    
    const profile = await profileResponse.json();
    console.log("✅ Successfully fetched LinkedIn profile:", profile.email);
    
    // Store the access token and profile info
    await kv.set('integration_linkedin', {
      connected: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      connectedAt: new Date().toISOString(),
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      sub: profile.sub, // LinkedIn user ID
    });
    
    console.log("✅ LinkedIn integration connected successfully");
    return c.json({ 
      success: true, 
      email: profile.email,
      name: profile.name 
    });
  } catch (error) {
    console.error("❌ Error exchanging LinkedIn code:", error);
    return c.json({ error: "Failed to complete OAuth", details: String(error) }, 500);
  }
});

// Disconnect LinkedIn
app.post("/make-server-a89809a8/linkedin/disconnect", async (c) => {
  try {
    console.log("🔌 POST /linkedin/disconnect - Disconnecting LinkedIn");
    await kv.del('integration_linkedin');
    console.log("✅ LinkedIn disconnected successfully");
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error disconnecting LinkedIn:", error);
    return c.json({ error: "Failed to disconnect", details: String(error) }, 500);
  }
});

// ==========================================
// DATA BACKUP AND RESTORE
// ==========================================

// Export all data
app.get("/make-server-a89809a8/export-data", async (c) => {
  try {
    console.log("📦 Exporting all data...");
    
    // Get all keys with common prefixes
    const prefixes = [
      'tasks_',
      'contacts_',
      'content_',
      'nurtures_',
      'timeblocks_',
      'settings_',
      'integrations',
      'calendar_',
      'forms_',
      'user_',
      'business_',
      'documents_',
      'services_'
    ];
    
    const allData: Record<string, any> = {};
    
    for (const prefix of prefixes) {
      const items = await kv.getByPrefix(prefix);
      for (const item of items) {
        allData[item.key] = item.value;
      }
    }
    
    console.log(`✅ Exported ${Object.keys(allData).length} items`);
    
    return c.json({
      exportDate: new Date().toISOString(),
      itemCount: Object.keys(allData).length,
      data: allData
    });
  } catch (error) {
    console.error("❌ Error exporting data:", error);
    return c.json({ error: "Failed to export data", details: String(error) }, 500);
  }
});

// Import data
app.post("/make-server-a89809a8/import-data", async (c) => {
  try {
    const body = await c.req.json();
    console.log("📥 Importing data...");
    
    const importData = body.data || body;
    
    if (!importData || typeof importData !== 'object') {
      return c.json({ error: "Invalid import data format" }, 400);
    }
    
    // Import all key-value pairs
    const entries = Object.entries(importData);
    let importedCount = 0;
    
    for (const [key, value] of entries) {
      // Skip metadata fields from export
      if (key === 'exportDate' || key === 'itemCount') {
        continue;
      }
      
      await kv.set(key, value);
      importedCount++;
    }
    
    console.log(`✅ Imported ${importedCount} items`);
    
    return c.json({
      success: true,
      importedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error importing data:", error);
    return c.json({ error: "Failed to import data", details: String(error) }, 500);
  }
});

// Get manual contact assignment for a calendar event
app.get("/make-server-a89809a8/calendar/event/:eventId/contact", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    console.log(`📖 Getting manual contact for event: ${eventId}`);
    
    const assignments = await kv.get("calendar_event_contact_assignments") || {};
    const contactId = assignments[eventId];
    
    if (contactId) {
      console.log(`✅ Found manual contact assignment: ${contactId}`);
      return c.json({ contactId });
    } else {
      console.log(`ℹ️ No manual contact assignment for this event`);
      return c.json({ contactId: null });
    }
  } catch (error) {
    console.error("❌ Error getting manual contact assignment:", error);
    return c.json({ error: "Failed to get contact assignment", details: String(error) }, 500);
  }
});

// Set manual contact assignment for a calendar event
app.post("/make-server-a89809a8/calendar/event/:eventId/contact", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const { contactId } = await c.req.json();
    
    console.log(`💾 Setting manual contact for event ${eventId}: ${contactId || 'null (remove)'}`);
    
    // Get existing assignments
    const assignments = await kv.get("calendar_event_contact_assignments") || {};
    
    // Update or remove assignment
    if (contactId) {
      assignments[eventId] = contactId;
      console.log(`✅ Assigned contact ${contactId} to event ${eventId}`);
    } else {
      delete assignments[eventId];
      console.log(`✅ Removed manual contact assignment for event ${eventId}`);
    }
    
    // Save back to KV
    await kv.set("calendar_event_contact_assignments", assignments);
    
    return c.json({ success: true, contactId });
  } catch (error) {
    console.error("❌ Error setting manual contact assignment:", error);
    return c.json({ error: "Failed to set contact assignment", details: String(error) }, 500);
  }
});

// ========================================
// FATHOM INTEGRATION (Fathom → Supabase → SpoonFlow)
// ========================================

// Main Fathom Webhook Endpoint - receives recordings from Fathom, Make.com, or Zapier
app.post("/make-server-a89809a8/fathom", async (c) => {
  try {
    const webhookData = await c.req.json();
    console.log("🔗 Received Fathom data from webhook:", JSON.stringify(webhookData, null, 2));
    
    // Extract Fathom recording ID - try all possible field names
    // Fathom native fields: video_id, id, recording_id
    const fathomId = webhookData.video_id || webhookData.recording_id || webhookData.id || webhookData.fathom_id;
    
    if (!fathomId) {
      console.error("❌ No Fathom ID provided. Available fields:", Object.keys(webhookData));
      return c.json({ 
        error: "Missing Fathom ID. Please map one of these fields: video_id, recording_id, or id",
        availableFields: Object.keys(webhookData)
      }, 400);
    }
    
    // Check if already synced (duplicate prevention)
    const existingRecording = await kv.get(`fathom_recording_${fathomId}`);
    if (existingRecording) {
      console.log(`⚠️ Recording ${fathomId} already synced at ${existingRecording.syncedAt}`);
      return c.json({ 
        success: true, 
        duplicate: true, 
        message: "Recording already synced",
        fathomId 
      });
    }
    
    // Parse action items - handle all Fathom field variations
    let actionItems = [];
    const actionItemsRaw = webhookData.action_items || webhookData.actionItems || webhookData.tasks || webhookData['Action Items'];
    
    if (actionItemsRaw) {
      if (typeof actionItemsRaw === 'string') {
        // If it's a string, try to parse as JSON or split by newlines/bullets
        try {
          actionItems = JSON.parse(actionItemsRaw);
        } catch {
          // Split by newlines and clean up common bullet formats
          actionItems = actionItemsRaw
            .split('\n')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
            .map((item: string) => {
              // Remove common bullet formats: -, *, •, numbers, checkboxes
              const cleaned = item.replace(/^[-*•\d+.)\]]\s*|\[[ x]\]\s*/i, '').trim();
              return { text: cleaned };
            })
            .filter((item: any) => item.text.length > 0);
        }
      } else if (Array.isArray(actionItemsRaw)) {
        actionItems = actionItemsRaw.map((item: any) => 
          typeof item === 'string' ? { text: item } : item
        );
      }
    }
    
    // Parse participants - handle string or array
    let participants = [];
    const participantsRaw = webhookData.participants || webhookData.attendees || webhookData['Participants'];
    if (participantsRaw) {
      if (typeof participantsRaw === 'string') {
        participants = participantsRaw.split(',').map((p: string) => p.trim()).filter(Boolean);
      } else if (Array.isArray(participantsRaw)) {
        participants = participantsRaw;
      }
    }
    
    // Store the recording with flexible field mapping for Fathom's native fields
    const recording = {
      fathomId,
      // Title variations
      title: webhookData.title || webhookData.name || webhookData.meeting_title || webhookData['Meeting Title'] || 'Untitled Meeting',
      // Time variations
      startTime: webhookData.start_time || webhookData.startTime || webhookData.created_at || webhookData.createdAt || webhookData.date || new Date().toISOString(),
      // Duration (in seconds or minutes - normalize to seconds)
      duration: webhookData.duration || webhookData.length || 0,
      // Summary/Notes variations
      summary: webhookData.summary || webhookData.notes || webhookData.description || webhookData.Summary || '',
      actionItems,
      // Transcript variations
      transcript: webhookData.transcript || webhookData.Transcript || '',
      // URL variations
      recordingUrl: webhookData.recording_url || webhookData.recordingUrl || webhookData.url || webhookData.link || webhookData.share_url || '',
      videoUrl: webhookData.video_url || webhookData.videoUrl || webhookData.recording_url || '',
      participants,
      syncedAt: new Date().toISOString(),
      matchedMeetingId: null,
      matchedContactId: null,
      source: 'webhook',
      rawData: webhookData // Store raw data for debugging
    };
    
    await kv.set(`fathom_recording_${fathomId}`, recording);
    console.log(`✅ Stored Fathom recording: ${fathomId}`);
    
    // Add to sync log
    const syncLog = await kv.get("fathom_sync_log") || { syncs: [] };
    syncLog.syncs.unshift({
      id: `sync-${Date.now()}`,
      fathomId,
      title: recording.title,
      syncedAt: recording.syncedAt,
      status: 'success',
      matched: false,
      actionItemCount: actionItems.length
    });
    
    // Keep only last 100 syncs
    if (syncLog.syncs.length > 100) {
      syncLog.syncs = syncLog.syncs.slice(0, 100);
    }
    
    await kv.set("fathom_sync_log", syncLog);
    
    // Try to auto-match with calendar events
    let matchedMeeting = null;
    try {
      const calendarEvents = await kv.getByPrefix("calendar_event_");
      const recordingDate = new Date(recording.startTime);
      
      for (const event of calendarEvents) {
        if (!event || !event.startTime) continue;
        
        const eventDate = new Date(event.startTime);
        const timeDiff = Math.abs(eventDate.getTime() - recordingDate.getTime());
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Match if within 2 hours and title similarity
        if (hoursDiff <= 2) {
          const titleMatch = event.title?.toLowerCase().includes(recording.title.toLowerCase()) ||
                           recording.title.toLowerCase().includes(event.title?.toLowerCase());
          
          if (titleMatch) {
            matchedMeeting = event;
            recording.matchedMeetingId = event.id;
            if (event.contactId) {
              recording.matchedContactId = event.contactId;
            }
            await kv.set(`fathom_recording_${fathomId}`, recording);
            
            // Update sync log
            const updatedLog = await kv.get("fathom_sync_log");
            if (updatedLog?.syncs[0]?.fathomId === fathomId) {
              updatedLog.syncs[0].matched = true;
              updatedLog.syncs[0].matchedMeetingId = event.id;
              await kv.set("fathom_sync_log", updatedLog);
            }
            
            console.log(`🎯 Auto-matched recording to calendar event: ${event.title}`);
            break;
          }
        }
      }
    } catch (matchError) {
      console.warn("⚠️ Error auto-matching recording:", matchError);
    }
    
    return c.json({ 
      success: true, 
      fathomId,
      matched: !!matchedMeeting,
      matchedMeetingId: recording.matchedMeetingId,
      actionItemCount: actionItems.length
    });
  } catch (error) {
    console.error("❌ Error processing Fathom webhook:", error);
    
    // Log the error in sync log
    try {
      const syncLog = await kv.get("fathom_sync_log") || { syncs: [] };
      syncLog.syncs.unshift({
        id: `sync-${Date.now()}`,
        fathomId: 'unknown',
        title: 'Sync Failed',
        syncedAt: new Date().toISOString(),
        status: 'error',
        error: String(error),
        matched: false
      });
      await kv.set("fathom_sync_log", syncLog);
    } catch (logError) {
      console.error("Failed to log sync error:", logError);
    }
    
    return c.json({ error: "Failed to sync Fathom recording", details: String(error) }, 500);
  }
});

// Legacy Zapier Webhook Endpoint - kept for backward compatibility
// Note: New integrations should use /fathom endpoint instead
app.post("/make-server-a89809a8/fathom/zapier-sync", async (c) => {
  console.log("⚠️ Legacy /fathom/zapier-sync endpoint called - consider using /fathom instead");
  // Reuse the same logic by creating a new request to the main handler
  const body = await c.req.json();
  const webhookData = body;
  
  try {
    const fathomId = webhookData.video_id || webhookData.recording_id || webhookData.id || webhookData.fathom_id;
    
    if (!fathomId) {
      console.error("❌ No Fathom ID provided. Available fields:", Object.keys(webhookData));
      return c.json({ 
        error: "Missing Fathom ID. Please map one of these fields: video_id, recording_id, or id",
        availableFields: Object.keys(webhookData)
      }, 400);
    }
    
    // Check if already synced (duplicate prevention)
    const existingRecording = await kv.get(`fathom_recording_${fathomId}`);
    if (existingRecording) {
      console.log(`⚠️ Recording ${fathomId} already synced at ${existingRecording.syncedAt}`);
      return c.json({ 
        success: true, 
        duplicate: true, 
        message: "Recording already synced",
        fathomId 
      });
    }
    
    // Parse action items - handle all Fathom field variations
    let actionItems = [];
    const actionItemsRaw = webhookData.action_items || webhookData.actionItems || webhookData.tasks || webhookData['Action Items'];
    
    if (actionItemsRaw) {
      if (typeof actionItemsRaw === 'string') {
        try {
          actionItems = JSON.parse(actionItemsRaw);
        } catch {
          actionItems = actionItemsRaw
            .split('\n')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
            .map((item: string) => {
              const cleaned = item.replace(/^[-*•\d+.)\]]\s*|\[[ x]\]\s*/i, '').trim();
              return { text: cleaned };
            })
            .filter((item: any) => item.text.length > 0);
        }
      } else if (Array.isArray(actionItemsRaw)) {
        actionItems = actionItemsRaw.map((item: any) => 
          typeof item === 'string' ? { text: item } : item
        );
      }
    }
    
    // Parse participants
    let participants = [];
    const participantsRaw = webhookData.participants || webhookData.attendees || webhookData['Participants'];
    if (participantsRaw) {
      if (typeof participantsRaw === 'string') {
        participants = participantsRaw.split(',').map((p: string) => p.trim()).filter(Boolean);
      } else if (Array.isArray(participantsRaw)) {
        participants = participantsRaw;
      }
    }
    
    // Store the recording
    const recording = {
      fathomId,
      title: webhookData.title || webhookData.name || webhookData.meeting_title || webhookData['Meeting Title'] || 'Untitled Meeting',
      startTime: webhookData.start_time || webhookData.startTime || webhookData.created_at || webhookData.createdAt || webhookData.date || new Date().toISOString(),
      duration: webhookData.duration || webhookData.length || 0,
      summary: webhookData.summary || webhookData.notes || webhookData.description || webhookData.Summary || '',
      actionItems,
      transcript: webhookData.transcript || webhookData.Transcript || '',
      recordingUrl: webhookData.recording_url || webhookData.recordingUrl || webhookData.url || webhookData.link || webhookData.share_url || '',
      videoUrl: webhookData.video_url || webhookData.videoUrl || webhookData.recording_url || '',
      participants,
      syncedAt: new Date().toISOString(),
      matchedMeetingId: null,
      matchedContactId: null,
      source: 'zapier-legacy',
      rawData: webhookData
    };
    
    await kv.set(`fathom_recording_${fathomId}`, recording);
    console.log(`✅ Stored Fathom recording (legacy): ${fathomId}`);
    
    // Add to sync log
    const syncLog = await kv.get("fathom_sync_log") || { syncs: [] };
    syncLog.syncs.unshift({
      id: `sync-${Date.now()}`,
      fathomId,
      title: recording.title,
      syncedAt: recording.syncedAt,
      status: 'success',
      matched: false,
      actionItemCount: actionItems.length
    });
    
    if (syncLog.syncs.length > 100) {
      syncLog.syncs = syncLog.syncs.slice(0, 100);
    }
    
    await kv.set("fathom_sync_log", syncLog);
    
    // Try to auto-match with calendar events
    let matchedMeeting = null;
    try {
      const calendarEvents = await kv.getByPrefix("calendar_event_");
      const recordingDate = new Date(recording.startTime);
      
      for (const event of calendarEvents) {
        if (!event || !event.startTime) continue;
        
        const eventDate = new Date(event.startTime);
        const timeDiff = Math.abs(eventDate.getTime() - recordingDate.getTime());
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff <= 2) {
          const titleMatch = event.title?.toLowerCase().includes(recording.title.toLowerCase()) ||
                           recording.title.toLowerCase().includes(event.title?.toLowerCase());
          
          if (titleMatch) {
            matchedMeeting = event;
            recording.matchedMeetingId = event.id;
            if (event.contactId) {
              recording.matchedContactId = event.contactId;
            }
            await kv.set(`fathom_recording_${fathomId}`, recording);
            
            const updatedLog = await kv.get("fathom_sync_log");
            if (updatedLog?.syncs[0]?.fathomId === fathomId) {
              updatedLog.syncs[0].matched = true;
              updatedLog.syncs[0].matchedMeetingId = event.id;
              await kv.set("fathom_sync_log", updatedLog);
            }
            
            console.log(`🎯 Auto-matched recording to calendar event: ${event.title}`);
            break;
          }
        }
      }
    } catch (matchError) {
      console.warn("⚠️ Error auto-matching recording:", matchError);
    }
    
    return c.json({ 
      success: true, 
      fathomId,
      matched: !!matchedMeeting,
      matchedMeetingId: recording.matchedMeetingId,
      actionItemCount: actionItems.length
    });
  } catch (error) {
    console.error("❌ Error processing Zapier Fathom sync:", error);
    
    try {
      const syncLog = await kv.get("fathom_sync_log") || { syncs: [] };
      syncLog.syncs.unshift({
        id: `sync-${Date.now()}`,
        fathomId: 'unknown',
        title: 'Sync Failed',
        syncedAt: new Date().toISOString(),
        status: 'error',
        error: String(error),
        matched: false
      });
      await kv.set("fathom_sync_log", syncLog);
    } catch (logError) {
      console.error("Failed to log sync error:", logError);
    }
    
    return c.json({ error: "Failed to sync Fathom recording", details: String(error) }, 500);
  }
});

// Get all Fathom recordings
app.get("/make-server-a89809a8/fathom/recordings", async (c) => {
  try {
    const recordings = await kv.getByPrefix("fathom_recording_");
    const sortedRecordings = recordings.sort((a: any, b: any) => 
      new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime()
    );
    return c.json({ recordings: sortedRecordings });
  } catch (error) {
    console.error("❌ Error fetching Fathom recordings:", error);
    return c.json({ error: "Failed to fetch recordings", details: String(error) }, 500);
  }
});

// Get sync log
app.get("/make-server-a89809a8/fathom/sync-log", async (c) => {
  try {
    const syncLog = await kv.get("fathom_sync_log") || { syncs: [] };
    return c.json(syncLog);
  } catch (error) {
    console.error("❌ Error fetching sync log:", error);
    return c.json({ error: "Failed to fetch sync log", details: String(error) }, 500);
  }
});

// Get webhook test log (for debugging)
app.get("/make-server-a89809a8/fathom/webhook-test-log", async (c) => {
  try {
    const testLog = await kv.get("fathom_webhook_test_log") || { webhooks: [] };
    return c.json(testLog);
  } catch (error) {
    console.error("❌ Error fetching webhook test log:", error);
    return c.json({ error: "Failed to fetch webhook test log", details: String(error) }, 500);
  }
});

// Get individual webhook test payload
app.get("/make-server-a89809a8/fathom/webhook-test/:webhookId", async (c) => {
  try {
    const webhookId = c.req.param("webhookId");
    const timestamp = webhookId.replace('webhook-', '');
    const webhookData = await kv.get(`fathom_webhook_test_${timestamp}`);
    
    if (!webhookData) {
      return c.json({ error: "Webhook not found" }, 404);
    }
    
    return c.json(webhookData);
  } catch (error) {
    console.error("❌ Error fetching webhook data:", error);
    return c.json({ error: "Failed to fetch webhook data", details: String(error) }, 500);
  }
});

// Manually match a recording to a meeting
app.post("/make-server-a89809a8/fathom/recordings/:fathomId/match", async (c) => {
  try {
    const fathomId = c.req.param("fathomId");
    const { meetingId, contactId } = await c.req.json();
    
    const recording = await kv.get(`fathom_recording_${fathomId}`);
    if (!recording) {
      return c.json({ error: "Recording not found" }, 404);
    }
    
    recording.matchedMeetingId = meetingId;
    recording.matchedContactId = contactId || null;
    await kv.set(`fathom_recording_${fathomId}`, recording);
    
    // Update sync log
    const syncLog = await kv.get("fathom_sync_log") || { syncs: [] };
    const syncEntry = syncLog.syncs.find((s: any) => s.fathomId === fathomId);
    if (syncEntry) {
      syncEntry.matched = true;
      syncEntry.matchedMeetingId = meetingId;
      await kv.set("fathom_sync_log", syncLog);
    }
    
    console.log(`✅ Manually matched recording ${fathomId} to meeting ${meetingId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error matching recording:", error);
    return c.json({ error: "Failed to match recording", details: String(error) }, 500);
  }
});

// Delete a recording
app.delete("/make-server-a89809a8/fathom/recordings/:fathomId", async (c) => {
  try {
    const fathomId = c.req.param("fathomId");
    await kv.del(`fathom_recording_${fathomId}`);
    console.log(`✅ Deleted recording: ${fathomId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting recording:", error);
    return c.json({ error: "Failed to delete recording", details: String(error) }, 500);
  }
});

// Test endpoint - verify Zapier webhook is working
app.post("/make-server-a89809a8/fathom/test-zapier", async (c) => {
  try {
    const testData = await c.req.json();
    console.log("🧪 Test webhook received:", testData);
    
    return c.json({ 
      success: true, 
      message: "Webhook endpoint is working! Check server logs for received data.",
      received: testData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Test webhook error:", error);
    return c.json({ error: "Test failed", details: String(error) }, 500);
  }
});

// ========================================
// DOCUMENTS ENDPOINTS
// ========================================

// GET documents - load all documents and folders
app.get("/make-server-a89809a8/documents", async (c) => {
  try {
    console.log("📄 GET /documents - Loading documents and folders");
    
    const documentsData = await kv.get("documents_all");
    const foldersData = await kv.get("documents_folders");
    
    console.log("📄 Documents data from KV:", documentsData);
    console.log("📄 Folders data from KV:", foldersData);
    
    const documents = documentsData || [];
    const folders = foldersData || [];
    
    console.log("✅ Returning documents:", documents.length, "folders:", folders.length);
    
    return c.json({
      success: true,
      documents,
      folders
    });
  } catch (error) {
    console.error("❌ Error loading documents:", error);
    return c.json({ 
      success: false,
      error: "Error loading documents", 
      details: String(error) 
    }, 500);
  }
});

// POST documents - save all documents and folders
app.post("/make-server-a89809a8/documents", async (c) => {
  try {
    console.log("💾 Saving documents and folders");
    
    const body = await c.req.json();
    const { documents, folders } = body;
    
    if (!documents || !folders) {
      return c.json({
        success: false,
        error: "Missing documents or folders in request body"
      }, 400);
    }
    
    // Save to KV store
    await kv.set("documents_all", documents);
    await kv.set("documents_folders", folders);
    
    console.log(`✅ Saved ${documents.length} documents and ${folders.length} folders`);
    
    return c.json({
      success: true,
      message: "Documents saved successfully",
      count: {
        documents: documents.length,
        folders: folders.length
      }
    });
  } catch (error) {
    console.error("❌ Error saving documents:", error);
    return c.json({ 
      success: false,
      error: "Error saving documents", 
      details: String(error) 
    }, 500);
  }
});

// Start server with proper error handling
Deno.serve({
  onError: (error) => {
    console.error("❌ Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}, async (req) => {
  try {
    return await app.fetch(req);
  } catch (error) {
    console.error("❌ Request handling error:", error);
    return new Response(
      JSON.stringify({ error: "Request failed", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
