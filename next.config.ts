import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/site-path";

const nextConfig: NextConfig = {
  // Export a portable static site for the existing hosting deployment.
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: false,
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
