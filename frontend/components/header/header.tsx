"use client";

import { useEffect, useState } from "react";
import { IconBoard } from "@/icons";

export function Header() {
	const [time, setTime] = useState<string>("--:--");

	useEffect(() => {
		const tick = () => {
			const d = new Date();
			setTime(
				`${String(d.getHours()).padStart(2, "0")}:${String(
					d.getMinutes(),
				).padStart(2, "0")}`,
			);
		};
		tick();
		const id = setInterval(tick, 15_000);
		return () => clearInterval(id);
	}, []);

	return (
		<header className="board-header">
			<IconBoard className="board-header__mark" />
			<h1 className="board-header__title">
				Stock<span className="accent">-o-matic</span>
			</h1>
			<div className="board-header__clock">
				{time}
				<small>Local</small>
			</div>
		</header>
	);
}
