// Re-embed the login script template into app/login/page.tsx.
// The template sends non-admin users to /dashboard/.
import fs from "node:fs";

const js = fs.readFileSync("scripts/templates/login-rtdb.js", "utf8").trim();
const scriptTag = `<script type="module" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(js)} }} />`;
const file = "app/login/page.tsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
const idxs = [];
lines.forEach((l, i) => {
  if (l.includes('type="module"') && l.includes("firebase-app.js")) idxs.push(i);
});
if (idxs.length !== 1) throw new Error(file + ": expected 1 firebase module script line, found " + idxs.length);
lines[idxs[0]] = lines[idxs[0]].match(/^[ \t]*/)[0] + scriptTag;
fs.writeFileSync(file, lines.join("\n"));
console.log("patched " + file);
