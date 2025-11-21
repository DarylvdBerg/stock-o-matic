import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { Overview } from "@/overview";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Home() {
	const config = getClientConfig();
	const client = new StockClient(config);
	const response = client.getStock();

	return (
		<Suspense fallback={<div>loading...</div>}>
			<Overview stock={response} />
		</Suspense>
	);
}
