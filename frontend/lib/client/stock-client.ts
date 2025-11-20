import { ClientConfig, createTransport } from "@/config/client-config";
import { StockService } from "@/proto/services/v1/stock_service_pb";
import { createClient } from "@connectrpc/connect";

/**
 * Defines the Stock client for making stock related rpc calls.
 *
 * @export
 * @class StockClient
 * @typedef {StockClient}
 */
export class StockClient {
	private client;

	constructor(config: ClientConfig) {
		const transport = createTransport(config);
		this.client = createClient(StockService, transport);
	}
}
