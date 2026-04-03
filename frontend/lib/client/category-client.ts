import { ClientConfig, createTransport } from "@/config/client-config";
import {
	AddCategoryRequest,
	AddCategoryResponse,
	CategoryService,
	DeleteCategoryRequest,
	DeleteCategoryResponse,
	GetCategoriesResponse,
	UpdateCategoryRequest,
	UpdateCategoryResponse,
} from "@/proto/services/v1/category_service_pb";
import { Client, ConnectError, createClient } from "@connectrpc/connect";
import { RpcError } from "./rpc-error";
import { UnknownFailureRpcError } from "./errors";

export class CategoryClient {
	private client: Client<typeof CategoryService>;

	constructor(config: ClientConfig) {
		const transport = createTransport(config);
		this.client = createClient(CategoryService, transport);
	}

	async getCategories(): Promise<GetCategoriesResponse> {
		try {
			const res = await this.client.getCategories({});
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to fetch categories: ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError(error as Error);
		}
	}

	async addCategory(req: AddCategoryRequest): Promise<AddCategoryResponse> {
		try {
			const res = await this.client.addCategory(req);
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to add category: ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError(error as Error);
		}
	}

	async updateCategory(
		req: UpdateCategoryRequest,
	): Promise<UpdateCategoryResponse> {
		try {
			const res = await this.client.updateCategory(req);
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to update category: ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError(error as Error);
		}
	}

	async deleteCategory(
		req: DeleteCategoryRequest,
	): Promise<DeleteCategoryResponse> {
		try {
			const res = await this.client.deleteCategory(req);
			return res;
		} catch (error) {
			if (error instanceof ConnectError) {
				throw new RpcError(
					`failed to delete category: ${error.message}`,
					error.code,
					error,
				);
			}
			throw UnknownFailureRpcError(error as Error);
		}
	}
}
