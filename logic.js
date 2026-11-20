// 게임 규칙만 담은 순수 로직. DOM 없음 → node test.mjs 로 검증 가능.
// 84일 동안 아들을 키우면 스탯에 맞는 직업 엔딩(또는 배드 엔딩)이 나온다.
// 탁구 루트 분기: 시작할 때 국가, 첫 탁구 레슨 때 라켓, 22일째 전형.

export const DAYS = 84;
export const AP_PER_DAY = 3;

export const STATS = [
  { key: 'skill', name: '탁구', color: '#FF6F59' },
  { key: 'stamina', name: '체력', color: '#2FB67C' },
  { key: 'smarts', name: '지능', color: '#4F86F7' },
  { key: 'courage', name: '용기', color: '#FF9E3D' },
  { key: 'grit', name: '끈기', color: '#A57BFF' },
  { key: 'manner', name: '인성', color: '#F5B700' },
  { key: 'craft', name: '손재주', color: '#8D6E63' },
];
export const statName = (k) => STATS.find((s) => s.key === k).name;

export const COUNTRIES = {
  kor: { name: '대한민국', flag: '🇰🇷', bonus: { grit: 6, manner: 3 }, need: 100000, desc: '근성의 나라. 끈기와 인성을 갖고 시작해요.' },
  chn: { name: '중국', flag: '🇨🇳', bonus: { skill: 6, smarts: 3 }, need: 150000, desc: '탁구 최강국. 탁구 실력을 갖고 시작하지만 대표 선발 기준이 높아요.' },
  jpn: { name: '일본', flag: '🇯🇵', bonus: { smarts: 6, manner: 3 }, need: 100000, desc: '꼼꼼한 공부 습관. 지능과 인성을 갖고 시작해요.' },
  ger: { name: '독일', flag: '🇩🇪', bonus: { stamina: 6, smarts: 3 }, need: 100000, desc: '튼튼한 몸과 과학. 체력과 지능을 갖고 시작해요.' },
  swe: { name: '스웨덴', flag: '🇸🇪', bonus: { manner: 6, courage: 3 }, need: 80000, desc: '다정한 복지 국가. 인성과 용기를 갖고 시작하고, 탁구 대표 기준이 낮아요.' },
};

export const RACKETS = {
  shake: { name: '셰이크핸드', mult: {}, edge: 0.03, desc: '악수하듯 잡는 그립. 양면이 안정적이라 탁구 경기 승률 +3%.' },
  pen: { name: '펜홀더', mult: { skill: 1.1, stamina: 1.1 }, edge: 0, desc: '펜처럼 잡고 한 면만 써요. 빠른 풋워크로 탁구와 체력 훈련 효율이 좋아요.' },
  cpen: { name: '중펜', mult: { skill: 1.2 }, edge: 0, desc: '중국식 펜홀더. 뒷면 타법까지 써서 탁구 훈련 효율이 가장 좋아요.' },
};

