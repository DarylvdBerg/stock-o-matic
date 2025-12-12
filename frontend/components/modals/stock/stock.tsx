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
import { AddStockRequest } from "@/proto/services/v1/stock_service_pb";
import { useCategoryClient } from "@/hooks/category-client";

interface StockModalProps {
	mode: ModalMode;
	data?: Stock;
	categories?: Category[];
}

export function StockModal({}: StockModalProps): JSX.Element {
	const stockClient = useStockClient();
	const categoryClient = useCategoryClient();
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

	useEffect(() => {
		categoryClient.getCategories().then((res) => setCategories(res.categories));
	}, []);

	async function addStock(formData: FormData) {
		let categories: Category[] = [];
		const categoryData =
			formData.get("categories")?.toString().split(",") ?? [];
		console.log(categoryData);
		if (categoryData.length != 0) {
			categories = categoryData
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
				.map((id) => ({
					$typeName: "proto.core.v1.Category",
					id: Number(id),
					name: "",
				}));
		}

		console.log(categories);

		const req: AddStockRequest = {
			$typeName: "proto.services.v1.AddStockRequest",
			stock: {
				$typeName: "proto.core.v1.Stock",
				name: formData.get("title")?.toString() ?? "",
				quantity: Number(formData.get("quantity")?.toString()),
				categories: categories,
			},
		};

		await stockClient.addStock(req);
	}

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
		<form action={addStock}>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				<FormControl fullWidth>
					<InputLabel htmlFor="stock-title">Title</InputLabel>
					<Input id="stock-title" name="title" />
				</FormControl>
				<FormControl fullWidth>
					<InputLabel htmlFor="stock-quantity">Quantity</InputLabel>
					<Input id="stock-quantity" name="quantity" />
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
						{categories.map((cat) => (
							<MenuItem value={cat.id}>{cat.name}</MenuItem>
						))}
					</Select>
				</FormControl>
				<Button type="submit">Add new stock</Button>
			</Box>
		</form>
	);
}
