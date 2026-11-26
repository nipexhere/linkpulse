import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships WASM and is only used locally, so load it from node_modules instead of bundling it.
  serverExternalPackages: ["@electric-sql/pglite"],
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