export const STYLES = {
  fast: {
    name: '전진속공형', icon: '⚡', mult: { skill: 1.1, courage: 1.2 }, fits: ['pen'],
    req: { skill: 80, courage: 60, stamina: 50 },
    desc: '탁구대에 바짝 붙어 빠른 박자로 끝내요. 펜홀더와 궁합이 좋아요.',
    win: '탁구대에 바짝 붙어 번개 같은 속공으로 결승을 끝냈어요.',
  },
  drive: {
    name: '드라이브형', icon: '🌀', mult: { skill: 1.2, stamina: 1.1 }, fits: ['shake', 'cpen'],
    req: { skill: 85, stamina: 65 },
    desc: '강한 회전의 드라이브로 밀어붙여요. 셰이크핸드, 중펜과 궁합이 좋아요.',
    win: '중진에서 쏟아낸 파워 드라이브가 결승 상대의 라켓을 튕겨 냈어요.',
  },
  defense: {
    name: '수비형', icon: '🛡️', mult: { grit: 1.3, stamina: 1.1 }, fits: ['shake'],
    req: { skill: 70, grit: 80, stamina: 60 },
    desc: '멀리서 커트로 받아 내며 상대 실수를 기다려요. 셰이크핸드와 궁합이 좋아요.',
    win: '끝없는 커트로 받아 내다 상대가 먼저 무너졌어요. 철벽 수비의 승리예요.',
  },
  allround: {
    name: '올라운드형', icon: '⭐', mult: {}, fits: ['shake', 'pen', 'cpen'], half: true, finalEdge: -0.12,
    req: { skill: 80, smarts: 60, grit: 60 },
    desc: '공격과 수비를 상황 따라 바꿔요. 어떤 라켓과도 무난하지만, 결정타가 없어 결승에서는 조금 불리해요.',
    win: '공격과 수비를 자유자재로 바꾸며 결승 상대를 흔들었어요.',
  },
};
const DEFAULT_TT_REQ = { skill: 85, stamina: 60 };
export const reqOf = (s) => (s.style ? STYLES[s.style].req : DEFAULT_TT_REQ);
// 라켓과 전형 궁합: 1 최고, 0.5 무난(올라운드), 0 보통
export const fitLevel = (s, style = s.style) =>
  !style || !s.racket || !STYLES[style].fits.includes(s.racket) ? 0 : STYLES[style].half ? 0.5 : 1;

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
  lesson: { name: '탁구 레슨', icon: '🏓', cost: 20000, cond: -12, gain: { skill: 3, stamina: 1 }, line: '오늘 서브 완전 잘 들어갔어!' },
  study: { name: '공부', icon: '📚', cost: 10000, cond: -10, gain: { smarts: 3 }, line: '오늘 배운 거 다 기억해!' },
  run: { name: '운동', icon: '🏃', cond: -10, gain: { stamina: 3 }, line: '땀 흘리니까 개운해' },
  safety: { name: '소방 체험', icon: '🧯', cond: -10, gain: { courage: 3 }, line: '소화기 쓰는 법 배웠어!' },
  farm: { name: '농장 일손', icon: '🐄', cond: -15, gain: { grit: 2, stamina: 1 }, earn: true, line: '송아지 밥 주고 용돈 받았어!' },
  volunteer: { name: '봉사', icon: '🤝', cond: -6, gain: { manner: 3 }, line: '도와드려서 뿌듯해' },
  craft: { name: '공작 교실', icon: '🔧', cost: 10000, cond: -8, gain: { craft: 3, smarts: 1 }, line: '전구에 불 들어왔어!' },
  rest: { name: '쉬기', icon: '🛋️', cond: 25, gain: {}, line: '잠깐 낮잠 잘게…' },
};

// 매일 바뀌는 오늘의 도전. 탁구 대회는 랭킹 포인트도 준다.
export const MATCHES = [
  { name: '동네 탁구 대회', icon: '🏓', stat: 'skill', points: 800, prize: 30000 },
  { name: '국제 오픈 탁구 투어', icon: '✈️', stat: 'skill', points: 1200, prize: 25000 },
  { name: '과학 경시대회', icon: '🔬', stat: 'smarts', prize: 40000 },
  { name: '로봇 경진대회', icon: '🤖', stat: 'craft', prize: 40000 },
  { name: '소방 안전 골든벨', icon: '🚒', stat: 'courage', prize: 30000 },
  { name: '꼬마 마라톤', icon: '🏅', stat: 'stamina', prize: 30000 },
  { name: '한우 품평회', icon: '🐂', stat: 'grit', prize: 50000 },
  { name: '모범 어린이 표창', icon: '🎖️', stat: 'manner', prize: 30000 },
];
export const matchNeed = (day) => 12 + stageIndex(day) * 18;
export function matchChance(s) {
  const mt = MATCHES[s.match];
  let c = 0.35 + (s.stats[mt.stat] - matchNeed(s.day)) / 40;
  if (mt.points && s.racket) {
    c += RACKETS[s.racket].edge + 0.08 * fitLevel(s);
    if (s.style && (STYLES[s.style].mult.skill || 1) > 1) c += 0.05;
  }
  return Math.max(0.1, Math.min(0.95, c));
}

