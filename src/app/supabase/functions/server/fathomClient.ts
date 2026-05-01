/**
 * Fathom API Client
 * Handles authentication and API calls to Fathom
 */

interface FathomTranscript {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  transcript_segments?: Array<{
    speaker: string;
    text: string;
    timestamp: number;
  }>;
  summary?: string;
  action_items?: Array<{
    text: string;
    assignee?: string;
  }>;
  participants?: Array<{
    name: string;
    email?: string;
  }>;
  recording_url?: string;
  share_url?: string;
}

interface ParsedFathomData {
  summary: string;
  thingsDiscussed: Array<{ text: string; completed: boolean }>;
  outcomes: string;
  actionItems: Array<{ text: string }>;
  questionsAnswered: Array<{
    question: string;
    answer: string;
  }>;
  recordingUrl: string;
  participants: Array<{ name: string; email?: string }>;
}

/**
 * Extract meeting ID from various Fathom URL formats
 */
export function extractFathomMeetingId(url: string): string | null {
  // Fathom URLs typically look like:
  // https://app.fathom.video/call/<meeting-id>
  // https://fathom.video/calls/<numeric-id> (desktop URL - less useful)
  // https://fathom.video/share/<share-id> (BEST - matches webhook data)
  
  try {
    const urlObj = new URL(url);
    
    // Handle /share/ URLs (PREFERRED - this matches webhook data)
    if (urlObj.pathname.includes('/share/')) {
      const parts = urlObj.pathname.split('/share/');
      return parts[1]?.split('/')[0] || null;
    }
    
    // Handle /call/ URLs (singular)
    if (urlObj.pathname.includes('/call/')) {
      const parts = urlObj.pathname.split('/call/');
      return parts[1]?.split('/')[0] || null;
    }
    
    // Handle /calls/ URLs (plural - desktop view)
    // NOTE: This numeric ID may not match webhook data - use share link instead
    if (urlObj.pathname.includes('/calls/')) {
      console.warn('⚠️ Using /calls/ URL - share link is preferred for webhook matching');
      const parts = urlObj.pathname.split('/calls/');
      return parts[1]?.split('/')[0] || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing Fathom URL:', error);
    return null;
  }
}

/**
 * Fetch transcript from Fathom API
 */
export async function fetchFathomTranscript(
  meetingId: string,
  apiKey: string
): Promise<FathomTranscript> {
  const apiUrl = `https://api.fathom.video/v1/calls/${meetingId}`;
  
  console.log(`🔍 Fetching from Fathom API: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Fathom API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Fathom API error (${response.status}):`, errorText);
      throw new Error(`Fathom API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Fathom data received successfully');
    return data;
  } catch (error) {
    // Handle network errors (DNS, connection failures, etc.)
    if (error instanceof TypeError && error.message.includes('error sending request')) {
      console.error('🌐 Network error connecting to Fathom API:', error);
      throw new Error('Unable to connect to Fathom API. Please check your internet connection or try again later.');
    }
    
    // Log the full error for debugging
    console.error('❌ Unexpected error in fetchFathomTranscript:', error);
    
    // Re-throw other errors as-is
    throw error;
  }
}

/**
 * Parse Fathom transcript into our Meeting Dossier format
 */
export function parseFathomTranscript(
  transcript: FathomTranscript
): ParsedFathomData {
  // Extract summary
  const summary = transcript.summary || generateSummaryFromSegments(
    transcript.transcript_segments || []
  );

  // Extract discussion topics (key themes from transcript)
  const thingsDiscussed = extractDiscussionTopics(
    transcript.transcript_segments || []
  );

  // Extract outcomes (decisions, agreements)
  const outcomes = extractOutcomes(transcript.transcript_segments || []);

  // Extract action items
  const actionItems = (transcript.action_items || []).map(item => ({
    text: item.text
  }));

  // Extract Q&A pairs
  const questionsAnswered = extractQuestions(
    transcript.transcript_segments || []
  );

  return {
    summary,
    thingsDiscussed,
    outcomes,
    actionItems,
    questionsAnswered,
    recordingUrl: transcript.recording_url || transcript.share_url || '',
    participants: transcript.participants || []
  };
}

/**
 * Generate summary from transcript segments
 */
function generateSummaryFromSegments(
  segments: Array<{ speaker: string; text: string; timestamp: number }>
): string {
  if (segments.length === 0) return '';

  // Concatenate first few segments to create a brief summary
  const firstSegments = segments.slice(0, 10);
  const text = firstSegments.map(s => s.text).join(' ');
  
  // Truncate to reasonable length
  return text.length > 500 ? text.substring(0, 497) + '...' : text;
}

/**
 * Extract discussion topics from transcript
 */
function extractDiscussionTopics(
  segments: Array<{ speaker: string; text: string; timestamp: number }>
): Array<{ text: string; completed: boolean }> {
  // Simple keyword-based topic extraction
  const topics = new Set<string>();
  
  const topicKeywords = [
    'discussed',
    'talked about',
    'covered',
    'reviewed',
    'went over',
    'explored'
  ];

  for (const segment of segments) {
    const lowerText = segment.text.toLowerCase();
    
    for (const keyword of topicKeywords) {
      if (lowerText.includes(keyword)) {
        // Extract sentence containing the keyword
        const sentences = segment.text.split(/[.!?]/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(keyword)) {
            const cleaned = sentence.trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
              topics.add(cleaned);
            }
          }
        }
      }
    }
  }

  // Convert to array and limit to top 10
  return Array.from(topics)
    .slice(0, 10)
    .map(text => ({ text, completed: false }));
}

/**
 * Extract outcomes/decisions from transcript
 */
function extractOutcomes(
  segments: Array<{ speaker: string; text: string; timestamp: number }>
): string {
  const outcomeKeywords = [
    'decided',
    'agreed',
    'will',
    'going to',
    'approved',
    'confirmed',
    'commitment'
  ];

  const outcomes: string[] = [];

  for (const segment of segments) {
    const lowerText = segment.text.toLowerCase();
    
    for (const keyword of outcomeKeywords) {
      if (lowerText.includes(keyword)) {
        const sentences = segment.text.split(/[.!?]/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(keyword)) {
            const cleaned = sentence.trim();
            if (cleaned.length > 10 && cleaned.length < 300) {
              outcomes.push(cleaned);
            }
          }
        }
      }
    }
  }

  // Return top 5 outcomes, joined
  return outcomes.slice(0, 5).join('. ') + (outcomes.length > 0 ? '.' : '');
}

/**
 * Extract questions and answers from transcript
 */
function extractQuestions(
  segments: Array<{ speaker: string; text: string; timestamp: number }>
): Array<{ question: string; answer: string }> {
  const qaPairs: Array<{ question: string; answer: string }> = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    
    // Check if segment contains a question
    if (segment.text.includes('?')) {
      const questions = segment.text.split('?');
      
      for (let q = 0; q < questions.length - 1; q++) {
        const question = questions[q].trim() + '?';
        
        // Get next segment as potential answer
        const nextSegment = segments[i + 1];
        if (nextSegment && nextSegment.speaker !== segment.speaker) {
          qaPairs.push({
            question,
            answer: nextSegment.text
          });
        }
      }
    }
  }

  // Return top 5 Q&A pairs
  return qaPairs.slice(0, 5);
}

/**
 * Test Fathom API connection
 */
export async function testFathomConnection(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.fathom.video/v1/calls', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Fathom connection test failed:', error);
    return false;
  }
}