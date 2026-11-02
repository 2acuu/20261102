/* ====================================================================
 *  水域安全小達人 —— 潛水探險多媒體互動測驗（p5.js + p5.sound）
 *  對象：國小五、六年級
 *  （已整合：6 題全對自動開啟海底寶箱慶祝特效）
 * ==================================================================== */

// ====================================================================
// 一、設定區 CONFIG
// ====================================================================
const CONFIG = {
  font: '"Noto Serif HK", serif, sans-serif',
  lang: 'zh-TW',
  autoSpeak: true,
  ttsRate: 0.95,
  ttsPitch: 1.1,
  masterVolume: 0.6,

  colors: {
    bgTop: [18, 92, 140],
    bgDeep: [3, 14, 34],
    text: [255, 255, 235],
    accent: [255, 214, 64],
    good: [80, 230, 150],
    bad: [255, 110, 110],
    panel: [8, 36, 62, 225],
    btn: [24, 96, 140],
    btnHover: [44, 144, 196],
    dark: [20, 50, 80]
  },

  fonts: { title: 60, subtitle: 26, question: 32, option: 28, body: 26, hud: 22, small: 20 },

  lives: 5,
  hints: 2,
  timerEnabled: true,
  timerSeconds: { single: 25, tf: 15, hazard: 40, order: 35, sound: 30, slider: 45 },

  pointsCorrect: 16.66,     // 6 題滿分約 100 分
  timeBonusMax: 0,
  comboBonus: 0,
  hazardMaxMiss: 2,
  maxDepth: 30,
  bubbleCount: 40,

  starRules: { three: 0.9, two: 0.6 },
  titles: { 3: '水域安全小達人', 2: '水域安全守護員', 1: '潛水見習生', fail: '再接再厲的潛水員' },

  coach: {
    welcome: ['我是海豚教練，一起潛水探險吧！'],
    correct: ['答對了，太厲害了！', '就是這樣，安全第一！', '你真是小專家！', '好棒，繼續保持！'],
    combo: ['連續答對！氣勢如虹！', 'Combo 啟動，你超強！'],
    wrong: ['沒關係，看看解析就學會了。', '別氣餒，下一題再加油！', '記住這一題，下次就會了。'],
    timeout: ['時間到了，下次要加快一點喔！'],
    miss: ['那裡不是危險的地方喔。', '再仔細看看～'],
    noHint: ['提示用完了，靠你自己啦！']
  }
};

const TYPE_NAMES = { single: '單選題', tf: '是非題', hazard: '找危險', order: '點選排序', sound: '聽音辨識', slider: '水溫與深度' };

// ====================================================================
// 二、題庫區 QUESTIONS (共 6 題)
// ====================================================================
const QUESTIONS = [
  {
    type: 'single',
    stem: '下水游泳之前，最正確的準備動作是什麼？',
    options: [
      '先做暖身操，再用水拍濕手腳和身體',
      '馬上從池邊用力跳進水裡',
      '吃得飽飽的，立刻下水游泳',
      '不用準備，直接下水就好'
    ],
    answer: 0,
    explain: '暖身可以讓肌肉活動開來，避免下水後抽筋；先用水拍濕身體，也能讓身體慢慢適應水溫。剛吃飽也不適合馬上游泳喔！',
    hint: '想想看：怎麼做才不會讓身體突然「嚇一跳」或抽筋呢？',
    scene: 'warmup',
    sfx: 'splash'
  },
  {
    type: 'tf',
    stem: '不小心掉進深水又不會游泳時，保持冷靜、仰漂等待救援，比用力掙扎更安全。',
    answer: true,
    explain: '用力掙扎會消耗體力，還容易嗆水。放鬆身體、頭向後仰讓口鼻露出水面，雙手張開慢慢呼吸，就能浮在水面等待救援，這就是「浮水待援」。',
    hint: '想一想：亂踢亂抓會不會很快就沒力氣了？',
    scene: 'floatback'
  },
  {
    type: 'hazard',
    stem: '【找危險】請點出泳池邊的 2 個危險行為！',
    items: [
      { kind: 'runner', x: 0.2, y: 0.34, size: 0.32, danger: true, label: '在池邊奔跑，地板濕滑容易跌倒' },
      { kind: 'diver', x: 0.76, y: 0.34, size: 0.32, danger: true, label: '在淺水區跳水，會撞傷頭和脖子' },
      { kind: 'lifeguard', x: 0.48, y: 0.3, size: 0.3, danger: false, label: '救生員' },
      { kind: 'ring', x: 0.92, y: 0.62, size: 0.2, danger: false, label: '救生圈' },
      { kind: 'swimmer', x: 0.36, y: 0.72, size: 0.2, danger: false, label: '正常游泳' }
    ],
    explain: '泳池邊地面濕滑，不可以奔跑；淺水區水很淺，跳水頭部會撞到池底，非常危險。救生員和救生圈是保護大家的好幫手。',
    hint: '找找看，哪些人的動作太「急」或太「猛」？',
    scene: 'pool',
    sfx: 'splash'
  },
  {
    type: 'order',
    stem: '【排順序】發現有人溺水時，請依照口訣「大叫、拋、划、走」的順序，依序點選步驟卡片。',
    options: [
      '大叫：大聲呼救，請大人打 119',
      '拋：拋出救生圈或浮具給對方',
      '划：用長竿、小船等工具靠近協助',
      '走：留在岸邊等專業救生員，不要下水'
    ],
    explain: '先「大叫」讓大家知道有人需要幫忙；再「拋」出浮具讓對方抓住；拋不到就用長竿、小船等器具「划」過去；最後要記得，自己留在安全的地方，讓專業的救生員處理，千萬不要自己下水。',
    hint: '第一步是什麼？先讓大家都知道有人需要幫忙！',
    scene: 'rescue'
  },
  {
    type: 'sound',
    stem: '請仔細聽這個聲音。如果你在泳池聽到這種連續又急促的哨聲，應該怎麼做？',
    options: [
      '立刻停止活動，看向救生員並聽從指示',
      '假裝沒聽到，繼續玩',
      '潛到水底躲起來',
      '跑去池邊追同學'
    ],
    answer: 0,
    explain: '急促的哨聲是救生員發出的警告或緊急訊號，可能有人需要幫助，或是出現危險。要立刻停下來、保持安靜，看著救生員聽指示。',
    hint: '救生員吹哨子，是要大家「注意」！',
    scene: 'sound_whistle',
    sfx: 'whistle'
  },
  {
    type: 'slider',
    stem: '【動態預測】操作下方滑桿調整「溪流試水溫與深度指標」，找出安全的水深（0.3m ~ 1.2m）與舒適水溫（20°C ~ 28°C）區間！',
    targetSliderMin: 0.15,
    targetSliderMax: 0.40,
    explain: '溪流水深如果超過 1.2 公尺（大人的胸口以上）或水溫太低（低於 20°C 容易抽筋）、太高都不安全！將滑桿調整到水深適中且水溫舒適的區間（大約在 30% ~ 40% 位置）即可過關。',
    hint: '左右滑動滑桿，觀察畫面的水位線高度與溫度計，當外框出現「綠色安全光暈」就代表找到安全區間囉！',
    scene: 'creek',
    sfx: 'water'
  }
];

// ====================================================================
// 三、全域狀態
// ====================================================================
let gameState = 'START';
let G = null;
let UI = {};
let btns = [], btnsPrev = [];
let uiLocked = false;
let hoverAny = false;
let bubbles = [], particles = [], ripples = [], floatTexts = [];
let shakeAmt = 0;
let bgDepth = 0;
let muted = false;
let timerSetting = CONFIG.timerEnabled;
let coach = { text: '', mood: 'happy', until: 0 };
let usingTouch = false, lastPressTime = 0, lastTouchTime = 0;
let fitCache = {};
let resultPage = 0;

let chest = null;
let chestFx = { confetti: [], loot: [] };
let lastCoinPing = 0;

let audioReady = false, oscVoices = [], voiceIdx = 0, noiseVoice = null, ttsVoice = null;
let sliderVal = 0.5;
let sliderDragging = false;
let lastSliderToneTime = 0;

// ====================================================================
// 四、音效區
// ====================================================================
function initAudio() {
  if (audioReady) return;
  try {
    userStartAudio();
    for (let i = 0; i < 6; i++) {
      const osc = new p5.Oscillator(440, 'sine');
      osc.amp(0);
      osc.start();
      oscVoices.push({ osc: osc, env: new p5.Envelope() });
    }
    const n = new p5.Noise('brown');
    n.amp(0);
    n.start();
    noiseVoice = { noise: n, env: new p5.Envelope() };
    audioReady = true;
  } catch (e) {
    console.warn('音效初始化失敗：', e);
  }
}

function tone(freq, dur, type, vol, glideTo, delay) {
  if (!audioReady) return;
  setTimeout(function () {
    if (muted) return;
    const v = oscVoices[voiceIdx++ % oscVoices.length];
    v.osc.setType(type || 'sine');
    v.osc.freq(freq);
    if (glideTo) v.osc.freq(glideTo, dur);
    v.env.setADSR(0.01, max(0.02, dur * 0.4), 0.5, max(0.03, dur * 0.4));
    v.env.setRange((vol || 0.4) * CONFIG.masterVolume, 0);
    v.env.play(v.osc, 0, dur * 0.6);
  }, (delay || 0) * 1000);
}

function noiseBurst(dur, vol, attack, delay) {
  if (!audioReady) return;
  setTimeout(function () {
    if (muted) return;
    const nv = noiseVoice;
    nv.env.setADSR(attack || 0.02, dur * 0.4, 0.4, dur * 0.4);
    nv.env.setRange((vol || 0.4) * CONFIG.masterVolume, 0);
    nv.env.play(nv.noise, 0, dur * 0.3);
  }, (delay || 0) * 1000);
}

const SFX = {
  click: function () { tone(660, 0.07, 'triangle', 0.3); },
  ding: function () { tone(1046, 0.12, 'triangle', 0.35); tone(1568, 0.18, 'sine', 0.3, null, 0.08); },
  correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, 'triangle', 0.4, null, i * 0.09); }); },
  wrong: function () { tone(240, 0.4, 'sawtooth', 0.3, 110); noiseBurst(0.3, 0.25, 0.01); },
  buzz: function () { tone(180, 0.18, 'square', 0.2, 120); },
  hint: function () { tone(880, 0.1, 'sine', 0.3); tone(1320, 0.14, 'sine', 0.3, null, 0.1); },
  tick: function () { tone(1000, 0.05, 'square', 0.12); },
  gameover: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.25, 'triangle', 0.4, null, i * 0.2); }); },
  fanfare: function () { [523, 659, 784, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.2, 'triangle', 0.4, null, i * 0.12); }); },
  splash: function () { noiseBurst(0.5, 0.4, 0.02); tone(500, 0.2, 'sine', 0.15, 250); },
  water: function () { noiseBurst(1.6, 0.45, 0.4); },
  sliderMove: function (freq) { tone(freq, 0.12, 'sine', 0.15); },
  whistle: function () {
    for (let b = 0; b < 2; b++) {
      for (let i = 0; i < 7; i++) tone(i % 2 ? 2900 : 2600, 0.09, 'sine', 0.35, null, b * 1.0 + i * 0.1);
    }
  },
  thunder: function () {
    noiseBurst(1.2, 0.9, 0.03);
    noiseBurst(2.0, 0.7, 0.05, 0.6);
    tone(70, 1.8, 'sine', 0.6, 35);
  },

  chestWhoosh: function () { tone(1200, 0.8, 'sine', 0.12, 200); },
  chestThud: function () { tone(110, 0.35, 'sine', 0.7, 45); noiseBurst(0.25, 0.4, 0.005); },
  chestRumble: function () { tone(70, 1.0, 'sawtooth', 0.25, 160); noiseBurst(1.0, 0.22, 0.5); },
  chestLock: function () {
    tone(1800, 0.05, 'square', 0.22); tone(1200, 0.07, 'square', 0.22, null, 0.14);
    tone(520, 0.14, 'triangle', 0.3, null, 0.3);
  },
  chestCreak: function () { tone(220, 0.7, 'sawtooth', 0.2, 520); tone(233, 0.7, 'square', 0.08, 560, 0.02); },
  chestBurst: function () {
    noiseBurst(0.8, 0.55, 0.01);
    tone(131, 0.9, 'sine', 0.5);
    [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0.3, 'triangle', 0.4, null, i * 0.07); });
  },
  popper: function () { noiseBurst(0.15, 0.5, 0.003); tone(900, 0.25, 'sine', 0.25, 2400); },
  coinShower: function () {
    const notes = [1568, 1760, 2093, 2349, 2637];
    for (let i = 0; i < 14; i++) tone(random(notes), 0.09, 'sine', 0.2, null, i * 0.09 + random(0.04));
  },
  coinPing: function () { tone(random([2093, 2637, 3136]), 0.06, 'sine', 0.1); },
  grandFanfare: function () {
    [[523, 0], [659, 0.14], [784, 0.28], [1047, 0.42], [784, 0.72], [1047, 0.86], [1319, 1.0]]
      .forEach(function (n) { tone(n[0], 0.22, 'triangle', 0.4, null, n[1]); });
    tone(1047, 0.9, 'triangle', 0.32, null, 1.15); tone(784, 0.9, 'triangle', 0.28, null, 1.15);
    tone(523, 0.9, 'triangle', 0.28, null, 1.15);
  }
};

function playSfx(name, param) {
  if (muted || !audioReady) return;
  if (SFX[name]) SFX[name](param);
}

function toggleMute() {
  muted = !muted;
  if (muted && 'speechSynthesis' in window) speechSynthesis.cancel();
  if (!muted) playSfx('ding');
}

function pickTtsVoice() {
  if (ttsVoice || !('speechSynthesis' in window)) return ttsVoice;
  const list = speechSynthesis.getVoices();
  ttsVoice = list.find(function (v) { return v.lang === 'zh-TW' || v.lang === 'zh_TW'; }) ||
             list.find(function (v) { return v.lang && v.lang.toLowerCase().indexOf('zh') === 0; }) || null;
  return ttsVoice;
}

function speak(text, onEnd) {
  let called = false;
  const once = function () { if (!called) { called = true; if (onEnd) onEnd(); } };
  if (muted || !('speechSynthesis' in window)) { setTimeout(once, 400); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = CONFIG.lang;
    u.rate = CONFIG.ttsRate;
    u.pitch = CONFIG.ttsPitch;
    const v = pickTtsVoice();
    if (v) u.voice = v;
    u.onend = once;
    u.onerror = once;
    speechSynthesis.speak(u);
    setTimeout(once, max(3500, text.length * 450));
  } catch (e) {
    setTimeout(once, 400);
  }
}

