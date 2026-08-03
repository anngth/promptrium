import type { NextConfig } from "next";
import path from "path";

// NOTE: This app is statically exported (output: "export") for Cloudflare
// Pages, which serves the generated `out/` directory as static assets.
// Static export does not support the `headers()` config or middleware, so
// security headers (including CSP) are defined in `public/_headers` instead
// -- see that file for the equivalent configuration and the same caveat
// about `script-src 'unsafe-inline'`.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Cloudflare Pages static export cannot run Next.js's Image
    // Optimization server, so images are served unoptimized.
    unoptimized: true,
  },
  // Next.js 16 uses Turbopack by default; alias @/ is from tsconfig paths
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
