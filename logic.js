// 게임 규칙만 담은 순수 로직. DOM 없음 → node test.mjs 로 검증 가능.

export const DAYS = 84;
export const AP_PER_DAY = 3;

export const STATS = [
  { key: 'acting', name: '연기', color: '#FF6F59' },
  { key: 'charm', name: '매력', color: '#FF8FC0' },
  { key: 'health', name: '체력', color: '#2FB67C' },
  { key: 'smarts', name: '지성', color: '#4F86F7' },
  { key: 'emotion', name: '감성', color: '#A57BFF' },
  { key: 'manner', name: '인성', color: '#F5B700' },
];
const statName = (k) => STATS.find((s) => s.key === k).name;

export const STAGES = [
  { id: 'baby', name: '아기', from: 1, age: [1, 6], mult: 1 },
  { id: 'kid', name: '어린이', from: 22, age: [7, 12], mult: 3 },
  { id: 'teen', name: '청소년', from: 43, age: [13, 18], mult: 6 },
  { id: 'adult', name: '어른', from: 64, age: [19, 24], mult: 12 },
];
export const stageIndex = (day) => STAGES.findLastIndex((s) => day >= s.from);
export const stageOf = (day) => STAGES[stageIndex(day)];
export function ageOf(day) {
  const s = stageOf(day);
  return s.age[0] + Math.floor(((day - s.from) * (s.age[1] - s.age[0] + 1)) / 21);
}
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const dateLabel = (day) =>
  `${Math.ceil(day / 7)}주차 ${WEEKDAYS[(day - 1) % 7]}요일`;

export const ACTIONS = {
  meal: { name: '밥 먹이기', icon: '🍚', cost: 8000, cond: 15, gain: { health: 2 }, line: '냠냠, 든든해!' },
  acting: { name: '연기 수업', icon: '🎬', cost: 20000, cond: -12, gain: { acting: 3, emotion: 1 }, line: '대사 다 외웠어!' },
  workout: { name: '운동', icon: '🏃', cond: -10, gain: { health: 3, charm: 1 }, line: '땀 흘리니까 개운해' },
  study: { name: '공부', icon: '📚', cond: -10, gain: { smarts: 3 }, line: '오늘 배운 거 다 기억해!' },
  music: { name: '음악 듣기', icon: '🎧', cond: -5, gain: { emotion: 3 }, line: '이 노래 너무 좋다' },
  volunteer: { name: '봉사', icon: '🤝', cond: -8, gain: { manner: 3 }, fans: 60, line: '도와드려서 뿌듯해' },
  job: { name: '광고 알바', icon: '📸', cond: -15, gain: { charm: 2 }, earn: true, line: '용돈 벌어왔어!' },
  rest: { name: '쉬기', icon: '🛋️', cond: 25, gain: {}, line: '잠깐 낮잠 잘게…' },
};

export const SHOOTS = [
  { name: '바닷가 화보 촬영', icon: '🏖️', stat: 'charm', fans: 700, pay: 30000 },
  { name: '드라마 단역', icon: '📺', stat: 'acting', fans: 900, pay: 35000 },
  { name: '예능 출연', icon: '🎤', stat: 'manner', fans: 800, pay: 30000 },
  { name: '아이스크림 광고', icon: '🍦', stat: 'charm', fans: 600, pay: 50000 },
  { name: '영화 오디션', icon: '🎞️', stat: 'acting', fans: 1200, pay: 25000 },
  { name: '뮤직비디오 출연', icon: '🎵', stat: 'emotion', fans: 800, pay: 30000 },
  { name: '스포츠 예능', icon: '⚽', stat: 'health', fans: 750, pay: 30000 },
  { name: '어린이 퀴즈쇼', icon: '🧠', stat: 'smarts', fans: 650, pay: 40000 },
];
export const shootNeed = (day) => 12 + stageIndex(day) * 18;
export function shootChance(state) {
  const s = SHOOTS[state.shoot];
  const c = 0.35 + (state.stats[s.stat] - shootNeed(state.day)) / 40;
  return Math.max(0.1, Math.min(0.95, c));
}

const EVENTS = [
  { title: '길거리 캐스팅!', text: '시장 가는 길에 기획사 명함을 받았어요.', apply: (st, m) => (st.fans += 400 * m) },
  { title: '감기에 걸렸어요', text: '콧물이 줄줄. 오늘은 푹 쉬게 해 주세요.', apply: (st) => (st.cond -= 20) },
  { title: '팬레터 도착', text: '삐뚤빼뚤한 글씨로 "응원해요!"라고 적혀 있어요.', apply: (st, m) => { st.fans += 150 * m; st.stats.manner += 2; } },
  { title: '할머니 용돈', text: '할머니가 몰래 봉투를 쥐여 주셨어요.', apply: (st) => (st.money += 20000) },
  { title: '악플을 봤어요', text: '속상해서 이불 속에 숨었어요. 대신 마음은 한 뼘 자랐어요.', apply: (st) => { st.cond -= 10; st.stats.emotion += 3; } },
  { title: '선생님 칭찬', text: '연기 선생님이 "타고났다"고 하셨대요.', apply: (st) => (st.stats.acting += 3) },
];

