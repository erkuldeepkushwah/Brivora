/** @type {import('next').NextConfig} */
const isCloudflarePages = process.env.CF_PAGES === "1";

const nextConfig = isCloudflarePages
  ? {
      // Cloudflare Pages: static export, served from the domain root
      output: "export",
      images: { unoptimized: true },
    }
  : {
      // Default mode (same as before)
      outputFileTracingIncludes: {
        "/**": ["./app/**/page.html"],
      },
      async redirects() {
        return [
          { source: "/about", destination: "/About", permanent: false },
          { source: "/blog", destination: "/Blog", permanent: false },
          { source: "/contact", destination: "/Contact", permanent: false },
          { source: "/course", destination: "/Course", permanent: false },
          { source: "/courses", destination: "/Course", permanent: false },
          { source: "/home", destination: "/Home", permanent: false },
          { source: "/home1", destination: "/Home", permanent: false },
          { source: "/home-page-1", destination: "/Home", permanent: false },
          { source: "/home-2", destination: "/Home", permanent: false },
          { source: "/login", destination: "/Login", permanent: false },
          { source: "/signin", destination: "/Login", permanent: false },
          { source: "/logs", destination: "/Logs", permanent: false },
          { source: "/logos", destination: "/Logs", permanent: false },
          { source: "/service", destination: "/Service", permanent: false },
          { source: "/services", destination: "/Service", permanent: false },
          { source: "/case-studies", destination: "/Studies", permanent: false },
        ];
      },
    };

export default nextConfig;
