"use client";

import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { use, useEffect, useMemo, useState } from "react";
import {
	Autocomplete,
	Box,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Checkbox,
	Chip,
	Container,
	IconButton,
	InputAdornment,
	Modal,
	Grid as MUIGrid,
	TextField,
	Typography,
} from "@mui/material";
import { Category, Stock } from "@/proto/core/v1/stock_pb";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { useStockStore } from "../../stores";
import { ModalMode, StockModal } from "@/modals";

interface GridProps {
	stock: Promise<GetStockResponse>;
	categories: Promise<GetCategoriesResponse>;
}

type CategoryData = {
	id?: number;
	label: string;
};

export function Grid({ stock, categories }: GridProps) {
	const stockResponse = use(stock);
	const categoriesResponse = use(categories);

	const init = useStockStore((state) => state.init);

	useEffect(() => {
		init(stockResponse.stocks);
	}, [stockResponse.stocks, init]);

	const storeStock = useStockStore((state) => state.stock);

	const categoryData = useMemo(
		() =>
			categoriesResponse.categories
				.filter((c) => c.name !== "")
				.map((c) => ({ id: c.id, label: c.name })),
		[categoriesResponse.categories],
	);

	const [searchValue, setSearchValue] = useState("");
	const [selectedValues, setSelectedValues] = useState<CategoryData[]>([]);
	const [editStock, setEditStock] = useState<Stock | null>(null);

	const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchValue), 300);
		return () => clearTimeout(timer);
	}, [searchValue]);

	const filteredStock = useMemo(() => {
		let result = storeStock;

		if (selectedValues.length > 0) {
			const selectedLabels = selectedValues.map((v) => v.label);
			result = result.filter((s) =>
				s.categories.some((c) => selectedLabels.includes(c.name)),
			);
		}

		if (debouncedSearch) {
			const search = debouncedSearch.toLowerCase();
			result = result.filter((s) => s.name.toLowerCase().includes(search));
		}

		return result;
	}, [debouncedSearch, selectedValues, storeStock]);

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
				{filteredStock.map((s: Stock) => (
					<MUIGrid key={s.id} size={{ xs: 12, sm: 6, md: 3 }}>
						<Card variant="outlined">
							<CardHeader
								title={s.name}
								action={
									<IconButton aria-label="edit" onClick={() => setEditStock(s)}>
										<EditIcon />
									</IconButton>
								}
							/>
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
			<Modal open={editStock !== null} onClose={() => setEditStock(null)}>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						bgcolor: "background.paper",
						borderRadius: 1.5,
						minWidth: 300,
						minHeight: 300,
						display: "flex",
						flexDirection: "column",
						p: 1,
					}}
				>
					<IconButton
						sx={{ alignSelf: "flex-end" }}
						onClick={() => setEditStock(null)}
					>
						<CloseIcon />
					</IconButton>
					{editStock && <StockModal mode={ModalMode.EDIT} data={editStock} />}
				</Box>
			</Modal>
		</Container>
	);
}
