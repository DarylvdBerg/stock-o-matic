import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
	output: "standalone",
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
			{
				source: "/rpc/:path*",
				destination: `${backendUrl}/:path*`,
			},
		];
	},
};

export default nextConfig;
