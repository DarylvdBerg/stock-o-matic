import { Transport } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { DefaultClientTimeoutMs, DefaultServerUrl } from "./default";

/**
 * Base client configuration
 */
export interface ClientConfig {
	baseUrl: string;
	timeout?: number;
	headers?: Record<string, string>;
}

/**
 * Create new transport configuration
 */
export function createTransport(config: ClientConfig): Transport {
	return createConnectTransport({
		baseUrl: config.baseUrl,
		defaultTimeoutMs: config.timeout ?? DefaultClientTimeoutMs,
	});
}

let cachedConfig: ClientConfig | null = null;

/**
 * Returns the client configuration. Cached since env vars are
 * baked in at build time and don't change at runtime.
 */
export function getClientConfig(): ClientConfig {
	if (!cachedConfig) {
		cachedConfig = {
			baseUrl: process.env.NEXT_PUBLIC_RPC_URL ?? DefaultServerUrl,
			timeout: process.env.NEXT_PUBLIC_RPC_TIMEOUT
				? Number(process.env.NEXT_PUBLIC_RPC_TIMEOUT)
				: DefaultClientTimeoutMs,
		};
	}
	return cachedConfig;
}
