import { Provider } from './apiKeys';

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Claude API error ${res.status}: ${msg}`);
  }
  const data = await res.json();
  return data.content[0].text as string;
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2000, temperature: 0.2 },
    }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini API error ${res.status}: ${msg}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text as string;
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI API error ${res.status}: ${msg}`);
  }
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function callProvider(provider: Provider, apiKey: string, prompt: string): Promise<string> {
  switch (provider) {
    case 'anthropic': return callAnthropic(apiKey, prompt);
    case 'gemini': return callGemini(apiKey, prompt);
    case 'openai': return callOpenAI(apiKey, prompt);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}
