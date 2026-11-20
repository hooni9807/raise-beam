// 게임 규칙만 담은 순수 로직. DOM 없음 → node test.mjs 로 검증 가능.
// 84일 동안 희범이를 키우면 스탯에 맞는 직업 엔딩(또는 배드 엔딩)이 나온다.

// 캐릭터 이름은 임희범으로 고정
export const SON = { name: '임희범', nick: '희범', short: '범' };

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
  kor: { name: '대한민국', flag: '🇰🇷', need: 100000 },
  chn: { name: '중국', flag: '🇨🇳', need: 150000 },
  jpn: { name: '일본', flag: '🇯🇵', need: 100000 },
  ger: { name: '독일', flag: '🇩🇪', need: 100000 },
  swe: { name: '스웨덴', flag: '🇸🇪', need: 80000 },
};

export const STAGES = [
  { id: 'baby', name: '애기범', from: 1, age: [1, 6], mult: 1 },
  { id: 'kid', name: '꼬마범', from: 22, age: [7, 12], mult: 3 },
  { id: 'teen', name: '사춘기범', from: 43, age: [13, 18], mult: 6 },
  { id: 'adult', name: '어른범', from: 64, age: [19, 24], mult: 12 },
];

export const stageIndex = (day) => STAGES.findLastIndex((s) => day >= s.from);
export const stageOf = (day) => STAGES[stageIndex(day)];
export function ageOf(day) {
  const s = stageOf(day);
  return s.age[0] + Math.floor(((day - s.from) * (s.age[1] - s.age[0] + 1)) / 21);
}
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const dateLabel = (day) => `${Math.ceil(day / 7)}주차 ${WEEKDAYS[(day - 1) % 7]}요일`;

// 나이대별 성장 한계: 애기범 30, 꼬마범 55, 사춘기범 80, 어른범 100
export const STAT_CAPS = [30, 55, 80, 100];
export const statCap = (day) => STAT_CAPS[stageIndex(Math.min(day, DAYS))];

export const CLUB = {
  lesson: { name: '레슨 받기', desc: '레슨비 2만원 · 탁구와 체력 훈련', icon: '🏓', cost: 20000, cond: -12, gain: { skill: 3, stamina: 1 }, line: '오늘 서브 완전 잘 들어갔어!' },
  teach: { name: '다른 사람 가르치기', icon: '📋', cond: -8, gain: { manner: 2, skill: 1 }, desc: '회원 지도 · 지도비 1만원', pay: 10000, line: '처음 온 회원이 드디어 서브에 성공했어!' },
  league: { name: '리그전 출전', icon: '🏆', cond: -16, gain: { stamina: 2, skill: 1 }, desc: '한 경기 출전 · 결과에 따라 랭킹 포인트 획득' },
};
export const clubVisits = s => Object.keys(CLUB).reduce((n, k) => n + (s.counts[k] || 0), 0);
export const ACTIONS = {
  meal: { name: '밥 먹이기', icon: '🍚', cost: 8000, cond: 15, gain: { stamina: 2 }, line: '냠냠, 든든해!' },

  study: { name: '공부', icon: '📚', cost: 10000, cond: -10, gain: { smarts: 3 }, line: '오늘 배운 거 다 기억해!' },
  run: { name: '운동', icon: '🏃', cond: -10, gain: { stamina: 3 }, line: '땀 흘리니까 개운해' },
  safety: { name: '고시 준비', icon: '📝', cond: -10, gain: { courage: 3 }, line: '어려운 기출문제도 끝까지 풀었어!' },
  farm: { name: '농장 알바가기', icon: '🐄', cond: -15, gain: { grit: 2, stamina: 1 }, earn: true, line: '송아지 밥 주고 알바비 받았어!' },
  volunteer: { name: '집안일 하기', icon: '🧹', cond: -6, gain: { manner: 3 }, line: '내가 먼저 치웠어!' },
  craft: { name: '기술 배우기', icon: '🔧', cost: 10000, cond: -8, gain: { craft: 3, smarts: 1 }, line: '전구에 불 들어왔어!' },
  rest: { name: '쉬기', icon: '🛋️', cond: 25, gain: {}, line: '잠깐 낮잠 잘게…' },
};

