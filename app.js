import * as L from './logic.js';

const KEY = 'raise-beam-v1';
const $ = (id) => document.getElementById(id);
// 받침 유무로 조사 고르기: josa('배우', '이', '가') → '배우가'
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c <= 11171 && c % 28 ? a : b); };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

let state = load() || L.newGame();
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장 불가 환경이면 이번 세션만 */ }
}

/* ---------- 픽셀 아들 (16×16) ---------- */
const BASE = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '..hssshhhhsssh..',
  '..ssssssssssss..',
  '.ssseesssseesss.',
  '.ssseesssseesss.',
  '..sccssssssccs..',
  '..sssssmmsssss..',
  '...ssssssssss...',
  '......ssss......',
  '...oooossoooo...',
  '..oooooooooooo..',
  '.oooooooooooooo.',
];
const HAIR = {
  baby: { 0: '................', 1: '................', 2: '......hhh.......', 3: '....ssshsssss...', 4: '...ssssssssss...', 5: '..ssssssssssss..', 10: '..sssssppsssss..' },
  kid: { 5: '..hhhhhhhhhhhh..' },
  teen: { 0: '....h..h..h.....' },
  adult: { 5: '..hhhhhssssssh..' },
};
const ACC = {
  cap: { 1: '....aaaaaaaa....', 2: '...aaaaaaaaaa...', 3: '..aaaaaaaaaaaa..', 4: '..AAAAAAAAAAAAAA' },
  glasses: { 7: '.sskkkkkkkkkkss.', 8: '.sskkkkssskkkks.' },
  crown: { 0: '....y..y..y.....', 1: '....yyyyyyy.....' },
};
const OUTFIT = {
  basic: ['#4F86F7', '#3A6AD1'],
  raincoat: ['#FFD54A', '#E0B420'],
  uniform: ['#2E4A7D', '#22385F'],
  suit: ['#2A2F3A', '#1A1E26'],
};
function spriteSVG(stage, outfit, acc) {
  const rows = BASE.slice();
  const over = (m) => { for (const [r, line] of Object.entries(m)) rows[r] = [...line].map((c, i) => (c === '.' && m !== HAIR[stage] ? rows[r][i] : c)).join(''); };
  over(HAIR[stage]);
  if (acc) over(ACC[acc]);
  const [o, O] = OUTFIT[outfit] || OUTFIT.basic;
  const pal = { h: '#3B2A20', s: '#FFD9B8', e: '#2B2B2B', c: '#FF9EAA', m: '#C2554B', p: '#FF6F59', o, O, a: '#FF6F59', A: '#D94F3A', k: '#1E2228', y: '#FFC93C' };
  let rects = '';
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[ch]}"${ch === 'e' ? ' class="eye"' : ''}/>`;
  }));
  // 그림자 한 줄
  return `<svg viewBox="0 -1 16 18" aria-hidden="true"><ellipse cx="8" cy="16.6" rx="6" ry=".6" fill="rgba(0,0,0,.15)"/>${rects}</svg>`;
}

/* ---------- 효과음 ---------- */
let ctx;
function beep(f = 660, d = 0.08) {
  if (!state.sound) return;
  try {
    ctx ||= new AudioContext();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + d);
  } catch { /* 오디오 미지원 */ }
}
const jingle = (notes) => notes.forEach((f, i) => setTimeout(() => beep(f, 0.12), i * 110));

/* ---------- 렌더 ---------- */
const won = (n) => `${n.toLocaleString()}원`;
const GREET = ['오늘은 뭐 할까?', '엄마, 나 배고파…', '촬영장 가고 싶다!', '오늘도 힘내 볼게!', '같이 놀아 줘!'];