// ====================================================================
// 五、工具函式
// ====================================================================
function mixCol(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function pick(arr) { return arr[floor(random(arr.length))]; }
function stripTag(s) { return s.replace(/【[^】]*】/g, ''); }
function fz(n) { return max(13, n * UI.s); }

function calcLayout() {
  const W = width, H = height;
  const s = constrain(min(W / 700, H / 720), 0.55, 1.5);
  UI = { W: W, H: H, s: s, m: max(8, 14 * s), hudH: max(78, 92 * s), stripH: max(72, 88 * s) };
  fitCache = {};
}

function wrapLines(str, w, size) {
  textFont(CONFIG.font);
  textSize(size);
  const out = [];
  const NOBREAK = '，。！？、；：）」』,.!?)';
  const paras = String(str).split('\n');
  for (let p = 0; p < paras.length; p++) {
    let cur = '';
    for (const ch of paras[p]) {
      if (cur !== '' && textWidth(cur + ch) > w && NOBREAK.indexOf(ch) < 0) { out.push(cur); cur = ch; }
      else cur += ch;
    }
    out.push(cur);
  }
  return out;
}

function fitText(str, w, hmax, maxS, minS) {
  const key = [str, round(w), round(hmax), round(maxS), round(minS)].join('|');
  if (fitCache[key]) return fitCache[key];
  if (Object.keys(fitCache).length > 400) fitCache = {};
  textFont(CONFIG.font);
  textStyle(BOLD);
  let size = round(maxS), lines = [], lh = 0;
  for (; size >= minS; size -= 1) {
    lines = wrapLines(str, w, size);
    lh = size * 1.32;
    if (lines.length * lh <= hmax) break;
  }
  size = max(size, round(minS));
  if (lines.length === 0 || lh === 0) { lines = wrapLines(str, w, size); lh = size * 1.32; }
  fitCache[key] = { size: size, lines: lines, lh: lh };
  return fitCache[key];
}

function drawFitted(str, x, y, w, h, maxS, minS, align, col, valign) {
  const f = fitText(str, w, h, maxS, minS);
  textFont(CONFIG.font);
  textStyle(BOLD);
  textSize(f.size);
  textAlign(align || CENTER, TOP);
  noStroke();
  fill(col || CONFIG.colors.text);
  const total = f.lines.length * f.lh;
  let yy = valign === 'top' ? y : y + (h - total) / 2;
  const ax = align === LEFT ? x : (align === RIGHT ? x + w : x + w / 2);
  for (let i = 0; i < f.lines.length; i++) {
    text(f.lines[i], ax, yy + (f.lh - f.size) * 0.4);
    yy += f.lh;
  }
  return total;
}

function isHover(x, y, w, h) {
  return !usingTouch && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function registerHit(x, y, w, h, onClick, silent) {
  if (!uiLocked) btns.push({ x: x, y: y, w: w, h: h, onClick: onClick, silent: !!silent });
}

function addButton(label, x, y, w, h, onClick, opt) {
  opt = opt || {};
  const dis = !!opt.disabled;
  const live = !dis && !uiLocked;
  const hov = live && isHover(x, y, w, h);
  if (hov) hoverAny = true;
  const press = hov && mouseIsPressed;
  const lift = hov ? -2 : 0;
  const rad = min(h * 0.28, 18);
  push();
  noStroke();
  fill(0, 0, 0, 80);
  rect(x + 2, y + 5, w, h, rad);
  let fc = opt.fill || CONFIG.colors.btn;
  if (hov) fc = opt.hoverFill || mixCol(fc, [255, 255, 255], 0.25);
  if (dis && !opt.keepColor) fc = mixCol(fc, [40, 50, 60], 0.6);
  fill(fc);
  if (opt.stroke) { stroke(opt.stroke); strokeWeight(4); }
  else if (hov) { stroke(CONFIG.colors.accent); strokeWeight(4); }
  else { stroke(255, 255, 255, 110); strokeWeight(2); }
  const yy = y + lift + (press ? 3 : 0);
  rect(x, yy, w, h, rad);
  noStroke();
  let tx = x + (opt.padL || h * 0.3), tw = w - (opt.padL || h * 0.3) - h * 0.3;
  if (opt.badge !== undefined) {
    const bx = x + h * 0.5, by = yy + h / 2, bd = h * 0.52;
    fill(255, 255, 255, dis ? 120 : 235);
    circle(bx, by, bd);
    fill(CONFIG.colors.dark);
    textAlign(CENTER, CENTER);
    textFont(CONFIG.font);
    textStyle(BOLD);
    textSize(max(12, bd * 0.6));
    text(opt.badge, bx, by);
    tx = x + h * 0.95; tw = w - h * 0.95 - h * 0.25;
  }
  const tcol = dis && !opt.keepColor ? [170, 185, 195] : (opt.textCol || CONFIG.colors.text);
  if (label) {
    drawFitted(label, tx, yy + h * 0.06, tw, h * 0.88, fz(opt.size || CONFIG.fonts.option), 12,
      opt.align || CENTER, tcol);
  }
  pop();
  if (live) btns.push({ x: x, y: y, w: w, h: h, onClick: onClick, silent: !!opt.silent });
  return hov;
}

function drawSpeakerIcon(cx, cy, r, on) {
  push();
  fill(255); noStroke();
  beginShape();
  vertex(cx - r * 0.9, cy - r * 0.35); vertex(cx - r * 0.4, cy - r * 0.35); vertex(cx + r * 0.1, cy - r * 0.8);
  vertex(cx + r * 0.1, cy + r * 0.8); vertex(cx - r * 0.4, cy + r * 0.35); vertex(cx - r * 0.9, cy + r * 0.35);
  endShape(CLOSE);
  noFill(); stroke(255); strokeWeight(max(2, r * 0.18)); strokeCap(ROUND);
  if (on) {
    arc(cx + r * 0.1, cy, r * 1.0, r * 1.0, -0.9, 0.9);
    arc(cx + r * 0.1, cy, r * 1.7, r * 1.7, -0.9, 0.9);
  } else {
    stroke(CONFIG.colors.bad);
    line(cx + r * 0.4, cy - r * 0.45, cx + r * 1.1, cy + r * 0.45);
    line(cx + r * 1.1, cy - r * 0.45, cx + r * 0.4, cy + r * 0.45);
  }
  pop();
}

function drawStar(cx, cy, r1, r2, n, rot) {
  beginShape();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * PI) / n - HALF_PI;
    const r = i % 2 === 0 ? r1 : r2;
    vertex(cx + cos(a) * r, cy + sin(a) * r);
  }
  endShape(CLOSE);
}

function drawArrow(x, y, len, col) {
  noStroke(); fill(col);
  rect(x, y - len * 0.08, len * 0.65, len * 0.16, 3);
  triangle(x + len * 0.6, y - len * 0.22, x + len, y, x + len * 0.6, y + len * 0.22);
}

function drawSpeech(x, y, str, size) {
  push();
  textFont(CONFIG.font); textStyle(BOLD); textSize(size);
  const w = textWidth(str) + size * 1.2, h = size * 1.8;
  noStroke(); fill(255, 255, 255, 240);
  rect(x - w / 2, y - h - size * 0.5, w, h, 10);
  triangle(x - size * 0.3, y - size * 0.5, x + size * 0.3, y - size * 0.5, x, y);
  fill(CONFIG.colors.dark); textAlign(CENTER, CENTER);
  text(str, x, y - h / 2 - size * 0.5);
  pop();
}

function spawnBurst(x, y, good) {
  const n = good ? 35 : 18;
  const palette = good ? [[255, 214, 64], [80, 230, 150], [120, 200, 255], [255, 255, 255]] : [[255, 110, 110], [255, 170, 120]];
  for (let i = 0; i < n; i++) {
    particles.push({
      x: x, y: y, vx: random(-6, 6) * UI.s, vy: random(-9, -2) * UI.s, g: 0.18 * UI.s,
      life: 1, dec: random(0.012, 0.025), size: random(6, 14) * UI.s,
      col: pick(palette), star: good && random() < 0.5, rot: random(TWO_PI)
    });
  }
  ripples.push({ x: x, y: y, r: 10, rmax: 160 * UI.s, col: good ? CONFIG.colors.good : CONFIG.colors.bad, life: 1 });
  ripples.push({ x: x, y: y, r: 0, rmax: 100 * UI.s, col: [255, 255, 255], life: 1 });
}

function spawnFloatText(x, y, str, col) {
  floatTexts.push({ x: x, y: y, str: str, col: col, life: 1 });
}

function drawFX() {
  noStroke();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= p.dec; p.rot += 0.1;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    fill(p.col[0], p.col[1], p.col[2], 255 * p.life);
    if (p.star) drawStar(p.x, p.y, p.size, p.size * 0.45, 5, p.rot);
    else circle(p.x, p.y, p.size);
  }
  noFill();
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.r += (r.rmax - r.r) * 0.08 + 1; r.life -= 0.025;
    if (r.life <= 0) { ripples.splice(i, 1); continue; }
    stroke(r.col[0], r.col[1], r.col[2], 220 * r.life); strokeWeight(4 * UI.s);
    circle(r.x, r.y, r.r * 2);
  }
  noStroke(); textAlign(CENTER, CENTER); textFont(CONFIG.font); textStyle(BOLD);
  for (let i = floatTexts.length - 1; i >= 0; i--) {
    const f = floatTexts[i];
    f.y -= 1.2 * UI.s; f.life -= 0.012;
    if (f.life <= 0) { floatTexts.splice(i, 1); continue; }
    textSize(fz(34));
    fill(0, 0, 0, 150 * f.life); text(f.str, f.x + 2, f.y + 2);
    fill(f.col[0], f.col[1], f.col[2], 255 * f.life); text(f.str, f.x, f.y);
  }
}

// ====================================================================
// 六、場景動畫區
// ====================================================================
function initBubbles() {
  bubbles = [];
  for (let i = 0; i < CONFIG.bubbleCount; i++) {
    bubbles.push({ x: random(width), y: random(height), r: random(3, 11), v: random(0.2, 0.9), ph: random(TWO_PI) });
  }
}

function drawBackground(t) {
  const target = (gameState === 'PLAY' && G) ? constrain((G.idx + (G.phase === 'feedback' ? 1 : 0)) / G.pool.length, 0, 1) : 0;
  bgDepth = lerp(bgDepth, target, 0.03);
  const top = mixCol(CONFIG.colors.bgTop, CONFIG.colors.bgDeep, bgDepth * 0.7);
  const bot = mixCol(CONFIG.colors.bgDeep, [0, 6, 18], bgDepth);
  const ctx = drawingContext;
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, 'rgb(' + round(top[0]) + ',' + round(top[1]) + ',' + round(top[2]) + ')');
  g.addColorStop(1, 'rgb(' + round(bot[0]) + ',' + round(bot[1]) + ',' + round(bot[2]) + ')');
  ctx.fillStyle = g;
  ctx.fillRect(-20, -20, width + 40, height + 40);

  noStroke();
  const beamA = 22 * (1 - bgDepth * 0.8);
  for (let i = 0; i < 4; i++) {
    const cx = (i * 0.27 + 0.08) * width + sin(t * 0.3 + i * 1.7) * 50;
    fill(255, 255, 255, beamA);
    quad(cx - 20, 0, cx + 30, 0, cx + 160 + sin(t * 0.2 + i) * 40, height, cx - 120, height);
  }
  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];
    b.y -= b.v; b.x += sin(t + b.ph) * 0.3;
    if (b.y < -b.r) { b.y = height + b.r; b.x = random(width); }
    noFill(); stroke(200, 235, 255, 90); strokeWeight(1.5);
    circle(b.x, b.y, b.r * 2);
    noStroke(); fill(255, 255, 255, 60); circle(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.5);
  }
}

function drawDolphin(cx, cy, k, mood, t) {
  push();
  translate(cx, cy);
  let bob = sin(t * 2.2) * 4 * k;
  if (mood === 'cheer') bob = -abs(sin(t * 7)) * 18 * k;
  translate(0, bob);
  scale(k);
  if (mood === 'sad') rotate(0.1);
  noStroke();
  push();
  translate(-52, 2); rotate(-0.25 + sin(t * 5) * 0.15);
  fill(70, 130, 185);
  triangle(0, 0, -30, -26, -20, 0);
  triangle(0, 0, -30, 26, -20, 2);
  pop();
  fill(80, 145, 205); ellipse(0, 0, 120, 62);
  fill(225, 242, 252); ellipse(8, 12, 98, 34);
  fill(60, 120, 175); triangle(-12, -27, 10, -54, 24, -24);
  fill(95, 160, 215); ellipse(56, 6, 40, 18);
  push(); translate(-2, 16); rotate(0.5 + sin(t * 3) * 0.2);
  fill(60, 120, 175); triangle(0, 0, -12, 34, 12, 22); pop();
  fill(230, 60, 60); arc(24, -24, 40, 26, PI, TWO_PI);
  fill(200, 40, 40); rect(26, -26, 24, 5, 3);
  const dark = [30, 40, 70];
  if (mood === 'happy' || mood === 'cheer') {
    noFill(); stroke(dark); strokeWeight(3.5); strokeCap(ROUND);
    arc(30, -4, 14, 12, PI, TWO_PI);
    arc(52, 6, 28, 16, 0.15, PI - 0.15);
    noStroke(); fill(255, 150, 170, 150); circle(36, 8, 10);
    if (mood === 'cheer') { fill(255, 214, 64); drawStar(70, -30 + sin(t * 8) * 3, 7, 3, 5, t * 3); drawStar(-8, -46, 5, 2, 5, -t * 3); }
  } else if (mood === 'sad') {
    fill(255); circle(30, -6, 14); fill(dark); circle(31, -4, 7);
    stroke(dark); strokeWeight(3); line(21, -17, 37, -11);
    noFill(); arc(52, 16, 26, 12, PI + 0.3, TWO_PI - 0.3);
    noStroke(); fill(120, 200, 255); ellipse(35, 6, 5, 9);
  } else if (mood === 'think') {
    fill(255); circle(30, -6, 14); fill(dark); circle(33, -9, 7);
    stroke(dark); strokeWeight(3); line(40, 8, 68, 8);
    noStroke(); fill(255, 214, 64); textAlign(CENTER, CENTER); textFont(CONFIG.font); textSize(28); textStyle(BOLD); text('?', 50 + sin(t * 3) * 3, -42);
  } else {
    if ((floor(t * 10) % 40) < 2) { stroke(dark); strokeWeight(3); line(23, -6, 37, -6); }
    else { fill(255); circle(30, -6, 14); fill(dark); circle(31, -6, 7); }
    noFill(); stroke(dark); strokeWeight(3); strokeCap(ROUND);
    arc(52, 5, 24, 12, 0.2, PI - 0.2);
  }
  pop();
}

function coachMood() { return millis() < coach.until ? coach.mood : 'idle'; }
function setCoach(text, mood, dur) { coach = { text: text, mood: mood, until: millis() + (dur || 0) }; }

