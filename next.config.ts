/** @type {import('next').Next.jsConfig} */
const nextConfig = {
  // Next.js 13/14/15 configuration for packages with native bindings
  serverExternalPackages: ['canvas', 'sharp'],
};

module.exports = nextConfig;
