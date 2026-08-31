// Giveaway-cue detectors for the verbal banks (decision #29, 2026-08-30).
//
// Jalal found a Which Two item whose pair was "empathy, compassion" and whose
// distractors were "banana, ladder": the vocabulary REGISTER alone picked
// the pair. Independent audits of all four verbal banks the same evening
// found the same family of flaw in different clothes: the best answer was
// the longest option (What Would You Do, 74% of items), the only "big" word
// (Fill the Gap, ~48/50), the only option containing a moral adverb, the
// only option echoing a stem word, or sat among distractors so silly that a
// four option item was really a coin flip between two. Each rule below is a
// machine-checkable proxy for one of those cues. They are deliberately crude
// (a human red team still reads every item) but they make the exact
// regressions found on 2026-08-30 impossible to reintroduce silently.
import { describe, it, expect } from "vitest";
import type { ChoiceBankItem } from "../bankGenre";
import { FILL_THE_GAP_BANK } from "../banks/fillTheGap";
import { WHAT_WOULD_YOU_DO_BANK } from "../banks/whatWouldYouDo";
import { INFORMATION_BANK } from "../banks/information";
import { WHICH_TWO_BANK } from "../banks/whichTwo";
import { bankAsOf, REVISION_2026_08_30 } from "../banks/legacy";
import { WHICH_TWO_BANK as WHICH_TWO_LEGACY } from "../banks/legacy/2026-08-30/whichTwo";
import { whichTwo } from "../whichTwo";
import { fillTheGap } from "../fillTheGap";

const words = (s: string) => s.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);
const top = (it: ChoiceBankItem) => it.options.reduce((m, o) => (o.points > m.points ? o : m), it.options[0]);
const rest = (it: ChoiceBankItem) => it.options.filter(o => o !== top(it));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

// Words that carry the "this is the good answer" signal in a social item. A
// key may use them, but then so must at least one non-key option somewhere
// in the same item, or the word is doing the child's reasoning for her.
const MORAL = ["fair", "fairly", "kind", "kindly", "kindness", "safe", "safely", "honest", "honestly", "patient", "patiently",
  "gently", "politely", "calmly", "carefully", "respectfully", "privately", "responsibly", "nicely", "properly"];
// Phrases that convict an option on their own, without reading the stem.
const SELF_CONDEMNING = ["hope no one notices", "hope nobody notices", "and say nothing", "say nothing else", "just this once",
  "every single time", "and do nothing", "instead of solving", "laugh at", "laugh because", "blame ", "make fun", "and ignore",
  "ignore it completely", "do not look", "own fault"];
const ADULT = ["grown up", "grownup", "adult", "teacher", "parent", "coach", "librarian", "mom", "dad", "mum"];

