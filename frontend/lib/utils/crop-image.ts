import type { Area } from "react-easy-crop";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

/**
 * Creates a compressed, cropped image File from the source image and crop area.
 * Output is capped at 1200px on the longest side and compressed to 80% JPEG quality.
 */
export async function getCroppedImage(
	imageSrc: string,
	cropArea: Area,
): Promise<File> {
	const image = await loadImage(imageSrc);

	let outWidth = cropArea.width;
	let outHeight = cropArea.height;

	if (outWidth > MAX_DIMENSION || outHeight > MAX_DIMENSION) {
		const scale = MAX_DIMENSION / Math.max(outWidth, outHeight);
		outWidth = Math.round(outWidth * scale);
		outHeight = Math.round(outHeight * scale);
	}

	const canvas = document.createElement("canvas");
	canvas.width = outWidth;
	canvas.height = outHeight;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get canvas context");

	ctx.drawImage(
		image,
		cropArea.x,
		cropArea.y,
		cropArea.width,
		cropArea.height,
		0,
		0,
		outWidth,
		outHeight,
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Failed to create blob"));
					return;
				}
				resolve(
					new File([blob], "cropped.jpg", { type: "image/jpeg" }),
				);
			},
			"image/jpeg",
			JPEG_QUALITY,
		);
	});
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}
