// 게임 규칙만 담은 순수 로직. DOM 없음 → node test.mjs 로 검증 가능.
// 목표: 아들을 탁구 국가대표로 키워 세계탁구선수권 우승시키기.
// 분기: 시작할 때 국가와 라켓, 어린이가 될 때(22일째) 전형을 고른다.

export const DAYS = 84;
export const AP_PER_DAY = 3;

export const STATS = [
  { key: 'skill', name: '기술', color: '#FF6F59' },
  { key: 'speed', name: '스피드', color: '#FF8FC0' },
  { key: 'stamina', name: '체력', color: '#2FB67C' },
  { key: 'tactics', name: '전략', color: '#4F86F7' },
  { key: 'mental', name: '멘탈', color: '#A57BFF' },
  { key: 'manner', name: '인성', color: '#F5B700' },
];
export const statName = (k) => STATS.find((s) => s.key === k).name;

export const COUNTRIES = {
  kor: { name: '대한민국', flag: '🇰🇷', bonus: { mental: 6, manner: 3 }, need: 100000, desc: '근성의 나라. 멘탈과 인성을 갖고 시작해요.' },
  chn: { name: '중국', flag: '🇨🇳', bonus: { skill: 6, tactics: 3 }, need: 150000, desc: '세계 최강. 기술은 앞서지만 대표 선발 기준이 포인트 15만이에요.' },
  jpn: { name: '일본', flag: '🇯🇵', bonus: { speed: 6, skill: 3 }, need: 100000, desc: '빠른 템포의 탁구. 스피드를 갖고 시작해요.' },
  ger: { name: '독일', flag: '🇩🇪', bonus: { stamina: 6, tactics: 3 }, need: 100000, desc: '유럽 최강. 체력과 전략을 갖고 시작해요.' },
  swe: { name: '스웨덴', flag: '🇸🇪', bonus: { tactics: 6, manner: 3 }, need: 80000, desc: '탁구 전통 강국. 선발 기준이 포인트 8만으로 낮아요.' },
};

export const RACKETS = {
  shake: { name: '셰이크핸드', mult: {}, edge: 0.03, desc: '악수하듯 잡는 그립. 양면이 안정적이라 모든 경기 승률 +3%.' },
  pen: { name: '펜홀더', mult: { speed: 1.3, skill: 1.1 }, edge: 0, desc: '펜처럼 잡고 한 면만 써요. 포핸드와 발이 빨라져 스피드 훈련 효율이 좋아요.' },
  cpen: { name: '중펜', mult: { skill: 1.2, tactics: 1.1 }, edge: 0, desc: '중국식 펜홀더. 뒷면 타법으로 백핸드도 공격해요. 기술 훈련 효율이 좋아요.' },
};

export const STYLES = {
  fast: {
    name: '전진속공형', icon: '⚡', mult: { speed: 1.3, skill: 1.1 }, fits: ['pen'],
    req: { skill: 70, speed: 80, mental: 55 },
    desc: '탁구대에 바짝 붙어 빠른 박자로 끝내요. 펜홀더와 궁합이 좋아요.',
    win: '탁구대에 바짝 붙어 번개 같은 속공으로 결승을 끝냈어요.',
  },
  drive: {
    name: '드라이브형', icon: '🌀', mult: { skill: 1.2, stamina: 1.1 }, fits: ['shake', 'cpen'],
    req: { skill: 80, stamina: 60, mental: 50 },
    desc: '강한 회전의 드라이브로 밀어붙여요. 셰이크핸드, 중펜과 궁합이 좋아요.',
    win: '중진에서 쏟아낸 파워 드라이브가 결승 상대의 라켓을 튕겨 냈어요.',
  },
  defense: {
    name: '수비형', icon: '🛡️', mult: { mental: 1.3, stamina: 1.2 }, fits: ['shake'],
    req: { mental: 80, stamina: 70, skill: 55 },
    desc: '멀리서 커트로 받아 내며 상대 실수를 기다려요. 셰이크핸드와 궁합이 좋아요.',
    win: '끝없는 커트로 받아 내다 상대가 먼저 무너졌어요. 철벽 수비의 승리예요.',
  },
  allround: {
    name: '올라운드형', icon: '⭐', mult: {}, fits: ['shake', 'pen', 'cpen'], half: true, finalEdge: -0.12,
    req: { skill: 80, tactics: 75, mental: 70 },
    desc: '공격과 수비를 상황 따라 바꿔요. 어떤 라켓과도 무난하지만, 결정타가 없어 결승에서는 조금 불리해요.',
    win: '공격과 수비를 자유자재로 바꾸며 결승 상대를 흔들었어요.',
  },
};
// 전형을 고르기 전에 보여 줄 기본 목표
const DEFAULT_REQ = { skill: 80, mental: 60 };
export const reqOf = (s) => (s.style ? STYLES[s.style].req : DEFAULT_REQ);
// 라켓과 전형 궁합: 1 최고, 0.5 무난(올라운드), 0 보통
export const fitLevel = (s, style = s.style) =>
  !style || !STYLES[style].fits.includes(s.racket) ? 0 : STYLES[style].half ? 0.5 : 1;

