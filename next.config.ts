import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

// NOTE on script-src: Next.js injects several inline <script> tags for
// hydration, chunk loading, and the router. Removing 'unsafe-inline' without
// a proper per-request nonce (via middleware) will break those scripts in
// production. The correct upgrade path is:
//   1. Add a Next.js middleware that generates a crypto nonce per request,
//      sets it on `res.headers['Content-Security-Policy']`, and passes it to
//      the app via a response header or cookie.
//   2. Use Next.js's built-in `nonce` support (next/headers) to stamp every
//      inline script with that nonce.
// Until that middleware exists, 'unsafe-inline' is kept intentionally so the
// app does not break. The other directives (object-src, frame-ancestors,
// base-uri, form-action) still provide meaningful XSS mitigation.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // TODO: replace with per-request nonce via middleware
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default; alias @/ is from tsconfig paths
  turbopack: {},
  async headers() {
    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
    ];

    if (!isDev) {
      securityHeaders.push({
        key: "Content-Security-Policy",
        value: contentSecurityPolicy,
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
