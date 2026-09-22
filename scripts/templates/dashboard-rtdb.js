import { initializeApp } from '../fb/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from '../fb/firebase-auth.js';
import { getDatabase, ref, onValue, set, update, get, push } from '../fb/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCr9M4t9kTgqKK7VlAr-_JfvT_N3Qb2xgY',
  authDomain: 'career-68877.firebaseapp.com',
  databaseURL: 'https://career-68877-default-rtdb.firebaseio.com',
  projectId: 'career-68877',
  storageBucket: 'career-68877.firebasestorage.app',
  messagingSenderId: '828433949673',
  appId: '1:828433949673:web:8f7a3436edb0b1655a6178',
  measurementId: 'G-9051DT2C2F'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
var ADMIN_EMAIL = 'brivora@gmail.com';
var UID = null;
var NAME = '';
var EMAIL = '';
var ROLE = 'Student';
var ENROLL = {};
var TAB = 'all';
var CATALOG = [];

function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }
(function () {
  var a = document.getElementById('bv-logo-img');
  var b = document.getElementById('bv-foot-logo');
  if (a) a.src = base() + '/public/logo.png';
  if (b) b.src = base() + '/public/logo.png';
  var y = document.getElementById('bv-year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
function say(t) {
  var o = document.getElementById('dash-alert');
  o.textContent = t;
  o.style.display = 'block';
  clearTimeout(o._t);
  o._t = setTimeout(function () { o.style.display = 'none'; }, 4000);
}
function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
function fmtINR(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }
function initials(name) {
  var parts = (name || '').trim().split(/\s+/);
  if (!parts[0]) return '?';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}
function fmtDate(iso) {
  if (!iso) return '--';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '--';
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}
function scrollId(id) { var el = document.getElementById(id); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth' }); }

function list() {
  return Object.keys(ENROLL).map(function (id) {
    var e = ENROLL[id] || {};
    return { id: id, title: e.title || id, cat: e.cat || '', hours: e.hours || 0, lessons: e.lessons || 1, completed: e.completed || 0, enrolledAt: e.enrolledAt || null };
  });
}
function current() {
  var l = list().filter(function (c) { return c.completed < c.lessons; });
  l.sort(function (a, b) { return (b.enrolledAt || '').localeCompare(a.enrolledAt || ''); });
  return l[0] || null;
}

function render() {
  var l = list();
  var done = l.filter(function (c) { return c.completed >= c.lessons; });
  var active = l.filter(function (c) { return c.completed < c.lessons; });
  var totalLessons = 0, totalDone = 0;
  l.forEach(function (c) { totalLessons += c.lessons; totalDone += Math.min(c.completed, c.lessons); });
  var pct = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0;

  document.getElementById('st-enrolled').textContent = l.length;
  document.getElementById('st-enrolled-sub').textContent = l.length ? 'Enrolled programs' : 'Get started today';
  document.getElementById('st-progress').textContent = active.length;
  document.getElementById('st-completed').textContent = done.length;
  document.getElementById('st-certs').textContent = done.length;
  document.getElementById('st-total-pct').textContent = pct + '%';
  document.getElementById('st-units').textContent = totalDone + '/' + totalLessons + ' Units';
  var ring = document.getElementById('st-ring');
  ring.textContent = pct + '%';
  ring.style.background = 'conic-gradient(#2b7dff ' + pct + '%, #dde4ee 0)';

  document.getElementById('cnt-all').textContent = l.length;
  document.getElementById('cnt-active').textContent = active.length;
  document.getElementById('cnt-done').textContent = done.length;

  var cur = current();
  if (cur) {
    var cp = Math.round((cur.completed / cur.lessons) * 100);
    document.getElementById('banner-course').textContent = cur.title;
    document.getElementById('banner-pct').textContent = cp + '% Completed';
    document.getElementById('banner-sub').textContent = 'Continue where you left off in your IT certification track. You have ' + (cur.lessons - cur.completed) + ' lessons remaining in this course.';
    document.getElementById('btn-continue-main').style.display = '';
    document.getElementById('btn-resume-top').style.display = '';
  } else if (l.length) {
    document.getElementById('banner-course').textContent = 'All courses completed - congratulations!';
    document.getElementById('banner-pct').textContent = '100% Completed';
    document.getElementById('banner-sub').textContent = 'You have finished every enrolled program. Browse more courses below to keep learning.';
    document.getElementById('btn-continue-main').style.display = 'none';
    document.getElementById('btn-resume-top').style.display = 'none';
  } else {
    document.getElementById('banner-course').textContent = 'No courses yet';
    document.getElementById('banner-pct').textContent = '';
    document.getElementById('banner-sub').textContent = 'You are not enrolled in any program yet. Browse our courses below and enroll to start learning.';
    document.getElementById('btn-continue-main').style.display = 'none';
    document.getElementById('btn-resume-top').style.display = 'none';
  }

  var shown = TAB === 'done' ? done : TAB === 'active' ? active : l;
  var box = document.getElementById('my-courses');
  box.innerHTML = '';
  if (!shown.length) {
    box.innerHTML = '<div class="bv-empty">' + (l.length ? 'No courses in this filter yet.' : 'You have not enrolled in any course yet. Scroll down to Browse Courses and click Enroll.') + '</div>';
  } else {
    shown.forEach(function (c) {
      var p = Math.min(100, Math.round((c.completed / c.lessons) * 100));
      var isDone = c.completed >= c.lessons;
      var card = document.createElement('div');
      card.className = 'bv-course';
      card.innerHTML =
        '<div class="bv-tags"><span class="bv-tag ' + (isDone ? 'done' : 'on') + '">' + (isDone ? 'Completed' : 'In Progress') + '</span><span class="bv-tag">' + esc(c.cat) + '</span></div>' +
        '<h3>' + esc(c.title) + '</h3>' +
        '<div class="bv-meta"><span>Duration: <b>' + c.hours + ' Hrs (' + c.lessons + ' Mod)</b></span><span>Enrolled: <b>' + fmtDate(c.enrolledAt) + '</b></span></div>' +
        '<div><div class="bv-bar-row"><span class="bv-bar-pct">' + p + '%</span><span class="bv-bar-txt">' + Math.min(c.completed, c.lessons) + ' / ' + c.lessons + ' lessons completed</span></div>' +
        '<div class="bv-bar" style="margin-top:6px"><div style="width:' + p + '%"></div></div></div>' +
        '<div class="bv-course-actions">' +
        (isDone ? '<button class="bv-btn primary" disabled type="button">Completed</button>' : '<button class="bv-btn primary" data-next="' + c.id + '" type="button">Continue Learning</button>') +
        '<a class="bv-link" href="' + base() + '/course/">View Course</a></div>';
      box.appendChild(card);
    });
  }
}

function renderCatalog() {
  var box = document.getElementById('catalog');
  box.innerHTML = '';
  CATALOG.forEach(function (c) {
    var enrolled = !!ENROLL[c.id];
    var card = document.createElement('div');
    card.className = 'bv-catcard';
    var disc = c.discount || (c.originalFee > c.fee && c.originalFee > 0 ? Math.round((1 - c.fee / c.originalFee) * 100) : 0);
    card.innerHTML =
      '<div class="bv-catimg"><img src="' + esc(c.image || '') + '" alt="' + esc(c.title || 'course') + '" loading="lazy" /></div>' +
      '<div class="bv-catbody">' +
      '<div class="bv-tags"><span class="bv-tag">' + esc(c.cat) + '</span></div>' +
      '<h3>' + esc(c.title) + '</h3>' +
      '<p>' + esc(c.desc) + '</p>' +
      '<div class="bv-meta"><span>Duration: <b>' + esc(c.duration || (c.hours ? c.hours + ' Hrs' : '')) + '</b></span><span>Modules: <b>' + c.lessons + '</b></span></div>' +
      (c.fee ? '<div class="bv-catfee">' + fmtINR(c.fee) + (c.originalFee ? ' <s>' + fmtINR(c.originalFee) + '</s>' : '') + (disc ? ' <em>' + disc + '% OFF</em>' : '') + '</div>' : '') +
      (enrolled
        ? '<button class="bv-btn" disabled type="button">Enrolled</button>'
        : (payState(c.id) === 'pending' || payState(c.id) === 'success'
          ? '<button class="bv-btn" disabled type="button">Pending Approval</button>'
          : '<button class="bv-btn primary" data-enroll="' + c.id + '" type="button">' + (payState(c.id) === 'failed' ? 'Pay Again' : 'Enroll Now') + '</button>')) +
      '</div>';
    box.appendChild(card);
  });
}

document.getElementById('catalog').addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('button[data-enroll]') : null;
  if (!b || !UID) return;
  var id = b.getAttribute('data-enroll');
  var c = CATALOG.filter(function (x) { return x.id === id; })[0];
  if (!c) return;
  openPay(c);
});

function nextLesson(id) {
  var c = ENROLL[id];
  if (!c || !UID || c.completed >= c.lessons) return;
  var lesson = c.completed + 1;
  update(ref(db, 'brivora_enrollments/' + UID + '/' + id), { completed: lesson })
    .then(function () {
      if (lesson >= c.lessons) say('Course completed! Your certificate has been issued.');
      else say('Lesson ' + lesson + ' of ' + c.lessons + ' completed. Keep going!');
    })
    .catch(function (err) { say('Error: ' + ((err && err.message) || 'could not save')); });
}
document.getElementById('my-courses').addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('button[data-next]') : null;
  if (b) nextLesson(b.getAttribute('data-next'));
});
document.getElementById('btn-continue-main').addEventListener('click', function () { var c = current(); if (c) nextLesson(c.id); });
document.getElementById('btn-resume-top').addEventListener('click', function () { var c = current(); if (c) nextLesson(c.id); });

