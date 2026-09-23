// Shared helper: writes a sub-route page (e.g. app/admin/users/page.tsx) from
// the same dashboard/admin template pieces as the parent page.
// Differences from the parent page (which lives at URL depth 1):
//   - the module JS imports ../fb/... -> ../../fb/... (sub-routes are depth 2)
//   - footer anchors using ../ are rewritten to absolute at runtime
//   - after load, the given sidebar buttons are clicked in sequence so the
//     right section/subnav opens automatically on that URL.
import fs from "node:fs";

export function writeSubPage(dir, title, css, html, js, clicks) {
  const init =
    "(function () {\n" +
    "  var b = location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : '';\n" +
    "  Array.prototype.forEach.call(document.querySelectorAll('a[href^=\"../\"]'), function (a) {\n" +
    "    a.setAttribute('href', b + a.getAttribute('href').replace(/^(?:\\.\\.\\/)+/, '/'));\n" +
    "  });\n" +
    "  var steps = " + JSON.stringify(clicks) + ";\n" +
    "  var i = 0;\n" +
    "  function next() {\n" +
    "    if (i >= steps.length) return;\n" +
    "    var el = document.getElementById(steps[i]);\n" +
    "    i++;\n" +
    "    if (el) { el.click(); setTimeout(next, 350); }\n" +
    "    else { setTimeout(next, 250); }\n" +
    "  }\n" +
    "  setTimeout(next, 700);\n" +
    "})();";

  const out = `export const metadata = { title: ${JSON.stringify(title)} };

export default function Page() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(css)} }} />
      <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(html)} }} />
      <script type="module" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(js.replace(/\.\.\/fb\//g, "../../fb/"))} }} />
      <script dangerouslySetInnerHTML={{ __html: ${JSON.stringify(init)} }} />
    </>
  );
}
`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + "/page.tsx", out);
  console.log("written " + dir + "/page.tsx (" + out.length + " bytes)");
}
