import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone mode to ensure API routes work
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

export default nextConfig;