function render() {
  const s = state, stage = L.stageOf(Math.min(s.day, L.DAYS)), cap = L.statCap(s.day);
  $('chips').innerHTML = `
    <span class="chip">👩 ${esc(s.parent)} <b>Lv.${L.level(s)}</b></span>
    <span class="chip" aria-label="남은 일정 ${s.ap}칸">⚡<span class="ap">${[0, 1, 2].map((i) => `<i class="${i < s.ap ? 'on' : ''}"></i>`).join('')}</span></span>
    <span class="chip">💰 <b>${s.money.toLocaleString()}</b></span>
    <span class="chip">💗 <b>${L.fmtFans(s.fans)}</b></span>`;
  $('ribbon').textContent = s.ending ? '엔딩' : `${s.day}일째, ${L.dateLabel(s.day)}, ${L.ageOf(s.day)}살`;
  $('sprite').innerHTML = spriteSVG(stage.id, s.outfit, s.acc);
  $('sprite').setAttribute('aria-label', `${s.name}, ${stage.name}`);
  $('stageTag').textContent = stage.name;
  $('sonName').textContent = s.name;
  $('stats').innerHTML = L.STATS.map((t) => `
    <li><span>${t.name}</span>
      <span class="bar" role="meter" aria-label="${t.name}" aria-valuenow="${s.stats[t.key]}" aria-valuemin="0" aria-valuemax="100">
        <i style="--w:${s.stats[t.key]}%;--c:${t.color}"></i>${cap < 100 ? `<span class="cap" style="--cap:${cap}%"></span>` : ''}
      </span><b>${s.stats[t.key]}</b></li>`).join('') +
    (cap < 100 ? `<li class="cap-note">${stage.name} 때는 ${cap}까지만 자라요</li>` : '');

  const sh = L.SHOOTS[s.shoot], need = L.shootNeed(s.day), statName = L.STATS.find((t) => t.key === sh.stat).name;
  const pct = Math.round(L.shootChance(s) * 100);
  $('shoot').innerHTML = `
    <span class="ico" aria-hidden="true">${sh.icon}</span>
    <p class="k">오늘의 촬영</p>
    <h2>${sh.name}</h2>
    <p class="need">${statName} ${need} 권장, 지금 합격률 ${pct}%</p>
    <button class="btn" id="shootBtn" ${s.shootDone || s.ap < 2 || s.ending ? 'disabled' : ''}>${s.shootDone ? '다녀왔어요' : '촬영 가기'}</button>`;
  $('shootBtn').onclick = onShoot;

  $('actions').innerHTML = Object.entries(L.ACTIONS).map(([k, a]) => `
    <button class="act" data-act="${k}" ${s.ap < 1 || s.ending ? 'disabled' : ''}>
      <span aria-hidden="true">${a.icon}</span>${a.name}
      <small>${a.cost ? `-${a.cost / 10000}만원` : a.earn ? '용돈 +' : a.cond > 0 ? `컨디션 +${a.cond}` : `컨디션 ${a.cond}`}</small>
    </button>`).join('');

  $('slots').innerHTML = [0, 1, 2].map((i) => `<li class="${s.today[i] ? 'done' : ''}">${s.today[i] || ''}</li>`).join('');
  $('endDay').disabled = !!s.ending;
  $('endDay').textContent = s.day >= L.DAYS ? '엔딩 보기' : '하루 마치기';

  $('fansNum').textContent = L.fmtFans(s.fans);
  $('fansSub').textContent = s.log[0] ? `어제 +${L.fmtFans(s.log[0].fans)}` : '밤마다 팬이 늘어나요';
  $('condNum').textContent = `${s.cond}%`;
  $('condBar').style.cssText = `--w:${s.cond}%;--c:${s.cond < 30 ? '#FF6F59' : s.cond < 60 ? '#F5B700' : '#2FB67C'}`;
  const g = Math.round(L.goalProgress(s) * 100);
  $('goalPct').textContent = `${g}%`;
  $('goalBar').style.setProperty('--w', `${g}%`);

  $('log').innerHTML = s.log.length
    ? s.log.map((e) => `<li><span><span class="d">${e.day}일째</span> ${e.acts || '푹 쉬었어요'}</span><span class="f">팬 +${L.fmtFans(e.fans)}</span></li>`).join('')
    : '<li class="empty">아직 기록이 없어요. 오늘 일정을 채우고 하루를 마쳐 보세요.</li>';

  $('gallery').innerHTML = L.GALLERY.map((g) => {
    const has = s.unlocked.includes(g.id);
    const on = (g.type === 'outfit' && s.outfit === g.id) || (g.type === 'acc' && s.acc === g.id);
    return `<button class="tile ${has ? '' : 'locked'}" data-item="${g.id}" ${g.type && has ? `aria-pressed="${on}"` : 'disabled'}>
      <span aria-hidden="true">${g.icon}</span>${has ? g.name : '???'}<small>${has ? (g.type ? (on ? '입는 중' : '눌러서 입히기') : '달성!') : g.hint}</small></button>`;
  }).join('');

  const f = $('settingsForm');
  f.name.value = s.name; f.parent.value = s.parent; f.sound.checked = s.sound;
  save();
}

