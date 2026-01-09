import { Stock } from "@/proto/core/v1/stock_pb";
import { create } from "zustand";

interface StockStoreData {
	stock: Stock[];
	init: (stock: Stock[]) => void;
	addStock: (stock: Stock) => void;
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
}));
