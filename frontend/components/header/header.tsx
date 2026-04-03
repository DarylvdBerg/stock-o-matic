import { Container, Typography } from "@mui/material";

export function Header() {
	return (
		<Container maxWidth={false} sx={{ py: 1.5 }}>
			<Typography>Stock-o-matic</Typography>
		</Container>
	);
}
