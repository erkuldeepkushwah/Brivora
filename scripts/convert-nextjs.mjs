// Convert Brivora/altes/*.html pages into real Next.js App Router TSX pages.
// Usage: node scripts/convert-nextjs.mjs
import { parse } from "parse5";
import fs from "node:fs";
import path from "node:path";

const SRC = "Brivora/altes";
const PAGES = [
  { file: "home.html", dir: "app", name: "Home" },
  { file: "about.html", dir: "app/about", name: "About" },
  { file: "blog.html", dir: "app/blog", name: "Blog" },
  { file: "contact.html", dir: "app/contact", name: "Contact" },
  { file: "course.html", dir: "app/course", name: "Course" },
  { file: "login.html", dir: "app/login", name: "Login" },
  { file: "logs.html", dir: "app/logs", name: "Logs" },
  { file: "service.html", dir: "app/service", name: "Service" },
  { file: "case-studies.html", dir: "app/case-studies", name: "CaseStudies" },
];

const ATTR_MAP = {
  class: "className", for: "htmlFor", srcset: "srcSet",
  "accept-charset": "acceptCharset", "http-equiv": "httpEquiv",
  maxlength: "maxLength", minlength: "minLength",
  autocomplete: "autoComplete", autofocus: "autoFocus",
  tabindex: "tabIndex", readonly: "readOnly", enctype: "encType",
  novalidate: "noValidate", datetime: "dateTime",
  contenteditable: "contentEditable", crossorigin: "crossOrigin",
  referrerpolicy: "referrerPolicy", playsinline: "playsInline",
  allowfullscreen: "allowFullScreen", formaction: "formAction",
  accesskey: "accessKey", colspan: "colSpan", rowspan: "rowSpan",
  cellpadding: "cellPadding", cellspacing: "cellSpacing",
  frameborder: "frameBorder", usemap: "useMap",
  viewbox: "viewBox", "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray", "stroke-dashoffset": "strokeDashoffset",
  "stroke-miterlimit": "strokeMiterlimit",
  "fill-opacity": "fillOpacity", "stroke-opacity": "strokeOpacity",
  "fill-rule": "fillRule", "clip-path": "clipPath", "clip-rule": "clipRule",
  "stop-color": "stopColor", "stop-opacity": "stopOpacity",
  "text-anchor": "textAnchor", "dominant-baseline": "dominantBaseline",
  "font-family": "fontFamily", "font-size": "fontSize",
  "letter-spacing": "letterSpacing", "text-rendering": "textRendering",
  "shape-rendering": "shapeRendering", "paint-order": "paintOrder",
  fetchpriority: "fetchPriority", popovertarget: "popoverTarget",
  popovertargetaction: "popoverTargetAction",
};

const BOOL_ATTRS = new Set([
  "async", "defer", "checked", "disabled", "selected", "multiple",
  "readonly", "hidden", "autoplay", "controls", "loop", "muted",
  "required", "open", "novalidate", "autofocus", "itemscope",
  "default", "reversed", "ismap", "nomodule", "playsinline",
]);

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function styleToObject(css) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of css) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  const map = new Map();
  for (const p of parts) {
    const i = p.indexOf(":");
    if (i < 0) continue;
    const k = p.slice(0, i).trim().toLowerCase();
    const v = p.slice(i + 1).trim();
    if (!k || !v) continue;
    let keyStr;
    if (k.startsWith("--")) {
      keyStr = JSON.stringify(k);
    } else {
      const c = k.replace(/-([a-z])/g, (m, ch) => ch.toUpperCase());
      keyStr = /^[a-zA-Z_$][\w$]*$/.test(c) ? c : JSON.stringify(c);
    }
    map.set(keyStr, JSON.stringify(v));
  }
  return Array.from(map).map(([k, v]) => `${k}: ${v}`).join(", ");
}

