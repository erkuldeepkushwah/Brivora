/** @type {import('next').NextConfig} */
const isCF = !!process.env.CF_PAGES;
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isCF ? {} : { basePath: "/Brivora", assetPrefix: "/Brivora" }),
};
export default nextConfig;