export const FITNESS = {
  run: { ...ACTIONS.run, name: '체력 단련', desc: '스스로 운동하며 체력을 길러요.' },
  instruct: { name: '회원 운동 지도', icon: '💪', desc: '자세를 알려 주며 체력과 인성을 길러요.', cond: -8, gain: { stamina: 2, manner: 2 }, line: '함께 연습하니 자세가 좋아졌어!' },
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
  return Math.max(0.1, Math.min(0.95, c));
}

const EVENTS = [
  { face: 'surprised', title: '스카우트 제의', text: '실업팀 감독님이 탁구 치는 모습을 눈여겨보고 가셨어요.', apply: (st, m) => { if (clubVisits(st)) st.points += 400 * m; else st.stats.skill += 2; } },
  { face: 'sick', title: '감기에 걸렸어요', text: '콧물이 줄줄. 오늘은 푹 쉬게 해 주세요.', apply: (st) => (st.cond -= 20) },
  { face: 'surprised', title: '할머니 용돈', text: '할머니가 몰래 봉투를 쥐여 주셨어요.', apply: (st) => (st.money += 20000) },
  { face: 'surprised', title: '송아지가 태어났어요', text: '할아버지 농장에서 송아지 출산을 밤새 도왔어요.', apply: (st) => { st.stats.grit += 3; st.cond -= 8; } },
  { face: 'praised', title: '불이야!', text: '옆집 쓰레기통 불을 소화기로 끄고 칭찬을 받았어요.', apply: (st) => { st.stats.courage += 3; st.stats.manner += 1; } },
  { face: 'peace', title: '선생님 칭찬', text: '담임 선생님이 "질문을 정말 잘한다"고 하셨대요.', apply: (st) => (st.stats.smarts += 3) },
  { face: 'pout', title: '솔깃한 투자 권유', text: '"돈 두 배로 불려 줄게"라는 말에 넘어갈 뻔했어요.', apply: (st) => { if (st.stats.smarts < 40) st.money = Math.floor(st.money / 2); else st.stats.smarts += 2; } },
  { face: 'praised', title: '고장 난 선풍기', text: '드라이버로 뚝딱뚝딱, 선풍기를 직접 고쳤어요.', apply: (st) => (st.stats.craft += 3) },
  { face: 'defeat', title: '친구랑 싸웠어요', text: '분해서 울다가, 먼저 사과하고 화해했어요.', apply: (st) => { st.cond -= 10; st.stats.manner += 2; } },
];

