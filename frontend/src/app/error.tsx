"use client";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="splash">
			<div className="splash__word">
				<span className="accent">Delayed</span>
			</div>
			<div className="splash__sub">
				{error.message || "Something went wrong"}
			</div>
			<button
				type="button"
				className="btn"
				onClick={reset}
				style={{ marginTop: "0.5rem" }}
			>
				Try again
			</button>
		</div>
	);
}
