/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure ExcelJS for client-side use
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
      };

      // Use browser version of exceljs
      config.resolve.alias = {
        ...config.resolve.alias,
        'exceljs': 'exceljs/dist/exceljs.min.js',
      };
    }

    return config;
  },
}

module.exports = nextConfig
