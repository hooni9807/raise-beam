// node test.mjs — 규칙 확인 + 봇 플레이로 밸런스 점검
import assert from 'node:assert/strict';
import * as L from './logic.js';

// 고정 시드 난수
function seeded(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
}

{
  const s = L.newGame('빔', '엄마', seeded(1));
  assert.equal(s.ap, 3);
  s.cond = 50;
  L.doAction(s, 'rest', seeded(2));
  assert.equal(s.cond, 75);
  assert.equal(s.ap, 2);
  L.doAction(s, 'study'); L.doAction(s, 'study');
  assert.ok(L.doAction(s, 'study').error, '일정 0칸이면 행동 불가');
  s.money = 0; s.ap = 3;
  assert.ok(L.doAction(s, 'acting').error, '돈 없으면 연기 수업 불가');
  assert.ok(L.doShoot({ ...s, ap: 1 }).error, '촬영은 2칸 필요');
  assert.equal(L.fmtFans(128000), '13만');
  assert.equal(L.fmtFans(12800), '1.3만');
  assert.equal(L.ageOf(1), 1);
  assert.equal(L.stageOf(64).id, 'adult');
}

// 무작정 쉬기만 하면 평범한 엔딩
{
  const rng = seeded(3);
  const s = L.newGame('빔', '엄마', rng);
  while (!s.ending) { L.doAction(s, 'rest', rng); L.endDay(s, rng); }
  assert.equal(s.ending, 'normal');
}

// 배우 루트 봇: 국민배우에 도달할 수 있어야 함
const counts = {};
for (let seed = 1; seed <= 40; seed++) {
  const rng = seeded(seed);
  const s = L.newGame('빔', '엄마', rng);
  while (!s.ending) {
    if (s.stats[L.SHOOTS[s.shoot].stat] >= L.shootNeed(s.day) && s.cond > 35) L.doShoot(s, rng);
    while (s.ap > 0) {
      const key = s.cond < 35 ? 'rest'
        : s.money < 25000 ? 'job'
        : s.stats.manner < 55 && s.day % 3 === 0 ? 'volunteer'
        : s.stats.charm < 50 && s.day % 4 === 0 ? 'workout'
        : 'acting';
      if (L.doAction(s, key, rng).error) L.doAction(s, 'rest', rng);
    }
    L.endDay(s, rng);
    L.newUnlocks(s);
  }
  counts[s.ending] = (counts[s.ending] || 0) + 1;
}
console.log('배우 루트 봇 엔딩 분포:', counts);
assert.ok(counts.national >= 20, '배우 루트 봇 절반 이상은 국민배우여야 함');
console.log('ok');
