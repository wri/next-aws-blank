import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  output: 'standalone',
  serverExternalPackages: ['typeorm', 'reflect-metadata', 'pg'],
  experimental: {},
  // Disable server-side minification so TypeORM entity class names are preserved.
  // TypeORM resolves entity metadata by constructor.name at runtime — if class
  // names are mangled (e.g. Assessment -> c, Contributor -> l) the lookup fails
  // with "Entity metadata for X was not found". The tradeoff is slightly larger
  // standalone output and marginally higher memory usage, but correctness requires
  // stable class names and there is no straightforward way to make the SWC
  // minimizer keep them without disabling the pass entirely.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.minimize = false
    }
    return config
  },
}

export default nextConfig
