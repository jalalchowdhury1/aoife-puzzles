# Parent dashboard visual revamp: Liquid Glass (2026-08-28)

Owner ask (Jalal, verbatim): "can you revamp the look. you have design and QoL saved to your
memory. do it the way i like it." Followed a corrected round: he first assumed I'd build an iPhone
mockup (his documented process for the health-hub build) — he clarified "no no i don't need it on
my phone. i just needed you to revamp for the web thats all." Redid the mockup as a desktop layout,
he approved it with "yes ship it, apply it to all 5 tabs. and make QoL improvements as you see fit."

## Source of truth

`feedback-design-qol-playbook` (this project's memory): Liquid Glass over a lit, slowly-drifting
gradient field with grain; capsule pills everywhere; numbers-first pairs (absolute + relative);
state color follows meaning; short sections, collapsible, remembered state; "alive beats static."
Translated here for a data-dense DESKTOP admin dashboard rather than the consumer-mobile surfaces
that playbook was originally distilled from — tables stay real tables (the desktop mockup he
approved, not the phone-card one), since there's room and the parent wants to scan, not tap through.

## Scope

`/parent` only. Every component under `components/parent/` is exclusively used by that one route
(verified before touching anything) — zero risk to Aoife's own play pages, which keep their
Bubblegum-Sans/cream/Pip theme untouched. New tokens live under a `.pd-root` class in
`app/globals.css`, entirely separate from the child theme's `--color-*` tokens — this is additive,
not a retheme of the shared design system.

## Visual system (`app/globals.css`, `.pd-root` and friends)

- **Background**: a dark base (`#0a0c10`) with three soft radial gradient blobs (teal, sky, violet)
  plus a subtle SVG-noise grain layer, slowly animating position ("alive beats static").
- **`.pd-glass`**: the panel primitive — translucent white fill, blur, a hairline border, and an
  inset top highlight for the "specular edge" glass reads.
- **`.pd-row`**: a lighter-weight glass row for table rows and list items (hover brightens).
- **`.pd-pill` / `.pd-pill-active`**: capsule nav buttons; active state is a green gradient fill
  (matches the puzzle app's own teal, not a new brand color).
- **`.pd-chip-{good,info,warn,bad,mute}`**: status chips, each a dot + label, colors carrying
  meaning consistently everywhere (green=ahead/correct, sky=informational, amber=needs-attention,
  rose=wrong/error, gray=pending) — never color alone, always paired with a word.
- **`.pd-bar`**: the gradient progress bar under numbers-first stat pairs.
- User-select is turned back ON inside `.pd-root` (the child app disables it globally for tap
  safety; a parent reviewing data wants to select and copy numbers).

## QoL additions (his ask: "make QoL improvements as you see fit")

- **Collapsible sections with remembered state** (`components/parent/CollapsibleSection.tsx`): a
  plain `<details>` styled as glass, open/closed persisted to `localStorage` per section so a
  parent's preference (e.g. always wanting the Item log collapsed) survives across visits instead
  of resetting. Applied to Skills tab's "Per difficulty" (open by default), "Missed questions"
  (open), and "Item log" (closed by default — it's the longest, least-often-needed section).
- **Floating capsule nav** replaces the old full-width sticky bar (`components/parent/Tabs.tsx`) —
  matches the approved mockup's auto-width pill cluster rather than a full-bleed strip.
- Every chart/sparkline (`LineChart.tsx`, `Sparkline.tsx`) got its hardcoded light-theme colors
  swapped for dark-safe ones — these are parent-only components, so values were changed directly
  rather than threaded as new props.

## What did NOT change

- Any child-facing route (`/play`, `/talk`, `/practice`, `/stickers`) — zero edits.
- `app/globals.css`'s existing `--color-*` tokens, `font-bubble`, Pip animations — untouched,
  additive only.
- Data logic anywhere — this is a pure visual pass; every component's props/behavior are identical
  to before, just restyled.
