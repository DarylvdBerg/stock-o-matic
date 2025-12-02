import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { CategoryClient } from "@/client/category-client";
import { Grid } from "@/grid";
import { Header } from "@/header";
import { Container, Divider } from "@mui/material";
import { Actions } from "@/actions";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";

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
			<Container
				maxWidth={false}
				disableGutters
				sx={{ display: "flex", flexDirection: "column" }}
			>
				{/** Header with controls, filter and search */}
				<Header />
				{/** Divide the content */}
				<Divider />
				{/** Grid that renders all stock items */}
				<Grid stock={stockRes} categories={categoryRes} />
			</Container>
			{/** Actions floating button */}
			<Actions
				actions={[
					{ icon: <ShareIcon />, name: "thing", component: <div>Test</div> },
					{ icon: <CloseIcon />, name: "thong", component: <div>Div</div> },
				]}
			/>
		</Suspense>
	);
}
