import { initializeApp } from '../fb/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from '../fb/firebase-auth.js';
import { getDatabase, ref, onValue, set, update, get } from '../fb/firebase-database.js';

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
var ROLE = 'Student';
var ENROLL = {};
var TAB = 'all';

var CATALOG = [
  { id: 'fullstack', title: 'Full Stack Web Development', cat: 'Web development', hours: 120, lessons: 48, desc: 'Master HTML, CSS, JavaScript, React, Node.js, and databases to build complete, production-ready web applications.' },
  { id: 'mern', title: 'MERN Stack Development', cat: 'Web development', hours: 110, lessons: 44, desc: 'Learn MongoDB, Express.js, React, and Node.js by building full-scale, real-world MERN applications step by step.' },
  { id: 'frontend', title: 'Frontend Development', cat: 'Web development', hours: 80, lessons: 32, desc: 'Create responsive, modern user interfaces with HTML, CSS, JavaScript, and modern frameworks like React.' },
  { id: 'analytics', title: 'Data Analytics', cat: 'Data & analytics', hours: 90, lessons: 36, desc: 'Work with real datasets using Excel, SQL, Python, and Power BI to turn raw data into clear business insights.' },
  { id: 'ai', title: 'Artificial Intelligence', cat: 'AI & ML', hours: 95, lessons: 38, desc: 'Understand machine learning, deep learning, and modern AI tools by building practical, real-world projects.' },
  { id: 'cyber', title: 'Cyber Security', cat: 'Security', hours: 85, lessons: 34, desc: 'Learn network security, ethical hacking, and threat analysis to protect systems, applications, and data.' },
  { id: 'seo', title: 'SEO and Digital Marketing', cat: 'Marketing', hours: 60, lessons: 24, desc: 'Grow brands with SEO, social media, content marketing, and paid advertising strategies that deliver results.' },
  { id: 'uiux', title: 'UI/UX Design', cat: 'Design', hours: 70, lessons: 28, desc: 'Design clean, intuitive interfaces with user research, wireframing, and prototyping in Figma.' }
];

function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }
function say(t) {
  var o = document.getElementById('dash-alert');
  o.textContent = t;
  o.style.display = 'block';
  clearTimeout(o._t);
  o._t = setTimeout(function () { o.style.display = 'none'; }, 4000);
}
function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
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
    card.innerHTML =
      '<div class="bv-tags"><span class="bv-tag">' + esc(c.cat) + '</span></div>' +
      '<h3>' + esc(c.title) + '</h3>' +
      '<p>' + esc(c.desc) + '</p>' +
      '<div class="bv-meta"><span>Duration: <b>' + c.hours + ' Hrs</b></span><span>Modules: <b>' + c.lessons + '</b></span></div>' +
      (enrolled
        ? '<button class="bv-btn" disabled type="button">Enrolled</button>'
        : '<button class="bv-btn primary" data-enroll="' + c.id + '" type="button">Enroll Now</button>');
    box.appendChild(card);
  });
}

document.getElementById('catalog').addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('button[data-enroll]') : null;
  if (!b || !UID) return;
  var id = b.getAttribute('data-enroll');
  var c = CATALOG.filter(function (x) { return x.id === id; })[0];
  if (!c) return;
  say('Enrolling in ' + c.title + '...');
  set(ref(db, 'brivora_enrollments/' + UID + '/' + id), {
    title: c.title, cat: c.cat, hours: c.hours, lessons: c.lessons, completed: 0, enrolledAt: new Date().toISOString()
  }).then(function () { say('Enrolled! ' + c.title + ' is now in My Courses.'); }).catch(function (err) { say('Error: ' + ((err && err.message) || 'could not enroll')); });
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
document.getElementById('menu-dashboard').addEventListener('click', function () { showBrowse(false); window.scrollTo({ top: 0, behavior: 'smooth' }); });
document.getElementById('menu-mycourses').addEventListener('click', function () { showBrowse(false); scrollId('my-courses'); });
document.getElementById('menu-browse').addEventListener('click', function () { showBrowse(true); scrollId('browse-anchor'); });
document.getElementById('menu-progress').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); say('Your progress cards are at the top.'); });
document.getElementById('menu-certs').addEventListener('click', function () { say('Certificates: ' + list().filter(function (c) { return c.completed >= c.lessons; }).length + ' issued. Complete a course to earn more.'); });
document.getElementById('menu-assignments').addEventListener('click', function () { say('Assignments will be available soon.'); });
document.getElementById('menu-quizzes').addEventListener('click', function () { say('Quizzes will be available soon.'); });
document.getElementById('menu-profile').addEventListener('click', function () { say('Signed in as ' + (NAME || 'student') + ' (' + ROLE + ')'); });
document.getElementById('menu-settings').addEventListener('click', function () { say('Settings: contact Brivora support to change your account details.'); });
document.getElementById('bell-btn').addEventListener('click', function () { say('No new notifications.'); });
document.getElementById('logout-btn').addEventListener('click', function () {
  signOut(auth).then(function () { window.location.href = base() + '/login/'; });
});

onAuthStateChanged(auth, function (user) {
  if (!user) { window.location.href = base() + '/login/'; return; }
  if (user.email && user.email.toLowerCase() === ADMIN_EMAIL) { window.location.href = base() + '/admin/'; return; }
  UID = user.uid;
  NAME = user.displayName || '';
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