/* ---------- 엔딩 ---------- */
// 직업: 조건(스탯, 돈, 상장, 훈련 횟수)을 모두 채운 직업 중 가장 여유 있게 채운 직업이 엔딩이 된다.
// 프린세스 메이커처럼 스탯뿐 아니라 "무엇을 몇 번 했는지"도 엔딩을 가른다.
const t = (text) => () => text;
export const CAREERS = [
  // 몸 쓰는 일
  { id: 'trainer', group: '운동', name: '헬스 트레이너', icon: '💪', req: () => ({ stamina: 85, manner: 40 }), text: t('체육관을 열었어요. 회원들이 줄을 서요.') },
  { id: 'firefighter', group: '안전', name: '소방관', icon: '🚒', req: () => ({ courage: 70, stamina: 65, manner: 50 }), text: t('불길 속에서 아이를 구해 나왔어요. 동네의 영웅이 됐어요.') },
  { id: 'police', group: '안전', name: '경찰관', icon: '👮', req: () => ({ courage: 65, manner: 60, smarts: 50 }), text: t('어르신 길 안내부터 범인 검거까지, 동네 지구대의 든든한 경찰관이 됐어요.') },
  { id: 'astronaut', group: '과학', name: '우주비행사', icon: '🚀', req: () => ({ smarts: 75, courage: 75, stamina: 70 }), text: t('우주정거장에서 지구를 내려다보며 집에 영상 통화를 걸었어요.') },
  // 공부하는 일
  { id: 'doctor', group: '의료', name: '의사', icon: '🩺', req: () => ({ smarts: 85, manner: 60, grit: 60 }), text: t('소아과 의사가 됐어요. 주사 맞는 아이들에게 사탕을 꼭 챙겨 줘요.') },
  { id: 'nurse', group: '의료', name: '간호사', icon: '💉', req: () => ({ manner: 70, stamina: 60, smarts: 55 }), text: t('응급실 간호사가 됐어요. 밤새 환자 곁을 지키는 따뜻한 손이에요.') },
  { id: 'scientist', group: '과학', name: '생명과학자', icon: '🔬', req: () => ({ smarts: 85, grit: 70 }), text: t('10년 연구 끝에 새로운 치료 물질을 발견해 박사가 됐어요. 논문 감사의 말에 부모님 이름을 적었어요.') },
  { id: 'professor', group: '교육', name: '교수', icon: '🎓', req: () => ({ smarts: 75, manner: 65 }), text: t('대학 강의실이 늘 꽉 차는 인기 교수님이 됐어요.') },
  { id: 'teacher', group: '교육', name: '초등학교 선생님', icon: '🍎', req: () => ({ manner: 75, smarts: 55 }), text: t('아이들이 제일 좋아하는 담임 선생님이 됐어요.') },
  // 손 쓰는 일
  { id: 'electrician', group: '기술', name: '전기기사', icon: '⚡', req: () => ({ craft: 70, smarts: 55, courage: 40 }), counts: { craft: 15 }, text: t('전기기사 자격증을 따서 새 아파트 단지 배선을 깔아요. 정전 난 동네에 제일 먼저 달려가요.') },
  { id: 'chef', group: '기술', name: '한식 셰프', icon: '👨‍🍳', req: () => ({ craft: 65, stamina: 55, grit: 55 }), text: t('할머니 손맛을 이어받아 한식당을 열었어요. 예약이 석 달 밀렸어요.') },
  { id: 'creator', group: '기술', name: '크리에이터', icon: '🎥', req: () => ({ courage: 60, craft: 55 }), awards: 5, text: t('직접 찍고 편집한 도전 영상으로 구독자 100만 명을 모았어요.') },
  { id: 'bj', group: '방송', name: '인기 BJ', icon: '🎙️', req: () => ({ courage: 65, stamina: 50 }), counts: { rest: 15 }, text: t(`밤마다 라이브 방송을 켜는 "BJ ${SON.short}"이 됐어요. 겁 없는 입담에 별풍선이 쏟아져요. 낮엔 자느라 집에 전화를 잘 못 해요.`) },
  { id: 'farmer', group: '사업', name: '한우농장 사장님', icon: '🐄', req: () => ({ grit: 70, stamina: 55 }), money: 400000, text: t('모아 둔 돈으로 할아버지 농장을 물려받아 키웠어요. 1++ 한우로 품평회 대상을 받았어요.') },
];

