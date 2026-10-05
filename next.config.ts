import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next infer the wrong workspace
  // root; pin it to this project.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.kaelub.com",
      },
    ],
  },
  // The Voidpets prototype is a prebuilt Vite app in public/voidpets (built with
  // base /voidpets/). Link-only: nothing on the site points at it, and it's
  // kept out of search indexes.
  async rewrites() {
    return [
      { source: "/voidpets", destination: "/voidpets/story.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/voidpets/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/voidpets",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
