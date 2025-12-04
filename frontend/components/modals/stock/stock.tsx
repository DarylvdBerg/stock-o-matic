"use client";

import { Category, Stock } from "@/proto/core/v1/stock_pb";
import {
	Box,
	Button,
	FormControl,
	Input,
	InputLabel,
	Select,
} from "@mui/material";
import { JSX } from "react";
import { ModalMode } from "../mode";

interface StockModalProps {
	mode: ModalMode;
	data?: Stock;
	categories?: Category[];
}

export function StockModal({
	mode = ModalMode.ADD,
	data,
	categories,
}: StockModalProps): JSX.Element {
	async function addStock(formData: FormData) {}

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
						multiple
						labelId="stock-categories-select-label"
						label="Categories"
						id="stock-categories"
						name="categories"
					></Select>
				</FormControl>
				<Button type="submit">Add new stock</Button>
			</Box>
		</form>
	);
}
