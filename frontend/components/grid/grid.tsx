"use client";

import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { GetCategoriesResponse } from "@/proto/services/v1/category_service_pb";
import { Stock } from "@/proto/core/v1/stock_pb";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useCategoryStore, useStockStore } from "../../stores";
import { useStockClient } from "@/hooks/stock-client";
import { deleteImage } from "@/client/image-client";
import { FlapNumber } from "@/flap/flap";
import { Panel } from "@/panel/panel";
import { StockModal } from "@/modals";
import { ModalMode } from "@/modals";
import { CategoriesManager } from "@/categories";
import { GroceryList } from "@/grocery-list";
import { IconSearch, IconPlus, IconMinus, IconArrow, IconTag } from "@/icons";
import { stockStatus, STATUS_LABEL, fillPct, boardSort } from "@/stock-status";
import {
	isOnGroceryList,
	monitoredCategoryIds,
} from "@/grocery/grocery-filter";

interface GridProps {
	stock: Promise<GetStockResponse>;
	categories: Promise<GetCategoriesResponse>;
}

type PanelKind = "add" | "categories" | "departures" | null;

export function Grid({ stock, categories }: GridProps) {
	const stockResponse = use(stock);
	const categoriesResponse = use(categories);

	const stockClient = useStockClient();
	const initStock = useStockStore((s) => s.init);
	const initCategories = useCategoryStore((s) => s.init);
	const deleteStockFromStore = useStockStore((s) => s.deleteStock);
	const updateStockInStore = useStockStore((s) => s.updateStock);

	const initialized = useRef(false);
	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true;
			initStock(stockResponse.stocks);
			initCategories(categoriesResponse.categories);
		}
	}, [
		stockResponse.stocks,
		categoriesResponse.categories,
		initStock,
		initCategories,
	]);

	const storeStock = useStockStore((s) => s.stock);
	const storeCategories = useCategoryStore((s) => s.categories);

	const [search, setSearch] = useState("");
	const [debounced, setDebounced] = useState("");
	const [activeCat, setActiveCat] = useState<number | null>(null);
	const [panel, setPanel] = useState<PanelKind>(null);
	const [editItem, setEditItem] = useState<Stock | null>(null);

	useEffect(() => {
		const t = setTimeout(() => setDebounced(search), 250);
		return () => clearTimeout(t);
	}, [search]);

	async function handleQuantity(item: Stock, delta: number) {
		if (item.id === undefined) return;
		const quantity = Math.max(0, item.quantity + delta);
		if (quantity === item.quantity) return;
		await stockClient.updateStock({
			$typeName: "proto.services.v1.UpdateStockRequest",
			id: item.id,
			name: item.name,
			quantity,
			categories: item.categories,
			imageUrl: item.imageUrl,
		});
		updateStockInStore(
			item.id,
			item.name,
			quantity,
			item.categories,
			item.imageUrl,
		);
	}

	async function handleDelete(item: Stock) {
		if (item.id === undefined) return;
		await stockClient.deleteStock({
			$typeName: "proto.services.v1.DeleteStockRequest",
			id: item.id,
		});
		if (item.imageUrl) deleteImage(item.imageUrl);
		deleteStockFromStore(item.id);
		setEditItem(null);
	}

	const tracks = useMemo(
		() => storeCategories.filter((c) => c.name !== ""),
		[storeCategories],
	);

	const rows = useMemo(() => {
		let result = storeStock;
		if (activeCat !== null) {
			result = result.filter((s) =>
				s.categories.some((c) => c.id === activeCat),
			);
		}
		if (debounced) {
			const q = debounced.toLowerCase();
			result = result.filter((s) => s.name.toLowerCase().includes(q));
		}
		return [...result].sort(boardSort);
	}, [storeStock, activeCat, debounced]);

	const monitoredIds = useMemo(
		() => monitoredCategoryIds(storeCategories),
		[storeCategories],
	);
	const departures = useMemo(
		() => storeStock.filter((s) => isOnGroceryList(s, monitoredIds)).length,
		[storeStock, monitoredIds],
	);

	const hasFilter = debounced !== "" || activeCat !== null;

	return (
		<main className="board-main">
			<div className="controls">
				<div className="search">
					<IconSearch />
					<input
						type="search"
						placeholder="Search the board"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						aria-label="Search items"
					/>
				</div>
				{tracks.length > 0 && (
					<div className="tracks" role="group" aria-label="Filter by category">
						<button
							type="button"
							className="track"
							aria-pressed={activeCat === null}
							onClick={() => setActiveCat(null)}
						>
							All
						</button>
						{tracks.map((c) => (
							<button
								type="button"
								key={c.id}
								className="track"
								aria-pressed={activeCat === c.id}
								onClick={() =>
									setActiveCat(activeCat === c.id ? null : (c.id ?? null))
								}
							>
								{c.name}
							</button>
						))}
					</div>
				)}
			</div>

			<div className="col-head" aria-hidden="true">
				<span>Item</span>
				<span>Qty</span>
				<span>Status</span>
			</div>

			{rows.length > 0 ? (
				<div className="rows">
					{rows.map((item) => {
						const status = stockStatus(item.quantity);
						const cats = item.categories
							.filter((c) => c.name !== "")
							.map((c) => c.name)
							.join(" · ");
						return (
							<div className="row" data-status={status} key={item.id}>
								<button
									type="button"
									className="row__id"
									onClick={() => setEditItem(item)}
								>
									<span className="thumb">
										{item.imageUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={item.imageUrl} alt="" />
										) : (
											<span>{item.name.charAt(0) || "?"}</span>
										)}
									</span>
									<span className="row__idtext">
										<span className="row__name">{item.name}</span>
										<span className="row__meta">
											<span
												className="fill"
												style={
													{
														"--fill": fillPct(item.quantity) / 100,
													} as React.CSSProperties
												}
											/>
											{cats && <span className="row__cats">{cats}</span>}
										</span>
									</span>
								</button>

								<div className="qty">
									<button
										type="button"
										className="qtybtn"
										onClick={() => handleQuantity(item, -1)}
										disabled={item.quantity <= 0}
										aria-label={`Decrease ${item.name}`}
									>
										<IconMinus />
									</button>
									<span className="qty__count">
										<FlapNumber value={item.quantity} minDigits={2} />
									</span>
									<button
										type="button"
										className="qtybtn"
										onClick={() => handleQuantity(item, 1)}
										aria-label={`Increase ${item.name}`}
									>
										<IconPlus />
									</button>
								</div>

								<span className="status" data-s={status}>
									<span key={status} className="flip-swap status__inner">
										<span className="status__dot" />
										{STATUS_LABEL[status]}
									</span>
								</span>
							</div>
						);
					})}
				</div>
			) : (
				<div className="splash">
					<div className="boarding" aria-hidden="true">
						<i />
						<i />
						<i />
						<i />
					</div>
					<div className="splash__word">
						{hasFilter ? "No match" : "Empty board"}
					</div>
					<div className="splash__sub">
						{hasFilter
							? "Adjust the search or track"
							: "Add your first item to the board"}
					</div>
				</div>
			)}

			{/* Bottom control deck */}
			<div className="deck">
				<button
					type="button"
					className="departures-bar"
					onClick={() => setPanel("departures")}
				>
					<span className="departures-bar__n code-type">{departures}</span>
					<span className="departures-bar__label">
						Departures
						<small>{departures === 1 ? "1 item to buy" : "items to buy"}</small>
					</span>
					<span className="departures-bar__go" aria-hidden="true">
						<IconArrow />
					</span>
				</button>
				<button
					type="button"
					className="deckbtn deckbtn--accent"
					onClick={() => setPanel("add")}
					aria-label="Add item"
				>
					<IconPlus />
				</button>
				<button
					type="button"
					className="deckbtn"
					onClick={() => setPanel("categories")}
					aria-label="Manage categories"
				>
					<IconTag />
				</button>
			</div>

			{panel === "add" && (
				<Panel title="Add item" onClose={() => setPanel(null)}>
					<StockModal mode={ModalMode.ADD} onSuccess={() => setPanel(null)} />
				</Panel>
			)}
			{panel === "categories" && (
				<Panel title="Categories" onClose={() => setPanel(null)}>
					<CategoriesManager />
				</Panel>
			)}
			{panel === "departures" && (
				<Panel title="Departures" onClose={() => setPanel(null)}>
					<GroceryList />
				</Panel>
			)}
			{editItem && (
				<Panel title="Edit item" onClose={() => setEditItem(null)}>
					<StockModal
						mode={ModalMode.EDIT}
						data={editItem}
						onSuccess={() => setEditItem(null)}
						onDelete={() => handleDelete(editItem)}
					/>
				</Panel>
			)}
		</main>
	);
}
