"use client";

import {
	Box,
	Button,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useCategoryClient } from "@/hooks/category-client";
import { useCategoryStore, useStockStore } from "../../stores";

export function CategoriesManager() {
	const categoryClient = useCategoryClient();
	const categories = useCategoryStore((state) => state.categories);
	const addCategoryToStore = useCategoryStore((state) => state.addCategory);
	const updateCategoryInStore = useCategoryStore(
		(state) => state.updateCategory,
	);
	const deleteCategoryFromStore = useCategoryStore(
		(state) => state.deleteCategory,
	);
	const removeCategoryFromAllStock = useStockStore(
		(state) => state.removeCategoryFromAll,
	);

	const [newName, setNewName] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState("");

	async function handleAdd() {
		const name = newName.trim();
		if (!name) return;

		await categoryClient.addCategory({
			$typeName: "proto.services.v1.AddCategoryRequest",
			category: {
				$typeName: "proto.core.v1.Category",
				id: 0,
				name,
			},
		});

		// Re-fetch to get the server-assigned ID
		const res = await categoryClient.getCategories();
		const added = res.categories.find((c) => c.name === name);
		if (added) {
			addCategoryToStore(added);
		}

		setNewName("");
	}

	async function handleUpdate(id: number) {
		const name = editingName.trim();
		if (!name) return;

		await categoryClient.updateCategory({
			$typeName: "proto.services.v1.UpdateCategoryRequest",
			id,
			name,
		});

		updateCategoryInStore(id, name);
		setEditingId(null);
		setEditingName("");
	}

	async function handleDelete(id: number) {
		await categoryClient.deleteCategory({
			$typeName: "proto.services.v1.DeleteCategoryRequest",
			id,
		});

		deleteCategoryFromStore(id);
		removeCategoryFromAllStock(id);
	}

	function startEdit(id: number, currentName: string) {
		setEditingId(id);
		setEditingName(currentName);
	}

	function cancelEdit() {
		setEditingId(null);
		setEditingName("");
	}

	const visibleCategories = categories.filter((c) => c.name !== "");

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			{/* Add new category */}
			<Box sx={{ display: "flex", gap: 1 }}>
				<TextField
					size="small"
					label="New category"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAdd()}
					fullWidth
				/>
				<Button
					variant="contained"
					onClick={handleAdd}
					disabled={!newName.trim()}
					sx={{ whiteSpace: "nowrap" }}
				>
					Add
				</Button>
			</Box>

			<Divider />

			{/* Category list */}
			{visibleCategories.length > 0 ? (
				<List disablePadding>
					{visibleCategories.map((cat) => (
						<ListItem
							key={cat.id}
							disablePadding
							sx={{ py: 0.5, pr: 10 }}
							secondaryAction={
								editingId === cat.id ? (
									<Box sx={{ display: "flex" }}>
										<IconButton
											size="small"
											onClick={() =>
												cat.id !== undefined && handleUpdate(cat.id)
											}
											color="primary"
										>
											<CheckIcon fontSize="small" />
										</IconButton>
										<IconButton size="small" onClick={cancelEdit}>
											<CloseIcon fontSize="small" />
										</IconButton>
									</Box>
								) : (
									<Box sx={{ display: "flex" }}>
										<IconButton
											size="small"
											onClick={() =>
												cat.id !== undefined && startEdit(cat.id, cat.name)
											}
											sx={{
												color: "text.secondary",
												"&:hover": {
													color: "primary.main",
												},
											}}
										>
											<EditIcon fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											onClick={() =>
												cat.id !== undefined && handleDelete(cat.id)
											}
											sx={{
												color: "text.secondary",
												"&:hover": {
													color: "error.main",
												},
											}}
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</Box>
								)
							}
						>
							{editingId === cat.id ? (
								<TextField
									size="small"
									value={editingName}
									onChange={(e) => setEditingName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && cat.id !== undefined) {
											handleUpdate(cat.id);
										}
										if (e.key === "Escape") {
											cancelEdit();
										}
									}}
									autoFocus
									fullWidth
									sx={{ mr: 8 }}
								/>
							) : (
								<ListItemText primary={cat.name} />
							)}
						</ListItem>
					))}
				</List>
			) : (
				<Typography
					variant="body2"
					color="text.secondary"
					textAlign="center"
					sx={{ py: 2 }}
				>
					No categories yet
				</Typography>
			)}
		</Box>
	);
}
