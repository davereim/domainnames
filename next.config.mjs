/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/domainnames',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