const EVENTS = [
  { title: '스카우트 제의', text: '실업팀 감독님이 탁구 치는 모습을 눈여겨보고 가셨어요.', apply: (st, m) => { if (st.racket) st.points += 400 * m; else st.stats.skill += 2; } },
  { title: '감기에 걸렸어요', text: '콧물이 줄줄. 오늘은 푹 쉬게 해 주세요.', apply: (st) => (st.cond -= 20) },
  { title: '할머니 용돈', text: '할머니가 몰래 봉투를 쥐여 주셨어요.', apply: (st) => (st.money += 20000) },
  { title: '송아지가 태어났어요', text: '할아버지 농장에서 송아지 출산을 밤새 도왔어요.', apply: (st) => { st.stats.grit += 3; st.cond -= 8; } },
  { title: '불이야!', text: '옆집 쓰레기통 불을 소화기로 끄고 칭찬을 받았어요.', apply: (st) => { st.stats.courage += 3; st.stats.manner += 1; } },
  { title: '선생님 칭찬', text: '담임 선생님이 "질문을 정말 잘한다"고 하셨대요.', apply: (st) => (st.stats.smarts += 3) },
  { title: '솔깃한 투자 권유', text: '"돈 두 배로 불려 줄게"라는 말에 넘어갈 뻔했어요.', apply: (st) => { if (st.stats.smarts < 40) st.money = Math.floor(st.money / 2); else st.stats.smarts += 2; } },
  { title: '고장 난 선풍기', text: '드라이버로 뚝딱뚝딱, 선풍기를 직접 고쳤어요.', apply: (st) => (st.stats.craft += 3) },
  { title: '친구랑 싸웠어요', text: '분해서 울다가, 먼저 사과하고 화해했어요.', apply: (st) => { st.cond -= 10; st.stats.manner += 2; } },
];

