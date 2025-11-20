import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { Overview } from "@/overview";

export default function Home() {
	const config = getClientConfig();
	const client = new StockClient(config);

	try {
		const response = client.getStock();

		return (
			<Suspense fallback={<div>loading...</div>}>
				<Overview stock={response} />
			</Suspense>
		);
	} catch {
		return <div></div>;
	}
}
