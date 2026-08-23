import { makeChoiceGenre, type ChoiceItem } from "./bankGenre";
import { WHAT_WOULD_YOU_DO_BANK } from "./banks/whatWouldYouDo";

/** "What Would You Do?" (cousin of social reasoning, VC domain): a
 *  two-sentence story situation ending in "What would you do?", scored
 *  2/1/0/0 like the other verbal choice genres (2 = kind AND sensible, 1 =
 *  kind but not the best fix, 0/0 = unkind, unsafe, or unrelated). Pure
 *  wrapper around the shared bank-choice engine; see
 *  lib/genres/banks/whatWouldYouDo.ts for the authored items and ramp. */
export const whatWouldYouDo = makeChoiceGenre(
  {
    id: "whatWouldYouDo",
    subtest: "Social Reasoning",
    domain: "VC",
    kidTitle: "What Would You Do?",
    instructions: "Pip will tell you a little story. Think about what you would do, then tap the best choice and press Done.",
    sampleId: "wd-01",
    sampleExplanation: "Sharing a hug and your own ice cream comforts Mia and fixes the problem too.",
  },
  WHAT_WOULD_YOU_DO_BANK,
);

export default whatWouldYouDo;

// ---------------------------------------------------------------------------
// Audit (owner decision #14: validity is sacred) — a self-contained HTML
// string (no React) showing the story and its options, with the top-scoring
// option outlined green and the 1-point (partial credit) option outlined
// amber, so a human can eyeball every item before a release. Mirrors the
// renderChoice() pattern in scripts/audit-items.ts.
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