function choiceBankCues(name: string, bank: readonly ChoiceBankItem[], opts: { social: boolean; stubRatio: number | null }) {
  describe(`${name}: answer-cue detectors`, () => {
    it("the best option is the strictly longest one in at most 30% of items (pick-the-longest must not beat chance by much)", () => {
      const n = bank.filter(it => {
        const t = top(it).text.length;
        return rest(it).every(o => o.text.length < t);
      }).length;
      expect(n / bank.length, `${n}/${bank.length} items have the longest option as the key`).toBeLessThanOrEqual(0.3);
    });

    it("mean length of best options is within 15% of the mean length of zero-point options (no elaboration gradient)", () => {
      const best = mean(bank.map(it => top(it).text.length));
      const zero = mean(bank.flatMap(it => it.options.filter(o => o.points === 0).map(o => o.text.length)));
      expect(best / zero, `best ${best.toFixed(1)} vs zero ${zero.toFixed(1)}`).toBeLessThanOrEqual(1.15);
      expect(best / zero, `best ${best.toFixed(1)} vs zero ${zero.toFixed(1)}`).toBeGreaterThanOrEqual(0.85);
    });

    it("no stem word of 5+ letters appears in the best option and in no other option, in more than 10% of items (stem to key echo)", () => {
      const offenders: string[] = [];
      for (const it of bank) {
        const stem = new Set(words(it.prompt).filter(w => w.length >= 5));
        const key = new Set(words(top(it).text));
        const others = new Set(rest(it).flatMap(o => words(o.text)));
        const echo = [...stem].filter(w => key.has(w) && !others.has(w));
        if (echo.length > 0) offenders.push(`${it.id}(${echo.join(",")})`);
      }
      expect(offenders.length / bank.length, offenders.join(" ")).toBeLessThanOrEqual(0.1);
    });

    if (opts.stubRatio !== null) {
      const pct = Math.round(opts.stubRatio * 100);
      it(`every zero-point option is at least ${pct}% as long as the best option (no throwaway stubs)`, () => {
        for (const it of bank) {
          const t = top(it).text.length;
          for (const o of it.options.filter(o => o.points === 0)) {
            expect(o.text.length / t, `${it.id}: "${o.text}" vs "${top(it).text}"`).toBeGreaterThanOrEqual(opts.stubRatio!);
          }
        }
      });
    }

    it("every item carries a reviewNote of at least 60 characters (the human red-team check is recorded, not assumed)", () => {
      for (const it of bank) expect((it.reviewNote ?? "").length, `${it.id}`).toBeGreaterThanOrEqual(60);
    });

    if (opts.social) {
      it("no moral word appears only in the best option (the word would be doing her reasoning for her)", () => {
        const offenders: string[] = [];
        for (const it of bank) {
          const key = new Set(words(top(it).text));
          const others = new Set(rest(it).flatMap(o => words(o.text)));
          const solo = MORAL.filter(w => key.has(w) && !others.has(w));
          if (solo.length > 0) offenders.push(`${it.id}(${solo.join(",")})`);
        }
        expect(offenders, offenders.join(" ")).toEqual([]);
      });

      // Found by the 2026-08-30 review of the rewritten bank: in six items the
      // 2 and the 1 were the only two options sharing an opening phrase
      // ("Stay back and ..."), and since 1 counts as correct, picking from
      // the matching pair passed 100% with the stem unread.
      it("the two credited options never uniquely share their first two words", () => {
        const head = (s: string) => words(s).slice(0, 2).join(" ");
        const offenders: string[] = [];
        for (const it of bank) {
          const credited = it.options.filter(o => o.points > 0).map(o => head(o.text));
          const zeros = it.options.filter(o => o.points === 0).map(o => head(o.text));
          if (credited.length === 2 && credited[0] === credited[1] && !zeros.includes(credited[0])) offenders.push(`${it.id}("${credited[0]}")`);
        }
        expect(offenders, offenders.join(" ")).toEqual([]);
      });

      it("no option carries a self-condemning tag", () => {
        for (const it of bank) for (const o of it.options) {
          const hit = SELF_CONDEMNING.find(p => o.text.toLowerCase().includes(p));
          expect(hit, `${it.id}: "${o.text}"`).toBeUndefined();
        }
      });

      it("involving a grown up is not a key-only move: adult words appear in non-key options at least half as often as in keys", () => {
        const has = (s: string) => ADULT.some(w => s.toLowerCase().includes(w));
        const inKey = bank.filter(it => has(top(it).text)).length;
        const inOther = bank.filter(it => rest(it).some(o => has(o.text))).length;
        expect(inOther, `keys ${inKey}, non-keys ${inOther}`).toBeGreaterThanOrEqual(Math.ceil(inKey / 2));
      });
    }
  });
}

// Fill the Gap options are single words, so "stub" means a babyish short word
// beside a long rare one (loud vs sleeping): 55% catches that. Do You Know
// answers are names and numbers whose lengths vary for honest reasons
// (Ten vs Twelve), so it gets the multi-word rule below instead.
choiceBankCues("fillTheGap", FILL_THE_GAP_BANK, { social: false, stubRatio: 0.55 });
choiceBankCues("whatWouldYouDo", WHAT_WOULD_YOU_DO_BANK, { social: true, stubRatio: 0.6 });
choiceBankCues("information", INFORMATION_BANK, { social: false, stubRatio: null });

