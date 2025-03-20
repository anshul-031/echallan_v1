/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'echallan.app',
        pathname: '/application/fleet/**',
      },
      {
        protocol: 'https',
        hostname: 'images.deepai.org',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
