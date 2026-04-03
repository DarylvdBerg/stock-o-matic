"use client";

import { Category, Stock } from "@/proto/core/v1/stock_pb";
import {
	Box,
	Button,
	FormControl,
	Input,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
} from "@mui/material";
import { JSX, useEffect, useState } from "react";
import { ModalMode } from "../mode";
import { useStockClient } from "@/hooks/stock-client";
import {
	AddStockRequest,
	UpdateStockRequest,
} from "@/proto/services/v1/stock_service_pb";
import { useCategoryClient } from "@/hooks/category-client";
import { useStockStore } from "../../../stores";

interface StockModalProps {
	mode: ModalMode;
	data?: Stock;
	categories?: Category[];
}

export function StockModal({ mode, data }: StockModalProps): JSX.Element {
	const stockClient = useStockClient();
	const categoryClient = useCategoryClient();
	const [categoryState, setCategories] = useState<Category[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		() => {
			if (mode === ModalMode.EDIT && data) {
				return data.categories.map((c) => String(c.id));
			}
			return [];
		},
	);

	const stockStore = useStockStore();

	useEffect(() => {
		categoryClient.getCategories().then((res) => setCategories(res.categories));
	}, [categoryClient]);

	function parseCategories(formData: FormData): Category[] {
		const categoryData =
			formData.get("categories")?.toString().split(",") ?? [];
		if (categoryData.length == 0) {
			return [];
		}
		return categoryData
			.filter((id): id is string => {
				if (typeof id !== "string") {
					console.debug(
						"id was not a string, hence not able to parse to int",
					);
					return false;
				}
				if (isNaN(Number(id))) {
					console.debug("id is not a valid number");
					return false;
				}
				return true;
			})
			.map((id) => {
				const category = categoryState.find((c) => c.id === Number(id));
				return {
					$typeName: "proto.core.v1.Category",
					id: Number(id),
					name: category?.name ?? "",
				};
			});
	}

	async function addStock(formData: FormData) {
		const categories = parseCategories(formData);

		const stock = {
			$typeName: "proto.core.v1.Stock",
			name: formData.get("title")?.toString() ?? "",
			quantity: Number(formData.get("quantity")?.toString()),
			categories: categories,
		} as Stock;

		const req: AddStockRequest = {
			$typeName: "proto.services.v1.AddStockRequest",
			stock,
		};

		const response = await stockClient.addStock(req);
		if (response.stock) {
			stockStore.addStock(response.stock);
		}
	}

	async function updateStock(formData: FormData) {
		const id = data?.id;
		if (id === undefined) {
			return;
		}

		const name = formData.get("title")?.toString() ?? "";
		const quantity = Number(formData.get("quantity")?.toString());
		const categories = parseCategories(formData);

		const req: UpdateStockRequest = {
			$typeName: "proto.services.v1.UpdateStockRequest",
			id,
			name,
			quantity,
			categories,
		};

		await stockClient.updateStock(req);
		stockStore.updateStock(id, name, quantity, categories as Category[]);
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

	return (
		<form action={isEdit ? updateStock : addStock}>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				<FormControl fullWidth>
					<InputLabel htmlFor="stock-title">Title</InputLabel>
					<Input
						id="stock-title"
						name="title"
						defaultValue={isEdit ? data?.name : ""}
					/>
				</FormControl>
				<FormControl fullWidth>
					<InputLabel htmlFor="stock-quantity">Quantity</InputLabel>
					<Input
						id="stock-quantity"
						name="quantity"
						defaultValue={isEdit ? data?.quantity : ""}
					/>
				</FormControl>
				<FormControl fullWidth>
					<InputLabel
						htmlFor="stock-categories"
						id="stock-categories-select-label"
					>
						Categories
					</InputLabel>
					<Select
						value={selectedCategories}
						multiple
						onChange={handleChange}
						labelId="stock-categories-select-label"
						label="Categories"
						id="stock-categories"
						name="categories"
					>
						{categoryState.map((cat) => (
							<MenuItem key={`category-${cat.id}`} value={cat.id}>
								{cat.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Button type="submit">
					{isEdit ? "Update stock" : "Add new stock"}
				</Button>
			</Box>
		</form>
	);
}
