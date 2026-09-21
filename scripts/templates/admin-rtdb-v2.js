import { initializeApp, getApps } from '../fb/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from '../fb/firebase-auth.js';
import { getDatabase, ref, onValue, get, set, update, remove, push } from '../fb/firebase-database.js';

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
var USERS = [];
var QUERIES = [];
var QTAB = 'all';
var COURSES = [];

function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }
function say(t) {
  var o = document.getElementById('admin-alert');
  o.textContent = t;
  o.style.display = 'block';
  clearTimeout(o._t);
  o._t = setTimeout(function () { o.style.display = 'none'; }, 4000);
}
function showErr(err) { say('Error: ' + ((err && (err.message || err.code)) || 'unknown error')); }
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
function secondaryAuth() {
  var found = getApps().filter(function (a) { return a.name === 'brivora-secondary'; })[0];
  var sapp = found || initializeApp(firebaseConfig, 'brivora-secondary');
  return getAuth(sapp);
}

function render() {
  var body = document.getElementById('users-body');
  body.innerHTML = '';
  if (!USERS.length) {
    body.innerHTML = '<tr><td class="bv-empty" colspan="6">No users yet.</td></tr>';
  } else {
    USERS.forEach(function (u) {
      var tr = document.createElement('tr');
      var status = u.disabled
        ? '<span class="bv-badge off">Disabled</span>'
        : '<span class="bv-badge on">Active</span>';
      tr.innerHTML =
        '<td class="bv-td"><div class="bv-usercell"><div class="bv-uavatar">' + esc(initials(u.name)) + '</div><div><div class="bv-uname">' + esc(u.name || '(no name)') + '</div></div></div></td>' +
        '<td class="bv-td">' + esc(u.email || '') + '</td>' +
        '<td class="bv-td"><span class="bv-role">' + esc(u.role || 'User') + '</span></td>' +
        '<td class="bv-td">' + status + '</td>' +
        '<td class="bv-td"><span class="bv-date">' + fmtDate(u.createdAt) + '</span></td>' +
        '<td class="bv-td"><button class="bv-btn" data-act="menu" data-uid="' + u.uid + '" type="button">Action ▾</button></td>';
      body.appendChild(tr);
    });
  }
  updateStats();
}

function updateStats() {
  var now = Date.now();
  var weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  var active = 0, disabled = 0, fresh = 0;
  USERS.forEach(function (u) {
    if (u.disabled) disabled++; else active++;
    if (u.createdAt && new Date(u.createdAt).getTime() > weekAgo) fresh++;
  });
  document.getElementById('stat-total').textContent = USERS.length;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-disabled').textContent = disabled;
  document.getElementById('stat-new').textContent = fresh;
}

onValue(ref(db, 'brivora_users'), function (snap) {
  var val = snap.val() || {};
  USERS = Object.keys(val).map(function (uid) {
    var r = val[uid] || {};
    return { uid: uid, name: r.name || '', email: r.email || '', role: r.role || 'User', disabled: !!r.disabled, createdAt: r.createdAt || null };
  });
  render();
}, function (err) { showErr(err); });

function scrollToTable() {
  var el = document.querySelector('.bv-card');
  if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth' });
}

function findUser(uid) {
  for (var i = 0; i < USERS.length; i++) if (USERS[i].uid === uid) return USERS[i];
  return null;
}

function closeMenu() {
  var m = document.getElementById('bv-act-menu');
  if (m && m.parentNode) m.parentNode.removeChild(m);
}

