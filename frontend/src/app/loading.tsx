import { CircularProgress, Container } from "@mui/material";

export default function Loading() {
	return (
		<Container
			maxWidth={false}
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "50vh",
			}}
		>
			<CircularProgress />
		</Container>
	);
}
