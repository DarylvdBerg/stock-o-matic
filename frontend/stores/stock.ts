import { Stock } from "@/proto/core/v1/stock_pb";
import { create } from "zustand";

interface StockStoreData {
	stock: Stock[];
	addStock: (stock: Stock) => void;
}

const useStockStore = create<StockStoreData>((set) => ({
	stock: [],
	addStock: (stock: Stock) =>
		set((state) => ({
			stock: [...state.stock, stock],
		})),
}));
