# Style guide: DramaStream Tasks

If the task manager is built, it should use DramaStream's design system (`src/styles/global.css` tokens), so it feels like part of the same product. Nothing new is invented unless the tracker needs it.

## Color

| Token | Use in Tasks |
|---|---|
| `--bg` `#141414` | Page background |
| `--surface` / `--surface-2` | Task rows, project cards, form panels |
| `--line` | Row and card borders |
| `--text` / `--text-2` / `--muted` | Title, secondary line, "Added 3 days ago" |
| `--accent` `#e50914` | Progress bar fill, checked checkbox |
| `--accent-text` `#ff4d55` | **Overdue** label, validation errors, Delete text |

- Tag chips use one muted color per tag, the same color every time for the same name. They always show the tag text, so color is never the only signal.
- Done tasks: muted text with a line through it.

## Type

- **Inter Variable** for everything, as in DramaStream.
- Page titles use DramaStream's `.page__title` (800 weight).
- Row titles: 1rem, 650 weight. Secondary line: 0.85rem, `--text-2`.

## Layout

- Pages use DramaStream's `.page` padding and max width.
- A small sub-nav under the page title switches between **Tasks · Projects · + New task**.
- Rows are full width and at least 56px tall. Checkboxes and icon buttons are 44px touch targets.
- Phones (390px): one column, filters wrap. Desktop (1440px): rows are capped at about 900px wide for readability.

## Components

- `.btn--primary` (white) for the main action on a page; `.btn--secondary` for the rest.
- DramaStream's `.field`, `.field-label`, `.field-error` and `.chip` for forms and filters.
- Confirm dialogs use a native `<dialog>`, so focus is trapped and Escape closes it.
- Feedback ("Task added", "Project deleted") goes through DramaStream's toast and status live region.

## Motion

- A new task fades and slides in once. The checkbox tick and the progress bar animate in about 200ms.
- Everything respects `prefers-reduced-motion`.
