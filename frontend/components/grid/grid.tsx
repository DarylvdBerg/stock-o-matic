"use client";

import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { JSX, use, useEffect, useState } from "react";
import {
	Autocomplete,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Checkbox,
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
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { useStockStore } from "../../stores";

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

type CategoryData = {
	id?: number;
	label: string;
};

export function Grid({ stock, categories }: GridProps): JSX.Element {
	const stockResponse = getStockFromResponse(use(stock));

	// Use the stock store for sharable state within the application
	const stockStore = useStockStore();

	useEffect(() => {
		stockStore.stock = stockResponse;
	}, []);

	const storeStock = useStockStore((state) => state.stock);
	// Use component state for things such as filtering which directly impact the component state.
	const [stockData, setStockData] = useState(storeStock);

	const optionData = getCategoriesFromResponse(use(categories))
		.filter((c) => c.name !== "")
		.map((c) => ({
			id: c.id,
			label: c.name,
		}));

	const [categoryData] = useState(optionData);

	const [searchValue, setSearchValue] = useState("");
	const [selectedValues, setSelectedValues] = useState(Array.of<CategoryData>);

	/** Search  & filter */
	useEffect(() => {
		const data = setTimeout(() => {
			let filteredData = storeStock;

			// Apply category filter
			if (selectedValues.length > 0) {
				const selectedLabels = selectedValues.map((v) => v.label);
				filteredData = filteredData.filter((s) =>
					s.categories.some((c) => selectedLabels.includes(c.name)),
				);
			}

			// Apply search filter
			if (searchValue) {
				filteredData = filteredData.filter((s) =>
					s.name.toLowerCase().includes(searchValue.toLowerCase()),
				);
			}

			setStockData(filteredData);
		}, 300);

		return () => clearTimeout(data);
	}, [searchValue, selectedValues, storeStock]);

	return (
		<Container
			maxWidth="xl"
			sx={{ mt: 4.5, display: "flex", flexDirection: "column", gap: 6 }}
		>
			<Container maxWidth="xl" disableGutters sx={{ display: "flex", gap: 2 }}>
				<TextField
					sx={{ width: 400 }}
					size="medium"
					label="search"
					onChange={(e) => setSearchValue(e.target.value)}
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
					multiple
					id="checkboxes-tags-demo"
					options={categoryData}
					disableCloseOnSelect
					onChange={(_, v) => setSelectedValues(v)}
					getOptionLabel={(option) => option.label}
					renderOption={(props, option, { selected }) => {
						const { key, ...optionProps } = props;
						return (
							<li key={key} {...optionProps}>
								<Checkbox
									icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
									checkedIcon={<CheckBoxIcon fontSize="small" />}
									style={{ marginRight: 8 }}
									checked={selected}
								/>
								{option.label}
							</li>
						);
					}}
					style={{ width: 500 }}
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
									<Chip size="small" key={c.id} label={c.name} />
								))}
							</CardActions>
						</Card>
					</MUIGrid>
				))}
			</MUIGrid>
		</Container>
	);
}
