import type { NextConfig } from "next";

// Leave empty for local development and root-domain deployments. Set this to
// "/aletindia" in the hosting environment only when the site is deployed
// below that subfolder.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Export a portable static site for the existing hosting deployment.
  output: "export",
  trailingSlash: true,
  basePath,
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