/* ---------- 엔딩 ---------- */
// 직업: 조건(스탯, 돈, 상장, 훈련 횟수)을 모두 채운 직업 중 가장 여유 있게 채운 직업이 엔딩이 된다.
// 프린세스 메이커처럼 스탯뿐 아니라 "무엇을 몇 번 했는지"도 엔딩을 가른다.
const t = (text) => () => text;
const hasBatchim = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 > 0; };
export const CAREERS = [
  // 탁구 루트 (라켓을 골라야 열림)
  { id: 'tt', group: '탁구', name: '탁구 국가대표', icon: '🏓', racket: true, tt: true, req: (s) => reqOf(s) },
  { id: 'pro', group: '탁구', name: '실업팀 탁구선수', icon: '🏸', racket: true, req: () => ({ skill: 65, stamina: 50 }), text: t('실업팀에 입단해 매주 리그 경기를 뛰어요. 동네 꼬마들의 사인 요청이 끊이지 않아요.') },
  { id: 'coach', group: '탁구', name: '탁구 코치', icon: '📣', racket: true, req: () => ({ skill: 55, manner: 60, smarts: 45 }), counts: { volunteer: 8 }, text: t('전문스포츠지도사 자격을 따서 중학교 탁구부 코치가 됐어요. 제자가 소년체전 금메달을 땄어요.') },
  { id: 'gym', group: '탁구', name: '탁구장 관장', icon: '🏟️', racket: true, req: () => ({ skill: 50, grit: 50 }), money: 500000, text: t('모은 돈으로 동네에 탁구장을 차렸어요. 저녁마다 동호회 랠리 소리가 끊이지 않아요.') },
  // 몸 쓰는 일
  { id: 'trainer', group: '운동', name: '헬스 트레이너', icon: '💪', req: () => ({ stamina: 85, manner: 40 }), text: t('체육관을 열었어요. 회원들이 줄을 서요.') },
  { id: 'firefighter', group: '안전', name: '소방관', icon: '🚒', req: () => ({ courage: 70, stamina: 65, manner: 50 }), text: t('불길 속에서 아이를 구해 나왔어요. 동네의 영웅이 됐어요.') },
  { id: 'police', group: '안전', name: '경찰관', icon: '👮', req: () => ({ courage: 65, manner: 60, smarts: 50 }), text: t('어르신 길 안내부터 범인 검거까지, 동네 지구대의 든든한 경찰관이 됐어요.') },
  { id: 'astronaut', group: '과학', name: '우주비행사', icon: '🚀', req: () => ({ smarts: 75, courage: 75, stamina: 70 }), text: t('우주정거장에서 지구를 내려다보며 엄마에게 영상 통화를 걸었어요.') },
  // 공부하는 일
  { id: 'doctor', group: '의료', name: '의사', icon: '🩺', req: () => ({ smarts: 85, manner: 60, grit: 60 }), text: t('소아과 의사가 됐어요. 주사 맞는 아이들에게 사탕을 꼭 챙겨 줘요.') },
  { id: 'nurse', group: '의료', name: '간호사', icon: '💉', req: () => ({ manner: 70, stamina: 60, smarts: 55 }), text: t('응급실 간호사가 됐어요. 밤새 환자 곁을 지키는 따뜻한 손이에요.') },
  { id: 'scientist', group: '과학', name: '생명과학자', icon: '🔬', req: () => ({ smarts: 85, grit: 70 }), text: t('10년 연구 끝에 새로운 치료 물질을 발견해 박사가 됐어요. 논문 감사의 말에 엄마 이름을 적었어요.') },
  { id: 'professor', group: '교육', name: '교수', icon: '🎓', req: () => ({ smarts: 75, manner: 65 }), text: t('대학 강의실이 늘 꽉 차는 인기 교수님이 됐어요.') },
  { id: 'teacher', group: '교육', name: '초등학교 선생님', icon: '🍎', req: () => ({ manner: 75, smarts: 55 }), text: t('아이들이 제일 좋아하는 담임 선생님이 됐어요.') },
  // 손 쓰는 일
  { id: 'electrician', group: '기술', name: '전기기사', icon: '⚡', req: () => ({ craft: 70, smarts: 55, courage: 40 }), counts: { craft: 15 }, text: t('전기기사 자격증을 따서 새 아파트 단지 배선을 깔아요. 정전 난 동네에 제일 먼저 달려가요.') },
  { id: 'chef', group: '기술', name: '한식 셰프', icon: '👨‍🍳', req: () => ({ craft: 65, stamina: 55, grit: 55 }), text: t('할머니 손맛을 이어받아 한식당을 열었어요. 예약이 석 달 밀렸어요.') },
  { id: 'creator', group: '기술', name: '크리에이터', icon: '🎥', req: () => ({ courage: 60, craft: 55 }), awards: 5, text: t('직접 찍고 편집한 도전 영상으로 구독자 100만 명을 모았어요.') },
  { id: 'bj', group: '방송', name: '인기 BJ', icon: '🎙️', req: () => ({ courage: 65, stamina: 50 }), counts: { rest: 15 }, text: (s) => `밤마다 라이브 방송을 켜는 "BJ ${s.name}"${hasBatchim(s.name) ? '이' : '가'} 됐어요. 겁 없는 입담에 별풍선이 쏟아져요. 낮엔 자느라 엄마 전화를 잘 못 받아요.` },
  { id: 'farmer', group: '사업', name: '한우농장 사장님', icon: '🐄', req: () => ({ grit: 70, stamina: 55 }), money: 400000, text: t('모아 둔 돈으로 할아버지 농장을 물려받아 키웠어요. 1++ 한우로 품평회 대상을 받았어요.') },
];

