"use client";

import { Category, Stock } from "@/proto/core/v1/stock_pb";
import {
	Box,
	Button,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
} from "@mui/material";
import { useState } from "react";
import { ModalMode } from "../mode";
import { useStockClient } from "@/hooks/stock-client";
import {
	AddStockRequest,
	UpdateStockRequest,
} from "@/proto/services/v1/stock_service_pb";
import { useCategoryStore, useStockStore } from "../../../stores";

interface StockModalProps {
	mode: ModalMode;
	data?: Stock;
	onSuccess?: () => void;
}

export function StockModal({ mode, data, onSuccess }: StockModalProps) {
	const stockClient = useStockClient();
	const categories = useCategoryStore((state) => state.categories);
	const stockStore = useStockStore();

	const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
		if (mode === ModalMode.EDIT && data) {
			return data.categories.map((c) => String(c.id));
		}
		return [];
	});

	function parseCategories(formData: FormData): Category[] {
		const categoryData =
			formData.get("categories")?.toString().split(",") ?? [];
		if (categoryData.length == 0) {
			return [];
		}
		return categoryData
			.filter((id): id is string => {
				if (typeof id !== "string") {
					console.debug("id was not a string, hence not able to parse to int");
					return false;
				}
				if (isNaN(Number(id))) {
					console.debug("id is not a valid number");
					return false;
				}
				return true;
			})
			.map((id) => {
				const category = categories.find((c) => c.id === Number(id));
				return {
					$typeName: "proto.core.v1.Category",
					id: Number(id),
					name: category?.name ?? "",
				};
			});
	}

	async function addStock(formData: FormData) {
		const parsedCategories = parseCategories(formData);

		const stock = {
			$typeName: "proto.core.v1.Stock",
			name: formData.get("title")?.toString() ?? "",
			quantity: Number(formData.get("quantity")?.toString()),
			categories: parsedCategories,
		} as Stock;

		const req: AddStockRequest = {
			$typeName: "proto.services.v1.AddStockRequest",
			stock,
		};

		const response = await stockClient.addStock(req);
		if (response.stock) {
			stockStore.addStock(response.stock);
		}
		onSuccess?.();
	}

	async function updateStock(formData: FormData) {
		const id = data?.id;
		if (id === undefined) {
			return;
		}

		const name = formData.get("title")?.toString() ?? "";
		const quantity = Number(formData.get("quantity")?.toString());
		const parsedCategories = parseCategories(formData);

		const req: UpdateStockRequest = {
			$typeName: "proto.services.v1.UpdateStockRequest",
			id,
			name,
			quantity,
			categories: parsedCategories,
		};

		await stockClient.updateStock(req);
		stockStore.updateStock(id, name, quantity, parsedCategories as Category[]);
		onSuccess?.();
	}

	const isEdit = mode === ModalMode.EDIT;

	const handleChange = (
		event: SelectChangeEvent<typeof selectedCategories>,
	) => {
		const {
			target: { value },
		} = event;

		setSelectedCategories(
			typeof value === "string" ? value.split(", ") : value,
		);
	};

	const visibleCategories = categories.filter((c) => c.name !== "");

	return (
		<form action={isEdit ? updateStock : addStock}>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
				<TextField
					label="Title"
					name="title"
					defaultValue={isEdit ? data?.name : ""}
					fullWidth
					required
				/>
				<TextField
					label="Quantity"
					name="quantity"
					type="number"
					defaultValue={isEdit ? data?.quantity : ""}
					fullWidth
					required
					slotProps={{ htmlInput: { min: 0 } }}
				/>
				<Select
					value={selectedCategories}
					multiple
					onChange={handleChange}
					displayEmpty
					label="Categories"
					name="categories"
					fullWidth
				>
					{visibleCategories.map((cat) => (
						<MenuItem key={`category-${cat.id}`} value={cat.id}>
							{cat.name}
						</MenuItem>
					))}
				</Select>
				<Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
					{isEdit ? "Update item" : "Add item"}
				</Button>
			</Box>
		</form>
	);
}
