"use client";

import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { getStockFromResponse } from "@/utils/response";
import { JSX, use } from "react";

interface OverviewProps {
	stock: Promise<GetStockResponse>;
}

export function Overview({ stock }: OverviewProps): JSX.Element {
	const stocks = getStockFromResponse(use(stock));
	console.log(stocks);
	return <div></div>;
}