export const STAGES = [
  { id: 'baby', name: '아기', from: 1, age: [1, 6], mult: 1 },
  { id: 'kid', name: '어린이', from: 22, age: [7, 12], mult: 3 },
  { id: 'teen', name: '청소년', from: 43, age: [13, 18], mult: 6 },
  { id: 'adult', name: '어른', from: 64, age: [19, 24], mult: 12 },
];
export const STYLE_DAY = STAGES[1].from;
export const stageIndex = (day) => STAGES.findLastIndex((s) => day >= s.from);
export const stageOf = (day) => STAGES[stageIndex(day)];
export function ageOf(day) {
  const s = stageOf(day);
  return s.age[0] + Math.floor(((day - s.from) * (s.age[1] - s.age[0] + 1)) / 21);
}
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const dateLabel = (day) => `${Math.ceil(day / 7)}주차 ${WEEKDAYS[(day - 1) % 7]}요일`;

// 나이대별 성장 한계: 아기 30, 어린이 55, 청소년 80, 어른 100
export const STAT_CAPS = [30, 55, 80, 100];
export const statCap = (day) => STAT_CAPS[stageIndex(Math.min(day, DAYS))];

export const ACTIONS = {
  meal: { name: '밥 먹이기', icon: '🍚', cost: 8000, cond: 15, gain: { stamina: 2 }, line: '냠냠, 든든해!' },
  lesson: { name: '탁구 레슨', icon: '🏓', cost: 20000, cond: -12, gain: { skill: 3, tactics: 1 }, line: '오늘 서브 완전 잘 들어갔어!' },
  run: { name: '러닝', icon: '🏃', cond: -10, gain: { stamina: 3, speed: 1 }, line: '땀 흘리니까 개운해' },
  reflex: { name: '반응 훈련', icon: '⚡', cond: -10, gain: { speed: 3 }, line: '공이 느리게 보여!' },
  analysis: { name: '경기 분석', icon: '📋', cond: -5, gain: { tactics: 3 }, line: '상대 약점 찾았어!' },
  meditate: { name: '명상', icon: '🧘', cond: -3, gain: { mental: 3 }, line: '마음이 차분해졌어' },
  job: { name: '보조 코치', icon: '🧒', cond: -15, gain: { manner: 2 }, earn: true, line: '꼬마들 가르치고 왔어!' },
  rest: { name: '쉬기', icon: '🛋️', cond: 25, gain: {}, line: '잠깐 낮잠 잘게…' },
};

export const MATCHES = [
  { name: '동네 탁구장 리그', icon: '🏓', stat: 'skill', points: 700, prize: 30000 },
  { name: '소년체전 예선', icon: '🏅', stat: 'skill', points: 900, prize: 35000 },
  { name: '스매시 챌린지', icon: '💥', stat: 'speed', points: 800, prize: 30000 },
  { name: '5세트 지구력 매치', icon: '💪', stat: 'stamina', points: 750, prize: 30000 },
  { name: '복식 대회', icon: '🤝', stat: 'manner', points: 800, prize: 30000 },
  { name: '상비군 전술 테스트', icon: '🧠', stat: 'tactics', points: 650, prize: 40000 },
  { name: '듀스 접전 이벤트전', icon: '🔥', stat: 'mental', points: 800, prize: 30000 },
  { name: '국제 오픈 투어', icon: '✈️', stat: 'skill', points: 1200, prize: 25000 },
];
export const matchNeed = (day) => 12 + stageIndex(day) * 18;
export function matchChance(s) {
  const mt = MATCHES[s.match];
  let c = 0.35 + (s.stats[mt.stat] - matchNeed(s.day)) / 40 + RACKETS[s.racket].edge;
  c += 0.08 * fitLevel(s); // 라켓과 전형 궁합
  if (s.style && (STYLES[s.style].mult[mt.stat] || 1) > 1) c += 0.05; // 전형의 주특기 경기
  return Math.max(0.1, Math.min(0.95, c));
}

