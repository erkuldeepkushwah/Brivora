import type { Metadata, Viewport } from "next";

const SITE_URL = "https://brivora.pages.dev";
const SITE_NAME = "Brivora";
const SITE_DESC =
  "Brivora is an IT services company in Indore offering web development, mobile apps, UI/UX design, SEO, cloud & DevOps, and maintenance, along with IT certification courses for students and professionals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Brivora – IT Services & IT Courses in Indore", template: "%s" },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  generator: "Next.js",
  category: "technology",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-144.png", type: "image/png", sizes: "144x144" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001b41",
};

const JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: SITE_NAME,
      alternateName: ["Brivora IT Services", "Brivora Indore"],
      url: SITE_URL + "/",
      logo: {
        "@type": "ImageObject",
        url: SITE_URL + "/icon-144.png",
        width: 144,
        height: 144,
      },
      image: SITE_URL + "/logo.png",
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
      name: SITE_NAME,
      alternateName: ["Brivora IT Services", "Brivora Indore"],
      description: SITE_DESC,
      inLanguage: "en-IN",
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
    <html lang="en-IN">
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
