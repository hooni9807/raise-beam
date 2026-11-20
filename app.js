import * as L from './logic.js?v=fitness-route';
import { playPrologue } from './prologue.js?v=birth1996';
import { openTutorial } from './tutorial.js?v=fitness-route';

const KEY = 'raise-beam-v3';
const DEX_KEY = 'raise-beam-endings';
function seenEndings() {
  try { return JSON.parse(localStorage.getItem(DEX_KEY)) || []; } catch { return []; }
}
const LIFE_KEY = 'raise-beam-life-endings';
function lifeRecords() {
  try { return JSON.parse(localStorage.getItem(LIFE_KEY)) || []; } catch { return []; }
}
function lifeStory(ending, path) {
  const story = L.LIFE_PATHS[path];
  return `<article class="life-story"><h3>${story.title}</h3><p>${L.ENDINGS[ending].bad ? story.hard : story.after}</p></article>`;
}
function markEnding(id) {
  const seen = seenEndings();
  if (!seen.includes(id)) seen.push(id);
  try { localStorage.setItem(DEX_KEY, JSON.stringify(seen)); } catch { /* 저장 불가 */ }
}
const $ = (id) => document.getElementById(id);
// 받침 유무로 조사 고르기: josa('배우', '이', '가') → '배우가'
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c <= 11171 && c % 28 ? a : b); };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

let state = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s?.started || (s.country !== null && !Object.hasOwn(L.COUNTRIES, s.country))) return null;
    // 아직 첫 일정을 쓰지 않은 구버전 저장은 시작 능력치를 정확히 복원할 수 있다.
    if (s.startingStatsTotal == null && s.day === 1 && s.ap === L.AP_PER_DAY) {
      s.startingStatsTotal = L.totalStats(s);
    }
    return s;
  } catch { return null; }
}
function save() {
  if (!state.started) return; // 첫 선택 전 미리보기 상태는 저장하지 않음
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장 불가 환경이면 이번 세션만 */ }
}

/* ---------- 성장, 상황, 엔딩 초상화 ---------- */
const TIRED = 35;
const imageRoot = () => state?.gender === 'female' ? 'img/female' : 'img';
const stageImg = (stage, yawn) => `${imageRoot()}/stages/${yawn ? 'yawn/' : ''}${stage}.webp`;
const endingImg = (id, yawn) => `${imageRoot()}/endings/${yawn ? 'yawn/' : ''}${id}.webp`;
const situationImg = (stage, face) => `${imageRoot()}/situations/${stage}/${face}.webp`;
let reaction = null;
let conversationTurn = 0;
let reactionTimer;
function react(face, ms = 3200) {
  clearTimeout(reactionTimer);
  reaction = face;
  reactionTimer = setTimeout(() => {
    reaction = null;
    const stage = L.stageOf(Math.min(state.day, L.DAYS));
    $('sprite').innerHTML = portrait(stage.id, state.outfit, state.acc);
  }, ms);
}
function modalFace(face) {
  const stage = L.stageOf(Math.min(state.day, L.DAYS)).id;
  return `<img class="m-art small" src="${situationImg(stage, face)}" alt="">`;
}
// 누르면 표정이 바뀌는 그림 (엔딩 화면, 도감)
const swapImg = (id, cls = '', size = 384) =>
  `<button type="button" class="swap ${cls}" aria-label="표정 바꾸기"><img src="${endingImg(id)}" data-alt="${endingImg(id, true)}" alt="" width="${size}" height="${size}" loading="lazy"></button>`;
document.addEventListener('click', (e) => {
  const img = e.target.closest('.swap')?.querySelector('img');
  if (!img) return;
  const now = img.getAttribute('src');
  img.setAttribute('src', img.dataset.alt);
  img.dataset.alt = now;
  beep(760, 0.05);
});

