import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone mode to ensure API routes work
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
  // Skip static error page generation
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
