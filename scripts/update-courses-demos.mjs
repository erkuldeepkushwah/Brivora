// 1. Remove The7 demo panel ("80 DEMOS" button + dialog) from every page
// 2. Replace course page cards with 8 Brivora courses
// Usage: node scripts/update-courses-demos.mjs
import fs from "node:fs";

// ---------- helpers ----------
function countOccurrences(s, sub) {
  return s.split(sub).length - 1;
}

function expectCount(s, sub, expected, file) {
  const c = countOccurrences(s, sub);
  if (c !== expected) {
    throw new Error(file + ": expected " + expected + " of '" + sub + "', found " + c);
  }
}

// ---------- 1. remove demo panel from all pages ----------
const PAGES = [
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

const PANEL_START = '      <button popoverTarget="demo-panel"';
const PANEL_END = "</dialog>";
const DEMOSTAND_SCRIPT = '      <script id="dt-demostand-public-js" src="https://the7.io/fse-business/wp-content/plugins/dt-demostand/assets/public.js?ver=4.1.0" />';
const DEMOSTAND_CSS = '      <link rel="stylesheet" id="dt-demostand-public-css" href="https://the7.io/fse-business/wp-content/plugins/dt-demostand/assets/public.css?ver=4.1.0" media="all" />';

for (const file of PAGES) {
  let s = fs.readFileSync(file, "utf8");
  expectCount(s, PANEL_START, 1, file);
  expectCount(s, PANEL_END, 1, file);
  const start = s.indexOf(PANEL_START);
  const end = s.indexOf(PANEL_END, start) + PANEL_END.length;
  s = s.slice(0, start) + s.slice(end);
  // remove the demostand script tag that powered the panel
  s = s.split(DEMOSTAND_SCRIPT + "\n").join("");
  // remove the demostand stylesheet (only styled the removed panel)
  s = s.split(DEMOSTAND_CSS + "\n").join("");
  fs.writeFileSync(file, s);
  console.log("removed demo panel from " + file);
}

// ---------- 2. course page: 8 courses ----------
// Cards live in 3 layout sections: A (3 cards), B (3 cards), C (2 cards).
// Section boundaries are identified by unique WP layout class hashes.
const F = "app/course/page.tsx";
let s = fs.readFileSync(F, "utf8");

const T1 = "60% growth in online sales";
const T2 = "Achieved full compliance across all locations";
const T3 = "40% improvement in team productivity";
const D1 = "A modern web platform helped Lumora Laser Technologies reach more customers, automate orders, and increase online sales. ";
const D2 = "Creating stronger digital oversight and greater operational control across Wander Wave Stores locations. ";
const D3 = "A custom mobile app helped Vertex Group Developments strengthen planning, forecasting, and project decisions. ";
const G1 = "Web development";
const G2 = "E-commerce solutions";
const G3 = "Mobile app development";

// whole-file sanity counts (T1/T2 also appear once as alt text in section A)
expectCount(s, T1, 4, F);
expectCount(s, T2, 4, F);
expectCount(s, T3, 3, F);
expectCount(s, D1, 3, F);
expectCount(s, D2, 3, F);
expectCount(s, D3, 2, F);
expectCount(s, G1, 3, F);
expectCount(s, G2, 3, F);
expectCount(s, G3, 2, F);

const aStart = s.indexOf('"columns-3 wp-block-post-template'); // section A grid
const bStart = s.indexOf('"alignwide wp-block-post-template');  // section B grid
const cStart = s.indexOf('"columns-2 wp-block-post-template');  // section C grid
const cEnd = s.indexOf("Pre-made layouts");
if (aStart === -1 || bStart === -1 || cStart === -1 || cEnd === -1 || !(aStart < bStart && bStart < cStart && cStart < cEnd)) {
  throw new Error(F + ": section markers not found or out of order");
}

function replaceAll(s, from, to) {
  return s.split(from).join(to);
}

// Section A - Full Stack Web Development, MERN Stack Development, Frontend Development
let a = s.slice(aStart, bStart);
a = replaceAll(a, T1, "Full Stack Web Development");
a = replaceAll(a, T2, "MERN Stack Development");
a = replaceAll(a, T3, "Frontend Development");
a = replaceAll(a, D1, "Master HTML, CSS, JavaScript, React, Node.js, and databases to build complete, production-ready web applications from start to finish. ");
a = replaceAll(a, D2, "Learn MongoDB, Express.js, React, and Node.js by building full-scale, real-world MERN applications step by step. ");
a = replaceAll(a, D3, "Create responsive, modern user interfaces with HTML, CSS, JavaScript, and modern frameworks like React. ");
a = replaceAll(a, G2, "Web development");
a = replaceAll(a, G3, "Web development"); // G1 already reads "Web development"

// Section B - Data Analytics, Artificial Intelligence, Cyber Security
let b = s.slice(bStart, cStart);
b = replaceAll(b, T1, "Data Analytics");
b = replaceAll(b, T2, "Artificial Intelligence");
b = replaceAll(b, T3, "Cyber Security");
b = replaceAll(b, D1, "Work with real datasets using Excel, SQL, Python, and Power BI to turn raw data into clear business insights. ");
b = replaceAll(b, D2, "Understand machine learning, deep learning, and modern AI tools by building practical, real-world projects. ");
b = replaceAll(b, D3, "Learn network security, ethical hacking, and threat analysis to protect systems, applications, and data. ");
b = replaceAll(b, G1, "Data & analytics");
b = replaceAll(b, G2, "AI & ML");
b = replaceAll(b, G3, "Security");

// Section C - SEO and Digital Marketing, UI/UX Design
let c = s.slice(cStart, cEnd);
c = replaceAll(c, T1, "SEO and Digital Marketing");
c = replaceAll(c, T2, "UI/UX Design");
c = replaceAll(c, D1, "Grow brands with SEO, social media, content marketing, and paid advertising strategies that deliver results. ");
c = replaceAll(c, D2, "Design clean, intuitive interfaces with user research, wireframing, and prototyping in Figma. ");
c = replaceAll(c, G1, "Marketing");
c = replaceAll(c, G2, "Design");

let tail = s.slice(cEnd).split("Pre-made layouts").join("Why learn with Brivora");

s = s.slice(0, aStart) + a + b + c + tail;
fs.writeFileSync(F, s);
console.log("updated " + F + " with 8 courses");

// post-check: every course in place, nothing stale
const t = fs.readFileSync(F, "utf8");
const NEW = [
  ["Full Stack Web Development", 2],
  ["MERN Stack Development", 2],
  ["Frontend Development", 2],
  ["Data Analytics", 1],
  ["Artificial Intelligence", 1],
  ["Cyber Security", 1],
  ["SEO and Digital Marketing", 1],
  ["UI/UX Design", 1],
];
for (const [name, n] of NEW) {
  const c = countOccurrences(t, name);
  if (c !== n) throw new Error("post-check failed: '" + name + "' found " + c + ", expected " + n);
}
for (const old of [T1, T2, T3, D1, D2, D3, G2, G3]) {
  if (t.includes(old)) throw new Error("post-check failed: leftover '" + old + "'");
}
console.log("post-check OK: 8 courses in place");