function portrait(stage, outfit, acc) {
  const yawning = reaction === 'yawn' || (!reaction && state.cond < TIRED);
  const src = reaction && !yawning ? situationImg(stage, reaction) : stageImg(stage, yawning);
  const item = (id) => L.GALLERY.find((g) => g.id === id);
  const stickers = [outfit !== 'basic' && item(outfit)?.icon, acc && item(acc)?.icon, yawning && '💤'].filter(Boolean);
  return `<img src="${src}" alt="" width="384" height="384">` +
    stickers.map((e, i) => `<span class="sticker s${i}" aria-hidden="true">${e}</span>`).join('');
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
const GREET = ['오늘은 뭐 할까?', '나 배고파…', '나중에 뭐가 될까?', '오늘도 힘내 볼게!', '같이 놀아 줘!', '하암… 졸려'];
const greet = () => GREET[state.day % GREET.length];
function render() {
  const s = state, stage = L.stageOf(Math.min(s.day, L.DAYS)), cap = L.statCap(s.day);
  const country = L.COUNTRIES[s.country];
  $('chips').innerHTML = `
    <span class="chip">📈 <b>Lv.${L.level(s)}</b></span>
    <span class="chip" aria-label="남은 일정 ${s.ap}칸">⚡<span class="ap">${[0, 1, 2].map((i) => `<i class="${i < s.ap ? 'on' : ''}"></i>`).join('')}</span></span>
    <span class="chip">💰 <b>${s.money.toLocaleString()}</b></span>
    <span class="chip">🏅 <b>${s.awards}</b></span>`;
  $('ribbon').textContent = s.ending ? '엔딩' : `${s.day}일째, ${L.dateLabel(s.day)}, ${L.ageOf(s.day)}살`;
  $('sprite').innerHTML = portrait(stage.id, s.outfit, s.acc);
  $('sprite').setAttribute('aria-label', `${s.name}, ${stage.name}. 눌러서 말 걸기`);
  $('stageTag').textContent = stage.name;
  $('sonName').textContent = s.name;
  $('nationalTeam').hidden = !!s.country || !!s.ending || !L.isTableTennisPro(s);
  $('tags').innerHTML = (country ? `<span class="tag">${country.flag} ${country.name}</span>` : '') +
    (s.burnout ? `<span class="tag warn">지친 날 ${s.burnout}/${L.BURNOUT_LIMIT}</span>` : '');
  $('stats').innerHTML = L.STATS.map((t) => `
    <li><span>${t.name}</span>
      <span class="bar" role="meter" aria-label="${t.name}" aria-valuenow="${s.stats[t.key]}" aria-valuemin="0" aria-valuemax="100">
        <i style="--w:${s.stats[t.key]}%;--c:${t.color}"></i>${cap < 100 ? `<span class="cap" style="--cap:${cap}%"></span>` : ''}
      </span><b>${s.stats[t.key]}</b></li>`).join('') +
    (cap < 100 ? `<li class="cap-note">${stage.name} 때는 ${cap}까지만 자라요</li>` : '');

  const mt = L.MATCHES[s.match];
  const blocked = s.matchDone || s.ap < 2 || s.ending;
  $('match').innerHTML = `
    <span class="ico" aria-hidden="true">${mt.icon}</span>
    <p class="k">오늘의 도전</p>
    <h2>${mt.name}</h2>
    <p class="need">${L.statName(mt.stat)} ${L.matchNeed(s.day)} 권장, 지금 성공률 ${Math.round(L.matchChance(s) * 100)}%</p>
    <button class="btn" id="matchBtn" ${blocked ? 'disabled' : ''}>${s.matchDone ? '도전 끝' : '도전하기'}</button>`;
  $('matchBtn').onclick = onMatch;

  $('actions').innerHTML = Object.entries({ club: { name: "탁구장 가기", icon: "🏓" }, ...L.ACTIONS }).map(([k, a]) => `
    <button class="act" data-act="${k}" ${s.ap < 1 || s.ending ? 'disabled' : ''}>
      <span aria-hidden="true">${a.icon}</span>${a.name}
      <small>${k === 'club' || k === 'run' ? '활동 선택' : a.cost ? `-${a.cost / 10000}만원` : a.earn ? '알바비 +' : a.cond > 0 ? `컨디션 +${a.cond}` : `컨디션 ${a.cond}`}</small>
    </button>`).join('');

  $('slots').innerHTML = [0, 1, 2].map((i) => `<li class="${s.today[i] ? 'done' : ''}">${s.today[i] || ''}</li>`).join('');
  $('endDay').disabled = !!s.ending;
  $('endDay').textContent = s.day >= L.DAYS ? '엔딩 보기' : '하루 마치기';

  if (L.clubVisits(s)) {
    $('rankK').textContent = '세계 랭킹';
    $('rankNum').textContent = `${L.worldRank(s)}위`;
    $('rankSub').textContent = `포인트 ${L.fmtNum(s.points)}`;
  } else {
    $('rankK').textContent = '받은 상장';
    $('rankNum').textContent = `${s.awards}개`;
    $('rankSub').textContent = '오늘의 도전에 성공하면 받아요';
  }
  $('condNum').textContent = `${s.cond}%`;
  $('condBar').style.cssText = `--w:${s.cond}%;--c:${s.cond < 30 ? '#FF6F59' : s.cond < 60 ? '#F5B700' : '#2FB67C'}`;

  $('log').innerHTML = s.log.length
    ? s.log.map((e) => `<li><span><span class="d">${e.day}일째</span> ${e.acts || '푹 쉬었어요'}${e.tired ? ' 😵' : ''}</span>${e.points ? `<span class="f">포인트 +${L.fmtNum(e.points)}</span>` : ''}</li>`).join('')
    : '<li class="empty">아직 기록이 없어요. 오늘 일정을 채우고 하루를 마쳐 보세요.</li>';

  $('gallery').innerHTML = L.GALLERY.map((it) => {
    const has = s.unlocked.includes(it.id);
    const on = (it.type === 'outfit' && s.outfit === it.id) || (it.type === 'acc' && s.acc === it.id);
    return `<button class="tile ${has ? '' : 'locked'}" data-item="${it.id}" ${it.type && has ? `aria-pressed="${on}"` : 'disabled'}>
      <span aria-hidden="true">${it.icon}</span>${has ? it.name : '???'}<small>${has ? (it.type ? (on ? '입는 중' : '눌러서 입히기') : '달성!') : it.hint}</small></button>`;
  }).join('');

  const seen = seenEndings();
  $('dexCount').textContent = `${seen.length}/${L.ENDING_IDS.length}`;
  $('dex').innerHTML = L.ENDING_IDS.map((id) => {
    const e = L.ENDINGS[id], has = seen.includes(id);
    return `<div class="dex-item ${has ? '' : 'locked'} ${e.bad ? 'bad' : ''}">${has ? swapImg(id, 'dex-img') : '<span aria-hidden="true">❔</span>'}${has ? endingTitle(id) : `${e.bad ? '배드 엔딩' : e.group || '직업'} ???`}</div>`;
  }).join('');

  $('lifeInvite').hidden = !L.canChooseLife(s);
  if (s.lifePath) {
    const label = s.lifePath === 'solo' ? '독립 생활' : '배우자 ' + L.LIFE_PATHS[s.lifePath].name;
    $('tags').innerHTML += `<span class="tag">${label}</span>`;
  }
  const records = lifeRecords();
  $('lifeShelf').hidden = !records.length;
  $('lifeCollection').innerHTML = records.map(([ending, path]) =>
    `<details><summary>${ending === 'runaway' ? '연락 끊긴 희범이' : L.ENDINGS[ending].title} · ${L.LIFE_PATHS[path].title}</summary>${lifeStory(ending, path)}</details>`).join('');
  $('settingsForm').sound.checked = s.sound;
  save();
}

function say(text) { $('bubble').textContent = text; }
// 캐릭터를 누르면 컨디션에 맞게 반응
$('sprite').addEventListener('click', () => {
  if (state.ending) return;
  const tired = state.cond < TIRED;
  const face = L.reactionFace(state, tired ? 'tired' : 'talk', ++conversationTurn);
  say(tired ? '눈이 자꾸 감겨… 잠깐만 쉴게.' : face === 'yawn' ? '하암… 왜 불러?' : '응? 나 불렀어?');
  beep(330, 0.12);
  react(face, 2400); render();
});
// 하품 그림 미리 불러 두기 (바뀔 때 깜빡이지 않게)
for (const st of L.STAGES) new Image().src = stageImg(st.id, true);

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
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

const queue = [];
let current;
function modal(html, btn = '확인', onClose) { queue.push({ html, btn, onClose }); if (!$('modal').open) nextModal(); }
function nextModal() {
  current = queue.shift();
  if (!current) return;
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
function optionCards(name, entries, checked) {
  return entries.map(([id, o]) => `
    <label class="opt">
      <input type="radio" name="${name}" value="${id}" ${id === checked ? 'checked' : ''} required>
      <span class="opt-body">
        <b>${o.flag || o.icon || '🏓'} ${o.name}</b>
        <small>${o.desc}</small>
      </span>
    </label>`).join('');
}

function openLetters() {
  $('letters').innerHTML = '<legend>희범이의 답장</legend>' + Object.entries(L.LIFE_PATHS).map(([id, p]) =>
    `<label><input required type="radio" name="reply" value="${id}"><span><strong>${p.name}</strong> <small>${p.detail}</small><em>${p.letter}</em></span></label>`).join('');
  $('lifeDialog').showModal();
}
$('lifeInvite').onclick = openLetters;
$('lifeLater').onclick = () => $('lifeDialog').close();
$('lifeForm').onsubmit = event => {
  event.preventDefault();
  if (!L.canChooseLife(state)) return;
  state.lifePath = event.target.elements.reply.value;
  $('lifeDialog').close();
  render();
  say(state.lifePath === 'solo' ? '내 집 열쇠가 생겼어!' : L.LIFE_PATHS[state.lifePath].name + '랑 결혼했어!');
};
$('nationalTeam').onclick = () => {
  const teams = Object.entries(L.COUNTRIES).map(([id, team]) => [id, {
    ...team, desc: '선발 기준 ' + team.need.toLocaleString() + '점',
  }]);
  $('countryOpts').innerHTML = optionCards('country', teams, null);
  $('teamDialog').showModal();
};
$('teamCancel').onclick = () => $('teamDialog').close();
$('teamForm').onsubmit = event => {
  event.preventDefault();
  state.country = event.target.elements.country.value;
  $('teamDialog').close();
  render();
};

function openSetup(prev) {
  const gender = prev?.gender === 'female' ? 'female' : 'male';
  $('setupForm').elements.gender.value = gender;
  $('setup').showModal();
}
$('setupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target, sound = state ? state.sound : true;
  clearTimeout(reactionTimer); reaction = null;
  state = L.newGame({ gender: f.gender.value });
  conversationTurn = 0;
  state.sound = sound;
  state.started = true;
  $('setup').close();
  go('home'); render(); hop();
  say('응애! 잘 부탁해!');
  jingle([523, 659, 784]);
  openTutorial(state.gender);
});

$('setup').addEventListener('cancel', e => { if (!state.started) e.preventDefault(); });
$('pickForm').addEventListener('submit', e => {
  e.preventDefault();
  const key = new FormData(e.target).get('choice');
  if (!L.CLUB[key] && !L.FITNESS[key]) return;
  const result = L.doAction(state, key);
  if (result.error) { $('pickLead').textContent = result.error; return; }
  $('pick').close();
  react(result.face);
  beep(660);
  afterChange(result);
});
$('pickCancel').onclick = () => $('pick').close();
/* ---------- 이벤트 ---------- */
$('actions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'club' || b.dataset.act === 'run') {
    const fitness = b.dataset.act === 'run';
    $('pickTitle').textContent = fitness ? '어떤 운동을 할까요?' : '탁구장에서 무엇을 할까요?';
    $('pickIco').textContent = fitness ? '💪' : '🏓';
    $('pickLead').textContent = '오늘 할 활동을 고르세요. 일정 한 칸을 사용해요.';
    $('pickOpts').innerHTML = optionCards('choice', Object.entries(fitness ? L.FITNESS : L.CLUB), null);
    $('pick').showModal();
    return;
  }
  const res = L.doAction(state, b.dataset.act);
  if (!res.error) { react(res.face); beep(520 + Math.random() * 300); }
  afterChange(res);
  if (!res.error && b.dataset.act === 'rest') say('푹 쉬니까 기분 좋아!');
  if (!res.error && state.cond <= 15) toast(`${L.SON.nick}이가 많이 지쳤어요. 이대로 하루를 마치면 지친 날로 기록돼요.`);
});