const EVENTS = [
  { title: '스카우트 제의', text: '실업팀 감독님이 경기를 눈여겨보고 가셨어요.', apply: (st, m) => (st.points += 400 * m) },
  { title: '감기에 걸렸어요', text: '콧물이 줄줄. 오늘은 푹 쉬게 해 주세요.', apply: (st) => (st.cond -= 20) },
  { title: '응원 편지 도착', text: '삐뚤빼뚤한 글씨로 "탁구 왕 되세요!"라고 적혀 있어요.', apply: (st, m) => { st.points += 150 * m; st.stats.manner += 2; } },
  { title: '할머니 용돈', text: '할머니가 몰래 봉투를 쥐여 주셨어요.', apply: (st) => (st.money += 20000) },
  { title: '러버가 찢어졌어요', text: '새 러버로 갈았어요. 돈은 들었지만 마음을 다잡았어요.', apply: (st) => { st.money = Math.max(0, st.money - 15000); st.stats.mental += 2; } },
  { title: '코치님 칭찬', text: '코치님이 "손목 감각은 타고났다"고 하셨대요.', apply: (st) => (st.stats.skill += 3) },
  { title: '연습 경기 역전패', text: '10대 4에서 뒤집혔어요. 분했지만 멘탈은 단단해졌어요.', apply: (st) => { st.cond -= 10; st.stats.mental += 3; } },
];

const meets = (s, req) => Object.entries(req).every(([k, v]) => s.stats[k] >= v);
export const ENDINGS = [
  {
    id: 'champion', title: '세계탁구선수권 우승', icon: '🏆',
    ok: (s) => meets(s, reqOf(s)) && s.points >= COUNTRIES[s.country].need,
    text: (s) => `${STYLES[s.style || 'allround'].win} ${COUNTRIES[s.country].flag} 국기를 들고 시상대 맨 위에 섰어요.`,
  },
  {
    id: 'runnerup', title: '세계탁구선수권 준우승', icon: '🥈',
    ok: (s) => meets(s, reqOf(s)) && s.points >= COUNTRIES[s.country].need,
    text: (s) => `결승에서 마지막 세트 듀스 끝에 아쉽게 졌어요. 그래도 ${COUNTRIES[s.country].flag} 국가대표 은메달이에요.`,
  },
  {
    id: 'ace', title: '국가대표 에이스', icon: '🎖️',
    ok: (s) => s.stats.skill >= 65 && s.points >= COUNTRIES[s.country].need / 2,
    text: (s) => `${COUNTRIES[s.country].name} 대표로 세계선수권 4강까지 올랐어요. 다음 대회가 더 기대되는 ${s.style ? STYLES[s.style].name : ''} 에이스예요.`,
  },
  { id: 'coach', title: '명장 탁구 감독', icon: '📋', ok: (s) => s.stats.tactics >= 80, text: () => '라켓보다 작전판이 더 잘 맞았대요. 대표팀 감독으로 금메달을 이끌었어요.' },
  { id: 'marathon', title: '철인 마라토너', icon: '🏃', ok: (s) => s.stats.stamina >= 80, text: () => '체력 훈련이 너무 재밌어서 마라톤으로 종목을 바꿨어요.' },
  { id: 'gamer', title: '프로게이머', icon: '🎮', ok: (s) => s.stats.speed >= 80, text: () => '번개 같은 반사신경으로 e스포츠 세계 대회에 나갔어요.' },
  { id: 'teacher', title: '탁구 교실 선생님', icon: '🍎', ok: (s) => s.stats.manner >= 80, text: () => '동네 아이들이 제일 좋아하는 탁구 선생님이 됐어요.' },
  { id: 'normal', title: '동네 탁구장 사장님', icon: '☕', ok: () => true, text: () => '주말마다 엄마랑 랠리하는 게 제일 좋대요.' },
];

