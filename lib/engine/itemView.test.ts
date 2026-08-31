// Tests for the full-question replay behind the parent dashboard's Last
// session tab (decision #25). The rule under test throughout is decision
// #14's: a false detail is worse than no detail — every guard must return
// null rather than render a question we cannot prove she saw.
import { describe, it, expect } from "vitest";
import { resolveItemView, regenerable } from "./itemView";
import { GENRES } from "../genres";
import type { Difficulty } from "./types";
import type { WhichTwoItem } from "../genres/whichTwo";
import type { ArithmeticItem } from "../genres/bankGenre";
import type { SwapShopItem } from "../genres/swapShop";

// Every session below is dated after the last scale cutover (2026-08-26),
// so guard 1 passes and the other guards are what is actually exercised.
// AFTER the 2026-08-26 Swap Shop re-band but BEFORE the 2026-08-30 verbal
// re-author, so choice/whichTwo fixtures below regenerate against the frozen
// legacy banks (decision #29) exactly as resolveItemView does for that date.
const AFTER = "2026-08-28T13:00:00Z";
const BEFORE = "2026-08-25T13:00:00Z";

// `asOf` mirrors what resolveItemView passes (the session date): banks that
// were re-authored keep frozen copies (banks/legacy, decision #29), so a
// replay dated before a cutover must be compared against the bank of THAT day.
function gen<T>(genre: keyof typeof GENRES, seed: number, d: Difficulty, asOf?: string): T {
  return GENRES[genre]!.generate(seed, d, { asOf }) as T;
}

describe("guard 1 — re-banded ramps", () => {
  it("refuses a Swap Shop item recorded before its 2026-08-26 re-band", () => {
    expect(regenerable("swapShop", BEFORE)).toBe(false);
    const item = gen<SwapShopItem>("swapShop", 4242, 7);
    expect(resolveItemView("swapShop", {
      seed: 4242, d: 7, response: item.answer, points: 1, date: BEFORE,
    })).toBeNull();
  });

  it("allows the same item recorded after the cutover", () => {
    expect(regenerable("swapShop", AFTER)).toBe(true);
    const item = gen<SwapShopItem>("swapShop", 4242, 7);
    expect(resolveItemView("swapShop", {
      seed: 4242, d: 7, response: item.answer, points: 1, date: AFTER,
    })).not.toBeNull();
  });

  it("never blocks a genre that was never re-banded", () => {
    expect(regenerable("information", BEFORE)).toBe(true);
    expect(regenerable("whichTwo", BEFORE)).toBe(true);
    expect(regenerable("arithmetic", BEFORE)).toBe(true);
  });
});

describe("choice genres (Fill the Gap / Do You Know / What Would You Do?)", () => {
  const CHOICE = ["fillTheGap", "information", "whatWouldYouDo"] as const;

  for (const g of CHOICE) {
    it(`${g}: renders the prompt, every option, her pick and the best answer`, () => {
      const item = gen<{ bankId: string; prompt: string; options: { text: string; points: number }[]; explanation: string }>(g, 777, 5, AFTER);
      const pick = item.options.findIndex((o) => o.points === 0);
      expect(pick).toBeGreaterThanOrEqual(0);

      const view = resolveItemView(g, {
        seed: 777, d: 5, response: pick, bankId: item.bankId, points: 0, date: AFTER,
      });
      expect(view).not.toBeNull();
      expect(view!.prompt).toBe(item.prompt);
      expect(view!.options).toHaveLength(item.options.length);
      expect(view!.options.filter((o) => o.chosen)).toHaveLength(1);
      expect(view!.options[pick].chosen).toBe(true);
      expect(view!.herAnswer).toBe(item.options[pick].text);
      // The best option is the top scorer, and it is what correctAnswer reports.
      const top = Math.max(...item.options.map((o) => o.points));
      expect(view!.options.filter((o) => o.best).every((o) => o.points === top)).toBe(true);
      expect(view!.correctAnswer).toBe(item.options.find((o) => o.points === top)!.text);
      expect(view!.explanation).toBe(item.explanation);
    });

    it(`${g}: guard 2 — a different bankId resolves to null`, () => {
      const item = gen<{ bankId: string; options: unknown[] }>(g, 777, 5, AFTER);
      expect(resolveItemView(g, {
        seed: 777, d: 5, response: 0, bankId: `${item.bankId}-not-this-one`, points: 0, date: AFTER,
      })).toBeNull();
    });

    it(`${g}: guard 3 — points that disagree with the picked option resolve to null`, () => {
      const item = gen<{ bankId: string; options: { points: number }[] }>(g, 777, 5, AFTER);
      const pick = item.options.findIndex((o) => o.points === 0);
      expect(resolveItemView(g, {
        seed: 777, d: 5, response: pick, bankId: item.bankId, points: 2, date: AFTER,
      })).toBeNull();
    });

    it(`${g}: a timeout still shows the question, with no claim about her answer`, () => {
      const item = gen<{ bankId: string; prompt: string }>(g, 777, 5, AFTER);
      const view = resolveItemView(g, {
        seed: 777, d: 5, response: null, bankId: item.bankId, points: 0, date: AFTER,
      });
      expect(view).not.toBeNull();
      expect(view!.prompt).toBe(item.prompt);
      expect(view!.herAnswer).toBeNull();
      expect(view!.options.some((o) => o.chosen)).toBe(false);
    });

    it(`${g}: an out-of-range response index resolves to null`, () => {
      const item = gen<{ bankId: string; options: unknown[] }>(g, 777, 5, AFTER);
      expect(resolveItemView(g, {
        seed: 777, d: 5, response: item.options.length, bankId: item.bankId, points: 0, date: AFTER,
      })).toBeNull();
    });
  }
});