Array.prototype.forEach.call(document.querySelectorAll('.bv-tab'), function (t) {
  t.addEventListener('click', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.bv-tab'), function (x) { x.classList.remove('active'); });
    t.classList.add('active');
    TAB = t.getAttribute('data-tab');
    render();
  });
});

function showBrowse(on) {
  var a = document.getElementById('browse-anchor');
  var c = document.getElementById('catalog');
  if (a) a.style.display = on ? '' : 'none';
  if (c) c.style.display = on ? '' : 'none';
}
document.getElementById('menu-dashboard').addEventListener('click', function () { showBrowse(false); showQuizzes(false); showExpert(false); window.scrollTo({ top: 0, behavior: 'smooth' }); });
document.getElementById('menu-mycourses').addEventListener('click', function () { showBrowse(false); showQuizzes(false); showExpert(false); scrollId('my-courses'); });
document.getElementById('menu-browse').addEventListener('click', function () { showBrowse(true); showQuizzes(false); showExpert(false); scrollId('browse-anchor'); });
document.getElementById('menu-certs').addEventListener('click', function () { showExpert(false); say('Certificates: ' + list().filter(function (c) { return c.completed >= c.lessons; }).length + ' issued. Complete a course to earn more.'); });
document.getElementById('menu-assignments').addEventListener('click', function () { showExpert(false); say('Assignments will be available soon.'); });
document.getElementById('menu-quizzes').addEventListener('click', function () { showBrowse(false); showQuizzes(true); showExpert(false); scrollId('quizzes-anchor'); });
document.getElementById('menu-expert').addEventListener('click', function () { showBrowse(false); showQuizzes(false); showExpert(true); scrollId('expert-anchor'); });
document.getElementById('menu-profile').addEventListener('click', function () { say('Signed in as ' + (NAME || 'student') + ' (' + ROLE + ')'); });
document.getElementById('menu-settings').addEventListener('click', function () { say('Settings: contact Brivora support to change your account details.'); });
document.getElementById('bell-btn').addEventListener('click', function () { say('No new notifications.'); });
document.getElementById('logout-btn').addEventListener('click', function () {
  signOut(auth).then(function () { window.location.href = base() + '/login/'; });
});

