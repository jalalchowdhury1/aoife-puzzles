// STUB — replaced at merge.
//
// A parallel worker owns the real lib/engine/bankLookup.ts. This local stub
// exists only so app/parent/** compiles and can be screenshot-checked in
// this worktree; it implements the exact exported shape the parent
// dashboard consumes (see the "Insights API you consume" section of the
// build brief) with a reasonable real implementation borrowed from the
// existing bank-backed genres, so local dev/screenshot data looks sane.
import type { GenreId } from "./types";
import type { ChoiceBankItem } from "../genres/bankGenre";
import { INFORMATION_BANK } from "../genres/banks/information";
import { FILL_THE_GAP_BANK } from "../genres/banks/fillTheGap";
import { WHAT_WOULD_YOU_DO_BANK } from "../genres/banks/whatWouldYouDo";
import { SIMILARITIES_BANK } from "../genres/banks/similarities";
import { VOCABULARY_BANK } from "../genres/banks/vocabulary";
import { COMPREHENSION_BANK } from "../genres/banks/comprehension";
import { ARITHMETIC_BANK } from "../genres/banks/arithmetic";
import { WHICH_TWO_BANK } from "../genres/banks/whichTwo";

export interface BankItemLookup {
  genre: GenreId;
  prompt: string;
  emoji?: string;
  options: { text: string; points: number }[];
  explanation: string;
}

const CHOICE_BANKS: { genre: GenreId; bank: readonly ChoiceBankItem[] }[] = [
  { genre: "information", bank: INFORMATION_BANK },
  { genre: "fillTheGap", bank: FILL_THE_GAP_BANK },
  { genre: "whatWouldYouDo", bank: WHAT_WOULD_YOU_DO_BANK },
  { genre: "similarities", bank: SIMILARITIES_BANK },
  { genre: "vocabulary", bank: VOCABULARY_BANK },
  { genre: "comprehension", bank: COMPREHENSION_BANK },
];

/** Looks up an authored bank item (verbal/arithmetic/which-two genres) by its bankId, across every bank. */
export function lookupBankItem(bankId: string): BankItemLookup | null {
  for (const { genre, bank } of CHOICE_BANKS) {
    const found = bank.find((b) => b.id === bankId);
    if (found) {
      return {
        genre,
        prompt: found.prompt,
        emoji: found.emoji,
        options: found.options.map((o) => ({ text: o.text, points: o.points })),
        explanation: found.explanation,
      };
    }
  }

  const arith = ARITHMETIC_BANK.find((b) => b.id === bankId);
  if (arith) {
    return {
      genre: "arithmetic",
      prompt: arith.template.replace(/\{(\w+)\}/g, "…"),
      options: [],
      explanation: arith.explanation ?? "A story sum — see the item log for her actual numbers.",
    };
  }

  const wt = WHICH_TWO_BANK.find((b) => b.id === bankId);
  if (wt) {
    const bestIdx = new Set<number>(wt.pair);
    return {
      genre: "whichTwo",
      prompt: "Which two belong together?",
      emoji: wt.items[wt.pair[0]]?.emoji,
      options: wt.items.map((it, i) => ({ text: it.text, points: bestIdx.has(i) ? 1 : 0 })),
      explanation: wt.explanation,
    };
  }

  return null;
}
