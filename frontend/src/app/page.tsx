import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";
import { Suspense } from "react";
import { CategoryClient } from "@/client/category-client";
import { Grid } from "@/grid";
import { Header } from "@/header";
import { Box } from "@mui/material";
import { Actions } from "@/actions";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { ModalMode, StockModal } from "@/modals";
import { CategoriesManager } from "@/categories";
import { GroceryList } from "@/grocery-list";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Home() {
	const config = getClientConfig();
	const stockClient = new StockClient(config);
	const categoryClient = new CategoryClient(config);

	const stockRes = stockClient.getStock();
	const categoryRes = categoryClient.getCategories();
	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
			<Header />
			<Suspense>
				<Grid stock={stockRes} categories={categoryRes} />
			</Suspense>
			<Actions
				actions={[
					{
						icon: <InventoryIcon />,
						name: "Add stock",
						component: <StockModal mode={ModalMode.ADD} />,
					},
					{
						icon: <CategoryIcon />,
						name: "Manage categories",
						component: <CategoriesManager />,
					},
					{
						icon: <ShoppingCartIcon />,
						name: "Grocery list",
						component: <GroceryList />,
					},
				]}
			/>
		</Box>
	);
}
