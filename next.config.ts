import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isPages && repo ? `/${repo}` : "",
  assetPrefix: isPages && repo ? `/${repo}/` : "",
};

export default nextConfig;
