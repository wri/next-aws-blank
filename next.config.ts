import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  output: 'standalone',
  serverExternalPackages: ['typeorm', 'reflect-metadata', 'pg'],
  experimental: {
    // Disable server-side minification to preserve TypeORM entity class names.
    // TypeORM uses constructor.name for entity metadata resolution, which breaks
    // when class names are mangled (e.g., Assessment -> a).
    serverMinification: false,
  },
}

export default nextConfig
