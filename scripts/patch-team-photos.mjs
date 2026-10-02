// Replace the About-page team section's stock template photos (the7.io) with
// the site's own optimized team images (public/team-*.jpg, generated in CI).
// Also migrates pages that still point at the raw public/ images.
// Idempotent: re-runs are no-ops.
// Usage: node scripts/patch-team-photos.mjs
import fs from "node:fs";

const F = "app/about/page.tsx";
let s = fs.readFileSync(F, "utf8");

const base = "https://the7.io/fse-business/wp-content/uploads/sites/133/2024/09/";
// team member order in the About scroller -> optimized local image
const map = {
  "t-img011": "/team-1.jpg",
  "t-img009": "/team-2.jpg",
  "t-img018": "/team-3.jpg",
  "t-img007": "/team-4.jpg",
  "t-img003": "/team-5.jpg",
  "t-img001": "/team-6.jpg",
};
// pages already migrated to the raw public/ paths
const alias = {
  "/1.jpeg": "/team-1.jpg",
  "/2.jpeg": "/team-2.jpg",
  "/3.jpeg": "/team-3.jpg",
  "/4.jpeg": "/team-4.jpg",
  "/8.png": "/team-5.jpg",
  "/9.png": "/team-6.jpg",
};

const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const [oldp, newp] of Object.entries(alias)) {
  s = s.split('src="' + oldp + '"').join('src="' + newp + '"');
}

for (const [name, local] of Object.entries(map)) {
  // 1) drop the srcSet attribute for this image (its size variants no longer apply)
  s = s.replace(new RegExp(' srcSet="' + esc(base) + name + '[^"]*"', "g"), "");
  // 2) point the src (and any leftover variant) at the local image
  s = s.replace(new RegExp(esc(base) + name + "-\\d+x\\d+\\.jpg", "g"), local);
  s = s.replace(new RegExp(esc(base) + name + "\\.jpg", "g"), local);
}

fs.writeFileSync(F, s);
console.log("team photos patched");
