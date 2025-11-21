import { Stock } from "@/proto/core/v1/stock_pb";
import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { getStockFromResponse } from "../response";

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
