// Wires the contact form to Firebase RTDB (brivora_queries).
// Inserts a submit guard + module script into app/contact/page.tsx.
// Idempotent + updates the module script in place when it already exists.
import fs from "node:fs";

const file = "app/contact/page.tsx";
const js = fs.readFileSync("scripts/templates/contact-query.js", "utf8").trim();

const guard = `<script dangerouslySetInnerHTML={{ __html: ${JSON.stringify(
  "document.addEventListener('submit', function (e) { var f = e.target; if (f && f.classList && f.classList.contains('wpcf7-form') && !window.__brivoraContactReady) { e.preventDefault(); var out = f.querySelector('.wpcf7-response-output'); if (out) { out.textContent = 'The form is still loading, please wait a moment and try again.'; out.style.display = 'block'; out.style.padding = '12px 16px'; out.style.border = '1px solid #fde68a'; out.style.background = '#fff7ed'; out.style.color = '#b45309'; out.style.borderRadius = '4px'; out.style.fontSize = '14px'; } } }, true);"
)} }} />`;

const moduleTag = `<script type="module" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(js)} }} />`;

let page = fs.readFileSync(file, "utf8");
const lines = page.split("\n");

const modIdx = lines.findIndex((l) => l.includes('type="module"') && l.includes("brivora_queries"));
if (modIdx !== -1) {
  // already wired: replace the module script line with the fresh build
  lines[modIdx] = "      " + moduleTag;
  fs.writeFileSync(file, lines.join("\n"));
  console.log("updated contact module script in " + file);
  process.exit(0);
}

const idx = lines.findIndex((l) => l.trim() === "<>");
if (idx === -1) throw new Error(file + ": could not find <> fragment opening");
lines.splice(idx + 1, 0, "      " + guard, "      " + moduleTag);
fs.writeFileSync(file, lines.join("\n"));
console.log("wired contact form in " + file + " (guard + module script)");
