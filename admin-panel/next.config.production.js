// Bundle optimization configuration for production deployment
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  experimental: {
    // Enable SWC minification
    swcMinify: true,
    // Modern bundling
    esmExternals: true,
    // Concurrent features
    concurrentFeatures: true,
    // Server components
    serverComponents: true,
  },

  // Compression
  compress: true,

  // Image optimization
  images: {
    domains: ['localhost', 'images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer in development
    if (dev && !isServer && process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    // Production optimizations
    if (!dev) {
      // Split chunks optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Common chunks
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
              priority: 5,
              reuseExistingChunk: true,
            },
            // UI library chunks
            antd: {
              test: /[\\/]node_modules[\\/]antd[\\/]/,
              name: 'antd',
              chunks: 'all',
              priority: 15,
            },
            // Icons chunks
            icons: {
              test: /[\\/]node_modules[\\/]@ant-design[\\/]icons[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 12,
            },
            // Charts chunks
            charts: {
              test: /[\\/]node_modules[\\/](recharts|chart\.js|@nivo)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 12,
            },
          },
        },
      };

      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Module concatenation
      config.optimization.concatenateModules = true;
    }

    // Alias for better imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@components': path.resolve(__dirname, 'components'),
      '@lib': path.resolve(__dirname, 'lib'),
      '@hooks': path.resolve(__dirname, 'hooks'),
      '@types': path.resolve(__dirname, 'types'),
      '@stores': path.resolve(__dirname, 'stores'),
    };

    return config;
  },

  // Output configuration
  output: 'standalone',
  
  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,
  
  // Enable static optimization
  staticPageGenerationTimeout: 1000,
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'restaurant-management-system',
  },
  
  // Rewrites for API optimization
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
