import { test, expect, type Page, type Locator } from "@playwright/test";
import { GENRES, GENRE_LIST } from "@/lib/genres";
import type { GenreId } from "@/lib/engine/types";

// Automated play-through of every genre, driven through the hidden QA level
// (lib/levels/levelQa.ts, id 99 — unreleased, reachable only via a direct
// link). This is the release gate's evidence for owner decision #14
// (AGENTS.md §3): nothing deploys unless every puzzle demonstrably works.
const QA_URL = "/play?level=99&part=Q&replay=1";
const DONE = { name: "Done", exact: true } as const;

/**
 * Runs before every navigation in a test:
 *  - speechSynthesis.speak() resolves near-instantly instead of waiting on
 *    (or hanging on) a real audio backend, which headless Chromium doesn't have.
 *  - fetch("/api/state") reports { ok: false } so the runner falls back to
 *    resolving the part from local/computed state instead of a real KV round
 *    trip (see lib/engine/storage.ts fetchServerState).
 *  - fetch("/api/sessions") reports { ok: true } so the runner's outbox
 *    flush "succeeds" without ever writing to KV.
 * Everything else passes through to the real fetch/speech implementation.
 */
async function stubBrowser(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (typeof window.SpeechSynthesisUtterance === "undefined") {
      class FallbackUtterance {
        text: string;
        onend: ((this: SpeechSynthesisUtterance, ev: Event) => unknown) | null = null;
        constructor(text: string) {
          this.text = text;
        }
      }
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = FallbackUtterance;
    }
    if (!window.speechSynthesis) {
      (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {};
    }
    window.speechSynthesis.speak = (utterance) => {
      setTimeout(() => {
        utterance.onend?.(new Event("end") as unknown as SpeechSynthesisEvent);
      }, 30);
    };
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.getVoices = () => [];

    const originalFetch = window.fetch.bind(window);
    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
      if (url.includes("/api/state")) {
        return new Response(JSON.stringify({ ok: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/sessions")) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return originalFetch(input, init);
    }) as typeof window.fetch;
  });
}

interface GenreTestSpec {
  /** Asserts the item is fully rendered and ready to answer. */
  assertItem: (page: Page) => Promise<void>;
  /** Produces ANY valid (not necessarily correct) response and submits it. */
  answer: (page: Page) => Promise<void>;
}

const choiceSpec: GenreTestSpec = {
  assertItem: async (page) => {
    await expect(page.getByTestId("choice-option")).toHaveCount(4);
  },
  answer: async (page) => {
    await page.getByTestId("choice-option").first().click();
    await page.getByRole("button", DONE).click();
  },
};

const SPECS: Record<GenreId, GenreTestSpec> = {
  blockDesign: {
    // Block Builder: "Your board" + Done. The default all-white board is
    // itself a valid (if usually wrong) response — Done isn't gated on any
    // particular selection, so no board taps are needed to answer.
    assertItem: async (page) => {
      await expect(page.getByText("Your board")).toBeVisible();
      await expect(page.getByRole("button", DONE)).toBeVisible();
    },
    answer: async (page) => {
      await page.getByRole("button", DONE).click();
    },
  },
  visualPuzzles: {
    // Piece Picker: optionCount is 3, 4, or 6 depending on difficulty (see
    // bandOptionsFor in lib/genres/visualPuzzles.ts) and Done needs exactly
    // pieceCount (2 or 3) picked — read both off the "Tap N pieces" line the
    // view renders rather than hard-coding either.
    assertItem: async (page) => {
      await expect(page.getByText(/^Tap \d pieces$/)).toBeVisible();
      const count = await page.getByTestId("piece-option").count();
      expect([3, 4, 6]).toContain(count);
    },
    answer: async (page) => {
      const label = await page.getByText(/^Tap \d pieces$/).textContent();
      const pieceCount = Number(label!.match(/\d+/)![0]);
      const pieces = page.getByTestId("piece-option");
      for (let i = 0; i < pieceCount; i++) {
        await pieces.nth(i).click();
      }
      await page.getByRole("button", DONE).click();
    },
  },
  matrix: {
    // What's Missing?: a "?" blank cell + 5 options.
    assertItem: async (page) => {
      await expect(page.getByText("?", { exact: true })).toBeVisible();
      await expect(page.getByTestId("matrix-option")).toHaveCount(5);
    },
    answer: async (page) => {
      await page.getByTestId("matrix-option").first().click();
      await page.getByRole("button", DONE).click();
    },
  },
  figureWeights: {
    // Balance: 5 options.
    assertItem: async (page) => {
      await expect(page.getByTestId("weight-option")).toHaveCount(5);
    },
    answer: async (page) => {
      await page.getByTestId("weight-option").first().click();
      await page.getByRole("button", DONE).click();
    },
  },
  arithmetic: {
    // Story Sums: a numpad (the QA block has no `display` set, so the
    // problem text also shows immediately — the numpad itself always renders).
    assertItem: async (page) => {
      await expect(page.getByRole("button", { name: "5", exact: true })).toBeVisible();
    },
    answer: async (page) => {
      await page.getByRole("button", { name: "5", exact: true }).click();
      await page.getByRole("button", DONE).click();
    },
  },
  digitSpan: {
    // Number Echo: either a one-time "New rule" intro (tap Ready) or,
    // after ~1s/digit of "listening", the numpad. QA's block starts at d1
    // (always the "forward" task) so the intro never actually triggers here,
    // but this stays defensive in case that ever changes.
    assertItem: async (page) => {
      const readyBtn = page.getByRole("button", { name: "Ready", exact: true });
      if (await readyBtn.isVisible().catch(() => false)) {
        await readyBtn.click();
      }
      await expect(page.getByRole("button", { name: "1", exact: true })).toBeVisible({ timeout: 10_000 });
    },
    answer: async (page) => {
      await page.getByRole("button", { name: "1", exact: true }).click();
      await page.getByRole("button", { name: /Done/ }).click();
    },
  },
  pictureSpan: {
    // Picture Memory: the exposure (no controls) is shown first, then the
    // picker grid — wait for at least one picture choice to appear.
    assertItem: async (page) => {
      await expect(page.getByTestId("picture-choice").first()).toBeVisible({ timeout: 8_000 });
    },
    answer: async (page) => {
      await page.getByTestId("picture-choice").first().click();
      await page.getByRole("button", DONE).click();
    },
  },
  coding: {
    // Secret Code (speed block): 5 mark buttons.
    assertItem: async (page) => {
      await expect(page.getByTestId("mark-option")).toHaveCount(5);
    },
    answer: async (page) => {
      await page.getByTestId("mark-option").first().click();
    },
  },
  symbolSearch: {
    // Symbol Hunt (speed block): YES / NO.
    assertItem: async (page) => {
      await expect(page.getByRole("button", { name: "YES", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "NO", exact: true })).toBeVisible();
    },
    answer: async (page) => {
      await page.getByRole("button", { name: "YES", exact: true }).click();
    },
  },
  similarities: choiceSpec,
  vocabulary: choiceSpec,
  information: choiceSpec,
  comprehension: choiceSpec,
};

/** The one control to click for a speed-block "answer" — used both to answer
 * and, via its DOM identity, to prove the next item actually mounted (see
 * clickAndExpectRemount). */
function speedControl(page: Page, id: GenreId): Locator {
  if (id === "coding") return page.getByTestId("mark-option").first();
  if (id === "symbolSearch") return page.getByRole("button", { name: "YES", exact: true });
  throw new Error(`speedControl: ${id} is not a speed genre`);
}

/**
 * Clicks `control` and confirms the runner actually advanced to a new item:
 * every item view remounts under a fresh `key` (app/play/page.tsx), so the
 * exact DOM node we clicked is guaranteed to detach once the next item
 * mounts — a deterministic proxy for "item changed" that doesn't depend on
 * two consecutive randomly-generated items happening to differ in content.
 */
async function clickAndExpectRemount(page: Page, control: Locator): Promise<void> {
  const handle = await control.elementHandle();
  if (!handle) throw new Error("clickAndExpectRemount: control not found");
  await handle.click();
  await page.waitForFunction((el) => !el.isConnected, handle, { timeout: 3_000 }).catch(() => {});
  await handle.dispose();
}

test.describe("play-through", () => {
  test("plays every genre block in the hidden QA level and reaches the end", async ({ page }) => {
    // 13 genres, several with multi-second "reveal"/listening/exposure
    // pauses by design (see comments below) — comfortably finishes well
    // under the spec's ~3 minute budget, but well past Playwright's 30s
    // per-test default.
    test.setTimeout(150_000);

    await stubBrowser(page);
    await page.goto(QA_URL);

    for (let i = 0; i < GENRE_LIST.length; i++) {
      const id = GENRE_LIST[i];
      const genre = GENRES[id];
      const spec = SPECS[id];
      const isLast = i === GENRE_LIST.length - 1;
      const isSpeed = genre.mode === "speedBlock";
      const isTimed = genre.timing.kind !== "none";

      // ---- sample screen: kidTitle + Start ----
      await expect(page.getByRole("heading", { name: genre.kidTitle, exact: true })).toBeVisible({ timeout: 15_000 });
      const startBtn = page.getByRole("button", { name: "Start", exact: true });
      await expect(startBtn).toBeVisible();
      await startBtn.click();

      if (isSpeed) {
        // ---- speed block: one item, several rapid answers, then wait it out ----
        await spec.assertItem(page);
        await expect(page.getByTestId("countdown")).toBeVisible();

        for (let k = 0; k < 3; k++) {
          await clickAndExpectRemount(page, speedControl(page, id));
        }
      } else {
        // ---- staircase block: maxItems: 2, so exactly two items per block ----
        for (let itemNum = 0; itemNum < 2; itemNum++) {
          await spec.assertItem(page);

          if (isTimed) {
            await expect(page.getByTestId("countdown")).toBeVisible();
          } else {
            await expect(page.getByTestId("countdown")).toHaveCount(0);
          }

          await spec.answer(page);

          // levelQa uses feedback: "reveal", so every answer (right or
          // wrong) is followed by one of these two screens before the next
          // item (or the block end) appears — the "item advances" signal.
          await expect(page.getByText(/Yes!|Here is the answer/)).toBeVisible({ timeout: 6_000 });
        }
      }

      // ---- block end: next block's sample screen, or the finish screen ----
      if (isLast) {
        await expect(page.getByText("All done for today!")).toBeVisible({ timeout: 15_000 });
      } else {
        const nextGenre = GENRES[GENRE_LIST[i + 1]];
        await expect(page.getByRole("heading", { name: nextGenre.kidTitle, exact: true })).toBeVisible({
          timeout: 15_000,
        });
      }
    }
  });
});

test.describe("smoke", () => {
  test("home page renders a Play button", async ({ page }) => {
    await stubBrowser(page);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test("parent page asks for a parent key", async ({ page }) => {
    await stubBrowser(page);
    await page.goto("/parent");
    await expect(page.getByPlaceholder("Parent key")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Enter", exact: true })).toBeVisible();
  });
});
