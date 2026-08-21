import { Stock } from "@/proto/core/v1/stock_pb";

export type StockStatus = "ok" | "low" | "out";

/** OUT at 0, LOW at 1, STOCKED at 2+. */
export function stockStatus(quantity: number): StockStatus {
	if (quantity <= 0) return "out";
	if (quantity <= 1) return "low";
	return "ok";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
	ok: "Stocked",
	low: "Low",
	out: "Out",
};

/** An item is a "departure" (needs buying) when it's out or low. */
export function isDeparture(quantity: number): boolean {
	return quantity <= 1;
}

/** Analog fill readout, 0–100%. */
export function fillPct(quantity: number): number {
	return Math.max(0, Math.min(100, quantity * 20));
}

/** Departures first (out before low), then stocked, then alphabetical. */
export function boardSort(a: Stock, b: Stock): number {
	const rank = (q: number) => (q <= 0 ? 0 : q <= 1 ? 1 : 2);
	const ra = rank(a.quantity);
	const rb = rank(b.quantity);
	if (ra !== rb) return ra - rb;
	return a.name.localeCompare(b.name);
}
