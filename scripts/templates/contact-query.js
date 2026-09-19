import { initializeApp } from '../fb/firebase-app.js';
import { getDatabase, ref, push } from '../fb/firebase-database.js';

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

// Stop Contact Form 7's JS (loaded from the7.io) from hijacking the form.
// Its config points at the7.io and every submit fails cross-origin.
// This runs before DOMContentLoaded, so CF7's own init check
// (typeof wpcf7 !== 'undefined') fails and it never touches the form.
try { window.wpcf7 = undefined; } catch (e) {}

// Force visible input text. On some mobile browsers (dark mode / theme
// extensions / the7's premium scripts) the typed text can end up
// invisible (same color as background). These !important rules make the
// form readable no matter what any other stylesheet or script does.
var st = document.createElement('style');
st.textContent =
  'form.wpcf7-form input:where([type=text],[type=email],[type=tel],[type=number],[type=search],[type=url],[type=password]){color:#0f172a !important;-webkit-text-fill-color:#0f172a !important;background-color:#ffffff !important;caret-color:#165dfc !important;}' +
  'form.wpcf7-form textarea{color:#0f172a !important;-webkit-text-fill-color:#0f172a !important;background-color:#ffffff !important;caret-color:#165dfc !important;}' +
  'form.wpcf7-form input::placeholder,form.wpcf7-form textarea::placeholder{color:#94a3b8 !important;-webkit-text-fill-color:#94a3b8 !important;opacity:1 !important;}' +
  'form.wpcf7-form input[type=checkbox]{accent-color:#165dfc;}';
document.head.appendChild(st);

function val(sel) {
  var el = document.querySelector(sel);
  return el ? String(el.value || '').trim() : '';
}

function show(form, msg, ok) {
  var out = form.querySelector('.wpcf7-response-output');
  if (!out) return;
  out.textContent = msg;
  out.setAttribute('aria-hidden', 'false');
  out.style.display = 'block';
  out.style.padding = '12px 16px';
  out.style.marginTop = '12px';
  out.style.borderRadius = '4px';
  out.style.fontSize = '14px';
  out.style.lineHeight = '1.5';
  out.style.fontWeight = '600';
  if (ok) {
    out.style.border = '1px solid #a0fad0';
    out.style.background = '#eafff5';
    out.style.color = '#00835b';
  } else {
    out.style.border = '1px solid #fecaca';
    out.style.background = '#fef2f2';
    out.style.color = '#b42318';
  }
}

var form = document.querySelector('form.wpcf7-form');
if (form) {
  // field constraints: phone = 10 digits, company = max 20 characters
  var phoneEl = form.querySelector('[name="tel-814"]');
  if (phoneEl) {
    phoneEl.setAttribute('inputmode', 'numeric');
    phoneEl.setAttribute('autocomplete', 'tel');
  }
  var companyEl = form.querySelector('[name="company"]');
  if (companyEl) {
    companyEl.setAttribute('maxlength', '20');
    companyEl.setAttribute('autocomplete', 'organization');
  }
  var emailEl = form.querySelector('[name="your-email"]');
  if (emailEl) emailEl.setAttribute('autocomplete', 'email');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = val('[name="your-name"]');
    var email = val('[name="your-email"]');
    var phone = val('[name="tel-814"]');
    var company = val('[name="company"]');
    var message = val('[name="your-message"]');

    if (!name) { show(form, 'Please enter your full name.', false); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { show(form, 'Please enter a valid email address (must contain @).', false); return; }
    var digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
    if (!digits) { show(form, 'Please enter your mobile number.', false); return; }
    if (digits.length !== 10) { show(form, 'Please enter a valid 10-digit mobile number.', false); return; }
    if (!company) { show(form, 'Please enter your company / business name.', false); return; }
    if (company.length > 20) { show(form, 'Company name can be at most 20 characters (currently ' + company.length + ').', false); return; }
    var checkbox = form.querySelector('[name="acceptance-17"]');
    if (checkbox && !checkbox.checked) { show(form, 'Please accept the privacy policy and terms of service.', false); return; }

    var btn = form.querySelector('.wpcf7-submit');
    if (btn) { btn.disabled = true; btn.value = 'Sending...'; }
    push(ref(db, 'brivora_queries'), {
      name: name,
      email: email,
      phone: digits,
      company: company,
      message: message,
      read: false,
      createdAt: new Date().toISOString()
    }).then(function () {
      form.reset();
      if (btn) { btn.disabled = false; btn.value = 'Send message'; }
      show(form, 'Thank you! Your message has been sent. Our team will get back to you soon.', true);
    }).catch(function (err) {
      if (btn) { btn.disabled = false; btn.value = 'Send message'; }
      show(form, 'Sorry, something went wrong: ' + ((err && err.message) || 'could not send'), false);
    });
  });
}

window.__brivoraContactReady = true;
