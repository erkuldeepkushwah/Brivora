// Patch the home-page hero:
//  1) use the site's own image (public/hero.webp) instead of the7.io
//     art-hero-bus-side.webp
//  2) reduce the hero section's CSS height (min-height 70svh -> 50svh)
// Idempotent: re-runs are no-ops.
// Usage: node scripts/patch-hero-image.mjs
import fs from "node:fs";

const F = "app/page.tsx";
let s = fs.readFileSync(F, "utf8");

const heroSrc =
  "https://the7.io/fse-business/wp-content/uploads/sites/133/2026/02/art-hero-bus-side.webp";

// 1) drop the srcSet attribute (its the7.io size variants no longer apply)
s = s.replace(/ srcSet="https:\/\/the7\.io\/[^"]*art-hero-bus-side[^"]*"/g, "");
// 2) point the src at the local hero image
s = s.split('src="' + heroSrc + '"').join('src="/hero.webp"');
// 3) reduce the hero section CSS height
s = s.split('minHeight: "70svh"').join('minHeight: "50svh"');

fs.writeFileSync(F, s);
console.log("hero patched");
