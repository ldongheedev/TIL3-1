import { chat, chatWithImage } from './openrouter.js';

// 사용할 모델
const TEXT_MODEL  = 'google/gemma-3-27b-it:free';
const IMAGE_MODEL = 'google/gemma-3-27b-it:free';

// ── 예제 1: 텍스트 생성 ─────────────────────────────────────────
const textResult = await chat(TEXT_MODEL, [
  { role: 'user', content: '파이썬으로 피보나치 수열을 출력하는 코드를 작성해줘.' },
]);
console.log('[텍스트 생성]\n', textResult);

// ── 예제 2: 대화 이어가기 (멀티턴) ─────────────────────────────
const conversation = [
  { role: 'user',      content: '오늘 점심 메뉴 추천해줘.' },
  { role: 'assistant', content: '비빔밥은 어떠세요? 영양도 풍부하고 맛있어요.' },
  { role: 'user',      content: '채식주의자인데 괜찮을까?' },
];
const followUp = await chat(TEXT_MODEL, conversation);
console.log('\n[멀티턴 대화]\n', followUp);

// ── 예제 3: 이미지 인식 ─────────────────────────────────────────
const imageResult = await chatWithImage(
  IMAGE_MODEL,
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800',
  '이 이미지에 무엇이 있나요? 한국어로 설명해주세요.'
);
console.log('\n[이미지 인식]\n', imageResult);
