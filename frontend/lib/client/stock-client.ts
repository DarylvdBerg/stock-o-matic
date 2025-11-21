import { ClientConfig, createTransport } from "@/config/client-config";
import {
	GetStockResponse,
	StockService,
} from "@/proto/services/v1/stock_service_pb";
import { Code, ConnectError, createClient } from "@connectrpc/connect";
import { RpcError } from "./rpc-error";
import { doRpc } from "@/utils/client-helper";
import { UnknownFailureRpcError } from "./errors";

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
			const res = await this.client.getStock({});
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to execute rpc : ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError;
		}
	}
}
