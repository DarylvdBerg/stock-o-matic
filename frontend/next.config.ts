import type { NextConfig } from "next";

const backendUrl = "http://localhost:8080";

const nextConfig: NextConfig = {
	reactCompiler: true,
	async rewrites() {
		return [
			{
				source: "/uploads/:path*",
				destination: `${backendUrl}/uploads/:path*`,
			},
			{
				source: "/api/v1/:path*",
				destination: `${backendUrl}/api/v1/:path*`,
			},
		];
	},
};

export default nextConfig;
