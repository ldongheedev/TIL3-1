import { chat } from './openrouter.js';

const reply = await chat('openai/gpt-4o-mini', [
  { role: 'user', content: '안녕하세요! 간단히 자기소개 해주세요.' },
]);

console.log(reply);
