import type { NextConfig } from "next";

const config: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.mscwlns.co",
      },
    ],
  },
};

export default config;

