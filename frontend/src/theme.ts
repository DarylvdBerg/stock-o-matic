"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	typography: {
		fontFamily: "var(--font-roboto)",
		h6: {
			fontWeight: 600,
		},
	},
	palette: {
		mode: "light",
		primary: {
			main: "#1565c0",
			light: "#5e92f3",
			dark: "#003c8f",
		},
		secondary: {
			main: "#f57c00",
			light: "#ffad42",
			dark: "#bb4d00",
		},
		background: {
			default: "#f5f7fa",
			paper: "#ffffff",
		},
	},
	shape: {
		borderRadius: 10,
	},
	components: {
		MuiCard: {
			defaultProps: {
				elevation: 0,
			},
			styleOverrides: {
				root: {
					border: "1px solid",
					borderColor: "rgba(0, 0, 0, 0.08)",
					transition: "box-shadow 0.2s ease, border-color 0.2s ease",
					"&:hover": {
						borderColor: "rgba(0, 0, 0, 0.16)",
						boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				sizeSmall: {
					fontWeight: 500,
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					fontWeight: 600,
				},
			},
		},
	},
});

export default theme;
