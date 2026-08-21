import { Category, Stock } from "@/proto/core/v1/stock_pb";

/** An item needs buying when it is out of stock (quantity 0). */
export function isOutOfStock(stock: Stock): boolean {
	return stock.quantity === 0;
}

/**
 * The ids of categories flagged to be watched for the grocery list.
 * Sourced from the category store (the single source of truth for the flag) —
 * NOT from the possibly-stale `monitorStock` embedded on each stock's categories.
 */
export function monitoredCategoryIds(categories: Category[]): Set<number> {
	const ids = new Set<number>();
	for (const c of categories) {
		if (c.monitorStock && c.id !== undefined) ids.add(c.id);
	}
	return ids;
}

/**
 * Grocery-list membership.
 * - Item must be out of stock.
 * - If no category is monitored, every out-of-stock item qualifies (fallback).
 * - Otherwise the item must belong to at least one monitored category, matched
 *   by category id so a stale embedded `monitorStock` flag can never mislead.
 */
export function isOnGroceryList(
	stock: Stock,
	monitoredIds: Set<number>,
): boolean {
	if (!isOutOfStock(stock)) return false;
	if (monitoredIds.size === 0) return true;
	return stock.categories.some(
		(c) => c.id !== undefined && monitoredIds.has(c.id),
	);
}
