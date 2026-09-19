// Client-only Firebase auth system (no Cloud Functions needed):
// 1. app/login/page.tsx  -> login + RTDB user-record check (disabled/deleted users blocked)
// 2. app/admin/page.tsx -> dashboard driven by RTDB `brivora_users` + secondary-app user creation
// Usage: node scripts/build-rtdb-system.mjs
import fs from "node:fs";

const TPL = "scripts/templates";
const read = (p) => fs.readFileSync(p, "utf8").trim();
const scriptTag = (js) => `<script type="module" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(js)} }} />`;

function replaceScriptLine(file, js) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const idxs = lines.map((l, i) => (l.includes("gstatic.com/firebasejs") ? i : -1)).filter((i) => i !== -1);
  if (idxs.length !== 1) throw new Error(file + ": expected exactly 1 firebase module script line, found " + idxs.length);
  const i = idxs[0];
  const indent = lines[i].match(/^[ \t]*/)[0];
  lines[i] = indent + scriptTag(js);
  fs.writeFileSync(file, lines.join("\n"));
  console.log("patched: " + file + " (line " + (i + 1) + ")");
}

replaceScriptLine("app/login/page.tsx", read(`${TPL}/login-rtdb.js`));
replaceScriptLine("app/admin/page.tsx", read(`${TPL}/admin-rtdb.js`));
