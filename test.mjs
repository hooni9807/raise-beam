// node test.mjs — 규칙 확인 + 직업별 봇 플레이로 엔딩 밸런스 점검
import assert from 'node:assert/strict';
import * as L from './logic.js';

function seeded(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
}

{
  const s = L.newGame({}, seeded(1));
  assert.equal(s.ap, 3);
  s.cond = 50;
  L.doAction(s, 'rest', seeded(2));
  assert.equal(s.cond, 75);
  assert.ok(L.doAction(s, 'lesson').error, '라켓 없이 탁구 레슨 불가');
  assert.ok(L.chooseRacket(s, 'pen'));
  assert.equal(L.chooseRacket(s, 'shake'), false, '라켓은 한 번만');
  L.doAction(s, 'volunteer'); L.doAction(s, 'volunteer');
  assert.ok(L.doAction(s, 'volunteer').error, '일정 0칸이면 행동 불가');
  assert.ok(L.doMatch({ ...s, ap: 1 }).error, '도전은 2칸 필요');
  assert.equal(L.chooseStyle(s, 'fast'), false, '22일 전에는 전형 선택 불가');
  s.day = L.STYLE_DAY; s.ap = 3;
  assert.ok(L.doAction(s, 'rest').error, '전형 고르기 전엔 행동 불가');
  assert.ok(L.chooseStyle(s, 'fast'));
  const noRacket = L.newGame({}, seeded(1)); noRacket.day = 30;
  assert.equal(L.needsStyle(noRacket), false, '탁구 안 하면 전형 선택 없음');
  assert.equal(L.fmtNum(128000), '13만');
}

const TRAIN = { skill: 'lesson', stamina: 'run', smarts: 'study', courage: 'safety', grit: 'farm', manner: 'volunteer', craft: 'craft' };

// 목표 직업의 요구 스탯 중 가장 모자란 걸 훈련하는 봇
function play(seed, target, { country = 'kor', racket = 'shake', style = 'drive' } = {}) {
  const rng = seeded(seed);
  const s = L.newGame({ country }, rng);
  const career = L.CAREERS.find((c) => c.id === target);
  if (career.racket) L.chooseRacket(s, racket);
  while (!s.ending) {
    if (L.needsStyle(s)) L.chooseStyle(s, style);
    const req = career.req(s);
    const wantsAward = career.awards && s.awards < career.awards && L.matchChance(s) >= 0.4;
    if ((wantsAward || req[L.MATCHES[s.match].stat]) && s.stats[L.MATCHES[s.match].stat] >= L.matchNeed(s.day) - (wantsAward ? 6 : 0) && s.cond > 35) L.doMatch(s, rng);
    while (s.ap > 0) {
      const gap = Object.keys(req).sort((a, b) => s.stats[a] / req[a] - s.stats[b] / req[b])[0];
      const cnt = Object.entries(career.counts || {}).find(([k, v]) => (s.counts[k] || 0) < v);
      const key = s.cond < 35 ? 'rest'
        : s.money < 30000 || (career.money && s.money < career.money && s.day > 60) ? 'farm'
        : s.stats.manner < 30 ? 'volunteer'
        // 국가대표 아래 단계 탁구 직업은, 조건을 채우면 탁구는 그만 키운다
        : ['pro', 'coach', 'gym'].includes(target) && s.stats[gap] >= req[gap] ? (cnt ? cnt[0] : career.money && s.money < career.money ? 'farm' : 'volunteer')
        : cnt && s.stats[gap] >= req[gap] ? cnt[0]
        : TRAIN[gap];
      if (L.doAction(s, key, rng).error) L.doAction(s, 'rest', rng);
    }
    L.endDay(s, rng);
  }
  return s.ending;
}
const rateOf = (target, opts, want = target, n = 30) => {
  let hit = 0;
  for (let seed = 1; seed <= n; seed++) if ([].concat(want).includes(play(seed, target, opts))) hit++;
  return hit / n;
};

const rows = [];
for (const c of L.CAREERS) {
  const want = c.tt ? ['champion', 'runnerup'] : c.id;
  const r = rateOf(c.id, {}, want);
  rows.push({ 목표: c.name, 도달률: `${Math.round(r * 100)}%` });
  assert.ok(r >= 0.3, `${c.name} 목표 봇 도달률 ${r}`);
}
console.table(rows);

// 탁구: 라켓·전형 궁합
const tt = (racket, style) => rateOf('tt', { racket, style }, 'champion', 40);
const fastPen = tt('pen', 'fast'), fastShake = tt('shake', 'fast'), defShake = tt('shake', 'defense'), defCpen = tt('cpen', 'defense');
console.log('세계선수권 우승률', { fastPen, fastShake, defShake, defCpen });
assert.ok(fastPen > fastShake + 0.1, '전진속공은 펜홀더가 유리');
assert.ok(defShake > defCpen + 0.1, '수비형은 셰이크가 유리');

// 배드 엔딩
{
  const rng = seeded(9);
  const s = L.newGame({}, rng);
  while (!s.ending) { L.doAction(s, 'rest', rng); L.endDay(s, rng); }
  assert.equal(s.ending, 'neet', '쉬기만 하면 백수');
}
{
  const rng = seeded(9);
  const s = L.newGame({}, rng);
  while (!s.ending) { for (let i = 0; i < 3; i++) L.doAction(s, 'run', rng); L.doAction(s, 'meal', rng); L.endDay(s, rng); }
  assert.ok(L.ENDINGS[s.ending].bad, `쉬지 않고 굴리면 배드 엔딩 (${s.ending})`);
}
{
  // 돈을 버는 일 없이 쓰기만 하면 노숙자
  const rng = seeded(4);
  const s = L.newGame({}, rng);
  while (!s.ending) {
    for (const k of ['study', 'meal', 'rest']) if (L.doAction(s, k, rng).error) L.doAction(s, 'rest', rng);
    L.endDay(s, rng);
  }
  assert.equal(s.ending, 'homeless', `돈을 다 쓰면 노숙자 (${s.ending}, ${s.money}원)`);
}
console.log('엔딩 종류', L.ENDING_IDS.length);
console.log('ok');