export const ENDINGS = {
  champion: { title: '세계탁구선수권 우승', icon: '🏆', group: '탁구', text: (s) => `${STYLES[s.style || 'allround'].win} ${COUNTRIES[s.country].flag} 국기를 들고 시상대 맨 위에 섰어요.` },
  runnerup: { title: '세계탁구선수권 준우승', icon: '🥈', group: '탁구', text: (s) => `결승 마지막 세트 듀스 끝에 아쉽게 졌어요. 그래도 ${COUNTRIES[s.country].flag} 국가대표 은메달이에요.` },
  ...Object.fromEntries(CAREERS.filter((c) => !c.tt).map((c) => [c.id, { title: c.name, icon: c.icon, group: c.group, text: c.text }])),
  office: { title: '회사원', icon: '💼', group: '평범', text: t('특별한 꿈은 못 찾았지만 성실한 회사원이 됐어요. 주말마다 엄마랑 밥 먹는 게 제일 좋대요.') },
  // 배드 엔딩
  homeless: { title: '노숙자', icon: '🥶', bad: true, text: t('돈 관리를 못 해 빈털터리가 됐어요. 오늘은 역 대합실에서 밤을 보내요. 용돈을 모으는 법부터 가르쳐 주세요.') },
  burnout: { title: '번아웃', icon: '🥀', bad: true, text: t('너무 지친 날이 많았어요. 지금은 모든 걸 내려놓고 쉬는 중이에요. 다음엔 쉬는 날도 챙겨 주세요.') },
  runaway: { title: '연락 끊긴 아들', icon: '🚪', bad: true, text: t('어느 날 쪽지 한 장만 남기고 집을 나갔어요. 인성 교육이 부족했나 봐요.') },
  neet: { title: '방구석 백수', icon: '🛌', bad: true, text: t('하고 싶은 게 없대요. 오늘도 방에서 게임만 해요.') },
};
export const ENDING_IDS = Object.keys(ENDINGS);

const meets = (s, req) => Object.entries(req).every(([k, v]) => s.stats[k] >= v);
const countsOk = (s, c) => Object.entries(c.counts || {}).every(([k, v]) => (s.counts[k] || 0) >= v);
export function careerOk(s, c) {
  if (!meets(s, c.req(s)) || !countsOk(s, c)) return false;
  if (c.racket && !s.racket) return false;
  if (c.tt && s.points < COUNTRIES[s.country].need) return false;
  if (c.money && s.money < c.money) return false;
  if (c.awards && s.awards < c.awards) return false;
  return true;
}
// 진행률: 요구 스탯(과 포인트, 돈)을 얼마나 채웠는지
export function careerProgress(s, c) {
  const parts = Object.entries(c.req(s)).map(([k, v]) => Math.min(1, s.stats[k] / v));
  if (c.tt) parts.push(Math.min(1, s.points / COUNTRIES[s.country].need));
  if (c.money) parts.push(Math.min(1, s.money / c.money));
  if (c.awards) parts.push(Math.min(1, s.awards / c.awards));
  for (const [k, v] of Object.entries(c.counts || {})) parts.push(Math.min(1, (s.counts[k] || 0) / v));
  if (c.racket && !s.racket) parts.push(0);
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}
// 요구치를 얼마나 넘겼는지 (0~1)
function surplus(s, req) {
  const e = Object.entries(req);
  return e.map(([k, v]) => Math.max(0, s.stats[k] - v) / (100 - v)).reduce((a, b) => a + b, 0) / e.length;
}
export const totalStats = (s) => Object.values(s.stats).reduce((a, b) => a + b, 0);
export const BURNOUT_LIMIT = 8;

export function likeness(s, c) {
  const req = c.req(s);
  let dot = 0, vv = 0, rr = 0;
  for (const { key } of STATS) {
    const v = s.stats[key], r = req[key] || 0;
    dot += v * r; vv += v * v; rr += r * r;
  }
  return dot / Math.sqrt(vv * rr || 1);
}

export function finalChance(s) {
  const c = 0.2 + 0.45 * surplus(s, reqOf(s)) + 0.2 * fitLevel(s) + (s.racket ? RACKETS[s.racket].edge : 0) + ((s.style && STYLES[s.style].finalEdge) || 0);
  return Math.max(0.05, Math.min(0.95, c));
}

