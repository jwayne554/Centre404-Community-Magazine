import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  eslint: {
    // Only show warnings during builds for now
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Type check during builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
