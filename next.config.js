/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https', 
        hostname: 'via.placeholder.com',
      }
    ]
  },
  // Enable standalone output for Docker
  output: 'standalone',
}

module.exports = nextConfig