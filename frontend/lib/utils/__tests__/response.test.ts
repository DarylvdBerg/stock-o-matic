import { Category, Stock } from "@/proto/core/v1/stock_pb";
import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { getCategoriesFromResponse, getStockFromResponse } from "../response";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";

describe("getStockFromResponse", () => {
	it("should return an array of stocks from response", () => {
		const mockStock = {
			id: 1,
			name: "stock",
			quantity: 20,
		};

		const mockResponse: GetStockResponse = {
			$typeName: "proto.services.v1.GetStockResponse",
			stocks: [mockStock as Stock],
		};

		const result = getStockFromResponse(mockResponse);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe(mockStock.name);
	});
});

describe("getCategoriesFromResponse", () => {
	it("should return an array of categories from response", () => {
		const mockCategory = {
			id: 1,
			name: "stock",
		};

		const mockResponse: GetCategoriesResponse = {
			$typeName: "proto.services.v1.GetCategoriesResponse",
			categories: [mockCategory as Category],
		};

		const result = getCategoriesFromResponse(mockResponse);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe(mockCategory.name);
	});
});
