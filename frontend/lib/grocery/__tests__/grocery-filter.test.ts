import { Category, Stock } from "@/proto/core/v1/stock_pb";
import {
	isOutOfStock,
	monitoredCategoryIds,
	isOnGroceryList,
} from "../grocery-filter";

function cat(id: number, monitorStock: boolean): Category {
	return { id, name: `c${id}`, monitorStock } as unknown as Category;
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

describe("monitoredCategoryIds", () => {
	it("collects ids of monitored categories only", () => {
		const ids = monitoredCategoryIds([
			cat(1, true),
			cat(2, false),
			cat(3, true),
		]);
		expect([...ids].sort()).toEqual([1, 3]);
	});
	it("is empty when none are monitored", () => {
		expect(monitoredCategoryIds([cat(1, false)]).size).toBe(0);
	});
	it("is empty for an empty list", () => {
		expect(monitoredCategoryIds([]).size).toBe(0);
	});
});

describe("isOnGroceryList", () => {
	it("excludes items that are not out of stock (qty 1 or 2)", () => {
		expect(isOnGroceryList(item(1, [cat(1, true)]), new Set([1]))).toBe(false);
		expect(isOnGroceryList(item(2, [cat(1, true)]), new Set([1]))).toBe(false);
	});

	it("fallback: with no monitored category, every out-of-stock item qualifies", () => {
		expect(isOnGroceryList(item(0, []), new Set())).toBe(true);
		expect(isOnGroceryList(item(0, [cat(1, false)]), new Set())).toBe(true);
	});

	it("filtering active: only out-of-stock items in a monitored category qualify", () => {
		expect(isOnGroceryList(item(0, [cat(1, true)]), new Set([1]))).toBe(true);
		expect(isOnGroceryList(item(0, [cat(2, false)]), new Set([1]))).toBe(false);
	});

	it("filtering active: uncategorized out-of-stock item is excluded", () => {
		expect(isOnGroceryList(item(0, []), new Set([1]))).toBe(false);
	});

	it("filtering active: multi-category item with one monitored is included", () => {
		expect(
			isOnGroceryList(item(0, [cat(1, false), cat(2, true)]), new Set([2])),
		).toBe(true);
	});

	// Regression (final-review Critical): the monitored decision must come from
	// the passed-in ids (category store), NOT the stale monitorStock embedded on
	// stock.categories.
	it("matches by id even when the embedded monitorStock flag is stale-false", () => {
		// Category 1 was just toggled ON; the stock's embedded copy still says false.
		expect(isOnGroceryList(item(0, [cat(1, false)]), new Set([1]))).toBe(true);
	});

	it("ignores a stale-true embedded flag when that category id is not monitored", () => {
		// Category 2 was just toggled OFF; the stock's embedded copy still says true.
		expect(isOnGroceryList(item(0, [cat(2, true)]), new Set([1]))).toBe(false);
	});
});