function say(text) { $('bubble').textContent = text; }
function hop() { const el = $('sprite'); el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }

function floats(deltas) {
  const colors = Object.fromEntries(L.STATS.map((t) => [t.name, t.color]));
  Object.entries(deltas).forEach(([k, v], i) => {
    const el = document.createElement('span');
    el.className = 'float';
    const val = k === '돈' ? `${v > 0 ? '+' : ''}${(v / 10000).toFixed(1).replace(/\.0$/, '')}만원` : `${k} ${v > 0 ? '+' : ''}${k === '팬' ? L.fmtFans(v) : v}`;
    el.textContent = val;
    el.style.setProperty('--c', colors[k] || (k === '팬' ? '#FF5C9A' : k === '돈' ? '#B98900' : v < 0 ? '#C2554B' : '#1F9A66'));
    el.style.setProperty('--dx', `${(i % 2 ? 1 : -1) * 6}px`);
    el.style.bottom = `${28 + i * 13}%`;
    el.style.animationDelay = `${i * 120}ms`;
    $('floats').append(el);
    setTimeout(() => el.remove(), 1400 + i * 120);
  });
}

let toastT;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

const queue = [];
let current;
function modal(html, btn = '확인', onClose) { queue.push({ html, btn, onClose }); if (!$('modal').open) nextModal(); }
function nextModal() {
  current = queue.shift(); if (!current) return;
  $('modalBody').innerHTML = current.html; $('modalBtn').textContent = current.btn; $('modal').showModal();
}
$('modal').addEventListener('close', () => { current?.onClose?.(); setTimeout(nextModal, 120); });

function afterChange(res) {
  if (res.error) { toast(res.error); beep(200, 0.15); return; }
  say(res.line); floats(res.deltas); hop();
  for (const g of L.newUnlocks(state)) {
    modal(`<div class="m-ico">${g.icon}</div><p class="m-title">${g.name} 획득!</p><p class="m-text">${g.type ? '갤러리에서 입혀 볼 수 있어요.' : '갤러리에 추가됐어요.'}</p>`, '좋아요');
  }
  render();
}

/* ---------- 이벤트 ---------- */
$('actions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const res = L.doAction(state, b.dataset.act);
  if (!res.error) beep(520 + Math.random() * 300);
  afterChange(res);
});

function onShoot() {
  const res = L.doShoot(state);
  if (!res.error) {
    jingle(res.win ? [523, 659, 784, 1046] : [392, 330]);
    const sh = L.SHOOTS[state.shoot];
    modal(res.win
      ? `<div class="m-ico">${sh.icon}</div><p class="m-title">촬영 대성공!</p><p class="m-text">"${sh.name}" 현장에서 감독님이 엄지를 들었어요.</p>`
      : `<div class="m-ico">🥲</div><p class="m-title">아쉽게 떨어졌어요</p><p class="m-text">${josa(L.STATS.find((t) => t.key === sh.stat).name, '을', '를')} 조금 더 키우면 합격률이 올라가요.</p>`);
  }
  afterChange(res);
}