// ===== Dynamic course catalog from brivora_courses =====
onValue(ref(db, 'brivora_courses'), function (snap) {
  var val = snap.val() || {};
  CATALOG = Object.keys(val).map(function (id) {
    var r = val[id] || {};
    return { id: id, title: r.name || id, cat: r.category || '', hours: Number(r.hours || 0), lessons: Number(r.lessons || 12), desc: r.desc || '', image: r.image || '', fee: Number(r.fee || 0), originalFee: Number(r.originalFee || 0), discount: Number(r.discount || 0), duration: r.duration || '', status: r.status || 'active' };
  }).filter(function (c) { return c.title && c.status !== 'inactive'; });
  renderCatalog();
}, function () {});

onAuthStateChanged(auth, function (user) {
  if (!user) { window.location.href = base() + '/login/'; return; }
  if (user.email && user.email.toLowerCase() === ADMIN_EMAIL) { window.location.href = base() + '/admin/'; return; }
  UID = user.uid;
  NAME = user.displayName || '';
  EMAIL = user.email || '';
  get(ref(db, 'brivora_users/' + user.uid)).then(function (snap) {
    var rec = snap.exists() ? snap.val() : null;
    if (!rec) { signOut(auth).then(function () { window.location.href = base() + '/login/'; }); return; }
    if (rec.disabled) { signOut(auth).then(function () { window.location.href = base() + '/login/'; }); return; }
    NAME = rec.name || NAME || 'Student';
    ROLE = rec.role || 'Student';
    document.getElementById('chip-name').textContent = NAME;
    document.getElementById('chip-role').textContent = ROLE;
    document.getElementById('chip-initial').textContent = initials(NAME);
    document.getElementById('welcome-name').textContent = 'Welcome back, ' + NAME;
  }).catch(function () {});
  onValue(ref(db, 'brivora_enrollments/' + user.uid), function (snap) {
    ENROLL = snap.val() || {};
    render();
    renderCatalog();
  }, function (err) { say('Error loading courses: ' + ((err && err.message) || '')); });
});

