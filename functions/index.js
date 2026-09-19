// Brivora Admin user management - Firebase Cloud Functions (Admin SDK).
// Privileged operations (list/create/update/delete users) are ONLY possible
// here on the backend - never in the frontend. The admin is identified by
// the caller's verified Firebase ID token email (ADMIN_EMAIL).
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "brivora@gmail.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "125607";

function requireAdmin(req) {
  const email = req.auth && req.auth.token && req.auth.token.email;
  if (!email || String(email).toLowerCase() !== ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}

async function isAdminUid(uid) {
  const u = await admin.auth().getUser(uid);
  return !!(u.email && u.email.toLowerCase() === ADMIN_EMAIL);
}

// Make sure the admin account exists (also re-enables it if it was disabled).
async function ensureAdminUser() {
  try {
    const u = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    if (u.disabled) await admin.auth().updateUser(u.uid, { disabled: false });
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      await admin.auth().createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: "Brivora Admin",
        emailVerified: true,
      });
    } else {
      throw e;
    }
  }
}

function publicUser(u) {
  return { uid: u.uid, email: u.email, name: u.displayName || "", disabled: !!u.disabled };
}

exports.adminListUsers = onCall({ cors: true }, async (req) => {
  requireAdmin(req);
  await ensureAdminUser();
  const out = [];
  let pageToken = null;
  do {
    const res = await admin.auth().listUsers(1000, pageToken);
    out.push(...res.users);
    pageToken = res.pageToken;
  } while (pageToken);
  return { users: out.map(publicUser) };
});

exports.adminCreateUser = onCall({ cors: true }, async (req) => {
  requireAdmin(req);
  const { name, email, password } = req.data || {};
  if (!email || !/^\S+@\S+\.\S+$/.test(String(email))) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }
  if (!password || String(password).length < 6) {
    throw new HttpsError("invalid-argument", "Password must be at least 6 characters.");
  }
  const props = {
    email: String(email).trim().toLowerCase(),
    password: String(password),
    emailVerified: true,
  };
  if (name) props.displayName = String(name);
  try {
    const u = await admin.auth().createUser(props);
    return { user: publicUser(u) };
  } catch (e) {
    if (e.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "A user with this email already exists.");
    }
    throw e;
  }
});

exports.adminUpdateUser = onCall({ cors: true }, async (req) => {
  requireAdmin(req);
  const { uid, name, email, password, disabled } = req.data || {};
  if (!uid) throw new HttpsError("invalid-argument", "uid is required.");
  if (await isAdminUid(uid)) {
    throw new HttpsError("failed-precondition", "The admin account cannot be modified from the dashboard.");
  }
  const props = {};
  if (name !== undefined) props.displayName = String(name || "");
  if (email !== undefined && String(email).trim() !== "") {
    if (!/^\S+@\S+\.\S+$/.test(String(email))) {
      throw new HttpsError("invalid-argument", "A valid email is required.");
    }
    props.email = String(email).trim().toLowerCase();
  }
  if (password) {
    if (String(password).length < 6) {
      throw new HttpsError("invalid-argument", "Password must be at least 6 characters.");
    }
    props.password = String(password);
  }
  if (disabled !== undefined) props.disabled = !!disabled;
  try {
    const u = await admin.auth().updateUser(uid, props);
    return { user: publicUser(u) };
  } catch (e) {
    if (e.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Another user already uses this email.");
    }
    throw e;
  }
});

exports.adminSetPassword = onCall({ cors: true }, async (req) => {
  requireAdmin(req);
  const { uid, password } = req.data || {};
  if (!uid || !password || String(password).length < 6) {
    throw new HttpsError("invalid-argument", "uid and a password of at least 6 characters are required.");
  }
  if (await isAdminUid(uid)) {
    throw new HttpsError("failed-precondition", "The admin password cannot be reset from the dashboard.");
  }
  await admin.auth().updateUser(uid, { password: String(password) });
  return { ok: true };
});

exports.adminDeleteUser = onCall({ cors: true }, async (req) => {
  requireAdmin(req);
  const { uid } = req.data || {};
  if (!uid) throw new HttpsError("invalid-argument", "uid is required.");
  if (await isAdminUid(uid)) {
    throw new HttpsError("failed-precondition", "The admin account cannot be deleted.");
  }
  await admin.auth().deleteUser(uid);
  return { ok: true };
});
