/**
 * Jamie AI - Extract meeting data from transcript text OR Fathom URL
 * Uses webhook data or OpenAI to analyze meeting transcripts and extract structured data
 */

import { Context } from 'npm:hono';
import { extractFathomMeetingId, fetchFathomTranscript, parseFathomTranscript } from './fathomClient.ts';
import * as kv from './kv_store.tsx';

export const handleJamieExtractFromFathom = async (c: Context) => {
  try {
    const { fathomUrl } = await c.req.json();

    if (!fathomUrl) {
      return c.json({ error: "fathomUrl is required" }, 400);
    }

    // Extract meeting ID from URL
    const meetingId = extractFathomMeetingId(fathomUrl);
    
    if (!meetingId) {
      return c.json({ 
        error: "Invalid Fathom URL", 
        message: "Could not extract meeting ID from URL. Please check the URL format."
      }, 400);
    }

    console.log(`🔍 Looking for Fathom webhook data for meeting: ${meetingId}`);

    // Try to get webhook data from KV store
    try {
      const webhookDataStr = await kv.get(`fathom:webhook:${meetingId}`);
      
      if (webhookDataStr) {
        console.log('✅ Found webhook data in KV store');
        const webhookData = JSON.parse(webhookDataStr);
        
        // Parse the webhook data into our format
        const parsed = parseFathomWebhookData(webhookData);
        
        return c.json({
          success: true,
          data: parsed,
          source: 'webhook'
        });
      }
    } catch (kvError) {
      console.error('❌ Error reading from KV store:', kvError);
    }

    // Webhook data not found - instruct user to wait or paste manually
    console.log('⚠️ No webhook data found yet');
    
    // Get all webhook IDs for debugging
    const allWebhookKeys = await kv.getByPrefix('fathom:webhook:');
    const availableIds = allWebhookKeys.map(entry => {
      try {
        const key = entry.key.replace('fathom:webhook:', '');
        return key;
      } catch {
        return null;
      }
    }).filter(Boolean);

    const availableShareUrls = allWebhookKeys.map(entry => {
      try {
        const data = JSON.parse(entry.value);
        return data.share_url || data.shareUrl || null;
      } catch {
        return null;
      }
    }).filter(Boolean);

    return c.json({
      error: "Webhook data not available yet",
      message: `Webhook not found for this meeting. Extracted ID from URL: ${meetingId}\n\nTry pasting the Share URL instead of the meeting URL. Share URLs look like:\nhttps://fathom.video/share/zhqra/3t-1BEV8bEutzCAxbiWJYiyzBjRXbqyjbd\n\nThere's 1 URL printed on the Fathom summary - try using the Share URL.`,
      debugInfo: {
        extractedId: meetingId,
        lookupKey: `fathom:webhook:${meetingId}`,
        totalWebhooks: allWebhookKeys.length,
        availableIds: availableIds.slice(0, 10),
        availableShareUrls: availableShareUrls.slice(0, 5),
      },
      instructions: [
        "Wait 30-60 seconds after the meeting ends for Fathom to process",
        "Try clicking 'Fetch Fathom Notes' again",
        "Or manually paste the transcript/summary below"
      ]
    }, 404);

  } catch (error) {
    console.error("❌ Error in handleJamieExtractFromFathom:", error);
    return c.json({ 
      error: "Failed to fetch Fathom data",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      instructions: [
        "Check that your Fathom webhook is configured correctly",
        "Wait a few moments and try again",
        "Or manually paste your meeting notes below"
      ]
    }, 500);
  }
};

export async function handleJamieExtract(c: Context) {
  try {
    const { transcript } = await c.req.json();

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return c.json({ error: 'Transcript text is required' }, 400);
    }

    console.log('📝 Jamie Extract - Received transcript length:', transcript.length);
    console.log('📝 First 200 chars:', transcript.substring(0, 200));

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      return c.json({ 
        error: 'Gemini API key not configured',
        message: 'Contact your administrator to set up the Gemini API key'
      }, 500);
    }

    console.log('✅ Gemini API key found, making request...');

    // Use Gemini to analyze the meeting transcript
    const requestBody = {
      contents: [{
        parts: [{
          text: `You are Jamie, an AI assistant that helps extract structured information from meeting transcripts and summaries.

Your task is to analyze the meeting text and extract:
1. A concise summary (2-3 sentences max)
2. Discussion topics (key themes or subjects talked about)
3. Outcomes and decisions (what was decided or concluded)
4. Action items (tasks that need to be done)

Return your response as a JSON object with this exact structure:
{
  "summary": "Brief meeting summary",
  "outcomes": "Key outcomes and decisions",
  "thingsDiscussed": [
    { "text": "Topic 1", "completed": false },
    { "text": "Topic 2", "completed": false }
  ],
  "actionItems": [
    { "text": "Action item 1" },
    { "text": "Action item 2" }
  ]
}

Be concise and specific. Extract only what's clearly stated in the meeting text.

Please analyze this meeting transcript/summary and extract the structured information:

${transcript}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    };

    console.log('📤 Sending request to Gemini...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('📥 Gemini response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error status:', response.status);
      console.error('❌ Gemini API error body:', errorText);
      console.error('❌ Gemini response headers:', Object.fromEntries(response.headers.entries()));
      
      // Try to parse error details
      let errorDetails = 'Unknown error';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error?.message || errorText;
      } catch {
        errorDetails = errorText;
      }
      
      return c.json({ 
        error: 'Failed to analyze meeting text',
        message: response.status === 429 
          ? 'Rate limit exceeded - please wait a moment and try again' 
          : 'The AI service encountered an error. Please try again or contact support.',
        technicalDetails: errorDetails,
        statusCode: response.status
      }, 500);
    }

    const result = await response.json();
    console.log('✅ Gemini response received');
    
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('❌ No content in Gemini response:', result);
      return c.json({ 
        error: 'No response from AI',
        message: 'The AI did not return any analysis'
      }, 500);
    }

    console.log('📝 Gemini content length:', content.length);

    // Parse the JSON response
    const extractedData = JSON.parse(content);
    console.log('✅ Successfully extracted data:', {
      summaryLength: extractedData.summary?.length,
      outcomesLength: extractedData.outcomes?.length,
      thingsDiscussedCount: extractedData.thingsDiscussed?.length,
      actionItemsCount: extractedData.actionItems?.length
    });

    return c.json({
      success: true,
      data: {
        summary: extractedData.summary || '',
        outcomes: extractedData.outcomes || '',
        thingsDiscussed: extractedData.thingsDiscussed || [],
        actionItems: extractedData.actionItems || [],
      }
    });

  } catch (error) {
    console.error('❌ Error in Jamie extract:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ 
      error: 'Failed to process meeting text',
      message: error instanceof Error ? error.message : 'Unknown error',
      technicalDetails: String(error)
    }, 500);
  }
}

// Helper function to parse Fathom webhook data
function parseFathomWebhookData(webhookData: any) {
  return {
    summary: webhookData.summary || '',
    transcript: webhookData.transcript || '',
    outcomes: webhookData.outcomes || '',
    thingsDiscussed: webhookData.things_discussed || [],
    actionItems: webhookData.action_items || [],
    recordingUrl: webhookData.recording_url || webhookData.fathom_url || ''
  };
}