function openMenu(btn) {
  closeMenu();
  var uid = btn.getAttribute('data-uid');
  var u = findUser(uid);
  if (!u) return;
  var m = document.createElement('div');
  m.id = 'bv-act-menu';
  m.className = 'bv-actmenu';
  m.innerHTML =
    '<button class="bv-actopt" data-act="edit" data-uid="' + uid + '" type="button">Edit details</button>' +
    '<button class="bv-actopt" data-act="pass" data-uid="' + uid + '" type="button">Reset password</button>' +
    '<button class="bv-actopt" data-act="power" data-uid="' + uid + '" type="button">' + (u.disabled ? 'Enable user' : 'Disable user') + '</button>' +
    '<button class="bv-actopt danger" data-act="del" data-uid="' + uid + '" type="button">Delete user</button>';
  document.body.appendChild(m);
  var r = btn.getBoundingClientRect();
  var mw = 170;
  m.style.top = (r.bottom + window.scrollY + 6) + 'px';
  m.style.left = Math.max(8, Math.min(r.right + window.scrollX - mw, document.documentElement.scrollWidth - mw - 8)) + 'px';
}

function handleAction(act, uid) {
  var u = findUser(uid);
  if (!u) return;
  if (act === 'edit') { openModal(u); return; }
  if (act === 'pass') {
    if (!window.confirm('Send a password reset email to ' + u.email + '? The user will set a new password from the email link.')) return;
    sendPasswordResetEmail(auth, u.email)
      .then(function () { say('Password reset email sent to ' + u.email + '.'); })
      .catch(showErr);
    return;
  }
  if (act === 'power') {
    update(ref(db, 'brivora_users/' + uid), { disabled: !u.disabled })
      .then(function () { say(u.disabled ? 'User enabled.' : 'User disabled. Their login is now blocked.'); }).catch(showErr);
    return;
  }
  if (act === 'del') {
    if (!window.confirm('Delete user ' + u.email + '? They will no longer be able to log in.')) return;
    remove(ref(db, 'brivora_users/' + uid))
      .then(function () { say('User deleted. Their login is now blocked.'); }).catch(showErr);
  }
}

document.addEventListener('click', function (e) {
  var t = e.target;
  var btnEl = t && t.closest ? t.closest('button[data-act]') : null;
  if (!btnEl) { closeMenu(); return; }
  var act = btnEl.getAttribute('data-act');
  var uid = btnEl.getAttribute('data-uid');
  if (act === 'menu') { openMenu(btnEl); return; }
  closeMenu();
  handleAction(act, uid);
});

function openModal(u) {
  document.getElementById('f-uid').value = u ? u.uid : '';
  document.getElementById('f-name').value = u ? (u.name || '') : '';
  document.getElementById('f-email').value = u ? (u.email || '') : '';
  document.getElementById('f-role').value = u ? (u.role || 'User') : 'User';
  var fp = document.getElementById('f-pass');
  fp.value = '';
  fp.disabled = !!u;
  fp.placeholder = u ? 'Use the reset option in the row action menu to change password' : 'Password (min 6 chars)';
  document.getElementById('f-title').textContent = u ? 'Edit user' : 'Add new user';
  document.getElementById('user-modal').classList.add('open');
}
function closeModal() { document.getElementById('user-modal').classList.remove('open'); }

document.getElementById('menu-add').addEventListener('click', function () { openModal(null); });
document.getElementById('f-cancel').addEventListener('click', closeModal);
document.getElementById('user-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var uid = document.getElementById('f-uid').value;
  var name = document.getElementById('f-name').value.trim();
  var email = document.getElementById('f-email').value.trim();
  var role = document.getElementById('f-role').value.trim() || 'User';
  var pass = document.getElementById('f-pass').value;
  if (!email) { say('Email is required.'); return; }
  if (uid) {
    update(ref(db, 'brivora_users/' + uid), { name: name, email: email, role: role })
      .then(function () { closeModal(); say('User details updated.'); }).catch(showErr);
    return;
  }
  if (!pass) { say('Password is required for a new user.'); return; }
  if (pass.length < 6) { say('Password must be at least 6 characters.'); return; }
  var sa = secondaryAuth();
  say('Creating user...');
  createUserWithEmailAndPassword(sa, email, pass)
    .then(function (cred) {
      var p = name ? updateProfile(cred.user, { displayName: name }) : Promise.resolve();
      return p.then(function () {
        return set(ref(db, 'brivora_users/' + cred.user.uid), {
          name: name, email: email, role: role, disabled: false, createdAt: new Date().toISOString()
        });
      });
    })
    .then(function () { return signOut(sa); })
    .then(function () { closeModal(); say('User created. They can now log in with this email and password.'); })
    .catch(function (e2) {
      if (e2 && e2.code === 'auth/email-already-in-use') {
        say('This email is already registered in Firebase Auth. Use a different email.');
      } else { showErr(e2); }
    });
});

