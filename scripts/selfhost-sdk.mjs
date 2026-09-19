// Self-host the Firebase web SDK so login never depends on gstatic CDN:
// 1. Download firebase-{app,auth,database}.js from jsdelivr into public/fb/
// 2. Rewrite their internal gstatic import to the local ./firebase-app.js
// 3. Update template imports to ../fb/ (idempotent)
// 4. Rebuild all three auth pages
import fs from "node:fs";

const FILES = ["firebase-app.js", "firebase-auth.js", "firebase-database.js"];
const CDN = "https://cdn.jsdelivr.net/npm/firebase@10.12.2/";

fs.mkdirSync("public/fb", { recursive: true });
for (const f of FILES) {
  const res = await fetch(CDN + f);
  if (!res.ok) throw new Error("failed to download " + f + ": " + res.status);
  let code = await res.text();
  code = code.split('"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"').join('"./firebase-app.js"');
  fs.writeFileSync("public/fb/" + f, code);
  console.log("public/fb/" + f + ": " + code.length + " bytes");
}

for (const t of ["scripts/templates/login-rtdb.js", "scripts/templates/admin-rtdb-v2.js", "scripts/templates/dashboard-rtdb.js"]) {
  let s = fs.readFileSync(t, "utf8");
  if (s.includes("gstatic.com/firebasejs")) {
    s = s.split("https://www.gstatic.com/firebasejs/10.12.2/").join("../fb/");
    fs.writeFileSync(t, s);
    console.log("imports rewritten in " + t);
  }
}
console.log("selfhost-sdk done");
