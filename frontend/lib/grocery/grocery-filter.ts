import { Category, Stock } from "@/proto/core/v1/stock_pb";

/** An item needs buying when it is out of stock (quantity 0). */
export function isOutOfStock(stock: Stock): boolean {
	return stock.quantity === 0;
}

/** True when at least one category is flagged to be watched for the grocery list. */
export function anyCategoryMonitored(categories: Category[]): boolean {
	return categories.some((c) => c.monitorStock);
}

/**
 * Grocery-list membership.
 * - Item must be out of stock.
 * - If no category is monitored, every out-of-stock item qualifies (fallback).
 * - Otherwise the item must belong to at least one monitored category.
 */
export function isOnGroceryList(stock: Stock, anyMonitored: boolean): boolean {
	if (!isOutOfStock(stock)) return false;
	if (!anyMonitored) return true;
	return stock.categories.some((c) => c.monitorStock);
}
