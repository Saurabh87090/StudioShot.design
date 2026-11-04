import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Yeh line Next.js ko rokti hai sharp ko bundle karne se
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
