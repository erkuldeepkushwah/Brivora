// Rebuild app/dashboard/page.tsx as the student EdTech portal (v2 design).
// Logic = scripts/templates/dashboard-rtdb.js (Firebase Auth + RTDB enrollments).
// Usage: node scripts/build-dashboard-v2.mjs
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8").trim();
const css = read("scripts/templates/dashboard-v2.css");
const html = read("scripts/templates/dashboard-v2.html");
const js = read("scripts/templates/dashboard-rtdb.js");

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
fs.writeFileSync("app/dashboard/page.tsx", out);
console.log("written app/dashboard/page.tsx (" + out.length + " bytes)");
