import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js';

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
const functions = getFunctions(app);
var ADMIN_EMAIL = 'brivora@gmail.com';
var USERS = [];

function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }
function say(t) {
  var o = document.getElementById('admin-alert');
  o.textContent = t;
  o.style.display = 'block';
  setTimeout(function () { o.style.display = 'none'; }, 5000);
}
function showErr(err) { say('Error: ' + ((err && (err.message || err.code)) || 'unknown error')); }
function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
function callApi(name, data) { var f = httpsCallable(functions, name); return f(data || {}); }

var BTN = 'style="font-size:13px;padding:6px 10px;margin:2px 4px 2px 0;border:1px solid #dde4ee;background:#f1f5f9;border-radius:6px;cursor:pointer"';

function btn(act, uid, label) {
  return '<button data-act="' + act + '" data-uid="' + uid + '" ' + BTN + '>' + label + '</button>';
}

function renderRows(list) {
  var body = document.getElementById('users-body');
  body.innerHTML = '';
  list.forEach(function (u) {
    var tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #dde4ee';
    var isAdmin = u.email && u.email.toLowerCase() === ADMIN_EMAIL;
    var actions = isAdmin ? '<em>admin</em>' :
      btn('edit', u.uid, 'Edit') + btn('pass', u.uid, 'Reset pw') +
      (u.disabled ? btn('enable', u.uid, 'Enable') : btn('disable', u.uid, 'Disable')) +
      btn('del', u.uid, 'Delete');
    var status = u.disabled
      ? '<span style="color:#b42318;font-weight:600">Disabled</span>'
      : '<span style="color:#067647;font-weight:600">Active</span>';
    tr.innerHTML =
      '<td style="padding:10px">' + esc(u.name || '') + '</td>' +
      '<td style="padding:10px">' + esc(u.email || '') + '</td>' +
      '<td style="padding:10px">' + status + '</td>' +
      '<td style="padding:10px;white-space:nowrap">' + actions + '</td>';
    body.appendChild(tr);
  });
  document.getElementById('admin-info').textContent = list.length + ' of ' + USERS.length + ' users';
}

function applySearch() {
  var q = document.getElementById('admin-search').value.trim().toLowerCase();
  if (!q) return USERS;
  return USERS.filter(function (u) {
    return ((u.name || '') + ' ' + (u.email || '')).toLowerCase().indexOf(q) !== -1;
  });
}

function refresh() {
  return callApi('adminListUsers').then(function (r) {
    USERS = (r && r.data && r.data.users) || [];
    renderRows(applySearch());
  });
}

document.getElementById('admin-search').addEventListener('input', function () { renderRows(applySearch()); });

document.getElementById('users-body').addEventListener('click', function (e) {
  var t = e.target;
  var btnEl = t && t.closest ? t.closest('button[data-act]') : null;
  if (!btnEl) return;
  var uid = btnEl.getAttribute('data-uid');
  var act = btnEl.getAttribute('data-act');
  var u = null;
  for (var i = 0; i < USERS.length; i++) if (USERS[i].uid === uid) u = USERS[i];
  if (act === 'edit') { openModal(u); return; }
  if (act === 'pass') {
    var p = window.prompt('New password for ' + (u ? u.email : '') + ' (min 6 chars):', '');
    if (!p) return;
    callApi('adminSetPassword', { uid: uid, password: p })
      .then(function () { say('Password updated.'); refresh(); }).catch(showErr);
    return;
  }
  if (act === 'disable') {
    callApi('adminUpdateUser', { uid: uid, disabled: true })
      .then(function () { say('User disabled.'); refresh(); }).catch(showErr);
    return;
  }
  if (act === 'enable') {
    callApi('adminUpdateUser', { uid: uid, disabled: false })
      .then(function () { say('User enabled.'); refresh(); }).catch(showErr);
    return;
  }
  if (act === 'del') {
    if (!window.confirm('Delete user ' + (u ? u.email : '') + '? This cannot be undone.')) return;
    callApi('adminDeleteUser', { uid: uid })
      .then(function () { say('User deleted.'); refresh(); }).catch(showErr);
  }
});

function openModal(u) {
  document.getElementById('f-uid').value = u ? u.uid : '';
  document.getElementById('f-name').value = u ? (u.name || '') : '';
  document.getElementById('f-email').value = u ? (u.email || '') : '';
  document.getElementById('f-pass').value = '';
  document.getElementById('f-title').textContent = u ? 'Edit user' : 'Add new user';
  document.getElementById('f-pass').placeholder = u ? 'Leave blank to keep current password' : 'Password (min 6 chars)';
  document.getElementById('user-modal').style.display = 'flex';
}
function closeModal() { document.getElementById('user-modal').style.display = 'none'; }

document.getElementById('admin-add-btn').addEventListener('click', function () { openModal(null); });
document.getElementById('f-cancel').addEventListener('click', closeModal);
document.getElementById('user-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });

document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var uid = document.getElementById('f-uid').value;
  var name = document.getElementById('f-name').value.trim();
  var email = document.getElementById('f-email').value.trim();
  var pass = document.getElementById('f-pass').value;
  if (!email) { say('Email is required.'); return; }
  var p;
  if (uid) {
    var data = { uid: uid, name: name, email: email };
    if (pass) data.password = pass;
    p = callApi('adminUpdateUser', data);
  } else {
    if (!pass) { say('Password is required for a new user.'); return; }
    if (pass.length < 6) { say('Password must be at least 6 characters.'); return; }
    p = callApi('adminCreateUser', { name: name, email: email, password: pass });
  }
  p.then(function () { closeModal(); say(uid ? 'User updated.' : 'User created.'); refresh(); }).catch(showErr);
});

document.getElementById('admin-logout-btn').addEventListener('click', function () {
  signOut(auth).then(function () { window.location.href = base() + '/login/'; });
});

onAuthStateChanged(auth, function (user) {
  if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL) {
    window.location.href = base() + '/login/';
    return;
  }
  say('Loading users...');
  refresh().catch(showErr);
});
