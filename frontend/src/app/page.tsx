import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { Overview } from "@/overview";
import { CategoryClient } from "@/client/category-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Home() {
	const config = getClientConfig();
	const stockClient = new StockClient(config);
	const categoryClient = new CategoryClient(config);

	const stockRes = stockClient.getStock();
	const categoryRes = categoryClient.getCategories();
	return (
		<Suspense fallback={<div>loading...</div>}>
			<Overview stock={stockRes} categories={categoryRes} />
		</Suspense>
	);
}
