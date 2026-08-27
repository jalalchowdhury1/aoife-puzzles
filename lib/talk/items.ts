// Talk with Pip (owner decision #22, 2026-08-27): open-ended SPOKEN
// production practice for the four verbal door areas, run WITH a grown-up.
// The multiple-choice genres measure recognition (picking the best answer);
// the real WISC-V verbal subtests score PRODUCTION: the child answers out
// loud in her own words and the answer's QUALITY earns 2 / 1 / 0 — the
// abstract category ("both are desserts") beats the surface feature ("both
// are sweet"). This bank is OURS, written fresh 2026-08-27; nothing is from
// Pearson. Items are cousins in content, real-format in delivery, which the
// owner explicitly approved for this grown-up-supervised tab only — all
// solo/scored play stays cousins-only (decision #16).
//
// House rules for every string here (they are spoken by TTS and shown to
// both of them): no dash characters, no contractions, warm words only.

export type TalkArea = "alike" | "words" | "knowing" | "why";

export interface TalkItem {
  id: string;
  area: TalkArea;
  /** Spoken aloud by Pip via TTS and shown large on the child card. */
  prompt: string;
  /** Grown-up strip: what a full-credit (big idea) answer sounds like. */
  model2: string;
  /** Grown-up strip: what a halfway (surface feature) answer sounds like. */
  model1: string;
}

export const TALK_AREAS: Record<TalkArea, { title: string; emoji: string }> = {
  alike: { title: "What Goes Together", emoji: "🧺" },
  words: { title: "Word Wonders", emoji: "💬" },
  knowing: { title: "Did You Know", emoji: "🌍" },
  why: { title: "Big Whys", emoji: "🤔" },
};

