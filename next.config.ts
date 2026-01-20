import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ai-api.dtp-dev.site",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
} as unknown as NextConfig;

export default nextConfig;
