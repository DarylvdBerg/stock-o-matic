"use client";

import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { use, useEffect, useMemo, useRef, useState } from "react";
import {
	Autocomplete,
	Box,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Checkbox,
	Chip,
	Container,
	IconButton,
	InputAdornment,
	Modal,
	Grid as MUIGrid,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Category, Stock } from "@/proto/core/v1/stock_pb";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { useCategoryStore, useStockStore } from "../../stores";
import { useStockClient } from "@/hooks/stock-client";
import { deleteImage } from "@/client/image-client";
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

	const stockClient = useStockClient();
	const initStock = useStockStore((state) => state.init);
	const initCategories = useCategoryStore((state) => state.init);
	const deleteStockFromStore = useStockStore((state) => state.deleteStock);
	const updateStockInStore = useStockStore((state) => state.updateStock);

	const initialized = useRef(false);
	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true;
			initStock(stockResponse.stocks);
			initCategories(categoriesResponse.categories);
		}
	}, [
		stockResponse.stocks,
		categoriesResponse.categories,
		initStock,
		initCategories,
	]);

	const storeStock = useStockStore((state) => state.stock);
	const storeCategories = useCategoryStore((state) => state.categories);

	async function handleDelete(item: Stock) {
		if (item.id === undefined) return;
		await stockClient.deleteStock({
			$typeName: "proto.services.v1.DeleteStockRequest",
			id: item.id,
		});
		if (item.imageUrl) {
			deleteImage(item.imageUrl);
		}
		deleteStockFromStore(item.id);
	}

	async function handleQuantityChange(item: Stock, delta: number) {
		if (item.id === undefined) return;
		const newQuantity = Math.max(0, item.quantity + delta);
		if (newQuantity === item.quantity) return;

		await stockClient.updateStock({
			$typeName: "proto.services.v1.UpdateStockRequest",
			id: item.id,
			name: item.name,
			quantity: newQuantity,
			categories: item.categories,
			imageUrl: item.imageUrl,
		});
		updateStockInStore(
			item.id,
			item.name,
			newQuantity,
			item.categories,
			item.imageUrl,
		);
	}

	const categoryData = useMemo(
		() =>
			storeCategories
				.filter((c) => c.name !== "")
				.map((c) => ({ id: c.id, label: c.name })),
		[storeCategories],
	);

	const [searchValue, setSearchValue] = useState("");
	const [selectedValues, setSelectedValues] = useState<CategoryData[]>([]);
	const [editStock, setEditStock] = useState<Stock | null>(null);
	const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

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

	const hasFilters = debouncedSearch || selectedValues.length > 0;

	return (
		<Container
			maxWidth="xl"
			sx={{
				mt: 4,
				px: { xs: 2, sm: 3 },
				display: "flex",
				flexDirection: "column",
				gap: 4,
				overflow: "hidden",
			}}
		>
			{/* Search & Filter Bar */}
			<Box
				sx={{
					display: "flex",
					gap: 2,
					flexWrap: "wrap",
					p: { xs: 1.5, sm: 2.5 },
					bgcolor: "background.paper",
					borderRadius: 2,
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				<TextField
					sx={{ flex: "1 1 100%", maxWidth: { sm: 400 } }}
					size="medium"
					label="Search items"
					placeholder="Type to search..."
					onChange={(e) => setSearchValue(e.target.value)}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon color="action" />
								</InputAdornment>
							),
						},
					}}
				/>
				<Autocomplete
					multiple
					id="category-filter"
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
					sx={{ flex: "1 1 100%", maxWidth: { sm: 500 } }}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Filter by category"
							placeholder="Select categories..."
						/>
					)}
				/>
			</Box>

			{/* Results count */}
			<Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
				{filteredStock.length} {filteredStock.length === 1 ? "item" : "items"}
				{hasFilters ? " found" : " total"}
			</Typography>

			{/* Stock Grid */}
			{filteredStock.length > 0 ? (
				<MUIGrid container spacing={3}>
					{filteredStock.map((s: Stock) => (
						<MUIGrid key={s.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
							<Card
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
								}}
							>
								{s.imageUrl && (
									<CardMedia
										component="img"
										height="200"
										image={s.imageUrl}
										alt={s.name}
										onClick={() => setFullImageUrl(s.imageUrl)}
										sx={{
											objectFit: "cover",
											cursor: "pointer",
										}}
									/>
								)}
								<CardContent sx={{ flex: 1, pb: 1 }}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											mb: 1.5,
											gap: 0.5,
											minWidth: 0,
										}}
									>
										<Typography
											variant="subtitle1"
											fontWeight={600}
											noWrap
											sx={{ minWidth: 0 }}
										>
											{s.name}
										</Typography>
										<Box sx={{ display: "flex", flexShrink: 0 }}>
											<IconButton
												size="small"
												aria-label="edit"
												onClick={() => setEditStock(s)}
												sx={{
													color: "text.secondary",
													"&:hover": { color: "primary.main" },
												}}
											>
												<EditIcon fontSize="small" />
											</IconButton>
											<IconButton
												size="small"
												aria-label="delete"
												onClick={() => handleDelete(s)}
												sx={{
													color: "text.secondary",
													"&:hover": { color: "error.main" },
												}}
											>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Box>
									</Box>
									<Box
										sx={{
											display: "inline-flex",
											alignItems: "center",
											border: "1px solid",
											borderColor: "divider",
											borderRadius: 1.5,
										}}
									>
										<IconButton
											size="small"
											aria-label="decrease quantity"
											onClick={() => handleQuantityChange(s, -1)}
											disabled={s.quantity <= 0}
										>
											<RemoveIcon fontSize="small" />
										</IconButton>
										<Typography
											variant="body2"
											fontWeight={600}
											sx={{ minWidth: 32, textAlign: "center" }}
										>
											{s.quantity}
										</Typography>
										<IconButton
											size="small"
											aria-label="increase quantity"
											onClick={() => handleQuantityChange(s, 1)}
										>
											<AddIcon fontSize="small" />
										</IconButton>
									</Box>
								</CardContent>
								{s.categories.length > 0 && (
									<CardActions
										sx={{ px: 2, pb: 2, pt: 0.5, flexWrap: "wrap", gap: 0.5 }}
									>
										{s.categories.map((c: Category) => (
											<Chip
												size="small"
												key={c.id}
												label={c.name}
												variant="outlined"
												color="secondary"
											/>
										))}
									</CardActions>
								)}
							</Card>
						</MUIGrid>
					))}
				</MUIGrid>
			) : (
				<Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
					<SearchOffIcon sx={{ fontSize: 56, color: "text.disabled" }} />
					<Typography variant="h6" color="text.secondary">
						No items found
					</Typography>
					<Typography variant="body2" color="text.disabled">
						{hasFilters
							? "Try adjusting your search or filters"
							: "Add stock items to get started"}
					</Typography>
				</Stack>
			)}

			{/* Edit Modal */}
			<Modal open={editStock !== null} onClose={() => setEditStock(null)}>
				<Box
					sx={{
						position: "absolute",
						top: { xs: 0, sm: "50%" },
						left: { xs: 0, sm: "50%" },
						right: { xs: 0, sm: "auto" },
						bottom: { xs: 0, sm: "auto" },
						transform: { xs: "none", sm: "translate(-50%, -50%)" },
						bgcolor: "background.paper",
						borderRadius: { xs: 0, sm: 2 },
						width: { sm: 400 },
						maxHeight: { sm: "90vh" },
						overflow: "auto",
						boxShadow: 24,
						display: "flex",
						flexDirection: "column",
						p: 3,
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography variant="h6">Edit Item</Typography>
						<IconButton size="small" onClick={() => setEditStock(null)}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
					{editStock && (
						<StockModal
							mode={ModalMode.EDIT}
							data={editStock}
							onSuccess={() => setEditStock(null)}
						/>
					)}
				</Box>
			</Modal>

			{/* Full Image Modal */}
			<Modal open={fullImageUrl !== null} onClose={() => setFullImageUrl(null)}>
				<Box
					onClick={() => setFullImageUrl(null)}
					sx={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						bgcolor: "rgba(0,0,0,0.85)",
						p: 2,
						cursor: "pointer",
					}}
				>
					<IconButton
						onClick={() => setFullImageUrl(null)}
						sx={{
							position: "absolute",
							top: 16,
							right: 16,
							color: "white",
						}}
					>
						<CloseIcon />
					</IconButton>
					{fullImageUrl && (
						/* eslint-disable-next-line @next/next/no-img-element */
						<img
							src={fullImageUrl}
							alt="Full view"
							style={{
								maxWidth: "100%",
								maxHeight: "100%",
								objectFit: "contain",
								borderRadius: 8,
							}}
						/>
					)}
				</Box>
			</Modal>
		</Container>
	);
}
