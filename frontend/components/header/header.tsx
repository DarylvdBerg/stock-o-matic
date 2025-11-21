import { Container, Typography } from "@mui/material";
import { JSX } from "react";

export function Header(): JSX.Element {
	return (
		<Container maxWidth={false} sx={{ py: 1.5 }}>
			<Typography>Stock-o-matic</Typography>
		</Container>
	);
}
