import type { SVGProps } from "react";

/* One authored icon system — 24px grid, 1.7 stroke, round caps/joins. */
function Ico({ children, ...p }: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.7}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...p}
		>
			{children}
		</svg>
	);
}

/* Board mark: a split-flap tile mid-flip */
export function IconBoard(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<rect x="3.5" y="4.5" width="17" height="15" rx="2" />
			<path d="M3.5 12h17" />
			<path d="M8 8.2h8M8 15.8h5" />
		</Ico>
	);
}
export function IconSearch(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<circle cx="11" cy="11" r="6.5" />
			<path d="m20 20-3.6-3.6" />
		</Ico>
	);
}
export function IconPlus(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M12 5v14M5 12h14" />
		</Ico>
	);
}
export function IconMinus(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M5 12h14" />
		</Ico>
	);
}
export function IconClose(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M6 6l12 12M18 6 6 18" />
		</Ico>
	);
}
export function IconEdit(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 17v3Z" />
			<path d="M14.5 7.5 16.5 9.5" />
		</Ico>
	);
}
export function IconTrash(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
		</Ico>
	);
}
export function IconCamera(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
			<circle cx="12" cy="13" r="3.2" />
		</Ico>
	);
}
export function IconCopy(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<rect x="9" y="9" width="11" height="11" rx="2" />
			<path d="M5 15V5a1 1 0 0 1 1-1h9" />
		</Ico>
	);
}
export function IconArrow(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M5 12h13M13 6l6 6-6 6" />
		</Ico>
	);
}
export function IconCheck(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M5 12.5 10 17 19 7" />
		</Ico>
	);
}
export function IconCrop(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M6 2v14a2 2 0 0 0 2 2h14" />
			<path d="M2 6h14a2 2 0 0 1 2 2v14" />
		</Ico>
	);
}
export function IconTag(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M3 11.5V5a2 2 0 0 1 2-2h6.5a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-6.6 6.6a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 11.5Z" />
			<circle cx="7.5" cy="7.5" r="1.4" />
		</Ico>
	);
}
export function IconCart(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L20 8H6" />
			<circle cx="9.5" cy="20" r="1.2" />
			<circle cx="17.5" cy="20" r="1.2" />
		</Ico>
	);
}
export function IconGrid(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<rect x="4" y="4" width="7" height="7" rx="1.5" />
			<rect x="13" y="4" width="7" height="7" rx="1.5" />
			<rect x="4" y="13" width="7" height="7" rx="1.5" />
			<rect x="13" y="13" width="7" height="7" rx="1.5" />
		</Ico>
	);
}
export function IconSort(p: SVGProps<SVGSVGElement>) {
	return (
		<Ico {...p}>
			<path d="M7 4v15M4 8l3-4 3 4M17 20V5M14 16l3 4 3-4" />
		</Ico>
	);
}
