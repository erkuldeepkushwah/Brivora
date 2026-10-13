// SEO pass: apply unique per-page metadata to every route.
//  - public pages get title + description + canonical + Open Graph + Twitter + robots
//  - private/utility pages (login, checkout, payment, user, admin, dashboard) get
//    robots noindex,nofollow
//  - removes the theme's external (the7.io) favicon links so our /favicon.png is used
// Runs last in the retheme workflow, after the build scripts regenerate pages.
// Idempotent: re-runs are no-ops.
// Usage: node scripts/seo.mjs
import fs from "node:fs";

const OG_IMG = "/logo.png";

const pub = {
  "app/page.tsx": {
    title: "Brivora – IT Services & IT Courses in Indore",
    description:
      "Brivora is an IT services company in Indore offering web development, mobile apps, UI/UX design, SEO, cloud & DevOps, and maintenance, along with IT certification courses for students and professionals.",
    canonical: "/",
  },
  "app/about/page.tsx": {
    title: "About Brivora – IT Company in Indore",
    description:
      "Learn about Brivora, an IT services company in Indore helping businesses of all sizes with practical technology solutions, structured planning, and long-term digital growth.",
    canonical: "/about/",
  },
  "app/services/page.tsx": {
    title: "IT Services – Web, Mobile, UI/UX, SEO & Cloud | Brivora",
    description:
      "Explore Brivora's IT services: web development, mobile app development, UI/UX design, SEO & digital marketing, cloud & DevOps, and ongoing maintenance and support.",
    canonical: "/services/",
  },
  "app/course/page.tsx": {
    title: "IT Courses & Certification – Brivora",
    description:
      "Browse Brivora's IT courses and certification programs and learn practical, job-ready technology skills with expert guidance from Brivora in Indore.",
    canonical: "/course/",
  },
  // /courses/ is a duplicate of /course/ -> same title/description, canonical to /course/
  "app/courses/page.tsx": {
    title: "IT Courses & Certification – Brivora",
    description:
      "Browse Brivora's IT courses and certification programs and learn practical, job-ready technology skills with expert guidance from Brivora in Indore.",
    canonical: "/course/",
  },
  "app/blog/page.tsx": {
    title: "Blog – IT Insights, News & Advice | Brivora",
    description:
      "Read the Brivora blog for insights on IT, web development, AI, cloud technology, digital roadmaps, and technology planning for growing businesses.",
    canonical: "/blog/",
  },
  "app/case-studies/page.tsx": {
    title: "Case Studies – Brivora",
    description:
      "Explore case studies and measurable client results from Brivora's advisory and technology projects.",
    canonical: "/case-studies/",
  },
  "app/contact/page.tsx": {
    title: "Contact Brivora – IT Services in Indore",
    description:
      "Contact Brivora: call +91-78986-92133, email brivora@gmail.com, or visit 12 Vijay Nagar, Indore (Mon–Fri, 9 am–5 pm). Send a query or request a callback.",
    canonical: "/contact/",
  },
  "app/logs/page.tsx": {
    title: "Logos – Brivora",
    description: "Brivora brand logos and pre-made layouts.",
    canonical: "/logs/",
  },
};

function metaStr(m) {
  return `export const metadata = {
  title: ${JSON.stringify(m.title)},
  description: ${JSON.stringify(m.description)},
  alternates: { canonical: ${JSON.stringify(m.canonical)} },
  openGraph: {
    title: ${JSON.stringify(m.title)},
    description: ${JSON.stringify(m.description)},
    url: ${JSON.stringify(m.canonical)},
    siteName: "Brivora",
    type: "website",
    images: [{ url: ${JSON.stringify(OG_IMG)}, alt: "Brivora" }],
  },
  twitter: {
    card: "summary_large_image",
    title: ${JSON.stringify(m.title)},
    description: ${JSON.stringify(m.description)},
    images: [${JSON.stringify(OG_IMG)}],
  },
  robots: { index: true, follow: true },
};`;
}

const singleLineMeta = /export const metadata = \{[^\n]*\};/;

for (const [f, m] of Object.entries(pub)) {
  if (!fs.existsSync(f)) {
    console.log("skip (missing): " + f);
    continue;
  }
  let s = fs.readFileSync(f, "utf8");
  if (!singleLineMeta.test(s)) {
    console.log("skip (already seo): " + f);
    continue;
  }
  s = s.replace(singleLineMeta, metaStr(m));
  fs.writeFileSync(f, s);
  console.log("seo: " + f);
}

// private / utility routes -> noindex,nofollow
const priv = [
  "app/login/page.tsx",
  "app/checkout/page.tsx",
  "app/payment/success/page.tsx",
  "app/payment/failed/page.tsx",
  "app/user/page.tsx",
  "app/user/courses/page.tsx",
  "app/user/profile/page.tsx",
  "app/user/expert/page.tsx",
  "app/user/certificates/page.tsx",
  "app/user/settings/page.tsx",
  "app/admin/page.tsx",
  "app/admin/users/page.tsx",
  "app/admin/courses/page.tsx",
  "app/admin/payments/page.tsx",
  "app/admin/settings/page.tsx",
  "app/dashboard/page.tsx",
  "app/dashboard/courses/page.tsx",
  "app/dashboard/profile/page.tsx",
  "app/dashboard/expert/page.tsx",
  "app/dashboard/certificates/page.tsx",
  "app/dashboard/settings/page.tsx",
];

for (const f of priv) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  const m = s.match(/export const metadata = \{[^\n]*\}/);
  if (!m || /robots:/.test(m[0])) continue;
  s = s.replace(/export const metadata = \{/, "export const metadata = { robots: { index: false, follow: false }, ");
  fs.writeFileSync(f, s);
  console.log("noindex: " + f);
}

// Remove the theme's external (the7.io) favicon links so our own /favicon.png is used.
for (const f of [...Object.keys(pub), ...priv]) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  s = s.replace(/<link[^>]*b-renewed\.svg[^>]*\/>/g, "");
  if (s !== before) {
    fs.writeFileSync(f, s);
    console.log("favicon links removed: " + f);
  }
}

console.log("seo metadata applied");
