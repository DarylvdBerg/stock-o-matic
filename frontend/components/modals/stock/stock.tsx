"use client";

import { Category, Stock } from "@/proto/core/v1/stock_pb";
import {
	Box,
	Button,
	IconButton,
	MenuItem,
	Select,
	SelectChangeEvent,
	Slider,
	TextField,
	Typography,
} from "@mui/material";
import React, { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Area, CropperProps } from "react-easy-crop";
import { ModalMode } from "../mode";
import { useStockClient } from "@/hooks/stock-client";
import {
	AddStockRequest,
	UpdateStockRequest,
} from "@/proto/services/v1/stock_service_pb";
import { useCategoryStore, useStockStore } from "../../../stores";
import { useActionClose } from "../../actions/action-context";
import { deleteImage, uploadImage } from "@/client/image-client";
import { getCroppedImage } from "@/utils/crop-image";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CropIcon from "@mui/icons-material/Crop";
import CloseIcon from "@mui/icons-material/Close";

const Cropper = dynamic(() => import("react-easy-crop"), {
	ssr: false,
}) as React.ComponentType<Partial<CropperProps>>;

interface StockModalProps {
	mode: ModalMode;
	data?: Stock;
	onSuccess?: () => void;
}

export function StockModal({ mode, data, onSuccess }: StockModalProps) {
	const stockClient = useStockClient();
	const categories = useCategoryStore((state) => state.categories);
	const stockStore = useStockStore();
	const actionClose = useActionClose();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
		if (mode === ModalMode.EDIT && data) {
			return data.categories.map((c) => String(c.id));
		}
		return [];
	});

	// Image state
	const [croppedFile, setCroppedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
		if (mode === ModalMode.EDIT && data?.imageUrl) {
			return data.imageUrl;
		}
		return null;
	});

	// Cropper state
	const [cropSrc, setCropSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedArea, setCroppedArea] = useState<Area | null>(null);

	const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
		setCroppedArea(croppedAreaPixels);
	}, []);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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

	function handleCropCancel() {
		setCropSrc(null);
	}

	function clearImage() {
		// Delete the existing image from the server if it was a saved one
		if (data?.imageUrl) {
			deleteImage(data.imageUrl);
		}
		setCroppedFile(null);
		setPreviewUrl(null);
		setCropSrc(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	async function resolveImageUrl(): Promise<string> {
		if (croppedFile) {
			// Delete old image if replacing with a new one
			if (data?.imageUrl) {
				deleteImage(data.imageUrl);
			}
			return await uploadImage(croppedFile);
		}
		if (previewUrl && data?.imageUrl) {
			return data.imageUrl;
		}
		return "";
	}

	function parseCategories(formData: FormData): Category[] {
		const raw = formData.get("categories")?.toString() ?? "";
		if (!raw) return [];
		return raw
			.split(",")
			.filter((id) => id !== "" && !isNaN(Number(id)))
			.map((id) => {
				const category = categories.find((c) => c.id === Number(id));
				return {
					$typeName: "proto.core.v1.Category",
					id: Number(id),
					name: category?.name ?? "",
					monitorStock: category?.monitorStock ?? false,
				};
			});
	}

	async function addStock(formData: FormData) {
		const parsedCategories = parseCategories(formData);
		const imageUrl = await resolveImageUrl();

		const stock = {
			$typeName: "proto.core.v1.Stock",
			name: formData.get("title")?.toString() ?? "",
			quantity: Number(formData.get("quantity")?.toString()),
			categories: parsedCategories,
			imageUrl,
		} as Stock;

		const req: AddStockRequest = {
			$typeName: "proto.services.v1.AddStockRequest",
			stock,
		};

		const response = await stockClient.addStock(req);
		if (response.stock) {
			stockStore.addStock(response.stock);
		}
		onSuccess?.();
		actionClose?.();
	}

	async function updateStock(formData: FormData) {
		const id = data?.id;
		if (id === undefined) {
			return;
		}

		const name = formData.get("title")?.toString() ?? "";
		const quantity = Number(formData.get("quantity")?.toString());
		const parsedCategories = parseCategories(formData);
		const imageUrl = await resolveImageUrl();

		const req: UpdateStockRequest = {
			$typeName: "proto.services.v1.UpdateStockRequest",
			id,
			name,
			quantity,
			categories: parsedCategories,
			imageUrl,
		};

		await stockClient.updateStock(req);
		stockStore.updateStock(
			id,
			name,
			quantity,
			parsedCategories as Category[],
			imageUrl,
		);
		onSuccess?.();
		actionClose?.();
	}

	const isEdit = mode === ModalMode.EDIT;

	const handleChange = (
		event: SelectChangeEvent<typeof selectedCategories>,
	) => {
		const {
			target: { value },
		} = event;

		setSelectedCategories(
			typeof value === "string" ? value.split(", ") : value,
		);
	};

	const visibleCategories = categories.filter((c) => c.name !== "");

	if (cropSrc) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<Box
					sx={{
						position: "relative",
						width: "100%",
						height: 300,
						bgcolor: "black",
						borderRadius: 1.5,
						overflow: "hidden",
					}}
				>
					<Cropper
						image={cropSrc}
						crop={crop}
						zoom={zoom}
						aspect={4 / 3}
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onCropComplete={onCropComplete}
					/>
				</Box>
				<Box sx={{ px: 1 }}>
					<Typography variant="caption" color="text.secondary">
						Zoom
					</Typography>
					<Slider
						value={zoom}
						min={1}
						max={3}
						step={0.1}
						onChange={(_, v) => setZoom(v as number)}
						size="small"
					/>
				</Box>
				<Box
					sx={{
						display: "flex",
						gap: 1,
						justifyContent: "flex-end",
					}}
				>
					<Button variant="text" onClick={handleCropCancel}>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleCropConfirm}
						startIcon={<CropIcon />}
					>
						Crop
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<form action={isEdit ? updateStock : addStock}>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
				{/* Image upload */}
				<Box>
					{previewUrl ? (
						<Box
							sx={{
								position: "relative",
								width: "100%",
								height: 180,
								borderRadius: 1.5,
								overflow: "hidden",
								mb: 1,
							}}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={previewUrl}
								alt="Preview"
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
								}}
							/>
							<IconButton
								size="small"
								onClick={clearImage}
								sx={{
									position: "absolute",
									top: 4,
									right: 4,
									bgcolor: "rgba(0,0,0,0.5)",
									color: "white",
									"&:hover": {
										bgcolor: "rgba(0,0,0,0.7)",
									},
								}}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>
					) : (
						<Button
							variant="outlined"
							fullWidth
							onClick={() => fileInputRef.current?.click()}
							startIcon={<PhotoCameraIcon />}
							sx={{ py: 3, borderStyle: "dashed" }}
						>
							<Typography variant="body2">
								Upload photo or take picture
							</Typography>
						</Button>
					)}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						capture="environment"
						onChange={handleFileChange}
						hidden
					/>
					{previewUrl && (
						<Button
							size="small"
							onClick={() => fileInputRef.current?.click()}
							sx={{ mt: 0.5 }}
						>
							Change photo
						</Button>
					)}
				</Box>

				<TextField
					label="Title"
					name="title"
					defaultValue={isEdit ? data?.name : ""}
					fullWidth
					required
				/>
				<TextField
					label="Quantity"
					name="quantity"
					type="number"
					defaultValue={isEdit ? data?.quantity : ""}
					fullWidth
					required
					slotProps={{ htmlInput: { min: 0 } }}
				/>
				<Select
					value={selectedCategories}
					multiple
					onChange={handleChange}
					displayEmpty
					label="Categories"
					name="categories"
					fullWidth
				>
					{visibleCategories.map((cat) => (
						<MenuItem key={`category-${cat.id}`} value={cat.id}>
							{cat.name}
						</MenuItem>
					))}
				</Select>
				<Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
					{isEdit ? "Update item" : "Add item"}
				</Button>
			</Box>
		</form>
	);
}