export function decideEnding(s, rng = Math.random) {
  if (s.stats.manner <= 15) return 'runaway';
  if (s.burnout >= BURNOUT_LIMIT) return 'burnout';
  const ok = CAREERS.filter((c) => careerOk(s, c));
  if (ok.length) {
    // 탁구 국가대표 자격이면 결승전. 아니면 아이의 스탯 모양이 직업의 요구 스탯 모양과
    // 가장 닮은 직업 (코사인 유사도). 지능이 인성보다 높으면 교수, 반대면 선생님 같은 식.
    const best = ok.find((c) => c.tt) || ok.sort((a, b) => likeness(s, b) - likeness(s, a))[0];
    if (best.tt) return rng() < finalChance(s) ? 'champion' : 'runnerup';
    return best.id;
  }
  if (s.money < 15000) return 'homeless';
  return totalStats(s) < 250 ? 'neet' : 'office';
}

export const GALLERY = [
  { id: 'first', name: '첫 걸음', icon: '👣', hint: '이틀째 맞이하기', ok: (s) => s.day >= 2 },
  { id: 'club', name: '탁구 유니폼', icon: '🎽', type: 'outfit', hint: '탁구 대회 첫 승리', ok: (s) => s.ttWins >= 1 },
  { id: 'overalls', name: '농장 작업복', icon: '🧑‍🌾', type: 'outfit', hint: '끈기 50 달성', ok: (s) => s.stats.grit >= 50 },
  { id: 'workwear', name: '전기 작업복', icon: '🦺', type: 'outfit', hint: '손재주 50 달성', ok: (s) => s.stats.craft >= 50 },
  { id: 'firecoat', name: '방화복', icon: '🧑‍🚒', type: 'outfit', hint: '용기 50 달성', ok: (s) => s.stats.courage >= 50 },
  { id: 'labcoat', name: '연구 가운', icon: '🥼', type: 'outfit', hint: '지능 60 달성', ok: (s) => s.stats.smarts >= 60 },
  { id: 'national', name: '국가대표 유니폼', icon: '🎖️', type: 'outfit', hint: '탁구 70 달성', ok: (s) => s.stats.skill >= 70 },
  { id: 'medal', name: '금메달', icon: '🥇', type: 'acc', hint: '상장 10개 모으기', ok: (s) => s.awards >= 10 },
]

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
function tidy(s) {
  for (const k in s.stats) s.stats[k] = clamp(Math.round(s.stats[k]), 0, statCap(s.day));
  s.cond = clamp(Math.round(s.cond));
  s.points = Math.max(0, Math.round(s.points));
}

export function newGame({ name = '빔', parent = '엄마', country = 'kor' } = {}, rng = Math.random) {
  const s = {
    name, parent, country, racket: null, style: null,
    day: 1, ap: AP_PER_DAY, money: 60000, points: 0, cond: 80, burnout: 0, awards: 0, ttWins: 0, counts: {},
    stats: Object.fromEntries(STATS.map((t) => [t.key, 8 + Math.floor(rng() * 5)])),
    match: Math.floor(rng() * MATCHES.length), matchDone: false,
    today: [], log: [], unlocked: [], outfit: 'basic', acc: null, sound: true, ending: null,
  };
  // 인성은 너무 낮으면 배드 엔딩이라 조금 높게 시작
  s.stats.manner += 10;
  for (const [k, v] of Object.entries(COUNTRIES[country].bonus)) s.stats[k] += v;
  tidy(s);
  return s;
}

export function chooseRacket(s, racket) {
  if (s.racket || !RACKETS[racket]) return false;
  s.racket = racket;
  return true;
}
// 탁구를 시작한 아이만, 22일째 이후 한 번
export function chooseStyle(s, style) {
  if (!needsStyle(s) || !STYLES[style]) return false;
  s.style = style;
  return true;
}
export const needsStyle = (s) => !!s.racket && !s.style && !s.ending && s.day >= STYLE_DAY;

const condFactor = (c) => (c < 30 ? 0.5 : c >= 70 ? 1.2 : 1);
const trainMult = (s, k) => ((s.racket && RACKETS[s.racket].mult[k]) || 1) * ((s.style && STYLES[s.style].mult[k]) || 1);

