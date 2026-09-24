// Rebuild the student portal at /user/ (formerly /dashboard/) + sub-routes
// (/user/courses, profile, expert, certificates, settings). Legacy /dashboard/
// URLs get lightweight redirect pages to the matching /user/ route.
// Usage: node scripts/build-dashboard-v2.mjs
import fs from "node:fs";
import { writeSubPage } from "./subpages.mjs";

const read = (p) => fs.readFileSync(p, "utf8").trim();
const css = read("scripts/templates/dashboard-v2.css") + `

/* pay button lock icon + arrow (payment page design) */
.bv-pp-pay::before { content: "\\1F512 "; }
.bv-pp-pay::after { content: " \\2192"; }

/* Payment renders as a full page inside the dashboard (sidebar + header + footer stay visible) */
#pay-modal-bg { position: static; inset: auto; padding: 0; background: none; z-index: auto; }
#pay-modal-bg.open { display: block; }
#pay-modal-bg .bv-paypage { max-width: 100%; max-height: none; overflow: visible; box-shadow: 0 1px 3px rgba(2,6,23,.08); border: 1px solid #e8edf5; }
`;
// Payment page design tweaks (1000092506): step text, timer label, close
// button, heading, UTR label/placeholder.
const html = [
  ['<span>3&nbsp; Instant LMS Access</span>', '<span>3&nbsp; Instant Access</span>'],
  ['SESSION TIMEOUT <b id="py-timer">05:00</b>', '\u23f1 TIME <b id="py-timer">05:00</b>'],
  ['<button class="bv-btn" id="py-close" type="button">Close</button>', '<button class="bv-btn" id="py-close" type="button">\u2715 Close</button>'],
  ['<h3>Complete your enrollment</h3>', '<h3>Complete your Payment</h3>'],
  ['UTR / Transaction Reference Number (12&ndash;15 digits)', 'UTR / Transaction Reference Number (Last 6 digits)'],
  ['placeholder="Payment ka UTR number likhein"', 'placeholder="Enter 6 or 12 digit UTR / Ref Number"'],
  ['<p>Payment method chunein, payment karne ke baad UTR number enter karke Pay dabayein.</p>', ''],
  ['QR code set nahi hai.<br />Admin: Settings → Payment Settings me QR URL daalein.', ''],
].reduce(function (acc, p) { return acc.split(p[0]).join(p[1]); }, read("scripts/templates/dashboard-v2.html"));
const js = [
  ["if(utr.length<12||utr.length>15){say('UTR number 12 se 15 digit ka hona chahiye.');return;}", "if(utr.length!==6&&utr.length!==12){say('UTR number 6 ya 12 digit ka hona chahiye.');return;}"],
  ["'You are not enrolled in any program yet. Browse our courses below and enroll to start learning.'", "''"],
  ["box.innerHTML = '<div class=\"bv-empty\">' + (l.length ? 'No courses in this filter yet.' : 'You have not enrolled in any course yet. Scroll down to Browse Courses and click Enroll.') + '</div>';", "box.innerHTML = l.length ? '<div class=\"bv-empty\">No courses in this filter yet.</div>' : '';"],
  ["PAYCFG.bank||'(Bank details set nahi hain)'", "PAYCFG.bank||''"],
  ["PAYCFG.upi||'(UPI ID set nahi hai)'", "PAYCFG.upi||''"],
].reduce(function (acc, p) { return acc.split(p[0]).join(p[1]); }, read("scripts/templates/dashboard-rtdb.js")) + `

// ===== Payment page renders full-screen inside the dashboard =====
// The pay modal is moved into .bv-content; while it is open every other
// content section is hidden so sidebar + header + footer frame the page.
(function(){
  var bg=document.getElementById('pay-modal-bg');
  var content=document.querySelector('.bv-content');
  if(!bg||!content)return;
  content.appendChild(bg);
  var mo=new MutationObserver(function(){
    var open=bg.classList.contains('open');
    Array.prototype.forEach.call(content.children,function(el){
      if(el===bg)return;
      el.style.display=open?'none':'';
    });
    if(open)window.scrollTo({top:0});
  });
  mo.observe(bg,{attributes:true,attributeFilter:['class']});
})();

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
