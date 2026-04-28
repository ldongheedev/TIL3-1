import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app  = express();
const PORT = 3000;
const ROOT = path.resolve(fileURLToPath(import.meta.url), '..');

const API_KEY       = process.env.OPENROUTER_API_KEY;
const OPENROUTER    = 'https://openrouter.ai/api/v1/chat/completions';

// 모델 폴백 목록
const VISION_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'google/gemma-3-12b-it:free',
];
const TEXT_MODELS = [
  'qwen/qwen3-coder:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

if (!API_KEY) { console.error('OPENROUTER_API_KEY 없음'); process.exit(1); }

app.use(express.json({ limit: '20mb' }));
app.use(express.static(ROOT));

// ── JSON 파싱 (마크다운 코드블록 래핑 포함 처리) ──────────────
function extractJSON(text) {
  // ```json ... ``` 또는 ``` ... ``` 블록 제거
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const candidates = [text, stripped];
  for (const src of candidates) {
    const match = src.match(/\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) {}
    }
  }
  return null;
}

// ── 공통 API 호출 (폴백 포함) ─────────────────────────────────
async function callWithFallback(models, messages) {
  let dailyLimitHit = false;

  for (const model of models) {
    const res  = await fetch(OPENROUTER, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages }),
    });
    if (res.ok) {
      const data = await res.json();
      return { text: data.choices[0].message.content.trim(), model };
    }

    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || '';
    console.log(`[skip] ${model}: ${msg.slice(0, 80)}`);
    if (msg.includes('free-models-per-day')) dailyLimitHit = true;
  }

  if (dailyLimitHit) {
    throw new Error(
      '오늘의 무료 호출 한도를 초과했습니다. ' +
      'OpenRouter 무료 플랜은 하루 200회 한도가 있습니다. ' +
      '내일 자정(UTC) 이후에 다시 시도하거나, openrouter.ai에서 크레딧을 충전하세요.'
    );
  }
  throw new Error('모든 모델이 일시적으로 사용 불가합니다. 잠시 후(수 분) 다시 시도해주세요.');
}

// ── /api/recognize ────────────────────────────────────────────
app.post('/api/recognize', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: '이미지가 없습니다.' });

  try {
    const prompt = `이 냉장고 사진에서 보이는 식재료를 모두 파악해주세요.
반드시 다음 JSON 배열 형식으로만 응답하세요. 설명이나 다른 텍스트 없이 JSON만 반환하세요:
[{"name": "재료명", "quantity": "수량 또는 상태"}]
재료명은 한국어로, quantity는 "2개", "조금", "반 병" 처럼 간략하게 표현하세요.`;

    const { text, model } = await callWithFallback(VISION_MODELS, [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageBase64 } },
        { type: 'text', text: prompt },
      ],
    }]);

    let ingredients = extractJSON(text) || [];
    if (ingredients.length === 0) {
      ingredients = text.split('\n')
        .map(l => l.replace(/^[-*•\d.]\s*/, '').trim()).filter(Boolean)
        .map(name => ({ name, quantity: '' }));
    }

    res.json({ ingredients, model });
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

// ── /api/recipe ───────────────────────────────────────────────
app.post('/api/recipe', async (req, res) => {
  const { ingredients, filters } = req.body;
  if (!ingredients?.length) return res.status(400).json({ error: '재료가 없습니다.' });

  const urgentList  = ingredients.filter(i => i.urgent);
  const normalList  = ingredients.filter(i => !i.urgent);
  const total       = ingredients.length;

  const ingredientText = [
    ...urgentList.map(i => `- ${i.name}${i.quantity ? ` (${i.quantity})` : ''} ⚠️임박`),
    ...normalList.map(i => `- ${i.name}${i.quantity ? ` (${i.quantity})` : ''}`),
  ].join('\n');

  const filterText = filters?.length
    ? `\n식단 제한: ${filters.join(', ')}`
    : '';

  const prompt = `당신은 요리 전문가입니다. 아래 재료로 만들 수 있는 레시피 4개를 추천해주세요.${filterText}

재료 목록 (총 ${total}개):
${ingredientText}

다음 JSON 형식으로만 응답하세요. 설명 없이 JSON 배열만 반환하세요:
[
  {
    "name": "요리명",
    "time": "조리시간(예: 20분)",
    "difficulty": "쉬움 또는 보통 또는 어려움",
    "usedIngredients": ["사용재료1", "사용재료2"],
    "steps": ["1단계 설명", "2단계 설명", "3단계 설명"],
    "usageRate": 75
  }
]

규칙:
- ⚠️임박 표시 재료를 포함한 레시피를 배열 앞쪽에 배치
- usageRate: 전체 재료(${total}개) 중 이 레시피에서 사용하는 비율 (0~100 정수)
- steps: 3~5단계로 간결하게
- 식단 제한 조건을 반드시 충족`;

  try {
    const { text, model } = await callWithFallback(TEXT_MODELS, [
      { role: 'user', content: prompt },
    ]);

    const recipes = extractJSON(text) || [];
    if (!recipes.length) {
      console.error('[recipe parse fail] raw:', text.slice(0, 300));
      return res.status(500).json({ error: '레시피 파싱 실패. 다시 시도해주세요.' });
    }

    res.json({ recipes, model });
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