function jsxText(t) {
  const escaped = t
    .replace(/\r/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
  return "{`" + escaped + "`}";
}

function jsxAttrValue(v) {
  if(/["'\\\n\r]/.test(v)) return `{${JSON.stringify(v)}}`;
  return JSON.stringify(v);
}

const NUM_ATTRS = new Set([
  "size", "maxLength", "minLength", "rows", "cols", "span",
  "colSpan", "rowSpan", "start", "tabIndex",
]);

function attrsToJsx(node, tagName) {
  const out = [];
  const seen = new Set();
  for (const { name, value } of node.attrs) {
    if (/^on[a-z]+$/i.test(name)) {
      out.push(`data-h-${name.slice(2).toLowerCase()}=${JSON.stringify(value ?? "")}`);
      continue;
    }
    let n = ATTR_MAP[name] || name;
    if (n === "key" || n === "ref" || !/^[a-zA-Z_$][\w$-]*$/.test(n)) n = "data-" + n;
    if (seen.has(n)) continue;
    seen.add(n);
    if (tagName === "script" && n === "fetchPriority") continue;
    if (n === "style" && value) { out.push(`style={{ ${styleToObject(value)} } as CSSProperties}`); continue; }
    if (NUM_ATTRS.has(n) && /^-?\d+$/.test(value)) { out.push(`${n}={${value}}`); continue; }
    if (value === null || value === undefined || BOOL_ATTRS.has(name)) { out.push(n); continue; }
    if (value === "") { out.push(`${n}=""`); continue; }
    out.push(`${n}=${jsxAttrValue(value)}`);
  }
  return out.join(" ");
}

function pad(d) { return "  ".repeat(d); }

function renderNode(node, out, d) {
  if (node.nodeName === "#text") {
    const v = node.value.replace(/\r/g, "");
    if (v.length) out.push(`${pad(d)}${jsxText(v)}`);
    return;
  }
  if (node.nodeName === "#comment" || node.nodeName === "#documentType") return;
  const tag = node.tagName;
  if (!tag) return;
  const attrs = attrsToJsx(node, tag);
  const open = attrs ? `<${tag} ${attrs}` : `<${tag}`;

  if (tag === "script") {
    const src = node.attrs.find((a) => a.name === "src");
    if (src) {
      out.push(`${pad(d)}${open} />`);
    } else {
      const code = (node.childNodes || [])
        .filter((c) => c.nodeName === "#text")
        .map((c) => c.value)
        .join("");
      out.push(`${pad(d)}<script dangerouslySetInnerHTML={{ __html: ${JSON.stringify(code)} }} />`);
    }
    return;
  }
  if (tag === "style") {
    const code = (node.childNodes || [])
      .filter((c) => c.nodeName === "#text")
      .map((c) => c.value)
      .join("");
    out.push(`${pad(d)}<style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(code)} }} />`);
    return;
  }

  if (VOID.has(tag)) { out.push(`${pad(d)}${open} />`); return; }
  const children = (node.childNodes || []).filter(
    (c) => !(c.nodeName === "#text" && !c.value.replace(/\s/g, "").length)
  );
  if (children.length === 0) { out.push(`${pad(d)}${open}></${tag}>`); return; }
  out.push(`${pad(d)}${open}>`);
  for (const c of children) renderNode(c, out, d + 1);
  out.push(`${pad(d)}</${tag}>`);
}

function findChild(node, name) {
  return (node.childNodes || []).find((c) => c.nodeName === name);
}

function convert(page) {
  const html = fs.readFileSync(path.join(SRC, page.file), "utf8");
  const doc = parse(html);
  const htmlEl = findChild(doc, "html");
  const head = findChild(htmlEl, "head");
  const body = findChild(htmlEl, "body");

  const headNodes = [];
  let title = "Brivora";
  for (const c of head.childNodes || []) {
    if (c.nodeName === "#comment" || c.nodeName === "#text") continue;
    if (c.tagName === "title") {
      title = (c.childNodes || []).filter((n) => n.nodeName === "#text").map((n) => n.value).join("").trim() || title;
      continue;
    }
    if (c.tagName === "script" || c.tagName === "style" || c.tagName === "link") {
      const out = [];
      renderNode(c, out, 0);
      headNodes.push(out.join("\n"));
    }
  }

  const bodyMarkup = [];
  for (const c of body.childNodes || []) renderNode(c, bodyMarkup, 0);

  const lines = [];
  lines.push(`import type { CSSProperties } from "react";`);
  lines.push(``);
  lines.push(`export const metadata = { title: ${JSON.stringify(title)} };`);
  lines.push("");
  lines.push(`export default function ${page.name}Page() {`);
  lines.push("  return (");
  lines.push("    <>");
  for (const n of headNodes) lines.push("      " + n);
  for (const n of bodyMarkup) lines.push("      " + n);
  lines.push("    </>");
  lines.push("  );");
  lines.push("}");
  return lines.join("\n") + "\n";
}

for (const page of PAGES) {
  const dest = path.join(page.dir, "page.tsx");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, convert(page));
  console.log(`wrote ${dest} (${fs.statSync(dest).size} bytes)`);
}
console.log("done");
