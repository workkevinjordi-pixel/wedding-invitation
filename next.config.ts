import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // let phones on the same Wi-Fi load the dev server (otherwise Next blocks its JS with a 403)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local", "*.trycloudflare.com"],
  // hide the dev-only "N" badge (it sat on top of the vinyl button in the bottom-left corner)
  devIndicators: false,
  // static media rarely changes: let browsers and the CDN keep it for a week
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
