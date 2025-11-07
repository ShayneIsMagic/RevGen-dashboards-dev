import type { NextConfig } from "next";

// Only use basePath when building for GitHub Pages (in CI/CD)
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = "RevGen-dashboards-dev";

const basePath = isGithubActions ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
