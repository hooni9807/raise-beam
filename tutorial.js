import { ACTIONS, AP_PER_DAY, newGame, doAction, endDay } from './logic.js?v=photo-expressions';

const SEEN = 'raise-beam-tutorial-v1';
const activities = ['study', 'run', 'rest'];
const $ = id => document.getElementById(id);
const dialog = $('tutorial');
const choices = $('tutorialChoices');
const next = $('tutorialNext');
let dismissed = false;
let practice;
let step;
let activity;
let face;
let feedback;

choices.innerHTML = activities.map(key =>
  `<button type="button" data-practice="${key}"><span aria-hidden="true">${ACTIONS[key].icon}</span>${ACTIONS[key].name}</button>`
).join('');

export function openTutorial(gender, replay = false) {
  if (!replay) {
    try { dismissed ||= !!localStorage.getItem(SEEN); } catch { /* 이번 방문 동안 기억 */ }
    if (dismissed) return;
  }
  practice = newGame({ gender });
  step = 0;
  activity = null;
  feedback = '';
  dialog.showModal();
  showPage();
}

function showPage() {
  const pages = [
    ['하루는 세 칸이에요', '희범이와 보낼 하루를 먼저 연습해 봐요. 이 공책에서 쓴 돈과 일정은 실제 게임에 반영되지 않아요.', '첫 활동 골라 보기'],
    ['첫 칸에 뭘 해 볼까요?', '아래에서 활동 하나를 골라 보세요. 공부와 운동은 능력치를 키우고, 쉬기는 컨디션을 회복해요.', ''],
    ['첫 칸이 채워졌어요', feedback + ' 남은 칸에는 다른 활동을 넣거나, 두 칸을 쓰는 오늘의 도전에 나갈 수 있어요.', '하루 마치기 연습'],
    ['새 하루가 열렸어요', '하루를 마치면 일정 세 칸이 새로 생겨요. 지난 일정은 기록 탭에 남아요. 이제 희범이 곁으로 돌아가 볼까요?', '연습 마치기'],
  ];
  const [title, body, button] = pages[step];
  $('tutorialProgress').textContent = `연습 ${step + 1} / ${pages.length}`;
  $('tutorialTitle').textContent = title;
  $('tutorialText').textContent = body;
  $('tutorialDay').textContent = `연습 ${practice.day}일째 · 남은 일정 ${practice.ap}칸`;
  $('tutorialCondition').textContent = `컨디션 ${practice.cond}% · ${practice.money.toLocaleString('ko-KR')}원`;
  const root = practice.gender === 'female' ? 'img/female' : 'img';
  $('tutorialPortrait').src = activity && step === 2
    ? `${root}/situations/baby/${face}.webp` : `${root}/stages/baby.webp`;
  $('tutorialSlots').innerHTML = Array.from({length: AP_PER_DAY}, (_, i) =>
    practice.today[i] ? `<li class="done">${ACTIONS[activity].name}</li>` : '<li>빈칸</li>'
  ).join('');
  choices.hidden = step !== 1;
  next.hidden = step === 1;
  next.textContent = button;
  dialog.scrollTop = 0;
  $('tutorialTitle').focus({preventScroll: true});
}

choices.onclick = event => {
  const key = event.target.closest('[data-practice]')?.dataset.practice;
  if (step !== 1 || !activities.includes(key)) return;
  const before = practice.cond;
  const result = doAction(practice, key);
  if (result.error) return;
  const stat = Object.entries(result.deltas).find(([name]) => name !== '돈' && name !== '컨디션');
  const gain = stat ? `${stat[0]} +${stat[1]} · ` : '';
  activity = key;
  face = result.face;
  feedback = `${ACTIONS[key].name} 한 칸! ${gain}컨디션 ${before}% → ${practice.cond}%.`;
  step = 2;
  showPage();
};
next.onclick = () => {
  if (step === 3) { finish(); return; }
  if (step === 2) endDay(practice);
  step++;
  showPage();
};
function finish() {
  dismissed = true;
  try { localStorage.setItem(SEEN, '1'); } catch { /* 이번 방문 동안 기억 */ }
  dialog.close();
  if (!document.querySelector('[data-view="home"]').hidden) $('sprite').focus({preventScroll: true});
}
$('tutorialSkip').onclick = finish;
dialog.oncancel = event => { event.preventDefault(); finish(); };
