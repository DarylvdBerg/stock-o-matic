import { ClientConfig, createTransport } from "@/config/client-config";
import {
	GetStockResponse,
	StockService,
} from "@/proto/services/v1/stock_service_pb";
import { ConnectError, createClient } from "@connectrpc/connect";
import { ClientError } from "./client-error";

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

	/**
	 * Fetches the stock information
	 *
	 * @async
	 * @returns {Promise<GetStockResponse>}
	 */
	async getStock(): Promise<GetStockResponse> {
		try {
			// passing an empty request as we do not require any information.
			const res = await this.client.getStock({});
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new ClientError(
					`failed to fetch stock: ${error.message}`,
					error.code,
					error,
				);
			}
			throw new ClientError("unknown error occured", undefined, error);
		}
	}
}