export const ENDINGS = [
  { id: 'national', title: '국민배우', icon: '🏆', text: '시상식 단상에서 "엄마, 고마워"라고 말했어요. 온 국민이 아는 얼굴이 됐어요.', ok: (s) => s.stats.acting >= 80 && s.fans >= 100000 && s.stats.manner >= 50 },
  { id: 'hallyu', title: '한류스타', icon: '🌏', text: '공항에 팬들이 몰려들어요. 해외 팬미팅이 매진됐어요.', ok: (s) => s.stats.charm >= 80 && s.fans >= 150000 },
  { id: 'action', title: '액션배우', icon: '🥋', text: '대역 없이 와이어를 타는 배우로 유명해졌어요.', ok: (s) => s.stats.health >= 80 && s.stats.acting >= 60 },
  { id: 'singer', title: '싱어송라이터', icon: '🎸', text: '직접 쓴 노래가 음원 차트 1위에 올랐어요.', ok: (s) => s.stats.emotion >= 80 },
  { id: 'doctor', title: '천재 박사', icon: '🔬', text: '연기보다 실험이 더 좋았대요. 새로운 별을 발견했어요.', ok: (s) => s.stats.smarts >= 80 },
  { id: 'kind', title: '마음 따뜻한 선생님', icon: '🍎', text: '동네 아이들이 제일 좋아하는 선생님이 됐어요.', ok: (s) => s.stats.manner >= 80 },
  { id: 'normal', title: '평범하고 행복한 직장인', icon: '☕', text: '주말마다 엄마랑 밥 먹는 게 제일 좋대요.', ok: () => true },
];

export const GALLERY = [
  { id: 'first', name: '첫 걸음', icon: '👣', hint: '이틀째 맞이하기', ok: (s) => s.day >= 2 },
  { id: 'raincoat', name: '노란 우비', icon: '🧥', type: 'outfit', hint: '첫 촬영 성공', ok: (s) => s.shootWins >= 1 },
  { id: 'cap', name: '야구모자', icon: '🧢', type: 'acc', hint: '체력 40 달성', ok: (s) => s.stats.health >= 40 },
  { id: 'glasses', name: '선글라스', icon: '🕶️', type: 'acc', hint: '팬 1만 명', ok: (s) => s.fans >= 10000 },
  { id: 'uniform', name: '교복', icon: '🎒', type: 'outfit', hint: '청소년이 되기', ok: (s) => stageIndex(s.day) >= 2 },
  { id: 'suit', name: '시상식 정장', icon: '🤵', type: 'outfit', hint: '연기 60 달성', ok: (s) => s.stats.acting >= 60 },
  { id: 'crown', name: '왕관', icon: '👑', type: 'acc', hint: '팬 10만 명', ok: (s) => s.fans >= 100000 },
  { id: 'star', name: '육각형 아들', icon: '⭐', hint: '모든 스탯 50 이상', ok: (s) => STATS.every((t) => s.stats[t.key] >= 50) },
];

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
// 나이대별 성장 한계: 아기 30, 어린이 55, 청소년 80, 어른 100
export const STAT_CAPS = [30, 55, 80, 100];
export const statCap = (day) => STAT_CAPS[stageIndex(Math.min(day, DAYS))];
function tidy(s) {
  for (const k in s.stats) s.stats[k] = clamp(Math.round(s.stats[k]), 0, statCap(s.day));
  s.cond = clamp(Math.round(s.cond));
  s.fans = Math.max(0, Math.round(s.fans));
}

export function newGame(name = '빔', parent = '엄마', rng = Math.random) {
  return {
    name, parent, day: 1, ap: AP_PER_DAY, money: 60000, fans: 0, cond: 80,
    stats: Object.fromEntries(STATS.map((s) => [s.key, 8 + Math.floor(rng() * 5)])),
    shoot: Math.floor(rng() * SHOOTS.length), shootDone: false, shootWins: 0,
    today: [], log: [], unlocked: [], outfit: 'basic', acc: null, sound: true, ending: null,
  };
}

const condFactor = (c) => (c < 30 ? 0.5 : c >= 70 ? 1.2 : 1);

