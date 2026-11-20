import * as L from './logic.js';

const KEY = 'raise-beam-tt-v1';
const $ = (id) => document.getElementById(id);
// 받침 유무로 조사 고르기: josa('배우', '이', '가') → '배우가'
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c <= 11171 && c % 28 ? a : b); };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

let state = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return s?.started && L.COUNTRIES[s.country] && L.RACKETS[s.racket] ? s : null;
  } catch { return null; }
}
function save() {
  if (!state.started) return; // 첫 선택 전 미리보기 상태는 저장하지 않음
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
  headband: { 4: '..aaaaaaaaaaaa..' },
  medal: { 13: '......a..a......', 14: '.......yy.......', 15: '.......yy.......' },
};
const OUTFIT = {
  basic: ['#4F86F7', '#3A6AD1'],
  club: ['#FF8A3D', '#E06E22'],
  tracksuit: ['#2FB67C', '#22905F'],
  junior: ['#2E4A7D', '#22385F'],
  national: ['#D7263D', '#A81C2F'],
};
function spriteSVG(stage, outfit, acc) {
  const rows = BASE.slice();
  const over = (m, replace) => { for (const [r, line] of Object.entries(m)) rows[r] = [...line].map((c, i) => (c === '.' && !replace ? rows[r][i] : c)).join(''); };
  over(HAIR[stage], true);
  if (ACC[acc]) over(ACC[acc], false);
  const [o, O] = OUTFIT[outfit] || OUTFIT.basic;
  const pal = { h: '#3B2A20', s: '#FFD9B8', e: '#2B2B2B', c: '#FF9EAA', m: '#C2554B', p: '#FF6F59', o, O, a: '#FF6F59', y: '#FFC93C' };
  let rects = '';
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[ch]}"${ch === 'e' ? ' class="eye"' : ''}/>`;
  }));
  return `<svg viewBox="0 -1 16 18" aria-hidden="true"><ellipse cx="8" cy="16.6" rx="6" ry=".6" fill="rgba(0,0,0,.15)"/>${rects}</svg>`;
}

