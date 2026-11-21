import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const backendOrigin =
  process.env.API_ORIGIN ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // Default rewrite proxy timeout is 30s; Instagram research (Bright Data poll) can take ~60–120s.
  experimental: {
    proxyTimeout: 180_000,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