export const TALK_ITEMS: TalkItem[] = [
  // ---- alike: category (2) beats shared feature (1) ----------------------
  { id: "alike-01", area: "alike", prompt: "How are a cookie and a cake alike?", model2: "They are both desserts", model1: "They are both sweet" },
  { id: "alike-02", area: "alike", prompt: "How are a shoe and a sock alike?", model2: "They are both clothes you wear on your feet", model1: "They both go on your feet" },
  { id: "alike-03", area: "alike", prompt: "How are a river and an ocean alike?", model2: "They are both big bodies of water", model1: "They both have water in them" },
  { id: "alike-04", area: "alike", prompt: "How are a drum and a piano alike?", model2: "They are both musical instruments", model1: "They both make sounds" },
  { id: "alike-05", area: "alike", prompt: "How are a butterfly and an airplane alike?", model2: "They are both things that fly", model1: "They both have wings" },
  { id: "alike-06", area: "alike", prompt: "How are happy and sad alike?", model2: "They are both feelings", model1: "They both happen to people" },
  { id: "alike-07", area: "alike", prompt: "How are a doctor and a firefighter alike?", model2: "They are both helpers who keep people safe", model1: "They both wear uniforms" },
  { id: "alike-08", area: "alike", prompt: "How are milk and juice alike?", model2: "They are both drinks", model1: "They are both in the fridge" },
  { id: "alike-09", area: "alike", prompt: "How are a square and a triangle alike?", model2: "They are both shapes", model1: "They both have straight sides" },
  { id: "alike-10", area: "alike", prompt: "How are winter and summer alike?", model2: "They are both seasons", model1: "They both come every year" },
  { id: "alike-11", area: "alike", prompt: "How are a whisper and a shout alike?", model2: "They are both ways of talking", model1: "They both come from your mouth" },
  { id: "alike-12", area: "alike", prompt: "How are a seed and an egg alike?", model2: "They both grow into living things", model1: "They are both small" },
  // ---- words: precise definition (2) beats a near word (1) ---------------
  { id: "words-01", area: "words", prompt: "What is an island?", model2: "Land with water all around it", model1: "A place in the sea" },
  { id: "words-02", area: "words", prompt: "What does enormous mean?", model2: "Very very big, bigger than usual", model1: "Big" },
  { id: "words-03", area: "words", prompt: "What does fragile mean?", model2: "Easy to break, so you hold it gently", model1: "Something that breaks" },
  { id: "words-04", area: "words", prompt: "What is a vehicle?", model2: "A machine that carries people or things from place to place", model1: "Like a car" },
  { id: "words-05", area: "words", prompt: "What does exhausted mean?", model2: "So tired you can barely keep going", model1: "Sleepy" },
  { id: "words-06", area: "words", prompt: "What is a shadow?", model2: "The dark shape made when something blocks the light", model1: "The dark thing that follows you" },
  { id: "words-07", area: "words", prompt: "What does generous mean?", model2: "Happy to share and give to others", model1: "Nice" },
  { id: "words-08", area: "words", prompt: "What is a promise?", model2: "Saying you will really do something and meaning it", model1: "Telling someone you will do it" },
  { id: "words-09", area: "words", prompt: "What does transparent mean?", model2: "You can see right through it, like glass", model1: "Clear" },
  { id: "words-10", area: "words", prompt: "What is courage?", model2: "Doing the right thing even when you feel scared", model1: "Being brave" },
  { id: "words-11", area: "words", prompt: "What does ancient mean?", model2: "From a very very long time ago", model1: "Old" },
  { id: "words-12", area: "words", prompt: "What is a stranger?", model2: "A person you do not know", model1: "Someone new" },
  // ---- knowing: the exact fact (2) beats a nearby answer (1) -------------
  { id: "knowing-01", area: "knowing", prompt: "How many legs does an insect have?", model2: "Six", model1: "Lots of legs" },
  { id: "knowing-02", area: "knowing", prompt: "What do we call a baby dog?", model2: "A puppy", model1: "A baby doggy" },
  { id: "knowing-03", area: "knowing", prompt: "Which season comes right after winter?", model2: "Spring", model1: "The warm one" },
  { id: "knowing-04", area: "knowing", prompt: "How many days are in a week?", model2: "Seven", model1: "Close, like six or eight" },
  { id: "knowing-05", area: "knowing", prompt: "What melts ice into water?", model2: "Heat or warmth", model1: "The sun" },
  { id: "knowing-06", area: "knowing", prompt: "What do bees collect from flowers?", model2: "Nectar, which they turn into honey", model1: "Honey" },
  { id: "knowing-07", area: "knowing", prompt: "How many months are in a year?", model2: "Twelve", model1: "Close, like ten or eleven" },
  { id: "knowing-08", area: "knowing", prompt: "What planet do we live on?", model2: "Earth", model1: "The world" },
  { id: "knowing-09", area: "knowing", prompt: "What do we call a person who flies a plane?", model2: "A pilot", model1: "A plane driver" },
  { id: "knowing-10", area: "knowing", prompt: "What are clouds made of?", model2: "Tiny drops of water", model1: "Rain or fluff" },
  { id: "knowing-11", area: "knowing", prompt: "How many sides does a triangle have?", model2: "Three", model1: "Close, like four" },
  { id: "knowing-12", area: "knowing", prompt: "What do caterpillars turn into?", model2: "Butterflies or moths", model1: "Something with wings" },
  // ---- why: the underlying reason (2) beats restating the rule (1) -------
  { id: "why-01", area: "why", prompt: "Why do we brush our teeth?", model2: "To clean off germs so our teeth stay healthy", model1: "So they are clean" },
  { id: "why-02", area: "why", prompt: "Why do cars stop at red lights?", model2: "So everyone takes turns and nobody crashes", model1: "Because red means stop" },
  { id: "why-03", area: "why", prompt: "What should you do if you spill your drink?", model2: "Tell a grown up and help wipe it up", model1: "Wipe it" },
  { id: "why-04", area: "why", prompt: "Why do we wear coats in winter?", model2: "To keep our body heat in so we stay warm", model1: "Because it is cold" },
  { id: "why-05", area: "why", prompt: "Why do we keep food in the refrigerator?", model2: "The cold keeps food fresh and stops germs from growing", model1: "So it stays cold" },
  { id: "why-06", area: "why", prompt: "What should you do if a smoke alarm beeps loudly?", model2: "Get outside fast and find a grown up", model1: "Tell a grown up" },
  { id: "why-07", area: "why", prompt: "Why do we say please and thank you?", model2: "To show people kindness and respect", model1: "Because it is polite" },
  { id: "why-08", area: "why", prompt: "Why do plants need sunlight?", model2: "They use the light to make their own food", model1: "To grow" },
  { id: "why-09", area: "why", prompt: "Why do we look both ways before crossing a street?", model2: "To make sure no cars are coming so we stay safe", model1: "To see the cars" },
  { id: "why-10", area: "why", prompt: "What should you do if you find a toy at the playground that is not yours?", model2: "Leave it there or give it to a grown up so the owner can find it", model1: "Not take it home" },
  { id: "why-11", area: "why", prompt: "Why do people save money?", model2: "So they have it later for things they really need", model1: "To buy things" },
  { id: "why-12", area: "why", prompt: "Why do we wash our hands before eating?", model2: "To wash away germs that could make us sick", model1: "To make them clean" },
];

/** Best score she has earned per item so far (from the local mirror). */
export type TalkBest = Record<string, 0 | 1 | 2>;

/**
 * Picks one sitting's worth of items: retries first (asked before, best
 * score under 2 — "we will chat about that one again"), then unseen items,
 * both in bank order, capped short so a chat stays a chat.
 */
export function pickTalkSession(best: TalkBest, cap = 8): TalkItem[] {
  const retries = TALK_ITEMS.filter((i) => best[i.id] !== undefined && best[i.id] < 2);
  const unseen = TALK_ITEMS.filter((i) => best[i.id] === undefined);
  return [...retries, ...unseen].slice(0, cap);
}
