import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships WASM and is only used locally, so load it from node_modules instead of bundling it.
  serverExternalPackages: ["@electric-sql/pglite"],
  cacheComponents: true,
  // The owner dashboard moved to /admin when link creation became public.
  redirects() {
    return [{ source: "/dashboard", destination: "/admin", permanent: false }];
  },
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