export const GALLERY = [
  { id: 'first', name: '첫 걸음', icon: '👣', hint: '이틀째 맞이하기', ok: (s) => s.day >= 2 },
  { id: 'club', name: '클럽 유니폼', icon: '🎽', type: 'outfit', hint: '첫 경기 승리', ok: (s) => s.matchWins >= 1 },
  { id: 'headband', name: '헤어밴드', icon: '🎗️', type: 'acc', hint: '스피드 40 달성', ok: (s) => s.stats.speed >= 40 },
  { id: 'tracksuit', name: '트레이닝복', icon: '🧥', type: 'outfit', hint: '체력 40 달성', ok: (s) => s.stats.stamina >= 40 },
  { id: 'junior', name: '주니어 대표 유니폼', icon: '🎒', type: 'outfit', hint: '청소년이 되기', ok: (s) => stageIndex(s.day) >= 2 },
  { id: 'national', name: '국가대표 유니폼', icon: '🎖️', type: 'outfit', hint: '기술 60 달성', ok: (s) => s.stats.skill >= 60 },
  { id: 'medal', name: '금메달', icon: '🥇', type: 'acc', hint: '랭킹 포인트 10만', ok: (s) => s.points >= 100000 },
  { id: 'star', name: '육각형 아들', icon: '⭐', hint: '모든 스탯 50 이상', ok: (s) => STATS.every((t) => s.stats[t.key] >= 50) },
];

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
function tidy(s) {
  for (const k in s.stats) s.stats[k] = clamp(Math.round(s.stats[k]), 0, statCap(s.day));
  s.cond = clamp(Math.round(s.cond));
  s.points = Math.max(0, Math.round(s.points));
}

export function newGame({ name = '빔', parent = '엄마', country = 'kor', racket = 'shake' } = {}, rng = Math.random) {
  const s = {
    name, parent, country, racket, style: null,
    day: 1, ap: AP_PER_DAY, money: 60000, points: 0, cond: 80,
    stats: Object.fromEntries(STATS.map((t) => [t.key, 8 + Math.floor(rng() * 5)])),
    match: Math.floor(rng() * MATCHES.length), matchDone: false, matchWins: 0,
    today: [], log: [], unlocked: [], outfit: 'basic', acc: null, sound: true, ending: null,
  };
  for (const [k, v] of Object.entries(COUNTRIES[country].bonus)) s.stats[k] += v;
  tidy(s);
  return s;
}

// 22일째 이후 한 번만 고를 수 있다
export function chooseStyle(s, style) {
  if (s.style || s.day < STYLE_DAY || !STYLES[style]) return false;
  s.style = style;
  return true;
}
export const needsStyle = (s) => !s.style && !s.ending && s.day >= STYLE_DAY;

const condFactor = (c) => (c < 30 ? 0.5 : c >= 70 ? 1.2 : 1);
const trainMult = (s, k) => (RACKETS[s.racket].mult[k] || 1) * ((s.style && STYLES[s.style].mult[k]) || 1);

// 성공하면 { line, deltas }, 못 하면 { error } 를 돌려준다. state 를 직접 바꾼다.
export function doAction(s, key, rng = Math.random) {
  const a = ACTIONS[key];
  if (s.ending) return { error: '이미 엔딩을 봤어요.' };
  if (needsStyle(s)) return { error: '먼저 전형을 골라 주세요.' };
  if (s.ap < 1) return { error: '오늘 일정이 꽉 찼어요. 하루를 마쳐 주세요.' };
  if (a.cost && s.money < a.cost) return { error: `돈이 ${(a.cost - s.money).toLocaleString()}원 부족해요.` };
  if (s.cond <= 10 && a.cond < 0) return { error: '너무 지쳤어요. 밥을 먹이거나 쉬게 해 주세요.' };

  const f = condFactor(s.cond);
  const deltas = {};
  for (const [k, v] of Object.entries(a.gain)) {
    const g = Math.max(1, Math.round((v + rng()) * f * trainMult(s, k) * (1 - s.stats[k] / 150)));
    s.stats[k] += g;
    deltas[statName(k)] = g;
  }
  if (a.cost) { s.money -= a.cost; deltas['돈'] = -a.cost; }
  if (a.earn) {
    const pay = Math.round((12000 + s.stats.manner * 400) * (1 + stageIndex(s.day) * 0.5));
    s.money += pay; deltas['돈'] = pay;
  }
  s.cond += a.cond; deltas['컨디션'] = a.cond;
  s.ap -= 1;
  s.today.push(a.icon);
  tidy(s);
  return { line: f < 1 ? '조금 힘들어…' : a.line, deltas };
}

