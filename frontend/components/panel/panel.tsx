"use client";

import { useEffect, type ReactNode } from "react";
import { IconClose } from "@/icons";

export function Panel({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
}) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onClose]);

	return (
		<div
			className="overlay"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			<div className="panel" onClick={(e) => e.stopPropagation()}>
				<div className="panel__head">
					<h2 className="panel__title">{title}</h2>
					<button
						type="button"
						className="iconbtn iconbtn--close"
						onClick={onClose}
						aria-label="Close"
					>
						<IconClose />
					</button>
				</div>
				<div className="panel__body">{children}</div>
			</div>
		</div>
	);
}
