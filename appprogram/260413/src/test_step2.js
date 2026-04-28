/**
 * 2단계 전체 흐름 테스트
 * 이미지 → /api/recognize → /api/recipe (임박 재료 + 식단 필터)
 */

const BASE = 'http://localhost:3000';
const IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/800px-Good_Food_Display_-_NCI_Visuals_Online.jpg';

function hr(label) {
  console.log('\n' + '═'.repeat(50));
  if (label) console.log('  ' + label);
  console.log('═'.repeat(50));
}

function ok(msg)   { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function info(msg) { console.log(`  ℹ  ${msg}`); }

/* ── STEP 0: 서버 헬스체크 ──────────────────────────────── */
hr('STEP 0 — 서버 상태 확인');
const healthRes = await fetch(BASE);
if (healthRes.ok) ok(`서버 응답 정상 (${BASE})`);
else { fail('서버 응답 없음'); process.exit(1); }

/* ── STEP 1: 이미지 → 재료 인식 ─────────────────────────── */
hr('STEP 1 — 이미지 → 재료 인식 (/api/recognize)');

process.stdout.write('  이미지 다운로드 중... ');
const imgFetch = await fetch(IMAGE_URL);
const imgBuf   = await imgFetch.arrayBuffer();
const imageBase64 = 'data:image/jpeg;base64,' + Buffer.from(imgBuf).toString('base64');
console.log(`완료 (${Math.round(imageBase64.length * 3/4/1024)} KB)`);

const t1 = Date.now();
const recogRes = await fetch(`${BASE}/api/recognize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageBase64 }),
});
const recogData = await recogRes.json();
const elapsed1  = ((Date.now() - t1) / 1000).toFixed(1);

if (!recogRes.ok) { fail(recogData.error); process.exit(1); }
ok(`응답 수신 (${elapsed1}초) — 모델: ${recogData.model}`);
ok(`재료 ${recogData.ingredients.length}개 인식`);

console.log('\n  인식된 재료:');
recogData.ingredients.forEach((item, i) => {
  const qty = item.quantity ? ` (${item.quantity})` : '';
  console.log(`    ${String(i+1).padStart(2)}. ${item.name}${qty}`);
});

/* ── STEP 2-A: 레시피 추천 (임박 재료 없음, 필터 없음) ──── */
hr('STEP 2-A — 레시피 추천 (기본)');

// 앞 5개 재료로 테스트
const baseIngredients = recogData.ingredients.slice(0, 5).map(i => ({ ...i, urgent: false }));
info(`사용 재료: ${baseIngredients.map(i => i.name).join(', ')}`);

const t2a = Date.now();
const recipeResA = await fetch(`${BASE}/api/recipe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ingredients: baseIngredients, filters: [] }),
});
const recipeDataA = await recipeResA.json();
const elapsed2a   = ((Date.now() - t2a) / 1000).toFixed(1);

if (!recipeResA.ok) { fail(recipeDataA.error); }
else {
  ok(`응답 수신 (${elapsed2a}초) — 모델: ${recipeDataA.model}`);
  ok(`레시피 ${recipeDataA.recipes.length}개 생성`);
  console.log();
  recipeDataA.recipes.forEach((r, i) => {
    console.log(`  [${i+1}] ${r.name}`);
    console.log(`      시간: ${r.time} | 난이도: ${r.difficulty} | 활용률: ${r.usageRate}%`);
    console.log(`      재료: ${(r.usedIngredients || []).join(', ')}`);
  });
}

/* ── STEP 2-B: 레시피 추천 (임박 재료 포함) ─────────────── */
hr('STEP 2-B — 레시피 추천 (임박 재료 우선)');

const urgentIngredients = recogData.ingredients.slice(0, 6).map((item, i) => ({
  ...item,
  urgent: i < 2,   // 앞 2개를 임박 처리
}));
const urgentNames = urgentIngredients.filter(i => i.urgent).map(i => i.name);
info(`임박 재료: ${urgentNames.join(', ')}`);

const t2b = Date.now();
const recipeResB = await fetch(`${BASE}/api/recipe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ingredients: urgentIngredients, filters: [] }),
});
const recipeDataB = await recipeResB.json();
const elapsed2b   = ((Date.now() - t2b) / 1000).toFixed(1);

if (!recipeResB.ok) { fail(recipeDataB.error); }
else {
  ok(`응답 수신 (${elapsed2b}초) — 모델: ${recipeDataB.model}`);
  ok(`레시피 ${recipeDataB.recipes.length}개 생성`);
  console.log();

  let urgentFirst = false;
  recipeDataB.recipes.forEach((r, i) => {
    const usesUrgent = (r.usedIngredients || []).some(n => urgentNames.includes(n));
    if (i === 0 && usesUrgent) urgentFirst = true;
    const flag = usesUrgent ? ' ⚠️ 임박 재료 활용' : '';
    console.log(`  [${i+1}] ${r.name}${flag}`);
    console.log(`      시간: ${r.time} | 난이도: ${r.difficulty} | 활용률: ${r.usageRate}%`);
  });
  if (urgentFirst) ok('임박 재료 활용 레시피가 1번에 배치됨 ✓');
  else info('임박 재료 레시피 순서 확인 필요');
}

/* ── STEP 2-C: 식단 필터 적용 ───────────────────────────── */
hr('STEP 2-C — 레시피 추천 (채식 필터)');
info('필터: 채식');

const t2c = Date.now();
const recipeResC = await fetch(`${BASE}/api/recipe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ingredients: baseIngredients, filters: ['채식'] }),
});
const recipeDataC = await recipeResC.json();
const elapsed2c   = ((Date.now() - t2c) / 1000).toFixed(1);

if (!recipeResC.ok) { fail(recipeDataC.error); }
else {
  ok(`응답 수신 (${elapsed2c}초) — 모델: ${recipeDataC.model}`);
  ok(`레시피 ${recipeDataC.recipes.length}개 생성`);
  recipeDataC.recipes.forEach((r, i) => {
    console.log(`  [${i+1}] ${r.name} (${r.time}, ${r.difficulty})`);
  });
}

/* ── 최종 요약 ───────────────────────────────────────────── */
hr('최종 결과 요약');
ok(`STEP 1  재료 인식: ${recogData.ingredients.length}개`);
ok(`STEP 2-A 기본 레시피: ${recipeDataA.recipes?.length ?? 0}개`);
ok(`STEP 2-B 임박 우선 레시피: ${recipeDataB.recipes?.length ?? 0}개`);
ok(`STEP 2-C 채식 필터 레시피: ${recipeDataC.recipes?.length ?? 0}개`);
console.log();
info(`브라우저: ${BASE}`);
console.log();
