import type { NextConfig } from "next";

const config: NextConfig = {
  // Keep sharp external so the native binary is loaded at runtime instead of
  // being inlined into Turbopack chunks. With node-linker=hoisted, Next's
  // default file tracing copies real files (not pnpm store symlinks).
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "r2.apimodels.app" },
      { protocol: "https", hostname: "**.cradler.ai" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default config;
