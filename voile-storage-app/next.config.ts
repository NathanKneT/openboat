/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Important pour Netlify
  images: {
    unoptimized: true, // Nécessaire pour l'export statique
  },
  trailingSlash: true, // Optionnel mais peut aider avec les routes
}

module.exports = nextConfig