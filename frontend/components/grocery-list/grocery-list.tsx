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
import { useStockStore } from "../../stores";
import { Stock } from "@/proto/core/v1/stock_pb";

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
	const [tab, setTab] = useState(0);
	const [copied, setCopied] = useState(false);

	const lowStock = useMemo(() => stock.filter((s) => s.quantity <= 1), [stock]);

	// Pre-select low stock items
	const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
		return new Set(
			stock
				.filter((s) => s.quantity <= 1 && s.id !== undefined)
				.map((s) => s.id as number),
		);
	});

	// Sort: out of stock first, then low stock, then by name
	const sortedStock = useMemo(
		() =>
			[...stock].sort((a, b) => {
				if (a.quantity <= 1 && b.quantity > 1) return -1;
				if (a.quantity > 1 && b.quantity <= 1) return 1;
				if (a.quantity === 0 && b.quantity === 1) return -1;
				if (a.quantity === 1 && b.quantity === 0) return 1;
				return a.name.localeCompare(b.name);
			}),
		[stock],
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

	function selectAllLowStock() {
		setSelectedIds(
			new Set(
				lowStock
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
			? `${lowStock.length} item${lowStock.length !== 1 ? "s" : ""} low or out of stock`
			: `${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""} selected`;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
				<Tab label="Low stock" />
				<Tab label="Select items" />
			</Tabs>

			{tab === 0 ? (
				<>
					{lowStock.length > 0 ? (
						<>
							<Typography variant="body2" color="text.secondary">
								{currentTitle}
							</Typography>
							<List disablePadding dense>
								{lowStock.map((s) => (
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
									onClick={selectAllLowStock}
								>
									Add all to selection
								</Button>
								<IconButton
									size="small"
									onClick={() => copyToClipboard(lowStock)}
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
							const isLow = s.quantity <= 1;
							const prevIsLow = i > 0 && sortedStock[i - 1].quantity <= 1;
							const showSuggestedLabel = i === 0 && isLow;
							const showOtherLabel = !isLow && (i === 0 || prevIsLow);

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