export function doMatch(s, rng = Math.random) {
  if (s.ending) return { error: '이미 엔딩을 봤어요.' };
  if (needsStyle(s)) return { error: '먼저 전형을 골라 주세요.' };
  if (s.matchDone) return { error: '오늘 경기는 이미 뛰었어요.' };
  if (s.ap < 2) return { error: '경기는 일정 2칸이 필요해요.' };
  if (s.cond <= 20) return { error: '컨디션이 너무 낮아서 경기에 못 나가요.' };
  const mt = MATCHES[s.match];
  const m = STAGES[stageIndex(s.day)].mult;
  const win = rng() < matchChance(s);
  const points = win ? mt.points * m : mt.points * m * 0.1;
  const prize = win ? mt.prize * (1 + stageIndex(s.day)) : 0;
  s.points += points; s.money += prize; s.cond -= 15;
  if (win) { s.stats[mt.stat] += 3; s.matchWins += 1; }
  s.ap -= 2; s.matchDone = true; s.today.push(mt.icon, mt.icon);
  tidy(s);
  return {
    win,
    line: win ? '이겼다! 마지막 스매시 봤어?' : '다음엔 꼭 이길 거야',
    deltas: { 포인트: Math.round(points), ...(prize && { 돈: prize }), ...(win && { [statName(mt.stat)]: 3 }), 컨디션: -15 },
  };
}

export function endDay(s, rng = Math.random) {
  if (s.ending) return {};
  const m = STAGES[stageIndex(s.day)].mult;
  const before = s.points;
  s.points += s.points * 0.02 + (s.stats.skill + s.stats.speed) * m * 0.5;
  s.log.unshift({ day: s.day, acts: s.today.join(' '), points: Math.round(s.points - before) });
  s.log = s.log.slice(0, 60);
  const prevStage = stageIndex(s.day);
  s.day += 1;
  s.ap = AP_PER_DAY; s.today = []; s.matchDone = false;
  s.cond -= 4;
  s.match = Math.floor(rng() * MATCHES.length);
  let event = null;
  if (rng() < 0.35) {
    const e = EVENTS[Math.floor(rng() * EVENTS.length)];
    e.apply(s, m);
    event = { title: e.title, text: e.text };
  }
  tidy(s);
  if (s.day > DAYS) s.ending = decideEnding(s, rng);
  return { event, grew: stageIndex(Math.min(s.day, DAYS)) > prevStage };
}

// 결승 승률: 목표를 넘긴 만큼 + 라켓·전형 궁합 + 라켓 보정
export function finalChance(s) {
  const req = reqOf(s);
  const surplus = Object.entries(req)
    .map(([k, v]) => Math.max(0, s.stats[k] - v) / (100 - v))
    .reduce((a, b) => a + b, 0) / Object.keys(req).length;
  const c = 0.2 + 0.45 * surplus + 0.2 * fitLevel(s) + RACKETS[s.racket].edge + ((s.style && STYLES[s.style].finalEdge) || 0);
  return Math.max(0.05, Math.min(0.95, c));
}
function decideEnding(s, rng) {
  const qualified = ENDINGS[0].ok(s);
  if (qualified) return rng() < finalChance(s) ? 'champion' : 'runnerup';
  return ENDINGS.slice(2).find((e) => e.ok(s)).id;
}

export function newUnlocks(s) {
  const fresh = GALLERY.filter((g) => !s.unlocked.includes(g.id) && g.ok(s));
  s.unlocked.push(...fresh.map((g) => g.id));
  return fresh;
}

export const level = (s) => 1 + Math.floor(Object.values(s.stats).reduce((a, b) => a + b, 0) / 40);
export function goalProgress(s) {
  const parts = Object.entries(reqOf(s)).map(([k, v]) => Math.min(1, s.stats[k] / v));
  parts.push(Math.min(1, s.points / COUNTRIES[s.country].need));
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}
// 랭킹 포인트 → 세계 랭킹 (0점 999위, 1만 약 200위, 10만 약 8위). 1위는 우승해야 차지한다.
export const worldRank = (s) =>
  s.ending === 'champion' ? 1 : Math.max(2, Math.round(999 / (1 + (s.points / 4000) ** 1.5)));
export function fmtNum(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}만`;
  return n.toLocaleString();
}
