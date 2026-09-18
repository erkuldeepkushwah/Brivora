// 1. Contact page: visible heading "Contact 1" -> "Contact"
// 2. Make phone numbers and emails tappable links (tel: / mailto:) on every page
// 3. Blog cards on home + blog page: dead external the7.io article links -> /contact
// Usage: node scripts/fix-blog-contact-clicks.mjs
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

const TEL = '<a style={{ color: "inherit" }} href="tel:+917898692133">';
const MAIL = '<a style={{ color: "inherit" }} href="mailto:brivora@gmail.com">';

for (const file of PAGES) {
  let s = fs.readFileSync(file, "utf8");

  // phone with leading space (header menu "Call:" + footer)
  const p1 = "{` +91-78986-92133`}";
  if (!s.includes(p1)) throw new Error(file + ": not found: phone-with-space");
  s = s.split(p1).join(TEL + p1 + "</a>");

  // email
  const e1 = "{`brivora@gmail.com`}";
  if (!s.includes(e1)) throw new Error(file + ": not found: email");
  s = s.split(e1).join(MAIL + e1 + "</a>");

  fs.writeFileSync(file, s);
  console.log("links wrapped: " + file);
}

// contact page extras: big card phone (no space) + "Contact 1" heading
{
  const file = "app/contact/page.tsx";
  let s = fs.readFileSync(file, "utf8");
  const p2 = "{`+91-78986-92133`}";
  if (!s.includes(p2)) throw new Error(file + ": not found: phone-card");
  s = s.split(p2).join(TEL + p2 + "</a>");
  const h1 = "{`Contact 1`}";
  if (!s.includes(h1)) throw new Error(file + ": not found: Contact 1 heading");
  s = s.split(h1).join("{`Contact`}");
  fs.writeFileSync(file, s);
  console.log("contact page: card phone wrapped, heading fixed");
}

// blog article links (the7.io date URLs) -> /contact
const RX = /href="https:\/\/the7\.io\/fse-business\/[0-9][^"]*"/g;
for (const file of ["app/page.tsx", "app/blog/page.tsx"]) {
  let s = fs.readFileSync(file, "utf8");
  const n = (s.match(RX) || []).length;
  if (n === 0) throw new Error(file + ": no blog article links found");
  s = s.replace(RX, 'href="/contact"');
  fs.writeFileSync(file, s);
  console.log(file + ": " + n + " blog card links -> /contact");
}