document.getElementById('menu-dashboard').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
document.getElementById('menu-users').addEventListener('click', scrollToTable);
document.getElementById('menu-profile').addEventListener('click', function () { say('Signed in as ' + ADMIN_EMAIL + ' (Enterprise Admin).'); });
document.getElementById('menu-settings').addEventListener('click', function () { say('Settings: Firebase project career-68877. Data rules apply to the Realtime Database.'); });

document.getElementById('admin-logout-btn').addEventListener('click', function () {
  signOut(auth).then(function () { window.location.href = base() + '/login/'; });
});

onAuthStateChanged(auth, function (user) {
  if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL) {
    window.location.href = base() + '/login/';
    return;
  }
  var t0 = Date.now();
  get(ref(db, '.info/connected')).then(function () {
    var ms = Date.now() - t0;
    document.getElementById('health-latency').textContent = ms + 'ms Latency';
  }).catch(function () {});
});

// ===== Contact queries (brivora_queries) =====
function renderQueries() {
  var unread = QUERIES.filter(function (q) { return !q.read; }).length;
  document.getElementById('q-cnt-all').textContent = QUERIES.length;
  document.getElementById('q-cnt-unread').textContent = unread;
  var list = QTAB === 'unread' ? QUERIES.filter(function (q) { return !q.read; }) : QUERIES;
  list = list.slice().sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
  var box = document.getElementById('queries-body');
  box.innerHTML = '';
  if (!list.length) {
    return;
  }
  list.forEach(function (q) {
    var card = document.createElement('div');
    card.className = 'bv-query' + (q.read ? '' : ' unread');
    var metaBits = [];
    if (q.company) metaBits.push('Company: <b>' + esc(q.company) + '</b>');
    if (q.phone) metaBits.push('Phone: ' + esc(q.phone));
    card.innerHTML =
      '<div class="bv-q-head"><div><div class="bv-q-name">' + esc(q.name || '(no name)') + '</div>' +
      '<div class="bv-q-meta">' + esc(q.email || '') + '</div></div>' +
      (q.read ? '' : '<span class="bv-q-new">NEW</span>') + '</div>' +
      (metaBits.length ? '<div class="bv-q-meta">' + metaBits.join(' &nbsp;|&nbsp; ') + '</div>' : '') +
      '<div class="bv-q-msg">' + esc(q.message || '(no message)') + '</div>' +
      '<div class="bv-q-foot"><span class="bv-date">' + fmtDate(q.createdAt) + '</span>' +
      '<div class="bv-q-actions">' +
      (q.read ? '' : '<button class="bv-btn" data-qact="read" data-qid="' + q.id + '" type="button">Mark as read</button>') +
      '<button class="bv-btn" data-qact="del" data-qid="' + q.id + '" type="button" style="color:#dc2626">Remove</button>' +
      '</div></div>';
    box.appendChild(card);
  });
}

onValue(ref(db, 'brivora_queries'), function (snap) {
  var val = snap.val() || {};
  QUERIES = Object.keys(val).map(function (id) {
    var r = val[id] || {};
    return { id: id, name: r.name || '', email: r.email || '', phone: r.phone || '', company: r.company || '', message: r.message || '', read: !!r.read, createdAt: r.createdAt || null };
  });
  renderQueries();
}, function (err) {
  var box = document.getElementById('queries-body');
  if (box) box.innerHTML = '<div class="bv-empty">Could not load queries: ' + esc((err && err.message) || '') + '</div>';
});

