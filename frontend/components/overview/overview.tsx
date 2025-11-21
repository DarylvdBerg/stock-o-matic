"use client";

import { Stock } from "@/proto/core/v1/stock_pb";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";
import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import {
	getCategoriesFromResponse,
	getStockFromResponse,
} from "@/utils/response";
import { JSX, use } from "react";

interface OverviewProps {
	stock: Promise<GetStockResponse>;
	categories: Promise<GetCategoriesResponse>;
}

export function Overview({ stock, categories }: OverviewProps): JSX.Element {
	const stocks = getStockFromResponse(use(stock));
	getCategoriesFromResponse(use(categories));
	return (
		<div>
			{stocks.map((s: Stock) => (
				<div key={s.id}>
					<p>{s.name}</p>
				</div>
			))}
		</div>
	);
}
