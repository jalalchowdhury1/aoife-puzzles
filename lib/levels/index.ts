import type { LevelConfig } from "../engine/types";
import { level1 } from "./level1";
import { level2 } from "./level2";
import { level3 } from "./level3";
import { level4 } from "./level4";
import { level5 } from "./level5";
import { level6 } from "./level6";
import { level7 } from "./level7";
import { level8 } from "./level8";
import { levelQa } from "./levelQa";

// levelQa (id 99) is hidden (`released: false`) — it exists only so the
// automated e2e play-through (e2e/playthrough.spec.ts) has a direct,
// reachable link (`/play?level=99&part=Q&replay=1`) that exercises every
// genre in one short part. See lib/levels/levelQa.ts.
export const LEVELS: LevelConfig[] = [level1, level2, level3, level4, level5, level6, level7, level8, levelQa];

/** Levels the child can reach from Play/home. Unreleased levels stay hidden until reviewed against her data. */
export const RELEASED_LEVELS: LevelConfig[] = LEVELS.filter((l) => l.released !== false);
