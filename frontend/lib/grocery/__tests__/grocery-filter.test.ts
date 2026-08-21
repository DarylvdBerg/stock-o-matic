import { Category, Stock } from "@/proto/core/v1/stock_pb";
import {
	anyCategoryMonitored,
	isOutOfStock,
	isOnGroceryList,
} from "../grocery-filter";

function cat(monitorStock: boolean): Category {
	return { name: "c", monitorStock } as unknown as Category;
}

function item(quantity: number, cats: Category[] = []): Stock {
	return { name: "s", quantity, categories: cats } as unknown as Stock;
}

describe("isOutOfStock", () => {
	it("is true only at 0, false at 1 and 2", () => {
		expect(isOutOfStock(item(0))).toBe(true);
		expect(isOutOfStock(item(1))).toBe(false);
		expect(isOutOfStock(item(2))).toBe(false);
	});
});

describe("anyCategoryMonitored", () => {
	it("is false when none are monitored", () => {
		expect(anyCategoryMonitored([cat(false), cat(false)])).toBe(false);
	});
	it("is true when at least one is monitored", () => {
		expect(anyCategoryMonitored([cat(false), cat(true)])).toBe(true);
	});
	it("is false for an empty list", () => {
		expect(anyCategoryMonitored([])).toBe(false);
	});
});

describe("isOnGroceryList", () => {
	it("excludes items that are not out of stock (qty 1 or 2)", () => {
		expect(isOnGroceryList(item(1, [cat(true)]), true)).toBe(false);
		expect(isOnGroceryList(item(2, [cat(true)]), true)).toBe(false);
	});

	it("fallback: with no monitored category, every out-of-stock item qualifies", () => {
		expect(isOnGroceryList(item(0, []), false)).toBe(true);
		expect(isOnGroceryList(item(0, [cat(false)]), false)).toBe(true);
	});

	it("filtering active: only out-of-stock items in a monitored category qualify", () => {
		expect(isOnGroceryList(item(0, [cat(true)]), true)).toBe(true);
		expect(isOnGroceryList(item(0, [cat(false)]), true)).toBe(false);
	});

	it("filtering active: uncategorized out-of-stock item is excluded", () => {
		expect(isOnGroceryList(item(0, []), true)).toBe(false);
	});

	it("filtering active: multi-category item with one monitored is included", () => {
		expect(isOnGroceryList(item(0, [cat(false), cat(true)]), true)).toBe(true);
	});
});
