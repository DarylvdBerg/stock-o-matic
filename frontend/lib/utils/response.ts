import { Category, Stock } from "@/proto/core/v1/stock_pb";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";
import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";

/**
 * Helper method to get the stock values from our GetStockresponse
 *
 * @export
 * @param {GetStockResponse} response
 * @returns {Stock[]}
 */
export function getStockFromResponse(response: GetStockResponse): Stock[] {
	const stocks = response.stocks.map((s) => s);
	return stocks;
}

/**
 * Helper method to get the category values from the GetCategoriesResponse
 *
 * @export
 * @param {GetCategoriesResponse} response
 * @returns {Category[]}
 */
export function getCategoriesFromResponse(
	response: GetCategoriesResponse,
): Category[] {
	const categories = response.categories.map((c) => c);
	return categories;
}
