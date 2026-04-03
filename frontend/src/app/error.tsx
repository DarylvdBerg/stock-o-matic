"use client";

import { Button, Container, Typography } from "@mui/material";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<Container
			maxWidth="sm"
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "50vh",
				gap: 2,
			}}
		>
			<Typography variant="h5">Something went wrong</Typography>
			<Typography color="text.secondary">{error.message}</Typography>
			<Button variant="outlined" onClick={reset}>
				Try again
			</Button>
		</Container>
	);
}
