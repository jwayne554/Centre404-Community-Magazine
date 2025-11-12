import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  eslint: {
    // Ignore ESLint during builds to bypass Next.js internal error page issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type check during builds
    ignoreBuildErrors: false,
  },
  // Skip static optimization to avoid build errors with error pages
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
