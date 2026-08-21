import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { CategoryClient } from "@/client/category-client";
import { Grid } from "@/grid";
import { Header } from "@/header";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Home() {
	const config = getClientConfig();
	const stockClient = new StockClient(config);
	const categoryClient = new CategoryClient(config);

	const stockRes = stockClient.getStock();
	const categoryRes = categoryClient.getCategories();

	return (
		<div className="app">
			<Header />
			<Suspense
				fallback={
					<div className="splash">
						<div className="boarding" aria-hidden="true">
							<i />
							<i />
							<i />
							<i />
						</div>
						<div className="splash__sub">Boarding the board…</div>
					</div>
				}
			>
				<Grid stock={stockRes} categories={categoryRes} />
			</Suspense>
		</div>
	);
}
