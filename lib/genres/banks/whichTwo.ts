import type { Difficulty } from "../../engine/types";

export interface WhichTwoOption { text: string; emoji?: string }
export interface WhichTwoReason { text: string; points: 0 | 1 | 2 }

export interface WhichTwoBankItem {
  id: string;
  d: Difficulty;
  /** The four pictures/words shown to her; exactly two of them (`pair`) belong together. */
  items: [WhichTwoOption, WhichTwoOption, WhichTwoOption, WhichTwoOption];
  /** Indices into `items` of the two that belong together. */
  pair: [number, number];
  /** Exactly one 2 point (best), one 1 point (partial), one 0 point reason. */
  reasons: [WhichTwoReason, WhichTwoReason, WhichTwoReason];
  explanation: string;
  /**
   * Reviewer note: why the other two items do NOT plausibly pair with each
   * other or with either item in `pair`. Required so every item has been
   * deliberately checked for a second valid answer (owner decision #14:
   * validity is sacred — exactly one pair may ever belong).
   */
  distractorNote: string;
}

// Original "which two go together, and why" items, age ramped d1 (about age
// 6) through d10 (about age 13):
//   d1-2  concrete objects with a picture, all four options carry an emoji.
//   d3-4  categories, word only (no picture) — same idea, one abstraction step up.
//   d5-6  function: the pair shares a purpose or job, not a type of object.
//   d7-8  abstract nouns: qualities, ideas, feelings.
//   d9-10 hard abstractions: pairs of related concepts, distractors from a
//         wholly different conceptual space so there is never a second
//         plausible pairing among the abstract words themselves.
// Widened to d15 on 2026-08-29 (decision #17 earned, decision #26): her Level
// 8C ceiling probe went 10/10 and topped d10 without a single miss, so d10
// stopped measuring her and started measuring the bank. The new bands keep
// climbing the SAME axis (how abstract is the shared rule?) rather than
// adding vocabulary difficulty for its own sake:
//   d11-12 hidden shared PROCESS: the pair is joined by the mechanism behind
//          both, not by what either one is.
//   d13    social systems: pairs joined by the role they play between people.
//   d14    change over time: pairs joined by how they unfold, not what they are.
//   d15    ideas about ideas: representation, belief, and meaning itself.
// DECISION #29 (2026-08-30, Jalal: "banana ladder empathy compassion ... the
// level difference alone lets her choose the big words"): from d5 up every
// item used two related words plus two random household objects, so the
// vocabulary REGISTER gave the pair away and the tap measured nothing (her
// 10/10 "perfect" d10 run). Rule now: all four options sit at the SAME
// register and abstraction level; each distractor is a near-miss that shares
// a surface feature with one pair member (or is its contrast) but not the
// 2 point rule; the two distractors never form a pair of their own; no
// option at d7+ may be a picturable concrete object. The bank as it stood before
// this change is frozen in banks/legacy/2026-08-30/whichTwo.ts so her history
// replays with the words she actually saw (banks/legacy/index.ts).
// Reasons (2026-08-30 red team): the 1 point reason is padded to at least
// 70% of the 2 point reason's length so the answer cannot be found by "tap
// the longest", and the 0 point reason is plausible sounding but plainly
// false of the pair, never a bare color or size (44 of 75 were).
// Every 2 point reason states the abstract rule; every 1 point reason is a
// true but surface observation; every 0 point reason is plainly false of the
// pair (that is the scoring contract the real verbal subtests use).
export const WHICH_TWO_BANK: WhichTwoBankItem[] = [
  // ---------------------------------------------------------------------
  // d1: concrete objects, pictures, age 6
  // ---------------------------------------------------------------------
  {
    id: "wt-01", d: 1,
    items: [
      { text: "apple", emoji: "🍎" },
      { text: "banana", emoji: "🍌" },
      { text: "car", emoji: "🚗" },
      { text: "dog", emoji: "🐶" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both fruit", points: 2 },
      { text: "They are both food", points: 1 },
      { text: "They both grow under the ground", points: 0 },
    ],
    explanation: "An apple and a banana are both fruit.",
    distractorNote: "A car is a vehicle and a dog is an animal; neither shares a category with the fruit or with each other.",
  },
  {
    id: "wt-02", d: 1,
    items: [
      { text: "sock", emoji: "🧦" },
      { text: "shoe", emoji: "👟" },
      { text: "fork", emoji: "🍴" },
      { text: "tree", emoji: "🌳" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both worn on your feet", points: 2 },
      { text: "They are both things you wear", points: 1 },
      { text: "You wear both of them on your head", points: 0 },
    ],
    explanation: "A sock and a shoe are both worn on your feet.",
    distractorNote: "A fork is a kitchen tool and a tree is a plant; neither is worn, and they do not relate to each other.",
  },
  {
    id: "wt-03", d: 1,
    items: [
      { text: "cup", emoji: "☕" },
      { text: "plate", emoji: "🍽️" },
      { text: "bus", emoji: "🚌" },
      { text: "guitar", emoji: "🎸" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both dishes you eat and drink from", points: 2 },
      { text: "They are both kept in the kitchen cupboard", points: 1 },
      { text: "They are both alive and both can walk around the kitchen", points: 0 },
    ],
    explanation: "A cup and a plate are both dishes you eat and drink from.",
    distractorNote: "A bus is a vehicle and a guitar is an instrument; neither is a dish, and they share nothing with each other.",
  },
  {
    id: "wt-04", d: 1,
    items: [
      { text: "scarf", emoji: "🧣" },
      { text: "glove", emoji: "🧤" },
      { text: "ball", emoji: "⚽" },
      { text: "book", emoji: "📖" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you wear to stay warm", points: 2 },
      { text: "They are both things you put on and take off", points: 1 },
      { text: "You wear both of them in the swimming pool", points: 0 },
    ],
    explanation: "A scarf and a glove are both things you wear to stay warm.",
    distractorNote: "A ball and a book are things a child owns, but neither is worn, and they do not relate to each other.",
  },
  {
    id: "wt-05", d: 1,
    items: [
      { text: "fish", emoji: "🐟" },
      { text: "bird", emoji: "🐦" },
      { text: "chair", emoji: "🪑" },
      { text: "cup", emoji: "☕" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both animals", points: 2 },
      { text: "They can both move on their own", points: 1 },
      { text: "They both have four legs", points: 0 },
    ],
    explanation: "A fish and a bird are both animals.",
    distractorNote: "A chair and a cup are objects, not animals; a kite was removed because bird + kite (both fly) was a real second pair.",
  },

  // ---------------------------------------------------------------------
  // d2: concrete objects, pictures, age 6
  // ---------------------------------------------------------------------
  {
    id: "wt-06", d: 2,
    items: [
      { text: "bucket", emoji: "🪣" },
      { text: "bowl", emoji: "🥣" },
      { text: "brush", emoji: "🖌️" },
      { text: "lamp", emoji: "💡" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both used to hold things", points: 2 },
      { text: "They are both round on the top and open at the top", points: 1 },
      { text: "You can eat both of them", points: 0 },
    ],
    explanation: "A bucket and a bowl are both used to hold things.",
    distractorNote: "A brush and a lamp do not hold things, and they do not relate to each other.",
  },
  {
    id: "wt-07", d: 2,
    items: [
      { text: "umbrella", emoji: "☂️" },
      { text: "raincoat", emoji: "🧥" },
      { text: "book", emoji: "📖" },
      { text: "orange", emoji: "🍊" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They both keep you dry in the rain", points: 2 },
      { text: "They are both things you carry outside", points: 1 },
      { text: "You use both of them to eat soup", points: 0 },
    ],
    explanation: "An umbrella and a raincoat both keep you dry in the rain.",
    distractorNote: "A book and an orange share no category (the old drum + orange were both round).",
  },
  {
    id: "wt-08", d: 2,
    items: [
      { text: "candle", emoji: "🕯️" },
      { text: "lamp", emoji: "💡" },
      { text: "banana", emoji: "🍌" },
      { text: "drum", emoji: "🥁" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They both give light", points: 2 },
      { text: "They are both used at night", points: 1 },
      { text: "They are both good to eat", points: 0 },
    ],
    explanation: "A candle and a lamp both give light.",
    distractorNote: "A banana and a drum do not give light, and they do not relate to each other.",
  },
  {
    id: "wt-09", d: 2,
    items: [
      { text: "kite", emoji: "🪁" },
      { text: "balloon", emoji: "🎈" },
      { text: "shoe", emoji: "👟" },
      { text: "spoon", emoji: "🥄" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They can both float or fly in the air", points: 2 },
      { text: "They are both toys you play with outside", points: 1 },
      { text: "They both have four wheels", points: 0 },
    ],
    explanation: "A kite and a balloon can both float or fly in the air.",
    distractorNote: "A shoe and a spoon do not float or fly and are not toys, so the 1 point reason singles out only the key.",
  },
  {
    id: "wt-10", d: 2,
    items: [
      { text: "guitar", emoji: "🎸" },
      { text: "drum", emoji: "🥁" },
      { text: "peach", emoji: "🍑" },
      { text: "chair", emoji: "🪑" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both musical instruments", points: 2 },
      { text: "You can play both of them with your hands", points: 1 },
      { text: "You can eat both of them for lunch", points: 0 },
    ],
    explanation: "A guitar and a drum are both musical instruments.",
    distractorNote: "A peach and a chair have nothing to do with music, and they do not relate to each other.",
  },

  // ---------------------------------------------------------------------
  // d3: categories, word only, age 7 to 8
  // ---------------------------------------------------------------------
  {
    id: "wt-11", d: 3,
    items: [{ text: "whale" }, { text: "dolphin" }, { text: "ladder" }, { text: "carrot" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both animals that live in the ocean", points: 2 },
      { text: "They are both animals that are very big", points: 1 },
      { text: "They both have feathers and wings and live in trees", points: 0 },
    ],
    explanation: "A whale and a dolphin are both animals that live in the ocean.",
    distractorNote: "A ladder is a tool and a carrot is a vegetable, from two different worlds; neither lives in the ocean and they share no category with each other. (Earlier draft used ladder and kettle, two household objects that could pass as a pair.)",
  },
  {
    id: "wt-12", d: 3,
    items: [{ text: "tulip" }, { text: "sunflower" }, { text: "wrench" }, { text: "pillow" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both flowers", points: 2 },
      { text: "They both grow in a garden", points: 1 },
      { text: "They both grow at the bottom of the sea", points: 0 },
    ],
    explanation: "A tulip and a sunflower are both flowers.",
    distractorNote: "A wrench and a pillow do not relate to flowers, and they do not relate to each other.",
  },
  {
    id: "wt-13", d: 3,
    items: [{ text: "wrench" }, { text: "pliers" }, { text: "cloud" }, { text: "peach" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both tools", points: 2 },
      { text: "They are both made of metal", points: 1 },
      { text: "They are both things you can eat", points: 0 },
    ],
    explanation: "A wrench and pliers are both tools.",
    distractorNote: "A cloud and a peach are unrelated to tools, and they do not relate to each other.",
  },
  {
    id: "wt-14", d: 3,
    items: [{ text: "trumpet" }, { text: "flute" }, { text: "potato" }, { text: "ladder" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both musical instruments", points: 2 },
      { text: "You blow air into both of them", points: 1 },
      { text: "They are both used to cook food in the oven", points: 0 },
    ],
    explanation: "A trumpet and a flute are both musical instruments.",
    distractorNote: "A potato and a ladder have nothing to do with music, and they do not relate to each other.",
  },
  {
    id: "wt-15", d: 3,
    items: [{ text: "sparrow" }, { text: "owl" }, { text: "sofa" }, { text: "river" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both birds", points: 2 },
      { text: "They can both fly", points: 1 },
      { text: "They both live under the sea", points: 0 },
    ],
    explanation: "A sparrow and an owl are both birds.",
    distractorNote: "A sofa is furniture and a river is a place outdoors; neither is a bird, and a sofa and a river have nothing in common. (Earlier draft used sofa and spoon, two household objects.)",
  },

  // ---------------------------------------------------------------------
  // d4: categories, word only, age 7 to 8 (one step harder than d3)
  // ---------------------------------------------------------------------
  {
    id: "wt-16", d: 4,
    items: [{ text: "oak" }, { text: "maple" }, { text: "stapler" }, { text: "cloud" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both trees", points: 2 },
      { text: "They both have leaves", points: 1 },
      { text: "They both have fur and four legs", points: 0 },
    ],
    explanation: "An oak and a maple are both trees.",
    distractorNote: "A stapler is an office tool and a cloud is weather; neither is a tree, and they share nothing with each other. (Earlier draft used stapler and kettle, two household objects.)",
  },
  {
    id: "wt-17", d: 4,
    items: [{ text: "ant" }, { text: "bee" }, { text: "bucket" }, { text: "mountain" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both insects", points: 2 },
      { text: "They both have six legs", points: 1 },
      { text: "They both live underwater", points: 0 },
    ],
    explanation: "An ant and a bee are both insects.",
    distractorNote: "A bucket is a tool and a mountain is a landform; neither is an insect and they do not pair (the old curtain + mountain rhymed).",
  },
  {
    id: "wt-18", d: 4,
    items: [{ text: "bicycle" }, { text: "scooter" }, { text: "pillow" }, { text: "banana" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both vehicles you ride", points: 2 },
      { text: "They both have wheels that turn", points: 1 },
      { text: "You can eat both of them", points: 0 },
    ],
    explanation: "A bicycle and a scooter are both vehicles you ride.",
    distractorNote: "A pillow is bedding and a banana is food; neither is ridden or has wheels, and they do not pair. (Earlier draft used pillow and kettle, two household objects.)",
  },
  {
    id: "wt-19", d: 4,
    items: [{ text: "novel" }, { text: "magazine" }, { text: "hammer" }, { text: "cloud" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you read", points: 2 },
      { text: "They are both made of paper", points: 1 },
      { text: "They are both things you wear", points: 0 },
    ],
    explanation: "A novel and a magazine are both things you read.",
    distractorNote: "A hammer and a cloud have nothing to do with reading, and they do not relate to each other.",
  },
  {
    id: "wt-20", d: 4,
    items: [{ text: "penguin" }, { text: "ostrich" }, { text: "ladder" }, { text: "peach" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both birds that cannot fly", points: 2 },
      { text: "They both have feathers and a beak and lay eggs", points: 1 },
      { text: "They are both kinds of fish", points: 0 },
    ],
    explanation: "A penguin and an ostrich are both birds that cannot fly.",
    distractorNote: "A ladder and a peach have nothing to do with birds, and they do not relate to each other.",
  },

  // ---------------------------------------------------------------------
  // d5: function (shared purpose, not shared type), age 9 to 10
  // ---------------------------------------------------------------------
  {
    id: "wt-21", d: 5,
    items: [{ text: "clock" }, { text: "calendar" }, { text: "mirror" }, { text: "blanket" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you know when something is", points: 2 },
      { text: "They both have numbers written on them", points: 1 },
      { text: "They both tell you how heavy something is", points: 0 },
    ],
    explanation: "A clock and a calendar both help you know when something is.",
    distractorNote: "A mirror hangs on a wall like a clock (a surface likeness) but shows you yourself, not the time; a blanket keeps you warm. A mirror and a blanket share nothing.",
  },
  {
    id: "wt-22", d: 5,
    items: [{ text: "key" }, { text: "password" }, { text: "ribbon" }, { text: "stamp" }],
    pair: [0, 1],
    reasons: [
      { text: "They both let you get into something safely", points: 2 },
      { text: "They are both things you keep secret or safe", points: 1 },
      { text: "They both tell you what time it is", points: 0 },
    ],
    explanation: "A key and a password both let you get into something safely.",
    distractorNote: "A ribbon decorates a present and a stamp sends a letter; neither lets you into anything, and they share nothing (doorbell was dropped: key + doorbell were both at the front door).",
  },
  {
    id: "wt-23", d: 5,
    items: [{ text: "map" }, { text: "compass" }, { text: "camera" }, { text: "candle" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you find your way when traveling", points: 2 },
      { text: "They are both things people use outdoors", points: 1 },
      { text: "They both keep you warm in the winter when it snows", points: 0 },
    ],
    explanation: "A map and a compass both help you find your way when traveling.",
    distractorNote: "A camera records the trip but does not guide it; a candle gives light, not direction. A camera and a candle share nothing (passport and whistle were dropped as travel kit and scout kit respectively).",
  },
  {
    id: "wt-24", d: 5,
    items: [{ text: "umbrella" }, { text: "sunscreen" }, { text: "hairbrush" }, { text: "thermometer" }],
    pair: [0, 1],
    reasons: [
      { text: "They both protect you from the sun or the weather", points: 2 },
      { text: "They are both things you might pack for a sunny day", points: 1 },
      { text: "They both help you see in the dark", points: 0 },
    ],
    explanation: "An umbrella and sunscreen both protect you from the sun or the weather.",
    distractorNote: "A hairbrush might go in a beach bag but protects you from nothing; a thermometer only reports how hot it is. They share nothing (towel was dropped: it completed a beach trio).",
  },
  {
    id: "wt-25", d: 5,
    items: [{ text: "bandage" }, { text: "medicine" }, { text: "umbrella" }, { text: "pencil" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you get better when you are hurt or sick", points: 2 },
      { text: "They are both things a doctor or a nurse might hand you at the clinic", points: 1 },
      { text: "They are both used to tell the time", points: 0 },
    ],
    explanation: "A bandage and medicine both help you get better when you are hurt or sick.",
    distractorNote: "An umbrella protects you from rain before anything goes wrong, it does not make you better; a pencil is a tool. They share nothing (toothbrush and scissors were dropped: mouth things and first aid kit contents).",
  },

  // ---------------------------------------------------------------------
  // d6: function, one step harder, age 9 to 10
  // ---------------------------------------------------------------------
  {
    id: "wt-26", d: 6,
    items: [{ text: "recipe" }, { text: "instructions" }, { text: "timetable" }, { text: "photograph" }],
    pair: [0, 1],
    reasons: [
      { text: "They both tell you the steps to follow to do something", points: 2 },
      { text: "They are both things that are written down for people to read", points: 1 },
      { text: "They are both things you can eat when you are hungry", points: 0 },
    ],
    explanation: "A recipe and instructions both tell you the steps to follow to do something.",
    distractorNote: "A timetable lists times, a photograph shows a moment; neither gives steps to follow and they do not pair with each other.",
  },
  {
    id: "wt-27", d: 6,
    items: [{ text: "piggy bank" }, { text: "wallet" }, { text: "trophy" }, { text: "candle" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both used to keep money safe", points: 2 },
      { text: "They are both small enough to hold in your hand", points: 1 },
      { text: "They are both used to make music", points: 0 },
    ],
    explanation: "A piggy bank and a wallet are both used to keep money safe.",
    distractorNote: "A trophy is something you win and a candle gives light; neither keeps money and they share nothing (coin and backpack were dropped: money content and carried container).",
  },
  {
    id: "wt-28", d: 6,
    items: [{ text: "seatbelt" }, { text: "helmet" }, { text: "mailbox" }, { text: "trumpet" }],
    pair: [0, 1],
    reasons: [
      { text: "They both keep you safe from getting hurt", points: 2 },
      { text: "They both buckle or strap on tightly", points: 1 },
      { text: "They are both things you eat for breakfast", points: 0 },
    ],
    explanation: "A seatbelt and a helmet both keep you safe from getting hurt.",
    distractorNote: "A mailbox holds letters and a trumpet makes music; neither protects you and they share nothing (bicycle went with helmet, pillow went with head).",
  },
  {
    id: "wt-29", d: 6,
    items: [{ text: "alarm clock" }, { text: "rooster" }, { text: "trophy" }, { text: "carrot" }],
    pair: [0, 1],
    reasons: [
      { text: "They can both wake you up in the morning", points: 2 },
      { text: "They both make a sound that is very loud", points: 1 },
      { text: "They are both used to keep you dry", points: 0 },
    ],
    explanation: "An alarm clock and a rooster can both wake you up in the morning.",
    distractorNote: "A carrot is food and a trophy is a prize; neither wakes anyone and they share nothing (whistle was as loud as both, pillow was a bed thing with the clock).",
  },
  {
    id: "wt-30", d: 6,
    items: [{ text: "dictionary" }, { text: "teacher" }, { text: "flashlight" }, { text: "pencil" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you learn new things", points: 2 },
      { text: "They both use words all the time", points: 1 },
      { text: "They are both used to cook dinner in the kitchen", points: 0 },
    ],
    explanation: "A dictionary and a teacher both help you learn new things.",
    distractorNote: "A flashlight lights things up and a pencil writes; neither teaches you, and they do not pair (bookshelf sat with the dictionary as a book thing).",
  },

  // ---------------------------------------------------------------------
  // d7: abstract nouns, age 11 to 12
  // ---------------------------------------------------------------------
  {
    id: "wt-31", d: 7,
    items: [{ text: "promise" }, { text: "rule" }, { text: "question" }, { text: "joke" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things people agree to keep or follow", points: 2 },
      { text: "They can both be broken by somebody later on", points: 1 },
      { text: "They are both things you can hold in your hand and put in your pocket", points: 0 },
    ],
    explanation: "A promise and a rule are both things people agree to keep or follow.",
    distractorNote: "A question is something you ask, not something you agree to keep; a joke is something you say. A question and a joke share nothing (wish went with promise as things you make).",
  },
  {
    id: "wt-32", d: 7,
    items: [{ text: "courage" }, { text: "patience" }, { text: "boredom" }, { text: "luck" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both qualities that help you get through something hard", points: 2 },
      { text: "They can both be learned slowly over time as you grow up and try new things", points: 1 },
      { text: "They both happen only when you are asleep", points: 0 },
    ],
    explanation: "Courage and patience are both qualities that help you get through something hard.",
    distractorNote: "Boredom is a feeling that helps with nothing hard; luck is not a quality at all. Boredom and luck share nothing (anger was patience's antonym).",
  },
  {
    id: "wt-33", d: 7,
    items: [{ text: "idea" }, { text: "plan" }, { text: "reward" }, { text: "noise" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you think up before you do something", points: 2 },
      { text: "They can both change from one day to the next", points: 1 },
      { text: "They are both things you can taste and smell when you are hungry", points: 0 },
    ],
    explanation: "An idea and a plan are both things you think up before you do something.",
    distractorNote: "A reward comes after you do something, not before; a noise just happens and is not thought up. A reward and a noise share nothing.",
  },
  {
    id: "wt-34", d: 7,
    items: [{ text: "freedom" }, { text: "choice" }, { text: "duty" }, { text: "luck" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about being able to decide for yourself", points: 2 },
      { text: "They can both be taken away from a person by somebody more powerful", points: 1 },
      { text: "They both only happen at the seaside", points: 0 },
    ],
    explanation: "Freedom and choice are both about being able to decide for yourself.",
    distractorNote: "A duty is what you must do whether you like it or not, the opposite of choosing; luck is what happens to you, not what you decide. A duty and luck share nothing.",
  },
  {
    id: "wt-35", d: 7,
    items: [{ text: "habit" }, { text: "routine" }, { text: "surprise" }, { text: "promise" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you do the same way again and again", points: 2 },
      { text: "They can both be very hard to change once they start", points: 1 },
      { text: "They are both things you buy at the shop and carry home in a bag", points: 0 },
    ],
    explanation: "A habit and a routine are both things you do the same way again and again.",
    distractorNote: "A surprise happens once and is not expected, the opposite of a repeated pattern; a promise is a one time agreement, not a repeated action. A surprise and a promise share nothing.",
  },

  // ---------------------------------------------------------------------
  // d8: abstract nouns, one step harder, age 11 to 12
  // ---------------------------------------------------------------------
  {
    id: "wt-36", d: 8,
    items: [{ text: "honesty" }, { text: "trust" }, { text: "curiosity" }, { text: "talent" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about truth between people, telling it and believing it", points: 2 },
      { text: "They are both things you want to find in a friend, and both take time to grow", points: 1 },
      { text: "They both only happen when it is raining", points: 0 },
    ],
    explanation: "Honesty and trust are both about truth between people: one is telling it, the other is believing it.",
    distractorNote: "Curiosity and talent are things a person can have but neither is about truth; all four are qualities, so that likeness singles out no pair.",
  },
  {
    id: "wt-37", d: 8,
    items: [{ text: "memory" }, { text: "dream" }, { text: "hunger" }, { text: "traffic" }],
    pair: [0, 1],
    reasons: [
      { text: "They both happen inside your head, where nobody else can see them", points: 2 },
      { text: "They can both fade away and be forgotten over time", points: 1 },
      { text: "They are both things you can pick up, carry around, and put down again", points: 0 },
    ],
    explanation: "A memory and a dream both happen inside your head, where nobody else can see them.",
    distractorNote: "Hunger is felt in the body and traffic happens in the street; both are real and outside the mind, and they do not pair with each other.",
  },
  {
    id: "wt-38", d: 8,
    items: [{ text: "opinion" }, { text: "belief" }, { text: "proof" }, { text: "promise" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things a person thinks are true, even without proof", points: 2 },
      { text: "They can both be different from one person to the next, even in the same family", points: 1 },
      { text: "They are both things that grow in a garden", points: 0 },
    ],
    explanation: "An opinion and a belief are both things a person thinks are true, even without proof.",
    distractorNote: "A proof settles a question for certain, the opposite of a view held without proof; a promise is something you say you will do. A proof and a promise share nothing (fact was the taught partner of opinion).",
  },
  {
    id: "wt-39", d: 8,
    items: [{ text: "silence" }, { text: "darkness" }, { text: "patience" }, { text: "distance" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both what happens when something is missing, no sound or no light", points: 2 },
      { text: "They can both make a place feel calm or a little scary", points: 1 },
      { text: "They both happen only in the middle of the day when the sun is at its highest", points: 0 },
    ],
    explanation: "Silence and darkness are both what happens when something is missing, no sound or no light.",
    distractorNote: "Patience is a quality, distance is a measure; neither is an absence, and they do not pair (laughter was silence's antonym on the sound dimension).",
  },
  {
    id: "wt-40", d: 8,
    items: [{ text: "kindness" }, { text: "generosity" }, { text: "jealousy" }, { text: "courage" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about caring for and giving to other people", points: 2 },
      { text: "They can both make another person feel happy and cared about", points: 1 },
      { text: "They are both things you can measure with a ruler", points: 0 },
    ],
    explanation: "Kindness and generosity are both about caring for and giving to other people.",
    distractorNote: "Jealousy is the opposite of caring for others; courage is about facing fear, not giving. Jealousy and courage share nothing.",
  },

  // ---------------------------------------------------------------------
  // d9: hard abstractions, age 13
  // ---------------------------------------------------------------------
  {
    id: "wt-41", d: 9,
    items: [{ text: "poem" }, { text: "song" }, { text: "letter" }, { text: "recipe" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both art forms that use words and rhythm to express feelings", points: 2 },
      { text: "They can both rhyme and both can be learned by heart", points: 1 },
      { text: "They are both things that only scientists use when they work in a laboratory", points: 0 },
    ],
    explanation: "A poem and a song are both art forms that use words and rhythm to express feelings.",
    distractorNote: "A letter is words on paper with no rhythm; a recipe is steps. A letter and a recipe are both written, but so are poems and songs, so that singles out nothing (speech was performed aloud like the key).",
  },
  {
    id: "wt-42", d: 9,
    items: [{ text: "theory" }, { text: "guess" }, { text: "proof" }, { text: "memory" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both ideas about what might be true, without being proven for certain", points: 2 },
      { text: "They can both turn out to be completely wrong when the real answer finally comes out", points: 1 },
      { text: "They are both things you keep in the refrigerator", points: 0 },
    ],
    explanation: "A theory and a guess are both ideas about what might be true, without being proven for certain.",
    distractorNote: "A proof shows something is certainly true, the opposite of unproven; a memory is something that already happened, not an idea about what might be. A proof and a memory share nothing.",
  },
  {
    id: "wt-43", d: 9,
    items: [{ text: "justice" }, { text: "fairness" }, { text: "anger" }, { text: "wealth" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about everyone being treated the right way, equally", points: 2 },
      { text: "They are both about how people treat each other", points: 1 },
      { text: "They are both things you can see with a telescope on a very clear night", points: 0 },
    ],
    explanation: "Justice and fairness are both about everyone being treated the right way, equally.",
    distractorNote: "Anger is a feeling, not a way of treating people; wealth is having a lot, which says nothing about treating everyone the same. Anger and wealth share nothing.",
  },
  {
    id: "wt-44", d: 9,
    items: [{ text: "identity" }, { text: "personality" }, { text: "opportunity" }, { text: "appetite" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about who a person really is, deep down", points: 2 },
      { text: "They can both change a little as a person grows up and learns", points: 1 },
      { text: "They are both things you can buy with money", points: 0 },
    ],
    explanation: "Identity and personality are both about who a person really is, deep down.",
    distractorNote: "An opportunity is a chance that comes along and an appetite is how hungry you are; neither is about who a person is, and they do not pair.",
  },
  {
    id: "wt-45", d: 9,
    items: [{ text: "irony" }, { text: "sarcasm" }, { text: "compliment" }, { text: "whisper" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both ways of saying something that really means the opposite", points: 2 },
      { text: "They can both be used to make somebody laugh at a joke", points: 1 },
      { text: "They are both things you do with your feet when you are playing a game", points: 0 },
    ],
    explanation: "Irony and sarcasm are both ways of saying something that really means the opposite.",
    distractorNote: "A compliment means exactly what it says; a whisper is a quiet way of speaking, and the words still mean what they say. A compliment and a whisper share nothing.",
  },

  // ---------------------------------------------------------------------
  // d10: hard abstractions, hardest, age 13
  // ---------------------------------------------------------------------
  {
    id: "wt-46", d: 10,
    items: [{ text: "paradox" }, { text: "contradiction" }, { text: "coincidence" }, { text: "ceremony" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both ideas that seem to disagree with themselves or cannot both be true at once", points: 2 },
      { text: "They can both be very confusing to think about for a very long time, even for clever grown ups", points: 1 },
      { text: "They are both things you find at the bottom of the sea", points: 0 },
    ],
    explanation: "A paradox and a contradiction are both ideas that seem to disagree with themselves or cannot both be true at once.",
    distractorNote: "A coincidence is surprising but it does not disagree with itself; a ceremony is an event, not a statement that can be true or false. A coincidence and a ceremony share nothing.",
  },
  {
    id: "wt-47", d: 10,
    items: [{ text: "nostalgia" }, { text: "longing" }, { text: "pride" }, { text: "relief" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both feelings of missing something from the past or something far away", points: 2 },
      { text: "They can both feel bittersweet, happy and sad at the same time", points: 1 },
      { text: "They are both feelings you only ever get when you win a race or a big game against friends", points: 0 },
    ],
    explanation: "Nostalgia and longing are both feelings of missing something from the past or something far away.",
    distractorNote: "Pride looks at something you have done well; relief is a worry ending. Neither is about missing something. All four are feelings, so that singles out no pair.",
  },
  {
    id: "wt-48", d: 10,
    items: [{ text: "legacy" }, { text: "reputation" }, { text: "ambition" }, { text: "patience" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about how a person is remembered or thought of by others", points: 2 },
      { text: "They can both take a very long time to build up, and both can be lost again over the years", points: 1 },
      { text: "They are both things you can wrap up in paper", points: 0 },
    ],
    explanation: "A legacy and a reputation are both about how a person is remembered or thought of by others.",
    distractorNote: "Ambition is about your own future, patience is about waiting; neither is about how others remember you, and they do not pair.",
  },
  {
    id: "wt-49", d: 10,
    items: [{ text: "hypothesis" }, { text: "assumption" }, { text: "certainty" }, { text: "coincidence" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things a person accepts as probably true before it is checked or tested", points: 2 },
      { text: "They can both turn out to be wrong once someone finally checks them properly", points: 1 },
      { text: "They are both things that only happen at night, after everybody in the house has gone to sleep", points: 0 },
    ],
    explanation: "A hypothesis and an assumption are both things a person accepts as probably true before it is checked or tested.",
    distractorNote: "Certainty is the opposite of something accepted before checking; a coincidence is chance, not a belief. Certainty and a coincidence share nothing.",
  },
  {
    id: "wt-50", d: 10,
    items: [{ text: "empathy" }, { text: "compassion" }, { text: "ambition" }, { text: "honesty" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about understanding and caring how someone else feels", points: 2 },
      { text: "They can both make a person want to help someone else who is having a hard time", points: 1 },
      { text: "They are both things you can measure with a thermometer", points: 0 },
    ],
    explanation: "Empathy and compassion are both about understanding and caring how someone else feels.",
    distractorNote: "Ambition is wanting to succeed for yourself; honesty is telling the truth. Neither is about how someone else feels. All four are qualities a person can have, so that likeness singles out no pair; ambition and honesty share nothing tighter.",
  },

  // ---------------------------------------------------------------------
  // d11: a hidden shared PROCESS, ages 13+
  // ---------------------------------------------------------------------
  {
    id: "wt-51", d: 11,
    items: [{ text: "erosion" }, { text: "extinction" }, { text: "migration" }, { text: "invention" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both slow losses that happen because a force keeps acting over a very long time", points: 2 },
      { text: "They both take a very long time and both are studied by scientists", points: 1 },
      { text: "They are both kinds of weather that you can see out of the kitchen window on a cold winter morning", points: 0 },
    ],
    explanation: "Erosion and extinction are both slow losses caused by a force that keeps acting over a very long time.",
    distractorNote: "Migration is movement, not loss, and it repeats every year; an invention is a gain. Migration and an invention share nothing (explosion rhymed with erosion and both destroyed).",
  },
  {
    id: "wt-52", d: 11,
    items: [{ text: "rehearsal" }, { text: "draft" }, { text: "reflex" }, { text: "climate" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both practice versions made before the real one, so mistakes can be found and fixed first", points: 2 },
      { text: "They both come before something else and both can be done more than once", points: 1 },
      { text: "They are both kinds of fruit you can eat", points: 0 },
    ],
    explanation: "A rehearsal and a draft are both practice versions made before the real thing, so mistakes can be fixed first.",
    distractorNote: "A reflex happens without practice or planning; a climate is a pattern of weather. Neither is a practice version and they share nothing (applause and signature both marked a finished thing).",
  },
  {
    id: "wt-53", d: 11,
    items: [{ text: "quarantine" }, { text: "curfew" }, { text: "holiday" }, { text: "rumor" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both rules that limit where people may go, used to keep everybody safe", points: 2 },
      { text: "They both stop people doing what they want for a while, even when nobody likes it", points: 1 },
      { text: "They are both kinds of food that people eat at a party with their friends and family", points: 0 },
    ],
    explanation: "A quarantine and a curfew are both rules that limit where people may go, used to keep everybody safe.",
    distractorNote: "A holiday is a day when the usual rules are relaxed, the opposite of a rule keeping people in; a rumor is talk. A holiday and a rumor share nothing.",
  },
  {
    id: "wt-54", d: 11,
    items: [{ text: "immunity" }, { text: "insulation" }, { text: "instinct" }, { text: "gravity" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both protections that stop something harmful from getting through", points: 2 },
      { text: "They both keep something out and neither one is easy to see", points: 1 },
      { text: "They are both parts of the body", points: 0 },
    ],
    explanation: "Immunity and insulation are both protections that stop something harmful from getting through.",
    distractorNote: "An instinct is inborn behavior and gravity is a pull; neither keeps anything harmful out, and they share nothing. Three i words now, so the pair cannot be found by first letter.",
  },
  {
    id: "wt-55", d: 11,
    items: [{ text: "rumor" }, { text: "panic" }, { text: "apology" }, { text: "schedule" }],
    pair: [0, 1],
    reasons: [
      { text: "They both start tiny and grow bigger and faster as they spread from person to person", points: 2 },
      { text: "They can both cause a lot of trouble for a great many people at once", points: 1 },
      { text: "They are both kinds of weather", points: 0 },
    ],
    explanation: "A rumor and a panic both start tiny and grow bigger and faster as they spread from person to person.",
    distractorNote: "An apology is something people say, like a rumor, but it does not grow as it spreads; a schedule is a fixed plan that stays the same size. An apology and a schedule share nothing.",
  },

  // ---------------------------------------------------------------------
  // d12: a hidden shared process, now about evidence and reasoning
  // ---------------------------------------------------------------------
  {
    id: "wt-56", d: 12,
    items: [{ text: "estimate" }, { text: "hypothesis" }, { text: "proof" }, { text: "apology" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both careful guesses made on purpose before anybody can know the real answer", points: 2 },
      { text: "They are both a kind of guess that a person can write down and share with others", points: 1 },
      { text: "They are both always correct", points: 0 },
    ],
    explanation: "An estimate and a hypothesis are both careful guesses made on purpose before anybody can know the real answer.",
    distractorNote: "A proof is what settles the answer, the opposite of a guess made beforehand; an apology is something you say when sorry. A proof and an apology share nothing (measurement was estimate's taught partner).",
  },
  {
    id: "wt-57", d: 12,
    items: [{ text: "symptom" }, { text: "clue" }, { text: "label" }, { text: "ceremony" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both small visible signs that point to a bigger cause you cannot see directly", points: 2 },
      { text: "They both help you work something out when you look at them closely", points: 1 },
      { text: "They are both things that make a very loud noise", points: 0 },
    ],
    explanation: "A symptom and a clue are both small visible signs pointing to a bigger cause you cannot see directly.",
    distractorNote: "A label is a visible sign but it points at nothing hidden, it just names the thing; a ceremony is an event. A label and a ceremony share nothing (cure sat with symptom under illness).",
  },
  {
    id: "wt-58", d: 12,
    items: [{ text: "bias" }, { text: "distortion" }, { text: "accuracy" }, { text: "tradition" }],
    pair: [0, 1],
    reasons: [
      { text: "They both bend the truth, so what you end up seeing is not quite what is really there", points: 2 },
      { text: "They both change how something looks to the person who is looking at it", points: 1 },
      { text: "They are both shapes you can draw with a ruler", points: 0 },
    ],
    explanation: "Bias and distortion both bend the truth, so what you end up seeing is not quite what is really there.",
    distractorNote: "Accuracy is getting things exactly right, the opposite of bending the truth; a tradition is a custom handed down, not a way of seeing. Accuracy and a tradition share nothing.",
  },
  {
    id: "wt-59", d: 12,
    items: [{ text: "average" }, { text: "summary" }, { text: "detail" }, { text: "sample" }],
    pair: [0, 1],
    reasons: [
      { text: "They both squeeze a great deal of information down into one short stand in for all of it", points: 2 },
      { text: "They both leave out most of what was there, so you can take it in quickly", points: 1 },
      { text: "They are both tools you hold in your hand", points: 0 },
    ],
    explanation: "An average and a summary both squeeze a great deal of information down into one short stand in for all of it.",
    distractorNote: "A detail is one small piece of the information, the opposite of squeezing it all together; a sample is a piece that stands for the whole but is not a compression of it. A detail and a sample share nothing tighter than the key.",
  },
  {
    id: "wt-60", d: 12,
    items: [{ text: "survey" }, { text: "experiment" }, { text: "memory" }, { text: "accident" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both planned ways of collecting evidence in order to answer a question", points: 2 },
      { text: "They both take some planning and both take time to finish", points: 1 },
      { text: "They are both places you can visit outdoors", points: 0 },
    ],
    explanation: "A survey and an experiment are both planned ways of collecting evidence in order to answer a question.",
    distractorNote: "A memory is what one person recalls, not a planned way to gather evidence; an accident is unplanned by definition. A memory and an accident share nothing (a survey collects opinions, so opinion was dropped).",
  },

  // ---------------------------------------------------------------------
  // d13: social systems, joined by the role they play between people
  // ---------------------------------------------------------------------
  {
    id: "wt-61", d: 13,
    items: [{ text: "democracy" }, { text: "jury" }, { text: "captain" }, { text: "tradition" }],
    pair: [0, 1],
    reasons: [
      { text: "They both settle something by letting a group decide together instead of one person choosing", points: 2 },
      { text: "They both involve a lot of people and both can take a very long time to finish", points: 1 },
      { text: "They are both things that are always frozen solid", points: 0 },
    ],
    explanation: "A democracy and a jury both settle something by letting a group decide together instead of one person choosing.",
    distractorNote: "A captain decides alone for a team, the opposite of a group choosing together; a tradition is a custom nobody decides. A captain and a tradition share nothing (referee and jury both judged who was right).",
  },
  {
    id: "wt-62", d: 13,
    items: [{ text: "tax" }, { text: "subscription" }, { text: "gift" }, { text: "forecast" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both payments made again and again in return for something you keep on receiving", points: 2 },
      { text: "They both cost money and both are usually paid by grown ups, not by children", points: 1 },
      { text: "They are both foods you eat at breakfast", points: 0 },
    ],
    explanation: "A tax and a subscription are both payments made again and again in return for something you keep on receiving.",
    distractorNote: "A gift is given freely once, not paid again and again; a forecast is a prediction, not a payment. A gift and a forecast share nothing (fine and tax were both compulsory payments).",
  },
  {
    id: "wt-63", d: 13,
    items: [{ text: "insurance" }, { text: "savings" }, { text: "apology" }, { text: "poem" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you set aside now so a bad day later hurts less", points: 2 },
      { text: "They both involve money and both are things grown ups think about", points: 1 },
      { text: "They are both kinds of food that you might eat for lunch on a busy day", points: 0 },
    ],
    explanation: "Insurance and savings are both things you set aside now so that a bad day later hurts less.",
    distractorNote: "An apology is something you say now, it sets nothing aside; a poem is writing. An apology and a poem share nothing, and neither pairs with insurance or savings.",
  },
  {
    id: "wt-64", d: 13,
    items: [{ text: "census" }, { text: "inventory" }, { text: "forecast" }, { text: "ceremony" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both complete counts of everything in a group, taken at one single moment", points: 2 },
      { text: "They both involve counting and both are usually written down", points: 1 },
      { text: "They are both warm to the touch", points: 0 },
    ],
    explanation: "A census and an inventory are both complete counts of everything in a group, taken at one single moment.",
    distractorNote: "A forecast looks ahead rather than counting what is here; a ceremony is an event. A forecast and a ceremony share nothing (receipt was an itemized list like an inventory).",
  },
  {
    id: "wt-65", d: 13,
    items: [{ text: "treaty" }, { text: "contract" }, { text: "invitation" }, { text: "tradition" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both promises two sides are bound to keep, with agreed consequences if either breaks it", points: 2 },
      { text: "They are both usually written down on paper and signed by the people involved", points: 1 },
      { text: "They are both kinds of bird", points: 0 },
    ],
    explanation: "A treaty and a contract are both promises two sides are bound to keep, with agreed consequences if either breaks it.",
    distractorNote: "An invitation asks, it binds nobody; a tradition is followed by habit with no agreed consequences. An invitation and a tradition share nothing (apology was what ends a quarrel, like a treaty).",
  },

  // ---------------------------------------------------------------------
  // d14: change over time, joined by HOW they unfold
  // ---------------------------------------------------------------------
  {
    id: "wt-66", d: 14,
    items: [{ text: "evolution" }, { text: "tradition" }, { text: "accident" }, { text: "appetite" }],
    pair: [0, 1],
    reasons: [
      { text: "They both change very slowly by passing small differences from one generation on to the next", points: 2 },
      { text: "They both take many, many years and both are things people study carefully", points: 1 },
      { text: "They are both made of metal", points: 0 },
    ],
    explanation: "Evolution and tradition both change very slowly by passing small differences from one generation on to the next.",
    distractorNote: "An accident is sudden and unplanned, the opposite of slow generation by generation change; an appetite comes and goes within a day. An accident and an appetite share nothing (revolution rhymed with evolution).",
  },
  {
    id: "wt-67", d: 14,
    items: [{ text: "momentum" }, { text: "habit" }, { text: "patience" }, { text: "surprise" }],
    pair: [0, 1],
    reasons: [
      { text: "Once either one has started it carries on by itself, and stopping it takes more effort than starting it did", points: 2 },
      { text: "They both keep going and going once they have begun, and both are talked about by grown ups", points: 1 },
      { text: "They are both things you can build a wall out of", points: 0 },
    ],
    explanation: "Momentum and a habit both carry on by themselves once started, and stopping either takes more effort than starting it did.",
    distractorNote: "Patience is choosing to wait, an effort each time rather than something that carries on by itself; a surprise happens once and does not keep going. Patience and a surprise share nothing.",
  },
  {
    id: "wt-68", d: 14,
    items: [{ text: "echo" }, { text: "consequence" }, { text: "prediction" }, { text: "appetite" }],
    pair: [0, 1],
    reasons: [
      { text: "They both come back to you later, and only because of something you did first", points: 2 },
      { text: "They both happen after something else has already happened", points: 1 },
      { text: "They are both sweet to taste", points: 0 },
    ],
    explanation: "An echo and a consequence both come back to you later, and only because of something you did first.",
    distractorNote: "A prediction comes before something happens, not back to you afterwards; an appetite comes on its own, not because of something you did. A prediction and an appetite share nothing.",
  },
  {
    id: "wt-69", d: 14,
    items: [{ text: "drought" }, { text: "famine" }, { text: "traffic" }, { text: "gossip" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both long shortages where something people need runs out across a whole region at once", points: 2 },
      { text: "They are both bad things that last a long time and make life hard for many people", points: 1 },
      { text: "They are both things that only happen in the winter", points: 0 },
    ],
    explanation: "A drought and a famine are both long shortages where something people need runs out across a whole region at once.",
    distractorNote: "Traffic is too much of something, the opposite of a shortage; gossip spreads but nothing runs out. Traffic and gossip share nothing.",
  },
  {
    id: "wt-70", d: 14,
    items: [{ text: "threshold" }, { text: "deadline" }, { text: "journey" }, { text: "memory" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both invisible lines where everything changes the moment you cross over them", points: 2 },
      { text: "They are both limits, and both are things people worry about getting close to", points: 1 },
      { text: "They are both things you can build a house out of", points: 0 },
    ],
    explanation: "A threshold and a deadline are both invisible lines where everything changes the moment you cross over them.",
    distractorNote: "A journey is a long stretch, not a single line where everything changes; a memory is of the past. A journey and a memory share nothing (calendar was where a deadline is written).",
  },

  // ---------------------------------------------------------------------
  // d15: ideas about ideas: representation, belief and meaning
  // ---------------------------------------------------------------------
  {
    id: "wt-71", d: 15,
    items: [{ text: "metaphor" }, { text: "diagram" }, { text: "argument" }, { text: "appetite" }],
    pair: [0, 1],
    reasons: [
      { text: "They both explain something hard by standing in for it as something simpler you already understand", points: 2 },
      { text: "They both help explain things, and both are used by teachers and by people who write books", points: 1 },
      { text: "They are both toys you can buy in a shop", points: 0 },
    ],
    explanation: "A metaphor and a diagram both explain something hard by standing in for it as something simpler you already understand.",
    distractorNote: "An argument tries to prove something rather than stand in for it; an appetite is a bodily wish. An argument and an appetite share nothing (invention paired with model as things people build; model itself read as a toy, so the pair word is now diagram).",
  },
  {
    id: "wt-72", d: 15,
    items: [{ text: "illusion" }, { text: "disguise" }, { text: "tradition" }, { text: "evidence" }],
    pair: [0, 1],
    reasons: [
      { text: "In both of them, what you see is not what is really there, and that is the whole point", points: 2 },
      { text: "They both fool your eyes and both can be fun at a party or a show", points: 1 },
      { text: "They are both animals that live on a farm", points: 0 },
    ],
    explanation: "In both an illusion and a disguise, what you see is not what is really there, and that is the whole point.",
    distractorNote: "A tradition is a custom, evidence is what shows the truth; neither is a trick of appearance, and they do not pair. Irony was moved out of this item because the step 9 irony item defines it differently.",
  },
  {
    id: "wt-73", d: 15,
    items: [{ text: "prejudice" }, { text: "superstition" }, { text: "evidence" }, { text: "conviction" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both beliefs people hold firmly even though there is no evidence at all behind them", points: 2 },
      { text: "They are both beliefs, and both are things a person can hold for a very long time", points: 1 },
      { text: "They are both plants that grow in a garden", points: 0 },
    ],
    explanation: "Prejudice and superstition are both beliefs people hold firmly even though there is no evidence at all behind them.",
    distractorNote: "Evidence is exactly what these beliefs lack, so it is their opposite; a conviction is a firm belief that CAN rest on evidence, the near miss. Evidence and conviction share nothing tighter than the key.",
  },
  {
    id: "wt-74", d: 15,
    items: [{ text: "symbol" }, { text: "password" }, { text: "lullaby" }, { text: "accident" }],
    pair: [0, 1],
    reasons: [
      { text: "They both stand for something else, and they only work while everybody agrees on what they mean", points: 2 },
      { text: "They both mean something, and both can be written down, typed, or drawn on paper", points: 1 },
      { text: "They are both soft things you can sleep on", points: 0 },
    ],
    explanation: "A symbol and a password both stand for something else, and both only work while everybody agrees on what they mean.",
    distractorNote: "A lullaby soothes and stands for nothing else; an accident is an event. A lullaby and an accident share nothing (harvest was a concrete folk word beside lullaby).",
  },
  {
    id: "wt-75", d: 15,
    items: [{ text: "satire" }, { text: "exaggeration" }, { text: "instinct" }, { text: "measurement" }],
    pair: [0, 1],
    reasons: [
      { text: "They both stretch something past the truth deliberately, so that a point lands harder than plain facts would", points: 2 },
      { text: "They both make things sound bigger than they really are, and both can be funny", points: 1 },
      { text: "They are both bright lights you can switch on", points: 0 },
    ],
    explanation: "Satire and exaggeration both stretch something past the truth deliberately, so a point lands harder than plain facts would.",
    distractorNote: "An instinct is automatic, nothing is stretched for effect; a measurement is exact by design. An instinct and a measurement share nothing.",
  },
];
