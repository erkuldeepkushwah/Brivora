const DELEGATION = [
  "(function () {",
  "  var events = ['click','focus','blur','submit','mouseover','mouseout'];",
  "  events.forEach(function (ev) {",
  "    var capture = ev === 'focus' || ev === 'blur';",
  "    document.addEventListener(ev, function (e) {",
  "      var el = e.target;",
  "      while (el && el !== document) {",
  "        var code = el.getAttribute && el.getAttribute('data-h-' + ev);",
  "        if (code) {",
  "          try { new Function('event', code).call(el, e); } catch (err) { console.error(err); }",
  "        }",
  "        el = el.parentNode;",
  "      }",
  "    }, capture);",
  "  });",
  "})();",
].join("\n");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>
        {children}
        <script src="/nav-links.js" defer />
        <script dangerouslySetInnerHTML={{ __html: DELEGATION }} />
      </body>
    </html>
  );
}
