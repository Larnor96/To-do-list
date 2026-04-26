import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: "./",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