/* ---------- 효과음 ---------- */
let ctx;
function beep(f = 660, d = 0.08) {
  if (!state?.sound) return;
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
const GREET = ['오늘은 뭐 할까?', '엄마, 나 배고파…', '랠리 100개 하고 싶어!', '오늘도 힘내 볼게!', '같이 탁구 치자!'];
const greet = () => GREET[state.day % GREET.length].replace('엄마', state.parent);
const reqText = (s) => Object.entries(L.reqOf(s)).map(([k, v]) => `${L.statName(k)} ${v}`).join(', ');
const FIT_LABEL = ['궁합 보통', '궁합 무난', '궁합 최고'];

function render() {
  const s = state, stage = L.stageOf(Math.min(s.day, L.DAYS)), cap = L.statCap(s.day);
  const country = L.COUNTRIES[s.country], racket = L.RACKETS[s.racket], style = s.style && L.STYLES[s.style];
  $('chips').innerHTML = `
    <span class="chip">👩 ${esc(s.parent)} <b>Lv.${L.level(s)}</b></span>
    <span class="chip" aria-label="남은 일정 ${s.ap}칸">⚡<span class="ap">${[0, 1, 2].map((i) => `<i class="${i < s.ap ? 'on' : ''}"></i>`).join('')}</span></span>
    <span class="chip">💰 <b>${s.money.toLocaleString()}</b></span>
    <span class="chip">🌏 <b>${L.worldRank(s)}위</b></span>`;
  $('ribbon').textContent = s.ending ? '세계탁구선수권 결승 종료' : `${s.day}일째, ${L.dateLabel(s.day)}, ${L.ageOf(s.day)}살`;
  $('sprite').innerHTML = spriteSVG(stage.id, s.outfit, s.acc);
  $('sprite').setAttribute('aria-label', `${s.name}, ${stage.name}`);
  $('stageTag').textContent = stage.name;
  $('sonName').textContent = s.name;
  $('tags').innerHTML = `
    <span class="tag">${country.flag} ${country.name}</span>
    <span class="tag">🏓 ${racket.name}</span>
    <span class="tag ${style ? '' : 'pending'}">${style ? `${style.icon} ${style.name}` : '전형은 22일째에'}</span>`;
  $('stats').innerHTML = L.STATS.map((t) => `
    <li><span>${t.name}</span>
      <span class="bar" role="meter" aria-label="${t.name}" aria-valuenow="${s.stats[t.key]}" aria-valuemin="0" aria-valuemax="100">
        <i style="--w:${s.stats[t.key]}%;--c:${t.color}"></i>${cap < 100 ? `<span class="cap" style="--cap:${cap}%"></span>` : ''}
      </span><b>${s.stats[t.key]}</b></li>`).join('') +
    (cap < 100 ? `<li class="cap-note">${stage.name} 때는 ${cap}까지만 자라요</li>` : '');

  const mt = L.MATCHES[s.match];
  const pct = Math.round(L.matchChance(s) * 100);
  const blocked = s.matchDone || s.ap < 2 || s.ending || L.needsStyle(s);
  $('match').innerHTML = `
    <span class="ico" aria-hidden="true">${mt.icon}</span>
    <p class="k">오늘의 경기</p>
    <h2>${mt.name}</h2>
    <p class="need">${L.statName(mt.stat)} ${L.matchNeed(s.day)} 권장, 지금 승률 ${pct}%</p>
    <button class="btn" id="matchBtn" ${blocked ? 'disabled' : ''}>${s.matchDone ? '경기 끝' : '출전하기'}</button>`;
  $('matchBtn').onclick = onMatch;

  $('actions').innerHTML = Object.entries(L.ACTIONS).map(([k, a]) => `
    <button class="act" data-act="${k}" ${s.ap < 1 || s.ending ? 'disabled' : ''}>
      <span aria-hidden="true">${a.icon}</span>${a.name}
      <small>${a.cost ? `-${a.cost / 10000}만원` : a.earn ? '용돈 +' : a.cond > 0 ? `컨디션 +${a.cond}` : `컨디션 ${a.cond}`}</small>
    </button>`).join('');

  $('slots').innerHTML = [0, 1, 2].map((i) => `<li class="${s.today[i] ? 'done' : ''}">${s.today[i] || ''}</li>`).join('');
  $('endDay').disabled = !!s.ending;
  $('endDay').textContent = s.day >= L.DAYS ? '결승전 치르기' : '하루 마치기';

  $('rankNum').textContent = `${L.worldRank(s)}위`;
  $('rankSub').textContent = `포인트 ${L.fmtNum(s.points)}${s.log[0] ? `, 어제 +${L.fmtNum(s.log[0].points)}` : ''}`;
  $('condNum').textContent = `${s.cond}%`;
  $('condBar').style.cssText = `--w:${s.cond}%;--c:${s.cond < 30 ? '#FF6F59' : s.cond < 60 ? '#F5B700' : '#2FB67C'}`;

  const g = Math.round(L.goalProgress(s) * 100);
  $('goalSub').textContent = `${reqText(s)}, 랭킹 포인트 ${L.fmtNum(country.need)}${style ? '' : ' (전형에 따라 바뀌어요)'}`;
  $('goalPct').textContent = `${g}%`;
  $('goalBar').style.setProperty('--w', `${g}%`);
  $('goalFinal').textContent = style && !s.ending
    ? `조건을 채우면 결승 예상 승률 ${Math.round(L.finalChance(s) * 100)}% (${racket.name}, ${FIT_LABEL[L.fitLevel(s) * 2]})`
    : '';

  $('log').innerHTML = s.log.length
    ? s.log.map((e) => `<li><span><span class="d">${e.day}일째</span> ${e.acts || '푹 쉬었어요'}</span><span class="f">포인트 +${L.fmtNum(e.points)}</span></li>`).join('')
    : '<li class="empty">아직 기록이 없어요. 오늘 일정을 채우고 하루를 마쳐 보세요.</li>';

  $('gallery').innerHTML = L.GALLERY.map((it) => {
    const has = s.unlocked.includes(it.id);
    const on = (it.type === 'outfit' && s.outfit === it.id) || (it.type === 'acc' && s.acc === it.id);
    return `<button class="tile ${has ? '' : 'locked'}" data-item="${it.id}" ${it.type && has ? `aria-pressed="${on}"` : 'disabled'}>
      <span aria-hidden="true">${it.icon}</span>${has ? it.name : '???'}<small>${has ? (it.type ? (on ? '입는 중' : '눌러서 입히기') : '달성!') : it.hint}</small></button>`;
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
    el.textContent = k === '돈'
      ? `${v > 0 ? '+' : ''}${(v / 10000).toFixed(1).replace(/\.0$/, '')}만원`
      : `${k} ${v > 0 ? '+' : ''}${k === '포인트' ? L.fmtNum(v) : v}`;
    el.style.setProperty('--c', colors[k] || (k === '포인트' ? '#3A6AD1' : k === '돈' ? '#B98900' : v < 0 ? '#C2554B' : '#1F9A66'));
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
  current = queue.shift();
  if (!current) { if (L.needsStyle(state)) openStylePick(); return; }
  $('modalBody').innerHTML = current.html; $('modalBtn').textContent = current.btn; $('modal').showModal();
}
$('modal').addEventListener('close', () => { current?.onClose?.(); setTimeout(nextModal, 120); });

function afterChange(res) {
  if (res.error) { toast(res.error); beep(200, 0.15); return; }
  say(res.line); floats(res.deltas); hop();
  for (const it of L.newUnlocks(state)) {
    modal(`<div class="m-ico">${it.icon}</div><p class="m-title">${it.name} 획득!</p><p class="m-text">${it.type ? '갤러리에서 입혀 볼 수 있어요.' : '갤러리에 추가됐어요.'}</p>`, '좋아요');
  }
  render();
}

/* ---------- 선택 화면 (분기) ---------- */
function optionCards(name, entries, checked, extra = () => '') {
  return entries.map(([id, o]) => `
    <label class="opt">
      <input type="radio" name="${name}" value="${id}" ${id === checked ? 'checked' : ''} required>
      <span class="opt-body">
        <b>${o.flag || o.icon || '🏓'} ${o.name}</b>${extra(id, o)}
        <small>${o.desc}</small>
      </span>
    </label>`).join('');
}

function openSetup(prev) {
  const f = $('setupForm');
  f.name.value = prev?.name || '빔';
  f.parent.value = prev?.parent || '엄마';
  $('countryOpts').innerHTML = optionCards('country', Object.entries(L.COUNTRIES), prev?.country || 'kor');
  $('racketOpts').innerHTML = optionCards('racket', Object.entries(L.RACKETS), prev?.racket || 'shake');
  $('setup').showModal();
}
$('setupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target, sound = state ? state.sound : true;
  state = L.newGame({
    name: f.name.value.trim() || '빔', parent: f.parent.value.trim() || '엄마',
    country: f.country.value, racket: f.racket.value,
  });
  state.sound = sound;
  state.started = true;
  $('setup').close();
  go('home'); render(); hop();
  say(`${state.parent}, 나 탁구 국가대표 될래!`);
  jingle([523, 659, 784]);
});

function openStylePick() {
  if ($('stylePick').open || $('modal').open) return;
  const rk = L.RACKETS[state.racket];
  $('styleLead').textContent = `${state.name}의 라켓은 ${josa(rk.name, '이에요', '예요')}. 궁합이 좋은 전형을 고르면 경기와 결승에서 유리해요.`;
  $('styleOpts').innerHTML = optionCards('style', Object.entries(L.STYLES), null, (id, o) =>
    ` <span class="fit fit-${L.fitLevel(state, id) * 2}">${FIT_LABEL[L.fitLevel(state, id) * 2]}</span><em>우승 조건: ${Object.entries(o.req).map(([k, v]) => `${L.statName(k)} ${v}`).join(', ')}</em>`);
  $('stylePick').showModal();
}
$('styleForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!L.chooseStyle(state, e.target.style.value)) return;
  $('stylePick').close();
  const st = L.STYLES[state.style];
  jingle([659, 784, 1046]);
  say(`나는 이제 ${josa(st.name, '이야', '야')}!`);
  hop(); render();
});
// 필수 선택이라 Esc로 닫지 못하게
for (const id of ['setup', 'stylePick']) $(id).addEventListener('cancel', (e) => { if (!state.started || id === 'stylePick') e.preventDefault(); });

/* ---------- 이벤트 ---------- */
$('actions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (L.needsStyle(state)) { openStylePick(); return; }
  const res = L.doAction(state, b.dataset.act);
  if (!res.error) beep(520 + Math.random() * 300);
  afterChange(res);
});