// ===== Quizzes (Gemini-generated bank in brivora_quizzes) =====
var QUIZBANK = {};
var QZ = null;

onValue(ref(db, 'brivora_quizzes'), function (snap) {
  QUIZBANK = snap.val() || {};
  renderQuizzes();
}, function () {});

function showQuizzes(on) {
  var a = document.getElementById('quizzes-anchor');
  var b = document.getElementById('quizzes');
  if (a) a.style.display = on ? '' : 'none';
  if (b) b.style.display = on ? '' : 'none';
  if (on) renderQuizzes();
}

function quizPool(cid) {
  // Pool of MCQs for a course. Supports both shapes:
  // - new: { questions: [ ...100 MCQs... ] }
  // - old: { sets: { s1: { questions: [...] }, ... } }
  var node = QUIZBANK[cid];
  if (!node) return null;
  var out = [];
  if (Array.isArray(node.questions) && node.questions.length) {
    out = node.questions.filter(function (q) {
      return q && typeof q.q === 'string' && Array.isArray(q.options) && q.options.length === 4;
    });
  } else if (node.sets) {
    Object.keys(node.sets).forEach(function (k) {
      var s = node.sets[k];
      if (!s.questions) return;
      var qs = Array.isArray(s.questions) ? s.questions : Object.keys(s.questions).map(function (qk) { return s.questions[qk]; });
      out = out.concat(qs);
    });
  }
  return out.length ? out : null;
}

function renderQuizzes() {
  var box = document.getElementById('quizzes');
  if (!box) return;
  var l = list();
  box.innerHTML = '';
  if (!l.length) {
    box.innerHTML = '<div class="bv-empty">You have not enrolled in any course yet. Enroll in a course from Browse Courses to unlock its quiz.</div>';
    return;
  }
  l.forEach(function (c) {
    var pool = quizPool(c.id);
    var row = document.createElement('div');
    row.className = 'bv-quizrow';
    row.innerHTML =
      '<div><div class="bv-quiz-title">' + esc(c.title) + '</div>' +
      '<div class="bv-quiz-meta">' + (pool ? pool.length : 100) + ' Questions • MCQ • random 10 every attempt</div></div>' +
      (pool
        ? '<button class="bv-btn primary" data-quiz="' + c.id + '" type="button">Start Quiz</button>'
        : '<button class="bv-btn" disabled type="button">Quiz coming soon</button>');
    box.appendChild(row);
  });
}

function startQuiz(cid) {
  var pool = quizPool(cid);
  if (!pool) { say('Quiz for this course is not ready yet.'); return; }
  // Shuffle the pool and take 10 — har attempt pe bilkul naye random questions
  var shuffled = pool.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
  }
  QZ = { cid: cid, title: (ENROLL[cid] && ENROLL[cid].title) || 'Course', qs: shuffled.slice(0, Math.min(10, shuffled.length)), idx: 0, sel: null, ans: [] };
  document.getElementById('qz-course').textContent = QZ.title;
  document.getElementById('quiz-modal-bg').classList.add('open');
  showQPlay();
}

function showQPlay() {
  document.getElementById('qz-play').style.display = '';
  document.getElementById('qz-result').style.display = 'none';
  renderQ();
}

