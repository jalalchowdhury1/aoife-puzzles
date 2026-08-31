import { makeChoiceGenre, type ChoiceItem } from "./bankGenre";
import { FILL_THE_GAP_BANK } from "./banks/fillTheGap";

/** "Fill the Gap" (cousin of word knowledge, VC domain): a sentence with one
 *  word missing and four same-slot options, scored 2/1/0/0 like the other
 *  verbal choice genres. Pure wrapper around the shared bank-choice engine;
 *  see lib/genres/banks/fillTheGap.ts for the authored items and ramp. */
export const fillTheGap = makeChoiceGenre(
  {
    id: "fillTheGap",
    subtest: "Word Knowledge",
    domain: "VC",
    kidTitle: "Fill the Gap",
    instructions: "Read the sentence. One word is missing. Tap the word that fits best, then press Done.",
    sampleId: "fg-01",
    sampleExplanation: "Her eyes have stayed shut since lunch, so sleeping fits better than resting.",
  },
  FILL_THE_GAP_BANK,
);

export default fillTheGap;

// ---------------------------------------------------------------------------
// Audit (owner decision #14: validity is sacred) — a self-contained HTML
// string (no React) showing the sentence and its options, with the
// top-scoring option outlined green and the 1-point (partial credit) option
// outlined amber, so a human can eyeball every item before a release. Mirrors
// the renderChoice() pattern in scripts/audit-items.ts.
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function audit(item: ChoiceItem): string {
  const max = Math.max(...item.options.map(o => o.points));
  const emojiHtml = item.emoji ? `<div style="font-size:2em;line-height:1;">${item.emoji}</div>` : "";
  const optionsHtml = item.options
    .map(o => {
      const border =
        o.points === max ? "border:3px solid #6fcf6f;background:#eafaf0;"
        : o.points === 1 ? "border:3px solid #f5a623;background:#fff8ec;"
        : "border:1px solid #ddd;background:#fff;";
      return (
        `<div style="padding:6px 10px;margin:4px 0;border-radius:6px;${border}">` +
        `${esc(o.text)} <span style="color:#999;font-size:0.85em;">(${o.points}pt)</span></div>`
      );
    })
    .join("");
  return (
    `<div style="font-family:sans-serif;max-width:420px;">` +
    emojiHtml +
    `<p style="font-weight:bold;">${esc(item.prompt)}</p>` +
    optionsHtml +
    `</div>`
  );
}
