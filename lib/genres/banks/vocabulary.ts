import type { ChoiceBankItem } from "../bankGenre";

// Original vocabulary items. d1-d2 are picture items (an emoji and "What is
// this?" with one correct word and three wrong-but-plausible nouns). d3-d10
// are word-plus-definition items, age ramped from simple (age 7 to 8) to
// hard (age 13).
export const VOCABULARY_BANK: ChoiceBankItem[] = [
  // d1: picture items, age 6
  {
    id: "vo-01", d: 1, prompt: "What is this?", emoji: "🪜",
    options: [
      { text: "ladder", points: 1 },
      { text: "stairs", points: 0 },
      { text: "fence", points: 0 },
      { text: "gate", points: 0 },
    ],
    explanation: "The picture shows a ladder.",
  },
  {
    id: "vo-02", d: 1, prompt: "What is this?", emoji: "🌂",
    options: [
      { text: "umbrella", points: 1 },
      { text: "flag", points: 0 },
      { text: "kite", points: 0 },
      { text: "tent", points: 0 },
    ],
    explanation: "The picture shows an umbrella.",
  },
  {
    id: "vo-03", d: 1, prompt: "What is this?", emoji: "🧦",
    options: [
      { text: "sock", points: 1 },
      { text: "glove", points: 0 },
      { text: "scarf", points: 0 },
      { text: "hat", points: 0 },
    ],
    explanation: "The picture shows a sock.",
  },
  {
    id: "vo-04", d: 1, prompt: "What is this?", emoji: "🪁",
    options: [
      { text: "kite", points: 1 },
      { text: "balloon", points: 0 },
      { text: "flag", points: 0 },
      { text: "umbrella", points: 0 },
    ],
    explanation: "The picture shows a kite.",
  },
  // d2: picture items, age 6
  {
    id: "vo-05", d: 2, prompt: "What is this?", emoji: "🦷",
    options: [
      { text: "tooth", points: 1 },
      { text: "bone", points: 0 },
      { text: "nail", points: 0 },
      { text: "shell", points: 0 },
    ],
    explanation: "The picture shows a tooth.",
  },
  {
    id: "vo-06", d: 2, prompt: "What is this?", emoji: "🧵",
    options: [
      { text: "thread", points: 1 },
      { text: "ribbon", points: 0 },
      { text: "rope", points: 0 },
      { text: "wire", points: 0 },
    ],
    explanation: "The picture shows a spool of thread.",
  },
  {
    id: "vo-07", d: 2, prompt: "What is this?", emoji: "🪟",
    options: [
      { text: "window", points: 1 },
      { text: "door", points: 0 },
      { text: "mirror", points: 0 },
      { text: "picture", points: 0 },
    ],
    explanation: "The picture shows a window.",
  },
  {
    id: "vo-08", d: 2, prompt: "What is this?", emoji: "🧺",
    options: [
      { text: "basket", points: 1 },
      { text: "box", points: 0 },
      { text: "bag", points: 0 },
      { text: "bucket", points: 0 },
    ],
    explanation: "The picture shows a basket.",
  },
  // d3: word plus definition, age 7 to 8
  {
    id: "vo-09", d: 3, prompt: "What does enormous mean?",
    options: [
      { text: "Extremely large in size", points: 2 },
      { text: "Kind of big", points: 1 },
      { text: "Very quiet", points: 0 },
      { text: "Very fast", points: 0 },
    ],
    explanation: "Enormous means extremely large in size.",
  },
  {
    id: "vo-10", d: 3, prompt: "What does tiny mean?",
    options: [
      { text: "Extremely small in size", points: 2 },
      { text: "A little small", points: 1 },
      { text: "Very loud", points: 0 },
      { text: "Very tall", points: 0 },
    ],
    explanation: "Tiny means extremely small in size.",
  },
  {
    id: "vo-11", d: 3, prompt: "What does ancient mean?",
    options: [
      { text: "From a very long time ago", points: 2 },
      { text: "Kind of old", points: 1 },
      { text: "Very shiny", points: 0 },
      { text: "Very heavy", points: 0 },
    ],
    explanation: "Ancient means from a very long time ago.",
  },
  {
    id: "vo-12", d: 3, prompt: "What does gigantic mean?",
    options: [
      { text: "Extremely large, much bigger than usual", points: 2 },
      { text: "A bit larger than normal", points: 1 },
      { text: "Very cold", points: 0 },
      { text: "Very slow", points: 0 },
    ],
    explanation: "Gigantic means extremely large, much bigger than usual.",
  },
  // d4: word plus definition, age 7 to 8
  {
    id: "vo-13", d: 4, prompt: "What does furious mean?",
    options: [
      { text: "Extremely angry", points: 2 },
      { text: "A little upset", points: 1 },
      { text: "Very sleepy", points: 0 },
      { text: "Very hungry", points: 0 },
    ],
    explanation: "Furious means extremely angry.",
  },
  {
    id: "vo-14", d: 4, prompt: "What does exhausted mean?",
    options: [
      { text: "Extremely tired", points: 2 },
      { text: "A little tired", points: 1 },
      { text: "Very excited", points: 0 },
      { text: "Very brave", points: 0 },
    ],
    explanation: "Exhausted means extremely tired.",
  },
  {
    id: "vo-15", d: 4, prompt: "What does delighted mean?",
    options: [
      { text: "Extremely pleased and happy", points: 2 },
      { text: "A little happy", points: 1 },
      { text: "Very confused", points: 0 },
      { text: "Very cold", points: 0 },
    ],
    explanation: "Delighted means extremely pleased and happy.",
  },
  {
    id: "vo-16", d: 4, prompt: "What does starving mean?",
    options: [
      { text: "Extremely hungry", points: 2 },
      { text: "A little hungry", points: 1 },
      { text: "Very warm", points: 0 },
      { text: "Very tired", points: 0 },
    ],
    explanation: "Starving means extremely hungry.",
  },
  // d5: word plus definition, age 9 to 10
  {
    id: "vo-17", d: 5, prompt: "What does cautious mean?",
    options: [
      { text: "Being careful to avoid danger or mistakes", points: 2 },
      { text: "Being a little worried", points: 1 },
      { text: "Being very loud", points: 0 },
      { text: "Being very fast", points: 0 },
    ],
    explanation: "Cautious means being careful to avoid danger or mistakes.",
  },
  {
    id: "vo-18", d: 5, prompt: "What does curious mean?",
    options: [
      { text: "Eager to learn or find out about something", points: 2 },
      { text: "Interested for a moment", points: 1 },
      { text: "Feeling very tired", points: 0 },
      { text: "Feeling very cold", points: 0 },
    ],
    explanation: "Curious means eager to learn or find out about something.",
  },
  {
    id: "vo-19", d: 5, prompt: "What does generous mean?",
    options: [
      { text: "Willing to give and share freely with others", points: 2 },
      { text: "Being nice sometimes", points: 1 },
      { text: "Being very quiet", points: 0 },
      { text: "Being very tall", points: 0 },
    ],
    explanation: "Generous means willing to give and share freely with others.",
  },
  {
    id: "vo-20", d: 5, prompt: "What does nervous mean?",
    options: [
      { text: "Feeling worried or afraid about what might happen", points: 2 },
      { text: "Feeling a little unsure", points: 1 },
      { text: "Feeling very proud", points: 0 },
      { text: "Feeling very strong", points: 0 },
    ],
    explanation: "Nervous means feeling worried or afraid about what might happen.",
  },
  // d6: word plus definition, age 9 to 10
  {
    id: "vo-21", d: 6, prompt: "What does reluctant mean?",
    options: [
      { text: "Not wanting to do something", points: 2 },
      { text: "Being slow", points: 1 },
      { text: "Being very happy", points: 0 },
      { text: "Being very loud", points: 0 },
    ],
    explanation: "Reluctant means not wanting to do something.",
  },
  {
    id: "vo-22", d: 6, prompt: "What does stubborn mean?",
    options: [
      { text: "Refusing to change your mind even when others disagree", points: 2 },
      { text: "Being a bit difficult", points: 1 },
      { text: "Being very sleepy", points: 0 },
      { text: "Being very kind", points: 0 },
    ],
    explanation: "Stubborn means refusing to change your mind even when others disagree.",
  },
  {
    id: "vo-23", d: 6, prompt: "What does anxious mean?",
    options: [
      { text: "Feeling worried or uneasy about something that might happen", points: 2 },
      { text: "Feeling a little unsure", points: 1 },
      { text: "Feeling very proud", points: 0 },
      { text: "Feeling very hungry", points: 0 },
    ],
    explanation: "Anxious means feeling worried or uneasy about something that might happen.",
  },
  {
    id: "vo-24", d: 6, prompt: "What does reliable mean?",
    options: [
      { text: "Able to be trusted to do what is expected", points: 2 },
      { text: "Being helpful sometimes", points: 1 },
      { text: "Being very tall", points: 0 },
      { text: "Being very fast", points: 0 },
    ],
    explanation: "Reliable means able to be trusted to do what is expected.",
  },
  // d7: word plus definition, age 11 to 12
  {
    id: "vo-25", d: 7, prompt: "What does diligent mean?",
    options: [
      { text: "Working hard and carefully at a task", points: 2 },
      { text: "Being interested for a while", points: 1 },
      { text: "Being very tall", points: 0 },
      { text: "Being very cold", points: 0 },
    ],
    explanation: "Diligent means working hard and carefully at a task.",
  },
  {
    id: "vo-26", d: 7, prompt: "What does skeptical mean?",
    options: [
      { text: "Not easily believing that something is true", points: 2 },
      { text: "Feeling unsure sometimes", points: 1 },
      { text: "Feeling very excited", points: 0 },
      { text: "Feeling very warm", points: 0 },
    ],
    explanation: "Skeptical means not easily believing that something is true.",
  },
  {
    id: "vo-27", d: 7, prompt: "What does versatile mean?",
    options: [
      { text: "Able to do or be used for many different things", points: 2 },
      { text: "Good at one thing", points: 1 },
      { text: "Very loud", points: 0 },
      { text: "Very slow", points: 0 },
    ],
    explanation: "Versatile means able to do or be used for many different things.",
  },
  {
    id: "vo-28", d: 7, prompt: "What does candid mean?",
    options: [
      { text: "Being honest and direct, even about difficult things", points: 2 },
      { text: "Being polite sometimes", points: 1 },
      { text: "Being very fast", points: 0 },
      { text: "Being very tall", points: 0 },
    ],
    explanation: "Candid means being honest and direct, even about difficult things.",
  },
  // d8: word plus definition, age 11 to 12
  {
    id: "vo-29", d: 8, prompt: "What does abundant mean?",
    options: [
      { text: "Existing in very large amounts", points: 2 },
      { text: "There is some of it", points: 1 },
      { text: "Very quiet", points: 0 },
      { text: "Very small", points: 0 },
    ],
    explanation: "Abundant means existing in very large amounts.",
  },
  {
    id: "vo-30", d: 8, prompt: "What does persistent mean?",
    options: [
      { text: "Continuing firmly despite difficulty or opposition", points: 2 },
      { text: "Trying for a little while", points: 1 },
      { text: "Being very shy", points: 0 },
      { text: "Being very cold", points: 0 },
    ],
    explanation: "Persistent means continuing firmly despite difficulty or opposition.",
  },
  {
    id: "vo-31", d: 8, prompt: "What does ambiguous mean?",
    options: [
      { text: "Having more than one possible meaning, so it is unclear", points: 2 },
      { text: "A little confusing", points: 1 },
      { text: "Very exciting", points: 0 },
      { text: "Very heavy", points: 0 },
    ],
    explanation: "Ambiguous means having more than one possible meaning, so it is unclear.",
  },
  {
    id: "vo-32", d: 8, prompt: "What does meticulous mean?",
    options: [
      { text: "Showing great care and attention to small details", points: 2 },
      { text: "Being careful sometimes", points: 1 },
      { text: "Being very loud", points: 0 },
      { text: "Being very fast", points: 0 },
    ],
    explanation: "Meticulous means showing great care and attention to small details.",
  },
  // d9: word plus definition, age 13
  {
    id: "vo-33", d: 9, prompt: "What does inevitable mean?",
    options: [
      { text: "Certain to happen and impossible to avoid", points: 2 },
      { text: "Likely to happen", points: 1 },
      { text: "Very colorful", points: 0 },
      { text: "Very quiet", points: 0 },
    ],
    explanation: "Inevitable means certain to happen and impossible to avoid.",
  },
  {
    id: "vo-34", d: 9, prompt: "What does hypothesis mean?",
    options: [
      { text: "An idea suggested as a starting point that can be tested to see if it is true", points: 2 },
      { text: "A guess someone makes", points: 1 },
      { text: "A kind of machine", points: 0 },
      { text: "A type of building", points: 0 },
    ],
    explanation: "A hypothesis is an idea suggested as a starting point that can be tested to see if it is true.",
  },
  {
    id: "vo-35", d: 9, prompt: "What does resilient mean?",
    options: [
      { text: "Able to recover quickly after something difficult", points: 2 },
      { text: "Strong in some way", points: 1 },
      { text: "Very colorful", points: 0 },
      { text: "Very talkative", points: 0 },
    ],
    explanation: "Resilient means able to recover quickly after something difficult.",
  },
  {
    id: "vo-36", d: 9, prompt: "What does superficial mean?",
    options: [
      { text: "Only concerned with what is on the surface, not with anything deep", points: 2 },
      { text: "Not very serious", points: 1 },
      { text: "Very expensive", points: 0 },
      { text: "Very old", points: 0 },
    ],
    explanation: "Superficial means only concerned with what is on the surface, not with anything deep.",
  },
  // d10: word plus definition, age 13
  {
    id: "vo-37", d: 10, prompt: "What does pragmatic mean?",
    options: [
      { text: "Dealing with things in a practical way rather than by fixed ideas", points: 2 },
      { text: "Being reasonable sometimes", points: 1 },
      { text: "Being very colorful", points: 0 },
      { text: "Being very loud", points: 0 },
    ],
    explanation: "Pragmatic means dealing with things in a practical way rather than by fixed ideas.",
  },
  {
    id: "vo-38", d: 10, prompt: "What does arbitrary mean?",
    options: [
      { text: "Based on random choice rather than any reason or system", points: 2 },
      { text: "Chosen without much thought", points: 1 },
      { text: "Very expensive", points: 0 },
      { text: "Very heavy", points: 0 },
    ],
    explanation: "Arbitrary means based on random choice rather than any reason or system.",
  },
  {
    id: "vo-39", d: 10, prompt: "What does tenacious mean?",
    options: [
      { text: "Holding firmly onto something and not giving up easily", points: 2 },
      { text: "Trying hard sometimes", points: 1 },
      { text: "Very shiny", points: 0 },
      { text: "Very quiet", points: 0 },
    ],
    explanation: "Tenacious means holding firmly onto something and not giving up easily.",
  },
  {
    id: "vo-40", d: 10, prompt: "What does plausible mean?",
    options: [
      { text: "Seeming reasonable or probably true", points: 2 },
      { text: "Somewhat interesting", points: 1 },
      { text: "Very colorful", points: 0 },
      { text: "Very heavy", points: 0 },
    ],
    explanation: "Plausible means seeming reasonable or probably true.",
  },
];
