/**
 * 1단계 기능 테스트
 * - 이미지 URL → base64 변환
 * - OpenRouter API 이미지 인식 호출
 * - 재료 목록 JSON 파싱 검증
 */
import 'dotenv/config';

// PRD 지정 모델 → 폴백 순서
const MODELS = [
  'google/gemma-3-27b-it:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
];
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 테스트용 식재료 이미지 (NCI 공개 도메인)
const TEST_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/800px-Good_Food_Display_-_NCI_Visuals_Online.jpg';

const PROMPT = `이 냉장고 사진에서 보이는 식재료를 모두 파악해주세요.
반드시 다음 JSON 배열 형식으로만 응답하세요. 설명이나 다른 텍스트 없이 JSON만 반환하세요:
[{"name": "재료명", "quantity": "수량 또는 상태"}]
재료명은 한국어로, quantity는 "2개", "조금", "반 병" 처럼 간략하게 표현하세요.`;

function parseIngredients(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return { ok: true, items: parsed };
    } catch (_) {}
  }
  // fallback
  const items = text.split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.length > 0)
    .map(l => ({ name: l, quantity: '' }));
  return { ok: false, items };
}

async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const type = res.headers.get('content-type') || 'image/jpeg';
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${type};base64,${base64}`;
}

async function runTest() {
  console.log('══════════════════════════════════════');
  console.log('   1단계 기능 테스트: 냉장고 재료 인식');
  console.log('══════════════════════════════════════\n');

  // 1) API 키 확인
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log(`[1] API 키 확인 ... ${apiKey ? '✅ 로드됨' : '❌ 없음'}`);
  if (!apiKey) process.exit(1);

  // 2) 이미지 Base64 변환
  process.stdout.write('[2] 테스트 이미지 다운로드 및 Base64 변환 ... ');
  let imageBase64;
  try {
    imageBase64 = await fetchImageAsBase64(TEST_IMAGE_URL);
    const kb = Math.round(imageBase64.length * 3 / 4 / 1024);
    console.log(`✅ ${kb} KB`);
  } catch (e) {
    console.log('❌', e.message);
    process.exit(1);
  }

  // 3) OpenRouter API 호출 (모델 순차 폴백)
  let rawText;
  let usedModel;
  for (const model of MODELS) {
    process.stdout.write(`[3] OpenRouter API 호출 (${model}) ... `);
    const startTime = Date.now();
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageBase64 } },
              { type: 'text', text: PROMPT },
            ],
          }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.log(`❌ ${err?.error?.message || `HTTP ${res.status}`}`);
        continue;
      }
      const data = await res.json();
      rawText = data.choices[0].message.content.trim();
      usedModel = model;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ ${elapsed}초`);
      break;
    } catch (e) {
      console.log('❌', e.message);
    }
  }
  if (!rawText) {
    console.log('\n모든 모델이 실패했습니다. 잠시 후 다시 시도해주세요.');
    process.exit(1);
  }

  // 4) JSON 파싱
  process.stdout.write('[4] 재료 목록 파싱 ... ');
  const { ok, items } = parseIngredients(rawText);
  console.log(ok ? `✅ JSON 파싱 성공 (${items.length}개 재료)` : `⚠️  Fallback 파싱 (${items.length}개)`);

  // 5) 결과 출력
  console.log('\n──────────────────────────────────────');
  console.log(`📋 인식된 재료 목록 (모델: ${usedModel}):`);
  console.log('──────────────────────────────────────');
  items.forEach((item, i) => {
    const qty = item.quantity ? ` (${item.quantity})` : '';
    console.log(`  ${String(i + 1).padStart(2)}. ${item.name}${qty}`);
  });

  console.log('\n──────────────────────────────────────');
  console.log(`✅ 완료: ${items.length}개 재료 인식`);
  console.log('──────────────────────────────────────');
}

runTest();
