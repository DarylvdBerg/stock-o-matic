"use client";

import { useMemo, useState } from "react";
import { useCategoryStore, useStockStore } from "../../stores";
import { boardSort, stockStatus, STATUS_LABEL } from "@/stock-status";
import {
	isOnGroceryList,
	monitoredCategoryIds,
} from "@/grocery/grocery-filter";
import { IconCheck, IconCopy } from "@/icons";

export function GroceryList() {
	const stock = useStockStore((s) => s.stock);
	const categories = useCategoryStore((s) => s.categories);
	const monitoredIds = useMemo(
		() => monitoredCategoryIds(categories),
		[categories],
	);

	const departures = useMemo(
		() => stock.filter((s) => isOnGroceryList(s, monitoredIds)).sort(boardSort),
		[stock, monitoredIds],
	);

	const [selected, setSelected] = useState<Set<number>>(
		() =>
			new Set(
				departures
					.map((s) => s.id)
					.filter((id): id is number => id !== undefined),
			),
	);
	const [copied, setCopied] = useState(false);

	function toggle(id: number | undefined) {
		if (id === undefined) return;
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	const chosen = departures.filter(
		(s) => s.id !== undefined && selected.has(s.id),
	);

	async function copyList() {
		const text = chosen.map((s) => `- ${s.name}`).join("\n");
		if (!text) return;
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	}

	if (departures.length === 0) {
		return (
			<div className="splash" style={{ minHeight: "30vh" }}>
				<div className="splash__word">
					<span className="accent">All</span> stocked
				</div>
				<div className="splash__sub">Nothing to buy right now</div>
			</div>
		);
	}

	return (
		<>
			<div className="manifest-head">
				<span className="results-count" style={{ padding: 0 }}>
					{chosen.length} of {departures.length} selected
				</span>
				<button
					type="button"
					className="btn btn--accent"
					onClick={copyList}
					disabled={chosen.length === 0}
				>
					<IconCopy /> Copy list
				</button>
			</div>

			<div className="manifest">
				{departures.map((item) => {
					const on = item.id !== undefined && selected.has(item.id);
					const status = stockStatus(item.quantity);
					return (
						<button
							type="button"
							key={item.id}
							className="manifest__row"
							onClick={() => toggle(item.id)}
							aria-pressed={on}
						>
							<span className="check" data-on={on}>
								<IconCheck />
							</span>
							<span className="manifest__name">{item.name}</span>
							<span
								className="status"
								data-s={status}
								style={{ minWidth: "auto" }}
							>
								<span className="status__inner">
									<span className="status__dot" />
									{STATUS_LABEL[status]}
								</span>
							</span>
							<span className="manifest__qty">×{item.quantity}</span>
						</button>
					);
				})}
			</div>

			{copied && (
				<div className="toast" role="status">
					Copied to clipboard
				</div>
			)}
		</>
	);
}
