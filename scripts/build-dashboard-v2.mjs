// Rebuild app/dashboard/page.tsx as the student EdTech portal (v2 design).
// Logic = scripts/templates/dashboard-rtdb.js (Firebase Auth + RTDB enrollments).
// Also emits sub-route pages (/dashboard/courses, profile, expert, certificates, settings).
// Usage: node scripts/build-dashboard-v2.mjs
import fs from "node:fs";
import { writeSubPage } from "./subpages.mjs";

const read = (p) => fs.readFileSync(p, "utf8").trim();
const css = read("scripts/templates/dashboard-v2.css");
const html = read("scripts/templates/dashboard-v2.html");
const js = read("scripts/templates/dashboard-rtdb.js") + `

// ===== URL ?pay= auto-open (for /checkout/?courseId=... entry point) =====
(function(){try{var q=new URLSearchParams(location.search).get('pay');if(!q)return;var tries=0;function t(){tries++;var el=document.querySelector('button[data-enroll="'+q+'"]');var bg=document.getElementById('pay-modal-bg');if(bg&&bg.classList.contains('open'))return;if(el){el.click();}else if(tries<40){setTimeout(t,250);}}setTimeout(t,1200);}catch(e){}})();
`;

const out = `export const metadata = { title: "Dashboard – Brivora" };

export default function DashboardPage() {
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
fs.mkdirSync("app/dashboard", { recursive: true });
fs.writeFileSync("app/dashboard/page.tsx", out);
console.log("written app/dashboard/page.tsx (" + out.length + " bytes)");

const SUBS = [
  ["app/dashboard/courses", "My Courses – Brivora", ["menu-mycourses"]],
  ["app/dashboard/profile", "Profile – Brivora", ["menu-profile"]],
  ["app/dashboard/expert", "Expert Chat – Brivora", ["menu-expert"]],
  ["app/dashboard/certificates", "Certificates – Brivora", ["menu-certs"]],
  ["app/dashboard/settings", "Settings – Brivora", ["menu-settings"]],
];
for (const [dir, title, clicks] of SUBS) writeSubPage(dir, title, css, html, js, clicks);
