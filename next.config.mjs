/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/pead",
  serverExternalPackages: ['jsonwebtoken', 'bcryptjs'],
  env: {
    NEXT_PUBLIC_BASE_PATH: "/pead",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
