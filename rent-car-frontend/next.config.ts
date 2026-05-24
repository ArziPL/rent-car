import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles only what's needed — required for the Docker image.
  // The final container runs `.next/standalone/server.js` with no full node_modules.
  output: "standalone",
};

export default nextConfig;
