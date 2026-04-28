import 'dotenv/config';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in .env');
}

const BASE_URL = 'https://openrouter.ai/api/v1';

async function callAPI(model, messages) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 텍스트 채팅 요청
 * @param {string} model
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
export function chat(model, messages) {
  return callAPI(model, messages);
}

/**
 * 이미지 + 텍스트 멀티모달 요청
 * @param {string} model
 * @param {string} imageUrl - 공개 접근 가능한 이미지 URL
 * @param {string} prompt - 이미지에 대한 질문
 * @returns {Promise<string>}
 */
export function chatWithImage(model, imageUrl, prompt) {
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: prompt },
      ],
    },
  ];
  return callAPI(model, messages);
}