function onMatch() {
  const mt = L.MATCHES[state.match];
  const res = L.doMatch(state);
  if (!res.error) {
    jingle(res.win ? [523, 659, 784, 1046] : [392, 330]);
    react(res.face);
    modal(res.win
      ? `${modalFace(res.face)}<p class="m-title">도전 성공!</p><p class="m-text">"${mt.name}"에서 상장을 받았어요.${mt.points ? ' 탁구 랭킹 포인트도 올랐어요.' : ''}</p>`
      : `${modalFace(res.face)}<p class="m-title">아쉽게 떨어졌어요</p><p class="m-text">${josa(L.statName(mt.stat), '을', '를')} 조금 더 키우면 성공률이 올라가요.</p>`);
  }
  afterChange(res);
}

$('endDay').addEventListener('click', () => {
  if (state.day === L.DAYS && L.canChooseLife(state)) { openLetters(); return; }
  if (state.ap > 0 && !confirm(`아직 일정이 ${state.ap}칸 남았어요. 그래도 하루를 마칠까요?`)) return;
  clearTimeout(reactionTimer); reaction = null;
  const { event, grew, tired } = L.endDay(state);
  beep(440, 0.1);
  if (tired && !state.ending) {
    const stage = L.stageOf(state.day).id;
    const tiredArt = state.gender !== 'female' && stage === 'adult'
      ? modalFace(L.reactionFace(state, 'tired', state.day))
      : `<img class="m-art small" src="${stageImg(stage, true)}" alt="">`;
    modal(`${tiredArt}<p class="m-title">너무 지친 하루였어요</p><p class="m-text">짜증이 늘어 인성이 떨어졌어요. 지친 날이 ${L.BURNOUT_LIMIT}번이 되면 번아웃 엔딩이에요. (지금 ${state.burnout}번)</p>`, '쉬게 해 줄게');
  }
  if (grew && !state.ending) {
    const st = L.stageOf(state.day);
    jingle([523, 659, 784]);
    modal(`${modalFace(L.reactionFace(state, 'praised', state.day))}<p class="m-title">${josa(st.name, '이', '가')} 됐어요!</p><p class="m-text">${L.SON.nick}이가 쑥 자랐어요. 이제 스탯이 ${L.statCap(state.day)}까지 자랄 수 있어요.</p>`, '대견하다');
  }
  if (event && !state.ending) modal(`${modalFace(event.face)}<p class="m-title">${event.title}</p><p class="m-text">${event.text}</p>`);
  L.newUnlocks(state);
  if (state.ending) showEnding();
  else say(greet());
  hop();
  render();
});