// 성공하면 { line, deltas }, 못 하면 { error } 를 돌려준다. state 를 직접 바꾼다.
export function doAction(state, key, rng = Math.random) {
  const a = ACTIONS[key];
  if (state.ending) return { error: '이미 엔딩을 봤어요.' };
  if (state.ap < 1) return { error: '오늘 일정이 꽉 찼어요. 하루를 마쳐 주세요.' };
  if (a.cost && state.money < a.cost) return { error: `돈이 ${(a.cost - state.money).toLocaleString()}원 부족해요.` };
  if (state.cond <= 10 && a.cond < 0) return { error: '너무 지쳤어요. 밥을 먹이거나 쉬게 해 주세요.' };

  const m = STAGES[stageIndex(state.day)].mult;
  const f = condFactor(state.cond);
  const deltas = {};
  for (const [k, v] of Object.entries(a.gain)) {
    const g = Math.max(1, Math.round((v + rng()) * f * (1 - state.stats[k] / 150)));
    state.stats[k] += g;
    deltas[statName(k)] = g;
  }
  if (a.cost) { state.money -= a.cost; deltas['돈'] = -a.cost; }
  if (a.earn) {
    const pay = Math.round((12000 + state.stats.charm * 400) * (1 + stageIndex(state.day) * 0.5));
    state.money += pay; deltas['돈'] = pay;
  }
  const fans = (a.fans || 0) * m + (a.earn ? state.stats.charm * 4 * m : 0);
  if (fans) { state.fans += fans; deltas['팬'] = Math.round(fans); }
  state.cond += a.cond; deltas['컨디션'] = a.cond;
  state.ap -= 1;
  state.today.push(a.icon);
  tidy(state);
  return { line: f < 1 ? '조금 힘들어…' : a.line, deltas };
}

export function doShoot(state, rng = Math.random) {
  if (state.ending) return { error: '이미 엔딩을 봤어요.' };
  if (state.shootDone) return { error: '오늘 촬영은 이미 다녀왔어요.' };
  if (state.ap < 2) return { error: '촬영은 일정 2칸이 필요해요.' };
  if (state.cond <= 20) return { error: '컨디션이 너무 낮아서 촬영장에 못 가요.' };
  const s = SHOOTS[state.shoot];
  const m = STAGES[stageIndex(state.day)].mult;
  const win = rng() < shootChance(state);
  const fans = win ? s.fans * m : s.fans * m * 0.1;
  const pay = win ? s.pay * (1 + stageIndex(state.day)) : 0;
  state.fans += fans; state.money += pay; state.cond -= 15;
  if (win) { state.stats[s.stat] += 3; state.shootWins += 1; }
  state.ap -= 2; state.shootDone = true; state.today.push(s.icon, s.icon);
  tidy(state);
  return {
    win,
    line: win ? '감독님이 한 번에 오케이래!' : '다음엔 꼭 붙을 거야',
    deltas: { 팬: Math.round(fans), ...(pay && { 돈: pay }), ...(win && { [statName(s.stat)]: 3 }), 컨디션: -15 },
  };
}

export function endDay(state, rng = Math.random) {
  if (state.ending) return {};
  const m = STAGES[stageIndex(state.day)].mult;
  const before = state.fans;
  state.fans += state.fans * 0.02 + (state.stats.charm + state.stats.acting) * m * 0.5;
  state.log.unshift({ day: state.day, acts: state.today.join(' '), fans: Math.round(state.fans - before) });
  state.log = state.log.slice(0, 60);
  const prevStage = stageIndex(state.day);
  state.day += 1;
  state.ap = AP_PER_DAY; state.today = []; state.shootDone = false;
  state.cond -= 4;
  state.shoot = Math.floor(rng() * SHOOTS.length);
  let event = null;
  if (rng() < 0.35) {
    const e = EVENTS[Math.floor(rng() * EVENTS.length)];
    e.apply(state, m);
    event = { title: e.title, text: e.text };
  }
  tidy(state);
  if (state.day > DAYS) state.ending = ENDINGS.find((e) => e.ok(state)).id;
  return { event, grew: stageIndex(Math.min(state.day, DAYS)) > prevStage };
}

export function newUnlocks(state) {
  const fresh = GALLERY.filter((g) => !state.unlocked.includes(g.id) && g.ok(state));
  state.unlocked.push(...fresh.map((g) => g.id));
  return fresh;
}

export const level = (s) => 1 + Math.floor(Object.values(s.stats).reduce((a, b) => a + b, 0) / 40);
export const goalProgress = (s) =>
  (Math.min(1, s.stats.acting / 80) + Math.min(1, s.fans / 100000) + Math.min(1, s.stats.manner / 50)) / 3;
export function fmtFans(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}만`;
  return n.toLocaleString();
}
