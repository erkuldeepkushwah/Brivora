import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, ref, onValue, set, update, remove } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

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

function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }
function say(t) {
  var o = document.getElementById('admin-alert');
  o.textContent = t;
  o.style.display = 'block';
  setTimeout(function () { o.style.display = 'none'; }, 5000);
}
function showErr(err) { say('Error: ' + ((err && (err.message || err.code)) || 'unknown error')); }
function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }

function secondaryAuth() {
  var found = getApps().filter(function (a) { return a.name === 'brivora-secondary'; })[0];
  var sapp = found || initializeApp(firebaseConfig, 'brivora-secondary');
  return getAuth(sapp);
}

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
    var actions = btn('edit', u.uid, 'Edit') + btn('pass', u.uid, 'Reset pw') +
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

onValue(ref(db, 'brivora_users'), function (snap) {
  var val = snap.val() || {};
  USERS = Object.keys(val).map(function (uid) {
    var r = val[uid] || {};
    return { uid: uid, name: r.name || '', email: r.email || '', disabled: !!r.disabled };
  });
  renderRows(applySearch());
}, function (err) { showErr(err); });

document.getElementById('admin-search').addEventListener('input', function () { renderRows(applySearch()); });

document.getElementById('users-body').addEventListener('click', function (e) {
  var t = e.target;
  var btnEl = t && t.closest ? t.closest('button[data-act]') : null;
  if (!btnEl) return;
  var uid = btnEl.getAttribute('data-uid');
  var act = btnEl.getAttribute('data-act');
  var u = null;
  for (var i = 0; i < USERS.length; i++) if (USERS[i].uid === uid) u = USERS[i];
  if (!u) return;
  if (act === 'edit') { openModal(u); return; }
  if (act === 'pass') {
    if (!window.confirm('Send a password reset email to ' + u.email + '? The user will set a new password from the email link.')) return;
    sendPasswordResetEmail(auth, u.email)
      .then(function () { say('Password reset email sent to ' + u.email + '.'); })
      .catch(showErr);
    return;
  }
  if (act === 'disable') {
    update(ref(db, 'brivora_users/' + uid), { disabled: true })
      .then(function () { say('User disabled. Their login is now blocked.'); }).catch(showErr);
    return;
  }
  if (act === 'enable') {
    update(ref(db, 'brivora_users/' + uid), { disabled: false })
      .then(function () { say('User enabled.'); }).catch(showErr);
    return;
  }
  if (act === 'del') {
    if (!window.confirm('Delete user ' + u.email + '? They will no longer be able to log in.')) return;
    remove(ref(db, 'brivora_users/' + uid))
      .then(function () { say('User deleted. Their login is now blocked.'); }).catch(showErr);
  }
});

function openModal(u) {
  document.getElementById('f-uid').value = u ? u.uid : '';
  document.getElementById('f-name').value = u ? (u.name || '') : '';
  document.getElementById('f-email').value = u ? (u.email || '') : '';
  var fp = document.getElementById('f-pass');
  fp.value = '';
  fp.disabled = !!u;
  fp.placeholder = u ? 'Use the "Reset pw" button on the user row to change password' : 'Password (min 6 chars)';
  document.getElementById('f-title').textContent = u ? 'Edit user' : 'Add new user';
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
  if (uid) {
    update(ref(db, 'brivora_users/' + uid), { name: name, email: email })
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
          name: name, email: email, disabled: false, createdAt: new Date().toISOString()
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

document.getElementById('admin-logout-btn').addEventListener('click', function () {
  signOut(auth).then(function () { window.location.href = base() + '/login/'; });
});

onAuthStateChanged(auth, function (user) {
  if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL) {
    window.location.href = base() + '/login/';
    return;
  }
  say('Loading users...');
});