function endingTitle(id) {
  return id === 'runaway' && state.gender === 'female' ? '연락 끊긴 딸' : L.ENDINGS[id].title;
}
function showEnding() {
  const e = L.ENDINGS[state.ending];
  markEnding(state.ending);
  if (state.lifePath) {
    const records = lifeRecords();
    if (!records.some(([e, p]) => e === state.ending && p === state.lifePath)) {
      records.push([state.ending, state.lifePath]);
      try { localStorage.setItem(LIFE_KEY, JSON.stringify(records)); } catch { /* 이번 세션에서만 표시 */ }
    }
  }
  jingle(e.bad ? [392, 349, 330, 262] : state.ending === 'champion' ? [523, 659, 784, 1046, 1318] : [523, 659, 784, 1046]);
  say(e.bad ? '…' : '키워 줘서 고마워!');
  const badge = e.bad ? '<p class="m-badge bad">배드 엔딩</p>' : '<p class="m-badge">직업 엔딩</p>';
  modal(`${swapImg(state.ending, 'm-art')}<p class="m-hint">그림을 누르면 표정이 바뀌어요</p>${badge}<p class="m-title">${endingTitle(state.ending)}</p>
    <p class="m-sub">${L.COUNTRIES[state.country]?.flag || ''} ${esc(state.name)}, ${L.ageOf(L.DAYS)}살</p>
    <p class="m-text">${e.text(state)}</p>
    ${state.lifePath ? lifeStory(state.ending, state.lifePath) : ''}
    <ul class="m-list stats-end">${L.STATS.map((t) => `<li>${t.name}<b>${state.stats[t.key]}</b></li>`).join('')}<li>받은 상장<b>${state.awards}개</b></li><li>지친 날<b>${state.burnout}번</b></li></ul>`,
  '다시 키우기', () => openSetup(state));
}

