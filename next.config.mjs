/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Increase chunk loading timeout to 300s to eliminate ChunkLoadError timeouts
      config.output.chunkLoadTimeout = 300000;
    }
    return config;
  },
};

export default nextConfig;
