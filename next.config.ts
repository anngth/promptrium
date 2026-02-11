import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
