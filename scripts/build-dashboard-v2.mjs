// Rebuild the student portal at /user/ (formerly /dashboard/) + sub-routes
// (/user/courses, profile, expert, certificates, settings). Legacy /dashboard/
// URLs get lightweight redirect pages to the matching /user/ route.
// Usage: node scripts/build-dashboard-v2.mjs
import fs from "node:fs";
import { writeSubPage } from "./subpages.mjs";

const read = (p) => fs.readFileSync(p, "utf8").trim();
const css = read("scripts/templates/dashboard-v2.css");
const html = read("scripts/templates/dashboard-v2.html");
const js = read("scripts/templates/dashboard-rtdb.js") + `

// ===== URL ?pay= auto-open (for /checkout/?courseId=... entry point) =====
(function(){try{var q=new URLSearchParams(location.search).get('pay');if(!q)return;var tries=0;function t(){tries++;var el=document.querySelector('button[data-enroll="'+q+'"]');var bg=document.getElementById('pay-modal-bg');if(bg&&bg.classList.contains('open'))return;if(el){el.click();}else if(tries<40){setTimeout(t,250);}}setTimeout(t,1200);}catch(e){}})();

// ===== Sidebar buttons navigate to their /user/ routes =====
// Real user clicks (isTrusted) navigate; programmatic clicks from the
// sub-page auto-open logic (isTrusted=false) keep the default behaviour.
(function(){
  var b = location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : '';
  var MAP = {
    'menu-dashboard': '/user/',
    'menu-mycourses': '/user/courses/',
    'menu-expert': '/user/expert/',
    'menu-certs': '/user/certificates/',
    'menu-profile': '/user/profile/',
    'menu-settings': '/user/settings/'
  };
  Object.keys(MAP).forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click', function(e){
      if(!e.isTrusted) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      window.location.href = b + MAP[id];
    }, true);
  });
})();
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
fs.mkdirSync("app/user", { recursive: true });
fs.writeFileSync("app/user/page.tsx", out);
console.log("written app/user/page.tsx (" + out.length + " bytes)");

const SUBS = [
  ["courses", "My Courses – Brivora", ["menu-mycourses"]],
  ["profile", "Profile – Brivora", ["menu-profile"]],
  ["expert", "Expert Chat – Brivora", ["menu-expert"]],
  ["certificates", "Certificates – Brivora", ["menu-certs"]],
  ["settings", "Settings – Brivora", ["menu-settings"]],
];
for (const [sub, title, clicks] of SUBS) writeSubPage("app/user/" + sub, title, css, html, js, clicks);

// Legacy /dashboard/ URLs -> redirect to the matching /user/ route.
const redirect = (dest) =>
  'export const metadata = { title: "Redirecting… – Brivora" };\n' +
  "\n" +
  "export default function Page() {\n" +
  "  return (\n" +
  "    <>\n" +
  '      <div style={{ fontFamily: "Inter, Arial, sans-serif", color: "#64748b", padding: "48px 24px", textAlign: "center" }}>\n' +
  "        Redirecting to your dashboard…\n" +
  "      </div>\n" +
  '      <script dangerouslySetInnerHTML={{ __html: "(function(){var b=location.pathname.indexOf(\'/Brivora\')===0?\'/Brivora\':\'\';location.replace(b+\'' + dest + '\');})();" }} />\n' +
  "    </>\n" +
  "  );\n" +
  "}\n";

fs.mkdirSync("app/dashboard", { recursive: true });
fs.writeFileSync("app/dashboard/page.tsx", redirect("/user/"));
for (const [sub] of SUBS) {
  fs.mkdirSync("app/dashboard/" + sub, { recursive: true });
  fs.writeFileSync("app/dashboard/" + sub + "/page.tsx", redirect("/user/" + sub + "/"));
}
console.log("written legacy /dashboard/ redirect pages");