function drawStick(x, y, s, armA, legA, opt) {
  opt = opt || {};
  const shirt = opt.shirt || [255, 150, 60], skin = [255, 214, 170];
  push();
  translate(x, y); strokeCap(ROUND);
  const sw = s * 0.09;
  stroke(60, 80, 140); strokeWeight(sw);
  for (let i = 0; i < legA.length; i++) line(0, s * 0.08, sin(legA[i]) * s * 0.32, s * 0.08 + cos(legA[i]) * s * 0.32);
  stroke(shirt); strokeWeight(sw * 1.6); line(0, -s * 0.24, 0, s * 0.1);
  stroke(skin); strokeWeight(sw * 0.9);
  for (let i = 0; i < armA.length; i++) line(0, -s * 0.2, sin(armA[i]) * s * 0.28, -s * 0.2 + cos(armA[i]) * s * 0.28);
  noStroke(); fill(skin); circle(0, -s * 0.38, s * 0.2);
  fill(opt.cap || [70, 50, 40]); arc(0, -s * 0.38, s * 0.21, s * 0.21, PI, TWO_PI);
  pop();
}

function waveFill(w, h, y0, amp, len, speed, t, col) {
  noStroke(); fill(col);
  beginShape();
  vertex(-10, h + 10);
  for (let x = -10; x <= w + 10; x += 10) vertex(x, y0 + sin(x / len + t * speed) * amp);
  vertex(w + 10, h + 10);
  endShape(CLOSE);
}

function drawScene(q, r, t) {
  push();
  translate(r.x, r.y);
  const ctx = drawingContext;
  ctx.save();
  const rad = 14;
  ctx.beginPath();
  ctx.moveTo(rad, 0); ctx.lineTo(r.w - rad, 0); ctx.arcTo(r.w, 0, r.w, rad, rad);
  ctx.lineTo(r.w, r.h - rad); ctx.arcTo(r.w, r.h, r.w - rad, r.h, rad);
  ctx.lineTo(rad, r.h); ctx.arcTo(0, r.h, 0, r.h - rad, rad);
  ctx.lineTo(0, rad); ctx.arcTo(0, 0, rad, 0, rad);
  ctx.closePath();
  ctx.clip();
  const w = r.w, h = r.h, u = min(w, h);
  switch (q.scene) {
    case 'pool': bgPool(w, h, t); break;
    case 'beach': bgBeach(w, h, t); break;
    case 'creek': 
      if (q.type === 'slider') sceneSliderInteractive(w, h, u, t, q);
      else bgCreek(w, h, t); 
      break;
    case 'warmup': sceneWarmup(w, h, u, t); break;
    case 'lifejacket': sceneLifejacket(w, h, u, t); break;
    case 'rip': sceneRip(w, h, u, t); break;
    case 'rescue': sceneRescue(w, h, u, t); break;
    case 'floatback': sceneFloatBack(w, h, u, t); break;
    case 'sound_whistle': case 'sound_thunder': case 'sound_help': case 'sound_water':
      sceneSound(q.scene, w, h, u, t); break;
    default: bgPool(w, h, t);
  }
  if (q.items && q.type !== 'slider') {
    for (let i = 0; i < q.items.length; i++) {
      const it = q.items[i];
      drawItem(it.kind, it.x * w, it.y * h, it.size * u, t);
    }
  }
  ctx.restore();
  
  let isSafeGlow = false;
  if (q.type === 'slider') {
    if (sliderVal >= q.targetSliderMin && sliderVal <= q.targetSliderMax) {
      isSafeGlow = true;
    }
  }

  noFill(); 
  if (isSafeGlow) {
    stroke(CONFIG.colors.good[0], CONFIG.colors.good[1], CONFIG.colors.good[2], 200 + 55 * sin(t * 8));
    strokeWeight(6);
  } else {
    stroke(255, 255, 255, 110); 
    strokeWeight(2);
  }
  rect(0, 0, w, h, rad);
  pop();
}

function bgPool(w, h, t) {
  noStroke();
  fill(45, 80, 115); rect(0, 0, w, h * 0.22);
  fill(255, 255, 255, 40);
  for (let i = 0; i < 6; i++) rect(w * (0.05 + i * 0.16), h * 0.03, w * 0.1, h * 0.1, 4);
  fill(210, 225, 238); rect(0, h * 0.22, w, h * 0.28);
  stroke(170, 190, 210); strokeWeight(1.5);
  for (let i = 0; i <= 14; i++) line(w * i / 14, h * 0.22, w * i / 14, h * 0.5);
  fill(245, 190, 40); noStroke(); rect(0, h * 0.47, w, h * 0.03);
  fill(30, 150, 210); rect(0, h * 0.5, w, h * 0.5);
  waveFill(w, h, h * 0.5, 4, 32, 2.2, t, [70, 215, 245, 190]);
  stroke(255, 255, 255, 140); strokeWeight(3);
  for (let i = 1; i <= 3; i++) {
    const y = h * (0.52 + i * 0.13);
    for (let x = 0; x < w; x += 20) line(x, y, x + 10, y + sin(x * 0.05 + t * 2.5) * 3);
  }
  noStroke();
}

function bgBeach(w, h, t) {
  noStroke();
  fill(120, 195, 240); rect(0, 0, w, h * 0.22);
  fill(255, 240, 150, 220); circle(w * 0.88, h * 0.12, h * 0.16);
  fill(255, 250, 200, 100); circle(w * 0.88, h * 0.12, h * 0.24);
  waveFill(w, h, h * 0.22, 4, 28, 1.4, t, [22, 110, 175]);
  waveFill(w, h, h * 0.33, 5, 38, 1.1, t + 1, [32, 138, 198]);
  waveFill(w, h, h * 0.44, 4, 45, 0.9, t, [255, 255, 255, 200]);
  waveFill(w, h, h * 0.46, 3, 45, 0.9, t, [240, 215, 150]);
  fill(220, 190, 130, 130);
  for (let i = 0; i < 7; i++) ellipse(w * (0.08 + i * 0.15), h * (0.7 + (i % 3) * 0.08), w * 0.14, h * 0.035);
}

function bgCreek(w, h, t) {
  noStroke();
  fill(130, 160, 180); rect(0, 0, w, h * 0.4);
  fill(50, 95, 85);
  beginShape(); vertex(0, h * 0.4); vertex(0, h * 0.22); vertex(w * 0.2, h * 0.1); vertex(w * 0.45, h * 0.26);
  vertex(w * 0.7, h * 0.15); vertex(w, h * 0.28); vertex(w, h * 0.4); endShape(CLOSE);
  fill(50, 140, 160); rect(0, h * 0.4, w, h * 0.38);
  stroke(255, 255, 255, 140); strokeWeight(3);
  for (let i = 0; i < 16; i++) {
    const x = ((i * 0.1 * w + t * w * 0.18) % (w + 40)) - 20;
    const y = h * (0.43 + ((i * 0.37) % 1) * 0.32);
    line(x, y, x + w * 0.07, y);
  }
  noStroke(); fill(70, 135, 70); rect(0, h * 0.78, w, h * 0.22);
  fill(100, 110, 110);
  ellipse(w * 0.08, h * 0.86, w * 0.16, h * 0.11); ellipse(w * 0.82, h * 0.9, w * 0.2, h * 0.13);
}

function sceneSliderInteractive(w, h, u, t, q) {
  noStroke();
  fill(110, 150, 175); rect(0, 0, w, h * 0.35);
  fill(50, 110, 90);
  beginShape(); vertex(0, h * 0.35); vertex(0, h * 0.2); vertex(w * 0.3, h * 0.08); vertex(w * 0.6, h * 0.22); vertex(w, h * 0.15); vertex(w, h * 0.35); endShape(CLOSE);

  // 同步計算水深與水溫（sliderVal 0.0 ~ 1.0 對應水深 0.0 ~ 2.5m, 水溫 15°C ~ 32°C）
  const curDepth = sliderVal * 2.5;
  const curTemp = 15 + sliderVal * 17; 
  const waterHeight = (h * 0.35) + sliderVal * (h * 0.45);

  fill(30, 130, 180, 210); rect(0, h * 0.8 - waterHeight * 0.5, w, waterHeight);
  waveFill(w, h, h * 0.8 - waterHeight * 0.5, 4, 30, 2.0, t, [70, 200, 235, 180]);

  const stickY = h * 0.55;
  drawStick(w * 0.25, stickY, u * 0.45, [0.2, -0.2], [0.1, -0.1], { shirt: [255, 140, 60] });

  push();
  noStroke(); fill(0, 0, 0, 160);
  rect(w * 0.42, h * 0.08, w * 0.54, h * 0.26, 10);

  textAlign(LEFT, CENTER); textFont(CONFIG.font); textStyle(BOLD); textSize(fz(17));
  fill(255);
  text('即時水深：' + curDepth.toFixed(1) + ' 公尺', w * 0.45, h * 0.13);
  text('即時水溫：' + curTemp.toFixed(1) + ' °C', w * 0.45, h * 0.21);

  const isSafe = (sliderVal >= q.targetSliderMin && sliderVal <= q.targetSliderMax);
  fill(isSafe ? CONFIG.colors.good : CONFIG.colors.bad);
  text(isSafe ? '★ 目前在安全區間！' : '⚠ 請調整至安全水深與水溫', w * 0.45, h * 0.28);
  pop();
}

function sceneWarmup(w, h, u, t) {
  noStroke();
  fill(80, 140, 185); rect(0, 0, w, h);
  fill(206, 220, 232); rect(0, h * 0.62, w, h * 0.38);
  waveFill(w, h, h * 0.86, 3, 24, 2, t, [60, 170, 215]);
  const a = PI * 0.92 + sin(t * 3) * 0.55;
  drawStick(w / 2, h * 0.5, u * 0.62, [a, -a], [0.3, -0.3], { shirt: [255, 150, 60], cap: [60, 40, 30] });
  const n = floor(t * 2) % 4 + 1;
  fill(255, 214, 64); circle(w * 0.84, h * 0.2, u * 0.2);
  fill(CONFIG.colors.dark); textAlign(CENTER, CENTER); textFont(CONFIG.font); textStyle(BOLD); textSize(u * 0.13); text(n, w * 0.84, h * 0.2);
}

function sceneLifejacket(w, h, u, t) {
  noStroke();
  fill(170, 220, 245); rect(0, 0, w, h);
  fill(255, 235, 130); circle(w * 0.85, h * 0.15, u * 0.18);
  waveFill(w, h, h * 0.5, 4, 30, 1.5, t, [40, 150, 205]);
  const cx = w / 2, cy = h * 0.5 + sin(t * 2) * u * 0.02;
  stroke(255, 214, 170); strokeWeight(u * 0.035); strokeCap(ROUND);
  line(cx - u * 0.17, cy - u * 0.02, cx - u * 0.3, cy - u * 0.17 + sin(t * 3) * u * 0.03);
  line(cx + u * 0.17, cy - u * 0.02, cx + u * 0.3, cy - u * 0.17 - sin(t * 3) * u * 0.03);
  noStroke(); fill(255, 214, 170); circle(cx, cy - u * 0.2, u * 0.2);
  fill(70, 50, 40); arc(cx, cy - u * 0.2, u * 0.21, u * 0.21, PI, TWO_PI);
  fill(255, 120, 20); rect(cx - u * 0.17, cy - u * 0.1, u * 0.34, u * 0.2, 12);
  fill(255, 255, 255); rect(cx - u * 0.17, cy - u * 0.03, u * 0.34, u * 0.025);
  fill(60, 60, 60); rect(cx - u * 0.025, cy - u * 0.1, u * 0.05, u * 0.2, 3);
  waveFill(w, h, h * 0.58, 5, 26, 2, t + 2, [60, 170, 220, 190]);
}

function sceneRip(w, h, u, t) {
  noStroke();
  fill(25, 110, 170); rect(0, 0, w, h);
  fill(238, 214, 150); rect(0, 0, w * 0.16, h);
  fill(255, 255, 255, 170); rect(w * 0.16 - 4, 0, 6, h);
  const gy0 = h * 0.4, gy1 = h * 0.6;
  stroke(255, 255, 255, 190); strokeWeight(max(3, u * 0.012)); noFill();
  const span = w * 0.75;
  for (let k = 0; k < 5; k++) {
    const x = w * 0.22 + (((k * w * 0.15 - t * w * 0.05) % span) + span) % span;
    line(x, 0, x, gy0 - 8); line(x, gy1 + 8, x, h);
  }
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.35 + k / 3) % 1;
    drawArrow(lerp(w * 0.18, w * 0.78, p), h * 0.5, u * 0.22, [255, 90, 90, 255 * (1 - abs(p - 0.5) * 1.3)]);
  }
  const p2 = (t * 0.12) % 1, sx = lerp(w * 0.28, w * 0.8, p2), sy = h * 0.5 + sin(t * 4) * 3;
  noStroke(); fill(255, 214, 170); circle(sx, sy, u * 0.09);
  stroke(255, 214, 170); strokeWeight(u * 0.02); line(sx, sy, sx + u * 0.05, sy - u * 0.1 + sin(t * 8) * 4);
  const al = 150 + 105 * sin(t * 3);
  push(); translate(w * 0.5, h * 0.3); rotate(-HALF_PI); drawArrow(0, 0, u * 0.24, [80, 230, 150, al]); pop();
  push(); translate(w * 0.5, h * 0.7); rotate(HALF_PI); drawArrow(0, 0, u * 0.24, [80, 230, 150, al]); pop();
  noStroke(); fill(255); textFont(CONFIG.font); textStyle(BOLD); textAlign(CENTER, CENTER); textSize(max(12, u * 0.065));
  text('離岸流', w * 0.55, h * 0.43); text('平行游', w * 0.5, h * 0.12); text('海岸', w * 0.08, h * 0.5);
}

function sceneRescue(w, h, u, t) {
  noStroke();
  fill(190, 225, 245); rect(0, 0, w, h);
  fill(40, 140, 200); rect(0, h * 0.52, w, h * 0.48);
  waveFill(w, h, h * 0.52, 4, 26, 2, t, [70, 175, 225]);
  fill(205, 215, 225); rect(0, h * 0.5, w * 0.34, h * 0.5);
  const ph = (t % 5) / 5;
  const raise = ph < 0.3 ? PI * 0.85 + sin(t * 8) * 0.2 : 2.2;
  drawStick(w * 0.16, h * 0.4, u * 0.42, [raise, 0.3], [0.15, -0.15], { shirt: [230, 70, 70] });
  const px = w * 0.72, py = h * 0.6 + sin(t * 3) * 4;
  noStroke(); fill(255, 214, 170); circle(px, py, u * 0.09);
  stroke(255, 214, 170); strokeWeight(u * 0.02); line(px, py, px + u * 0.04, py - u * 0.11 + sin(t * 9) * 5);
  let rx, ry;
  if (ph < 0.3) { rx = w * 0.22; ry = h * 0.4; }
  else if (ph < 0.8) {
    const p = (ph - 0.3) / 0.5;
    rx = lerp(w * 0.22, w * 0.68, p); ry = lerp(h * 0.4, h * 0.6, p) - sin(p * PI) * h * 0.22;
  } else { rx = px - u * 0.02; ry = py + u * 0.02; }
  noFill(); stroke(230, 50, 50); strokeWeight(u * 0.03); circle(rx, ry, u * 0.13);
  stroke(255); strokeWeight(u * 0.03); arc(rx, ry, u * 0.13, u * 0.13, 0, 0.8); arc(rx, ry, u * 0.13, u * 0.13, PI, PI + 0.8);
  waveFill(w, h, h * 0.62, 4, 22, 2.4, t + 1, [60, 160, 215, 170]);
  if (ph < 0.3) drawSpeech(w * 0.16, h * 0.18, '大叫！救命！', max(12, u * 0.06));
  else if (ph < 0.8) drawSpeech(w * 0.16, h * 0.18, '拋！', max(12, u * 0.06));
  else drawSpeech(w * 0.72, h * 0.45, '抓住了！', max(12, u * 0.06));
}

