/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['placeholder.com'],
  },
  // devIndicators: {
  //   buildActivity: false,
  //   buildActivityPosition: 'bottom-right',
  // },
  devIndicators: false,
}

export default nextConfig

