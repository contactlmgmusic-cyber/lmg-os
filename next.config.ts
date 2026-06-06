import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iflokinmbcgglnofzceq.supabase.co",
      },
    ],
  },
};

export default nextConfig;