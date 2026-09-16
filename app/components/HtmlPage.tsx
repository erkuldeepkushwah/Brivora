"use client";

import { useEffect, useMemo } from "react";

/**
 * Renders a raw single-file HTML page inside a Next.js app.
 * - <style> blocks from the original page are injected as-is
 * - external stylesheets from <head> are re-attached
 * - the <body> markup is rendered via dangerouslySetInnerHTML
 * - inline scripts are re-executed after mount (theme interactions)
 * - /nav-links.js (link rewriting + Brivora logo branding) is applied
 */
type Parsed = { css: string; links: string[]; body: string; scripts: string[] };

function parseHtml(raw: string): Parsed {
  const styles = Array.from(raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)).map((m) => m[1]);
  const links = Array.from(raw.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/g)).map((m) => m[0]);
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : raw;
  const scripts: string[] = [];
  body = body.replace(
    /<script([^>]*)>([\s\S]*?)<\/script>/g,
    (whole: string, attrs: string, code: string) => {
      if (attrs.includes("src=") || attrs.includes('type="speculationrules"')) return whole;
      scripts.push(code);
      return "";
    }
  );
  return { css: styles.join("\n"), links, body, scripts };
}

export default function HtmlPage({ html }: { html: string }) {
  const { css, links, body, scripts } = useMemo(() => parseHtml(html), [html]);

  useEffect(() => {
    for (const code of scripts) {
      try {
        new Function(code)();
      } catch {
        // theme scripts that depend on missing browser APIs are ignored
      }
    }
    fetch("/nav-links.js")
      .then((r) => r.text())
      .then((code) => {
        try {
          new Function(code)();
        } catch {
          // ignore
        }
      })
      .catch(() => {});
  }, [scripts]);

  return (
    <>
      {links.map((l, i) => (
        <div key={`l${i}`} dangerouslySetInnerHTML={{ __html: l }} />
      ))}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
