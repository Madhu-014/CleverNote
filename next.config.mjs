/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================
  images: {
    // Remote patterns for external image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
        pathname: '/**',
      },
    ],
    // Optimize images on-demand
    unoptimized: false,
  },

  // ============================================================================
  // BUILD OPTIMIZATION
  // ============================================================================
  compress: true,

  // ============================================================================
  // SECURITY & HEADERS
  // ============================================================================
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // ============================================================================
  // REDIRECTS & REWRITES
  // ============================================================================
  async redirects() {
    return [];
  },

  // ============================================================================
  // EXPERIMENTAL FEATURES (For Next.js 15+ optimization)
  // ============================================================================
  experimental: {
    // Optimize bundle size and runtime performance
    optimizePackageImports: ['lucide-react'],
  },

  // ============================================================================
  // WEBPACK OPTIMIZATION
  // ============================================================================
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      ...(isServer && {
        // Server-side code splitting optimization
        splitChunks: {
          chunks: 'all',
        },
      }),
    };
    return config;
  },

  // ============================================================================
  // ENVIRONMENT VALIDATION
  // ============================================================================
  onDemandEntries: {
    // Preload pages for better performance
    maxInactiveAge: 120 * 1000,
    pagesBufferLength: 5,
  },

  // ============================================================================
  // POWEREDBY HEADER REMOVAL (Security)
  // ============================================================================
  poweredByHeader: false,
};

export default nextConfig;
