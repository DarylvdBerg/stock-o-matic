import { isDev } from "@/utils/environment";
import { Transport } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

/**
 * Base client configuration
 *
 * @export
 * @interface ClientConfig
 * @typedef {ClientConfig}
 */
export interface ClientConfig {
	baseUrl: string;
	timeout?: number;
	headers?: Record<string, string>;
}

/**
 * Create new transport configuration
 *
 * @export
 * @param config
 * @returns Transport
 */
export function createTransport(config: ClientConfig): Transport {
	return createConnectTransport({
		baseUrl: config.baseUrl,
		defaultTimeoutMs: config.timeout ?? DefaultClientTimeoutMs, // either get it through config
	});
}

/**
 * Returns the client configuration
 *
 * @export
 * @returns {ClientConfig}
 */
export function getClientConfig(): ClientConfig {
	return {
		baseUrl: isDev()
			? DefaultServerUrl
			: (process.env.NEXT_PUBLIC_RPC_URL ?? ""),
		timeout:
			Number(process.env.NEXT_PUBLIC_RPC_TIMEOUT) ?? DefaultClientTimeoutMs,
	};
}
