/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'echallan.app',
        pathname: '/application/fleet/**',
      },
    ],
  },
};

module.exports = nextConfig;