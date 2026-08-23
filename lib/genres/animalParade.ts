import { makeRng, type Rng } from "../engine/rng";
import { clampToBase } from "../engine/types";
import type { Genre, BaseDifficulty, ScoreResult } from "../engine/types";

/**
 * Animal Parade (cousin of auditory sequence memory, domain WM): Pip says a
 * list of animals aloud, then she taps them back on a 6-animal board in the
 * order asked — same, backward, or smallest-to-biggest.
 */
export type Animal = "ant" | "mouse" | "cat" | "dog" | "horse" | "elephant";
export const ANIMALS: Animal[] = ["ant", "mouse", "cat", "dog", "horse", "elephant"];
export const ANIMAL_EMOJI: Record<Animal, string> = {
  ant: "🐜",
  mouse: "🐭",
  cat: "🐱",
  dog: "🐶",
  horse: "🐴",
  elephant: "🐘",
};
export const ANIMAL_NAME: Record<Animal, string> = {
  ant: "ant",
  mouse: "mouse",
  cat: "cat",
  dog: "dog",
  horse: "horse",
  elephant: "elephant",
};

export type ParadeTask = "same" | "backward" | "size";
export interface AnimalParadeItem {
  animals: Animal[];
  task: ParadeTask;
  expected: Animal[];
}

// Length plan (owner spec): d1-3 grow a "same" span 2-4, d4-6 grow a
// "backward" span 2-4, d7-8 introduce "smallest to biggest" at 3-4, d9-10
// mix longer spans — d9 and d10 each list two variants and PLAN[d][seed %
// PLAN[d].length] alternates between them by seed parity (mirrors
// digitSpan.ts's own PLAN mechanism exactly).
const PLAN: Record<BaseDifficulty, [ParadeTask, number][]> = {
  1: [["same", 2]],
  2: [["same", 3]],
  3: [["same", 4]],
  4: [["backward", 2]],
  5: [["backward", 3]],
  6: [["backward", 4]],
  7: [["size", 3]],
  8: [["size", 4]],
  9: [["same", 5], ["backward", 4]],
  10: [["backward", 5], ["size", 5]],
};

const SIZE_RANK = new Map(ANIMALS.map((a, i) => [a, i]));

function expectedFor(animals: Animal[], task: ParadeTask): Animal[] {
  if (task === "same") return [...animals];
  if (task === "backward") return [...animals].reverse();
  return [...animals].sort((x, y) => SIZE_RANK.get(x)! - SIZE_RANK.get(y)!);
}

/** "same"/"backward" items: no two ADJACENT animals repeat (repeats further apart are fine). */
function genSequenceNoAdjacentRepeat(rng: Rng, len: number): Animal[] {
  const seq: Animal[] = [];
  while (seq.length < len) {
    const a = rng.pick(ANIMALS);
    if (seq.length > 0 && a === seq[seq.length - 1]) continue;
    seq.push(a);
  }
  return seq;
}

/** "size" items need a set of DISTINCT animals — a repeated animal would make "smallest to biggest" ambiguous. */
function genDistinctSequence(rng: Rng, len: number): Animal[] {
  return rng.shuffle(ANIMALS).slice(0, len);
}

export const animalParade: Genre<AnimalParadeItem, Animal[]> & { e2e: { kind: "sequence"; taps: number } } = {
  id: "animalParade",
  subtest: "Auditory Sequence Memory",
  domain: "WM",
  kidTitle: "Animal Parade",
  instructions:
    "Pip will say some animals. Listen carefully. When she is done, tap them back on the board the way she asks.",

  sample: () => ({
    item: { animals: ["dog", "cat"], task: "same", expected: ["dog", "cat"] },
    explanation: "I said dog, then cat. So you tap dog, then cat. Same order.",
  }),

  generate(seed, d) {
    const d0 = clampToBase(d);   // this genre's own ramp is 1-10 only
    const r = makeRng(seed * 13 + d0);
    const plan = PLAN[d0];
    const [task, len] = plan[((seed % plan.length) + plan.length) % plan.length];
    const animals = task === "size" ? genDistinctSequence(r, len) : genSequenceNoAdjacentRepeat(r, len);
    const expected = expectedFor(animals, task);
    // A "size" item where the animals happened to be sampled already in
    // sorted order would let her just repeat what she heard — regenerate so
    // every size item genuinely needs re-ordering (mirrors digitSpan.ts's
    // same guard for its "sequencing" task).
    if (task === "size" && expected.every((v, i) => v === animals[i])) {
      return this.generate(seed + 1000, d);
    }
    return { animals, task, expected };
  },

  score(item, response): ScoreResult {
    const ok = !!response && response.length === item.expected.length && response.every((v, i) => v === item.expected[i]);
    return { points: ok ? 1 : 0, max: 1, correct: ok };
  },

  timing: { kind: "none" },
  mode: "staircase",
  // Declared here (not in the shared Genre type this worker doesn't touch):
  // a future generic play-through harness can tap the first `taps` board
  // buttons in order, then Done, for any genre whose e2e.kind is "sequence".
  e2e: { kind: "sequence", taps: 2 },
};

const TASK_LABEL_PLAIN: Record<ParadeTask, string> = {
  same: "Same order",
  backward: "Backward",
  size: "Smallest to biggest",
};

/** Self-contained HTML audit view: what Pip said, and the correct tap order outlined green. */
export function audit(item: AnimalParadeItem): string {
  const heard = item.animals.map(a => `<span class="chip">${ANIMAL_EMOJI[a]}</span>`).join("");
  const answer = item.expected
    .map((a, i) => `<span class="chip correct">${ANIMAL_EMOJI[a]}<sub>${i + 1}</sub></span>`)
    .join("");
  return (
    `<div class="animal-parade">` +
    `<div class="task">${TASK_LABEL_PLAIN[item.task]}</div>` +
    `<div class="row"><span class="label">Pip says:</span>${heard}</div>` +
    `<div class="row"><span class="label">Tap order:</span>${answer}</div>` +
    `<style>` +
    `.animal-parade{font-family:sans-serif;font-size:20px}` +
    `.task{margin-bottom:8px;font-weight:bold}` +
    `.row{margin:6px 0}` +
    `.label{margin-right:8px;font-weight:bold}` +
    `.chip{display:inline-block;border:3px solid #ccc;border-radius:12px;padding:6px 10px;margin:3px;font-size:32px}` +
    `.chip.correct{border-color:#6fcf6f;background:rgba(111,207,111,0.15)}` +
    `.chip sub{font-size:14px;font-weight:bold;margin-left:2px}` +
    `</style>` +
    `</div>`
  );
}