// 성공하면 { line, deltas }, 못 하면 { error } 를 돌려준다. state 를 직접 바꾼다.
export function doAction(s, key, rng = Math.random) {
  const a = ACTIONS[key];
  if (s.ending) return { error: '이미 엔딩을 봤어요.' };
  if (needsStyle(s)) return { error: '먼저 탁구 전형을 골라 주세요.' };
  if (key === 'lesson' && !s.racket) return { error: '먼저 라켓을 골라 주세요.' };
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
    const pay = Math.round((15000 + s.stats.grit * 400) * (1 + stageIndex(s.day) * 0.5));
    s.money += pay; deltas['돈'] = pay;
  }
  s.cond += a.cond; deltas['컨디션'] = a.cond;
  s.ap -= 1;
  s.counts[key] = (s.counts[key] || 0) + 1;
  s.today.push(a.icon);
  tidy(s);
  return { line: f < 1 ? '조금 힘들어…' : a.line, deltas };
}

export function doMatch(s, rng = Math.random) {
  if (s.ending) return { error: '이미 엔딩을 봤어요.' };
  if (needsStyle(s)) return { error: '먼저 탁구 전형을 골라 주세요.' };
  if (s.matchDone) return { error: '오늘 도전은 이미 끝났어요.' };
  if (s.ap < 2) return { error: '도전은 일정 2칸이 필요해요.' };
  if (s.cond <= 20) return { error: '컨디션이 너무 낮아서 나갈 수 없어요.' };
  const mt = MATCHES[s.match];
  const m = STAGES[stageIndex(s.day)].mult;
  const win = rng() < matchChance(s);
  const points = mt.points ? (win ? mt.points * m : mt.points * m * 0.1) : 0;
  const prize = win ? mt.prize * (1 + stageIndex(s.day)) : 0;
  s.points += points; s.money += prize; s.cond -= 15;
  if (win) { s.stats[mt.stat] += 3; s.awards += 1; if (mt.points) s.ttWins += 1; }
  s.ap -= 2; s.matchDone = true; s.today.push(mt.icon, mt.icon);
  tidy(s);
  return {
    win,
    line: win ? '상 받았어! 봤지?' : '다음엔 꼭 이길 거야',
    deltas: { ...(points && { 포인트: Math.round(points) }), ...(prize && { 돈: prize }), ...(win && { [statName(mt.stat)]: 3 }), 컨디션: -15 },
  };
}

export function endDay(s, rng = Math.random) {
  if (s.ending) return {};
  const m = STAGES[stageIndex(s.day)].mult;
  const before = s.points;
  if (s.racket) s.points += s.points * 0.02 + s.stats.skill * m * 0.8;
  const tired = s.cond <= 15;
  if (tired) { s.burnout += 1; s.stats.manner -= 3; } // 너무 지친 날은 짜증이 늘어 인성이 깎인다
  s.log.unshift({ day: s.day, acts: s.today.join(' '), points: Math.round(s.points - before), tired });
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
  return { event, tired, grew: stageIndex(Math.min(s.day, DAYS)) > prevStage };
}

export function newUnlocks(s) {
  const fresh = GALLERY.filter((g) => !s.unlocked.includes(g.id) && g.ok(s));
  s.unlocked.push(...fresh.map((g) => g.id));
  return fresh;
}

export const level = (s) => 1 + Math.floor(totalStats(s) / 40);
// 지금 스탯으로 가장 가까운 직업 n개
export const topCareers = (s, n = 3) =>
  CAREERS.map((c) => ({ c, p: careerProgress(s, c) })).sort((a, b) => b.p - a.p).slice(0, n);
// 랭킹 포인트 → 세계 랭킹 (0점 999위, 1만 약 200위, 10만 약 8위). 1위는 우승해야 차지한다.
export const worldRank = (s) =>
  s.ending === 'champion' ? 1 : Math.max(2, Math.round(999 / (1 + (s.points / 4000) ** 1.5)));
export function fmtNum(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}만`;
  return n.toLocaleString();
}
