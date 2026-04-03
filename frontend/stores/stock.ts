import { Category, Stock } from "@/proto/core/v1/stock_pb";
import { create } from "zustand";

interface StockStoreData {
	stock: Stock[];
	init: (stock: Stock[]) => void;
	addStock: (stock: Stock) => void;
	updateStock: (
		id: number,
		name: string,
		quantity: number,
		categories: Category[],
	) => void;
}

export const useStockStore = create<StockStoreData>((set) => ({
	stock: [],
	init: (stock: Stock[]) =>
		set(() => ({
			stock: stock,
		})),
	addStock: (stock: Stock) =>
		set((state) => ({
			stock: [...state.stock, stock],
		})),
	updateStock: (
		id: number,
		name: string,
		quantity: number,
		categories: Category[],
	) =>
		set((state) => ({
			stock: state.stock.map((s) =>
				s.id === id ? { ...s, name, quantity, categories } : s,
			),
		})),
}));
