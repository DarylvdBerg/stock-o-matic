import { AppBar, Toolbar, Typography } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory2";

export function Header() {
	return (
		<AppBar position="static" elevation={0} color="primary">
			<Toolbar>
				<InventoryIcon sx={{ mr: 1.5 }} />
				<Typography variant="h6" component="h1">
					Stock-o-matic
				</Typography>
			</Toolbar>
		</AppBar>
	);
}
