// 1. Make the mobile hamburger menu work on every page (self-contained toggle, no external JS)
// 2. Point dead/external card links to real pages:
//    - home "Learn more"            -> /services
//    - services page "Learn more"   -> /contact
//    - course page card links/tags  -> /contact, /course
//    - case-studies card links/tags -> /contact, /case-studies
// Usage: node scripts/fix-nav-and-links.mjs
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

// ---- self-contained mobile navigation ----
const NAV_CSS = [
  "@media screen and (width <= 1100px){",
  ".wp-block-navigation__responsive-container-open{display:flex !important;}",
  ".wp-block-navigation__responsive-container{display:none !important;}",
  ".wp-block-navigation__responsive-container.brivora-menu-open{display:block !important;position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;width:100% !important;height:100% !important;max-height:100% !important;z-index:99999 !important;background:#ffffff !important;overflow-y:auto !important;padding:clamp(24px,7vw,64px) !important;}",
  ".wp-block-navigation__responsive-container.brivora-menu-open .wp-block-navigation__container{flex-direction:column !important;align-items:flex-start !important;flex-wrap:nowrap !important;gap:22px !important;}",
  ".wp-block-navigation__responsive-container.brivora-menu-open .wp-block-navigation__container a{font-size:18px !important;}",
  ".wp-block-navigation__responsive-container.brivora-menu-open .wp-block-navigation__overlay-container{display:block !important;position:fixed !important;top:14px !important;right:14px !important;left:auto !important;z-index:100000 !important;margin:0 !important;}",
  "body.brivora-nav-open{overflow:hidden !important;}",
  "}",
].join("\n");

const NAV_JS = [
  "(function(){",
  "function initBrivoraNav(){",
  "var open=document.querySelector('.wp-block-navigation__responsive-container-open');",
  "var modal=document.querySelector('.wp-block-navigation__responsive-container');",
  "if(!open||!modal||modal.getAttribute('data-brivora-nav'))return;",
  "modal.setAttribute('data-brivora-nav','1');",
  "var close=modal.querySelector('.wp-block-navigation-overlay-close');",
  "function openNav(){modal.classList.add('brivora-menu-open');document.body.classList.add('brivora-nav-open');}",
  "function closeNav(){modal.classList.remove('brivora-menu-open');document.body.classList.remove('brivora-nav-open');}",
  "open.addEventListener('click',openNav);",
  "if(close){close.addEventListener('click',function(e){e.preventDefault();closeNav();});}",
  "document.addEventListener('keydown',function(e){if(e.key==='Escape')closeNav();});",
  "modal.addEventListener('click',function(e){if(e.target===modal)closeNav();});",
  "}",
  "if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initBrivoraNav);}else{initBrivoraNav();}",
  "})();",
].join("\n");

let injected = 0;
for (const file of PAGES) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes("brivora-menu-open")) {
    const marker = "\n    </>";
    const idx = s.lastIndexOf(marker);
    if (idx === -1) throw new Error(file + ": closing fragment not found");
    const inject =
      '      <style dangerouslySetInnerHTML={{ __html: ' + JSON.stringify(NAV_CSS) + ' }} />\n' +
      '      <script dangerouslySetInnerHTML={{ __html: ' + JSON.stringify(NAV_JS) + ' }} />';
    s = s.slice(0, idx) + "\n" + inject + s.slice(idx);
    fs.writeFileSync(file, s);
    injected++;
  }
}
console.log("injected mobile nav into " + injected + " pages");

// ---- link fixes ----
const RX = (p) => new RegExp('href="https://the7\\.io/fse-business/' + p + '"', "g");

function fixFile(file, rules) {
  let s = fs.readFileSync(file, "utf8");
  for (const [pattern, to, min] of rules) {
    const matches = s.match(RX(pattern));
    const n = matches ? matches.length : 0;
    if (n < min) throw new Error(file + ": expected >= " + min + " matches for " + pattern + ", found " + n);
    s = s.replace(RX(pattern), 'href="' + to + '"');
    console.log(file + ": " + n + " links -> " + to);
  }
  fs.writeFileSync(file, s);
}

fixFile("app/page.tsx", [
  ["services/service\\d+/", "/services", 6],
]);

fixFile("app/services/page.tsx", [
  ["services/service\\d+/", "/contact", 6],
]);

fixFile("app/course/page.tsx", [
  ["case/case\\w+/", "/contact", 9],
  ["case_category/category-\\d+/", "/course", 8],
]);

fixFile("app/case-studies/page.tsx", [
  ["case/case\\w+/", "/contact", 14],
  ["case_category/category-\\d+/", "/case-studies", 12],
]);
