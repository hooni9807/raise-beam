const scenes = [
  { art: 'alley', place: '동네 골목', title: '골목이 깨어날 무렵', line: '창문이 하나둘 열려요. 골목 끝 작은 집에서 희범이도 눈을 뜹니다.' },
  { art: 'desk', place: '희범이의 방', title: '오늘은 뭐 할까?', line: '안경 옆에 펼쳐 둔 공책. 희범이가 오늘 하고 싶은 일을 적으려고 세 칸을 그려 놨어요.' },
  { art: 'club', place: '골목 끝 탁구장', title: '희범이의 첫날', line: '“탁, 토독.” 열린 문틈으로 공 소리가 새어 나와요. 희범이가 손을 꼭 잡아요. “우리, 같이 가 볼까?”' },
];

export function playPrologue(onStart) {
  const dialog = document.getElementById('prologue');
  const frames = dialog.querySelector('.film-frames');
  const marks = dialog.querySelector('.film-meter').children;
  const next = document.getElementById('prologueNext');
  const start = document.getElementById('prologueStart');
  const pause = document.getElementById('prologuePause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = reduced;
  let index = 0;
  let timer;

  for (const scene of scenes) {
    const image = new Image();
    image.src = 'img/prologue/' + scene.art + '.webp';
    image.alt = '';
    frames.append(image);
  }

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
    const moveFocus = last && (document.activeElement === next || document.activeElement === pause);
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
  start.onclick = () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', schedule);
    dialog.close();
    onStart();
  };
  dialog.showModal();
  dialog.focus();
  document.addEventListener('visibilitychange', schedule);
  updatePause();
  show();
}
