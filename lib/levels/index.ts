import type { LevelConfig } from "../engine/types";
import { level1 } from "./level1";
import { level2 } from "./level2";

export const LEVELS: LevelConfig[] = [level1, level2];

/** Levels the child can reach from Play/home. Unreleased levels stay hidden until reviewed against her data. */
export const RELEASED_LEVELS: LevelConfig[] = LEVELS.filter((l) => l.released !== false);