describe("Which Two Belong — a pair AND a reason", () => {
  it("a record dated before the 2026-08-30 re-author replays the wording she actually saw, not today's (decision #29)", () => {
    // wt-50 was "empathy, compassion, ladder, peach" on 2026-08-29; find a
    // seed that draws it at d10 and check the replay shows the old fillers.
    let hit: { seed: number; item: WhichTwoItem } | null = null;
    for (let seed = 1; seed < 500 && !hit; seed++) {
      const item = gen<WhichTwoItem>("whichTwo", seed, 10, "2026-08-29T12:00:00Z");
      if (item.bankId === "wt-50") hit = { seed, item };
    }
    expect(hit).not.toBeNull();
    const best = hit!.item.reasons.findIndex((r) => r.points === 2);
    const view = resolveItemView("whichTwo", {
      seed: hit!.seed, d: 10, response: { pair: [...hit!.item.pair], reason: best },
      bankId: "wt-50", points: 2, date: "2026-08-29T12:00:00Z",
    });
    expect(view).not.toBeNull();
    expect(view!.prompt).toContain("ladder");
    expect(view!.prompt).toContain("peach");
    // The same seed on a session dated after the cutover shows the new bank.
    const now = gen<WhichTwoItem>("whichTwo", hit!.seed, 10, "2026-09-01T12:00:00Z");
    expect(now.items.map((o) => o.text)).not.toContain("ladder");
  });

  it("renders both halves of her answer and both halves of the right one", () => {
    const item = gen<WhichTwoItem>("whichTwo", 9001, 6, AFTER);
    const best = item.reasons.findIndex((r) => r.points === 2);
    const view = resolveItemView("whichTwo", {
      seed: 9001, d: 6, response: { pair: [...item.pair], reason: best },
      bankId: item.bankId, points: 2, date: AFTER,
    });
    expect(view).not.toBeNull();
    // Prompt restates all four things she was shown.
    for (const o of item.items) expect(view!.prompt).toContain(o.text);
    // Her answer names the two she paired plus the reason she chose.
    expect(view!.herAnswer).toContain(item.items[item.pair[0]].text);
    expect(view!.herAnswer).toContain(item.items[item.pair[1]].text);
    expect(view!.herAnswer).toContain(item.reasons[best].text);
    expect(view!.options[best].chosen).toBe(true);
    expect(view!.options[best].best).toBe(true);
  });

  it("reports a partial-credit reason as hers but NOT as best", () => {
    const item = gen<WhichTwoItem>("whichTwo", 9001, 6, AFTER);
    const partial = item.reasons.findIndex((r) => r.points === 1);
    const view = resolveItemView("whichTwo", {
      seed: 9001, d: 6, response: { pair: [...item.pair], reason: partial },
      bankId: item.bankId, points: 1, date: AFTER,
    });
    expect(view!.options[partial].chosen).toBe(true);
    expect(view!.options[partial].best).toBe(false);
    expect(view!.options.filter((o) => o.best)).toHaveLength(1);
  });

  it("guard 3 — a reason whose score disagrees with the record resolves to null", () => {
    const item = gen<WhichTwoItem>("whichTwo", 9001, 6, AFTER);
    const zero = item.reasons.findIndex((r) => r.points === 0);
    expect(resolveItemView("whichTwo", {
      seed: 9001, d: 6, response: { pair: [...item.pair], reason: zero },
      bankId: item.bankId, points: 2, date: AFTER,
    })).toBeNull();
  });

  it("a malformed pair resolves to null rather than half an answer", () => {
    const item = gen<WhichTwoItem>("whichTwo", 9001, 6, AFTER);
    for (const bad of [{ pair: [0], reason: 0 }, { pair: [1, 1], reason: 0 }, { pair: [0, 99], reason: 0 }]) {
      expect(resolveItemView("whichTwo", {
        seed: 9001, d: 6, response: bad, bankId: item.bankId, points: 0, date: AFTER,
      })).toBeNull();
    }
  });

  it("a timeout shows the four things and the right pair, with no pick", () => {
    const item = gen<WhichTwoItem>("whichTwo", 9001, 6, AFTER);
    const view = resolveItemView("whichTwo", {
      seed: 9001, d: 6, response: null, bankId: item.bankId, points: 0, date: AFTER,
    });
    expect(view!.herAnswer).toBeNull();
    expect(view!.correctAnswer).toContain(item.items[item.pair[0]].text);
  });
});

