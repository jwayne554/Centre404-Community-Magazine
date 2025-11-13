import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  typescript: {
    ignoreBuildErrors: true, // Next.js 16 internal error page generation issue (works on Railway)
  },
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