describe("fillTheGap: word-slot cues", () => {
  it("no best-fit word is the key of more than one item (a repeated key primes the next item)", () => {
    const seen = new Map<string, string>();
    for (const it of FILL_THE_GAP_BANK) {
      const k = top(it).text.toLowerCase();
      expect(seen.has(k), `${it.id} reuses key "${k}" from ${seen.get(k)}`).toBe(false);
      seen.set(k, it.id);
    }
  });

  it("no zero-point word is reused as a zero-point option in more than 3 items (a recycled filler is learned as never-the-answer)", () => {
    const count = new Map<string, number>();
    for (const it of FILL_THE_GAP_BANK) for (const o of it.options.filter(o => o.points === 0)) {
      count.set(o.text.toLowerCase(), (count.get(o.text.toLowerCase()) ?? 0) + 1);
    }
    const over = [...count].filter(([, n]) => n > 3);
    expect(over, over.map(([w, n]) => `${w}x${n}`).join(" ")).toEqual([]);
  });

  it("no intensifier sits right before the blank (completely/absolutely/totally/utterly pick the ungradable word on grammar alone)", () => {
    for (const it of FILL_THE_GAP_BANK) {
      expect(/\b(completely|absolutely|totally|utterly|entirely)\s+___/i.test(it.prompt), `${it.id}: ${it.prompt}`).toBe(false);
    }
  });

  it("article before the blank agrees with EVERY option (a/an must not eliminate anyone)", () => {
    for (const it of FILL_THE_GAP_BANK) {
      const m = /\b(a|an)\s+___/i.exec(it.prompt);
      if (!m) continue;
      const wantVowel = m[1].toLowerCase() === "an";
      for (const o of it.options) {
        const vowel = /^[aeiou]/i.test(o.text);
        expect(vowel, `${it.id}: "${m[1]} ${o.text}"`).toBe(wantVowel);
      }
    }
  });

  it("the key word (or its 5-letter stem) never appears in the sentence itself", () => {
    for (const it of FILL_THE_GAP_BANK) {
      const k = top(it).text.toLowerCase();
      const stem = k.slice(0, 5);
      const body = it.prompt.toLowerCase();
      expect(body.includes(` ${k} `) || (k.length >= 6 && body.includes(stem)), `${it.id}: "${k}" in "${it.prompt}"`).toBe(false);
    }
  });

  it("all four options are one word each, so the slot cannot be solved by shape", () => {
    for (const it of FILL_THE_GAP_BANK) for (const o of it.options) {
      expect(o.text.trim().split(/\s+/).length, `${it.id}: "${o.text}"`).toBe(1);
    }
  });

  it("the sample item is shuffled like play (the bank stores the key first; the practice item must not teach 'top one is right')", () => {
    const { item } = fillTheGap.sample();
    const bankItem = FILL_THE_GAP_BANK.find(b => b.id === item.bankId)!;
    expect(item.bankId).toBe("fg-01");
    expect(item.options.map(o => o.text).sort()).toEqual(bankItem.options.map(o => o.text).sort());
  });
});

describe("information: fact-item cues", () => {
  it("if the key has more than one word, at least one distractor does too (no only-multi-word key)", () => {
    for (const it of INFORMATION_BANK) {
      const keyWords = top(it).text.trim().split(/\s+/).length;
      if (keyWords < 2) continue;
      const other = rest(it).some(o => o.text.trim().split(/\s+/).length >= 2);
      expect(other, `${it.id}: key "${top(it).text}" is the only multi-word option`).toBe(true);
    }
  });

  it("no key answer is reused across items", () => {
    const seen = new Map<string, string>();
    for (const it of INFORMATION_BANK) {
      const k = top(it).text.toLowerCase();
      expect(seen.has(k), `${it.id} reuses key "${k}" from ${seen.get(k)}`).toBe(false);
      seen.set(k, it.id);
    }
  });
});

