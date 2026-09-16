const fs = require("fs");
const path = require("path");
const parse5 = require("parse5");

const pages = {
  About: "About our company",
  Blog: "Blog",
  Contact: "Contact",
  Course: "Courses",
  Home: "Brivora",
  Login: "Login",
  Logs: "Logos",
  Service: "Our services",
  Studies: "Case studies",
};

const ATTR_MAP = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  colspan: "colSpan",
  rowspan: "rowSpan",
  maxlength: "maxLength",
  minlength: "minLength",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  autoplay: "autoPlay",
  srcset: "srcSet",
  crossorigin: "crossOrigin",
  datetime: "dateTime",
  enctype: "encType",
  novalidate: "noValidate",
  spellcheck: "spellCheck",
  contenteditable: "contentEditable",
  accesskey: "accessKey",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  allowfullscreen: "allowFullScreen",
  usemap: "useMap",
  frameborder: "frameBorder",
  fetchpriority: "fetchPriority",
};

const BOOLEAN_ATTRS = new Set([
  "required", "disabled", "checked", "selected", "readonly", "multiple",
  "autofocus", "hidden", "novalidate", "autoplay", "loop", "muted",
  "controls", "open", "default", "reversed", "playsinline", "itemscope",
]);

const NUMERIC_ATTRS = new Set([
  "tabIndex", "colSpan", "rowSpan", "span", "size",
  "cols", "rows", "maxLength", "minLength",
]);

const DROP_ATTRS = new Set(["popovertarget", "popovertargetaction", "popover"]);

const RAW_TEXT_OK = /^[^<>{}]*$/;

function camelCaseCss(key) {
  return key
    .split("-")
    .filter(Boolean)
    .map((seg, i) => (i === 0 ? seg : seg[0].toUpperCase() + seg.slice(1)))
    .join("");
}

function styleToObject(styleStr) {
  const decls = styleStr.split(";");
  const map = new Map();
  for (const d of decls) {
    const idx = d.indexOf(":");
    if (idx === -1) continue;
    const prop = d.slice(0, idx).trim();
    const val = d.slice(idx + 1).trim();
    if (!prop || !val) continue;
    if (prop.startsWith("--")) {
      map.set(JSON.stringify(prop), JSON.stringify(val));
    } else {
      map.set(camelCaseCss(prop), JSON.stringify(val));
    }
  }
  if (map.size === 0) return null;
  const parts = [];
  for (const [k, v] of map) parts.push(`${k}: ${v}`);
  return `{ ${parts.join(", ")} }`;
}

