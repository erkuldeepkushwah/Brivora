// Insert a classic (non-module) submit guard into the login page so the form
// can NEVER do a native POST (which returns 405 on GitHub Pages) while the
// module script is still loading. The login module sets
// window.__brivoraLoginReady = true once its own submit handler is attached.
import fs from "node:fs";

const GUARD = [
  "(function () {",
  "  window.__brivoraLoginReady = window.__brivoraLoginReady || false;",
  "  function ready() {",
  "    var f = document.getElementById('login-form');",
  "    if (!f) return;",
  "    f.addEventListener('submit', function (e) {",
  "      if (!window.__brivoraLoginReady) {",
  "        e.preventDefault();",
  "        var o = document.getElementById('login-alert');",
  "        if (o) {",
  "          o.textContent = 'Login system is still loading. Please wait a few seconds, then try again.';",
  "          o.style.display = 'block';",
  "        }",
  "      }",
  "    }, true);",
  "  }",
  "  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);",
  "  else ready();",
  "})();"
].join("\n");

const file = "app/login/page.tsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
if (lines.some((l) => l.includes("still loading"))) {
  console.log("guard already present in " + file);
  process.exit(0);
}
const idxs = [];
lines.forEach((l, i) => {
  if (l.includes('type="module"') && l.includes("firebase-app.js")) idxs.push(i);
});
if (idxs.length !== 1) throw new Error(file + ": module script line not found (" + idxs.length + " matches)");
const i = idxs[0];
const indent = lines[i].match(/^[ \t]*/)[0];
lines.splice(i + 1, 0, indent + `<script dangerouslySetInnerHTML={{ __html: ${JSON.stringify(GUARD)} }} />`);
fs.writeFileSync(file, lines.join("\n"));
console.log("405 guard inserted into " + file);
