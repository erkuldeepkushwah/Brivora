// Rebuild app/admin/page.tsx as the Enterprise Admin Dashboard (v2 design):
// sidebar + header + stat cards + health bar + users table + modal, self-contained CSS.
// User management logic = scripts/templates/admin-rtdb-v2.js (Firebase Auth + RTDB, no backend).
// Also emits sub-route pages (/admin/users, /admin/courses, /admin/payments, /admin/settings).
// Usage: node scripts/build-admin-v2.mjs
import fs from "node:fs";
import { writeSubPage } from "./subpages.mjs";

const read = (p) => fs.readFileSync(p, "utf8").trim();
const css = read("scripts/templates/admin-v2.css");
const html = read("scripts/templates/admin-v2.html");
const js = read("scripts/templates/admin-rtdb-v2.js");

const out = `export const metadata = { title: "Admin – Brivora" };

export default function AdminPage() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(css)} }} />
      <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(html)} }} />
      <script type="module" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(js)} }} />
    </>
  );
}
`;
fs.writeFileSync("app/admin/page.tsx", out);
console.log("written app/admin/page.tsx (" + out.length + " bytes)");

const SUBS = [
  ["app/admin/users", "Users – Brivora", ["menu-users", "menu-users-manage"]],
  ["app/admin/courses", "Courses – Brivora", ["menu-courses", "menu-courses-manage"]],
  ["app/admin/payments", "Payments – Brivora", ["menu-payments", "menu-pay-requests"]],
  ["app/admin/settings", "Settings – Brivora", ["menu-payments", "menu-pay-settings"]],
];
for (const [dir, title, clicks] of SUBS) writeSubPage(dir, title, css, html, js, clicks);
