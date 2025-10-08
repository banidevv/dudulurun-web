/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'www.goersapp.com', 'assets.tripay.co.id'], // Add other domains as needed
  },
  // Ensure static files are properly served
  trailingSlash: false,
  // For production deployments, ensure public files are accessible
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
  // Ensure static files are served correctly
  output: 'standalone',
  // Add headers for static files
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/race-packs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig; 