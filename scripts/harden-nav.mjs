// Replace the per-button nav toggle with a bulletproof document-level capture
// delegation + init retry, so no external script (the7.io) or late DOM change
// can break the mobile hamburger on any page.
// Usage: node scripts/harden-nav.mjs
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

const NEW = '<script dangerouslySetInnerHTML={{ __html: "(function(){\\nfunction initBrivoraNav(){\\nvar modal=document.querySelector(\'.wp-block-navigation__responsive-container\');\\nif(!modal||modal.getAttribute(\'data-brivora-nav\'))return;\\nmodal.setAttribute(\'data-brivora-nav\',\'1\');\\nfunction openNav(){modal.classList.add(\'brivora-menu-open\');document.body.classList.add(\'brivora-nav-open\');}\\nfunction closeNav(){modal.classList.remove(\'brivora-menu-open\');document.body.classList.remove(\'brivora-nav-open\');}\\ndocument.addEventListener(\'click\',function(e){\\nvar t=e.target;\\nif(!t||t.nodeType!==1)return;\\nif(t.closest&&t.closest(\'.wp-block-navigation__responsive-container-open\')){e.preventDefault();e.stopPropagation();if(!modal.classList.contains(\'brivora-menu-open\'))openNav();return;}\\nif(t.closest&&t.closest(\'.wp-block-navigation-overlay-close\')){e.preventDefault();e.stopPropagation();closeNav();return;}\\nif(t===modal&&modal.classList.contains(\'brivora-menu-open\'))closeNav();\\n},true);\\ndocument.addEventListener(\'keydown\',function(e){if(e.key===\'Escape\')closeNav();});\\n}\\nif(document.readyState===\'loading\'){document.addEventListener(\'DOMContentLoaded\',initBrivoraNav);}else{initBrivoraNav();}\\nvar navTries=0;var navIv=setInterval(function(){var m=document.querySelector(\'.wp-block-navigation__responsive-container\');if(m&&!m.getAttribute(\'data-brivora-nav\'))initBrivoraNav();if(++navTries>10)clearInterval(navIv);},300);\\n})();\\n" }} />';

for (const file of PAGES) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const idx = lines.findIndex((l) => l.includes("function initBrivoraNav"));
  if (idx === -1) throw new Error(file + ": nav script line not found");
  const indent = lines[idx].match(/^\s*/)[0];
  lines[idx] = indent + NEW;
  fs.writeFileSync(file, lines.join("\n"));
  console.log("hardened: " + file + " (line " + (idx + 1) + ")");
}