function sceneFloatBack(w, h, u, t) {
  noStroke();
  fill(170, 220, 245); rect(0, 0, w, h);
  fill(255, 235, 130); circle(w * 0.14, h * 0.18, u * 0.18);
  waveFill(w, h, h * 0.55, 4, 30, 1.2, t, [40, 150, 205]);
  push();
  translate(w * 0.5, h * 0.56 + sin(t * 1.5) * u * 0.015);
  rotate(-HALF_PI);
  drawStick(0, 0, u * 0.62, [2.3, -2.3], [0.12, -0.12], { shirt: [255, 120, 20] });
  pop();
  waveFill(w, h, h * 0.6, 5, 24, 2, t + 2, [60, 170, 220, 175]);
  fill(255, 255, 255, 200); textFont(CONFIG.font); textStyle(BOLD); textAlign(CENTER, CENTER); textSize(max(12, u * 0.065));
  text('放鬆、仰頭、慢慢呼吸', w / 2, h * 0.14);
}

function sceneSound(kind, w, h, u, t) {
  const ctx = drawingContext;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1c2f5e'); g.addColorStop(1, '#0b1a38');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h * 0.42;
  const active = G && (millis() - G.sfxStart) < 3500;
  noFill(); strokeWeight(4);
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.9 + k / 3) % 1;
    stroke(255, 214, 64, 220 * (1 - p) * (active ? 1 : 0.3));
    circle(cx, cy, lerp(u * 0.3, u * 1.0, p));
  }
  noStroke();
  if (kind === 'sound_whistle') {
    push(); translate(cx, cy); rotate(sin(t * 12) * (active ? 0.08 : 0.02));
    fill(210, 215, 225); circle(u * 0.04, u * 0.04, u * 0.34);
    fill(230, 235, 245); rect(-u * 0.34, -u * 0.1, u * 0.34, u * 0.2, 6);
    fill(30, 40, 70); circle(u * 0.04, u * 0.04, u * 0.12);
    noFill(); stroke(255, 80, 80); strokeWeight(u * 0.025); circle(u * 0.2, -u * 0.12, u * 0.14);
    pop();
  } else if (kind === 'sound_thunder') {
    if (active && sin(t * 14) > 0.6) { fill(255, 255, 255, 70); rect(0, 0, w, h); }
    fill(70, 78, 98);
    circle(cx - u * 0.15, cy, u * 0.3); circle(cx + u * 0.05, cy - u * 0.08, u * 0.38); circle(cx + u * 0.22, cy + u * 0.02, u * 0.28);
    rect(cx - u * 0.28, cy, u * 0.6, u * 0.14, 20);
    if (!active || sin(t * 10) > -0.2) {
      fill(255, 230, 80);
      beginShape(); vertex(cx + u * 0.02, cy + u * 0.1); vertex(cx + u * 0.12, cy + u * 0.1);
      vertex(cx + u * 0.04, cy + u * 0.26); vertex(cx + u * 0.13, cy + u * 0.26); vertex(cx - u * 0.04, cy + u * 0.46);
      vertex(cx, cy + u * 0.3); vertex(cx - u * 0.08, cy + u * 0.3); endShape(CLOSE);
    }
  } else if (kind === 'sound_help') {
    waveFill(w, h, h * 0.55, 4, 24, 2, t, [40, 130, 190]);
    fill(255, 214, 170); circle(cx, cy + sin(t * 3) * 5, u * 0.14);
    stroke(255, 214, 170); strokeWeight(u * 0.03); line(cx, cy, cx + u * 0.08, cy - u * 0.18 + sin(t * 9) * 8);
    waveFill(w, h, h * 0.6, 4, 22, 2.4, t + 1, [60, 160, 215, 190]);
  } else {
    for (let i = 0; i < 4; i++) {
      const p = (t * 0.3 + i * 0.25) % 1;
      drawArrow(lerp(-u * 0.2, w, p), h * (0.22 + i * 0.15), u * 0.3, [120, 200, 255, 200 * (1 - p)]);
    }
    waveFill(w, h, h * 0.62, 6, 20, 3, t, [40, 130, 190, 220]);
  }
}

function drawItem(kind, x, y, s, t) {
  push();
  strokeCap(ROUND);
  switch (kind) {
    case 'runner': {
      const a = sin(t * 9);
      drawStick(x, y, s, [a, -a], [-a * 0.8, a * 0.8], { shirt: [255, 140, 60] });
      noStroke(); fill(255, 255, 255, 170);
      for (let k = 0; k < 3; k++) circle(x - s * 0.2 - k * s * 0.09, y + s * 0.44 + sin(t * 8 + k) * 3, s * 0.05);
      break;
    }
    case 'diver': {
      stroke(240); strokeWeight(s * 0.03); line(x - s * 0.55, y + s * 0.5, x - s * 0.55, y - s * 0.1);
      noStroke(); fill(255); rect(x - s * 0.8, y - s * 0.22, s * 0.5, s * 0.22, 4);
      fill(CONFIG.colors.dark); textAlign(CENTER, CENTER); textFont(CONFIG.font); textStyle(BOLD); textSize(max(10, s * 0.11));
      text('水深1m', x - s * 0.55, y - s * 0.11);
      push(); translate(x, y); rotate(0.5 + sin(t * 2) * 0.06);
      drawStick(0, 0, s, [PI * 0.95, PI * 0.88], [0.15, -0.1], { shirt: [60, 160, 255] }); pop();
      break;
    }
    case 'lifeguard': {
      stroke(215, 215, 225); strokeWeight(s * 0.045);
      line(x - s * 0.2, y + s * 0.1, x - s * 0.3, y + s * 0.5); line(x + s * 0.2, y + s * 0.3, x + s * 0.3, y + s * 0.5);
      line(x - s * 0.25, y + s * 0.3, x + s * 0.25, y + s * 0.3);
      noStroke(); fill(255); rect(x - s * 0.3, y + s * 0.04, s * 0.6, s * 0.07, 3);
      drawStick(x, y, s * 0.7, [0.2, -0.2], [1.2, 1.4], { shirt: [230, 50, 50], cap: [230, 50, 50] });
      break;
    }
    case 'ring': case 'swimmer': {
      if (kind === 'ring') {
        noFill(); stroke(230, 50, 50); strokeWeight(s * 0.2); circle(x, y, s * 0.55);
        stroke(255); strokeWeight(s * 0.2);
        for (let i = 0; i < 4; i += 2) arc(x, y, s * 0.55, s * 0.55, i * HALF_PI + 0.3, i * HALF_PI + 1.3);
      } else {
        noStroke(); fill(255, 214, 170); circle(x, y, s * 0.28);
        fill(40, 90, 200); arc(x, y, s * 0.3, s * 0.3, PI, TWO_PI);
        stroke(255, 214, 170); strokeWeight(s * 0.07);
        line(x, y, x + s * 0.3 + sin(t * 3) * s * 0.08, y - s * 0.12 * abs(sin(t * 3)));
        noFill(); stroke(255, 255, 255, 150); strokeWeight(2); ellipse(x, y + s * 0.15, s * 0.7, s * 0.14);
      }
      break;
    }
    default: break;
  }
  pop();
}

function itemHot(it, r) {
  const u = min(r.w, r.h);
  return { x: r.x + it.x * r.w, y: r.y + it.y * r.h, rad: max(30, it.size * u * 0.62) };
}

// ====================================================================
// 寶箱慶祝模組（滿分自動觸發）
// ====================================================================
const CHEST = {
  dropEnd: 0.85,
  rumble: 1.0,
  lock: 1.6,
  open: 2.0,
  burst: 2.15,
  cannon: 2.35,
  cheer: 2.7,
  btn: 4.2,
  fountainEnd: 3.8, rainEnd: 6.0
};
const CONFETTI_COLS = [[255, 90, 120], [255, 214, 64], [80, 230, 150], [90, 190, 255], [190, 120, 255], [255, 150, 60], [255, 255, 255]];
const GEM_COLS = [[80, 220, 255], [255, 100, 170], [100, 240, 150], [190, 130, 255], [255, 120, 90]];

function easeOutBack(x) { x = constrain(x, 0, 1); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2); }
function easeInOut(x) { x = constrain(x, 0, 1); return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2; }
function easeOutBounce(x) {
  x = constrain(x, 0, 1); const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) { x -= 1.5 / d; return n * x * x + 0.75; }
  if (x < 2.5 / d) { x -= 2.25 / d; return n * x * x + 0.9375; }
  x -= 2.625 / d; return n * x * x + 0.984375;
}

function isPerfect() { return !!G && G.lives > 0 && G.score >= 99 && G.correctCount === G.pool.length && G.pool.length >= QUESTIONS.length; }
function startChestShow(delaySec) {
  chest = { t0: millis() + (delaySec || 0) * 1000, state: 'show', f: {}, t1: 0 };
  chestFx.confetti = []; chestFx.loot = [];
}
function chestBusy() { return !!chest && chest.state !== 'docked'; }
function chestEl() { return (millis() - chest.t0) / 1000; }
function chestCanDismiss() { return !!chest && chest.state === 'show' && chestEl() >= CHEST.btn; }
function dismissChest() { if (chestCanDismiss()) { chest.state = 'closing'; chest.t1 = millis(); } }
function chestGeo() {
  const W = UI.W, H = UI.H;
  return { k: constrain(min(W / 260, H / 400), 0.8, 2.2), cx: W / 2, cy: H * 0.46, floorY: H * 0.9 };
}

function mkConfetti(x, y, vx, vy) {
  const r = random();
  return {
    x: x, y: y, vx: vx, vy: vy, w: random(7, 13) * UI.s, h: random(12, 22) * UI.s, col: pick(CONFETTI_COLS),
    rot: random(TWO_PI), vr: random(-0.25, 0.25), fl: random(TWO_PI), vf: random(0.1, 0.35), sw: random(TWO_PI),
    kind: r < 0.18 ? 'ribbon' : (r < 0.35 ? 'dot' : 'rect'), a: 1, da: 0
  };
}
function mkLoot(x, y, vx, vy, floorY) {
  const r = random(), kind = r < 0.5 ? 'coin' : (r < 0.72 ? 'gem' : (r < 0.88 ? 'pearl' : 'star'));
  return {
    x: x, y: y, vx: vx, vy: vy, kind: kind, col: kind === 'gem' ? pick(GEM_COLS) : [255, 205, 50],
    size: random(16, 27) * constrain(UI.s, 0.7, 1.4), rot: random(TWO_PI), vr: random(-0.2, 0.2),
    spin: random(TWO_PI), vs: random(0.15, 0.4), rest: false, bounces: 0,
    floorY: floorY - random(0, UI.H * 0.07), ph: random(10)
  };
}
function chestLootShot(x, y, geo) {
  const g = 0.4 * UI.s, hgt = UI.H * random(0.18, 0.5);
  return mkLoot(x + random(-25, 25), y, random(-1, 1) * UI.W / 105, -sqrt(2 * g * hgt), geo.floorY);
}
function chestSpray(x, y, geo, nC, nL) {
  const g = 0.2;
  for (let i = 0; i < nC; i++) {
    const hgt = UI.H * random(0.25, 0.85), a = random(-PI * 0.95, -PI * 0.05), sp = sqrt(2 * g * hgt);
    chestFx.confetti.push(mkConfetti(x + random(-20, 20), y, cos(a) * sp * 0.9 + random(-3, 3), sin(a) * sp));
  }
  for (let i = 0; i < nL; i++) chestFx.loot.push(chestLootShot(x, y, geo));
}
function chestCannon(side) {
  const W = UI.W, H = UI.H, base = sqrt(2 * 0.2 * H * 0.85);
  for (let i = 0; i < 80; i++) {
    const a = random(PI * 0.28, PI * 0.47), sp = base * random(0.7, 1.2);
    chestFx.confetti.push(mkConfetti(side < 0 ? -10 : W + 10, H * random(0.9, 1.0), -side * cos(a) * sp, -sin(a) * sp));
  }
}
function chestDust(x, y, k) {
  for (let i = 0; i < 26; i++) {
    const c = mkConfetti(x + random(-60, 60) * k, y, random(-3, 3), random(-4, -1));
    c.kind = 'dust'; c.da = 0.025; c.w = random(5, 14) * UI.s; chestFx.confetti.push(c);
  }
}

function updateConfetti(c, dt) {
  c.vx *= pow(0.975, dt);
  c.vy += (c.kind === 'dust' ? 0.03 : 0.2) * dt;
  if (c.vy > 0 && c.kind !== 'dust') c.vy *= pow(0.94, dt);
  c.sw += 0.07 * dt;
  c.x += (c.vx + (c.kind === 'dust' ? 0 : sin(c.sw) * 0.9)) * dt;
  c.y += c.vy * dt; c.rot += c.vr * dt; c.fl += c.vf * dt; c.a -= c.da * dt;
}
function drawConfetti(c) {
  push(); translate(c.x, c.y); rotate(c.rot);
  const a = 255 * constrain(c.a, 0, 1);
  if (c.kind === 'ribbon') {
    noFill(); stroke(c.col[0], c.col[1], c.col[2], a); strokeWeight(max(2, c.w * 0.35)); strokeCap(ROUND);
    beginShape(); for (let i = 0; i <= 6; i++) vertex(sin(c.fl + i * 0.9) * c.w * 0.6, (i / 6 - 0.5) * c.h * 1.6); endShape();
  } else if (c.kind === 'dust') {
    noFill(); stroke(200, 235, 255, a); strokeWeight(2); circle(0, 0, c.w * 1.3);
  } else if (c.kind === 'dot') {
    noStroke(); fill(c.col[0], c.col[1], c.col[2], a); circle(0, 0, c.w * (0.6 + 0.4 * abs(cos(c.fl))));
  } else {
    noStroke(); fill(c.col[0], c.col[1], c.col[2], a);
    const ww = max(1.5, c.w * abs(cos(c.fl))); rect(-ww / 2, -c.h / 2, ww, c.h);
  }
  pop();
}