$('endDay').addEventListener('click', () => {
  if (state.ap > 0 && !confirm(`아직 일정이 ${state.ap}칸 남았어요. 그래도 하루를 마칠까요?`)) return;
  const { event, grew } = L.endDay(state);
  beep(440, 0.1);
  if (grew) {
    const st = L.stageOf(state.day);
    jingle([523, 659, 784]);
    modal(`<div class="m-ico">🌱</div><p class="m-title">${josa(st.name, '이', '가')} 됐어요!</p><p class="m-text">${state.name}의 키가 쑥 자랐어요. 이제 스탯이 ${L.statCap(state.day)}까지 자랄 수 있어요.</p>`, '대견하다');
  }
  if (event) modal(`<div class="m-ico">📮</div><p class="m-title">${event.title}</p><p class="m-text">${event.text}</p>`);
  L.newUnlocks(state);
  if (state.ending) showEnding();
  else say(GREET[state.day % GREET.length].replace('엄마', state.parent));
  hop();
  render();
});

function showEnding() {
  const e = L.ENDINGS.find((x) => x.id === state.ending);
  jingle([523, 659, 784, 1046, 1318]);
  say(`${state.parent}, 고마워!`);
  modal(`<div class="m-ico">${e.icon}</div><p class="m-title">${esc(state.name)}, ${josa(e.title, '이', '가')} 되다</p><p class="m-text">${e.text}</p>
    <ul class="m-list stats-end">${L.STATS.map((t) => `<li>${t.name}<b>${state.stats[t.key]}</b></li>`).join('')}<li>팬<b>${L.fmtFans(state.fans)}</b></li></ul>`, '다시 키우기', () => { state = L.newGame(state.name, state.parent); render(); say('다시 만나서 반가워!'); });
}

$('fansCard').addEventListener('click', () => {
  const recent = state.log.slice(0, 5);
  modal(`<div class="m-ico">💗</div><p class="m-title">팬 ${state.fans.toLocaleString()}명</p>
    <p class="m-text">매일 밤 팬이 2%씩 늘어나고, 매력과 연기가 높을수록 더 많이 모여요.</p>
    <ul class="m-list">${recent.length ? recent.map((r) => `<li>${r.day}일째<b>+${r.fans.toLocaleString()}</b></li>`).join('') : '<li>아직 기록이 없어요</li>'}</ul>`, '닫기');
});

$('gallery').addEventListener('click', (e) => {
  const b = e.target.closest('[data-item]'); if (!b || b.disabled) return;
  const g = L.GALLERY.find((x) => x.id === b.dataset.item);
  if (g.type === 'outfit') state.outfit = state.outfit === g.id ? 'basic' : g.id;
  else state.acc = state.acc === g.id ? null : g.id;
  beep(880); render();
});

$('settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  state.name = f.name.value.trim() || '빔';
  state.parent = f.parent.value.trim() || '엄마';
  state.sound = f.sound.checked;
  render(); toast('저장했어요');
});
$('reset').addEventListener('click', () => {
  if (!confirm('지금까지 키운 기록이 모두 사라져요. 처음부터 다시 키울까요?')) return;
  state = L.newGame(state.name, state.parent); render(); go('home'); say('다시 만나서 반가워!');
});

function go(view) {
  document.querySelectorAll('[data-view]').forEach((v) => (v.hidden = v.dataset.view !== view));
  document.querySelectorAll('.tabbar [data-go]').forEach((b) => b.removeAttribute('aria-current'));
  document.querySelector(`.tabbar [data-go="${view}"]`).setAttribute('aria-current', 'page');
  scrollTo({ top: 0 });
}
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));

L.newUnlocks(state);
render();
say(state.day === 1 && !state.today.length ? `${state.parent}, 나 오늘부터 배우 할래!` : GREET[state.day % GREET.length].replace('엄마', state.parent));