function onMatch() {
  const mt = L.MATCHES[state.match];
  const res = L.doMatch(state);
  if (!res.error) {
    jingle(res.win ? [523, 659, 784, 1046] : [392, 330]);
    modal(res.win
      ? `<div class="m-ico">${mt.icon}</div><p class="m-title">경기 승리!</p><p class="m-text">"${mt.name}"에서 이겼어요. 랭킹 포인트가 크게 올랐어요.</p>`
      : `<div class="m-ico">🥲</div><p class="m-title">아쉽게 졌어요</p><p class="m-text">${josa(L.statName(mt.stat), '을', '를')} 조금 더 키우면 승률이 올라가요.</p>`);
  }
  afterChange(res);
}

$('endDay').addEventListener('click', () => {
  if (state.ap > 0 && !confirm(`아직 일정이 ${state.ap}칸 남았어요. 그래도 하루를 마칠까요?`)) return;
  const { event, grew } = L.endDay(state);
  beep(440, 0.1);
  if (grew && !state.ending) {
    const st = L.stageOf(state.day);
    jingle([523, 659, 784]);
    modal(`<div class="m-ico">🌱</div><p class="m-title">${josa(st.name, '이', '가')} 됐어요!</p><p class="m-text">${esc(state.name)}의 키가 쑥 자랐어요. 이제 스탯이 ${L.statCap(state.day)}까지 자랄 수 있어요.</p>`, '대견하다');
  }
  if (event && !state.ending) modal(`<div class="m-ico">📮</div><p class="m-title">${event.title}</p><p class="m-text">${event.text}</p>`);
  L.newUnlocks(state);
  if (state.ending) showEnding();
  else say(greet());
  hop();
  render();
  if (L.needsStyle(state) && !$('modal').open) openStylePick();
});

