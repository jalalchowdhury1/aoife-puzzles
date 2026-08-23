// STUB — a real engine worker is building this module in a parallel worktree
// (see the "fun layer" brief, 2026-08-23) and will replace this file at
// merge time. This stand-in exists only so the UI layer (Pip the fox, praise
// screens, star jar, sticker book — app/play/page.tsx and components/*) has
// something real to call while both worktrees are developed side by side.
// Keep the exported names/signatures exactly as agreed so nothing downstream
// needs to change when the real module lands.
//
// Kid-text rules (owner brief): warm, short, no dashes, never
// "wrong"/"bad"/"oops"/"sorry" — she is 5, reads well, and is a perfectionist
// who can be brought to tears by anything that reads as a correction.
import type { Rng } from "./rng";

export type PraiseKind =
  | "correct"
  | "miss"
  | "timeout"
  | "streak3"
  | "streak5"
  | "newBest"
  | "firstOfGenre"
  | "topOfRamp"
  | "comeback"
  | "blockDone"
  | "partDone"
  | "welcome"
  | "neutralNext";

export interface PraiseContext {
  kind: PraiseKind;
  name: string;
  kidTitle?: string;
  fast?: boolean;
  hard?: boolean;
  streak?: number;
  stars?: number;
  level?: number;
}

const POOLS: Record<PraiseKind, (ctx: PraiseContext) => string[]> = {
  welcome: (c) => [
    `Hi ${c.name}! Ready for some fun puzzles?`,
    `Yay, ${c.name} is here! Let's play.`,
    `Hi there, superstar ${c.name}!`,
    "I'm Pip! Let's play together.",
  ],
  correct: (c) => {
    const lines = [
      "Yes! You got it!",
      "That's exactly right!",
      "You are so clever!",
      "Great thinking!",
      "Nailed it!",
      "Woohoo, correct!",
      "You've got this!",
    ];
    if (c.fast) lines.push("Wow, so fast!", "Lightning quick thinking!");
    if (c.hard) lines.push("That one was tricky and you got it!", "Big brain moment right there!");
    return lines;
  },
  miss: () => [
    "Ooh, a tricky one! Let me show you.",
    "That was a sneaky puzzle. Watch this.",
    "Good try! Here is how it works.",
    "Puzzles like this take practice. Look at this.",
  ],
  timeout: () => [
    "Time flew by! Here is how it works.",
    "So close on time! Let's look together.",
    "Almost! Watch this one.",
  ],
  streak3: () => [
    "Three in a row! You're on fire!",
    "Look at you go, three straight!",
    "Triple correct! Amazing!",
  ],
  streak5: () => [
    "Five in a row! Incredible!",
    "You're unstoppable today!",
    "Five straight! Superstar!",
  ],
  newBest: (c) => [
    `New best ever${c.kidTitle ? ` for ${c.kidTitle}` : ""}!`,
    "You just beat your own record!",
    "Personal best, way to go!",
  ],
  topOfRamp: () => [
    "You reached the very top level!",
    "Top of the mountain!",
    "You made it all the way up!",
  ],
  comeback: () => [
    "Great bounce back!",
    "Right back on track!",
    "Straight back to being awesome!",
  ],
  firstOfGenre: (c) => [
    `Your very first ${c.kidTitle ?? "puzzle"}! Let's see.`,
    "Brand new puzzle type, let's go!",
  ],
  blockDone: (c) => [
    `You finished a whole set${c.kidTitle ? ` of ${c.kidTitle}` : ""}!`,
    "Set complete, great job!",
    "One more set down!",
  ],
  partDone: () => [
    "You did the whole part today! So proud of you.",
    "What a session! Amazing work.",
    "All done for today, superstar!",
  ],
  neutralNext: () => ["Onward!", "Here we go!", "Next up!"],
};

/**
 * Picks a line for this context, preferring one not already used this
 * session (`used`, kept by the caller in a ref for the session's lifetime).
 * Mutates `used` with the chosen line before returning it.
 */
export function pickPraise(ctx: PraiseContext, rng: Rng, used: Set<string>): string {
  const pool = POOLS[ctx.kind](ctx);
  const fresh = pool.filter((line) => !used.has(line));
  const line = rng.pick(fresh.length ? fresh : pool);
  used.add(line);
  return line;
}
