import { Category, Stock } from "@/proto/core/v1/stock_pb";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";
import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";

/**
 * Extract stock items from a GetStockResponse.
 */
export function getStockFromResponse(response: GetStockResponse): Stock[] {
	return response.stocks;
}

/**
 * Extract categories from a GetCategoriesResponse.
 */
export function getCategoriesFromResponse(
	response: GetCategoriesResponse,
): Category[] {
	return response.categories;
}
