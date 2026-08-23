// Spot It (owner decision #16, "similar, not same"): a cousin of visual
// scanning speed (the same muscle as Symbol Search / Cancellation), built as
// a clearly different mechanic so the two speed genres don't feel like the
// same puzzle twice. A target picture sits on the left; a group of 4 (3 at
// d<=3) pictures sits on the right; tap YES if the target is in the group,
// NO if it is not. Pictures are drawn from small "look-alike" emoji families
// (dog/wolf/fox, cat/tiger/lion, ...) so a NO answer always has a genuine
// decoy to scan past, never a group of pictures that obviously share nothing
// with the target.
import type { Difficulty, Genre } from "../engine/types";
import { makeRng } from "../engine/rng";
import { SPEED_BLOCK_MS } from "../engine/timing";

export interface SpotItItem { target: string; group: string[]; present: boolean }

// Each family's [0] is the only icon ever used as a `target`; [1]/[2] are its
// look-alikes, drawn into the group whenever `present` is false so absence
// is a real scan, never a free tell ("nothing here looks anything like it").
export const FAMILIES: readonly string[][] = [
  ["🐶", "🐺", "🦊"], // dog / wolf / fox
  ["🐱", "🐯", "🦁"], // cat / tiger / lion
  ["🍎", "🍅", "🍑"], // apple / tomato / peach
  ["🌸", "🌺", "🌼"], // blossom / hibiscus / daisy
  ["🚗", "🚕", "🚙"], // car / taxi / suv
  ["🐟", "🐠", "🐡"], // fish / tropical fish / pufferfish
  ["⭐", "🌟", "✨"], // star / glowing star / sparkles
  ["🍪", "🍩", "🥯"], // cookie / donut / bagel
];

// A pool of filler pictures with no family membership at all, so a filler
// can never accidentally double as a look-alike distractor.
const FILLERS: readonly string[] = [
  "🚀", "🎈", "📚", "🖍️", "🧩", "🛼", "🪁", "🎯",
  "🧸", "🔑", "🎨", "🥁", "🧦", "🏀", "🎁", "🧵",
];

/** The family a given icon belongs to, if any — used by fairness tests. */
export function familyOf(icon: string): readonly string[] | undefined {
  return FAMILIES.find(f => f.includes(icon));
}

function groupSizeFor(d: Difficulty): 3 | 4 {
  return d <= 3 ? 3 : 4;
}

export const spotIt: Genre<SpotItItem, boolean> = {
  id: "spotIt",
  subtest: "Cancellation",
  domain: "PS",
  kidTitle: "Spot It",
  instructions:
    "Look at the picture on the left. Is it hiding in the group on the right? Tap yes if you see it, tap no if you do not. Go as fast as you can.",

  sample() {
    const item: SpotItItem = { target: "🐶", group: ["🐶", "🍎", "⭐", "🚗"], present: true };
    return {
      item,
      explanation: "The dog on the left is also in the group. So the answer is YES.",
    };
  },

  generate(seed, d) {
    const rng = makeRng(seed);
    const groupSize = groupSizeFor(d);
    const family = rng.pick(FAMILIES);
    const target = family[0];
    const present = rng.next() < 0.5;

    const group: string[] = [];
    if (present) {
      group.push(target);
    } else {
      group.push(rng.pick(family.slice(1)));
    }

    const needed = groupSize - group.length;
    const fillers = rng.shuffle(FILLERS).slice(0, needed);
    group.push(...fillers);

    return { target, group: rng.shuffle(group), present };
  },

  score(item, response) {
    const correct = response !== null && response === item.present;
    return { points: correct ? 1 : 0, max: 1, correct };
  },

  timing: { kind: "block", ms: SPEED_BLOCK_MS },
  mode: "speedBlock",
};

export default spotIt;

// ---------------------------------------------------------------------------
// Future data-driven play-through harness plan. e2e/playthrough.spec.ts is a
// shared file this genre's worktree does not edit (see the common brief);
// this constant documents the intended generic plan so wiring it in later is
// a lookup, not a redesign — first tap on a `data-testid="answer-option"`
// (YES or NO) responds immediately, there is no Done button.
// ---------------------------------------------------------------------------
export const e2ePlan = { kind: "tapOnly" } as const;

// ---------------------------------------------------------------------------
// Audit (owner decision #14: validity is sacred). A self-contained HTML
// fragment for a per-item review page — not wired into the shared
// scripts/audit-items.ts from this worktree, but ready to be plugged in
// there as a RENDERERS[id] entry.
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function audit(item: SpotItItem): string {
  const groupHtml = item.group
    .map(icon => {
      const isMatch = icon === item.target;
      const border = isMatch ? "3px solid #2ecc71" : "2px solid #e2e2e2";
      const bg = isMatch ? "#eafaf0" : "#fff";
      return (
        `<div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;` +
        `font-size:28px;margin:3px;border:${border};border-radius:8px;background:${bg};">${esc(icon)}</div>`
      );
    })
    .join("");
  const answerColor = item.present ? "#1a9850" : "#c0392b";
  return (
    `<div style="font-family:-apple-system,sans-serif;display:flex;align-items:center;gap:16px;">` +
    `<div style="display:flex;flex-direction:column;align-items:center;">` +
    `<div style="font-size:11px;color:#888;text-transform:uppercase;margin-bottom:4px;">target</div>` +
    `<div style="width:56px;height:56px;font-size:34px;display:flex;align-items:center;justify-content:center;` +
    `border:2px solid #ccc;border-radius:10px;background:#fff;">${esc(item.target)}</div>` +
    `</div>` +
    `<div style="width:2px;align-self:stretch;background:#ddd;"></div>` +
    `<div>${groupHtml}</div>` +
    `<div style="font-size:12px;font-weight:bold;color:${answerColor};margin-left:8px;">answer: ${item.present ? "YES" : "NO"}</div>` +
    `</div>`
  );
}
