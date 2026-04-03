import { ClientConfig, createTransport } from "@/config/client-config";
import {
	AddStockRequest,
	AddStockResponse,
	DeleteStockRequest,
	DeleteStockResponse,
	GetStockResponse,
	StockService,
	UpdateStockRequest,
	UpdateStockResponse,
} from "@/proto/services/v1/stock_service_pb";
import { Client, ConnectError, createClient } from "@connectrpc/connect";
import { RpcError } from "./rpc-error";
import { UnknownFailureRpcError } from "./errors";

export class StockClient {
	private client: Client<typeof StockService>;

	constructor(config: ClientConfig) {
		const transport = createTransport(config);
		this.client = createClient(StockService, transport);
	}

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
			throw UnknownFailureRpcError(error as Error);
		}
	}

	async addStock(req: AddStockRequest): Promise<AddStockResponse> {
		try {
			const res = await this.client.addStock(req);
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to execute rpc : ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError(error as Error);
		}
	}

	async updateStock(req: UpdateStockRequest): Promise<UpdateStockResponse> {
		try {
			const res = await this.client.updateStock(req);
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to execute rpc : ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError(error as Error);
		}
	}

	async deleteStock(req: DeleteStockRequest): Promise<DeleteStockResponse> {
		try {
			const res = await this.client.deleteStock(req);
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to execute rpc : ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError(error as Error);
		}
	}
}