function renderQ() {
  var q = QZ.qs[QZ.idx];
  document.getElementById('qz-count').textContent = 'Question ' + (QZ.idx + 1) + ' of ' + QZ.qs.length;
  document.getElementById('qz-prog').style.width = (QZ.idx / QZ.qs.length * 100) + '%';
  document.getElementById('qz-q').textContent = q.q || '';
  var box = document.getElementById('qz-opts');
  box.innerHTML = '';
  (q.options || []).forEach(function (o, i) {
    var b = document.createElement('button');
    b.className = 'bv-qopt';
    b.type = 'button';
    b.textContent = 'ABCD'.charAt(i) + '.  ' + o;
    b.addEventListener('click', function () {
      QZ.sel = i;
      Array.prototype.forEach.call(box.children, function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      document.getElementById('qz-note').textContent = '';
    });
    box.appendChild(b);
  });
  document.getElementById('qz-next').textContent = QZ.idx === QZ.qs.length - 1 ? 'Submit' : 'Next';
  document.getElementById('qz-note').textContent = 'Select an option to continue';
  QZ.sel = null;
}

document.getElementById('qz-next').addEventListener('click', function () {
  if (!QZ || !QZ.qs) return;
  if (QZ.sel == null) { document.getElementById('qz-note').textContent = 'Please select an option first.'; return; }
  QZ.ans.push(QZ.sel);
  QZ.idx++;
  if (QZ.idx >= QZ.qs.length) { showQResult(); } else { renderQ(); }
});

function showQResult() {
  var correct = 0;
  QZ.qs.forEach(function (q, i) { if (QZ.ans[i] === q.answer) correct++; });
  var pct = Math.round(correct / QZ.qs.length * 100);
  document.getElementById('qz-play').style.display = 'none';
  document.getElementById('qz-result').style.display = '';
  document.getElementById('qz-count').textContent = 'Quiz complete';
  document.getElementById('qz-prog').style.width = '100%';
  document.getElementById('qz-score').textContent = correct;
  document.getElementById('qz-total').textContent = QZ.qs.length;
  document.getElementById('qz-pct').textContent = pct + '% — ' + correct + ' of ' + QZ.qs.length + ' correct';
  document.getElementById('qz-msg').textContent = pct >= 80 ? 'Excellent! You have mastered this course.' : (pct >= 50 ? 'Good job! Keep practising to improve.' : 'Keep learning — revise the course and try again.');
}

function closeQuiz() {
  document.getElementById('quiz-modal-bg').classList.remove('open');
  QZ = null;
}
document.getElementById('qz-close').addEventListener('click', closeQuiz);
document.getElementById('qz-done').addEventListener('click', closeQuiz);
document.getElementById('qz-retake').addEventListener('click', function () { if (QZ) startQuiz(QZ.cid); });
document.getElementById('quiz-modal-bg').addEventListener('click', function (e) { if (e.target === this) closeQuiz(); });

document.getElementById('quizzes').addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('button[data-quiz]') : null;
  if (!b) return;
  startQuiz(b.getAttribute('data-quiz'));
});

// ===== Expert chat (Prof. Rahul Gupta — Gemini via Cloudflare Worker) =====
// Worker URL RTDB me set hota hai: brivora_config/expertWorkerUrl
// (key sirf Worker ke secret me rehti hai — site me kabhi nahi)
var EXPERT_URL = '';
var EX_HIST = [];
var EX_BUSY = false;
var EX_GREETED = false;

onValue(ref(db, 'brivora_config/expertWorkerUrl'), function (snap) {
  EXPERT_URL = (snap.val() || '').trim();
}, function () {});

function exMsg(role, text) {
  var box = document.getElementById('ex-msgs');
  var d = document.createElement('div');
  d.className = 'bv-msg ' + role;
  d.innerHTML = (role === 'bot' ? '<div class="bv-msg-who">Prof. Rahul Gupta</div>' : '') + esc(text);
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}

function exGreet() {
  if (EX_GREETED) return;
  EX_GREETED = true;
  var courses = list().map(function (c) { return c.title; });
  exMsg('bot', 'Namaste! Main Prof. Rahul Gupta hoon — Brivora ka AI technical expert.' + (courses.length ? '\n\nAap enrolled courses: ' + courses.join(', ') + '.') : '') + '\n\nCoding doubts, course topics, projects, interview prep — koi bhi technical sawaal poocho, main help karunga.');
}

