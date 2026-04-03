/**
 * Uploads an image file via the Next.js proxy and returns the image URL path.
 */
export async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("image", file);

	const res = await fetch("/api/v1/images", {
		method: "POST",
		body: formData,
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Image upload failed: ${text}`);
	}

	const data = await res.json();
	return data.url;
}

/**
 * Deletes an uploaded image by its URL path (e.g. "/uploads/abc123.jpg").
 */
export async function deleteImage(url: string): Promise<void> {
	await fetch(`/api/v1/images?url=${encodeURIComponent(url)}`, {
		method: "DELETE",
	});
}
