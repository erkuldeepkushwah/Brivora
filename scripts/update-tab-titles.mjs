// Finish rebranding: update browser tab titles (metadata) on the
// pages that still show the old demo name "Block Editor Business",
// and remove leftover demo RSS feed links pointing to the7.io.
// Usage: node scripts/update-tab-titles.mjs
import fs from "node:fs";

const RULES = {
  "app/services/page.tsx": [["Our services \u2013 Block Editor Business", "Our services \u2013 Brivora"]],
  "app/contact/page.tsx": [["Contact 1 \u2013 Block Editor Business", "Contact \u2013 Brivora"]],
  "app/login/page.tsx": [["Login \u2013 Block Editor Business", "Login \u2013 Brivora"]],
  "app/logs/page.tsx": [["Logos \u2013 Block Editor Business", "Logos \u2013 Brivora"]],
  "app/case-studies/page.tsx": [["Case studies 1 \u2013 Block Editor Business", "Case studies \u2013 Brivora"]],
};

for (const [file, rules] of Object.entries(RULES)) {
  let s = fs.readFileSync(file, "utf8");
  for (const [from, to] of rules) {
    if (!s.includes(from)) throw new Error(file + ": not found: " + from);
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
  console.log("updated " + file);
}

// also remove the leftover demo RSS feed links pointing to the7.io
const ALL = [
  "app/page.tsx",
  "app/about/page.tsx",
  "app/blog/page.tsx",
  "app/course/page.tsx",
  "app/services/page.tsx",
  "app/contact/page.tsx",
  "app/login/page.tsx",
  "app/logs/page.tsx",
  "app/case-studies/page.tsx",
];
const RSS1 = '      <link rel="alternate" type="application/rss+xml" title="Block Editor Business \u00bb Feed" href="https://the7.io/fse-business/feed/" />\n';
const RSS2 = '      <link rel="alternate" type="application/rss+xml" title="Block Editor Business \u00bb Comments Feed" href="https://the7.io/fse-business/comments/feed/" />\n';
for (const file of ALL) {
  let s = fs.readFileSync(file, "utf8");
  const before = s.length;
  s = s.split(RSS1).join("").split(RSS2).join("");
  if (s.length !== before) console.log("removed demo RSS links from " + file);
  fs.writeFileSync(file, s);
}

// post-check: no demo tab title or demo RSS link left anywhere
for (const file of ALL) {
  const s = fs.readFileSync(file, "utf8");
  if (s.includes("Block Editor Business")) throw new Error("post-check failed in " + file);
}
console.log("post-check OK: tab titles rebranded, demo RSS links removed");
