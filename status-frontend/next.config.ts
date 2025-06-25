// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Skip ESLint errors during builds (e.g., on Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Skip TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Allow remote images if you're using them (optional)
  images: {
    domains: ['your-image-domain.com'], // remove or replace as needed
  },
}

module.exports = nextConfig
