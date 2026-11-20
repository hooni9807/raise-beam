const scenes = [
  { art: 'birth', place: '1996년, 동네 산부인과', title: '희범아, 반가워', line: '첫울음이 잦아들자, 작은 손이 내 손가락을 꼭 쥐었어요. “희범아.” 처음으로 이름을 불러 주었어요.' },
  { art: 'desk', place: '희범이의 방', title: '오늘은 뭐 할까?', line: '공책에 오늘 쓸 세 칸이 비어 있어요. 공부도 하고 몸도 움직여 봐요. 희범이가 지치면 한 칸은 쉬는 시간으로 남겨 주세요.' },
  { art: 'alley', place: '집 앞 골목', title: '“나는 커서 뭐가 될까?”', line: '희범이가 골목 어귀에서 돌아봐요. 함께 보낸 하루하루가 훗날 희범이의 직업과 이야기의 결말을 바꿔요. 이제 이 아이를 잘 부탁해요.' },
];

export function playPrologue(onStart) {
  const dialog = document.getElementById('prologue');
  const frames = dialog.querySelector('.film-frames');
  const marks = dialog.querySelector('.film-meter').children;
  const next = document.getElementById('prologueNext');
  const start = document.getElementById('prologueStart');
  const skip = document.getElementById('prologueSkip');
  const pause = document.getElementById('prologuePause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = reduced;
  let index = 0;
  let timer;

  frames.replaceChildren(...scenes.map(scene => {
    const image = new Image();
    image.src = 'img/prologue/' + scene.art + '.webp';
    image.alt = '';
    return image;
  }));

  function schedule() {
    clearTimeout(timer);
    if (dialog.open && !paused && !document.hidden && index < scenes.length - 1) {
      timer = setTimeout(advance, 5200);
    }
  }

  function show() {
    const scene = scenes[index];
    const last = index === scenes.length - 1;
    Array.from(frames.children).forEach((img, i) => img.classList.toggle('on', i === index));
    Array.from(marks).forEach((mark, i) => mark.classList.toggle('read', i <= index));
    document.getElementById('prologueLocation').textContent = '0' + (index + 1) + '　/　' + scene.place;
    document.getElementById('prologueTitle').textContent = scene.title;
    document.getElementById('prologueLine').textContent = scene.line;
    const moveFocus = last && (document.activeElement === next || document.activeElement === pause || document.activeElement === skip);
    skip.hidden = last;
    pause.hidden = last;
    next.hidden = last;
    start.hidden = !last;
    if (moveFocus) start.focus();
    schedule();
  }

  function advance() {
    if (index < scenes.length - 1) { index++; show(); }
  }

  function updatePause() {
    dialog.classList.toggle('still', paused);
    pause.textContent = paused ? '자동 재생' : '일시정지';
    schedule();
  }

  next.onclick = advance;
  pause.onclick = () => { paused = !paused; updatePause(); };
  dialog.oncancel = event => event.preventDefault();
  function enterGame() {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', schedule);
    dialog.close();
    onStart();
  }
  start.onclick = enterGame;
  skip.onclick = enterGame;
  dialog.showModal();
  dialog.focus();
  document.addEventListener('visibilitychange', schedule);
  updatePause();
  show();
}
