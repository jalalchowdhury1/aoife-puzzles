// Talk with Pip result records (decision #22). Kept OUT of SessionRecord on
// purpose: production scores are a different measurement class from the
// multiple-choice recognition data and must never flow into computeProfile
// or the Ages tab. KV keys live under `aoife_puzzles:talk:*` with their own
// index; the parent page reads them through GET /api/talk (gated).

export interface TalkResult { itemId: string; score: 0 | 1 | 2 }

export interface TalkRecord {
  id: string;              // ulid
  startedAt: string;
  endedAt?: string;
  results: TalkResult[];
  complete: boolean;
}
