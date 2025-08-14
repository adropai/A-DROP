/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true, 
  experimental: {
    // Turbopack optimizations only
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      },
    },
    // Disable automatic file generation
    optimizePackageImports: [],
    // Disable filesystem optimizations that might create files
    optimizeServerReact: false,
  },
  // Fast development optimizations  
  // compiler: {
  //   removeConsole: false, // Not supported by Turbopack
  // },
  // Faster builds in development
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Development performance optimizations
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Increased from 25s to 60s
    pagesBufferLength: 2, // Reduced buffer for faster builds
  },
  env: {
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'development'
  },
  // Faster image loading in development
  images: {
    unoptimized: true, // Disable image optimization in development
    domains: ['localhost'],
  },
  
  // Webpack optimizations for development
  webpack: (config, { dev, isServer }) => {
    // Add Node.js polyfills for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        assert: false,
        fs: false,
        path: false,
      };
    }
    
    if (dev) {
      // Development optimizations
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false,
      };
      
      // Faster module resolution
      config.resolve.symlinks = false;
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './'),
    };
    
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  }
}

module.exports = nextConfig
