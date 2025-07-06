const path = require('path')
const fs = require('fs')
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [`${process.env.NEXT_PUBLIC_BASE_URL}`]
  },
  devIndicators: {
    buildActivity: false
  },
  transpilePackages: [
    'rc-util',
    '@ant-design',
    'kitchen-flow-editor',
    '@ant-design/pro-editor',
    'zustand',
    'leva',
    'antd',
    'rc-pagination',
    'rc-picker'
  ],
  trailingSlash: true,
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      require('./scripts/sitemap-generator')
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    return config
  },
  async exportPathMap(defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    
    if (dir && outDir && fs.existsSync(path.join(dir, '.htaccess'))) {
      fs.copyFileSync(path.join(dir, '.htaccess'), path.join(outDir, '.htaccess'))
    } else {
      console.log('');
    }
    return defaultPathMap
  }
}
// Conditionally set the output based on the environment
if (process.env.NEXT_PUBLIC_SEO === 'false') {
  nextConfig.output = 'export'
  nextConfig.images.unoptimized = true
}
module.exports = nextConfig
