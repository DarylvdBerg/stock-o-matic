# Frontend Design System — "The Board"

The Stock-o-matic frontend is a **split-flap departure board**: a home inventory
read like a train-station board, where counts and status physically flip as
stock changes. This document records the system as built (`frontend/src/app/globals.css`
+ the components under `frontend/components/`). Design seed: `be31a341`, mode:
Operate, execution: code-first.

## 1. Principles

- **The board is the product.** Rows, flap counters, status pips, and the
  departures manifest carry the identity — not cards. There are no card grids.
- **Two colour languages, kept separate.** Pastel **purple** is the interface /
  brand accent (interactive, focus, primary actions). A muted **traffic light**
  (sage / honey / coral) is the stock-status layer. They never do each other's job.
- **One authored motion moment:** the split-flap flip. Everything else is quiet.
- **Mobile-first, at the shelf.** Big tap targets, sticky controls, `dvh` units,
  and status that stays legible when the label is dropped on narrow screens.
- **Theme the surfaces you didn't draw:** selection, scrollbar, focus ring,
  tabular numerals.

## 2. Colour tokens (`:root`)

Dark, cool-charcoal board. Colour strategy: **Committed** — the dark ground owns
the surface, one pastel-purple signal carries interaction, status is a third role.

| Token | Value | Role |
|---|---|---|
| `--void` | `#141319` | board enclosure ground |
| `--void-2` | `#1c1a24` | recessed fields (inputs, tracks) |
| `--panel` | `#201d28` | sheet / modal surface |
| `--edge` / `--edge-soft` | `#34303f` / `#262330` | borders, dividers |
| `--flap` / `--flap-lit` | `#0c0b11` / `#17161d` | split-flap tile faces |
| `--ink` | `#efedf7` | primary text (soft cool bone) |
| `--ink-dim` | `#a8a2bb` | secondary text |
| `--ink-faint` | `#736d84` | faint labels / microcopy |
| `--accent` | `#c4b5fd` | **pastel-purple signal** (brand/interactive) |
| `--accent-deep` | `#8b7cc8` | accent borders / focus glow |
| `--ok` | `#7fce9f` | STOCKED (muted sage) |
| `--low` | `#e8b45f` | LOW (muted honey) |
| `--out` | `#ec6a72` | OUT (muted coral) |

Dark text on accent surfaces is `#1a1330`. Dims are tinted warm/cool from the
ground — never flat gray.

## 3. Typography

| Family | Token | Use |
|---|---|---|
| **Bebas Neue** | `--font-display` | board lettering — item names, titles, buttons; uppercase, condensed |
| **JetBrains Mono** | `--font-code` | counts, codes, labels; always `font-variant-numeric: tabular-nums` |
| system stack | `--font-body` | form/body text |

Both webfonts load via `next/font/google` in `src/app/layout.tsx`.

## 4. The split-flap (signature interaction)

`components/flap/flap.tsx`:

- `FlapNumber` renders a number as a row of per-digit tiles; each tile flips
  top-old → bottom-new when its character changes.
- Implemented with the render-phase "previous prop" pattern (no effect); the
  fold leaves clear in `onAnimationEnd`.
- CSS: `.flap`, `.flap__half`, `.flap__fold` + `@keyframes flap-top/flap-bottom`
  (150ms each, staggered). A generic `.flip-swap` flips whole labels (status).
- `@media (prefers-reduced-motion: reduce)` disables all flips (instant swap).

Used for: item quantities, the add/edit stepper. Status pips use `.flip-swap`.

## 5. Structure (`.app`)

- **Header** (`.board-header`, `position: sticky; top:0`): drawn mark + title
  (`STOCK-O-MATIC`, accent on `-o-matic`) + a live board clock.
- **Controls bar** (`.controls`, sticky under the header via `--header-h`):
  Search, then a `.controls__row` with **Filter** and **Sort** pill buttons.
  Backed by a solid ground + shadow so rows scroll cleanly under it.
