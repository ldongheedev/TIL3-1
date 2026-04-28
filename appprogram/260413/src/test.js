import { chat, chatWithImage } from './openrouter.js';

const TEXT_MODEL  = 'openai/gpt-oss-20b:free';
const IMAGE_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

const TEST_IMAGE_URL =
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800';

async function testText() {
  console.log('=== 텍스트 생성 테스트 ===');
  console.log(`모델: ${TEXT_MODEL}`);
  try {
    const reply = await chat(TEXT_MODEL, [
      { role: 'user', content: '대한민국의 수도는 어디이며, 인구는 얼마나 되나요? 2~3문장으로 답해주세요.' },
    ]);
    console.log('✅ 성공');
    console.log('응답:', reply);
  } catch (e) {
    console.log('❌ 실패:', e.message);
  }
}

async function testImage() {
  console.log('\n=== 이미지 인식 테스트 ===');
  console.log(`모델: ${IMAGE_MODEL}`);
  console.log(`이미지: ${TEST_IMAGE_URL}`);
  try {
    const reply = await chatWithImage(
      IMAGE_MODEL,
      TEST_IMAGE_URL,
      '이 이미지에 무엇이 있나요? 한국어로 설명해주세요.'
    );
    console.log('✅ 성공');
    console.log('응답:', reply);
  } catch (e) {
    console.log('❌ 실패:', e.message);
  }
}

console.log('OpenRouter API 테스트 시작\n');
await testText();
await testImage();
console.log('\n테스트 완료');