describe("Story Sums — typed answer, no options", () => {
  it("shows the filled-in story, what she typed, and the key", () => {
    const item = gen<ArithmeticItem>("arithmetic", 555, 9);
    const view = resolveItemView("arithmetic", {
      seed: 555, d: 9, response: item.answer, bankId: item.bankId, points: 1, date: AFTER,
    });
    expect(view).not.toBeNull();
    expect(view!.prompt).toBe(item.text);
    // Templates are filled, never left as {a}/{b} placeholders.
    expect(view!.prompt).not.toMatch(/\{\w+\}/);
    expect(view!.options).toHaveLength(0);
    expect(view!.herAnswer).toBe(String(item.answer));
    expect(view!.correctAnswer).toBe(String(item.answer));
  });

  it("shows a wrong typed answer next to the key", () => {
    const item = gen<ArithmeticItem>("arithmetic", 555, 9);
    const view = resolveItemView("arithmetic", {
      seed: 555, d: 9, response: item.answer + 1, bankId: item.bankId, points: 0, date: AFTER,
    });
    expect(view!.herAnswer).toBe(String(item.answer + 1));
    expect(view!.correctAnswer).toBe(String(item.answer));
  });

  it("guard 3 — a right answer recorded as scoring 0 resolves to null (the template redrew)", () => {
    const item = gen<ArithmeticItem>("arithmetic", 555, 9);
    expect(resolveItemView("arithmetic", {
      seed: 555, d: 9, response: item.answer, bankId: item.bankId, points: 0, date: AFTER,
    })).toBeNull();
    expect(resolveItemView("arithmetic", {
      seed: 555, d: 9, response: item.answer + 1, bankId: item.bankId, points: 1, date: AFTER,
    })).toBeNull();
  });

  it("a timeout shows the story and the key but no typed answer", () => {
    const item = gen<ArithmeticItem>("arithmetic", 555, 9);
    const view = resolveItemView("arithmetic", {
      seed: 555, d: 9, response: null, bankId: item.bankId, points: 0, date: AFTER,
    });
    expect(view!.herAnswer).toBeNull();
    expect(view!.correctAnswer).toBe(String(item.answer));
  });
});

