// Wires the public Courses page to Firebase RTDB (brivora_courses).
// Replaces the static course query-loop cards in app/course/page.tsx with a
// dynamic grid + module script. Idempotent + updates in place.
import fs from "node:fs";

const file = "app/course/page.tsx";
const js = fs.readFileSync("scripts/templates/course-page.js", "utf8").trim();
const css = fs.readFileSync("scripts/templates/course-page.css", "utf8").trim();

const block = `{/* BRIVORA-COURSES-START */}
            <div className="brivora-course-grid" id="brivora-courses">
              <div className="bvc-empty">Loading courses…</div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(css)} }} />
            <script type="module" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(js)} }} />
            {/* BRIVORA-COURSES-END */}`;

let page = fs.readFileSync(file, "utf8");

const startMark = "{/* BRIVORA-COURSES-START */}";
const endMark = "{/* BRIVORA-COURSES-END */}";
const sIdx = page.indexOf(startMark);
if (sIdx !== -1) {
  const eIdx = page.indexOf(endMark);
  if (eIdx === -1) throw new Error(file + ": found start marker but no end marker");
  page = page.slice(0, sIdx) + block + page.slice(eIdx + endMark.length).replace(/^\s*\n/, "\n");
  fs.writeFileSync(file, page);
  console.log("updated brivora courses block in " + file);
  process.exit(0);
}

const queryOpen = '<div className="wp-block-query alignwide is-layout-flow wp-block-query-is-layout-flow">';
const qIdx = page.indexOf(queryOpen);
if (qIdx === -1) throw new Error(file + ": could not find the static course query loop");

const endAnchor = '<div className="wp-block-group alignwide has-bbe-neutral-100-background-color';
const eIdx = page.indexOf(endAnchor, qIdx);
if (eIdx === -1) throw new Error(file + ": could not find the section after the course cards");

page = page.slice(0, qIdx) + block + "\n            " + page.slice(eIdx);
fs.writeFileSync(file, page);
console.log("wired brivora courses grid in " + file + " (replaced " + (eIdx - qIdx) + " chars of static cards)");
