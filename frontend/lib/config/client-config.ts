import { Transport } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import {
	DefaultClientBaseUrl,
	DefaultClientTimeoutMs,
	DefaultServerBaseUrl,
} from "./default";

export interface ClientConfig {
	baseUrl: string;
	timeout?: number;
	headers?: Record<string, string>;
}

export function createTransport(config: ClientConfig): Transport {
	return createConnectTransport({
		baseUrl: config.baseUrl,
		defaultTimeoutMs: config.timeout ?? DefaultClientTimeoutMs,
	});
}

let cachedConfig: ClientConfig | null = null;

/**
 * Returns the client configuration.
 *
 * Server-side (Next.js SSR/RSC) uses BACKEND_URL to reach the backend
 * directly over the docker network. Browser uses NEXT_PUBLIC_RPC_URL
 * (defaulting to "/rpc"), which Next.js rewrites to the backend.
 */
export function getClientConfig(): ClientConfig {
	if (!cachedConfig) {
		const isServer = typeof window === "undefined";
		const baseUrl = isServer
			? (process.env.BACKEND_URL ?? DefaultServerBaseUrl)
			: (process.env.NEXT_PUBLIC_RPC_URL ?? DefaultClientBaseUrl);
		cachedConfig = {
			baseUrl,
			timeout: process.env.NEXT_PUBLIC_RPC_TIMEOUT
				? Number(process.env.NEXT_PUBLIC_RPC_TIMEOUT)
				: DefaultClientTimeoutMs,
		};
	}
	return cachedConfig;
}
