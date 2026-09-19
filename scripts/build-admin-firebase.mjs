// Build the Firebase auth system:
// 1. app/login/page.tsx  -> replace demo login script with Firebase client auth
// 2. app/admin/page.tsx -> new admin dashboard page (derived from login page)
// Templates are read from scripts/templates/.
// Usage: node scripts/build-admin-firebase.mjs
import fs from "node:fs";

const TPL = "scripts/templates";
const read = (p) => fs.readFileSync(p, "utf8").trim();

const loginJs = read(`${TPL}/login-firebase.js`);
const adminJs = read(`${TPL}/admin-firebase.js`);
const dashJsx = read(`${TPL}/admin-dashboard.jsx.txt`);

const scriptTag = (js) => `<script type="module" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(js)} }} />`;

const LOGIN_SRC = "app/login/page.tsx";
let login = fs.readFileSync(LOGIN_SRC, "utf8");

// --- sanity: find demo script line + card region markers
const lines = login.split("\n");
const demoIdx = lines.findIndex((l) => l.includes("initBrivoraLogin"));
if (demoIdx === -1) throw new Error("login demo script not found");
const cardStart = '<div className="wp-block-group alignwide is-layout-flex" style={{ justifyContent: "center", margin: "0 auto"';
const anchor = "{`Contact us to get access`}";

function replaceRegion(s, newRegion) {
  const iStart = s.indexOf(cardStart);
  if (iStart === -1) throw new Error("card start not found");
  const divStart = s.lastIndexOf("<div", iStart);
  const iAnchor = s.indexOf(anchor);
  if (iAnchor === -1) throw new Error("anchor not found");
  let i = iAnchor, closes = 0;
  while (closes < 2) {
    const j = s.indexOf("</div>", i);
    if (j === -1) throw new Error("closing divs not found");
    i = j + "</div>".length;
    closes++;
  }
  return s.slice(0, divStart) + newRegion + s.slice(i);
}

// --- 1) build admin page from login page
let admin = login;
if (!admin.includes('title: "Login – Brivora"')) throw new Error("login metadata not found");
admin = admin.replace('title: "Login – Brivora"', 'title: "Admin – Brivora"');
admin = admin.replace("export default function LoginPage", "export default function AdminPage");
if (!admin.includes("{`Login`}")) throw new Error("login h1 not found");
admin = admin.split("{`Login`}").join("{`Admin`}");
admin = replaceRegion(admin, dashJsx);
// replace demo script line with admin module script
const aLines = admin.split("\n");
const aDemo = aLines.findIndex((l) => l.includes("initBrivoraLogin"));
if (aDemo === -1) throw new Error("admin: demo script line not found");
const aIndent = aLines[aDemo].match(/^\s*/)[0];
aLines[aDemo] = aIndent + scriptTag(adminJs);
admin = aLines.join("\n");
fs.mkdirSync("app/admin", { recursive: true });
fs.writeFileSync("app/admin/page.tsx", admin);
console.log("app/admin/page.tsx written");

// --- 2) update login page script
const indent = lines[demoIdx].match(/^\s*/)[0];
lines[demoIdx] = indent + scriptTag(loginJs);
login = lines.join("\n");
fs.writeFileSync(LOGIN_SRC, login);
console.log("app/login/page.tsx updated");

// --- checks
const okAdmin = admin.includes("adminListUsers") && admin.includes('title: "Admin – Brivora"') && admin.includes("{`Admin`}");
const okLogin = login.includes("signInWithEmailAndPassword") && !login.includes("initBrivoraLogin");
console.log("checks:", okAdmin, okLogin);
if (!okAdmin || !okLogin) throw new Error("checks failed");