function updateLoot(l, dt) {
  if (l.rest) return;
  l.vy += 0.4 * UI.s * dt; l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.vr * dt; l.spin += l.vs * dt;
  if (l.x < l.size) { l.x = l.size; l.vx *= -0.6; }
  if (l.x > UI.W - l.size) { l.x = UI.W - l.size; l.vx *= -0.6; }
  if (l.y >= l.floorY && l.vy > 0) {
    l.y = l.floorY; l.vy *= -0.42; l.vx *= 0.7; l.vr *= 0.6; l.bounces++;
    if (millis() - lastCoinPing > 110 && random() < 0.35) { lastCoinPing = millis(); playSfx('coinPing'); }
    if (abs(l.vy) < 2.2 || l.bounces > 3) {
      l.rest = true; l.vy = 0; l.vx = 0; l.vr = 0; l.spin = 0;
      l.rot = (l.kind === 'gem' || l.kind === 'star') ? random(-0.3, 0.3) : 0;
    }
  }
}
function drawSpark(r, a) {
  noStroke(); fill(255, 255, 255, a);
  beginShape();
  vertex(0, -r); vertex(r * 0.15, -r * 0.15); vertex(r, 0); vertex(r * 0.15, r * 0.15);
  vertex(0, r); vertex(-r * 0.15, r * 0.15); vertex(-r, 0); vertex(-r * 0.15, -r * 0.15);
  endShape(CLOSE);
}
function drawLoot(l, t) {
  push(); translate(l.x, l.y); rotate(l.rot); noStroke();
  const s = l.size;
  if (l.kind === 'coin') {
    const sx = max(0.12, abs(cos(l.spin)));
    fill(200, 140, 20); ellipse(0, 0, s * sx, s);
    fill(255, 214, 64); ellipse(0, 0, s * 0.84 * sx, s * 0.84);
    fill(255, 240, 160); ellipse(-s * 0.1 * sx, -s * 0.12, s * 0.34 * sx, s * 0.26);
  } else if (l.kind === 'gem') {
    fill(l.col[0], l.col[1], l.col[2]);
    beginShape(); vertex(-s * 0.5, -s * 0.15); vertex(-s * 0.28, -s * 0.5); vertex(s * 0.28, -s * 0.5); vertex(s * 0.5, -s * 0.15); vertex(0, s * 0.55); endShape(CLOSE);
    fill(255, 255, 255, 130); triangle(-s * 0.28, -s * 0.5, s * 0.28, -s * 0.5, 0, -s * 0.15);
    fill(255, 255, 255, 60); triangle(-s * 0.5, -s * 0.15, 0, -s * 0.15, 0, s * 0.55);
  } else if (l.kind === 'pearl') {
    fill(225, 232, 248); circle(0, 0, s * 0.82); fill(255); circle(-s * 0.15, -s * 0.15, s * 0.28);
  } else {
    fill(255, 225, 80); drawStar(0, 0, s * 0.62, s * 0.27, 5, 0);
    fill(255, 255, 255, 140); circle(-s * 0.12, -s * 0.12, s * 0.16);
  }
  if (l.rest) { const tw = (t * 1.2 + l.ph) % 6; if (tw < 0.6) drawSpark(s * 0.75, 255 * sin(tw / 0.6 * PI)); }
  pop();
}

function drawTreasureChest(cx, cy, k, e, t, o) {
  o = o || {};
  const W0 = 116, BH = 64, D = 60, HY = -21;
  const th = constrain(e, 0, 1.15) * PI * 0.62;
  const open = e > 0.02;
  push();
  translate(cx, cy); rotate(o.rot || 0); scale(k);
  noStroke();
  fill(0, 0, 0, 70); ellipse(0, BH + 3, W0 * 1.3, 16);

  fill(118, 62, 26); rect(-W0 / 2, 0, W0, BH, 5, 5, 8, 8);
  stroke(80, 40, 16, 140); strokeWeight(1.5);
  for (let i = 1; i < 4; i++) line(-W0 / 2 + i * W0 / 4, 4, -W0 / 2 + i * W0 / 4, BH - 4);
  noStroke();
  fill(255, 255, 255, 22); rect(-W0 / 2 + 4, 3, W0 - 8, 9, 4);
  fill(60, 30, 12, 120); rect(-W0 / 2, BH - 14, W0, 14, 0, 0, 8, 8);
  fill(255, 205, 60); rect(-W0 / 2, BH - 16, W0, 8);
  rect(-W0 / 2, 0, 14, BH, 4); rect(W0 / 2 - 14, 0, 14, BH, 4);
  fill(255, 235, 140, 200); rect(-W0 / 2 + 2, 2, 3, BH - 4, 2); rect(W0 / 2 - 12, 2, 3, BH - 4, 2);
  [[-W0 / 2 + 7, 10], [W0 / 2 - 7, 10], [-W0 / 2 + 7, 32], [W0 / 2 - 7, 32], [-W0 / 2 + 7, BH - 20], [W0 / 2 - 7, BH - 20]]
    .forEach(function (p) { fill(150, 95, 15); circle(p[0], p[1], 6); fill(255, 240, 170); circle(p[0] - 0.7, p[1] - 0.7, 3); });

  if (open) {
    fill(35, 16, 8); quad(-W0 / 2 + 5, HY + 2, W0 / 2 - 5, HY + 2, W0 / 2 - 4, 0, -W0 / 2 + 4, 0);
    fill(255, 200, 60, 160 * constrain(e, 0, 1)); ellipse(0, HY / 2 + 1, W0 - 26, 12);
  }

  const fy = HY + 0.35 * D * cos(th) - 0.9 * D * sin(th);
  const inner = th > 1.45;
  const top = min(HY, fy), hh = abs(fy - HY);
  stroke(70, 35, 14); strokeWeight(2);
  fill(inner ? [125, 22, 44] : [138, 72, 30]);
  beginShape(); vertex(-W0 / 2, HY); vertex(W0 / 2, HY); vertex(W0 / 2, fy); vertex(-W0 / 2, fy); endShape(CLOSE);
  noStroke();
  if (!inner) {
    stroke(90, 45, 18, 120); strokeWeight(1.5);
    for (let i = 1; i < 4; i++) line(-W0 / 2 + i * W0 / 4, HY, -W0 / 2 + i * W0 / 4, fy);
    noStroke();
    fill(255, 205, 60); rect(-W0 / 2, top, 14, hh); rect(W0 / 2 - 14, top, 14, hh);
    fill(255, 255, 255, 28); rect(-W0 / 2 + 16, top + 2, W0 - 32, 4, 2);
    const cs = max(0, cos(th)), sk = 17 * cs;
    fill(138, 72, 30); rect(-W0 / 2, fy, W0, sk, 0, 0, 4, 4);
    fill(255, 205, 60); rect(-W0 / 2, fy, 14, sk); rect(W0 / 2 - 14, fy, 14, sk);
    rect(-W0 / 2, fy + sk - 6 * max(0.2, cs), W0, 6 * max(0.2, cs));
    if (!open && o.seam > 0) {
      for (let j = 0; j < 3; j++) {
        stroke(255, 225, 110, 70 * o.seam * (3 - j) / 3 * 1.6); strokeWeight(2 + j * 4);
        line(-W0 / 2 + 8, 17, W0 / 2 - 8, 17);
      }
      noStroke();
    }
  } else {
    fill(175, 35, 65, 200); rect(-W0 / 2 + 8, top + 6, W0 - 16, max(2, hh - 12), 6);
    noFill(); stroke(255, 205, 60); strokeWeight(3); rect(-W0 / 2 + 3, top + 3, W0 - 6, max(2, hh - 6), 4);
    noStroke();
  }

  fill(255, 205, 60); rect(-10, 4, 20, 24, 4);
  fill(255, 240, 170, 170); rect(-8, 6, 5, 10, 2);
  fill(90, 55, 10); circle(0, 14, 7); rect(-1.8, 14, 3.6, 8, 1);

  if (open) {
    const pe = constrain(e * 1.25, 0, 1);
    fill(235, 170, 25); arc(0, -2, W0 - 16, 62 * pe, PI, TWO_PI);
    for (let i = 0; i < 18; i++) {
      const u = ((i * 37) % 100) / 100, x = (u - 0.5) * (W0 - 34);
      const hmax = (1 - pow(x / (W0 / 2 - 17), 2)) * 28 * pe;
      const y = -4 - (((i * 53) % 100) / 100) * hmax, r = 5 + (i % 3) * 1.5;
      stroke(180, 120, 10, 150); strokeWeight(1); fill(i % 2 ? [255, 214, 64] : [255, 190, 40]);
      circle(x, y, r * 2 * pe);
    }
    noStroke();
    for (let g = 0; g < 4; g++) {
      const gc = GEM_COLS[g], gx = (g - 1.5) * 20, gy = -12 - (g % 2) * 8 - 6 * pe;
      fill(gc[0], gc[1], gc[2]); const gs = 7 * pe;
      beginShape(); vertex(gx - gs, gy); vertex(gx, gy - gs); vertex(gx + gs, gy); vertex(gx, gy + gs * 1.3); endShape(CLOSE);
    }
    fill(240, 244, 255); circle(-30, -6, 8 * pe); circle(33, -9, 7 * pe);
    if (pe > 0.5) for (let j = 0; j < 3; j++) {
      const tw = (t * 1.6 + j * 0.37) % 1;
      push(); translate(sin(j * 2.1) * 32, -22 - j * 7); drawSpark(9 * sin(tw * PI), 255); pop();
    }
  }
  pop();
}

function drawChestGlow(x, y, t, a) {
  push();
  const R = max(UI.W, UI.H), ctx = drawingContext;
  const g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.6);
  g.addColorStop(0, 'rgba(255,225,120,' + (0.55 * a) + ')');
  g.addColorStop(0.35, 'rgba(255,190,60,' + (0.22 * a) + ')');
  g.addColorStop(1, 'rgba(255,170,40,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, UI.W, UI.H);
  blendMode(ADD); noStroke();
  for (let i = 0; i < 14; i++) {
    const ang = i * TWO_PI / 14 + t * 0.3, w = 0.07;
    fill(255, 225, 130, 38 * a * (i % 2 ? 0.6 : 1));
    triangle(x, y, x + cos(ang - w) * R, y + sin(ang - w) * R, x + cos(ang + w) * R, y + sin(ang + w) * R);
  }
  blendMode(BLEND);
  pop();
}

