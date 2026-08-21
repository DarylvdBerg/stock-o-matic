"use client";

import { useState } from "react";
import { Category } from "@/proto/core/v1/stock_pb";
import { useCategoryClient } from "@/hooks/category-client";
import { useCategoryStore, useStockStore } from "../../stores";
import { IconPlus, IconEdit, IconTrash, IconCheck, IconClose } from "@/icons";

export function CategoriesManager() {
	const categoryClient = useCategoryClient();
	const categories = useCategoryStore((s) => s.categories);
	const addToStore = useCategoryStore((s) => s.addCategory);
	const updateInStore = useCategoryStore((s) => s.updateCategory);
	const deleteFromStore = useCategoryStore((s) => s.deleteCategory);
	const removeFromAllStock = useStockStore((s) => s.removeCategoryFromAll);

	const [newName, setNewName] = useState("");
	const [newMonitor, setNewMonitor] = useState(false);
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
				monitorStock: newMonitor,
			},
		});
		const res = await categoryClient.getCategories();
		const added = res.categories.find((c) => c.name === name);
		if (added) addToStore(added);
		setNewName("");
		setNewMonitor(false);
	}

	async function handleUpdate(cat: Category) {
		if (cat.id === undefined) return;
		const name = editingName.trim();
		if (!name) return;
		await categoryClient.updateCategory({
			$typeName: "proto.services.v1.UpdateCategoryRequest",
			id: cat.id,
			name,
			monitorStock: cat.monitorStock,
		});
		updateInStore(cat.id, name, cat.monitorStock);
		setEditingId(null);
		setEditingName("");
	}

	async function handleToggleMonitor(cat: Category) {
		if (cat.id === undefined) return;
		const next = !cat.monitorStock;
		await categoryClient.updateCategory({
			$typeName: "proto.services.v1.UpdateCategoryRequest",
			id: cat.id,
			name: cat.name,
			monitorStock: next,
		});
		updateInStore(cat.id, cat.name, next);
	}

	async function handleDelete(id: number) {
		await categoryClient.deleteCategory({
			$typeName: "proto.services.v1.DeleteCategoryRequest",
			id,
		});
		deleteFromStore(id);
		removeFromAllStock(id);
	}

	function startEdit(id: number, name: string) {
		setEditingId(id);
		setEditingName(name);
	}

	const visible = categories.filter((c) => c.name !== "");

	return (
		<>
			<div className="cat-add">
				<input
					className="input"
					placeholder="New category"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAdd()}
					aria-label="New category name"
				/>
				<button
					type="button"
					className="btn btn--accent"
					onClick={handleAdd}
					disabled={!newName.trim()}
				>
					<IconPlus /> Add
				</button>
			</div>
			<button
				type="button"
				className="toggle"
				data-on={newMonitor}
				onClick={() => setNewMonitor((v) => !v)}
				style={{ marginBottom: "1.1rem" }}
			>
				<span className="toggle__sw" />
				Watch for grocery list
			</button>

			{visible.length > 0 ? (
				<div>
					{visible.map((cat) => (
						<div className="cat-row" key={cat.id}>
							{editingId === cat.id ? (
								<>
									<input
										className="input"
										value={editingName}
										autoFocus
										onChange={(e) => setEditingName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleUpdate(cat);
											if (e.key === "Escape") setEditingId(null);
										}}
									/>
									<button
										type="button"
										className="iconbtn"
										onClick={() => handleUpdate(cat)}
										aria-label="Save"
									>
										<IconCheck />
									</button>
									<button
										type="button"
										className="iconbtn"
										onClick={() => setEditingId(null)}
										aria-label="Cancel"
									>
										<IconClose />
									</button>
								</>
							) : (
								<>
									<span className="cat-row__name">{cat.name}</span>
									<button
										type="button"
										className="toggle"
										data-on={cat.monitorStock}
										onClick={() => handleToggleMonitor(cat)}
										aria-label={`Watch ${cat.name} for grocery list`}
										title="Watch for grocery list"
									>
										<span className="toggle__sw" />
									</button>
									<button
										type="button"
										className="iconbtn"
										onClick={() =>
											cat.id !== undefined && startEdit(cat.id, cat.name)
										}
										aria-label={`Edit ${cat.name}`}
									>
										<IconEdit />
									</button>
									<button
										type="button"
										className="iconbtn"
										onClick={() => cat.id !== undefined && handleDelete(cat.id)}
										aria-label={`Delete ${cat.name}`}
									>
										<IconTrash />
									</button>
								</>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="splash" style={{ minHeight: "22vh" }}>
					<div className="splash__sub">No categories yet</div>
				</div>
			)}
		</>
	);
}
