"use client";

import { useMemo, useState } from "react";
import { Category, Stock } from "@/proto/core/v1/stock_pb";
import { IconCheck, IconSearch } from "@/icons";

export function CategoryFilter({
	categories,
	stock,
	selected,
	onToggle,
	onClear,
	onClose,
}: {
	categories: Category[];
	stock: Stock[];
	selected: Set<number>;
	onToggle: (id: number | undefined) => void;
	onClear: () => void;
	onClose: () => void;
}) {
	const [query, setQuery] = useState("");

	const counts = useMemo(() => {
		const m = new Map<number, number>();
		for (const s of stock) {
			for (const c of s.categories) {
				if (c.id !== undefined) m.set(c.id, (m.get(c.id) ?? 0) + 1);
			}
		}
		return m;
	}, [stock]);

	const visible = useMemo(() => {
		const term = query.trim().toLowerCase();
		return categories.filter(
			(c) => !term || c.name.toLowerCase().includes(term),
		);
	}, [categories, query]);

	const resultCount = useMemo(() => {
		if (selected.size === 0) return stock.length;
		return stock.filter((s) =>
			s.categories.some((c) => c.id !== undefined && selected.has(c.id)),
		).length;
	}, [stock, selected]);

	return (
		<>
			<div className="search" style={{ marginBottom: "0.9rem" }}>
				<IconSearch />
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Find a category"
					aria-label="Find a category"
				/>
			</div>

			<button
				type="button"
				className="manifest__row"
				onClick={onClear}
				aria-pressed={selected.size === 0}
			>
				<span className="check" data-on={selected.size === 0}>
					<IconCheck />
				</span>
				<span className="manifest__name">All categories</span>
				<span className="manifest__qty">{stock.length}</span>
			</button>

			<div
				className="manifest"
				style={{ maxHeight: "46vh", overflowY: "auto" }}
			>
				{visible.map((c) => {
					const on = c.id !== undefined && selected.has(c.id);
					return (
						<button
							type="button"
							key={c.id}
							className="manifest__row"
							onClick={() => onToggle(c.id)}
							aria-pressed={on}
						>
							<span className="check" data-on={on}>
								<IconCheck />
							</span>
							<span className="manifest__name">{c.name}</span>
							<span className="manifest__qty">
								{c.id !== undefined ? (counts.get(c.id) ?? 0) : 0}
							</span>
						</button>
					);
				})}
				{visible.length === 0 && (
					<div className="splash" style={{ minHeight: "14vh" }}>
						<div className="splash__sub">No category matches</div>
					</div>
				)}
			</div>

			<div className="divider" />
			<div style={{ display: "flex", gap: "0.6rem" }}>
				<button
					type="button"
					className="btn btn--ghost"
					onClick={onClear}
					disabled={selected.size === 0}
				>
					Clear
				</button>
				<button
					type="button"
					className="btn btn--accent btn--block"
					onClick={onClose}
				>
					Show {resultCount} {resultCount === 1 ? "item" : "items"}
				</button>
			</div>
		</>
	);
}
