/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Important pour Netlify
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig