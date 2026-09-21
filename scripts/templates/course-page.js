import { initializeApp } from '../fb/firebase-app.js';
import { getDatabase, ref, onValue } from '../fb/firebase-database.js';

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
const db = getDatabase(app);

function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }
function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
function fmtINR(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }

onValue(ref(db, 'brivora_courses'), function (snap) {
  var val = snap.val() || {};
  var list = Object.keys(val).map(function (id) {
    var r = val[id] || {};
    r.id = id;
    return r;
  }).filter(function (c) { return (c.status || 'active') === 'active'; });
  list.sort(function (a, b) { return String(a.name || '').localeCompare(String(b.name || '')); });
  var box = document.getElementById('brivora-courses');
  if (!box) return;
  box.innerHTML = '';
  if (!list.length) {
    box.innerHTML = '<div class="bvc-empty">New courses are coming soon. Please check back later.</div>';
    return;
  }
  list.forEach(function (c) {
    var fee = Number(c.fee || 0);
    var ofee = Number(c.originalFee || 0);
    var disc = Number(c.discount || 0) || (ofee > fee && ofee > 0 ? Math.round((1 - fee / ofee) * 100) : 0);
    var card = document.createElement('article');
    card.className = 'bvc-card';
    card.innerHTML =
      '<div class="bvc-img">' +
        '<img src="' + esc(c.image || '') + '" alt="' + esc(c.name || 'Brivora course') + '" loading="lazy" />' +
      '</div>' +
      '<div class="bvc-body">' +
        '<h3 class="bvc-title">' + esc(c.name || '') + '</h3>' +
        '<p class="bvc-desc">' + esc(c.desc || '') + '</p>' +
        '<div class="bvc-cat">' + esc(c.category || '') + '</div>' +
        '<div class="bvc-meta">' +
          '<span>Duration: <strong>' + esc(c.duration || '') + '</strong></span>' +
          '<span>Level: <strong>' + esc(c.level || '') + '</strong></span>' +
        '</div>' +
        '<div class="bvc-fee">' + fmtINR(fee) +
          (ofee ? ' <s>' + fmtINR(ofee) + '</s>' : '') +
          (disc ? ' <em>' + disc + '% OFF</em>' : '') +
        '</div>' +
        '<div class="bvc-actions">' +
          '<a class="bvc-btn" href="' + base() + '/contact/">View Details</a>' +
          '<a class="bvc-btn bvc-btn-primary" href="' + base() + '/login/">Enroll Now</a>' +
        '</div>' +
      '</div>';
    box.appendChild(card);
  });
}, function () {
  var b = document.getElementById('brivora-courses');
  if (b) b.innerHTML = '<div class="bvc-empty">Could not load courses right now. Please refresh the page.</div>';
});
