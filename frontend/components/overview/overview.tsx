"use client";

import { Stock } from "@/proto/core/v1/stock_pb";
import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { getStockFromResponse } from "@/utils/response";
import { JSX, use } from "react";

interface OverviewProps {
	stock: Promise<GetStockResponse>;
}

export function Overview({ stock }: OverviewProps): JSX.Element {
	const stocks = getStockFromResponse(use(stock));
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
