// Restores the original login page links (self-service sign-up / password reset
// removed on request) and deletes the /register/, /forgot-password/ and
// /reset-password/ pages. Idempotent — safe to run on every retheme.
// Usage: node scripts/build-auth-pages.mjs
import fs from "node:fs";

const loginPath = "app/login/page.tsx";
let login = fs.readFileSync(loginPath, "utf8");

const patchedP =
  '<p className="wp-block-paragraph">\n' +
  "                {`Forgot your password? `}\n" +
  '                <a href="/forgot-password">{`Reset it here`}</a>\n' +
  "              </p>\n" +
  '              <p className="wp-block-paragraph">\n' +
  "                {`Don't have an account? `}\n" +
  '                <a href="/register">{`Create one`}</a>\n' +
  "              </p>";

const originalP =
  '<p className="wp-block-paragraph">\n' +
  "                {`Don't have an account? `}\n" +
  '                <a href="/contact">{`Contact us to get access`}</a>\n' +
  "              </p>";

if (login.includes(patchedP)) {
  login = login.replace(patchedP, originalP);
  fs.writeFileSync(loginPath, login);
  console.log("login page restored to original links");
} else if (login.includes(originalP)) {
  console.log("login page already original");
} else {
  console.log("login page bottom paragraph not found — leaving as is");
}

for (const d of ["app/register", "app/forgot-password", "app/reset-password"]) {
  fs.rmSync(d, { recursive: true, force: true });
  console.log("removed " + d);
}
