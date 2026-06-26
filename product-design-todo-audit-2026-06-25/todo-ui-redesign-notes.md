# Todo Page UI Redesign Notes

Date: 2026-06-25
Surface: `http://localhost:5173/todo`
Evidence:
- `01-current-desktop.png`
- `02-current-mobile.png`
- `todo-redesign-mock.html`

## Audit Scope

This review covers the current todo screen for the plant-care app: header summary, plant filters, overdue/today/upcoming task groups, family activity, and bottom navigation. The audit is based on screenshots captured from the in-app browser at desktop-width and 390px mobile-width.

## Current Strengths

1. The app already has a coherent plant-care mood: warm off-white background, soft green palette, rounded cards, and calm copy.
2. The grouping by overdue, today, and upcoming maps well to the user's real priority order.
3. The repeated task row pattern is simple enough to scan.
4. The bottom navigation is familiar and persistent, which fits a mobile-first household care app.

## Key UI Risks

1. Mobile bottom navigation overlaps content.
   In the 390px capture, the bottom nav covers the upcoming task card. Add bottom padding equal to nav height plus safe-area inset.

2. Completion buttons are visually clear but semantically light.
   A circular check icon reads as complete, but the accessible name is only "完成" and the visual target competes with status chips. Use a clearer completed action affordance: ring button, hover/pressed state, and explicit label on larger widths.

3. Task rows pack too many small fragments into one line.
   Plant name, care type, original date, due status, and action are visually close. Split into a two-line structure: title row, then meta row with icon, date, and status chip.

4. Overdue treatment is strong but could be calmer.
   The red left rail is useful, but the section still reads a little warning-heavy for a care app. Use a softer rose surface, clear status chip, and preserve the urgent ordering.

5. Filter chips are too minimal for state and counts.
   "全部" and "客厅茶几" are useful, but they do not show counts or active scope beyond color. Add count badges or a second line in the summary card when more plants are present.

6. Family activity competes with task completion.
   It is useful reassurance, but it should feel secondary. Tighten it into a "recent activity" module with smaller rows and lighter dividers.

## Accessibility Risks

1. Some clickable rows are nested with buttons inside a button-like container. This can create confusing reading order and keyboard behavior.
2. Icon-only controls need stable accessible names that include the task, such as "完成发财树浇水".
3. Small status chips and meta text may fall below comfortable contrast or tap readability on mobile.
4. The fixed bottom nav needs content padding and safe-area handling to avoid hiding controls.
5. Screenshot review cannot confirm keyboard focus, screen-reader order, or real contrast ratios. These need code-level verification.

## Redesign Direction

1. Keep the current visual personality: quiet, domestic, plant-focused, soft greens and warm white.
2. Make the header summary more useful by showing "4 remaining", "2 overdue", and "next due" as scan-friendly metrics.
3. Use grouped cards with clear section headers and subtle separators.
4. Give overdue tasks a soft alert rail and status chip without making the whole page feel alarming.
5. Make task rows 72-80px tall with a clear thumbnail, title, meta, status, and action.
6. Add bottom padding to the scroll container: `padding-bottom: calc(96px + env(safe-area-inset-bottom));`.
7. Keep bottom nav compact: 64px height, clear active state, no content overlap.

## Implementation Notes

- Suggested max content width: `520px`.
- Page padding: `24px 16px 104px` on mobile; `24px 0 112px` centered on desktop.
- Card radius: `16px` for main surfaces, `12px` for thumbnails and chips.
- Core palette:
  - Background: `#fbfcf7`
  - Ink: `#16342f`
  - Muted: `#6f8178`
  - Primary green: `#1f473d`
  - Soft green surface: `#edf5f1`
  - Overdue text: `#b4533f`
  - Overdue surface: `#fff7f2`
  - Border: `#d8e4da`

## Step Health

1. Header and summary: good foundation, needs more actionable metrics.
2. Filters: usable, needs counts and clearer selected state.
3. Overdue group: functionally strong, needs calmer hierarchy and better row structure.
4. Today group: good priority placement, needs stronger scan pattern.
5. Upcoming group: useful but currently hidden by bottom nav on mobile.
6. Family activity: useful secondary content, should be visually quieter.
7. Bottom navigation: familiar pattern, needs safe-area and content offset fix.
