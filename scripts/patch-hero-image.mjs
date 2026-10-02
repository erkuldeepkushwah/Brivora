// Replace the home-page hero image (the7.io art-hero-bus-side.webp) with the
// site's own image (public/hero.webp, generated in CI from public/6.png).
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

fs.writeFileSync(F, s);
console.log("hero image patched");