const SPECIAL_ENDINGS = [
  {"id": "nightgym", "title": "마지막 불을 켜는 관장", "text": "회원들이 야간 근무를 마칠 때마다 체육관 문을 열어 줬어요. 이제 회원들이 돌아가며 새벽반의 열쇠를 맡습니다.", "counts": {"instruct": 26, "run": 25, "volunteer": 16}, "stats": {"stamina": 85, "manner": 65}, "hidden": true},
  {"id": "repairbus", "title": "골목의 수리 버스", "text": "공구함을 실은 낡은 버스가 첫 골목에 섰어요. 할머니의 선풍기가 다시 돌자 다음 집에서도 손을 흔듭니다.", "counts": {"craft": 30, "volunteer": 23, "farm": 16}, "stats": {"craft": 82, "manner": 60}, "hidden": true},
  {"id": "seedvault", "title": "씨앗 금고지기", "text": "농장에서 적어 둔 생육 일지를 씨앗 봉투마다 붙였어요. 사라진 줄 알았던 품종이 이듬해 다시 싹을 틔웠습니다.", "counts": {"farm": 34, "study": 26, "craft": 12}, "stats": {"grit": 82, "smarts": 65}, "hidden": true},
  {"id": "racketlab", "title": "라켓 연구소장", "text": "부러진 라켓의 손잡이를 고치다가 새 모형을 만들었어요. 동네 선수들이 저마다 손에 맞는 라켓을 주문합니다.", "counts": {"lesson": 26, "craft": 27, "league": 14}, "stats": {"skill": 72, "craft": 75}, "hidden": true},
  {"id": "supper", "title": "골목의 심야 식당", "text": "야근을 마친 이웃에게 건넨 한 그릇이 시작이었어요. 희범이 식당의 마지막 주문은 늘 “오늘도 그거 주세요”입니다.", "counts": {"meal": 32, "volunteer": 28, "farm": 24}, "stats": {"manner": 75, "grit": 63}, "hidden": true},
  {"id": "rescue", "title": "산악 구조대장", "text": "해가 넘어가기 전 마지막 등산객을 찾았어요. 무전기에서 전원 귀환이라는 대답이 돌아옵니다.", "counts": {"run": 32, "safety": 30, "volunteer": 15}, "stats": {"stamina": 85, "courage": 80}, "hidden": true},
  {"id": "chalk", "title": "작은 학교의 교장", "text": "폐교 안내문을 떼고 첫 수업 시간을 써 붙였어요. 동네 어른들도 작은 의자를 끌어와 앉습니다.", "counts": {"teach": 26, "study": 30, "volunteer": 20}, "stats": {"smarts": 80, "manner": 78}, "hidden": true},
  {"id": "comeback", "title": "탁구 해설위원", "text": "첫 생중계에서 희범이가 느린 화면을 짚었어요. “공이 옆으로 튀었죠? 라켓이 공의 옆면을 스쳤거든요.” 다음 서브가 들어오자 옆자리 캐스터가 웃었어요. “이번엔 저도 봤어요!”", "counts": {"league": 32, "lesson": 23, "instruct": 16}, "stats": {"skill": 83, "stamina": 62}, "hidden": true},
  {"id": "closedgym", "title": "불 꺼진 체육관", "text": "회원에게 가르칠 동작을 혼자서만 연습했어요. 개장 첫날 텅 빈 사물함에 열쇠가 그대로 걸려 있습니다.", "counts": {"run": 40, "instruct": 4}, "stats": {}, "cap": {"instruct": 5}},
  {"id": "unsold", "title": "창고에 쌓인 수확", "text": "밭에서는 풍년이었지만 출하 날짜를 놓쳤어요. 농장 창고에 상자만 천장까지 쌓였습니다.", "counts": {"farm": 43, "rest": 31}, "stats": {}, "cap": {"study": 2}},
  {"id": "spareparts", "title": "멈춘 발명품", "text": "부품을 사서 조립하고 다시 뜯는 동안 설명서는 첫 장 그대로였어요. 시연 날에도 스위치는 켜지지 않았습니다.", "counts": {"craft": 37, "farm": 15}, "stats": {}, "cap": {"study": 2}},
  {"id": "emptystand", "title": "관중 없는 결승", "text": "경기 수를 채우느라 기본기를 배울 날을 계속 미뤘어요. 예선이 끝난 뒤 빈 관중석을 보며 혼자 공을 주웠습니다.", "counts": {"league": 43, "run": 15}, "stats": {}, "cap": {"lesson": 2}},
  {"id": "closedbook", "title": "접수 못 한 시험", "text": "기출문제집에는 풀이가 빼곡한데 원서의 마지막 칸은 비어 있었어요. 접수 창구에 도착했을 때 셔터가 내려갔습니다.", "counts": {"safety": 42, "rest": 30}, "stats": {}, "cap": {"study": 2}},
  {"id": "emptyclass", "title": "수강생 없는 교실", "text": "같은 시범을 몇 번이고 되풀이했어요. 마지막 회원이 남긴 새로운 기술을 배우고 싶다는 쪽지를 뒤늦게 읽었습니다.", "counts": {"teach": 36, "run": 16}, "stats": {}, "cap": {"lesson": 2}},
  {"id": "coldmeal", "title": "식어 버린 저녁상", "text": "매일 한 상씩 차렸지만 누구를 초대할지 생각하지 못했어요. 마지막 접시를 내놓자 처음 담은 국은 벌써 차가웠습니다.", "counts": {"meal": 44, "farm": 17}, "stats": {}, "cap": {"volunteer": 2}},
  {"id": "blankstage", "title": "리허설로 끝난 무대", "text": "발표 자료와 소품은 다 준비됐어요. 연습만 하다 발표 신청 버튼을 누르지 못해 무대 뒤에서 조명이 꺼지는 걸 봤습니다.", "counts": {"study": 34, "craft": 27}, "stats": {}, "cap": {"safety": 2}},
];

