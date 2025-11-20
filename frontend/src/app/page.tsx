import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { Overview } from "@/overview";
import {GetStockResponse} from "@/proto/services/v1/stock_service_pb";

export default function Home() {
	const config = getClientConfig();
	const client = new StockClient(config);
	let response: Promise<GetStockResponse>
	try {
		response = client.getStock();
	} catch {
		response = Promise.reject()
	}

	return (
		<Suspense fallback={<div>loading...</div>}>
			<Overview stock={response} />
		</Suspense>
	);
}
