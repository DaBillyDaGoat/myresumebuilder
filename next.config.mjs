/** @type {import('next').NextConfig} */
const nextConfig = {
  // html2pdf.js is browser-only — webpack config ensures it's not bundled server-side
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent server-side bundling of browser-only packages
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push('html2pdf.js', 'jspdf', 'html2canvas')
      }
    }
    return config
  },
}

export default nextConfig;