function drawChestLayer(t) {
  if (gameState !== 'RESULT' || !chest || !G || !G.result) return;
  const W = UI.W, H = UI.H, m = UI.m, ctx = drawingContext;
  const geo = chestGeo(), k = geo.k;
  const kM = max(0.42, 0.5 * UI.s), dockX = m + 62 * kM + 4, dockY = 12 + 58 * kM;
  const dt = min(deltaTime, 50) / 16.667;

  if (chest.state === 'docked') {
    const bx = dockX - 62 * kM, by = dockY - 60 * kM, bw = 124 * kM, bh = 140 * kM;
    const hv = isHover(bx, by, bw, bh); if (hv) hoverAny = true;
    const pulse = 1 + 0.04 * sin(t * 3) + (hv ? 0.08 : 0);
    push(); blendMode(ADD); noStroke(); fill(255, 214, 64, 40 + 20 * sin(t * 3)); circle(dockX, dockY - 6 * kM, 150 * kM); blendMode(BLEND); pop();
    drawTreasureChest(dockX, dockY, kM * pulse, 1, t, {});
    noStroke(); fill(255, 255, 235); textFont(CONFIG.font); textStyle(BOLD); textAlign(CENTER, TOP); textSize(fz(14));
    text('再開一次', dockX, dockY + 66 * kM * pulse + 4);
    registerHit(bx, by, bw, bh, function () { startChestShow(0); });
    return;
  }

  const el = chestEl();
  if (el < 0) return;

  let closeP = 0;
  if (chest.state === 'closing') {
    closeP = constrain((millis() - chest.t1) / 700, 0, 1);
    if (closeP >= 1) { chest.state = 'docked'; chestFx.confetti = []; chestFx.loot = []; return; }
  }
  const fade = 1 - constrain(closeP * 1.5, 0, 1), mv = easeInOut(closeP);

  let ox = geo.cx, oy = geo.cy, kk = k, e = 0, rot = 0, seam = 0;
  if (chest.state === 'closing') {
    ox = lerp(geo.cx, dockX, mv); oy = lerp(geo.cy, dockY, mv); kk = lerp(k, kM, mv); e = 1;
  } else if (el < CHEST.dropEnd) {
    oy = geo.cy - (1 - easeOutBounce(el / CHEST.dropEnd)) * (geo.cy + 190 * k);
  } else if (el < CHEST.open) {
    const r = (el - CHEST.dropEnd) / (CHEST.open - CHEST.dropEnd);
    rot = sin(el * 48) * (0.01 + 0.05 * r * r); ox += sin(el * 63) * 3 * k * r; seam = r;
  } else {
    e = easeOutBack((el - CHEST.open) / 0.75);
    oy += sin(t * 2.5) * 2 * k * constrain(el - CHEST.open - 0.8, 0, 1);
  }
  const openX = ox, openY = oy - 10 * kk;

  if (chest.state === 'show') {
    const fire = function (name, at, fn) { if (el >= at && !chest.f[name]) { chest.f[name] = true; fn(); } };
    fire('start', 0, function () { playSfx('chestWhoosh'); });
    fire('land', CHEST.dropEnd, function () { playSfx('chestThud'); shakeAmt = 10; chestDust(geo.cx, geo.cy + 64 * k, k); });
    fire('rumble', CHEST.rumble, function () { playSfx('chestRumble'); });
    fire('lock', CHEST.lock, function () { playSfx('chestLock'); });
    fire('open', CHEST.open, function () { playSfx('chestCreak'); });
    fire('burst', CHEST.burst, function () { playSfx('chestBurst'); shakeAmt = 14; chestSpray(openX, openY, geo, 180, 56); });
    fire('cannon', CHEST.cannon, function () { playSfx('popper'); chestCannon(-1); chestCannon(1); });
    fire('shower', 2.6, function () { playSfx('coinShower'); });
    fire('cheer', CHEST.cheer, function () {
      playSfx('grandFanfare');
      setCoach('恭喜你全對！你是水域安全小達人！', 'cheer', 99999);
      speak('哇！恭喜你全部答對，打開了海底寶箱！你就是水域安全小達人！');
    });
    fire('shower2', 3.5, function () { playSfx('coinShower'); });

    if (el > CHEST.burst && el < CHEST.fountainEnd) {
      const n = el < 3.1 ? 0.6 : 0.25;
      for (let i = 0, c = floor(n + random()); i < c; i++) chestFx.loot.push(chestLootShot(openX, openY, geo));
      if (random() < 0.5) chestSpray(openX, openY, geo, 2, 0);
    }
    if (el > CHEST.cannon && el < CHEST.rainEnd) {
      const c = floor((el < 4.5 ? 1.2 : 0.4) + random());
      for (let i = 0; i < c; i++) chestFx.confetti.push(mkConfetti(random(W), -20, random(-1.5, 1.5), random(0.5, 2.5)));
    }
    if (el > 1.2 && el < CHEST.open && random() < 0.45) {
      const c = mkConfetti(openX + random(-50, 50) * kk, oy + 17 * kk, random(-0.5, 0.5), -random(1, 3));
      c.kind = 'dot'; c.col = [255, 225, 110]; c.w = random(3, 7); c.da = 0.025; chestFx.confetti.push(c);
    }
  }

  push();
  noStroke();
  ctx.globalAlpha = fade;
  fill(0, 8, 24, 175 * constrain(el / 0.4, 0, 1)); rect(0, 0, W, H);
  if (e > 0.02) drawChestGlow(openX, openY, t, constrain(e, 0, 1));

  ctx.globalAlpha = 1;
  drawTreasureChest(ox, oy, kk, e, t, { rot: rot, seam: seam });

  ctx.globalAlpha = fade;
  if (el >= CHEST.cheer - 0.25) {
    const kd = min(W * 0.38, H * 0.26) / 155;
    const pp = easeOutBack((el - (CHEST.cheer - 0.25)) / 0.7);
    const tx = max(82 * kd + m, W * 0.18), dx = lerp(-130 * kd, tx, pp), dy = H * 0.84;
    drawDolphin(dx, dy, kd, 'cheer', t);
    ctx.globalAlpha = fade * constrain(pp, 0, 1);
    const bw = min(W - 2 * m, 440), bh = max(70, fz(26) * 3.3), bx = m, by = dy - 62 * kd - bh - 12;
    const tailX = constrain(dx + 20 * kd, bx + 30, bx + bw - 30);
    fill(255, 255, 255, 245); rect(bx, by, bw, bh, 16);
    triangle(tailX - 12, by + bh - 1, tailX + 12, by + bh - 1, tailX, by + bh + 14);
    drawFitted('恭喜你全部答對！\n你就是水域安全小達人！', bx + 10, by + 4, bw - 20, bh - 8, fz(26), 12, CENTER, CONFIG.colors.dark);
  }

  ctx.globalAlpha = fade * constrain((el - 0.3) / 0.4, 0, 1);
  const early = el < CHEST.open;
  const sc = early ? 1 : 0.6 + 0.4 * easeOutBack((el - CHEST.open) / 0.5);
  textFont(CONFIG.font); textStyle(BOLD); textAlign(CENTER, CENTER);
  push(); translate(W / 2, H * 0.11); scale(sc); textSize(fz(52));
  fill(10, 40, 70, 180); text(early ? '發現海底寶箱！' : '寶箱打開了！', 3, 3);
  fill(CONFIG.colors.accent); text(early ? '發現海底寶箱！' : '寶箱打開了！', 0, 0);
  pop();
  fill(CONFIG.colors.text); textSize(fz(28));
  text(early ? '全部答對，寶箱要自動打開了…' : '六題全對，滿分 100 分！', W / 2, H * 0.11 + fz(52) * 0.85);

  ctx.globalAlpha = fade;
  const loot = chestFx.loot;
  if (loot.length > 150) loot.splice(0, loot.length - 150);
  for (let i = 0; i < loot.length; i++) { updateLoot(loot[i], dt); drawLoot(loot[i], t); }
  const cf = chestFx.confetti;
  if (cf.length > 650) cf.splice(0, cf.length - 650);
  for (let i = cf.length - 1; i >= 0; i--) {
    const c = cf[i]; updateConfetti(c, dt);
    if (c.a <= 0 || c.y > H + 40) { cf.splice(i, 1); continue; }
    drawConfetti(c);
  }

  if (chest.state === 'show' && el >= CHEST.burst) {
    ctx.globalAlpha = 1; noFill(); strokeWeight(6 * UI.s);
    for (let j = 0; j < 2; j++) {
      const p = (el - CHEST.burst - j * 0.18) / 0.9;
      if (p > 0 && p < 1) { stroke(255, 230, 140, 220 * (1 - p)); circle(openX, openY, p * H * 1.4); }
    }
    const fa = 1 - (el - CHEST.burst) / 0.4;
    if (fa > 0) { noStroke(); fill(255, 250, 225, 230 * fa); rect(0, 0, W, H); }
  }
  pop();

  if (chest.state === 'show' && el >= CHEST.btn) {
    const bh = max(48, 58 * UI.s), bw = min(W - 2 * m, 360 * UI.s + 60);
    addButton('收下寶藏', (W - bw) / 2, H - bh - m * 1.5, bw, bh, function () { dismissChest(); },
      { size: 32, fill: [235, 140, 30], hoverFill: [255, 185, 70], textCol: [30, 30, 30] });
  }
}

// ====================================================================
// 七、畫面區
// ====================================================================
function draw() {
  btnsPrev = btns; btns = []; hoverAny = false; uiLocked = false;
  const t = millis() / 1000;
  push();
  if (shakeAmt > 0.3) { translate(random(-shakeAmt, shakeAmt), random(-shakeAmt, shakeAmt)); shakeAmt *= 0.88; } else shakeAmt = 0;
  drawBackground(t);
  textFont(CONFIG.font);
  textStyle(BOLD);
  if (gameState === 'START') drawStart(t);
  else if (gameState === 'HELP') drawHelp(t);
  else if (gameState === 'PLAY') drawPlay(t);
  else if (gameState === 'RESULT') { uiLocked = chestBusy(); drawResult(t); uiLocked = false; }
  drawFX();
  drawChestLayer(t);
  pop();
  cursor(hoverAny ? HAND : ARROW);
}

function drawStart(t) {
  const W = UI.W, H = UI.H, s = UI.s, m = UI.m;
  push();
  noStroke();
  for (let i = 0; i < 6; i++) {
    fill(255, 255, 200, 12 + sin(t * 2 + i) * 6);
    arc(W / 2, 0, W * 1.2, H * 1.5, i * 0.3, i * 0.3 + 0.2);
  }
  pop();

  textAlign(CENTER, CENTER);
  fill(10, 40, 70, 180);
  textSize(fz(CONFIG.fonts.title));
  text('水域安全小達人', W / 2 + 3, H * 0.12 + 3);
  fill(CONFIG.colors.accent);
  text('水域安全小達人', W / 2, H * 0.12);

  fill(CONFIG.colors.text); textSize(fz(CONFIG.fonts.subtitle));
  text('潛水探險・6 大題型全能挑戰', W / 2, H * 0.12 + fz(CONFIG.fonts.title) * 0.85);

  drawDolphin(W / 2, H * 0.38, min(W * 0.5, H * 0.3) / 155, 'happy', t);
  drawSpeech(W / 2 + 110 * s, H * 0.28, '準備好一起探索水域安全了嗎？', fz(18));

  const bw = min(W - 2 * m, 460 * s + 60), x = (W - bw) / 2;
  const bh = min(max(48, 60 * s), H * 0.085), gap = bh * 0.22;
  let y = H * 0.58;

  addButton('點擊開始探險', x, y, bw, bh, function () { startGame(); },
    { fill: [235, 140, 30], hoverFill: [255, 185, 70], textCol: [30, 30, 30], size: 32 });
  y += bh + gap;
  addButton('遊戲說明', x, y, bw, bh, function () { gameState = 'HELP'; }, { size: 28 });
  y += bh + gap;
  const hw = (bw - gap) / 2;
  addButton('計時挑戰：' + (timerSetting ? '開' : '關'), x, y, hw, bh, function () { timerSetting = !timerSetting; }, { size: 24 });
  addButton('聲音：' + (muted ? '關' : '開'), x + hw + gap, y, hw, bh, function () { toggleMute(); }, { size: 24, silent: true });

  fill(255, 255, 255, 180); textSize(fz(CONFIG.fonts.small)); textAlign(CENTER, CENTER);
  text('開啟聲音可獲得完整多媒體音效與語音導覽喔！', W / 2, min(H - m * 2, y + bh + gap + fz(22)));
}

function drawHelp(t) {
  const W = UI.W, H = UI.H, m = UI.m, s = UI.s;
  textAlign(CENTER, CENTER); fill(CONFIG.colors.accent); textSize(fz(46));
  text('遊戲說明', W / 2, H * 0.07);
  const bh = max(48, 58 * s);
  const px = m, py = H * 0.13, pw = W - 2 * m, ph = H - py - bh - m * 2.5;
  noStroke(); fill(CONFIG.colors.panel); rect(px, py, pw, ph, 18);
  const lines = [
    '● 你是勇敢的潛水員，每答完一題就往深海前進，上方的深度計會顯示進度。',
    '● 本關卡精選 6 大題型：單選、是非、找危險、點選排序、聽音辨識、水溫深度預測，總分 100 分。',
    '● 答錯會用掉 1 瓶氧氣；5 瓶氧氣用完，探險就結束。',
    '● 六題全對獲得滿分時，將會自動解鎖神秘的海底寶箱！',
    '● 每場有 2 次「提示」，卡住時可以按提示求助海豚教練。'
  ].join('\n');
  drawFitted(lines, px + m, py + m, pw - 2 * m, ph - 2 * m, fz(CONFIG.fonts.body), 13, LEFT, CONFIG.colors.text);
  const bw = min(W - 2 * m, 360 * s + 60);
  addButton('我知道了，回首頁', (W - bw) / 2, H - bh - m * 1.2, bw, bh, function () { gameState = 'START'; }, { size: 28 });
}

function drawPlay(t) {
  const q = G.q;
  if (G.phase === 'ask' && G.timerOn) {
    G.timeLeft -= min(deltaTime, 100) / 1000;
    const sec = ceil(G.timeLeft);
    if (G.timeLeft <= 5 && sec !== G.lastTick && sec > 0) { G.lastTick = sec; playSfx('tick'); }
    if (G.timeLeft <= 0) { G.timeLeft = 0; resolveAnswer(false, 'timeout'); }
  }
  drawHUD(t);
  const qBottom = drawQuestionPanel(q);
  const L = contentLayout(q, qBottom);
  uiLocked = G.phase !== 'ask';
  drawQuestionBody(q, L, t);
  uiLocked = false;
  drawCoachStrip(t);
  if (G.phase === 'feedback') drawFeedback(q, L, t);
}

function drawHUD(t) {
  const W = UI.W, m = UI.m, s = UI.s, hudH = UI.hudH, row = hudH / 2;
  noStroke(); fill(0, 0, 0, 100); rect(0, 0, W, hudH);
  const tw = max(20, 27 * s);
  for (let i = 0; i < CONFIG.lives; i++) {
    const x = m + i * (tw + 4), y = row * 0.22, bh = row * 0.68;
    fill(i < G.lives ? [90, 210, 240] : [40, 60, 80]); rect(x, y + 5, tw * 0.72, bh - 5, 7);
    fill(i < G.lives ? [200, 230, 250] : [60, 80, 100]); rect(x + tw * 0.16, y, tw * 0.4, 6, 2);
  }
  textAlign(CENTER, CENTER);
  if (G.combo >= 2) {
    fill(CONFIG.colors.accent); textSize(fz(CONFIG.fonts.hud));
    text('COMBO x' + G.combo, W * 0.5, row / 2 + 2);
  }
  const bw = max(66, 74 * s), bh2 = row - 6, by = 3;
  const x2 = W - m - bw, x1 = x2 - bw - 6;
  addButton('朗讀', x1, by, bw, bh2, function () { readCurrent(); }, { size: 20, padL: bh2 * 0.95, silent: true });
  drawSpeakerIcon(x1 + bh2 * 0.5, by + bh2 / 2, bh2 * 0.28, true);
  addButton(muted ? '靜音' : '有聲', x2, by, bw, bh2, function () { toggleMute(); },
    { size: 20, padL: bh2 * 0.95, fill: muted ? [110, 50, 60] : CONFIG.colors.btn, silent: true });
  drawSpeakerIcon(x2 + bh2 * 0.5, by + bh2 / 2, bh2 * 0.28, !muted);

  const gy = row + 4, gh = row - 10;
  const scoreW = max(110, 135 * s), gx = m, gw = W - 2 * m - scoreW - 8;
  const ratio = constrain((G.idx + (G.phase === 'feedback' ? 1 : 0)) / G.pool.length, 0, 1);
  fill(10, 30, 50); stroke(255, 255, 255, 110); strokeWeight(2); rect(gx, gy, gw, gh, gh / 2);
  noStroke(); fill(40, 170, 220); rect(gx + 2, gy + 2, max(gh - 4, (gw - 4) * ratio), gh - 4, (gh - 4) / 2);
  fill(255); textStyle(BOLD); textSize(fz(CONFIG.fonts.small));
  text('深度 ' + round(ratio * CONFIG.maxDepth) + ' 公尺（' + min(G.idx + 1, G.pool.length) + '/' + G.pool.length + '）', gx + gw / 2, gy + gh / 2 + 1);
  fill(CONFIG.colors.accent); textAlign(RIGHT, CENTER); textSize(fz(CONFIG.fonts.hud));
  text('分數 ' + round(G.score) + ' / 100', W - m, gy + gh / 2);
  if (G.timerOn) {
    const p = constrain(G.timeLeft / G.timeTotal, 0, 1);
    const col = mixCol(CONFIG.colors.bad, CONFIG.colors.good, p);
    noStroke(); fill(0, 0, 0, 120); rect(0, hudH, W, 7);
    fill(col); rect(0, hudH, W * p, 7);
  }
}

function drawQuestionPanel(q) {
  const m = UI.m, W = UI.W;
  const x = m, w = W - 2 * m, pad = m * 0.8, y = UI.hudH + m * 0.9;
  const fit = fitText(q.stem, w - 2 * pad, UI.H * 0.17, fz(CONFIG.fonts.question), 15);
  const tagH = fz(CONFIG.fonts.small) * 1.35;
  const h = pad * 2 + tagH + fit.lines.length * fit.lh;
  noStroke(); fill(CONFIG.colors.panel); rect(x, y, w, h, 16);
  stroke(CONFIG.colors.accent[0], CONFIG.colors.accent[1], CONFIG.colors.accent[2], 140); strokeWeight(2); noFill(); rect(x, y, w, h, 16);
  noStroke(); fill(CONFIG.colors.accent); textAlign(LEFT, TOP); textSize(fz(CONFIG.fonts.small));
  text('第 ' + (G.idx + 1) + ' / ' + G.pool.length + ' 題・' + TYPE_NAMES[q.type] + (G.retry ? '・重新挑戰' : ''), x + pad, y + pad * 0.8);
  textSize(fit.size); fill(CONFIG.colors.text);
  for (let i = 0; i < fit.lines.length; i++) text(fit.lines[i], x + pad, y + pad * 0.8 + tagH + i * fit.lh);
  return y + h;
}

