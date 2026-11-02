import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  // Served at https://aletindia.com/aletindia
  basePath: "/aletindia",
  // Serve public images from /aletindia/images so they stay off the Laravel site.
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
