/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for social media crawlers
  trailingSlash: false,
  
  // Enhanced image optimization
  images: {
    domains: [
      'res.cloudinary.com',
      'img.youtube.com',
      'vumbnail.com',
      'i.ytimg.com',
      'via.placeholder.com',
      'images.unsplash.com',
      'picsum.photos',
      'dummyimage.com',
      'localhost',
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers optimized for social media crawlers
  async headers() {
    return [
      {
        // All post pages
        source: '/post/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        // Static image files - FIXED REGEX
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // All static assets - FIXED REGEX  
        source: '/:path*\\.(png|jpg|jpeg|gif|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  
  // Redirects for social media crawlers
  async redirects() {
    return [
      {
        source: '/post/:linkId',
        has: [
          {
            type: 'header',
            key: 'user-agent',
            value: '.*(?:facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Telegram|Discord).*',
          },
        ],
        destination: '/post/:linkId?crawler=true',
        permanent: false,
      },
    ]
  },
  
  // Rewrites for better SEO
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ]
  },
  
  // Build optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ESLint and TypeScript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
