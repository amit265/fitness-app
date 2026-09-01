import { APP_CONFIG } from '../../constants/appConfig';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'groq/compound',
];

/**
 * Direct client-side Groq API completion wrapper.
 */
export async function callGroqAPI(
  userPrompt: string,
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Groq API Key is missing. Add it in Settings.');
  }

  const endpoint = APP_CONFIG.groqEndpoint;
  const candidates = [
    APP_CONFIG.groqModel,
    ...GROQ_MODELS.filter((m) => m !== APP_CONFIG.groqModel),
  ];

  let lastError: any = null;

  for (const model of candidates) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsedErr;
        try {
          parsedErr = JSON.parse(errText);
        } catch {
          parsedErr = null;
        }
        
        const errMsg = parsedErr?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      
      if (!reply) {
        throw new Error('Received an empty response from Groq AI.');
      }

      return reply;
    } catch (error: any) {
      console.warn(`Groq API call failed with model "${model}", trying fallback... Error:`, error.message || error);
      lastError = error;
    }
  }

  throw new Error(`Groq API failed. Last error: ${lastError?.message || lastError || 'Unknown error'}`);
}

/**
 * Dynamic chat helper for Aura Coach conversation.
 * It takes an array of messages and returns a plain text response.
 */
export async function callGroqChatAPI(
  messages: GroqMessage[],
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Groq API Key is missing.');
  }

  const endpoint = APP_CONFIG.groqEndpoint;
  const candidates = [
    APP_CONFIG.groqModel,
    ...GROQ_MODELS.filter((m) => m !== APP_CONFIG.groqModel),
  ];

  let lastError: any = null;

  for (const model of candidates) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsedErr;
        try {
          parsedErr = JSON.parse(errText);
        } catch {
          parsedErr = null;
        }
        const errMsg = parsedErr?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      
      if (!reply) {
        throw new Error('Empty response from coach.');
      }

      return reply;
    } catch (error: any) {
      console.warn(`Groq Chat API call failed with model "${model}", trying fallback... Error:`, error.message || error);
      lastError = error;
    }
  }

  throw new Error(`Groq Chat API failed. Last error: ${lastError?.message || lastError || 'Unknown error'}`);
}