document.getElementById('queries-body').addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('button[data-qact]') : null;
  if (!b) return;
  var id = b.getAttribute('data-qid');
  var act = b.getAttribute('data-qact');
  if (act === 'read') {
    update(ref(db, 'brivora_queries/' + id), { read: true })
      .then(function () { say('Query marked as read.'); }).catch(showErr);
  } else if (act === 'del') {
    if (!window.confirm('Remove this query permanently?')) return;
    remove(ref(db, 'brivora_queries/' + id))
      .then(function () { say('Query removed.'); }).catch(showErr);
  }
});

Array.prototype.forEach.call(document.querySelectorAll('.qtab'), function (t) {
  t.addEventListener('click', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.qtab'), function (x) { x.classList.remove('active'); });
    t.classList.add('active');
    QTAB = t.getAttribute('data-qtab');
    renderQueries();
  });
});

document.getElementById('menu-queries').addEventListener('click', function () {
  var el = document.getElementById('queries-body');
  if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ===== Course management (brivora_courses) =====
function fmtINR(n) { return Number(n || 0).toLocaleString('en-IN'); }

function renderCourses() {
  var body = document.getElementById('courses-body');
  body.innerHTML = '';
  if (!COURSES.length) {
    body.innerHTML = '<tr><td class="bv-empty" colspan="7">No courses yet. Click "Add Course" to create the first one.</td></tr>';
    return;
  }
  COURSES.forEach(function (c) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="bv-td"><img class="bv-cimg" src="' + esc(c.image || '') + '" alt="' + esc(c.name || 'course') + '" /></td>' +
      '<td class="bv-td"><div class="bv-cname">' + esc(c.name || '') + '</div><div class="bv-clevel">' + esc(c.level || '') + '</div></td>' +
      '<td class="bv-td"><span class="bv-role">' + esc(c.category || '') + '</span></td>' +
      '<td class="bv-td"><span class="bv-fee">₹' + fmtINR(c.fee) + '</span>' + (c.originalFee ? '<span class="bv-ofee">₹' + fmtINR(c.originalFee) + '</span>' : '') + '</td>' +
      '<td class="bv-td"><span class="bv-date">' + esc(c.duration || '') + '</span></td>' +
      '<td class="bv-td">' + (c.status === 'inactive' ? '<span class="bv-badge off">Inactive</span>' : '<span class="bv-badge on">Active</span>') + '</td>' +
      '<td class="bv-td"><div class="bv-actions"><button class="bv-btn" data-cact="edit" data-cid="' + c.id + '" type="button">Edit</button><button class="bv-btn" data-cact="del" data-cid="' + c.id + '" type="button" style="color:#dc2626">Delete</button></div></td>';
    body.appendChild(tr);
  });
}

onValue(ref(db, 'brivora_courses'), function (snap) {
  var val = snap.val() || {};
  COURSES = Object.keys(val).map(function (id) {
    var r = val[id] || {};
    return { id: id, name: r.name || '', category: r.category || '', desc: r.desc || '', image: r.image || '', fee: Number(r.fee || 0), originalFee: Number(r.originalFee || 0), discount: Number(r.discount || 0), duration: r.duration || '', level: r.level || '', status: r.status || 'active', createdAt: r.createdAt || null };
  });
  renderCourses();
}, function (err) {
  var b = document.getElementById('courses-body');
  if (b) b.innerHTML = '<tr><td class="bv-empty" colspan="7">Could not load courses: ' + esc((err && err.message) || '') + '</td></tr>';
});

function findCourse(id) {
  for (var i = 0; i < COURSES.length; i++) if (COURSES[i].id === id) return COURSES[i];
  return null;
}

function updateCoursePreview() {
  var url = document.getElementById('cf-img').value.trim();
  var box = document.getElementById('cf-preview');
  if (url) box.innerHTML = '<img src="' + esc(url) + '" alt="Course image preview" />';
  else box.innerHTML = '<span>No image yet</span>';
}

function autoDiscount() {
  var fee = Number(document.getElementById('cf-fee').value || 0);
  var ofee = Number(document.getElementById('cf-ofee').value || 0);
  if (ofee > 0 && fee >= 0 && ofee > fee) document.getElementById('cf-disc').value = Math.round((1 - fee / ofee) * 100);
}

function openCourseModal(c) {
  document.getElementById('cf-id').value = c ? c.id : '';
  document.getElementById('cf-name').value = c ? (c.name || '') : '';
  document.getElementById('cf-cat').value = c ? (c.category || '') : '';
  document.getElementById('cf-desc').value = c ? (c.desc || '') : '';
  document.getElementById('cf-img').value = c ? (c.image || '') : '';
  document.getElementById('cf-dur').value = c ? (c.duration || '') : '';
  document.getElementById('cf-fee').value = c ? c.fee : '';
  document.getElementById('cf-ofee').value = c ? (c.originalFee || '') : '';
  document.getElementById('cf-disc').value = c ? (c.discount || '') : '';
  document.getElementById('cf-level').value = c ? (c.level || '') : '';
  document.getElementById('cf-status').value = c ? (c.status || 'active') : 'active';
  document.getElementById('cf-title').textContent = c ? 'Edit course' : 'Add course';
  updateCoursePreview();
  document.getElementById('course-modal').classList.add('open');
}
function closeCourseModal() { document.getElementById('course-modal').classList.remove('open'); }

document.getElementById('btn-add-course').addEventListener('click', function () { openCourseModal(null); });
document.getElementById('cf-cancel').addEventListener('click', closeCourseModal);
document.getElementById('course-modal').addEventListener('click', function (e) { if (e.target === this) closeCourseModal(); });
document.getElementById('cf-img').addEventListener('input', updateCoursePreview);
document.getElementById('cf-fee').addEventListener('input', autoDiscount);
document.getElementById('cf-ofee').addEventListener('input', autoDiscount);

document.getElementById('course-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var id = document.getElementById('cf-id').value;
  var name = document.getElementById('cf-name').value.trim();
  if (!name) { say('Course name is required.'); return; }
  var fee = Number(document.getElementById('cf-fee').value || 0);
  var ofee = Number(document.getElementById('cf-ofee').value || 0);
  var rec = {
    name: name,
    category: document.getElementById('cf-cat').value.trim(),
    desc: document.getElementById('cf-desc').value.trim(),
    image: document.getElementById('cf-img').value.trim(),
    duration: document.getElementById('cf-dur').value.trim(),
    fee: fee,
    originalFee: ofee,
    discount: Number(document.getElementById('cf-disc').value || 0),
    level: document.getElementById('cf-level').value.trim(),
    status: document.getElementById('cf-status').value === 'inactive' ? 'inactive' : 'active'
  };
  if (id) {
    update(ref(db, 'brivora_courses/' + id), rec)
      .then(function () { closeCourseModal(); say('Course updated.'); }).catch(showErr);
  } else {
    rec.createdAt = new Date().toISOString();
    set(push(ref(db, 'brivora_courses')), rec)
      .then(function () { closeCourseModal(); say('Course added. It is now live on the Courses page.'); }).catch(showErr);
  }
});

document.getElementById('courses-body').addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('button[data-cact]') : null;
  if (!b) return;
  var id = b.getAttribute('data-cid');
  var act = b.getAttribute('data-cact');
  if (act === 'edit') {
    var c = findCourse(id);
    if (c) openCourseModal(c);
  } else if (act === 'del') {
    var c2 = findCourse(id);
    if (!c2) return;
    if (!window.confirm('Delete course "' + c2.name + '"? It will be removed from the public Courses page.')) return;
    remove(ref(db, 'brivora_courses/' + id))
      .then(function () { say('Course deleted.'); }).catch(showErr);
  }
});

document.getElementById('menu-courses').addEventListener('click', function () {
  var el = document.getElementById('courses');
  if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
