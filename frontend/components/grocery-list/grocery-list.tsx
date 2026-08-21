"use client";

import {
	Box,
	Button,
	Checkbox,
	Chip,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Snackbar,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMemo, useState } from "react";
import { useCategoryStore, useStockStore } from "../../stores";
import { Stock } from "@/proto/core/v1/stock_pb";
import {
	monitoredCategoryIds,
	isOnGroceryList,
} from "@/grocery/grocery-filter";

function quantityLabel(quantity: number) {
	if (quantity === 0) return "Out of stock";
	if (quantity === 1) return "Last one";
	return `Qty: ${quantity}`;
}

function quantityColor(quantity: number): "error" | "warning" | "default" {
	if (quantity === 0) return "error";
	if (quantity === 1) return "warning";
	return "default";
}

export function GroceryList() {
	const stock = useStockStore((state) => state.stock);
	const categories = useCategoryStore((state) => state.categories);
	const monitoredIds = useMemo(
		() => monitoredCategoryIds(categories),
		[categories],
	);
	const [tab, setTab] = useState(0);
	const [copied, setCopied] = useState(false);

	const groceryItems = useMemo(
		() => stock.filter((s) => isOnGroceryList(s, monitoredIds)),
		[stock, monitoredIds],
	);

	// Pre-select grocery-list items
	const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
		return new Set(
			stock
				.filter((s) => isOnGroceryList(s, monitoredIds) && s.id !== undefined)
				.map((s) => s.id as number),
		);
	});

	// Sort: grocery-list items first (out of stock before last-one), then by name
	const sortedStock = useMemo(
		() =>
			[...stock].sort((a, b) => {
				const aOn = isOnGroceryList(a, monitoredIds);
				const bOn = isOnGroceryList(b, monitoredIds);
				if (aOn && !bOn) return -1;
				if (!aOn && bOn) return 1;
				return a.name.localeCompare(b.name);
			}),
		[stock, monitoredIds],
	);

	function toggleItem(id: number | undefined) {
		if (id === undefined) return;
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}

	function selectAllGroceryItems() {
		setSelectedIds(
			new Set(
				groceryItems
					.map((s) => s.id)
					.filter((id): id is number => id !== undefined),
			),
		);
		setTab(1);
	}

	const selectedItems = useMemo(
		() => stock.filter((s) => s.id !== undefined && selectedIds.has(s.id)),
		[stock, selectedIds],
	);

	function buildListText(items: Stock[]) {
		return items.map((s) => `- ${s.name}`).join("\n");
	}

	async function copyToClipboard(items: Stock[]) {
		const text = buildListText(items);
		if (!text) return;
		await navigator.clipboard.writeText(text);
		setCopied(true);
	}

	const currentTitle =
		tab === 0
			? `${groceryItems.length} item${groceryItems.length !== 1 ? "s" : ""} out of stock`
			: `${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""} selected`;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
				<Tab label="Out of stock" />
				<Tab label="Select items" />
			</Tabs>

			{tab === 0 ? (
				<>
					{groceryItems.length > 0 ? (
						<>
							<Typography variant="body2" color="text.secondary">
								{currentTitle}
							</Typography>
							<List disablePadding dense>
								{groceryItems.map((s) => (
									<ListItem
										key={s.id}
										disablePadding
										secondaryAction={
											<Chip
												size="small"
												label={quantityLabel(s.quantity)}
												color={quantityColor(s.quantity)}
												variant="outlined"
											/>
										}
									>
										<ListItemText primary={s.name} sx={{ pr: 12 }} />
									</ListItem>
								))}
							</List>
							<Divider />
							<Box
								sx={{
									display: "flex",
									gap: 1,
									justifyContent: "flex-end",
								}}
							>
								<Button
									variant="outlined"
									size="small"
									onClick={selectAllGroceryItems}
								>
									Add all to selection
								</Button>
								<IconButton
									size="small"
									onClick={() => copyToClipboard(groceryItems)}
									title="Copy list"
								>
									<ContentCopyIcon fontSize="small" />
								</IconButton>
							</Box>
						</>
					) : (
						<Typography
							variant="body2"
							color="text.secondary"
							textAlign="center"
							sx={{ py: 4 }}
						>
							Everything is well stocked
						</Typography>
					)}
				</>
			) : (
				<>
					<Typography variant="body2" color="text.secondary">
						{currentTitle}
					</Typography>
					<List disablePadding dense sx={{ maxHeight: 360, overflow: "auto" }}>
						{sortedStock.map((s, i) => {
							const onList = isOnGroceryList(s, monitoredIds);
							const prevOnList =
								i > 0 && isOnGroceryList(sortedStock[i - 1], monitoredIds);
							const showSuggestedLabel = i === 0 && onList;
							const showOtherLabel = !onList && (i === 0 || prevOnList);

							return (
								<Box key={s.id}>
									{showSuggestedLabel && (
										<Typography
											variant="caption"
											color="primary"
											fontWeight={600}
											sx={{ px: 2, pt: 1 }}
										>
											Suggested
										</Typography>
									)}
									{showOtherLabel && (
										<>
											{i > 0 && <Divider sx={{ my: 0.5 }} />}
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ px: 2, pt: 1 }}
											>
												Other items
											</Typography>
										</>
									)}
									<ListItem disablePadding>
										<ListItemButton onClick={() => toggleItem(s.id)} dense>
											<ListItemIcon sx={{ minWidth: 36 }}>
												<Checkbox
													edge="start"
													checked={s.id !== undefined && selectedIds.has(s.id)}
													disableRipple
													size="small"
												/>
											</ListItemIcon>
											<ListItemText primary={s.name} />
											<Chip
												size="small"
												label={quantityLabel(s.quantity)}
												color={quantityColor(s.quantity)}
												variant="outlined"
												sx={{ ml: 1 }}
											/>
										</ListItemButton>
									</ListItem>
								</Box>
							);
						})}
					</List>
					{selectedItems.length > 0 && (
						<>
							<Divider />
							<Box
								sx={{
									display: "flex",
									gap: 1,
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Button
									variant="text"
									size="small"
									onClick={() => setSelectedIds(new Set())}
								>
									Clear
								</Button>
								<IconButton
									size="small"
									onClick={() => copyToClipboard(selectedItems)}
									title="Copy list"
								>
									<ContentCopyIcon fontSize="small" />
								</IconButton>
							</Box>
						</>
					)}
				</>
			)}

			<Snackbar
				open={copied}
				autoHideDuration={2000}
				onClose={() => setCopied(false)}
				message="Grocery list copied to clipboard"
			/>
		</Box>
	);
}
