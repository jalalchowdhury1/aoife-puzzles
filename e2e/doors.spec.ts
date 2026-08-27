import { test, expect, type Page } from "@playwright/test";

// e2e for the two decision #22/#23 surfaces (2026-08-27): Talk with Pip
// (grown-up-judged spoken production) and the Practice tab (rematches of her
// actual missed items). Both run fully stubbed — no KV, no Telegram, no real
// speech backend — mirroring playthrough.spec.ts.

const PRACTICE_PENDING = [
  { genre: "fillTheGap", seed: 7, d: 3 },
  { genre: "swapShop", seed: 9, d: 4 },
];

async function stubBrowser(page: Page): Promise<void> {
  await page.addInitScript((pending) => {
    if (typeof window.SpeechSynthesisUtterance === "undefined") {
      class FallbackUtterance {
        text: string;
        onend: ((this: SpeechSynthesisUtterance, ev: Event) => unknown) | null = null;
        constructor(text: string) { this.text = text; }
      }
      (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = FallbackUtterance;
    }
    if (!window.speechSynthesis) {
      (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {};
    }
    window.speechSynthesis.speak = (utterance) => {
      setTimeout(() => { utterance.onend?.(new Event("end") as unknown as SpeechSynthesisEvent); }, 30);
    };
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.getVoices = () => [];

    const originalFetch = window.fetch.bind(window);
    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
      const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
      if (url.includes("/api/practice")) return json({ ok: true, pending });
      if (url.includes("/api/talk")) return json({ ok: true });
      if (url.includes("/api/state")) return json({ ok: false });
      if (url.includes("/api/sessions")) return json({ ok: true });
      return originalFetch(input, init);
    }) as typeof window.fetch;
  }, PRACTICE_PENDING);
}

test.describe("Talk with Pip (decision #22)", () => {
  test("a full grown-up-judged sitting reaches the end screen", async ({ page }) => {
    test.setTimeout(60_000);
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") pageErrors.push(m.text()); });
    await stubBrowser(page);
    await page.goto("/talk");
    page.on("close", () => { if (pageErrors.length) console.log("PAGE ERRORS:", pageErrors.slice(0, 5).join("\n---\n")); });
    await page.getByRole("button", { name: "Start talking" }).click();

    for (let i = 0; i < 8; i++) {
      await expect(page.getByTestId("talk-prompt")).toBeVisible({ timeout: 10_000 });
      // vary the grown-up's verdicts across the sitting
      const verdict = i % 3 === 0 ? "talk-score-2" : i % 3 === 1 ? "talk-score-1" : "talk-score-0";
      await page.getByTestId(verdict).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }

    await expect(page.getByRole("heading", { name: "What a chat!" })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Practice tab (decision #23)", () => {
  test("plays every pending rematch to the done screen", async ({ page }) => {
    test.setTimeout(90_000);
    await stubBrowser(page);
    await page.goto("/practice");
    await expect(page.getByRole("heading", { name: "Rematch Time!" })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Start", exact: true }).click();

    for (let i = 0; i < PRACTICE_PENDING.length; i++) {
      const options = page.getByTestId("answer-option");
      await expect(options.first()).toBeVisible({ timeout: 15_000 });
      await options.first().click();
      await page.getByRole("button", { name: /Done/ }).click();
      // A miss shows the reveal screen (tap "Got it!"); a win auto-advances
      // after the praise beat. Handle both without caring which happened.
      const gotIt = page.getByRole("button", { name: "Got it!" });
      if (await gotIt.isVisible({ timeout: 2_500 }).catch(() => false)) {
        await gotIt.click();
      }
    }

    await expect(page.getByRole("heading", { name: "Rematch done!" })).toBeVisible({ timeout: 15_000 });
  });
});