function showEnding() {
  const e = L.ENDINGS.find((x) => x.id === state.ending);
  jingle(state.ending === 'champion' ? [523, 659, 784, 1046, 1318] : [523, 659, 784]);
  say(`${state.parent}, 고마워!`);
  const style = state.style ? L.STYLES[state.style] : null;
  modal(`<div class="m-ico">${e.icon}</div><p class="m-title">${e.title}</p>
    <p class="m-sub">${L.COUNTRIES[state.country].flag} ${esc(state.name)}, ${L.RACKETS[state.racket].name}${style ? `, ${style.name}` : ''}</p>
    <p class="m-text">${e.text(state)}</p>
    <ul class="m-list stats-end">${L.STATS.map((t) => `<li>${t.name}<b>${state.stats[t.key]}</b></li>`).join('')}<li>세계 랭킹<b>${L.worldRank(state)}위</b></li><li>경기 승리<b>${state.matchWins}번</b></li></ul>`,
  '다시 키우기', () => openSetup(state));
}

$('rankCard').addEventListener('click', () => {
  const recent = state.log.slice(0, 5);
  modal(`<div class="m-ico">🌏</div><p class="m-title">세계 랭킹 ${L.worldRank(state)}위</p>
    <p class="m-text">랭킹 포인트 ${state.points.toLocaleString()}점. 경기에서 이기면 크게 오르고, 밤마다 기술과 스피드만큼 쌓여요. 1위는 세계선수권 우승자 자리예요.</p>
    <ul class="m-list">${recent.length ? recent.map((r) => `<li>${r.day}일째<b>+${r.points.toLocaleString()}</b></li>`).join('') : '<li>아직 기록이 없어요</li>'}</ul>`, '닫기');
});

$('gallery').addEventListener('click', (e) => {
  const b = e.target.closest('[data-item]'); if (!b || b.disabled) return;
  const it = L.GALLERY.find((x) => x.id === b.dataset.item);
  if (it.type === 'outfit') state.outfit = state.outfit === it.id ? 'basic' : it.id;
  else state.acc = state.acc === it.id ? null : it.id;
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
  openSetup(state);
});

function go(view) {
  document.querySelectorAll('[data-view]').forEach((v) => (v.hidden = v.dataset.view !== view));
  document.querySelectorAll('.tabbar [data-go]').forEach((b) => b.removeAttribute('aria-current'));
  document.querySelector(`.tabbar [data-go="${view}"]`).setAttribute('aria-current', 'page');
  scrollTo({ top: 0 });
}
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));

if (state) {
  L.newUnlocks(state);
  render();
  say(greet());
  if (L.needsStyle(state)) openStylePick();
} else {
  // 첫 화면 뒤에 깔릴 미리보기용 상태
  state = L.newGame();
  render();
  say('나 탁구 선수 할래!');
  openSetup();
}