function contentLayout(q, qBottom) {
  const m = UI.m;
  const area = { x: m, y: qBottom + m * 0.6, w: UI.W - 2 * m, h: UI.H - UI.stripH - (qBottom + m * 0.6) - m * 0.6 };
  if (q.type === 'hazard') return { scene: area, ans: null };
  if (q.type === 'slider') return { scene: area, ans: null };
  if (area.w > area.h * 1.2) {
    const sw = area.w * 0.44;
    return {
      scene: { x: area.x, y: area.y, w: sw - m / 2, h: area.h },
      ans: { x: area.x + sw + m / 2, y: area.y, w: area.w - sw - m / 2, h: area.h }
    };
  }
  const sh = area.h * (q.type === 'order' ? 0.27 : 0.34);
  return {
    scene: { x: area.x, y: area.y, w: area.w, h: sh },
    ans: { x: area.x, y: area.y + sh + m * 0.6, w: area.w, h: area.h - sh - m * 0.6 }
  };
}

function drawQuestionBody(q, L, t) {
  drawScene(q, L.scene, t);
  if (q.type === 'single' || q.type === 'sound') {
    if (q.type === 'sound') drawSoundReplay(L.scene);
    drawChoiceBody(q, L);
  } else if (q.type === 'tf') drawTFBody(q, L);
  else if (q.type === 'order') drawOrderBody(q, L);
  else if (q.type === 'hazard') drawHazardOverlay(q, L.scene, t);
  else if (q.type === 'slider') drawSliderInteractiveBody(q, L.scene, t);
}

function drawSliderInteractiveBody(q, r, t) {
  const sx = r.x + r.w * 0.1, sy = r.y + r.h * 0.78, sw = r.w * 0.8, sh = 28;

  if (mouseIsPressed && mouseY >= sy - 20 && mouseY <= sy + sh + 20 && mouseX >= sx && mouseX <= sx + sw) {
    sliderVal = constrain((mouseX - sx) / sw, 0, 1);
    sliderDragging = true;
    
    if (millis() - lastSliderToneTime > 120) {
      lastSliderToneTime = millis();
      playSfx('sliderMove', 200 + sliderVal * 400);
    }
  } else {
    sliderDragging = false;
  }

  push();
  noStroke(); fill(20, 50, 80, 200); rect(sx - 10, sy - 15, sw + 20, sh + 30, 16);
  fill(40, 80, 120); rect(sx, sy, sw, sh, sh / 2);
  
  const safeX1 = sx + q.targetSliderMin * sw;
  const safeX2 = sx + q.targetSliderMax * sw;
  fill(80, 230, 150, 70); rect(safeX1, sy, safeX2 - safeX1, sh);

  const handleX = sx + sliderVal * sw;
  fill(CONFIG.colors.accent); stroke(255); strokeWeight(3);
  circle(handleX, sy + sh / 2, sh * 1.3);

  noStroke(); fill(255); textFont(CONFIG.font); textStyle(BOLD); textSize(fz(16));
  textAlign(CENTER, TOP);
  text('◀ 拖曳滑桿尋找安全水溫與水深區間 ▶', sx + sw / 2, sy + sh + 8);
  pop();

  if (G.phase === 'ask') {
    const bw = min(r.w * 0.45, 220), bh = 46, bx = r.x + (r.w - bw) / 2, by = r.y + r.h - bh - 8;
    addButton('確認安全區間', bx, by, bw, bh, function () {
      const ok = (sliderVal >= q.targetSliderMin && sliderVal <= q.targetSliderMax);
      resolveAnswer(ok, '');
    }, { size: 22, fill: [30, 140, 90], hoverFill: [50, 190, 120] });
  }
}

function drawCoachStrip(t) {
  const W = UI.W, H = UI.H, m = UI.m, sh = UI.stripH, y = H - sh;
  noStroke(); fill(0, 0, 0, 120); rect(0, y, W, sh);
  const k = sh * 1.05 / 155;
  drawDolphin(m + sh * 0.6, y + sh * 0.5, k, coachMood(), t);

  const hintW = max(92, 112 * UI.s);
  const bx = m + sh * 1.3, bw = W - bx - m * 2 - hintW;
  const bubbleY = y + m * 0.5, bubbleH = sh - m * 1.0;

  push();
  noStroke(); fill(240, 250, 255, 245);
  rect(bx, bubbleY, bw, bubbleH, 14);
  triangle(bx, bubbleY + bubbleH * 0.3, bx - 14, bubbleY + bubbleH * 0.5, bx, bubbleY + bubbleH * 0.7);

  drawFitted(coach.text, bx + 12, bubbleY, bw - 24, bubbleH, fz(CONFIG.fonts.hud), 12, LEFT, CONFIG.colors.dark);
  pop();

  const canHint = G.phase === 'ask' && G.hintsLeft > 0 && !G.hintUsed;
  addButton('提示（' + G.hintsLeft + '）', W - m - hintW, y + m * 0.6, hintW, sh - m * 1.2, function () { useHint(); },
    { size: 26, fill: [200, 130, 20], hoverFill: [250, 175, 50], disabled: !canHint, silent: true });
}

function drawFeedback(q, L, t) {
  uiLocked = false;
  const W = UI.W, H = UI.H, m = UI.m;
  const ok = G.lastCorrect;
  noStroke(); fill(0, 0, 0, 100); rect(0, UI.hudH, W, H - UI.hudH - UI.stripH);
  const availH = H - UI.hudH - UI.stripH - 2 * m;
  const maxPanel = availH * (q.type === 'hazard' || q.type === 'slider' ? 0.5 : 0.88);
  const pad = m, pw = W - 2 * m, headS = fz(38), btnH = max(46, 56 * UI.s);
  let body = '';
  if (!ok) body += '正確答案：' + answerText(q) + '\n';
  body += (ok ? '小解析：' : '為什麼：') + q.explain;
  const bodyMax = maxPanel - pad * 3 - headS * 1.3 - btnH;
  const fit = fitText(body, pw - 2 * pad, bodyMax, fz(CONFIG.fonts.body), 12);
  const bodyH = fit.lines.length * fit.lh;
  const ph = pad * 3 + headS * 1.3 + bodyH + btnH;
  const px = m, py = H - UI.stripH - m - ph;
  fill(8, 30, 54, 242); stroke(ok ? CONFIG.colors.good : CONFIG.colors.bad); strokeWeight(4); rect(px, py, pw, ph, 18);
  noStroke(); textAlign(LEFT, CENTER); textSize(headS);
  fill(ok ? CONFIG.colors.good : CONFIG.colors.bad);
  const head = ok ? '答對了！ +' + round(G.gain) + ' 分' : (G.reason === 'timeout' ? '時間到了！' : (G.reason === 'miss' ? '點錯太多次了！' : '再想一想～'));
  text(head, px + pad, py + pad + headS * 0.65);
  textSize(fit.size); textAlign(LEFT, TOP); fill(CONFIG.colors.text);
  for (let i = 0; i < fit.lines.length; i++) text(fit.lines[i], px + pad, py + pad * 2 + headS * 1.3 + i * fit.lh);
  const last = G.lives <= 0 || G.idx >= G.pool.length - 1;
  const bw = min(pw - 2 * pad, 300 * UI.s + 80);
  addButton(last ? '查看結果' : '下一題', px + pw - pad - bw, py + ph - pad - btnH, bw, btnH, function () { goNext(); },
    { size: 30, fill: [30, 140, 90], hoverFill: [50, 190, 120] });
}

function drawResult(t) {
  const W = UI.W, H = UI.H, m = UI.m, s = UI.s;
  const R = G.result;
  const el = (millis() - G.resultStart) / 1000;
  textAlign(CENTER, CENTER);
  fill(CONFIG.colors.accent); textSize(fz(44));
  text(G.lives <= 0 ? '氧氣用完了，探險結束！' : '潛水探險完成！', W / 2, H * 0.06);

  const sr = min(W * 0.1, H * 0.065, 64);
  for (let i = 0; i < 3; i++) {
    const p = constrain(el * 1.6 - i * 0.7, 0, 1);
    const cx = W / 2 + (i - 1) * sr * 2.6, cy = H * 0.16;
    if (i < R.stars) {
      if (p > 0) { fill(CONFIG.colors.accent); noStroke(); drawStar(cx, cy, sr * p * (1 + 0.15 * sin(p * PI)), sr * 0.45 * p, 5, sin(t * 2 + i) * 0.1); }
      if (p >= 1 && !G.starPlayed[i]) { G.starPlayed[i] = true; playSfx('ding'); }
    } else { fill(60, 80, 100); noStroke(); drawStar(cx, cy, sr, sr * 0.45, 5, 0); }
  }

  if (W > H * 1.1) drawDolphin(W * 0.84, H * 0.17, min(W * 0.14, H * 0.2) / 155, R.stars >= 2 ? 'cheer' : 'sad', t);
  fill(CONFIG.colors.text); textSize(fz(34)); text('稱號：' + R.title, W / 2, H * 0.255);
  fill(255); textSize(fz(CONFIG.fonts.hud));
  text('總得分 ' + round(G.score) + ' / 100 答對 ' + G.correctCount + ' / ' + G.pool.length + ' 題', W / 2, H * 0.31);

  const bh = max(48, 58 * s), gap = m * 0.6, by = H - bh - m;
  const retryN = R.retryList.length;
  const bw = (W - 2 * m - 2 * gap) / 3;
  addButton(retryN > 0 ? '重新挑戰（' + retryN + ' 題）' : '重新挑戰', m, by, bw, bh, function () { startGame(R.retryList); },
    { size: 24, fill: [200, 130, 20], hoverFill: [250, 175, 50], disabled: retryN === 0 });
  addButton('再玩一次', m + bw + gap, by, bw, bh, function () { startGame(); }, { size: 24, fill: [30, 140, 90], hoverFill: [50, 190, 120] });
  addButton('回首頁', m + 2 * (bw + gap), by, bw, bh, function () { gameState = 'START'; }, { size: 24 });

  const ry = H * 0.35, rh = by - m * 0.8 - ry;
  noStroke(); fill(CONFIG.colors.panel); rect(m, ry, W - 2 * m, rh, 16);
  if (G.wrong.length === 0) {
    drawFitted('六題全對取得 100 分滿分！你真是優秀的水域安全小達人！', m * 2, ry, W - 4 * m, rh, fz(32), 14, CENTER, CONFIG.colors.good);
    return;
  }
  const navH = max(40, 44 * s);
  const perPage = constrain(floor((rh - navH - m) / max(120, 130 * s)), 1, 3);
  const pages = ceil(G.wrong.length / perPage);
  resultPage = constrain(resultPage, 0, pages - 1);
  const itemH = (rh - navH - m * 1.5) / perPage - m * 0.4;
  for (let i = 0; i < perPage; i++) {
    const idx = resultPage * perPage + i;
    if (idx >= G.wrong.length) break;
    const q = G.wrong[idx];
    const iy = ry + m * 0.6 + i * (itemH + m * 0.4);
    fill(255, 255, 255, 22); rect(m * 1.5, iy, W - 3 * m, itemH, 12);
    const str = '【答錯】' + stripTag(q.stem) + '\n答案：' + answerText(q) + '\n解析：' + q.explain;
    drawFitted(str, m * 2.2, iy + 4, W - 4.4 * m, itemH - 8, fz(CONFIG.fonts.hud), 11, LEFT, CONFIG.colors.text);
  }
  const ny = ry + rh - navH - m * 0.4, nw = max(90, 110 * s);
  addButton('上一頁', m * 1.5, ny, nw, navH, function () { resultPage--; }, { size: 20, disabled: resultPage <= 0 });
  addButton('下一頁', W - m * 1.5 - nw, ny, nw, navH, function () { resultPage++; }, { size: 20, disabled: resultPage >= pages - 1 });
  fill(255); textAlign(CENTER, CENTER); textSize(fz(CONFIG.fonts.small));
  text('錯題回顧 ' + (resultPage + 1) + ' / ' + pages, W / 2, ny + navH / 2);
}

function answerText(q) {
  if (q.type === 'single' || q.type === 'sound') return q.options[q.answer];
  if (q.type === 'tf') return q.answer ? '正確（O）' : '錯誤（X）';
  if (q.type === 'order') return q.options.map(function (o) { return o.split('：')[0]; }).join(' → ');
  if (q.type === 'hazard') return q.items.filter(function (i) { return i.danger; }).map(function (i) { return i.label; }).join('；');
  if (q.type === 'slider') return '將滑桿調整至 30% ~ 40% 的安全區間';
  return '';
}

function drawChoiceBody(q, L) {
  const a = L.ans, n = G.optOrder.length, gap = UI.m * 0.7;
  const bh = min((a.h - gap * (n - 1)) / n, 100 * UI.s + 20);
  let y = a.y + (a.h - (n * bh + (n - 1) * gap)) / 2;
  for (let i = 0; i < n; i++) {
    const orig = G.optOrder[i];
    const hidden = G.hidden.indexOf(i) >= 0;
    const opt = { size: CONFIG.fonts.option, align: LEFT, badge: 'ABCD'.charAt(i), disabled: hidden };
    if (G.phase === 'feedback') {
      if (orig === q.answer) { opt.fill = [30, 140, 90]; opt.stroke = CONFIG.colors.good; opt.keepColor = true; }
      else if (i === G.selected) { opt.fill = [160, 50, 60]; opt.stroke = CONFIG.colors.bad; opt.keepColor = true; }
    }
    addButton(q.options[orig], a.x, y, a.w, bh, function () { answerChoice(i); }, opt);
    y += bh + gap;
  }
}

function answerChoice(i) {
  if (G.phase !== 'ask') return;
  G.selected = i;
  resolveAnswer(G.optOrder[i] === G.q.answer, '');
}

function drawSoundReplay(r) {
  const bw = min(r.w * 0.7, 260 * UI.s + 60), bh = max(44, 52 * UI.s);
  addButton(muted ? '已靜音，請先開啟聲音' : '再聽一次', r.x + (r.w - bw) / 2, r.y + r.h - bh - UI.m, bw, bh, function () { replaySfx(); },
    { size: 24, fill: [200, 130, 20], hoverFill: [250, 175, 50], silent: true });
}

function replaySfx() {
  if (!G || !G.q.sfx) return;
  G.sfxStart = millis();
  playSfx(G.q.sfx);
}