function showExpert(on) {
  var a = document.getElementById('expert-anchor');
  var b = document.getElementById('expert');
  if (a) a.style.display = on ? '' : 'none';
  if (b) b.style.display = on ? '' : 'none';
  if (on) exGreet();
}

function exSend() {
  var input = document.getElementById('ex-input');
  var text = (input.value || '').trim();
  if (!text || EX_BUSY) return;

  if (!EXPERT_URL) {
    exMsg('bot', 'Expert abhi setup ho raha hai. Thodi der baad try karein. (Admin: Cloudflare Worker ka URL brivora_config/expertWorkerUrl me set karein.)');
    return;
  }

  input.value = '';
  exMsg('user', text);
  EX_BUSY = true;
  var btn = document.getElementById('ex-send');
  btn.disabled = true;
  var typing = exMsg('bot typing', 'Prof. Rahul Gupta typing...');

  var courses = list().map(function (c) { return c.title; });
  fetch(EXPERT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, courses: courses, history: EX_HIST.slice(-10) })
  }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (d) {
    var reply = d && typeof d.reply === 'string' && d.reply.trim() ? d.reply : 'Maaf kijiye, samajh nahi aaya. Thoda alag tarike se poocho.';
    EX_HIST.push({ role: 'user', text: text });
    EX_HIST.push({ role: 'bot', text: reply });
    typing.remove();
    exMsg('bot', reply);
  }).catch(function () {
    typing.remove();
    exMsg('bot', 'Kripya dobara try karein — expert se connect nahi ho paya.');
  }).then(function () {
    EX_BUSY = false;
    btn.disabled = false;
    input.focus();
  });
}

document.getElementById('ex-send').addEventListener('click', exSend);
document.getElementById('ex-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') { e.preventDefault(); exSend(); }
});

