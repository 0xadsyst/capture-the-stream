const path = require('path')

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  experimental: {
    esmExternals: false,
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias
    }

    return config
  }
}
