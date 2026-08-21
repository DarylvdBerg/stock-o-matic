import type { Metadata } from "next";
import "./globals.css";
import { Bebas_Neue, JetBrains_Mono } from "next/font/google";

export const metadata: Metadata = {
	title: "Stock-o-matic — Pantry Board",
	description: "Home inventory management for groceries and household items",
};

const board = Bebas_Neue({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
	variable: "--font-board",
});

const mono = JetBrains_Mono({
	weight: ["400", "500", "700"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-mono",
});

// Direction contract — emitted as an HTML comment (first child of <body>),
// greppable in the built output for seed key be31a341.
const DIRECTION_CONTRACT = `<!--
IMPECCABLE DIRECTION CONTRACT — seed be31a341 — form: split-flap departure board (rank 1 of grounded list; picked over assigned "Stockbook")
THESIS: A home inventory read like a train station's split-flap board — counts and status flip mechanically as stock changes. Refuses the SaaS card-grid dashboard.
OWN-WORLD: Deep cool-charcoal board enclosure; black split-flap tiles with soft cool-bone glyphs; one pastel-purple signal; STOCKED green / LOW amber / OUT red status pips. Bebas Neue board lettering, JetBrains Mono for counts/codes (tabular). No cards, no rules-as-boxes.
STORY: The household sees at a glance what's stocked, low, and out; bumps counts with pressable +/- that flip the flaps; the out-of-stock items are the DEPARTURES — the shopping list, pulled as a manifest.
FIRST VIEWPORT: Sticky board header (STOCK-O-MATIC + live purple clock + N TO BUY). Below, a column header (ITEM/QTY/STATUS) and departure-sorted rows: item name in Bebas, a flap counter with −/+ , a status pip, a stock-level fill. Primary action (open DEPARTURES) anchored bottom.
FORM: split-flap board, rank 1; seed be31a341.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${board.variable} ${mono.variable}`}>
			<body>
				<div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
				{children}
			</body>
		</html>
	);
}