describe("Swap Shop — emoji piles rendered as text", () => {
  it("renders the trade rules, the pile she held, and every option", () => {
    const item = gen<SwapShopItem>("swapShop", 31337, 8);
    const view = resolveItemView("swapShop", {
      seed: 31337, d: 8, response: item.answer, points: 1, date: AFTER,
    });
    expect(view).not.toBeNull();
    expect(view!.rules).toHaveLength(item.rules.length);
    for (const r of view!.rules) expect(r).toContain("→");
    expect(view!.options).toHaveLength(item.options.length);
    expect(view!.options[item.answer].chosen).toBe(true);
    expect(view!.options[item.answer].best).toBe(true);
    expect(view!.prompt).toContain(item.question.join(" "));
  });

  it("guard 3 — a wrong pick recorded as scoring resolves to null", () => {
    const item = gen<SwapShopItem>("swapShop", 31337, 8);
    const wrong = item.options.findIndex((_, i) => i !== item.answer);
    expect(resolveItemView("swapShop", {
      seed: 31337, d: 8, response: wrong, points: 1, date: AFTER,
    })).toBeNull();
    expect(resolveItemView("swapShop", {
      seed: 31337, d: 8, response: item.answer, points: 0, date: AFTER,
    })).toBeNull();
  });

  it("marks exactly one best option, and hers separately when she was wrong", () => {
    const item = gen<SwapShopItem>("swapShop", 31337, 8);
    const wrong = item.options.findIndex((_, i) => i !== item.answer);
    const view = resolveItemView("swapShop", {
      seed: 31337, d: 8, response: wrong, points: 0, date: AFTER,
    });
    expect(view!.options.filter((o) => o.best)).toHaveLength(1);
    expect(view!.options[wrong].chosen).toBe(true);
    expect(view!.options[wrong].best).toBe(false);
  });
});

describe("genres with no honest text rendering", () => {
  it("the visual cousins resolve to null rather than inventing a prompt", () => {
    for (const g of ["mosaic", "fixPicture", "patternTrain", "pictureSudoku", "animalParade", "fireflyBoxes"] as const) {
      expect(resolveItemView(g, { seed: 12, d: 3, response: 0, points: 0, date: AFTER })).toBeNull();
    }
  });

  it("a nonsense difficulty resolves to null instead of throwing", () => {
    expect(resolveItemView("information", { seed: 1, d: 0, response: 0, points: 0, date: AFTER })).toBeNull();
    expect(resolveItemView("information", { seed: 1, d: 1.5, response: 0, points: 0, date: AFTER })).toBeNull();
  });
});

describe("priorBankIds — replaying an item from the middle of a block", () => {
  // A block never repeats a bank entry: play excludes everything already
  // used, and that exclusion steers both the pick and the option shuffle.
  // Replaying without the list is the difference between 119 and 99 of her
  // real recorded items resolving (measured 2026-08-29).
  it("lands on the same entry play did when the list is supplied", () => {
    const first = gen<{ bankId: string }>("information", 2468, 7, AFTER);
    const second = GENRES.information!.generate(2468, 7 as Difficulty, { excludeBankIds: [first.bankId], asOf: AFTER }) as {
      bankId: string; options: { text: string; points: number }[];
    };
    // The exclusion genuinely changes which entry (0,d) yields — otherwise
    // this test proves nothing.
    expect(second.bankId).not.toBe(first.bankId);

    const top = Math.max(...second.options.map((o) => o.points));
    const pick = second.options.findIndex((o) => o.points === top);
    const view = resolveItemView("information", {
      seed: 2468, d: 7, response: pick, bankId: second.bankId, points: top,
      date: AFTER, priorBankIds: [first.bankId],
    });
    expect(view).not.toBeNull();
    expect(view!.herAnswer).toBe(second.options[pick].text);
  });

  it("resolves to null (never to the wrong question) when the list is omitted", () => {
    const first = gen<{ bankId: string }>("information", 2468, 7, AFTER);
    const second = GENRES.information!.generate(2468, 7 as Difficulty, { excludeBankIds: [first.bankId], asOf: AFTER }) as {
      bankId: string; options: { points: number }[];
    };
    const top = Math.max(...second.options.map((o) => o.points));
    const pick = second.options.findIndex((o) => o.points === top);
    expect(resolveItemView("information", {
      seed: 2468, d: 7, response: pick, bankId: second.bankId, points: top, date: AFTER,
    })).toBeNull();
  });
});
