// Update contact details on every page:
//   phone   +1-001-234-5678          -> +91-78986-92133
//   email   info@mywebsite.com       -> brivora@gmail.com
//   address 100 Business Plaza...    -> 12 Vijay Nagar, Indore, Madhya Pradesh
// Usage: node scripts/update-contact-info.mjs
import fs from "node:fs";

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

const RULES = [
  ["+1-001-234-5678", "+91-78986-92133"],
  ["info@mywebsite.com", "brivora@gmail.com"],
  ["100 Business Plaza, Suite 200", "12 Vijay Nagar"],
  ["New Rochelle, NY 10801", "Indore, Madhya Pradesh"],
];

for (const file of PAGES) {
  let s = fs.readFileSync(file, "utf8");
  for (const [from, to] of RULES) {
    const n = s.split(from).length - 1;
    if (n === 0) throw new Error(file + ": not found: " + from);
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
  console.log("updated " + file);
}

// post-check: no demo contact info left anywhere
for (const file of PAGES) {
  const s = fs.readFileSync(file, "utf8");
  for (const [from] of RULES) {
    if (s.includes(from)) throw new Error("post-check failed in " + file + ": " + from);
  }
}
console.log("post-check OK: contact info updated on " + PAGES.length + " pages");
