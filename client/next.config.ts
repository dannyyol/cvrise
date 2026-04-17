import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "client-dev",
  ],
  transpilePackages: ["@talers/html-pages"],
};

export default nextConfig;