describe("whichTwo: register cues", () => {
  // Every option word used at d1-d4 is a picturable concrete object by
  // construction of the ramp; none may reappear at d7+ where the pair is
  // abstract, and the exact fillers of the 2026-08-30 bug are banned outright.
  const concrete = new Set(WHICH_TWO_BANK.filter(b => b.d <= 4).flatMap(b => b.items.map(o => o.text.toLowerCase())));
  const FILLERS = ["ladder", "kettle", "peach", "banana", "drum", "cloud", "spoon", "chair", "moon", "rocket", "blanket", "anchor",
    "melon", "pebble", "violin", "apricot", "seagull", "curtain", "saddle", "plum", "trombone", "hedge", "meadow", "hammer",
    "orchid", "ribbon", "canyon", "pancake", "glacier", "walnut", "lantern", "thunder", "sandal", "comet", "mitten", "pelican",
    "drizzle", "saucepan", "iceberg", "tulip", "chimney", "mango", "harp", "pencil", "fountain", "badger", "cactus", "saucer",
    "quilt", "otter", "guitar"];
  for (const f of FILLERS) concrete.add(f);

  it("at d7+ no option is a picturable concrete object (the register must not separate the pair from the distractors)", () => {
    for (const it of WHICH_TWO_BANK.filter(b => b.d >= 7)) for (const o of it.items) {
      expect(concrete.has(o.text.toLowerCase()), `${it.id}: "${o.text}"`).toBe(false);
    }
  });

  it("at d5+ the pair's words are not conspicuously longer than the distractors (mean length within 3 letters)", () => {
    for (const it of WHICH_TWO_BANK.filter(b => b.d >= 5)) {
      const pair = it.pair.map(i => it.items[i].text.length);
      const others = it.items.filter((_, i) => !it.pair.includes(i)).map(o => o.text.length);
      expect(Math.abs(mean(pair) - mean(others)), `${it.id}: ${it.items.map(o => o.text).join(", ")}`).toBeLessThanOrEqual(3);
    }
  });

  it("no distractor word is reused in more than 4 items (a recycled filler is learned as never-in-the-pair)", () => {
    const count = new Map<string, number>();
    for (const it of WHICH_TWO_BANK) it.items.forEach((o, i) => {
      if (it.pair.includes(i)) return;
      count.set(o.text.toLowerCase(), (count.get(o.text.toLowerCase()) ?? 0) + 1);
    });
    const over = [...count].filter(([, n]) => n > 4);
    expect(over, over.map(([w, n]) => `${w}x${n}`).join(" ")).toEqual([]);
  });

  // Found by the 2026-08-30 red team (pass 2): "tap the longest reason" hit
  // the 2 point reason in 54 of 55 items at d5+, and 53 of 75 zero-point
  // reasons were a color or physical-property claim ("both round"), so the
  // reason step, the half that carries the abstract-reasoning signal, was
  // measuring sentence length.
  it("the 2 point reason is the strictly longest reason in at most 35% of items", () => {
    const n = WHICH_TWO_BANK.filter(it => {
      const best = it.reasons.find(r => r.points === 2)!.text.length;
      return it.reasons.filter(r => r.points !== 2).every(r => r.text.length < best);
    }).length;
    expect(n / WHICH_TWO_BANK.length, `${n}/${WHICH_TWO_BANK.length}`).toBeLessThanOrEqual(0.35);
  });

  it("the 1 point reason is at least 70% as long as the 2 point reason in every item", () => {
    for (const it of WHICH_TWO_BANK) {
      const best = it.reasons.find(r => r.points === 2)!.text.length;
      const partial = it.reasons.find(r => r.points === 1)!.text.length;
      expect(partial / best, `${it.id}: ${partial} vs ${best}`).toBeGreaterThanOrEqual(0.7);
    }
  });

  it("zero-point reasons are not color or size claims (a 'never the color one' rule must not exist)", () => {
    const COLOR = /\b(red|orange|yellow|green|blue|purple|pink|white|black|grey|gray|brown|silver|gold|shiny|round|tall|heavy|light|cold|hot|warm|soft|sweet|loud|funny|long|small|big)\b/i;
    const bad = WHICH_TWO_BANK.filter(it => it.reasons.some(r => r.points === 0 && /^They are both \w+$/i.test(r.text.trim()) && COLOR.test(r.text)));
    expect(bad.map(b => b.id), bad.map(b => `${b.id}: ${b.reasons.find(r => r.points === 0)!.text}`).join("; ")).toEqual([]);
  });

  it("the sample item is shuffled like play, so the pair is not always the first two tiles", () => {
    const { item } = whichTwo.sample();
    expect(item.bankId).toBe("wt-01");
    const pairTexts = item.pair.map(i => item.items[i].text).sort();
    expect(pairTexts).toEqual(["apple", "banana"]);
    expect(item.items.map(o => o.text).sort()).toEqual(["apple", "banana", "car", "dog"]);
  });
});

describe("legacy replay (decision #29)", () => {
  it("bankAsOf returns the frozen bank for a session before the cutover and the current bank otherwise", () => {
    expect(bankAsOf("whichTwo", WHICH_TWO_BANK, "2026-08-29T12:00:00.000Z")).toBe(WHICH_TWO_LEGACY);
    expect(bankAsOf("whichTwo", WHICH_TWO_BANK, REVISION_2026_08_30)).toBe(WHICH_TWO_BANK);
    expect(bankAsOf("whichTwo", WHICH_TWO_BANK)).toBe(WHICH_TWO_BANK);
  });

  it("a whichTwo replay dated before the cutover reproduces the frozen bank's wording exactly", () => {
    for (let d = 1 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; d <= 10; d++) {
      for (let seed = 1; seed <= 40; seed++) {
        const item = whichTwo.generate(seed, d, { asOf: "2026-08-29T12:00:00.000Z" });
        const legacy = WHICH_TWO_LEGACY.find(b => b.id === item.bankId)!;
        expect(item.items.map(o => o.text).sort()).toEqual(legacy.items.map(o => o.text).sort());
      }
    }
  });

  it("the frozen whichTwo copy is the 2026-08-29 bank (empathy, compassion, ladder, peach at wt-50) and the live one is not", () => {
    const old = WHICH_TWO_LEGACY.find(b => b.id === "wt-50")!;
    expect(old.items.map(o => o.text)).toEqual(["empathy", "compassion", "ladder", "peach"]);
    const now = WHICH_TWO_BANK.find(b => b.id === "wt-50")!;
    expect(now.items.map(o => o.text)).not.toContain("ladder");
  });
});