function drawTFBody(q, L) {
  const a = L.ans, gap = UI.m;
  const bw = (a.w - gap) / 2, bh = min(a.h, bw * 1.15, 360 * UI.s + 60), y = a.y + (a.h - bh) / 2;
  [true, false].forEach(function (val, idx) {
    const x = a.x + idx * (bw + gap);
    const opt = { fill: val ? [24, 110, 80] : [140, 50, 70], hoverFill: val ? [40, 160, 110] : [200, 70, 90] };
    if (G.phase === 'feedback') {
      if (val === q.answer) { opt.stroke = CONFIG.colors.good; opt.keepColor = true; opt.fill = [30, 150, 95]; }
      else if (G.selected === val) { opt.stroke = CONFIG.colors.bad; opt.keepColor = true; }
    }
    addButton('', x, y, bw, bh, function () { answerTF(val); }, opt);
    const cx = x + bw / 2, cy = y + bh * 0.42, r = min(bw, bh) * 0.26;
    push();
    noFill(); stroke(255); strokeWeight(max(6, r * 0.28)); strokeCap(ROUND);
    if (val) circle(cx, cy, r * 2);
    else { line(cx - r, cy - r, cx + r, cy + r); line(cx + r, cy - r, cx - r, cy + r); }
    pop();
    noStroke(); fill(255); textAlign(CENTER, CENTER); textFont(CONFIG.font); textSize(fz(34)); textStyle(BOLD);
    text(val ? '正確' : '錯誤', cx, y + bh * 0.82);
  });
}

function answerTF(val) {
  if (G.phase !== 'ask') return;
  G.selected = val;
  resolveAnswer(val === G.q.answer, '');
}

function drawOrderBody(q, L) {
  const a = L.ans, n = G.cardOrder.length, gap = UI.m * 0.6, resetH = max(40, 46 * UI.s);
  const ch = min((a.h - resetH - gap * n) / n, 100 * UI.s + 20);
  let y = a.y;
  for (let i = 0; i < n; i++) {
    const orig = G.cardOrder[i];
    const pos = G.picks.indexOf(orig);
    const opt = { size: 26, align: LEFT, badge: pos >= 0 ? String(pos + 1) : '?', disabled: pos >= 0, keepColor: pos >= 0 };
    if (pos >= 0) opt.fill = [50, 90, 130];
    if (G.phase === 'feedback' && pos >= 0) {
      const good = G.picks[pos] === pos;
      opt.fill = good ? [30, 140, 90] : [160, 50, 60]; opt.stroke = good ? CONFIG.colors.good : CONFIG.colors.bad;
    }
    addButton(q.options[orig], a.x, y, a.w, ch, function () { pickCard(orig); }, opt);
    if (G.hintOrder && G.phase === 'ask' && orig === G.picks.length) {
      noFill(); stroke(CONFIG.colors.accent[0], CONFIG.colors.accent[1], CONFIG.colors.accent[2], 150 + 105 * sin(millis() / 150));
      strokeWeight(6); rect(a.x - 4, y - 4, a.w + 8, ch + 8, 16);
    }
    y += ch + gap;
  }
  const rw = min(a.w, 200 * UI.s + 60);
  addButton('重選', a.x + (a.w - rw) / 2, a.y + a.h - resetH, rw, resetH, function () { G.picks = []; }, { size: 22, disabled: G.picks.length === 0 || G.phase !== 'ask' });
}

function pickCard(orig) {
  if (G.phase !== 'ask' || G.picks.indexOf(orig) >= 0) return;
  G.picks.push(orig);
  if (G.picks.length === G.q.options.length) {
    const ok = G.picks.every(function (v, i) { return v === i; });
    resolveAnswer(ok, '');
  }
}

function drawHazardOverlay(q, r, t) {
  const dangers = q.items.filter(function (i) { return i.danger; });
  registerHit(r.x, r.y, r.w, r.h, function (px, py) { hazardClick(px, py, r); }, true);
  push();
  textStyle(BOLD);
  for (let i = 0; i < q.items.length; i++) {
    const it = q.items[i];
    if (!it.danger) continue;
    const hp = itemHot(it, r), found = G.found.indexOf(i) >= 0;
    if (found || G.phase === 'feedback') {
      noFill(); strokeWeight(5);
      stroke(found ? CONFIG.colors.good : CONFIG.colors.bad);
      if (!found) drawingContext.setLineDash([10, 8]);
      circle(hp.x, hp.y, hp.rad * 2);
      drawingContext.setLineDash([]);
      noStroke(); fill(found ? CONFIG.colors.good : CONFIG.colors.bad);
      textAlign(CENTER, CENTER); textFont(CONFIG.font); textSize(fz(26)); text(found ? '✓' : '!', hp.x, hp.y - hp.rad - fz(14));
      if (G.phase === 'feedback') {
        const lw = min(r.w * 0.8, 300);
        const lh = fitText(it.label, lw - 16, 70, fz(20), 11);
        const bh = lh.lines.length * lh.lh + 10;
        const lx = constrain(hp.x - lw / 2, r.x + 4, r.x + r.w - lw - 4), ly = constrain(hp.y + hp.rad + 4, r.y + 4, r.y + r.h - bh - 4);
        fill(0, 0, 0, 190); rect(lx, ly, lw, bh, 8);
        drawFitted(it.label, lx + 8, ly + 5, lw - 16, bh - 10, fz(20), 11, CENTER, CONFIG.colors.text);
      }
    } else if (G.hintUntil > millis() && G.found.indexOf(i) < 0 && i === firstUnfound(q)) {
      noFill(); stroke(CONFIG.colors.accent[0], CONFIG.colors.accent[1], CONFIG.colors.accent[2], 140 + 115 * sin(millis() / 120));
      strokeWeight(6); circle(hp.x, hp.y, hp.rad * 2.4 + sin(millis() / 150) * 8);
    }
  }
  for (let i = 0; i < G.missMarks.length; i++) {
    const mk = G.missMarks[i], age = millis() - mk.t0;
    if (age > 1200) continue;
    stroke(CONFIG.colors.bad[0], CONFIG.colors.bad[1], CONFIG.colors.bad[2], 255 * (1 - age / 1200)); strokeWeight(6); strokeCap(ROUND);
    line(mk.x - 14, mk.y - 14, mk.x + 14, mk.y + 14); line(mk.x + 14, mk.y - 14, mk.x - 14, mk.y + 14);
  }
  const cw = max(150, 190 * UI.s), ch = max(34, 40 * UI.s);
  noStroke(); fill(0, 0, 0, 170); rect(r.x + 8, r.y + 8, cw, ch, 10);
  fill(CONFIG.colors.accent); textAlign(LEFT, CENTER); textFont(CONFIG.font); textSize(fz(CONFIG.fonts.hud));
  text('已找到 ' + G.found.length + '/' + dangers.length + ' 失誤 ' + G.misses + '/' + CONFIG.hazardMaxMiss, r.x + 8 + ch * 0.3, r.y + 8 + ch / 2);
  pop();
}

function firstUnfound(q) {
  for (let i = 0; i < q.items.length; i++) if (q.items[i].danger && G.found.indexOf(i) < 0) return i;
  return -1;
}

function hazardClick(px, py, r) {
  if (G.phase !== 'ask') return;
  const q = G.q;
  for (let i = 0; i < q.items.length; i++) {
    const it = q.items[i];
    if (!it.danger || G.found.indexOf(i) >= 0) continue;
    const hp = itemHot(it, r);
    if (dist(px, py, hp.x, hp.y) <= hp.rad) {
      G.found.push(i);
      spawnBurst(hp.x, hp.y, true);
      playSfx('ding');
      spawnFloatText(hp.x, hp.y - hp.rad, '找到了！', CONFIG.colors.good);
      setCoach('找到一個危險了！', 'happy', 1800);
      if (q.items.filter(function (v) { return v.danger; }).length === G.found.length) resolveAnswer(true, '');
      return;
    }
  }
  G.misses++;
  G.missMarks.push({ x: px, y: py, t0: millis() });
  ripples.push({ x: px, y: py, r: 5, rmax: 70 * UI.s, col: CONFIG.colors.bad, life: 1 });
  playSfx('buzz');
  shakeAmt = 6;
  setCoach(pick(CONFIG.coach.miss), 'think', 2000);
  if (G.misses >= CONFIG.hazardMaxMiss) resolveAnswer(false, 'miss');
}

function startGame(list) {
  const base = (list && list.length) ? list.slice() : QUESTIONS.slice();
  G = {
    pool: shuffleArr(base), idx: 0, score: 0, lives: CONFIG.lives, combo: 0, maxCombo: 0,
    hintsLeft: CONFIG.hints, correctCount: 0, wrong: [], done: [], retry: !!(list && list.length),
    timerOn: timerSetting, phase: 'ask', qToken: 0, sfxStart: -99999, result: null, starPlayed: [false, false, false],
    missMarks: [], hidden: [], picks: [], found: [], misses: 0
  };
  gameState = 'PLAY';
  bgDepth = 0;
  resultPage = 0;
  sliderVal = 0.5;
  chest = null; chestFx.confetti = []; chestFx.loot = [];
  startQuestion();
}

function startQuestion() {
  const q = G.pool[G.idx];
  G.q = q; G.phase = 'ask'; G.qToken++;
  G.timeTotal = CONFIG.timerSeconds[q.type] || 30; G.timeLeft = G.timeTotal; G.lastTick = -1;
  G.hidden = []; G.hintUsed = false; G.selected = -1; G.picks = []; G.found = []; G.misses = 0;
  G.missMarks = []; G.hintUntil = 0; G.hintOrder = false; G.lastCorrect = null; G.sfxStart = -99999; G.gain = 0;
  if (q.type === 'single' || q.type === 'sound') G.optOrder = shuffleArr(q.options.map(function (_, i) { return i; }));
  if (q.type === 'order') {
    let tries = 0;
    do { G.cardOrder = shuffleArr(q.options.map(function (_, i) { return i; })); tries++; }
    while (tries < 20 && G.cardOrder.every(function (v, i) { return v === i; }));
  }
  setCoach(q.type === 'sound' ? '仔細聽喔！' : '第 ' + (G.idx + 1) + ' 題，加油！', 'idle', 2500);
  if (CONFIG.autoSpeak) readQuestion();
  else if (q.sfx) setTimeout(function () { if (G && G.q === q && G.phase === 'ask') replaySfx(); }, 500);
}

function readQuestion() {
  const q = G.q, token = G.qToken;
  speak(stripTag(q.stem), function () {
    if (gameState === 'PLAY' && G && token === G.qToken && G.phase === 'ask' && q.sfx) replaySfx();
  });
}

function readCurrent() {
  if (!G) return;
  if (G.phase === 'ask') readQuestion();
  else speak((G.lastCorrect ? '答對了。' : '正確答案是：' + answerText(G.q) + '。') + G.q.explain);
}

function resolveAnswer(correct, reason) {
  if (G.phase !== 'ask') return;
  G.phase = 'feedback'; G.lastCorrect = correct; G.reason = reason || '';
  G.done.push(G.q);
  const cx = UI.W / 2, cy = UI.H * 0.45;
  if (correct) {
    G.combo++; G.maxCombo = max(G.maxCombo, G.combo); G.correctCount++;
    let pts = 100 / G.pool.length;
    G.score += pts; G.gain = pts;
    spawnBurst(cx, cy, true);
    spawnFloatText(cx, cy - 40, '+' + round(pts) + ' 分', CONFIG.colors.accent);
    playSfx('correct');
    const combo = G.combo >= 3;
    setCoach(combo ? pick(CONFIG.coach.combo) : pick(CONFIG.coach.correct), combo ? 'cheer' : 'happy', 99999);
    speak(combo ? '答對了！連續答對 ' + G.combo + ' 題！' : '答對了！');
  } else {
    G.combo = 0; G.lives--; G.wrong.push(G.q);
    shakeAmt = 14;
    spawnBurst(cx, cy, false);
    playSfx('wrong');
    setCoach(reason === 'timeout' ? pick(CONFIG.coach.timeout) : pick(CONFIG.coach.wrong), 'sad', 99999);
    speak((reason === 'timeout' ? '時間到了。' : '答錯了。') + '正確答案是：' + answerText(G.q) + '。' + G.q.explain);
  }
}

function goNext() {
  if (G.lives <= 0 || G.idx >= G.pool.length - 1) finishGame();
  else { G.idx++; startQuestion(); }
}

function finishGame() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  G.score = constrain(G.score, 0, 100);
  const acc = G.correctCount / G.pool.length;
  const stars = acc >= CONFIG.starRules.three ? 3 : (acc >= CONFIG.starRules.two ? 2 : 1);
  const title = G.lives <= 0 ? CONFIG.titles.fail : CONFIG.titles[stars];
  const retryList = G.pool.filter(function (q) { return G.wrong.indexOf(q) >= 0 || G.done.indexOf(q) < 0; });
  G.result = { stars: stars, title: title, retryList: retryList };
  G.resultStart = millis();
  gameState = 'RESULT';
  resultPage = 0;
  setCoach('', 'idle', 0);
  if (isPerfect()) {
    startChestShow(1.3);
  } else {
    playSfx(G.lives <= 0 ? 'gameover' : 'fanfare');
    speak('挑戰結束，你得到' + stars + '顆星，得分' + round(G.score) + '分，稱號是' + title + '。');
  }
}

function useHint() {
  if (G.phase !== 'ask') return;
  if (G.hintsLeft <= 0) { setCoach(pick(CONFIG.coach.noHint), 'idle', 2500); return; }
  if (G.hintUsed) return;
  const q = G.q;
  G.hintsLeft--; G.hintUsed = true;
  playSfx('hint');
  if (q.type === 'single' || q.type === 'sound') {
    const wrongIdx = [];
    for (let i = 0; i < G.optOrder.length; i++) if (G.optOrder[i] !== q.answer) wrongIdx.push(i);
    shuffleArr(wrongIdx);
    G.hidden = wrongIdx.slice(0, 2);
  } else if (q.type === 'hazard') G.hintUntil = millis() + 4000;
  else if (q.type === 'order') G.hintOrder = true;
  setCoach(q.hint, 'think', 8000);
  speak(q.hint);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  const cv = document.querySelector('canvas');
  if (cv) cv.style.touchAction = 'none';
  textFont(CONFIG.font);
  textStyle(BOLD);
  calcLayout();
  initBubbles();
  setCoach(pick(CONFIG.coach.welcome), 'happy', 0);
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = function () { ttsVoice = null; pickTtsVoice(); };
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcLayout();
}

function handlePress(px, py) {
  const now = millis();
  if (now - lastPressTime < 120) return;
  lastPressTime = now;
  initAudio();
  for (let i = btnsPrev.length - 1; i >= 0; i--) {
    const b = btnsPrev[i];
    if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
      if (!b.silent) playSfx('click');
      b.onClick(px, py);
      return;
    }
  }
}

function mousePressed() {
  if (millis() - lastTouchTime < 700) return false;
  handlePress(mouseX, mouseY);
  return false;
}

function mouseMoved() { usingTouch = false; }

function touchStarted() {
  usingTouch = true; lastTouchTime = millis();
  if (touches.length > 0) handlePress(touches[0].x, touches[0].y);
  return false;
}

function touchMoved() { return false; }

function keyPressed() {
  if (key === 'm' || key === 'M') { toggleMute(); return; }
  if (keyCode === ENTER || key === ' ') {
    initAudio();
    if (gameState === 'START') startGame();
    else if (gameState === 'PLAY' && G.phase === 'feedback') goNext();
    else if (gameState === 'RESULT' && chestCanDismiss()) dismissChest();
    return false;
  }
}