// ===== Course payment (enroll via admin-approved payment, brivora_payments) =====
var PAYCFG={qr:'',upi:'',bank:''},PAYS={},PAYC=null,PAYTAB='qr',PY_LEFT=0,PY_TICK=null;
function payState(cid){var p=PAYS[cid];return p?(p.status||'pending'):null;}
onValue(ref(db,'brivora_config'),function(s){var r=s.val()||{};PAYCFG.qr=(r.paymentQrUrl||'').trim();PAYCFG.upi=(r.paymentUpiId||'').trim();PAYCFG.bank=(r.paymentBank||'').trim();payFill();},function(){});
function payFill(){if(!PAYC)return;var q=document.getElementById('py-qrimg');q.style.display=PAYCFG.qr?'':'none';q.src=PAYCFG.qr||'';document.getElementById('py-qr-missing').style.display=PAYCFG.qr?'none':'';document.getElementById('py-upi-id').textContent=PAYCFG.upi||'(UPI ID abhi set nahi hai)';document.getElementById('py-bank').textContent=PAYCFG.bank||'(Bank details abhi set nahi hain)';}
function pyView(id){['enroll','payview','status'].forEach(function(k){document.getElementById('py-'+k).style.display=k===id?'':'none';});}
function openPay(c){PAYC=c;document.getElementById('py-course').textContent=c.title;document.getElementById('py-name').textContent=c.title;document.getElementById('py-cat').textContent=c.cat||'--';document.getElementById('py-dur').textContent=c.duration||(c.hours?c.hours+' Hrs':'--');document.getElementById('py-level').textContent=c.level||'--';document.getElementById('py-fee').textContent=fmtINR(c.fee);pyView('enroll');document.getElementById('pay-modal-bg').classList.add('open');}
function stopTimer(){if(PY_TICK){clearInterval(PY_TICK);PY_TICK=null;}}
function pyTick(){var el=document.getElementById('py-timer'),row=document.getElementById('py-timer-row'),btn=document.getElementById('py-submit');if(PY_LEFT>0){var m=Math.floor(PY_LEFT/60),s=PY_LEFT%60;el.textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;row.className='bv-py-timer';btn.disabled=false;PY_LEFT--;}else{el.textContent='00:00';row.className='bv-py-timer expired';btn.disabled=true;stopTimer();}}
function setPayTab(t){PAYTAB=t;Array.prototype.forEach.call(document.querySelectorAll('#py-tabs .bv-tab'),function(x){x.classList.remove('active');});var btn=document.querySelector('#py-tabs [data-pytab="'+t+'"]');if(btn)btn.classList.add('active');document.getElementById('py-pane-qr').style.display=t==='qr'?'':'none';document.getElementById('py-pane-upi').style.display=t==='upi'?'':'none';document.getElementById('py-pane-nb').style.display=t==='netbanking'?'':'none';}
function startPayView(){pyView('payview');payFill();setPayTab('qr');document.getElementById('py-utr').value='';stopTimer();PY_LEFT=300;pyTick();PY_TICK=setInterval(pyTick,1000);}
function pyStatus(st){pyView('status');var ico=document.getElementById('py-st-ico'),ti=document.getElementById('py-st-title'),ms=document.getElementById('py-st-msg'),rt=document.getElementById('py-st-retry');rt.style.display='none';if(st==='success'){ico.textContent='\u2705';ti.textContent='Payment Successful!';ms.textContent='Aapka payment verify ho gaya. '+(PAYC?PAYC.title:'Course')+' ab aapke My Courses me add ho gaya hai.';}else if(st==='failed'){ico.textContent='\u274C';ti.textContent='Payment Failed';ms.textContent='Aapki payment request reject hui hai. Dobara try karein ya admin se contact karein.';rt.style.display='';}else{ico.textContent='\u23F3';ti.textContent='Payment Submitted';ms.textContent='Payment request bhej di gayi hai. Admin verify karne ke baad course activate ho jayega. Aap window band kar sakte hain \u2014 status yahin dikhega.';}}
function submitPay(){if(!PAYC||!UID)return;if(PY_LEFT<=0){say('Time up! Close karke dobara try karein.');return;}var utr=(document.getElementById('py-utr').value||'').replace(/\D/g,'');if(utr.length<12||utr.length>15){say('UTR number 12 se 15 digit ka hona chahiye.');return;}var btn=document.getElementById('py-submit');btn.disabled=true;set(push(ref(db,'brivora_payments')),{uid:UID,name:NAME||'Student',email:EMAIL||'',courseId:PAYC.id,courseName:PAYC.title,cat:PAYC.cat||'',hours:PAYC.hours||0,lessons:PAYC.lessons||12,amount:PAYC.fee,method:PAYTAB,utr:utr,status:'pending',createdAt:new Date().toISOString()}).then(function(){stopTimer();pyStatus('pending');}).catch(function(err){btn.disabled=false;say('Error: '+((err&&err.message)||'submit nahi hua'));});}
function closePay(){stopTimer();document.getElementById('pay-modal-bg').classList.remove('open');PAYC=null;}
document.getElementById('py-pay').addEventListener('click',startPayView);
document.getElementById('py-submit').addEventListener('click',submitPay);
document.getElementById('py-close').addEventListener('click',closePay);
document.getElementById('py-st-close').addEventListener('click',closePay);
document.getElementById('py-st-retry').addEventListener('click',function(){if(PAYC)openPay(PAYC);});
document.getElementById('pay-modal-bg').addEventListener('click',function(e){if(e.target===this)closePay();});
document.getElementById('py-tabs').addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-pytab]'):null;if(b)setPayTab(b.getAttribute('data-pytab'));});
document.getElementById('py-upi-copy').addEventListener('click',function(){var t=PAYCFG.upi;if(!t)return;if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){say('UPI ID copy ho gayi.');},function(){say('UPI ID: '+t);});else say('UPI ID: '+t);});
document.getElementById('py-utr').addEventListener('input',function(e){e.target.value=e.target.value.replace(/\D/g,'').slice(0,15);});
onValue(ref(db,'brivora_payments'),function(snap){var val=snap.val()||{};PAYS={};Object.keys(val).forEach(function(pid){var r=val[pid]||{};if(r.uid!==UID||!r.courseId)return;if(!PAYS[r.courseId]||String(r.createdAt||'')>String(PAYS[r.courseId].createdAt||''))PAYS[r.courseId]={id:pid,status:r.status||'pending',createdAt:r.createdAt||''};});renderCatalog();if(PAYC){var st=payState(PAYC.id);if(st&&document.getElementById('py-status').style.display!=='none')pyStatus(st);if(st==='success')say('Payment approved \u2014 '+PAYC.title+' enrolled!');}},function(){});
