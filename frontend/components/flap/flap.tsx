"use client";

import { useState, type ReactNode } from "react";

/* One split-flap tile: flips top-old → bottom-new when the char changes.
   Uses the render-phase "previous prop" pattern (no effect); the fold leaves
   are cleared in onAnimationEnd, an event handler. */
function FlapDigit({ char }: { char: string }) {
	const [current, setCurrent] = useState(char);
	const [prev, setPrev] = useState(char);
	const [gen, setGen] = useState(0);

	if (char !== current) {
		setPrev(current);
		setCurrent(char);
		setGen((g) => g + 1);
	}

	const folding = prev !== current;

	return (
		<span className="flap" aria-hidden="true">
			<span className="flap__half flap__half--top">
				<b>{current}</b>
			</span>
			<span className="flap__half flap__half--bottom">
				<b>{current}</b>
			</span>
			{folding && (
				<span key={gen}>
					<span className="flap__fold flap__fold--top">
						<b>{prev}</b>
					</span>
					<span
						className="flap__fold flap__fold--bottom"
						onAnimationEnd={() => setPrev(current)}
					>
						<b>{current}</b>
					</span>
				</span>
			)}
		</span>
	);
}

/* A number rendered as a row of split-flap tiles. */
export function FlapNumber({
	value,
	minDigits = 1,
}: {
	value: number;
	minDigits?: number;
}) {
	const str = Math.max(0, Math.trunc(value))
		.toString()
		.padStart(minDigits, "0");
	return (
		<span className="flapnum" role="img" aria-label={String(value)}>
			{str.split("").map((c, i) => (
				<FlapDigit key={`${str.length}-${i}`} char={c} />
			))}
		</span>
	);
}

/* Generic flip: replays a single-panel flip whenever `flipKey` changes. */
export function FlapPanel({
	flipKey,
	className,
	children,
}: {
	flipKey: string | number;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span className={className}>
			<span key={flipKey} className="flip-swap">
				{children}
			</span>
		</span>
	);
}
