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
try { window.wpcf7 = undefined; } catch (e) {}

// Safety net: force visible input text on any wpcf7-classed field
// (covers the brief moment before the rebuild below runs).
var st = document.createElement('style');
st.textContent =
  'form.wpcf7-form input:where([type=text],[type=email],[type=tel]){color:#0f172a !important;-webkit-text-fill-color:#0f172a !important;background-color:#ffffff !important;caret-color:#165dfc !important;}' +
  'form.wpcf7-form textarea{color:#0f172a !important;-webkit-text-fill-color:#0f172a !important;background-color:#ffffff !important;caret-color:#165dfc !important;}';
document.head.appendChild(st);

var form = document.querySelector('form.wpcf7-form');
var msgBox = null;
var submitBtn = null;

if (form) {
  // ===== Rebuild the form with clean, inline-styled fields =====
  // Every field carries its own inline style, so no theme CSS, dark mode
  // or third-party script can hide the text or break the layout.
  var L = 'display:block;font-size:14px;font-weight:500;color:#0f172a;margin-bottom:6px;font-family:inherit;line-height:1.4';
  var I = 'width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #dde4ee;border-radius:4px;font-size:16px;font-family:inherit;color:#0f172a;-webkit-text-fill-color:#0f172a;background:#ffffff;outline:none;caret-color:#165dfc;line-height:1.6';
  var T = I + ';resize:vertical';
  var B = 'width:100%;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;font-size:15px;font-weight:600;font-family:inherit;color:#ffffff;-webkit-text-fill-color:#ffffff;background:linear-gradient(105deg,#53a3ff,#165dfc);border:none;border-radius:4px;cursor:pointer;margin-top:4px';

  function fld(label, type, name, extra) {
    var id = 'bvf-' + name;
    return '<div><label for="' + id + '" style="' + L + '">' + label + '</label>' +
      '<input id="' + id + '" type="' + type + '" name="' + name + '" style="' + I + '"' + (extra || '') + '></div>';
  }

  form.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:16px">' +
      fld('Full name', 'text', 'your-name', ' maxlength="20" autocomplete="name"') +
      fld('Email address', 'email', 'your-email', ' autocomplete="email"') +
      fld('Phone number', 'tel', 'tel-814', ' inputmode="numeric" autocomplete="tel"') +
      fld('Enterprise name', 'text', 'company', ' maxlength="30" autocomplete="organization"') +
    '</div>' +
    '<div style="margin-top:16px"><label for="bvf-your-message" style="' + L + '">Your message</label>' +
      '<textarea id="bvf-your-message" name="your-message" rows="4" style="' + T + '"></textarea></div>' +
    '<label style="display:flex;align-items:flex-start;gap:10px;margin-top:16px;cursor:pointer;font-size:14px;color:#344056;line-height:1.5;font-family:inherit">' +
      '<input type="checkbox" name="acceptance-17" style="width:18px;height:18px;margin:2px 0 0;accent-color:#165dfc;flex-shrink:0">' +
      '<span>I accept the privacy policy and terms of service</span></label>' +
    '<input type="submit" value="Send message" style="' + B + '">' +
    '<div class="bvf-msg" style="display:none;margin-top:12px;padding:12px 16px;border-radius:4px;font-size:14px;font-weight:600;line-height:1.5;font-family:inherit"></div>';

  msgBox = form.querySelector('.bvf-msg');
  submitBtn = form.querySelector('input[type=submit]');

  function val(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }

  function show(msg, ok) {
    if (!msgBox) return;
    msgBox.textContent = msg;
    msgBox.style.display = 'block';
    if (ok) {
      msgBox.style.border = '1px solid #a0fad0';
      msgBox.style.background = '#eafff5';
      msgBox.style.color = '#00835b';
    } else {
      msgBox.style.border = '1px solid #fecaca';
      msgBox.style.background = '#fef2f2';
      msgBox.style.color = '#b42318';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = val('your-name');
    var email = val('your-email');
    var phone = val('tel-814');
    var company = val('company');
    var message = val('your-message');

    if (!name) { show('Please enter your full name.', false); return; }
    if (!/^[A-Za-z .'-]+$/.test(name)) { show('Full name can contain only alphabets (A-Z).', false); return; }
    if (name.length > 20) { show('Full name can be at most 20 characters.', false); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { show('Please enter a valid email address (must contain @).', false); return; }
    var digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
    if (!digits) { show('Please enter your mobile number.', false); return; }
    if (digits.length !== 10) { show('Please enter a valid 10-digit mobile number.', false); return; }
    if (!company) { show('Please enter your enterprise name.', false); return; }
    if (!/^[A-Za-z .&'-]+$/.test(company)) { show('Enterprise name can contain only alphabets (A-Z).', false); return; }
    if (company.length > 30) { show('Enterprise name can be at most 30 characters.', false); return; }
    var checkbox = form.querySelector('[name="acceptance-17"]');
    if (checkbox && !checkbox.checked) { show('Please accept the privacy policy and terms of service.', false); return; }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.value = 'Sending...'; submitBtn.style.opacity = '0.7'; }
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
      if (submitBtn) { submitBtn.disabled = false; submitBtn.value = 'Send message'; submitBtn.style.opacity = '1'; }
      show('Thank you! Your message has been sent. Our team will get back to you soon.', true);
    }).catch(function (err) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.value = 'Send message'; submitBtn.style.opacity = '1'; }
      show('Sorry, something went wrong: ' + ((err && err.message) || 'could not send'), false);
    });
  });
}

window.__brivoraContactReady = true;
