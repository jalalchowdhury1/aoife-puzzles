// Pure bankId -> fixed-text lookup, across every authored bank (active AND
// retired genres — decision #16 retires the genre from PLAY, not its bank,
// since her history still needs to render). Used by the parent dashboard to
// show what a bank-backed item actually said, given only the `bankId`
// recorded on an ItemRecord.
//
// Arithmetic ("Story Sums") bank items are NOT included: they are templates
// ({a}/{b}/... placeholders filled by per-item random vars), so a template
// id has no single canonical prompt text to hand back — it always resolves
// to null here, same as an id nobody recognizes.
import type { GenreId } from "./types";
import type { ChoiceBankItem } from "../genres/bankGenre";
import { FILL_THE_GAP_BANK } from "../genres/banks/fillTheGap";
import { WHAT_WOULD_YOU_DO_BANK } from "../genres/banks/whatWouldYouDo";
import { INFORMATION_BANK } from "../genres/banks/information";
import { SIMILARITIES_BANK } from "../genres/banks/similarities";
import { VOCABULARY_BANK } from "../genres/banks/vocabulary";
import { COMPREHENSION_BANK } from "../genres/banks/comprehension";
import { WHICH_TWO_BANK, type WhichTwoBankItem } from "../genres/banks/whichTwo";

export interface BankEntry {
  genre: GenreId;
  prompt: string;
  emoji?: string;
  options: { text: string; points: number }[];
  explanation: string;
}

// Every fixed-text (non-templated) bank, paired with the genre it belongs
// to (a ChoiceBankItem carries no genre of its own — see lib/genres/bankGenre.ts).
const CHOICE_BANKS: { genre: GenreId; bank: readonly ChoiceBankItem[] }[] = [
  { genre: "fillTheGap", bank: FILL_THE_GAP_BANK },
  { genre: "whatWouldYouDo", bank: WHAT_WOULD_YOU_DO_BANK },
  { genre: "information", bank: INFORMATION_BANK },
  // Retired (decision #16) — code and banks kept only so her Level 1/2
  // history still resolves to real text on the parent page.
  { genre: "similarities", bank: SIMILARITIES_BANK },
  { genre: "vocabulary", bank: VOCABULARY_BANK },
  { genre: "comprehension", bank: COMPREHENSION_BANK },
];

function fromChoiceItem(genre: GenreId, item: ChoiceBankItem): BankEntry {
  return {
    genre,
    prompt: item.prompt,
    emoji: item.emoji,
    options: item.options.map((o) => ({ text: o.text, points: o.points })),
    explanation: item.explanation,
  };
}

// Which Two Belong's bank shape isn't a single-prompt multiple choice
// question (it's a pair-of-four-things plus a reason) — adapt it into the
// same BankEntry shape: the "prompt" restates the four things shown, and
// the reasons become the options.
function fromWhichTwo(item: WhichTwoBankItem): BankEntry {
  const [a, b, c, d] = item.items;
  return {
    genre: "whichTwo",
    prompt: `Which two belong? ${a.text}, ${b.text}, ${c.text}, ${d.text}`,
    options: item.reasons.map((r) => ({ text: r.text, points: r.points })),
    explanation: item.explanation,
  };
}

/** Finds a bank-authored item's fixed text by its `bankId`, across every fixed-text bank. Unknown ids (including any arithmetic template id) return null. */
export function lookupBankItem(bankId: string): BankEntry | null {
  for (const { genre, bank } of CHOICE_BANKS) {
    const found = bank.find((b) => b.id === bankId);
    if (found) return fromChoiceItem(genre, found);
  }
  const wt = WHICH_TWO_BANK.find((b) => b.id === bankId);
  if (wt) return fromWhichTwo(wt);
  return null;
}
