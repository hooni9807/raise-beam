// node test.mjs — 규칙 확인 + 분기별 봇 플레이로 밸런스 점검
import assert from 'node:assert/strict';
import * as L from './logic.js';

function seeded(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
}

{
  const s = L.newGame({}, seeded(1));
  assert.equal(s.ap, 3);
  assert.ok(s.stats.mental >= 14, '대한민국 시작 보너스: 멘탈');
  s.cond = 50;
  L.doAction(s, 'rest', seeded(2));
  assert.equal(s.cond, 75);
  assert.equal(s.ap, 2);
  L.doAction(s, 'analysis'); L.doAction(s, 'analysis');
  assert.ok(L.doAction(s, 'analysis').error, '일정 0칸이면 행동 불가');
  s.money = 0; s.ap = 3;
  assert.ok(L.doAction(s, 'lesson').error, '돈 없으면 레슨 불가');
  assert.ok(L.doMatch({ ...s, ap: 1 }).error, '경기는 2칸 필요');
  assert.equal(L.chooseStyle(s, 'drive'), false, '22일 전에는 전형 선택 불가');
  s.day = L.STYLE_DAY;
  assert.ok(L.doAction(s, 'rest').error, '전형 고르기 전엔 행동 불가');
  assert.ok(L.chooseStyle(s, 'drive'));
  assert.equal(L.chooseStyle(s, 'fast'), false, '전형은 한 번만');
  assert.equal(L.fmtNum(128000), '13만');
  assert.equal(L.stageOf(64).id, 'adult');
}

// 쉬기만 하면 평범한 엔딩
{
  const rng = seeded(3);
  const s = L.newGame({}, rng);
  while (!s.ending) { L.chooseStyle(s, 'allround'); L.doAction(s, 'rest', rng); L.endDay(s, rng); }
  assert.equal(s.ending, 'normal');
}

// 전형 목표 스탯 중 가장 모자란 걸 훈련하는 봇
const TRAIN = { skill: 'lesson', speed: 'reflex', stamina: 'run', tactics: 'analysis', mental: 'meditate', manner: 'job' };
function play(seed, country, racket, style) {
  const rng = seeded(seed);
  const s = L.newGame({ country, racket }, rng);
  while (!s.ending) {
    L.chooseStyle(s, style);
    if (s.stats[L.MATCHES[s.match].stat] >= L.matchNeed(s.day) && s.cond > 35) L.doMatch(s, rng);
    while (s.ap > 0) {
      const req = L.reqOf(s);
      const gap = Object.keys(req).sort((a, b) => s.stats[a] / req[a] - s.stats[b] / req[b])[0];
      const key = s.cond < 35 ? 'rest' : s.money < 25000 ? 'job'
        : s.stats[gap] >= req[gap] ? 'lesson' : TRAIN[gap];
      if (L.doAction(s, key, rng).error) L.doAction(s, 'rest', rng);
    }
    L.endDay(s, rng);
    L.newUnlocks(s);
  }
  return s.ending;
}

const table = [];
const rate = {};
for (const style of Object.keys(L.STYLES)) {
  for (const racket of Object.keys(L.RACKETS)) {
    for (const country of ['kor', 'chn', 'swe']) {
      let wins = 0;
      for (let seed = 1; seed <= 40; seed++) if (play(seed, country, racket, style) === 'champion') wins++;
      rate[`${style}/${racket}/${country}`] = wins / 40;
      table.push({ style, racket, country, 궁합: L.STYLES[style].fits.includes(racket) ? 'O' : '', 우승률: `${Math.round((wins / 40) * 100)}%` });
    }
  }
}
// 궁합 맞는 조합은 집중 육성하면 절반 이상 우승, 궁합 안 맞는 조합보다 확실히 높아야 함
assert.ok(rate['drive/shake/kor'] >= 0.5 && rate['fast/pen/kor'] >= 0.5 && rate['defense/shake/kor'] >= 0.5);
assert.ok(rate['fast/pen/kor'] > rate['fast/shake/kor'] + 0.1, '전진속공은 펜홀더가 유리');
assert.ok(rate['defense/shake/kor'] > rate['defense/cpen/kor'] + 0.1, '수비형은 셰이크가 유리');
console.table(table);
console.log('ok');
