"use client";

import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { JSX, use } from "react";
import {
	Autocomplete,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Chip,
	Container,
	InputAdornment,
	Grid as MUIGrid,
	TextField,
	Typography,
} from "@mui/material";
import {
	getCategoriesFromResponse,
	getStockFromResponse,
} from "@/utils/response";
import { Category, Stock } from "@/proto/core/v1/stock_pb";
import SearchIcon from "@mui/icons-material/Search";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";

/**
 * Defines the properties for rendering our grid.
 *
 * @interface GridProps
 * @typedef {GridProps}
 */
interface GridProps {
	stock: Promise<GetStockResponse>;
	categories: Promise<GetCategoriesResponse>;
}

export function Grid({ stock, categories }: GridProps): JSX.Element {
	const stockData = getStockFromResponse(use(stock));
	const categoryData = getCategoriesFromResponse(use(categories));

	const optionData = categoryData.map((c) => ({
		id: c.id,
		label: c.name,
	}));

	return (
		<Container maxWidth="xl" sx={{ mt: 4 }}>
			<Container maxWidth="xl" disableGutters sx={{ display: "flex", gap: 2 }}>
				<TextField
					size="medium"
					label="search"
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						},
					}}
				/>
				<Autocomplete
					options={optionData}
					sx={{ width: 300 }}
					renderInput={(params) => <TextField {...params} label="Categories" />}
				/>
			</Container>
			<MUIGrid container spacing={{ xs: 2, sm: 4, md: 6 }}>
				{stockData.map((s: Stock) => (
					<MUIGrid key={s.id} size={{ xs: 12, sm: 6, md: 3 }}>
						<Card variant="outlined">
							<CardHeader title={s.name} />
							<CardContent>
								<Typography>Quantity: {s.quantity}</Typography>
							</CardContent>
							<CardActions>
								{s.categories.map((c: Category) => (
									<Chip
										size="small"
										variant="outlined"
										key={c.id}
										label={c.name}
									/>
								))}
							</CardActions>
						</Card>
					</MUIGrid>
				))}
			</MUIGrid>
		</Container>
	);
}
