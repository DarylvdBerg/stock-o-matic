import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { CategoryClient } from "@/client/category-client";
import { Grid } from "@/grid";

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
			{/** Header with controls, filter and search */}
			<div></div>
			{/** Grid that renders all stock items */}
			<Grid stock={stockRes} />
		</Suspense>
	);
}
