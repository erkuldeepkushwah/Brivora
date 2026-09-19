// Firebase now returns 'auth/invalid-credential' instead of 'auth/user-not-found'
// for a missing account, so the admin auto-bootstrap branch must match both.
import fs from "node:fs";

const OLD = "if (code === 'auth/user-not-found' && email.toLowerCase() === ADMIN_EMAIL) {";
const NEW = "if ((code === 'auth/user-not-found' || code === 'auth/invalid-credential') && email.toLowerCase() === ADMIN_EMAIL) {";

for (const file of ["app/login/page.tsx", "scripts/templates/login-firebase.js"]) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes(OLD)) throw new Error(file + ": pattern not found");
  s = s.replace(OLD, NEW);
  fs.writeFileSync(file, s);
  console.log("patched: " + file);
}
