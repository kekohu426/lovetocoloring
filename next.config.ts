import type { NextConfig } from "next";

/**
 * Sharp native binaries must ship with the API routes that process images.
 * Do NOT include `node_modules/.pnpm/**` paths — those are symlinked store
 * trees and Vercel rejects them as an invalid Serverless Function package.
 */
const sharpTracing = [
  "./node_modules/sharp/**/*",
  "./node_modules/@img/sharp-linux-x64/**/*",
  "./node_modules/@img/sharp-libvips-linux-x64/**/*",
];

const config: NextConfig = {
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/api/generate": sharpTracing,
    "/api/generations/[id]": sharpTracing,
    "/api/generations/[id]/kits": sharpTracing,
    "/api/kits/[id]/export": sharpTracing,
    "/api/webhooks/image/[token]": sharpTracing,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "r2.apimodels.app" },
      { protocol: "https", hostname: "**.cradler.ai" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default config;
