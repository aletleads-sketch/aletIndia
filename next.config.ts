import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export a portable static site for the existing Sites hosting deployment.
  output: "export",
  trailingSlash: true,
  experimental: {
    // The desktop build environment cannot reliably spawn the default worker pool.
    cpus: 1,
    workerThreads: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 100,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};

export default nextConfig;