$('rankCard').addEventListener('click', () => {
  if (!L.clubVisits(state)) {
    modal(`<div class="m-ico">🏅</div><p class="m-title">받은 상장 ${state.awards}개</p><p class="m-text">매일 바뀌는 오늘의 도전에 성공하면 상장과 상금을 받아요. 탁구장 활동을 시작하면 세계 랭킹도 생겨요.</p>`, '닫기');
    return;
  }
  const recent = state.log.filter((r) => r.points).slice(0, 5);
  modal(`<div class="m-ico">🌏</div><p class="m-title">세계 랭킹 ${L.worldRank(state)}위</p>
    <p class="m-text">랭킹 포인트 ${state.points.toLocaleString()}점. 탁구 대회에서 이기면 크게 오르고, 밤마다 탁구 실력만큼 쌓여요. 1위는 세계선수권 우승자 자리예요.</p>
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
  state.sound = e.target.sound.checked;
  render(); toast('저장했어요');
});
$('tutorialReplay').onclick = () => openTutorial(state.gender, true);
$('reset').addEventListener('click', () => {
  if (!confirm('지금까지 키운 기록이 모두 사라져요. 처음부터 다시 키울까요?')) return;
  $('prologueStartLabel').textContent = '게임 시작';
  playPrologue(() => openSetup(state));
});

function go(view) {
  document.querySelectorAll('[data-view]').forEach((v) => (v.hidden = v.dataset.view !== view));
  document.querySelectorAll('.tabbar [data-go]').forEach((b) => b.removeAttribute('aria-current'));
  document.querySelector(`.tabbar [data-go="${view}"]`).setAttribute('aria-current', 'page');
  scrollTo({ top: 0 });
}
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));

if (state) $('prologueStartLabel').textContent = '이어하기';

playPrologue(() => {
  document.querySelector('.phone').hidden = false;
  if (state) {
    L.newUnlocks(state);
    render();
    say(greet());
    openTutorial(state.gender);
    return;
  }
  state = L.newGame();
  render();
  say('응애… 나는 커서 뭐가 될까?');
  openSetup();
});
