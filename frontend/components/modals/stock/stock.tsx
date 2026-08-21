"use client";

import { Category, Stock } from "@/proto/core/v1/stock_pb";
import {
	AddStockRequest,
	UpdateStockRequest,
} from "@/proto/services/v1/stock_service_pb";
import React, { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Area, CropperProps } from "react-easy-crop";
import { ModalMode } from "../mode";
import { useStockClient } from "@/hooks/stock-client";
import { useCategoryStore, useStockStore } from "../../../stores";
import { deleteImage, uploadImage } from "@/client/image-client";
import { getCroppedImage } from "@/utils/crop-image";
import { FlapNumber } from "@/flap/flap";
import {
	IconCamera,
	IconClose,
	IconCrop,
	IconMinus,
	IconPlus,
	IconTrash,
} from "@/icons";

const Cropper = dynamic(() => import("react-easy-crop"), {
	ssr: false,
}) as React.ComponentType<Partial<CropperProps>>;

interface StockModalProps {
	mode: ModalMode;
	data?: Stock;
	onSuccess?: () => void;
	onDelete?: () => void;
}

export function StockModal({
	mode,
	data,
	onSuccess,
	onDelete,
}: StockModalProps) {
	const isEdit = mode === ModalMode.EDIT;
	const stockClient = useStockClient();
	const categories = useCategoryStore((s) => s.categories);
	const addStockToStore = useStockStore((s) => s.addStock);
	const updateStockInStore = useStockStore((s) => s.updateStock);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [name, setName] = useState(data?.name ?? "");
	const [quantity, setQuantity] = useState<number>(data?.quantity ?? 1);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(
		() =>
			new Set(
				(data?.categories ?? [])
					.map((c) => c.id)
					.filter((id): id is number => id !== undefined),
			),
	);
	const [submitting, setSubmitting] = useState(false);

	// image state
	const [croppedFile, setCroppedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		isEdit && data?.imageUrl ? data.imageUrl : null,
	);
	const [cropSrc, setCropSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedArea, setCroppedArea] = useState<Area | null>(null);

	const onCropComplete = useCallback((_: Area, pixels: Area) => {
		setCroppedArea(pixels);
	}, []);

	function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		if (file) {
			setCropSrc(URL.createObjectURL(file));
			setCrop({ x: 0, y: 0 });
			setZoom(1);
		}
	}

	async function handleCropConfirm() {
		if (!cropSrc || !croppedArea) return;
		const file = await getCroppedImage(cropSrc, croppedArea);
		setCroppedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
		setCropSrc(null);
	}

	function clearImage() {
		if (data?.imageUrl) deleteImage(data.imageUrl);
		setCroppedFile(null);
		setPreviewUrl(null);
		setCropSrc(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	async function resolveImageUrl(): Promise<string> {
		if (croppedFile) {
			if (data?.imageUrl) deleteImage(data.imageUrl);
			return await uploadImage(croppedFile);
		}
		if (previewUrl && data?.imageUrl) return data.imageUrl;
		return "";
	}

	function buildCategories(): Category[] {
		return categories
			.filter((c) => c.id !== undefined && selectedIds.has(c.id))
			.map((c) => ({
				$typeName: "proto.core.v1.Category" as const,
				id: c.id,
				name: c.name,
				monitorStock: c.monitorStock,
			}));
	}

	function toggleCat(id: number | undefined) {
		if (id === undefined) return;
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed || submitting) return;
		setSubmitting(true);
		try {
			const cats = buildCategories();
			const imageUrl = await resolveImageUrl();
			if (isEdit && data?.id !== undefined) {
				const req: UpdateStockRequest = {
					$typeName: "proto.services.v1.UpdateStockRequest",
					id: data.id,
					name: trimmed,
					quantity,
					categories: cats,
					imageUrl,
				};
				await stockClient.updateStock(req);
				updateStockInStore(data.id, trimmed, quantity, cats, imageUrl);
			} else {
				const stock = {
					$typeName: "proto.core.v1.Stock",
					name: trimmed,
					quantity,
					categories: cats,
					imageUrl,
				} as Stock;
				const req: AddStockRequest = {
					$typeName: "proto.services.v1.AddStockRequest",
					stock,
				};
				const res = await stockClient.addStock(req);
				if (res.stock) addStockToStore(res.stock);
			}
			onSuccess?.();
		} finally {
			setSubmitting(false);
		}
	}

	const visibleCategories = categories.filter((c) => c.name !== "");

	// ---- crop stage ----
	if (cropSrc) {
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				<div className="crop-stage">
					<Cropper
						image={cropSrc}
						crop={crop}
						zoom={zoom}
						aspect={4 / 3}
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onCropComplete={onCropComplete}
					/>
				</div>
				<div className="field">
					<label>Zoom</label>
					<input
						className="range"
						type="range"
						min={1}
						max={3}
						step={0.05}
						value={zoom}
						onChange={(e) => setZoom(Number(e.target.value))}
					/>
				</div>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<button
						type="button"
						className="btn btn--ghost btn--block"
						onClick={() => setCropSrc(null)}
					>
						Cancel
					</button>
					<button
						type="button"
						className="btn btn--accent btn--block"
						onClick={handleCropConfirm}
					>
						<IconCrop /> Crop
					</button>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit}>
			{/* image */}
			<div className="field">
				{previewUrl ? (
					<div className="imgpreview">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={previewUrl} alt="Preview" />
						<button
							type="button"
							className="iconbtn"
							onClick={clearImage}
							aria-label="Remove photo"
						>
							<IconClose />
						</button>
					</div>
				) : (
					<button
						type="button"
						className="imgdrop"
						onClick={() => fileInputRef.current?.click()}
					>
						<IconCamera />
						Add a photo
					</button>
				)}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					capture="environment"
					onChange={handleFile}
					hidden
				/>
			</div>

			<div className="field">
				<label htmlFor="item-name">Name</label>
				<input
					id="item-name"
					className="input"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. Coffee beans"
					autoFocus={!isEdit}
					required
				/>
			</div>

			<div className="field field--row">
				<label>Quantity</label>
				<div className="qty">
					<button
						type="button"
						className="qtybtn"
						onClick={() => setQuantity((q) => Math.max(0, q - 1))}
						disabled={quantity <= 0}
						aria-label="Decrease quantity"
					>
						<IconMinus />
					</button>
					<span className="qty__count">
						<FlapNumber value={quantity} minDigits={2} />
					</span>
					<button
						type="button"
						className="qtybtn"
						onClick={() => setQuantity((q) => q + 1)}
						aria-label="Increase quantity"
					>
						<IconPlus />
					</button>
				</div>
			</div>

			{visibleCategories.length > 0 && (
				<div className="field">
					<label>Categories</label>
					<div className="tracks" role="group" aria-label="Categories">
						{visibleCategories.map((c) => (
							<button
								type="button"
								key={c.id}
								className="track"
								aria-pressed={c.id !== undefined && selectedIds.has(c.id)}
								onClick={() => toggleCat(c.id)}
							>
								{c.name}
							</button>
						))}
					</div>
				</div>
			)}

			<button
				type="submit"
				className="btn btn--accent btn--block"
				disabled={!name.trim() || submitting}
				style={{ marginTop: "0.5rem" }}
			>
				{isEdit ? "Save changes" : "Add to board"}
			</button>

			{isEdit && onDelete && (
				<button
					type="button"
					className="btn btn--ghost btn--block"
					onClick={onDelete}
					style={{ marginTop: "0.6rem", color: "var(--out)" }}
				>
					<IconTrash /> Remove from board
				</button>
			)}
		</form>
	);
}
