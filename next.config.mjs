/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['next-auth', '@next-auth/prisma-adapter'],
};

export default nextConfig;
