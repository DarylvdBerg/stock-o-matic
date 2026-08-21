import { Category } from "@/proto/core/v1/stock_pb";
import { create } from "zustand";

interface CategoryStoreData {
	categories: Category[];
	init: (categories: Category[]) => void;
	addCategory: (category: Category) => void;
	updateCategory: (id: number, name: string, monitorStock: boolean) => void;
	deleteCategory: (id: number) => void;
}

export const useCategoryStore = create<CategoryStoreData>((set) => ({
	categories: [],
	init: (categories: Category[]) =>
		set(() => ({
			categories,
		})),
	addCategory: (category: Category) =>
		set((state) => ({
			categories: [...state.categories, category],
		})),
	updateCategory: (id: number, name: string, monitorStock: boolean) =>
		set((state) => ({
			categories: state.categories.map((c) =>
				c.id === id ? { ...c, name, monitorStock } : c,
			),
		})),
	deleteCategory: (id: number) =>
		set((state) => ({
			categories: state.categories.filter((c) => c.id !== id),
		})),
}));
