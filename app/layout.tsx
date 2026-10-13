import type { Metadata } from "next";

const SITE_URL = "https://brivora.pages.dev";
const SITE_DESC =
  "Brivora is an IT services company in Indore offering web development, mobile apps, UI/UX design, SEO, cloud & DevOps, and maintenance, along with IT certification courses for students and professionals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Brivora – IT Services & IT Courses in Indore", template: "%s" },
  description: SITE_DESC,
  applicationName: "Brivora",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/favicon.png", sizes: "512x512" }],
  },
  keywords: [
    "Brivora",
    "Brivora IT services",
    "IT services",
    "IT company in Indore",
    "web development",
    "mobile app development",
    "UI/UX design",
    "SEO",
    "cloud & DevOps",
    "IT courses",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Brivora",
    title: "Brivora – IT Services & IT Courses in Indore",
    description: SITE_DESC,
    url: "/",
    images: [{ url: "/logo.png", alt: "Brivora" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brivora – IT Services & IT Courses in Indore",
    description: SITE_DESC,
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

const JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "Brivora",
      url: SITE_URL + "/",
      logo: SITE_URL + "/logo.png",
      description: SITE_DESC,
      email: "brivora@gmail.com",
      telephone: "+91-78986-92133",
      address: {
        "@type": "PostalAddress",
        streetAddress: "12 Vijay Nagar",
        addressLocality: "Indore",
        addressRegion: "Madhya Pradesh",
        addressCountry: "IN",
      },
      areaServed: { "@type": "City", name: "Indore" },
      knowsAbout: [
        "Web development",
        "Mobile app development",
        "UI/UX design",
        "SEO & digital marketing",
        "Cloud & DevOps",
        "Maintenance & support",
        "IT courses",
      ],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL + "/",
      name: "Brivora",
      publisher: { "@id": SITE_URL + "/#organization" },
    },
  ],
});

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSONLD }}
        />
        <script src="/nav-links.js" defer />
        <script dangerouslySetInnerHTML={{ __html: DELEGATION }} />
      </body>
    </html>
  );
}
