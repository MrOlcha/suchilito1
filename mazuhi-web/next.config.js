/** @type {import('next').NextConfig} */
const nextConfig = {
  // Excluir carpetas innecesarias del build
  excludeDefaultMomentLocales: true,

  // Ignorar pos-app que es un proyecto separado
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'mazuhi.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Optimizaciones de compilación
  swcMinify: true,

  // Optimizaciones de bundle
  experimental: {
    scrollRestoration: true,
  },

  // Compresión
  compress: true,

  // Optimizaciones avanzadas de performance
  poweredByHeader: false,
  reactStrictMode: true,

  // Optimización de bundle splitting
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // Headers de seguridad y performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Optimizaciones de webpack
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        next: {
          test: /[\\/]node_modules[\\/]next[\\/]/,
          name: 'next',
          chunks: 'all',
          priority: 30,
        },
      };
    }

    // Optimizaciones adicionales
    if (!dev) {
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
    }

    return config;
  },
}

module.exports = nextConfig