function escComment(s) {
  return s.replace(/\*\//g, "* /");
}

function textNode(s, inPre) {
  if (s === "") return null;
  if (inPre) return `{${JSON.stringify(s)}}`;
  if (/^\s+$/.test(s)) return `{" "}`;
  if (
    RAW_TEXT_OK.test(s) &&
    !/^[\s]/.test(s) &&
    !/[\s]$/.test(s) &&
    !/`/.test(s)
  ) {
    return s;
  }
  return `{${JSON.stringify(s)}}`;
}

function emitNode(node, indent, inPre, ctx) {
  if (node.nodeName === "#text") {
    return textNode(node.value, inPre);
  }
  if (node.nodeName === "#comment") {
    return `{/* ${escComment(node.data || "")} */}`;
  }
  if (node.nodeName === "#documentType") return null;
  if (node.tagName === "script") return null; // extracted elsewhere
  if (node.tagName === "style") return null; // extracted elsewhere
  if (node.tagName === "template") {
    return null; // inert templates are dropped
  }
  if (node.nodeName === "#document-fragment") {
    return emitChildren(node, indent, inPre, ctx);
  }
  // regular element
  const tag = node.tagName;
  const attrs = node.attrs || [];
  const weird = [];
  const attrParts = [];
  const handlers = [];
  for (const a of attrs) {
    let name = a.name;
    let value = a.value;
    if (DROP_ATTRS.has(name)) continue;
    if (/^on[a-z]+$/.test(name)) {
      // inline event handler -> delegated via data- attribute
      handlers.push([name, value]);
      continue;
    }
    if (name in ATTR_MAP) name = ATTR_MAP[name];
    if (BOOLEAN_ATTRS.has(name) || BOOLEAN_ATTRS.has(a.name)) {
      if (value === "" || value === null || value === a.name || value === name) {
        attrParts.push(`${name}={true}`);
        continue;
      }
    }
    if (NUMERIC_ATTRS.has(name) && /^-?\d+$/.test(value)) {
      attrParts.push(`${name}={${value}}`);
      continue;
    }
    if (name === "style") {
      const obj = styleToObject(value);
      if (obj) attrParts.push(`style={${obj} as CSSProperties}`);
      continue;
    }
    if (value === null) {
      attrParts.push(`${name}={true}`);
      continue;
    }
    if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)) {
      weird.push([name, value]);
      continue;
    }
    attrParts.push(`${name}={${JSON.stringify(value)}}`);
  }
  if (handlers.length) {
    attrParts.push(`data-hc={${JSON.stringify(handlers)}}`);
  }
  const preNow = inPre || tag === "pre" || tag === "textarea";
  const children = node.childNodes || [];
  const childOut = [];
  for (const c of children) {
    const out = emitNode(c, indent + "  ", preNow, ctx);
    if (out !== null && out !== "") childOut.push(out);
  }
  const hasChildren = childOut.length > 0;
  const weirdPart = weird.length
    ? `{...${JSON.stringify(Object.fromEntries(weird))}}`
    : "";
  const attrStr =
    [weirdPart, ...attrParts].filter(Boolean).join(" ") +
    (attrParts.length + weird.length ? " " : "");
  if (!hasChildren) {
    return `<${tag} ${attrStr}/>`;
  }
  // single short text child -> keep on one line
  if (childOut.length === 1 && !childOut[0].startsWith("<") && childOut[0].length < 120) {
    return `<${tag} ${attrStr}>${childOut[0]}</${tag}>`;
  }
  const inner = childOut
    .map((c) =>
      c.startsWith("<")
        ? c
            .split("\n")
            .map((l) => (l.trim() ? indent + "  " + l.trim() : ""))
            .filter(Boolean)
            .join("\n")
        : indent + "  " + c
    )
    .join("\n");
  return `<${tag} ${attrStr}>\n${inner}\n${indent}</${tag}>`;
}

function emitChildren(node, indent, inPre, ctx) {
  const out = [];
  for (const c of node.childNodes || []) {
    const o = emitNode(c, indent, inPre, ctx);
    if (o !== null && o !== "") out.push(o);
  }
  if (out.length === 0) return null;
  return out.join("\n");
}

// walk to collect head stylesheets + all style blocks
function collect(doc) {
  const links = [];
  const cssParts = [];
  const scripts = [];
  const extScripts = [];
  const bodyStack = [];

  function walk(node, inBody) {
    if (node.nodeName === "#text") return;
    if (node.tagName === "link" && !inBody) {
      const rel = (node.attrs || []).find((a) => a.name === "rel");
      if (rel && String(rel.value).toLowerCase().trim() === "stylesheet") {
        const href = (node.attrs || []).find((a) => a.name === "href");
        if (href) links.push(href.value);
      }
      return;
    }
    if (node.tagName === "style") {
      const t = (node.childNodes || []).find((c) => c.nodeName === "#text");
      if (t) cssParts.push(t.value);
      return;
    }
    if (node.tagName === "script" && !inBody) return;
    if (node.tagName === "script" && inBody) {
      const src = (node.attrs || []).find((a) => a.name === "src");
      if (src) {
        extScripts.push(src.value);
      } else {
        const t = (node.childNodes || []).find((c) => c.nodeName === "#text");
        if (t && t.value.trim()) scripts.push(t.value);
      }
      return;
    }
    if (node.tagName === "body") {
      for (const c of node.childNodes || []) {
        const o = emitNode(c, "      ", false, null);
        if (o !== null && o !== "") bodyStack.push(o);
      }
      return;
    }
    for (const c of node.childNodes || []) walk(c, inBody);
  }
  walk(doc, false);
  return { links, cssParts, scripts, extScripts, bodyChildren: bodyStack };
}

const DELEGATE = `["click","focusin","focusout"].forEach(function(evName){document.addEventListener(evName,function(e){var el=e.target&&e.target.closest?e.target.closest("[data-hc]"):null;if(!el)return;var list;try{list=JSON.parse(el.getAttribute("data-hc"))}catch(err){return}for(var i=0;i<list.length;i++){var type=list[i][0],code=list[i][1];var fire=(type==="onclick"&&evName==="click")||(type==="onfocus"&&evName==="focusin")||(type==="onblur"&&evName==="focusout");if(fire){try{new Function("event",code).call(el,e)}catch(err2){}}}})});`;

function makePage(page, title, html) {
  const doc = parse5.parse(html);
  const { links, cssParts, scripts, extScripts, bodyChildren } = collect(doc);
  scripts.push(DELEGATE);

  const lines = [];
  lines.push(`import type { CSSProperties } from "react";`);
  lines.push(`import Script from "next/script";`);
  lines.push(``);
  lines.push(`export const metadata = { title: ${JSON.stringify(title)} };`);
  lines.push(``);
  lines.push(`const css = ${JSON.stringify(cssParts.join("\n"))};`);
  lines.push(``);
  lines.push(`const scripts: string[] = ${JSON.stringify(scripts)};`);
  lines.push(``);
  lines.push(`const externalScripts: string[] = ${JSON.stringify(extScripts)};`);
  lines.push(``);
  lines.push(`export default function ${page}Page() {`);
  lines.push(`  return (`);
  lines.push(`    <>`);
  for (const l of links) {
    lines.push(`      <link rel="stylesheet" href={${JSON.stringify(l)}} />`);
  }
  lines.push(`      <style dangerouslySetInnerHTML={{ __html: css }} />`);
  lines.push(...bodyChildren.map((c) => "      " + c));
  lines.push(`      <Script src="/nav-links.js" strategy="afterInteractive" />`);
  lines.push(`      {externalScripts.map((src) => (`);
  lines.push(`        <Script key={src} src={src} strategy="afterInteractive" />`);
  lines.push(`      ))}`);
  lines.push(`      {scripts.map((code, i) => (`);
  lines.push(`        <Script key={\`t\${i}\`} id={\`theme-script-\${i}\`} strategy="afterInteractive">`);
  lines.push(`          {code}`);
  lines.push(`        </Script>`);
  lines.push(`      ))}`);
  lines.push(`    </>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}

// main
for (const [page, title] of Object.entries(pages)) {
  const pagePath = path.join("app", page, "page.tsx");
  if (!fs.existsSync(pagePath)) {
    console.log(`skip ${page}`);
    continue;
  }
  const current = fs.readFileSync(pagePath, "utf8");
  const m = current.match(/const html = (".*");/);
  if (!m) {
    console.log(`skip ${page} (no embedded html)`);
    continue;
  }
  const html = JSON.parse(m[1]);
  const tsx = makePage(page, title, html);
  fs.writeFileSync(pagePath, tsx);
  console.log(`converted ${page}: ${tsx.length} bytes, JSX body`);
}
console.log("done");
