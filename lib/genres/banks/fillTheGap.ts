import type { ChoiceBankItem } from "../bankGenre";

// Original "Fill the Gap" items (cousin of word knowledge, VC domain): a
// sentence with one word missing. d1-d2 are picture items (an emoji plus a
// short "The X is ___ ..." sentence) where the four options are single
// action/descriptive words: the best fit (2), a plausible-but-less-vivid
// alternative (1), and two words that do not answer the sentence at all (0,
// 0). d3-d10 are single-word-blank sentences where all four options share
// the same part of speech as the correct word: the best fit (2), a simpler
// or vaguer near-synonym (1: right part of speech, plausible, but
// imprecise), and two options that are the wrong meaning for the sentence
// entirely (0, 0). Age ramped d1 (about age 6) through d10 (about age 13).
export const FILL_THE_GAP_BANK: ChoiceBankItem[] = [
  // d1: picture items, age 6
  {
    id: "fg-01", d: 1, prompt: "The cat is ___ on the mat.", emoji: "🐱",
    options: [
      { text: "sleeping", points: 2 },
      { text: "jumping", points: 1 },
      { text: "green", points: 0 },
      { text: "loud", points: 0 },
    ],
    explanation: "Cats often sleep on a mat, so sleeping fits best.",
  },
  {
    id: "fg-02", d: 1, prompt: "The dog is ___ by the door.", emoji: "🐶",
    options: [
      { text: "barking", points: 2 },
      { text: "waiting", points: 1 },
      { text: "purple", points: 0 },
      { text: "soft", points: 0 },
    ],
    explanation: "A dog by the door is most often barking to be let in.",
  },
  {
    id: "fg-03", d: 1, prompt: "The fish is ___ in the bowl.", emoji: "🐟",
    options: [
      { text: "swimming", points: 2 },
      { text: "resting", points: 1 },
      { text: "loud", points: 0 },
      { text: "heavy", points: 0 },
    ],
    explanation: "A fish in a bowl of water is swimming.",
  },
  {
    id: "fg-04", d: 1, prompt: "The bird is ___ in the tree.", emoji: "🐦",
    options: [
      { text: "singing", points: 2 },
      { text: "sitting", points: 1 },
      { text: "square", points: 0 },
      { text: "wet", points: 0 },
    ],
    explanation: "A bird up in a tree is often singing.",
  },
  {
    id: "fg-05", d: 1, prompt: "The turtle is ___ on the rock.", emoji: "🐢",
    options: [
      { text: "sleeping", points: 2 },
      { text: "sitting", points: 1 },
      { text: "purple", points: 0 },
      { text: "hungry", points: 0 },
    ],
    explanation: "A turtle on a warm rock is usually sleeping.",
  },
  // d2: picture items, age 6
  {
    id: "fg-06", d: 2, prompt: "The car is ___ down the road.", emoji: "🚗",
    options: [
      { text: "driving", points: 2 },
      { text: "turning", points: 1 },
      { text: "yellow", points: 0 },
      { text: "quiet", points: 0 },
    ],
    explanation: "A car down the road is driving.",
  },
  {
    id: "fg-07", d: 2, prompt: "The bus is ___ at the stop.", emoji: "🚌",
    options: [
      { text: "waiting", points: 2 },
      { text: "stopping", points: 1 },
      { text: "yellow", points: 0 },
      { text: "loud", points: 0 },
    ],
    explanation: "A bus at the stop is waiting for people to get on.",
  },
  {
    id: "fg-08", d: 2, prompt: "The frog is ___ in the pond.", emoji: "🐸",
    options: [
      { text: "swimming", points: 2 },
      { text: "jumping", points: 1 },
      { text: "tall", points: 0 },
      { text: "quiet", points: 0 },
    ],
    explanation: "A frog in the pond water is swimming.",
  },
  {
    id: "fg-09", d: 2, prompt: "The bee is ___ near the flower.", emoji: "🐝",
    options: [
      { text: "buzzing", points: 2 },
      { text: "flying", points: 1 },
      { text: "orange", points: 0 },
      { text: "heavy", points: 0 },
    ],
    explanation: "A bee near a flower is buzzing.",
  },
  {
    id: "fg-10", d: 2, prompt: "The boy is ___ in the pool.", emoji: "🏊",
    options: [
      { text: "swimming", points: 2 },
      { text: "splashing", points: 1 },
      { text: "loud", points: 0 },
      { text: "tiny", points: 0 },
    ],
    explanation: "A boy in the pool is swimming.",
  },
  // d3: everyday adjectives, age 7 to 8
  {
    id: "fg-11", d: 3, prompt: "The blue whale is ___ compared to a goldfish.",
    options: [
      { text: "enormous", points: 2 },
      { text: "big", points: 1 },
      { text: "quiet", points: 0 },
      { text: "fast", points: 0 },
    ],
    explanation: "A blue whale is enormous next to a tiny goldfish.",
  },
  {
    id: "fg-12", d: 3, prompt: "A mouse is much ___ than an elephant.",
    options: [
      { text: "tiny", points: 2 },
      { text: "small", points: 1 },
      { text: "loud", points: 0 },
      { text: "warm", points: 0 },
    ],
    explanation: "A mouse is tiny compared to a huge elephant.",
  },
  {
    id: "fg-13", d: 3, prompt: "The library was completely ___ during the exam.",
    options: [
      { text: "silent", points: 2 },
      { text: "quiet", points: 1 },
      { text: "colorful", points: 0 },
      { text: "heavy", points: 0 },
    ],
    explanation: "Nobody made a sound, so the library was silent.",
  },
  {
    id: "fg-14", d: 3, prompt: "The puppy is very ___ and wags its tail at everyone.",
    options: [
      { text: "friendly", points: 2 },
      { text: "nice", points: 1 },
      { text: "expensive", points: 0 },
      { text: "sharp", points: 0 },
    ],
    explanation: "A puppy that wags its tail at everyone is friendly.",
  },
  {
    id: "fg-15", d: 3, prompt: "The giant redwood tree looked ___ next to the small car.",
    options: [
      { text: "gigantic", points: 2 },
      { text: "big", points: 1 },
      { text: "funny", points: 0 },
      { text: "soft", points: 0 },
    ],
    explanation: "Next to a small car, a giant redwood looks gigantic.",
  },
  // d4: everyday adjectives, age 7 to 8
  {
    id: "fg-16", d: 4, prompt: "Grandma is always ___ when she talks to the new puppy.",
    options: [
      { text: "gentle", points: 2 },
      { text: "nice", points: 1 },
      { text: "expensive", points: 0 },
      { text: "loud", points: 0 },
    ],
    explanation: "Grandma is gentle so she does not scare the new puppy.",
  },
  {
    id: "fg-17", d: 4, prompt: "After running the whole race, Mia felt completely ___.",
    options: [
      { text: "exhausted", points: 2 },
      { text: "tired", points: 1 },
      { text: "curious", points: 0 },
      { text: "shiny", points: 0 },
    ],
    explanation: "Running a whole race left Mia exhausted.",
  },
  {
    id: "fg-18", d: 4, prompt: "Dad was ___ when he found out someone scratched his new car.",
    options: [
      { text: "furious", points: 2 },
      { text: "upset", points: 1 },
      { text: "sleepy", points: 0 },
      { text: "hungry", points: 0 },
    ],
    explanation: "A scratch on his new car made Dad furious.",
  },
  {
    id: "fg-19", d: 4, prompt: "By dinner time, the hikers were absolutely ___.",
    options: [
      { text: "starving", points: 2 },
      { text: "hungry", points: 1 },
      { text: "proud", points: 0 },
      { text: "quiet", points: 0 },
    ],
    explanation: "A long hike before dinner left the hikers starving.",
  },
  {
    id: "fg-20", d: 4, prompt: "The nurse was very ___ while giving the shot so it would not hurt.",
    options: [
      { text: "gentle", points: 2 },
      { text: "careful", points: 1 },
      { text: "colorful", points: 0 },
      { text: "loud", points: 0 },
    ],
    explanation: "A gentle touch is what keeps a shot from hurting.",
  },
  // d5: age 9 to 10
  {
    id: "fg-21", d: 5, prompt: "Before her first swim meet, Aoife felt ___ about jumping in.",
    options: [
      { text: "nervous", points: 2 },
      { text: "unsure", points: 1 },
      { text: "proud", points: 0 },
      { text: "generous", points: 0 },
    ],
    explanation: "A first swim meet often makes a swimmer feel nervous.",
  },
  {
    id: "fg-22", d: 5, prompt: "The museum's map was so ___ that the ink had almost faded away.",
    options: [
      { text: "ancient", points: 2 },
      { text: "old", points: 1 },
      { text: "colorful", points: 0 },
      { text: "heavy", points: 0 },
    ],
    explanation: "Ink fading away is a sign the map is ancient.",
  },
  {
    id: "fg-23", d: 5, prompt: "Tom was ___ to try the spicy food, but he tasted it anyway.",
    options: [
      { text: "reluctant", points: 2 },
      { text: "unwilling", points: 1 },
      { text: "curious", points: 0 },
      { text: "generous", points: 0 },
    ],
    explanation: "Tom did not really want to try it, so he was reluctant.",
  },
  {
    id: "fg-24", d: 5, prompt: "She felt ___ about sharing her drawing, worried someone might laugh.",
    options: [
      { text: "nervous", points: 2 },
      { text: "shy", points: 1 },
      { text: "generous", points: 0 },
      { text: "strong", points: 0 },
    ],
    explanation: "Worrying that someone might laugh is what nervous means here.",
  },
  {
    id: "fg-25", d: 5, prompt: "The castle ruins were ___, built long before anyone could remember.",
    options: [
      { text: "ancient", points: 2 },
      { text: "old", points: 1 },
      { text: "shiny", points: 0 },
      { text: "quiet", points: 0 },
    ],
    explanation: "Built long before anyone could remember means the ruins are ancient.",
  },
  // d6: age 9 to 10
  {
    id: "fg-26", d: 6, prompt: "He was ___ to give up his seat, but he did it anyway.",
    options: [
      { text: "reluctant", points: 2 },
      { text: "unwilling", points: 1 },
      { text: "curious", points: 0 },
      { text: "proud", points: 0 },
    ],
    explanation: "Doing something anyway even though you did not want to is reluctant.",
  },
  {
    id: "fg-27", d: 6, prompt: "Even though she practiced, she still felt ___ before the recital.",
    options: [
      { text: "nervous", points: 2 },
      { text: "uneasy", points: 1 },
      { text: "generous", points: 0 },
      { text: "cheerful", points: 0 },
    ],
    explanation: "Feeling worried before a recital is being nervous.",
  },
  {
    id: "fg-28", d: 6, prompt: "The old letters looked ___, with paper that crumbled at the edges.",
    options: [
      { text: "ancient", points: 2 },
      { text: "old", points: 1 },
      { text: "bright", points: 0 },
      { text: "loud", points: 0 },
    ],
    explanation: "Crumbling paper is a sign the letters are ancient.",
  },
  {
    id: "fg-29", d: 6, prompt: "My little brother is ___ about trying new vegetables at dinner.",
    options: [
      { text: "reluctant", points: 2 },
      { text: "hesitant", points: 1 },
      { text: "curious", points: 0 },
      { text: "careless", points: 0 },
    ],
    explanation: "Not wanting to try new vegetables is being reluctant.",
  },
  {
    id: "fg-30", d: 6, prompt: "Walking into the dark cave made the campers feel ___.",
    options: [
      { text: "nervous", points: 2 },
      { text: "uneasy", points: 1 },
      { text: "proud", points: 0 },
      { text: "cheerful", points: 0 },
    ],
    explanation: "A dark cave often makes people feel nervous.",
  },
  // d7: age 11 to 12
  {
    id: "fg-31", d: 7, prompt: "Even after losing three times, the team stayed ___ and kept practicing.",
    options: [
      { text: "persistent", points: 2 },
      { text: "determined", points: 1 },
      { text: "careless", points: 0 },
      { text: "generous", points: 0 },
    ],
    explanation: "Continuing to try after losses is being persistent.",
  },
  {
    id: "fg-32", d: 7, prompt: "The old vase was so ___ that it cracked when the box was bumped.",
    options: [
      { text: "fragile", points: 2 },
      { text: "delicate", points: 1 },
      { text: "heavy", points: 0 },
      { text: "loud", points: 0 },
    ],
    explanation: "Cracking from a bump means the vase was fragile.",
  },
  {
    id: "fg-33", d: 7, prompt: "Wildflowers were ___ across the meadow after the spring rains.",
    options: [
      { text: "abundant", points: 2 },
      { text: "plentiful", points: 1 },
      { text: "silent", points: 0 },
      { text: "expensive", points: 0 },
    ],
    explanation: "A meadow full of wildflowers after rain has an abundant amount of them.",
  },
  {
    id: "fg-34", d: 7, prompt: "The scientist was ___, repeating the experiment until the results made sense.",
    options: [
      { text: "persistent", points: 2 },
      { text: "determined", points: 1 },
      { text: "careless", points: 0 },
      { text: "cheerful", points: 0 },
    ],
    explanation: "Repeating an experiment until it makes sense is being persistent.",
  },
  {
    id: "fg-35", d: 7, prompt: "The antique glass ornament was too ___ to pack without bubble wrap.",
    options: [
      { text: "fragile", points: 2 },
      { text: "delicate", points: 1 },
      { text: "colorful", points: 0 },
      { text: "loud", points: 0 },
    ],
    explanation: "Needing bubble wrap to pack it safely means it is fragile.",
  },
  // d8: age 11 to 12
  {
    id: "fg-36", d: 8, prompt: "Fish were ___ in the clear lake, filling every corner of the water.",
    options: [
      { text: "abundant", points: 2 },
      { text: "plentiful", points: 1 },
      { text: "expensive", points: 0 },
      { text: "quiet", points: 0 },
    ],
    explanation: "Filling every corner of the lake means the fish were abundant.",
  },
  {
    id: "fg-37", d: 8, prompt: "The negotiator remained ___, returning to the table again and again.",
    options: [
      { text: "persistent", points: 2 },
      { text: "determined", points: 1 },
      { text: "careless", points: 0 },
      { text: "cheerful", points: 0 },
    ],
    explanation: "Returning to the table again and again is being persistent.",
  },
  {
    id: "fg-38", d: 8, prompt: "The thin ice on the pond looked ___ and unsafe to walk on.",
    options: [
      { text: "fragile", points: 2 },
      { text: "delicate", points: 1 },
      { text: "colorful", points: 0 },
      { text: "friendly", points: 0 },
    ],
    explanation: "Thin, unsafe ice is fragile.",
  },
  {
    id: "fg-39", d: 8, prompt: "Resources in the small village became less ___ during the dry season.",
    options: [
      { text: "abundant", points: 2 },
      { text: "plentiful", points: 1 },
      { text: "careless", points: 0 },
      { text: "cheerful", points: 0 },
    ],
    explanation: "Having fewer resources means they became less abundant.",
  },
  {
    id: "fg-40", d: 8, prompt: "The old rope bridge felt ___ under their feet with every step.",
    options: [
      { text: "fragile", points: 2 },
      { text: "flimsy", points: 1 },
      { text: "colorful", points: 0 },
      { text: "generous", points: 0 },
    ],
    explanation: "A bridge that feels unsafe under every step is fragile.",
  },
  // d9: age 13
  {
    id: "fg-41", d: 9, prompt: "Her explanation for the missing cookies sounded ___, even if it was not entirely true.",
    options: [
      { text: "plausible", points: 2 },
      { text: "believable", points: 1 },
      { text: "colorful", points: 0 },
      { text: "expensive", points: 0 },
    ],
    explanation: "An explanation that sounds like it could be true is plausible.",
  },
  {
    id: "fg-42", d: 9, prompt: "The scientist wrote down her ___ before starting the experiment.",
    options: [
      { text: "hypothesis", points: 2 },
      { text: "guess", points: 1 },
      { text: "notebook", points: 0 },
      { text: "microscope", points: 0 },
    ],
    explanation: "A tested idea written down before an experiment is a hypothesis.",
  },
  {
    id: "fg-43", d: 9, prompt: "He was ___ about organizing his notes, color coding every single page.",
    options: [
      { text: "meticulous", points: 2 },
      { text: "careful", points: 1 },
      { text: "generous", points: 0 },
      { text: "cheerful", points: 0 },
    ],
    explanation: "Color coding every single page shows he was meticulous.",
  },
  {
    id: "fg-44", d: 9, prompt: "The detective's theory seemed ___ once all the clues were laid out.",
    options: [
      { text: "plausible", points: 2 },
      { text: "reasonable", points: 1 },
      { text: "colorful", points: 0 },
      { text: "expensive", points: 0 },
    ],
    explanation: "A theory that fits the clues seems plausible.",
  },
  {
    id: "fg-45", d: 9, prompt: "The lab report needed a clear ___ that could be tested with data.",
    options: [
      { text: "hypothesis", points: 2 },
      { text: "idea", points: 1 },
      { text: "textbook", points: 0 },
      { text: "calculator", points: 0 },
    ],
    explanation: "A testable statement in a lab report is a hypothesis.",
  },
  // d10: age 13
  {
    id: "fg-46", d: 10, prompt: "The editor was ___, checking every sentence twice before publishing.",
    options: [
      { text: "meticulous", points: 2 },
      { text: "thorough", points: 1 },
      { text: "generous", points: 0 },
      { text: "cheerful", points: 0 },
    ],
    explanation: "Checking every sentence twice shows the editor was meticulous.",
  },
  {
    id: "fg-47", d: 10, prompt: "The new theory sounded ___, matching everything the data had shown so far.",
    options: [
      { text: "plausible", points: 2 },
      { text: "reasonable", points: 1 },
      { text: "expensive", points: 0 },
      { text: "colorful", points: 0 },
    ],
    explanation: "Matching the data makes the theory seem plausible.",
  },
  {
    id: "fg-48", d: 10, prompt: "Before testing it, the students had to write a clear ___ they could prove or disprove.",
    options: [
      { text: "hypothesis", points: 2 },
      { text: "prediction", points: 1 },
      { text: "blueprint", points: 0 },
      { text: "dictionary", points: 0 },
    ],
    explanation: "A statement written to be proved or disproved by testing is a hypothesis.",
  },
  {
    id: "fg-49", d: 10, prompt: "She was ___ about proofreading, catching even the smallest spelling mistake.",
    options: [
      { text: "meticulous", points: 2 },
      { text: "careful", points: 1 },
      { text: "generous", points: 0 },
      { text: "talkative", points: 0 },
    ],
    explanation: "Catching even the smallest mistake shows she was meticulous.",
  },
  {
    id: "fg-50", d: 10, prompt: "A ___ excuse still needs real evidence before anyone should believe it.",
    options: [
      { text: "plausible", points: 2 },
      { text: "reasonable", points: 1 },
      { text: "colorful", points: 0 },
      { text: "expensive", points: 0 },
    ],
    explanation: "An excuse that sounds like it could be true is plausible.",
  },
];