- **Column header** (`.col-head`): ITEM / QTY / STATUS.
- **Rows** (`.rows` / `.row`): the inventory, departure-sortable.
- **Deck** (`.deck`, `position: fixed` bottom): the **Departures** bar (count +
  arrow) plus round **Add** (`+`, accent) and **Categories** (tag) buttons.

The document scrolls; header + controls stay pinned, deck stays fixed. Horizontal
overflow is prevented with `overflow-x: clip` (not `hidden`, which breaks sticky).

## 6. The row

`.row` is a grid `1fr auto auto` = **identity | quantity | status**.

- **Identity** (`.row__id`): thumbnail (`.thumb`, image or first letter) + name
  (`.row__name`, Bebas, `flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis`)
  + a meta line (`.row__meta`) with the fill meter and category names. Tapping
  opens the edit sheet.
- **Fill meter** (`.fill`): an analog stock-level bar, `transform: scaleX(--fill)`,
  coloured by status (green/honey/coral).
- **Quantity** (`.qty`): pressable `−` / `+` (`.qtybtn`, 40px tap targets) around
  a `FlapNumber`.
- **Status** (`.status[data-s]`): a coloured dot + word; the **left stripe**
  (`.row::before`) also encodes status. On `≤520px` the word is hidden (dot +
  stripe + fill still convey it) to give the name room. OUT blinks.

## 7. Sheets & buttons

All secondary flows are **board sheets** (`components/panel/panel.tsx`) — a
bottom-sheet on mobile, centred on desktop, with `overflow-y: auto`:

- **Add / Edit item** (`modals/stock`): board form + crop-on-upload, flap stepper.
- **Categories** (`components/categories`): add / rename / delete + a "watch for
  grocery list" `.toggle` switch.
- **Departures** (`components/grocery-list`): the grocery manifest — checkable
  rows + Copy list. Membership = `isOnGroceryList` (out-of-stock, scoped to
  monitored categories; `lib/grocery/grocery-filter.ts`).
- **Filter** (`components/category-filter`): searchable multi-select category
  list with item counts.
- **Sort**: Default (by id) / Low → High / High → Low.

Button vocabulary: `.btn` / `.btn--accent` / `.btn--ghost`, `.qtybtn` (pressable),
`.filter-btn` (pill with `.filter-btn__n` badge), `.track` (chip), `.toggle`
(switch), `.check` (accent checkbox), `.manifest__row` (sheet list row).

## 8. Iconography

One authored SVG set (`components/icons.tsx`): 24-unit grid, `1.7` stroke, round
caps/joins, `currentColor`. No emoji or unicode glyphs as icons.

## 9. Status semantics

- **OUT** = quantity `0` (coral, blinking dot).
- **LOW** = quantity `1` (honey).
- **STOCKED** = quantity `≥ 2` (sage).
- **Departures / grocery list** = out-of-stock items, scoped to monitored
  categories when any category is monitored (fallback: all out-of-stock).

## 10. Responsive & accessibility

- Mobile-first; `≤520px` hides the status word, tightens gaps, shrinks name type.
- Tap targets ~40px; `dvh` for full-height; `overflow-x: clip`.
- `aria-label` on icon buttons, `aria-pressed` on toggles/chips/sort/filter,
  `aria-modal` sheets with Escape-to-close and scroll lock.
- `:focus-visible` rings in accent; `prefers-reduced-motion` honoured.
- Browser surfaces themed: `::selection`, custom scrollbar, focus ring, tabular
  numerals in all counts.

## 11. Favicon

`src/app/icon.svg` — a split-flap tile with the pastel-purple top flap mid-flip.

## Known follow-ups

- `.board-header` background still uses two warm hex leftovers (`#100e0b`,
  `#141210`) from before the cool recolour — should move to the cool `--void`
  family for full consistency.
