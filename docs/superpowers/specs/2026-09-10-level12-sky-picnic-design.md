# Level 12 "Pip's Sky Picnic" — design (2026-09-10)

Owner's words: "Always remember it has to be win heavy and she MUST enjoy it."

## Her Level 11 data (2026-09-10, 30/36, zero Not-fun taps, zero timeouts)
| genre | L11 block | result | Level 12 |
|---|---|---|---|
| arithmetic | d13 → 16 probe, 8 items | 5/8, misses d13 (29s), d14 (9s), d15 (3s) — ended on twoWrong | STEP BACK: start 11, 6 items → d13, ends on a win |
| information | start 8, 6 items | 5/6, one miss d8, reached d9 | hold 8 |
| whichTwo | start 3, 4 items + 1 teaching | 4/4 but d4 in 15s and 44s | hold 3 (start 4 would reach the d5 wall) |
| whatWouldYouDo | start 7, 6 items | 6/6 to d9, 15-37s | climb to 8, 4 items → d9 < wall 10 |
| swapShop | start 7, 6 items, 1.5× | 5/6, miss d9 | hold 7 |
| fillTheGap | start 7, 6 items | 5/6, miss d7 (60s) | hold 7 |

The probe question from Level 11 is answered: her Story Sums wall is d14-15. Wall table unchanged
(no bail or timeout happened). Live ceilings: arithmetic 15, information 11, whichTwo 10,
fillTheGap 9, whatWouldYouDo 10, swapShop 9.

## Rule
Decision #30 recipe, no exceptions this time: every block's flawless reach (start + floor((N−1)/2))
is strictly under its wall; a clean run ends on `maxItems`. No engine/bank/scale change.

Parts: A Cloud Sums ☁️ (arithmetic → information), B Kite Words 🪁 (whichTwo → whatWouldYouDo),
C Rainbow Chest 🌈 (swapShop → fillTheGap). 32 items total.

Guards: `levels.test.ts` Level 12 describe + `level12.shape.test.ts` (drives the real staircase).
Built via /cos: gateway deepseek-v4-flash drafted all four files (one gating-list fix by hand);
red team round 1 = deepseek-v4-flash + gpt-5.6-luna (Vyce flash returned HTTP 500 three times).
