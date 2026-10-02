// Replace the About-page team section's stock template photos (the7.io) with
// the site's own images from the public/ folder. Idempotent: after the first
// run the the7.io t-img URLs are gone, so re-runs are no-ops.
// Usage: node scripts/patch-team-photos.mjs
import fs from "node:fs";

const F = "app/about/page.tsx";
let s = fs.readFileSync(F, "utf8");

const base = "https://the7.io/fse-business/wp-content/uploads/sites/133/2024/09/";
// team member order in the About scroller -> local image
const map = {
  "t-img011": "/1.jpeg",
  "t-img009": "/2.jpeg",
  "t-img018": "/3.jpeg",
  "t-img007": "/4.jpeg",
  "t-img003": "/8.png",
  "t-img001": "/9.png",
};

const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const [name, local] of Object.entries(map)) {
  // 1) drop the srcSet attribute for this image (its size variants no longer apply)
  s = s.replace(new RegExp(' srcSet="' + esc(base) + name + '[^"]*"', "g"), "");
  // 2) point the src (and any leftover variant) at the local image
  s = s.replace(new RegExp(esc(base) + name + "-\\d+x\\d+\\.jpg", "g"), local);
  s = s.replace(new RegExp(esc(base) + name + "\\.jpg", "g"), local);
}

fs.writeFileSync(F, s);
console.log("team photos patched");
