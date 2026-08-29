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
      { text: "They are both round", points: 0 },
    ],
    explanation: "An apple and a banana are both fruit.",
    distractorNote: "A car is a vehicle and a dog is an animal; neither shares a category with the fruit or with each other.",
  },
  {
    id: "wt-02", d: 1,
    items: [
      { text: "sock", emoji: "🧦" },
      { text: "shoe", emoji: "👟" },
      { text: "spoon", emoji: "🥄" },
      { text: "tree", emoji: "🌳" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both worn on your feet", points: 2 },
      { text: "They are both things you wear", points: 1 },
      { text: "They are both blue", points: 0 },
    ],
    explanation: "A sock and a shoe are both worn on your feet.",
    distractorNote: "A spoon is a kitchen tool and a tree is a plant; neither is worn, and they do not relate to each other.",
  },
  {
    id: "wt-03", d: 1,
    items: [
      { text: "cup", emoji: "☕" },
      { text: "plate", emoji: "🍽️" },
      { text: "moon", emoji: "🌙" },
      { text: "guitar", emoji: "🎸" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both dishes you use for eating", points: 2 },
      { text: "They are both used in the kitchen", points: 1 },
      { text: "They are both white", points: 0 },
    ],
    explanation: "A cup and a plate are both dishes you use for eating.",
    distractorNote: "A moon and a guitar share no category with each other or with the dishes.",
  },
  {
    id: "wt-04", d: 1,
    items: [
      { text: "hat", emoji: "🎩" },
      { text: "glove", emoji: "🧤" },
      { text: "ball", emoji: "⚽" },
      { text: "book", emoji: "📖" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you wear to stay warm", points: 2 },
      { text: "They are both things you wear", points: 1 },
      { text: "They are both yellow", points: 0 },
    ],
    explanation: "A hat and a glove are both things you wear to stay warm.",
    distractorNote: "A ball and a book are things a child owns, but neither is worn, and they do not relate to each other.",
  },
  {
    id: "wt-05", d: 1,
    items: [
      { text: "fish", emoji: "🐟" },
      { text: "bird", emoji: "🐦" },
      { text: "kite", emoji: "🪁" },
      { text: "cup", emoji: "☕" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both animals", points: 2 },
      { text: "They can both move on their own", points: 1 },
      { text: "They are both orange", points: 0 },
    ],
    explanation: "A fish and a bird are both animals.",
    distractorNote: "A kite and a cup are objects, not animals, and they do not relate to each other.",
  },

  // ---------------------------------------------------------------------
  // d2: concrete objects, pictures, age 6
  // ---------------------------------------------------------------------
  {
    id: "wt-06", d: 2,
    items: [
      { text: "bucket", emoji: "🪣" },
      { text: "bowl", emoji: "🥣" },
      { text: "kite", emoji: "🪁" },
      { text: "lamp", emoji: "💡" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They are both used to hold things", points: 2 },
      { text: "They are both round containers", points: 1 },
      { text: "They are both blue", points: 0 },
    ],
    explanation: "A bucket and a bowl are both used to hold things.",
    distractorNote: "A kite and a lamp do not hold things, and they do not relate to each other.",
  },
  {
    id: "wt-07", d: 2,
    items: [
      { text: "umbrella", emoji: "☂️" },
      { text: "raincoat", emoji: "🧥" },
      { text: "drum", emoji: "🥁" },
      { text: "orange", emoji: "🍊" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They both keep you dry in the rain", points: 2 },
      { text: "They are both things you wear or carry outside", points: 1 },
      { text: "They are both yellow", points: 0 },
    ],
    explanation: "An umbrella and a raincoat both keep you dry in the rain.",
    distractorNote: "A drum and an orange do not relate to rain, and they do not relate to each other.",
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
      { text: "They are both tall", points: 0 },
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
      { text: "drum", emoji: "🥁" },
    ],
    pair: [0, 1],
    reasons: [
      { text: "They can both float or fly in the air", points: 2 },
      { text: "They are both toys", points: 1 },
      { text: "They are both heavy", points: 0 },
    ],
    explanation: "A kite and a balloon can both float or fly in the air.",
    distractorNote: "A shoe and a drum do not float or fly, and they do not relate to each other.",
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
      { text: "You can play both of them", points: 1 },
      { text: "They are both purple", points: 0 },
    ],
    explanation: "A guitar and a drum are both musical instruments.",
    distractorNote: "A peach and a chair have nothing to do with music, and they do not relate to each other.",
  },

  // ---------------------------------------------------------------------
  // d3: categories, word only, age 7 to 8
  // ---------------------------------------------------------------------
  {
    id: "wt-11", d: 3,
    items: [{ text: "whale" }, { text: "dolphin" }, { text: "ladder" }, { text: "kettle" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both animals that live in the ocean", points: 2 },
      { text: "They are both animals", points: 1 },
      { text: "They are both silver", points: 0 },
    ],
    explanation: "A whale and a dolphin are both animals that live in the ocean.",
    distractorNote: "A ladder and a kettle are household tools, unrelated to ocean animals or to each other.",
  },
  {
    id: "wt-12", d: 3,
    items: [{ text: "tulip" }, { text: "sunflower" }, { text: "wrench" }, { text: "pillow" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both flowers", points: 2 },
      { text: "They both grow in a garden", points: 1 },
      { text: "They are both purple", points: 0 },
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
      { text: "They are both foods", points: 0 },
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
      { text: "They are both used to cook food", points: 0 },
    ],
    explanation: "A trumpet and a flute are both musical instruments.",
    distractorNote: "A potato and a ladder have nothing to do with music, and they do not relate to each other.",
  },
  {
    id: "wt-15", d: 3,
    items: [{ text: "sparrow" }, { text: "owl" }, { text: "sofa" }, { text: "spoon" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both birds", points: 2 },
      { text: "They can both fly", points: 1 },
      { text: "They both live under the sea", points: 0 },
    ],
    explanation: "A sparrow and an owl are both birds.",
    distractorNote: "A sofa and a spoon are household objects, unrelated to birds or to each other.",
  },

  // ---------------------------------------------------------------------
  // d4: categories, word only, age 7 to 8 (one step harder than d3)
  // ---------------------------------------------------------------------
  {
    id: "wt-16", d: 4,
    items: [{ text: "oak" }, { text: "maple" }, { text: "stapler" }, { text: "kettle" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both trees", points: 2 },
      { text: "They both have leaves", points: 1 },
      { text: "They are both purple", points: 0 },
    ],
    explanation: "An oak and a maple are both trees.",
    distractorNote: "A stapler and a kettle are household objects, unrelated to trees or to each other.",
  },
  {
    id: "wt-17", d: 4,
    items: [{ text: "ant" }, { text: "bee" }, { text: "curtain" }, { text: "ladder" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both insects", points: 2 },
      { text: "They both have six legs", points: 1 },
      { text: "They both live underwater", points: 0 },
    ],
    explanation: "An ant and a bee are both insects.",
    distractorNote: "A curtain and a ladder are household items, unrelated to insects or to each other.",
  },
  {
    id: "wt-18", d: 4,
    items: [{ text: "bicycle" }, { text: "scooter" }, { text: "pillow" }, { text: "kettle" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both vehicles you ride", points: 2 },
      { text: "They both have wheels", points: 1 },
      { text: "They are both foods", points: 0 },
    ],
    explanation: "A bicycle and a scooter are both vehicles you ride.",
    distractorNote: "A pillow and a kettle are household items, unrelated to vehicles or to each other.",
  },
  {
    id: "wt-19", d: 4,
    items: [{ text: "novel" }, { text: "magazine" }, { text: "hammer" }, { text: "cloud" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you read", points: 2 },
      { text: "They are both made of paper", points: 1 },
      { text: "They are both round", points: 0 },
    ],
    explanation: "A novel and a magazine are both things you read.",
    distractorNote: "A hammer and a cloud have nothing to do with reading, and they do not relate to each other.",
  },
  {
    id: "wt-20", d: 4,
    items: [{ text: "saxophone" }, { text: "clarinet" }, { text: "ladder" }, { text: "peach" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both musical instruments", points: 2 },
      { text: "You blow air into both of them", points: 1 },
      { text: "They are both used for cooking", points: 0 },
    ],
    explanation: "A saxophone and a clarinet are both musical instruments.",
    distractorNote: "A ladder and a peach have nothing to do with music, and they do not relate to each other.",
  },

  // ---------------------------------------------------------------------
  // d5: function (shared purpose, not shared type), age 9 to 10
  // ---------------------------------------------------------------------
  {
    id: "wt-21", d: 5,
    items: [{ text: "clock" }, { text: "calendar" }, { text: "spoon" }, { text: "hat" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you know when something is", points: 2 },
      { text: "They are both used every day", points: 1 },
      { text: "They are both round", points: 0 },
    ],
    explanation: "A clock and a calendar both help you know when something is.",
    distractorNote: "A spoon and a hat serve very different purposes and do not relate to time or to each other.",
  },
  {
    id: "wt-22", d: 5,
    items: [{ text: "key" }, { text: "password" }, { text: "chair" }, { text: "cloud" }],
    pair: [0, 1],
    reasons: [
      { text: "They both let you get into something safely", points: 2 },
      { text: "They are both kept secret or safe", points: 1 },
      { text: "They are both metal", points: 0 },
    ],
    explanation: "A key and a password both let you get into something safely.",
    distractorNote: "A chair and a cloud do not unlock anything, and they do not relate to each other.",
  },
  {
    id: "wt-23", d: 5,
    items: [{ text: "map" }, { text: "compass" }, { text: "banana" }, { text: "drum" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you find your way when traveling", points: 2 },
      { text: "They are both used outdoors", points: 1 },
      { text: "They are both green", points: 0 },
    ],
    explanation: "A map and a compass both help you find your way when traveling.",
    distractorNote: "A banana and a drum do not help you find your way, and they do not relate to each other.",
  },
  {
    id: "wt-24", d: 5,
    items: [{ text: "umbrella" }, { text: "sunscreen" }, { text: "kettle" }, { text: "ladder" }],
    pair: [0, 1],
    reasons: [
      { text: "They both protect you from the sun or the weather", points: 2 },
      { text: "They are both things you might bring on a sunny day", points: 1 },
      { text: "They are both white", points: 0 },
    ],
    explanation: "An umbrella and sunscreen both protect you from the sun or the weather.",
    distractorNote: "A kettle and a ladder are unrelated to sun protection, and they do not relate to each other.",
  },
  {
    id: "wt-25", d: 5,
    items: [{ text: "bandage" }, { text: "medicine" }, { text: "ladder" }, { text: "guitar" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you get better when you are hurt or sick", points: 2 },
      { text: "They are both kept in a first aid kit", points: 1 },
      { text: "They are both green", points: 0 },
    ],
    explanation: "A bandage and medicine both help you get better when you are hurt or sick.",
    distractorNote: "A ladder and a guitar are unrelated to getting better, and they do not relate to each other.",
  },

  // ---------------------------------------------------------------------
  // d6: function, one step harder, age 9 to 10
  // ---------------------------------------------------------------------
  {
    id: "wt-26", d: 6,
    items: [{ text: "recipe" }, { text: "instructions" }, { text: "chair" }, { text: "moon" }],
    pair: [0, 1],
    reasons: [
      { text: "They both tell you the steps to follow to do something", points: 2 },
      { text: "They are both written down", points: 1 },
      { text: "They are both funny", points: 0 },
    ],
    explanation: "A recipe and instructions both tell you the steps to follow to do something.",
    distractorNote: "A chair and the moon do not give instructions, and they do not relate to each other.",
  },
  {
    id: "wt-27", d: 6,
    items: [{ text: "piggy bank" }, { text: "wallet" }, { text: "kite" }, { text: "drum" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both used to keep money safe", points: 2 },
      { text: "They are both small", points: 1 },
      { text: "They are both loud", points: 0 },
    ],
    explanation: "A piggy bank and a wallet are both used to keep money safe.",
    distractorNote: "A kite and a drum have nothing to do with keeping money, and they do not relate to each other.",
  },
  {
    id: "wt-28", d: 6,
    items: [{ text: "seatbelt" }, { text: "helmet" }, { text: "banana" }, { text: "cloud" }],
    pair: [0, 1],
    reasons: [
      { text: "They both keep you safe from getting hurt", points: 2 },
      { text: "They both buckle or strap on", points: 1 },
      { text: "They are both yellow", points: 0 },
    ],
    explanation: "A seatbelt and a helmet both keep you safe from getting hurt.",
    distractorNote: "A banana and a cloud do not keep anyone safe, and they do not relate to each other.",
  },
  {
    id: "wt-29", d: 6,
    items: [{ text: "alarm clock" }, { text: "rooster" }, { text: "ladder" }, { text: "spoon" }],
    pair: [0, 1],
    reasons: [
      { text: "They can both wake you up in the morning", points: 2 },
      { text: "They both make a loud sound", points: 1 },
      { text: "They are both red", points: 0 },
    ],
    explanation: "An alarm clock and a rooster can both wake you up in the morning.",
    distractorNote: "A ladder and a spoon do not wake anyone up, and they do not relate to each other.",
  },
  {
    id: "wt-30", d: 6,
    items: [{ text: "dictionary" }, { text: "teacher" }, { text: "kettle" }, { text: "balloon" }],
    pair: [0, 1],
    reasons: [
      { text: "They both help you learn new things", points: 2 },
      { text: "They both use words", points: 1 },
      { text: "They are both tall", points: 0 },
    ],
    explanation: "A dictionary and a teacher both help you learn new things.",
    distractorNote: "A kettle and a balloon do not help you learn, and they do not relate to each other.",
  },

  // ---------------------------------------------------------------------
  // d7: abstract nouns, age 11 to 12
  // ---------------------------------------------------------------------
  {
    id: "wt-31", d: 7,
    items: [{ text: "promise" }, { text: "rule" }, { text: "river" }, { text: "shoe" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things people agree to keep or follow", points: 2 },
      { text: "They can both be broken", points: 1 },
      { text: "They are both loud", points: 0 },
    ],
    explanation: "A promise and a rule are both things people agree to keep or follow.",
    distractorNote: "A river and a shoe are physical things, unrelated to promises or rules or to each other.",
  },
  {
    id: "wt-32", d: 7,
    items: [{ text: "courage" }, { text: "patience" }, { text: "ladder" }, { text: "peach" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both qualities that help you get through something hard", points: 2 },
      { text: "They can both be learned over time", points: 1 },
      { text: "They are both blue", points: 0 },
    ],
    explanation: "Courage and patience are both qualities that help you get through something hard.",
    distractorNote: "A ladder and a peach are physical objects, unrelated to inner qualities or to each other.",
  },
  {
    id: "wt-33", d: 7,
    items: [{ text: "idea" }, { text: "plan" }, { text: "chair" }, { text: "drum" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you think up before you do something", points: 2 },
      { text: "They can both change", points: 1 },
      { text: "They are both heavy", points: 0 },
    ],
    explanation: "An idea and a plan are both things you think up before you do something.",
    distractorNote: "A chair and a drum are physical objects, unrelated to thinking something up or to each other.",
  },
  {
    id: "wt-34", d: 7,
    items: [{ text: "freedom" }, { text: "choice" }, { text: "kettle" }, { text: "moon" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about being able to decide for yourself", points: 2 },
      { text: "They can both be taken away", points: 1 },
      { text: "They are both cold", points: 0 },
    ],
    explanation: "Freedom and choice are both about being able to decide for yourself.",
    distractorNote: "A kettle and the moon are physical things, unrelated to deciding for yourself or to each other.",
  },
  {
    id: "wt-35", d: 7,
    items: [{ text: "habit" }, { text: "routine" }, { text: "banana" }, { text: "cloud" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things you do the same way again and again", points: 2 },
      { text: "They can both be hard to change", points: 1 },
      { text: "They are both round", points: 0 },
    ],
    explanation: "A habit and a routine are both things you do the same way again and again.",
    distractorNote: "A banana and a cloud are physical things, unrelated to repeated behavior or to each other.",
  },

  // ---------------------------------------------------------------------
  // d8: abstract nouns, one step harder, age 11 to 12
  // ---------------------------------------------------------------------
  {
    id: "wt-36", d: 8,
    items: [{ text: "honesty" }, { text: "trust" }, { text: "ladder" }, { text: "spoon" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about believing someone tells the truth", points: 2 },
      { text: "One usually leads to the other", points: 1 },
      { text: "They are both cold", points: 0 },
    ],
    explanation: "Honesty and trust are both about believing someone tells the truth.",
    distractorNote: "A ladder and a spoon are physical objects, unrelated to honesty or trust.",
  },
  {
    id: "wt-37", d: 8,
    items: [{ text: "memory" }, { text: "dream" }, { text: "chair" }, { text: "banana" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things that happen inside your mind, not in the real world", points: 2 },
      { text: "They can both fade away over time", points: 1 },
      { text: "They are both loud", points: 0 },
    ],
    explanation: "A memory and a dream both happen inside your mind, not in the real world.",
    distractorNote: "A chair and a banana are real physical objects, unrelated to things that happen in the mind.",
  },
  {
    id: "wt-38", d: 8,
    items: [{ text: "opinion" }, { text: "belief" }, { text: "kettle" }, { text: "drum" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things a person thinks are true, even without proof", points: 2 },
      { text: "They can both be different from person to person", points: 1 },
      { text: "They are both heavy", points: 0 },
    ],
    explanation: "An opinion and a belief are both things a person thinks are true, even without proof.",
    distractorNote: "A kettle and a drum are physical objects, unrelated to what a person thinks.",
  },
  {
    id: "wt-39", d: 8,
    items: [{ text: "silence" }, { text: "darkness" }, { text: "ladder" }, { text: "peach" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both what happens when something is missing, no sound or no light", points: 2 },
      { text: "They can both make a place feel calm or scary", points: 1 },
      { text: "They are both funny", points: 0 },
    ],
    explanation: "Silence and darkness are both what happens when something is missing, no sound or no light.",
    distractorNote: "A ladder and a peach are physical objects that exist, unlike an absence of something.",
  },
  {
    id: "wt-40", d: 8,
    items: [{ text: "kindness" }, { text: "generosity" }, { text: "cloud" }, { text: "ladder" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about caring for and giving to other people", points: 2 },
      { text: "They can both make someone feel happy", points: 1 },
      { text: "They are both far away", points: 0 },
    ],
    explanation: "Kindness and generosity are both about caring for and giving to other people.",
    distractorNote: "A cloud and a ladder are physical objects, unrelated to caring for other people.",
  },

  // ---------------------------------------------------------------------
  // d9: hard abstractions, age 13
  // ---------------------------------------------------------------------
  {
    id: "wt-41", d: 9,
    items: [{ text: "poem" }, { text: "song" }, { text: "doubt" }, { text: "ladder" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both art forms that use words and rhythm to express feelings", points: 2 },
      { text: "They can both rhyme", points: 1 },
      { text: "They are both very long", points: 0 },
    ],
    explanation: "A poem and a song are both art forms that use words and rhythm to express feelings.",
    distractorNote: "Doubt is a feeling, not an art form, and a ladder is a physical object; neither relates to the other or to poems and songs.",
  },
  {
    id: "wt-42", d: 9,
    items: [{ text: "theory" }, { text: "guess" }, { text: "chair" }, { text: "kettle" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both ideas about what might be true, without being proven for certain", points: 2 },
      { text: "They can both turn out to be wrong", points: 1 },
      { text: "They are both loud", points: 0 },
    ],
    explanation: "A theory and a guess are both ideas about what might be true, without being proven for certain.",
    distractorNote: "A chair and a kettle are physical objects, unrelated to unproven ideas or to each other.",
  },
  {
    id: "wt-43", d: 9,
    items: [{ text: "justice" }, { text: "fairness" }, { text: "banana" }, { text: "drum" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about everyone being treated the right way, equally", points: 2 },
      { text: "People often disagree about what they really mean", points: 1 },
      { text: "They are both cold", points: 0 },
    ],
    explanation: "Justice and fairness are both about everyone being treated the right way, equally.",
    distractorNote: "A banana and a drum are physical objects, unrelated to how people are treated.",
  },
  {
    id: "wt-44", d: 9,
    items: [{ text: "identity" }, { text: "personality" }, { text: "moon" }, { text: "spoon" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about who a person really is, deep down", points: 2 },
      { text: "They can both change a little as a person grows up", points: 1 },
      { text: "They are both shiny", points: 0 },
    ],
    explanation: "Identity and personality are both about who a person really is, deep down.",
    distractorNote: "The moon and a spoon are physical objects, unrelated to who a person is.",
  },
  {
    id: "wt-45", d: 9,
    items: [{ text: "irony" }, { text: "sarcasm" }, { text: "cloud" }, { text: "peach" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both ways of saying something that really means the opposite", points: 2 },
      { text: "They can both be used to make a joke", points: 1 },
      { text: "They are both sweet", points: 0 },
    ],
    explanation: "Irony and sarcasm are both ways of saying something that really means the opposite.",
    distractorNote: "A cloud and a peach are physical things, unrelated to a way of speaking.",
  },

  // ---------------------------------------------------------------------
  // d10: hard abstractions, hardest, age 13
  // ---------------------------------------------------------------------
  {
    id: "wt-46", d: 10,
    items: [{ text: "paradox" }, { text: "contradiction" }, { text: "ladder" }, { text: "banana" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both ideas that seem to disagree with themselves or cannot both be true at once", points: 2 },
      { text: "They can both be confusing to think about", points: 1 },
      { text: "They are both tall", points: 0 },
    ],
    explanation: "A paradox and a contradiction are both ideas that seem to disagree with themselves or cannot both be true at once.",
    distractorNote: "A ladder and a banana are physical objects, unrelated to ideas that contradict themselves.",
  },
  {
    id: "wt-47", d: 10,
    items: [{ text: "nostalgia" }, { text: "longing" }, { text: "kettle" }, { text: "drum" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both feelings of missing something from the past or something far away", points: 2 },
      { text: "They can both feel bittersweet, happy and sad together", points: 1 },
      { text: "They are both loud", points: 0 },
    ],
    explanation: "Nostalgia and longing are both feelings of missing something from the past or something far away.",
    distractorNote: "A kettle and a drum are physical objects, unrelated to a feeling of missing something.",
  },
  {
    id: "wt-48", d: 10,
    items: [{ text: "legacy" }, { text: "reputation" }, { text: "chair" }, { text: "moon" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about how a person is remembered or thought of by others", points: 2 },
      { text: "They can both take a long time to build", points: 1 },
      { text: "They are both round", points: 0 },
    ],
    explanation: "A legacy and a reputation are both about how a person is remembered or thought of by others.",
    distractorNote: "A chair and the moon are physical objects, unrelated to how a person is remembered.",
  },
  {
    id: "wt-49", d: 10,
    items: [{ text: "hypothesis" }, { text: "assumption" }, { text: "spoon" }, { text: "cloud" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both things a person accepts as probably true before it is checked or tested", points: 2 },
      { text: "They can both turn out to be wrong once checked", points: 1 },
      { text: "They are both light", points: 0 },
    ],
    explanation: "A hypothesis and an assumption are both things a person accepts as probably true before it is checked or tested.",
    distractorNote: "A spoon and a cloud are physical objects, unrelated to something accepted as probably true.",
  },
  {
    id: "wt-50", d: 10,
    items: [{ text: "empathy" }, { text: "compassion" }, { text: "ladder" }, { text: "peach" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both about understanding and caring how someone else feels", points: 2 },
      { text: "They can both make a person want to help someone", points: 1 },
      { text: "They are both orange", points: 0 },
    ],
    explanation: "Empathy and compassion are both about understanding and caring how someone else feels.",
    distractorNote: "A ladder and a peach are physical objects, unrelated to understanding someone else's feelings.",
  },

  // ---------------------------------------------------------------------
  // d11: a hidden shared PROCESS, ages 13+
  // ---------------------------------------------------------------------
  {
    id: "wt-51", d: 11,
    items: [{ text: "erosion" }, { text: "extinction" }, { text: "rocket" }, { text: "blanket" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both slow losses that happen because a force keeps acting over a very long time", points: 2 },
      { text: "They both take a long time", points: 1 },
      { text: "They are both kinds of weather", points: 0 },
    ],
    explanation: "Erosion and extinction are both slow losses caused by a force that keeps acting over a very long time.",
    distractorNote: "A rocket and a blanket are ordinary objects; neither is a slow process of loss, and they share nothing with each other.",
  },
  {
    id: "wt-52", d: 11,
    items: [{ text: "rehearsal" }, { text: "draft" }, { text: "anchor" }, { text: "melon" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both practice versions made before the real one, so mistakes can be found and fixed first", points: 2 },
      { text: "They both come before something else", points: 1 },
      { text: "They are both kinds of fruit", points: 0 },
    ],
    explanation: "A rehearsal and a draft are both practice versions made before the real thing, so mistakes can be fixed first.",
    distractorNote: "An anchor and a melon are physical objects from unrelated worlds (boats and food); neither is a practice attempt.",
  },
  {
    id: "wt-53", d: 11,
    items: [{ text: "quarantine" }, { text: "curfew" }, { text: "pebble" }, { text: "violin" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both rules that limit where people may go, used to keep everybody safe", points: 2 },
      { text: "They both stop people doing what they want", points: 1 },
      { text: "They are both musical words", points: 0 },
    ],
    explanation: "A quarantine and a curfew are both rules that limit where people may go, used to keep everybody safe.",
    distractorNote: "A pebble and a violin are a stone and an instrument; neither is a rule about movement, and they do not belong together either.",
  },
  {
    id: "wt-54", d: 11,
    items: [{ text: "immunity" }, { text: "insulation" }, { text: "ladder" }, { text: "apricot" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both protections that stop something harmful from getting through", points: 2 },
      { text: "They both keep things out", points: 1 },
      { text: "They are both parts of the body", points: 0 },
    ],
    explanation: "Immunity and insulation are both protections that stop something harmful from getting through.",
    distractorNote: "A ladder and an apricot are a tool and a fruit; neither protects anything, and they have nothing in common with each other.",
  },
  {
    id: "wt-55", d: 11,
    items: [{ text: "rumour" }, { text: "avalanche" }, { text: "seagull" }, { text: "curtain" }],
    pair: [0, 1],
    reasons: [
      { text: "They both start tiny and grow bigger and faster the further they travel", points: 2 },
      { text: "They can both cause a lot of trouble", points: 1 },
      { text: "They are both always cold", points: 0 },
    ],
    explanation: "A rumour and an avalanche both start tiny and grow bigger and faster the further they travel.",
    distractorNote: "A seagull and a curtain are a bird and a furnishing, from unrelated worlds: neither grows or spreads, and they share no category with each other either. (The first draft used teaspoon and curtain, which were BOTH household objects and so formed a second plausible pair.)",
  },

  // ---------------------------------------------------------------------
  // d12: a hidden shared process, now about evidence and reasoning
  // ---------------------------------------------------------------------
  {
    id: "wt-56", d: 12,
    items: [{ text: "estimate" }, { text: "hypothesis" }, { text: "saddle" }, { text: "plum" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both careful guesses made on purpose before anybody can know the real answer", points: 2 },
      { text: "They are both a kind of guess", points: 1 },
      { text: "They are both always correct", points: 0 },
    ],
    explanation: "An estimate and a hypothesis are both careful guesses made on purpose before anybody can know the real answer.",
    distractorNote: "A saddle and a plum are riding gear and a fruit; neither is a guess, and they do not pair with each other.",
  },
  {
    id: "wt-57", d: 12,
    items: [{ text: "symptom" }, { text: "clue" }, { text: "trombone" }, { text: "hedge" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both small visible signs that point to a bigger cause you cannot see directly", points: 2 },
      { text: "They both help you work something out", points: 1 },
      { text: "They are both very loud", points: 0 },
    ],
    explanation: "A symptom and a clue are both small visible signs pointing to a bigger cause you cannot see directly.",
    distractorNote: "A trombone and a hedge are an instrument and a garden plant; neither is a sign of anything hidden.",
  },
  {
    id: "wt-58", d: 12,
    items: [{ text: "bias" }, { text: "distortion" }, { text: "kettle" }, { text: "meadow" }],
    pair: [0, 1],
    reasons: [
      { text: "They both bend the truth, so what you end up seeing is not quite what is really there", points: 2 },
      { text: "They both change how something looks", points: 1 },
      { text: "They are both shapes", points: 0 },
    ],
    explanation: "Bias and distortion both bend the truth, so what you end up seeing is not quite what is really there.",
    distractorNote: "A kettle and a meadow are an object and a place; neither alters the truth, and they share nothing with each other.",
  },
  {
    id: "wt-59", d: 12,
    items: [{ text: "average" }, { text: "summary" }, { text: "hammer" }, { text: "orchid" }],
    pair: [0, 1],
    reasons: [
      { text: "They both squeeze a great deal of information down into one short stand in for all of it", points: 2 },
      { text: "They both make something shorter", points: 1 },
      { text: "They are both tools you hold", points: 0 },
    ],
    explanation: "An average and a summary both squeeze a great deal of information down into one short stand in for all of it.",
    distractorNote: "A hammer and an orchid are a tool and a flower; neither condenses information, and they do not pair together.",
  },
  {
    id: "wt-60", d: 12,
    items: [{ text: "survey" }, { text: "experiment" }, { text: "ribbon" }, { text: "canyon" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both planned ways of collecting evidence in order to answer a question", points: 2 },
      { text: "They both take some planning", points: 1 },
      { text: "They are both places outdoors", points: 0 },
    ],
    explanation: "A survey and an experiment are both planned ways of collecting evidence in order to answer a question.",
    distractorNote: "A ribbon and a canyon are an object and a landform; neither gathers evidence, and nothing links them to each other.",
  },

  // ---------------------------------------------------------------------
  // d13: social systems, joined by the role they play between people
  // ---------------------------------------------------------------------
  {
    id: "wt-61", d: 13,
    items: [{ text: "democracy" }, { text: "jury" }, { text: "pancake" }, { text: "glacier" }],
    pair: [0, 1],
    reasons: [
      { text: "They both settle something by letting a group decide together instead of one person choosing", points: 2 },
      { text: "They both involve a lot of people", points: 1 },
      { text: "They are both always frozen", points: 0 },
    ],
    explanation: "A democracy and a jury both settle something by letting a group decide together instead of one person choosing.",
    distractorNote: "A pancake and a glacier are food and ice; neither decides anything, and they have no shared category.",
  },
  {
    id: "wt-62", d: 13,
    items: [{ text: "tax" }, { text: "subscription" }, { text: "walnut" }, { text: "lantern" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both payments made again and again in return for something you keep on receiving", points: 2 },
      { text: "They both cost money", points: 1 },
      { text: "They are both foods", points: 0 },
    ],
    explanation: "A tax and a subscription are both payments made again and again in return for something you keep on receiving.",
    distractorNote: "A walnut and a lantern are a nut and a light; neither is a payment, and they do not pair with each other.",
  },
  {
    id: "wt-63", d: 13,
    items: [{ text: "constitution" }, { text: "recipe" }, { text: "thunder" }, { text: "sandal" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both written sets of instructions saying exactly how something must be put together", points: 2 },
      { text: "They are both written down", points: 1 },
      { text: "They are both very loud", points: 0 },
    ],
    explanation: "A constitution and a recipe are both written sets of instructions saying exactly how something must be put together.",
    distractorNote: "Thunder and a sandal are a sound and a shoe; neither is a set of instructions, and they share nothing with each other.",
  },
  {
    id: "wt-64", d: 13,
    items: [{ text: "census" }, { text: "inventory" }, { text: "comet" }, { text: "mitten" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both complete counts of everything in a group, taken at one single moment", points: 2 },
      { text: "They both involve counting", points: 1 },
      { text: "They are both warm", points: 0 },
    ],
    explanation: "A census and an inventory are both complete counts of everything in a group, taken at one single moment.",
    distractorNote: "A comet and a mitten are a space object and clothing; neither counts anything, and they do not belong together.",
  },
  {
    id: "wt-65", d: 13,
    items: [{ text: "treaty" }, { text: "contract" }, { text: "pelican" }, { text: "drizzle" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both promises two sides are bound to keep, with agreed consequences if either breaks it", points: 2 },
      { text: "They are both written on paper", points: 1 },
      { text: "They are both kinds of bird", points: 0 },
    ],
    explanation: "A treaty and a contract are both promises two sides are bound to keep, with agreed consequences if either breaks it.",
    distractorNote: "A pelican and drizzle are a bird and light rain; neither is an agreement, and they have no category in common.",
  },

  // ---------------------------------------------------------------------
  // d14: change over time, joined by HOW they unfold
  // ---------------------------------------------------------------------
  {
    id: "wt-66", d: 14,
    items: [{ text: "evolution" }, { text: "tradition" }, { text: "saucepan" }, { text: "iceberg" }],
    pair: [0, 1],
    reasons: [
      { text: "They both change very slowly by passing small differences from one generation on to the next", points: 2 },
      { text: "They both take many years", points: 1 },
      { text: "They are both always frozen", points: 0 },
    ],
    explanation: "Evolution and tradition both change very slowly by passing small differences from one generation on to the next.",
    distractorNote: "A saucepan and an iceberg are a pot and floating ice; neither passes anything down through generations.",
  },
  {
    id: "wt-67", d: 14,
    items: [{ text: "momentum" }, { text: "habit" }, { text: "tulip" }, { text: "chimney" }],
    pair: [0, 1],
    reasons: [
      { text: "Once either one has started it carries on by itself, and stopping it takes more effort than starting it did", points: 2 },
      { text: "They both keep going", points: 1 },
      { text: "They are both made of brick", points: 0 },
    ],
    explanation: "Momentum and a habit both carry on by themselves once started, and stopping either takes more effort than starting it did.",
    distractorNote: "A tulip and a chimney are a flower and part of a house; neither continues under its own steam, and they do not pair.",
  },
  {
    id: "wt-68", d: 14,
    items: [{ text: "echo" }, { text: "consequence" }, { text: "mango" }, { text: "harp" }],
    pair: [0, 1],
    reasons: [
      { text: "They both come back to you later, and only because of something you did first", points: 2 },
      { text: "They both happen after something else", points: 1 },
      { text: "They are both sweet to taste", points: 0 },
    ],
    explanation: "An echo and a consequence both come back to you later, and only because of something you did first.",
    distractorNote: "A mango and a harp are a fruit and an instrument; neither returns to anyone, and they share no category.",
  },
  {
    id: "wt-69", d: 14,
    items: [{ text: "drought" }, { text: "famine" }, { text: "pencil" }, { text: "seagull" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both long shortages where something people need runs out across a whole region at once", points: 2 },
      { text: "They are both bad things that last a long time", points: 1 },
      { text: "They are both grey", points: 0 },
    ],
    explanation: "A drought and a famine are both long shortages where something people need runs out across a whole region at once.",
    distractorNote: "A pencil and a seagull are an object and a bird; neither is a shortage, and they do not belong with each other.",
  },
  {
    id: "wt-70", d: 14,
    items: [{ text: "threshold" }, { text: "deadline" }, { text: "walnut" }, { text: "fountain" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both invisible lines where everything changes the moment you cross over them", points: 2 },
      { text: "They are both limits", points: 1 },
      { text: "They are both made of stone", points: 0 },
    ],
    explanation: "A threshold and a deadline are both invisible lines where everything changes the moment you cross over them.",
    distractorNote: "A walnut and a fountain are a nut and a water feature; neither is a limit you cross, and they share nothing.",
  },

  // ---------------------------------------------------------------------
  // d15: ideas about ideas: representation, belief and meaning
  // ---------------------------------------------------------------------
  {
    id: "wt-71", d: 15,
    items: [{ text: "metaphor" }, { text: "model" }, { text: "anchor" }, { text: "plum" }],
    pair: [0, 1],
    reasons: [
      { text: "They both explain something hard by standing in for it as something simpler you already understand", points: 2 },
      { text: "They both help explain things", points: 1 },
      { text: "They are both toys", points: 0 },
    ],
    explanation: "A metaphor and a model both explain something hard by standing in for it as something simpler you already understand.",
    distractorNote: "An anchor and a plum are boat equipment and a fruit; neither stands in for anything else, and they do not pair.",
  },
  {
    id: "wt-72", d: 15,
    items: [{ text: "irony" }, { text: "illusion" }, { text: "kettle" }, { text: "badger" }],
    pair: [0, 1],
    reasons: [
      { text: "In both of them, what appears to be happening is the opposite of what is really happening", points: 2 },
      { text: "They are both surprising", points: 1 },
      { text: "They are both animals", points: 0 },
    ],
    explanation: "In both irony and an illusion, what appears to be happening is the opposite of what is really happening.",
    distractorNote: "A kettle and a badger are an object and an animal; neither involves appearance differing from reality.",
  },
  {
    id: "wt-73", d: 15,
    items: [{ text: "prejudice" }, { text: "superstition" }, { text: "cactus" }, { text: "saucer" }],
    pair: [0, 1],
    reasons: [
      { text: "They are both beliefs people hold firmly even though there is no evidence at all behind them", points: 2 },
      { text: "They are both beliefs", points: 1 },
      { text: "They are both plants", points: 0 },
    ],
    explanation: "Prejudice and superstition are both beliefs people hold firmly even though there is no evidence at all behind them.",
    distractorNote: "A cactus and a saucer are a plant and a dish; neither is a belief, and they have no category in common.",
  },
  {
    id: "wt-74", d: 15,
    items: [{ text: "symbol" }, { text: "password" }, { text: "pelican" }, { text: "quilt" }],
    pair: [0, 1],
    reasons: [
      { text: "They both stand for something else, and they only work while everybody agrees on what they mean", points: 2 },
      { text: "They both mean something", points: 1 },
      { text: "They are both soft", points: 0 },
    ],
    explanation: "A symbol and a password both stand for something else, and both only work while everybody agrees on what they mean.",
    distractorNote: "A pelican and a quilt are a bird and a bedcover; neither depends on shared agreement about meaning.",
  },
  {
    id: "wt-75", d: 15,
    items: [{ text: "satire" }, { text: "exaggeration" }, { text: "otter" }, { text: "lantern" }],
    pair: [0, 1],
    reasons: [
      { text: "They both stretch something past the truth deliberately, so that a point lands harder than plain facts would", points: 2 },
      { text: "They both make things sound bigger than they are", points: 1 },
      { text: "They are both bright", points: 0 },
    ],
    explanation: "Satire and exaggeration both stretch something past the truth deliberately, so a point lands harder than plain facts would.",
    distractorNote: "An otter and a lantern are an animal and a light; neither overstates anything, and they do not belong together.",
  },
];
