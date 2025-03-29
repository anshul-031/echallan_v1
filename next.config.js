/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static exports
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'echallan.app',
        pathname: '/application/fleet/**',
      },
    ],
  },
  // Enable experimental serverComponentsExternalPackages if needed
  experimental: {
    serverActions: true,
  },
  // Improve asset detection for Vercel
  outputFileTracing: true,
};

module.exports = nextConfig;