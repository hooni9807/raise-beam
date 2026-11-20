// node test.mjs — 규칙 확인 + 직업별 봇 플레이로 엔딩 밸런스 점검
import assert from 'node:assert/strict';
import * as L from './logic.js';
import { existsSync } from 'node:fs';

assert.equal(L.newGame().gender, 'male');
assert.equal(L.newGame({ gender: 'female' }).gender, 'female');
for (const root of ['img', 'img/female']) {
  const checkArt = path => assert.ok(existsSync(new URL(`./${root}/${path}.webp`, import.meta.url)), `${root}/${path}`);
  for (const stage of L.STAGES) {
    checkArt(`stages/${stage.id}`);
    checkArt(`stages/yawn/${stage.id}`);
    for (const face of ['focus', 'determined', 'praised', 'victory', 'defeat', 'sick', 'relaxed', 'surprised']) {
      checkArt(`situations/${stage.id}/${face}`);
    }
  }
  for (const id of L.ENDING_IDS) {
    checkArt(`endings/${id}`);
    checkArt(`endings/yawn/${id}`);
  }
}

function seeded(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
}

{
  const s = L.newGame({}, seeded(1));
  assert.equal(s.ap, 3);
  s.cond = 50;
  L.doAction(s, 'rest', seeded(2));
  assert.equal(s.cond, 75);
  assert.ok(!L.doAction(s, 'lesson').error);
  assert.ok(!L.doAction(s, 'teach').error);
  assert.ok(L.doAction(s, 'league').error);
  assert.equal(L.clubVisits(s), 2);
  assert.equal(L.fmtNum(128000), '13만');
}

const TRAIN = { skill: 'lesson', stamina: 'run', smarts: 'study', courage: 'safety', grit: 'farm', manner: 'volunteer', craft: 'craft' };

// 목표 직업의 요구 스탯 중 가장 모자란 걸 훈련하는 봇
function play(seed, target, { country = 'kor' } = {}) {
  const rng = seeded(seed);
  const s = L.newGame({ country }, rng);
  const career = L.CAREERS.find((c) => c.id === target);
  while (!s.ending) {
    const req = career.req(s);
    const wantsAward = career.awards && s.awards < career.awards && L.matchChance(s) >= 0.4;
    if ((wantsAward || req[L.MATCHES[s.match].stat]) && s.stats[L.MATCHES[s.match].stat] >= L.matchNeed(s.day) - (wantsAward ? 6 : 0) && s.cond > 35) L.doMatch(s, rng);
    while (s.ap > 0) {
      const gap = Object.keys(req).sort((a, b) => s.stats[a] / req[a] - s.stats[b] / req[b])[0];
      const cnt = Object.entries(career.counts || {}).find(([k, v]) => (s.counts[k] || 0) < v);
      const key = s.cond < 35 ? 'rest'
        : s.money < 30000 || (career.money && s.money < career.money && s.day > 60) ? 'farm'
        : s.stats.manner < 30 ? 'volunteer'
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

// 같은 84일 동안 서로 다른 탁구 일정을 반복한다.
for (const [target, routine] of Object.entries({
  cleaner: ['lesson'], coach: ['teach'], gym: ['lesson', 'teach', 'league'],
  pro: ['lesson', 'league'],
})) {
  const rng = seeded(2);
  const s = L.newGame({}, rng);
  let turns = 0;
  while (!s.ending) {
    const done = target === 'cleaner' ? turns >= 6 : target === 'pro' && (s.counts.league || 0) >= 14;
    let action = 'rest';
    if (s.stats.manner < 22) action = 'volunteer';
    else if (s.cond > 40 && !done) {
      action = routine[turns % routine.length];
      if (s.money < 20000 || (target === 'gym' && s.money < 350000)) action = 'farm';
    }
    // 선수는 어른이 될 때까지 레슨으로 실력을 보강한다.
    if (done && target === 'pro' && s.stats.skill < 55 && s.cond > 40) action = s.money < 20000 ? 'farm' : 'lesson';
    assert.ok(!L.doAction(s, action, rng).error);
    if (L.CLUB[action]) turns++;
    if (!s.ap) L.endDay(s, rng);
  }
  assert.equal(s.ending, target);
}
{
  const s = L.newGame();
  s.stats.manner = 60; s.stats.skill = 85; s.points = 160000;
  s.counts = { lesson: 12, league: 18 };
  assert.equal(L.decideEnding(s, () => 0), 'champion');
  assert.equal(L.decideEnding(s, () => 1), 'runnerup');
}

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
