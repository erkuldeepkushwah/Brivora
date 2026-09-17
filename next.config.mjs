/** @type {import('next').NextConfig} */
const isCloudflarePages = process.env.CF_PAGES === "1";

const nextConfig = isCloudflarePages
  ? {
      // Cloudflare Pages: static export, served from the domain root
      output: "export",
      images: { unoptimized: true },
    }
  : {
      // Default (platform / standalone container) mode
      output: "standalone",
      outputFileTracingIncludes: {
        "/**": ["./app/**/page.html"],
      },
      async rewrites() {
        return [
          { source: "/public/:path*", destination: "/:path*" },
        ];
      },
      async redirects() {
        return [
          { source: "/courses", destination: "/course", permanent: false },
          { source: "/home", destination: "/", permanent: false },
          { source: "/home1", destination: "/", permanent: false },
          { source: "/home-page-1", destination: "/", permanent: false },
          { source: "/home-2", destination: "/", permanent: false },
          { source: "/signin", destination: "/login", permanent: false },
          { source: "/portal", destination: "/dashboard", permanent: false },
          { source: "/client-portal", destination: "/dashboard", permanent: false },
          { source: "/logs", destination: "/logos", permanent: false },
          { source: "/service", destination: "/services", permanent: false },
          { source: "/our-services", destination: "/services", permanent: false },
          { source: "/studies", destination: "/case-studies", permanent: false },
        ];
      },
    };

export default nextConfig;
