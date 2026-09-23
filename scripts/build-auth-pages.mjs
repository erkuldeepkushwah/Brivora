// Generates /register/, /forgot-password/ and /reset-password/ pages from
// app/login/page.tsx (same WP theme + Brivora styling), and patches the login
// page with links to the new pages. Idempotent — safe to run on every retheme.
// Usage: node scripts/build-auth-pages.mjs
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => {
  fs.mkdirSync(p.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(p, s);
  console.log("written " + p + " (" + s.length + " bytes)");
};

const CFG = `const firebaseConfig = {
  apiKey: 'AIzaSyCr9M4t9kTgqKK7VlAr-_JfvT_N3Qb2xgY',
  authDomain: 'career-68877.firebaseapp.com',
  databaseURL: 'https://career-68877-default-rtdb.firebaseio.com',
  projectId: 'career-68877',
  storageBucket: 'career-68877.firebasestorage.app',
  messagingSenderId: '828433949673',
  appId: '1:828433949673:web:8f7a3436edb0b1655a6178',
  measurementId: 'G-9051DT2C2F'
};`;

const HEAD = `import { initializeApp } from '../fb/firebase-app.js';
import { getAuth`;

const regJs = HEAD + `, createUserWithEmailAndPassword, updateProfile } from '../fb/firebase-auth.js';
import { getDatabase, ref, set } from '../fb/firebase-database.js';

${CFG}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

var form = document.getElementById('reg-form');
var out = document.getElementById('reg-alert');

function say(t) { out.textContent = t; out.style.display = 'block'; }
function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  var name = form.querySelector('input[name=reg-name]').value.trim();
  var email = form.querySelector('input[name=reg-email]').value.trim();
  var pass = form.querySelector('input[name=reg-pass]').value;
  var pass2 = form.querySelector('input[name=reg-pass2]').value;
  if (!name) { say('Please enter your full name.'); return; }
  if (!email) { say('Please enter your email address.'); return; }
  if (pass.length < 6) { say('Password must be at least 6 characters.'); return; }
  if (pass !== pass2) { say('Passwords do not match.'); return; }
  say('Creating your account...');
  try {
    var cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    await set(ref(db, 'brivora_users/' + cred.user.uid), {
      name: name, email: email, role: 'User', disabled: false, createdAt: new Date().toISOString()
    });
    say('Account created! Opening your dashboard...');
    setTimeout(function () { window.location.href = base() + '/dashboard/'; }, 900);
  } catch (err) {
    var code = err && err.code ? err.code : '';
    var msg = 'Could not create your account. Please try again.';
    if (code === 'auth/email-already-in-use') msg = 'This email is already registered. Try logging in instead.';
    if (code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
    if (code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
    if (code === 'auth/operation-not-allowed') msg = 'Sign-up is not enabled. Please contact Brivora support.';
    if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
    say(msg);
  }
});

window.__brivoraLoginReady = true;`;

const fpJs = HEAD + `, sendPasswordResetEmail } from '../fb/firebase-auth.js';

${CFG}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

var form = document.getElementById('fp-form');
var out = document.getElementById('fp-alert');

function say(t) { out.textContent = t; out.style.display = 'block'; }
function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  var email = form.querySelector('input[name=fp-email]').value.trim();
  if (!email) { say('Please enter your email address.'); return; }
  say('Sending reset link...');
  try {
    await sendPasswordResetEmail(auth, email, { url: location.origin + base() + '/reset-password/' });
    say('Reset link sent! Apna email check karo (spam folder bhi). Email ke link se naya password set karo.');
  } catch (err) {
    var code = err && err.code ? err.code : '';
    var msg = 'Could not send the reset link. Please try again.';
    if (code === 'auth/user-not-found') msg = 'No account found with this email.';
    if (code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
    if (code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
    if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
    say(msg);
  }
});

window.__brivoraLoginReady = true;`;

const rpJs = HEAD + `, verifyPasswordResetCode, confirmPasswordReset } from '../fb/firebase-auth.js';

${CFG}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

var form = document.getElementById('rp-form');
var out = document.getElementById('rp-alert');

function say(t) { out.textContent = t; out.style.display = 'block'; }
function base() { return location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : ''; }

var oob = new URLSearchParams(location.search).get('oobCode');
if (!oob) {
  say('This reset link is invalid or incomplete. Please request a new one from the Forgot Password page.');
  form.style.display = 'none';
} else {
  verifyPasswordResetCode(auth, oob).then(function (email) {
    say('Resetting the password for ' + email);
  }).catch(function () {
    say('This reset link has expired or was already used. Please request a new one.');
    form.style.display = 'none';
  });
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!oob) return;
  var pass = form.querySelector('input[name=rp-pass]').value;
  var pass2 = form.querySelector('input[name=rp-pass2]').value;
  if (pass.length < 6) { say('Password must be at least 6 characters.'); return; }
  if (pass !== pass2) { say('Passwords do not match.'); return; }
  say('Updating your password...');
  try {
    await confirmPasswordReset(auth, oob, pass);
    say('Password updated! Opening the login page...');
    setTimeout(function () { window.location.href = base() + '/login/'; }, 1200);
  } catch (err) {
    var code = err && err.code ? err.code : '';
    var msg = 'Could not update the password. Please request a new reset link.';
    if (code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
    if (code === 'auth/expired-action-code') msg = 'This reset link has expired. Please request a new one.';
    if (code === 'auth/invalid-action-code') msg = 'This reset link is invalid or was already used.';
    say(msg);
  }
});

window.__brivoraLoginReady = true;`;

// ---------- form builders (WP wpcf7 style, matches the login page look) ----------
const field = (name, label, type, auto, extra = "") => '                    <p>\n                      <label>\n                        {` ' + label + '`}\n                        <br />\n                        <span className="wpcf7-form-control-wrap" data-name="' + name + '">\n                          <input size={40} maxLength={400} className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required' + extra + '" autoComplete="' + auto + '" aria-required="true" aria-invalid="false" type="' + type + '" name="' + name + '" />\n                        </span>\n                      </label>\n                    </p>';

const formJsx = (id, label, inner, submit, alertId) => '                  <form id="' + id + '" method="post" className="wpcf7-form init" aria-label="' + label + '" noValidate data-status="init">\n' + inner + '\n                    <p>\n                      <input className="wpcf7-form-control wpcf7-submit has-spinner" type="submit" value="' + submit + '" />\n                    </p>\n                    <div className="wpcf7-response-output" id="' + alertId + '" aria-hidden="true"></div>\n                  </form>';

const regForm = formJsx("reg-form", "Register form",
  field("reg-name", "Full name", "text", "name") +
  field("reg-email", "Email address", "email", "email", " wpcf7-validates-as-email") +
  field("reg-pass", "Password (min 6 characters)", "password", "new-password") +
  field("reg-pass2", "Confirm password", "password", "new-password"),
  "Create Account", "reg-alert");

const fpForm = formJsx("fp-form", "Forgot password form",
  field("fp-email", "Email address", "email", "email", " wpcf7-validates-as-email"),
  "Send Reset Link", "fp-alert");

const rpForm = formJsx("rp-form", "Reset password form",
  field("rp-pass", "New password (min 6 characters)", "password", "new-password") +
  field("rp-pass2", "Confirm new password", "password", "new-password"),
  "Update Password", "rp-alert");

// ---------- page surgery helpers ----------
function cut(page, startAnchor, endAnchor) {
  const s = page.indexOf(startAnchor);
  if (s === -1) throw new Error("anchor not found: " + startAnchor.slice(0, 60));
  const e = page.indexOf(endAnchor, s);
  if (e === -1) throw new Error("end anchor not found: " + endAnchor.slice(0, 60));
  return { s, e: e + endAnchor.length };
}

function buildPage(src, opts) {
  let page = src;
  // metadata title
  page = page.replace('title: "Login – Brivora"', 'title: "' + opts.title + ' – Brivora"');
  // H1 (the one right before </h1>)
  page = page.replace("{`Login`}\n          </h1>", "{`" + opts.h1 + "`}\n          </h1>");
  // card heading + sub
  page = page.replace("{`Login to your account`}", "{`" + opts.h3 + "`}");
  page = page.replace("{`Enter your details below to sign in.`}", "{`" + opts.sub + "`}");
  // form
  const f = cut(page, '<form id="login-form"', "</form>");
  page = page.slice(0, f.s) + opts.form + page.slice(f.e);
  // module script
  const m = cut(page, '<script type="module"', 'window.__brivoraLoginReady = true;" }} />');
  page = page.slice(0, m.s) + '<script type="module" dangerouslySetInnerHTML={{ __html: ' + JSON.stringify(opts.js) + ' }} />' + page.slice(m.e);
  // bottom link paragraph
  const oldP = `<p className="wp-block-paragraph">
                {\`Don't have an account? \`}
                <a href="/register">{\`Create one\`}</a>
              </p>`;
  const newP = `<p className="wp-block-paragraph">
                {\`${opts.linkText} \`}
                <a href="/${opts.linkHref}">{\`${opts.linkLabel}\`}</a>
              </p>`;
  if (page.indexOf(oldP) === -1) throw new Error("bottom paragraph anchor not found");
  page = page.replace(oldP, newP);
  return page;
}

// ---------- run ----------
const loginPath = "app/login/page.tsx";
const src = read(loginPath);

// 1) patch the login page with register + forgot links (idempotent)
let login = src;
if (login.indexOf("/forgot-password") === -1) {
  const oldP = `<p className="wp-block-paragraph">
                {\`Don't have an account? \`}
                <a href="/contact">{\`Contact us to get access\`}</a>
              </p>`;
  const newP = `<p className="wp-block-paragraph">
                {\`Forgot your password? \`}
                <a href="/forgot-password">{\`Reset it here\`}</a>
              </p>
              <p className="wp-block-paragraph">
                {\`Don't have an account? \`}
                <a href="/register">{\`Create one\`}</a>
              </p>`;
  if (login.indexOf(oldP) === -1) throw new Error("login page bottom paragraph not found");
  login = login.replace(oldP, newP);
  write(loginPath, login);
} else {
  console.log("login page already patched");
}

// 2) generate the three pages from the (patched) login page
const base = read(loginPath);
write("app/register/page.tsx", buildPage(base, {
  title: "Register", h1: "Create Account", h3: "Create your account",
  sub: "Fill in your details below to sign up.", form: regForm, js: regJs,
  linkText: "Already have an account?", linkHref: "login", linkLabel: "Sign in"
}));
write("app/forgot-password/page.tsx", buildPage(base, {
  title: "Forgot Password", h1: "Forgot Password", h3: "Reset your password",
  sub: "Enter your account email and we will send you a reset link.", form: fpForm, js: fpJs,
  linkText: "Remembered your password?", linkHref: "login", linkLabel: "Back to login"
}));
write("app/reset-password/page.tsx", buildPage(base, {
  title: "Reset Password", h1: "Reset Password", h3: "Choose a new password",
  sub: "Enter a new password for your account below.", form: rpForm, js: rpJs,
  linkText: "Remembered your password?", linkHref: "login", linkLabel: "Back to login"
}));
