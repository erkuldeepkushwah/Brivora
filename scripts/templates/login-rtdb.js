import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

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

var form = document.getElementById('login-form');
var out = document.getElementById('login-alert');

function say(t) { out.textContent = t; out.style.display = 'block'; }
function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }
function goAdmin() {
  say('Login successful! Opening admin dashboard...');
  setTimeout(function () { window.location.href = base() + '/admin/'; }, 600);
}

async function checkUserRecord(uid) {
  try {
    var snap = await get(ref(db, 'brivora_users/' + uid));
    return snap.exists() ? snap.val() : null;
  } catch (e) { return null; }
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  var email = form.querySelector('input[name=login-email]').value.trim();
  var pass = form.querySelector('input[name=login-password]').value;
  if (!email || !pass) { say('Please enter your email and password.'); return; }
  say('Signing in...');
  try {
    var cred = await signInWithEmailAndPassword(auth, email, pass);
    var u = cred.user;
    if (u.email && u.email.toLowerCase() === ADMIN_EMAIL) { goAdmin(); return; }
    var rec = await checkUserRecord(u.uid);
    if (!rec) {
      await signOut(auth);
      say('Your account is no longer active. Please contact Brivora support.');
      return;
    }
    if (rec.disabled) {
      await signOut(auth);
      say('Your account has been disabled. Please contact Brivora support.');
      return;
    }
    var nm = rec.name || u.displayName || '';
    say('Welcome' + (nm ? ' ' + nm : '') + '! Redirecting...');
    setTimeout(function () { window.location.href = base() + '/'; }, 1200);
  } catch (err) {
    var code = err && err.code ? err.code : '';
    if ((code === 'auth/user-not-found' || code === 'auth/invalid-credential') && email.toLowerCase() === ADMIN_EMAIL) {
      try {
        await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, pass);
        say('Admin account initialized. Opening admin dashboard...');
        goAdmin();
      } catch (e2) {
        say('Could not initialize the admin account: ' + ((e2 && e2.code) || (e2 && e2.message) || 'unknown error'));
      }
      return;
    }
    var msg = 'Login failed. Please try again.';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') msg = 'Invalid email or password.';
    if (code === 'auth/user-not-found') msg = 'No account found with this email.';
    if (code === 'auth/user-disabled') msg = 'This account has been disabled by the admin.';
    if (code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
    if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
    if (code === 'auth/operation-not-allowed') msg = 'Email/Password sign-in is not enabled. Enable it in Firebase Console > Authentication > Sign-in method.';
    say(msg);
  }
});