export const ENDINGS = {
  ...Object.fromEntries(SPECIAL_ENDINGS.map(e => [e.id, {
    title: e.title, text: t(e.text), hidden: !!e.hidden, bad: !e.hidden,
    group: e.hidden ? '히든 엔딩' : '배드 엔딩',
  }])),
  pro: { title: '실업팀 탁구선수', icon: '🏓', group: '탁구', text: t('레슨에서 익힌 기술을 리그전에서 보여 주고 실업팀에 입단했어요.') },
  coach: { title: '탁구 코치', icon: '📋', group: '탁구', text: t('처음 서브도 못 넣던 회원이 첫 승리를 따냈어요. 가장 먼저 희범이에게 달려왔어요.') },
  gym: { title: '탁구장 관장', icon: '🏟️', group: '탁구', text: t('배우고 가르치고 리그를 뛰며 모은 돈으로 동네 탁구장을 열었어요.') },
  cleaner: { title: '탁구장 청소부', icon: '🧹', group: '탁구', text: t('아침 첫 경기가 시작되기 전, 탁구대를 닦고 흩어진 공을 모아요. 회원들이 가장 먼저 인사하는 사람이 됐어요.') },
  champion: { title: '세계탁구선수권 우승', icon: '🏆', group: '탁구', text: (s) => `리그에서 갈고닦은 서브로 세계선수권 결승을 끝냈어요. ${COUNTRIES[s.country].flag} 국기를 들고 시상대 맨 위에 섰어요.` },
  runnerup: { title: '세계탁구선수권 준우승', icon: '🥈', group: '탁구', text: (s) => `결승 마지막 세트 듀스 끝에 아쉽게 졌어요. 그래도 ${COUNTRIES[s.country].flag} 국가대표 은메달이에요.` },
  ...Object.fromEntries(CAREERS.filter((c) => !c.tt).map((c) => [c.id, { title: c.name, icon: c.icon, group: c.group, text: c.text }])),
  office: { title: '회사원', icon: '💼', group: '평범', text: t('특별한 꿈은 못 찾았지만 성실한 회사원이 됐어요. 주말마다 집에 와서 밥 먹는 게 제일 좋대요.') },
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
  if (c.money && s.money < c.money) return false;
  if (c.awards && s.awards < c.awards) return false;
  return true;
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

export const isTableTennisPro = s => s.counts.league >= 8 && s.counts.lesson >= 6 && s.stats.skill >= 55;

export function decideEnding(s, rng = Math.random) {
  if (s.stats.manner <= 15) return 'runaway';
  if (s.burnout >= BURNOUT_LIMIT) return 'burnout';
  const special = s.followClue && SPECIAL_ENDINGS.find(e => countsOk(s, e) && meets(s, e.stats)
    && Object.entries(e.cap || {}).every(([key, max]) => (s.counts[key] || 0) <= max));
  if (special) return special.id;
  const { lesson = 0, teach = 0, league = 0 } = s.counts;
  const visits = lesson + teach + league;
  if (teach >= 8 && lesson >= 8 && league >= 8 && s.money >= 300000) return 'gym';
  if (teach >= 12 && teach >= league && teach >= lesson) return 'coach';
  if (isTableTennisPro(s)) {
    if (league >= 15 && s.stats.skill >= 80 && s.country && s.points >= COUNTRIES[s.country].need) {
      return rng() < Math.min(0.9, 0.4 + s.ttWins * 0.025) ? 'champion' : 'runnerup';
    }
    return 'pro';
  }
  const ok = CAREERS.filter((c) => careerOk(s, c));
  if (s.counts.instruct >= 12 && ok.some(c => c.id === 'trainer')) return 'trainer';
  if (ok.length) {
    return ok.sort((a, b) => likeness(s, b) - likeness(s, a))[0].id;
  }
  if (visits >= 6) return 'cleaner';
  if (s.money < 15000) return 'homeless';
  return totalStats(s) < 250 ? 'neet' : 'office';
}

export const LIFE_PATHS = {
  sora: { name: '소라', detail: '동네 라디오 작가 · 25세', letter: '“십 년 뒤에도 네 목소리를 녹음하고 싶어. 저녁마다 오늘 얘기를 들려줄래?”',
    title: '우리 집 심야 라디오', after: '둘은 저녁마다 작은 녹음기를 켰어요. 희범이가 보낸 하루가 소라의 주말 라디오 코너가 됐습니다.',
    hard: '소라는 방송이 끝나면 녹음기를 껐어요. 힘들었던 오늘 얘기는 둘만 듣기로 했습니다.' },
  jiho: { name: '지호', detail: '목수 · 26세', letter: '“우리 식탁은 내가 만들게. 친구가 갑자기 놀러 와도 한 자리 더 내주는 집에서 살자.”',
    title: '한 자리 더 있는 식탁', after: '지호가 만든 긴 식탁에 희범이가 첫 손님을 불렀어요. 일요일마다 이웃들이 반찬 하나씩 들고 찾아오는 집이 됐습니다.',
    hard: '힘든 시절, 지호와 희범이는 작은 상을 고쳐 썼어요. 둘이 마주 앉아 따뜻한 밥을 먹을 자리는 충분했습니다.' },
  yul: { name: '율', detail: '철도 승무원 · 24세', letter: '“다음 쉬는 날엔 종점까지 가 보자. 돌아올 집도, 처음 보는 풍경도 너랑 나누고 싶어.”',
    title: '종점에서 보낸 엽서', after: '둘은 휴일마다 낯선 역에서 내렸어요. 냉장고 문이 여행지에서 서로에게 부친 엽서로 가득 찼습니다.',
    hard: '멀리 떠나기 어려운 날에는 율과 동네 정거장까지 걸었어요. 첫 엽서에는 오늘 둘이 본 노을을 그렸습니다.' },
  solo: { name: '혼자 살기', detail: '희범이가 자신에게 쓴 편지', letter: '“일단 내 열쇠로 내 집 문을 열어 보고 싶어. 방 한 칸은 꼭 내가 좋아하는 걸로 채울래.”',
    title: '내 이름이 적힌 문패', after: '희범이는 현관에 직접 쓴 문패를 달았어요. 첫 집들이가 끝난 밤, 좋아하는 음반을 골라 온전히 자기만의 저녁을 보냈습니다.',
    hard: '희범이는 새 공책 첫 장에 다시 해 보고 싶은 일을 적었어요. 작은 방에서 자기 속도로 다음 날을 준비했습니다.' },
};

export const canChooseLife = s => !s.ending && !s.lifePath && ageOf(s.day) >= 22;

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

export function newGame({ country = null, gender = 'male' } = {}, rng = Math.random) {
  const s = {
    name: SON.name, gender, country,
    day: 1, ap: AP_PER_DAY, money: 60000, points: 0, cond: 80, burnout: 0, awards: 0, ttWins: 0, counts: {},
    stats: Object.fromEntries(STATS.map((t) => [t.key, 8 + Math.floor(rng() * 5)])),
    match: Math.floor(rng() * MATCHES.length), matchDone: false,
    today: [], log: [], unlocked: [], outfit: 'basic', acc: null, sound: true, ending: null,
  };
  // 인성은 너무 낮으면 배드 엔딩이라 조금 높게 시작
  s.stats.manner += 13;
  s.stats.grit += 6;
  tidy(s);
  s.startingStatsTotal = totalStats(s);
  return s;
}

const condFactor = (c) => (c < 30 ? 0.5 : c >= 70 ? 1.2 : 1);

// 숫자는 같은 상황에서 촬영한 사진을 바탕으로 그린 어른 남자 희범이의 개별 초상화다.
// stages는 기존 나이별 표정, adult는 남자 어른범의 상황별 순서다.
const REACTIONS = {
  meal:      { stages: ['bite', 'relaxed'], adult: [13, 8, 54, 12, 37, 10, 9, 19, 'bite', 'relaxed'] },
  rest:      { stages: ['doze', 'relaxed'], adult: [14, 26, 29, 36, 15, 27, 28, 'doze', 'relaxed'] },
  study:     { stages: ['focus'], adult: [49, 6, 50, 7, 57, 'focus'] },
  safety:    { stages: ['focus', 'determined'], adult: [38, 49, 39, 'focus', 'determined'] },
  run:       { stages: ['victory', 'determined'], adult: [17, 42, 16, 44, 18, 'victory', 'determined'] },
  farm:      { stages: ['determined', 'surprised'], adult: [17, 16, 18, 'determined', 'surprised'] },
  volunteer: { stages: ['praised', 'peace'], adult: [3, 47, 2, 48, 'peace', 'praised'] },
  craft:     { stages: ['victory', 'praised'], adult: [55, 57, 56, 'victory', 'praised'] },
  lesson:    { stages: ['determined', 'focus'], adult: [51, 59, 52, 60, 53, 61, 58, 'determined', 'focus'] },
  teach:     { stages: ['praised', 'peace'], adult: [20, 22, 11, 21, 43, 23, 'praised', 'peace'] },
  win:       { stages: ['peace', 'victory'], adult: [46, 62, 45, 47, 48, 'peace', 'victory'] },
  loss:      { stages: ['pout', 'defeat'], adult: [40, 57, 41, 'pout', 'defeat'] },
  talk:      { stages: ['yawn'], adult: [2, 5, 24, 4, 0, 25, 1, 38, 3, 'yawn'] },
  tired:     { stages: ['doze'], adult: [29, 30, 35, 31, 36, 32, 26, 33, 34, 'doze'] },
  surprised: { stages: ['surprised'], adult: [62, 9, 'surprised'] },
  sick:      { stages: ['sick'], adult: ['sick', 36] },
  praised:   { stages: ['praised'], adult: [4, 48, 'praised'] },
  peace:     { stages: ['peace'], adult: [45, 46, 'peace'] },
  pout:      { stages: ['pout'], adult: [41, 40, 'pout'] },
  defeat:    { stages: ['defeat'], adult: ['defeat', 39] },
};

export function reactionFace(s, occasion, turn) {
  const pool = REACTIONS[occasion];
  const adult = s.gender !== 'female' && stageOf(s.day).id === 'adult';
  const faces = adult ? pool.adult : pool.stages;
  const face = faces[(turn - 1) % faces.length];
  return typeof face === 'number' ? 'photo' + String(face).padStart(2, '0') : face;
}

// 성공하면 행동 결과와 그에 맞는 표정을 돌려준다.
export function doAction(s, key, rng = Math.random) {
  const a = ACTIONS[key] || CLUB[key] || FITNESS[key];
  if (s.ending) return { error: '이미 엔딩을 봤어요.' };
  if (s.ap < 1) return { error: '오늘 일정이 꽉 찼어요. 하루를 마쳐 주세요.' };
  if (a.cost && s.money < a.cost) return { error: `돈이 ${(a.cost - s.money).toLocaleString()}원 부족해요.` };
  if (s.cond <= 10 && a.cond < 0) return { error: '너무 지쳤어요. 밥을 먹이거나 쉬게 해 주세요.' };

  const f = condFactor(s.cond);
  const deltas = {};
  for (const [k, v] of Object.entries(a.gain)) {
    const g = Math.max(1, Math.round((v + rng()) * f * (1 - s.stats[k] / 150)));
    s.stats[k] += g;
    deltas[statName(k)] = g;
  }
  if (a.cost) { s.money -= a.cost; deltas['돈'] = -a.cost; }
  const turn = (s.counts[key] || 0) + 1;
  let occasion = key === 'instruct' ? 'praised' : key;
  let line = a.line;
  if (a.pay) { s.money += a.pay; deltas['돈'] = a.pay; }
  if (key === 'league') {
    const win = rng() < Math.min(0.9, 0.25 + s.stats.skill / 140);
    const points = (win ? 900 : 150) * STAGES[stageIndex(s.day)].mult;
    s.points += points;
    if (win) s.ttWins++;
    occasion = win ? 'win' : 'loss';
    deltas['포인트'] = points;
    line = win ? '리그에서 이겼어! 마지막 서브가 통했어.' : '리그에서 졌어. 다음엔 리시브를 바꿔 볼래.';
  }
  if (a.earn) {
    const pay = Math.round((15000 + s.stats.grit * 400) * (1 + stageIndex(s.day) * 0.5));
    s.money += pay; deltas['돈'] = pay;
  }
  s.cond += a.cond; deltas['컨디션'] = a.cond;
  s.ap -= 1;
  s.counts[key] = turn;
  s.today.push(a.icon);
  tidy(s);
  return { face: reactionFace(s, occasion, turn), line: f < 1 && key !== 'league' ? '조금 힘들어…' : line, deltas };
}

export function doMatch(s, rng = Math.random) {
  if (s.ending) return { error: '이미 엔딩을 봤어요.' };
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
    win, face: reactionFace(s, win ? 'win' : 'loss', s.day),
    line: win ? '상 받았어! 봤지?' : '다음엔 꼭 이길 거야',
    deltas: { ...(points && { 포인트: Math.round(points) }), ...(prize && { 돈: prize }), ...(win && { [statName(mt.stat)]: 3 }), 컨디션: -15 },
  };
}

export function endDay(s, rng = Math.random) {
  if (s.ending) return {};
  const m = STAGES[stageIndex(s.day)].mult;
  const before = s.points;
  if (clubVisits(s)) s.points += s.points * 0.02 + s.stats.skill * m * 0.8;
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
    event = { face: reactionFace(s, e.face, s.day), title: e.title, text: e.text };
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

export const level = (s) => 1 + Math.floor(Math.max(0, totalStats(s) - (s.startingStatsTotal ?? 0)) / 40);
// 랭킹 포인트 → 세계 랭킹 (0점 999위, 1만 약 200위, 10만 약 8위). 1위는 우승해야 차지한다.
export const worldRank = (s) =>
  s.ending === 'champion' ? 1 : Math.max(2, Math.round(999 / (1 + (s.points / 4000) ** 1.5)));
export function fmtNum(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}만`;
  return n.toLocaleString();
}
