import type { ChoiceBankItem } from "../bankGenre";

// Original "how are X and Y alike" items, age ramped d1 (about age 6) through
// d10 (about age 13): concrete objects, then categories, then function or
// abstract pairs, then abstract nouns, then hard abstractions.
export const SIMILARITIES_BANK: ChoiceBankItem[] = [
  // d1: concrete objects, age 6
  {
    id: "si-01", d: 1, prompt: "How are an apple and a banana alike?",
    options: [
      { text: "They are both fruits", points: 2 },
      { text: "You can eat both of them", points: 1 },
      { text: "They are both long", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "An apple and a banana are both fruits, which is the best shared category.",
  },
  {
    id: "si-02", d: 1, prompt: "How are a car and a bus alike?",
    options: [
      { text: "They are both vehicles that carry people", points: 2 },
      { text: "They both have wheels", points: 1 },
      { text: "They are both red", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A car and a bus are both vehicles that carry people from place to place.",
  },
  {
    id: "si-03", d: 1, prompt: "How are a shirt and pants alike?",
    options: [
      { text: "They are both clothes you wear", points: 2 },
      { text: "They are both soft", points: 1 },
      { text: "They are both blue", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A shirt and pants are both clothes that people wear.",
  },
  {
    id: "si-04", d: 1, prompt: "How are a dog and a cat alike?",
    options: [
      { text: "They are both pets that people take care of", points: 2 },
      { text: "They both have four legs", points: 1 },
      { text: "They are both purple", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A dog and a cat are both pets that people take care of at home.",
  },
  // d2: concrete objects, age 6
  {
    id: "si-05", d: 2, prompt: "How are a spoon and a fork alike?",
    options: [
      { text: "They are both tools used for eating", points: 2 },
      { text: "They are both made of metal or plastic", points: 1 },
      { text: "They are both round", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A spoon and a fork are both tools we use for eating food.",
  },
  {
    id: "si-06", d: 2, prompt: "How are a hat and a scarf alike?",
    options: [
      { text: "They are both things you wear to stay warm", points: 2 },
      { text: "They are both soft", points: 1 },
      { text: "They are both green", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A hat and a scarf are both worn to keep a person warm.",
  },
  {
    id: "si-07", d: 2, prompt: "How are a ball and a balloon alike?",
    options: [
      { text: "They are both round toys you can play with", points: 2 },
      { text: "They can both bounce or float in the air", points: 1 },
      { text: "They are both heavy", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A ball and a balloon are both round toys people play with.",
  },
  {
    id: "si-08", d: 2, prompt: "How are a pillow and a blanket alike?",
    options: [
      { text: "They are both things used for sleeping comfortably", points: 2 },
      { text: "They are both soft", points: 1 },
      { text: "They are both loud", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A pillow and a blanket are both things that make sleeping comfortable.",
  },
  // d3: categories, age 7 to 8
  {
    id: "si-09", d: 3, prompt: "How are a cat and a cow alike?",
    options: [
      { text: "They are both animals", points: 2 },
      { text: "They both have four legs", points: 1 },
      { text: "They both live in water", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A cat and a cow are both animals, which is their shared category.",
  },
  {
    id: "si-10", d: 3, prompt: "How are a rose and a daisy alike?",
    options: [
      { text: "They are both flowers", points: 2 },
      { text: "They both grow in a garden", points: 1 },
      { text: "They are both made of wood", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A rose and a daisy are both flowers.",
  },
  {
    id: "si-11", d: 3, prompt: "How are a hammer and a screwdriver alike?",
    options: [
      { text: "They are both tools", points: 2 },
      { text: "They are both used to fix things", points: 1 },
      { text: "They are both foods", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A hammer and a screwdriver are both tools.",
  },
  {
    id: "si-12", d: 3, prompt: "How are a violin and a guitar alike?",
    options: [
      { text: "They are both musical instruments", points: 2 },
      { text: "They both have strings", points: 1 },
      { text: "They are both used to cook food", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A violin and a guitar are both musical instruments.",
  },
  // d4: categories, age 7 to 8
  {
    id: "si-13", d: 4, prompt: "How are a robin and an eagle alike?",
    options: [
      { text: "They are both birds", points: 2 },
      { text: "They can both fly", points: 1 },
      { text: "They both live under the sea", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A robin and an eagle are both birds.",
  },
  {
    id: "si-14", d: 4, prompt: "How are a triangle and a square alike?",
    options: [
      { text: "They are both shapes", points: 2 },
      { text: "They both have straight sides", points: 1 },
      { text: "They are both animals", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A triangle and a square are both shapes.",
  },
  {
    id: "si-15", d: 4, prompt: "How are a truck and a train alike?",
    options: [
      { text: "They are both vehicles that carry heavy loads", points: 2 },
      { text: "They both have wheels or move on tracks", points: 1 },
      { text: "They are both made of paper", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A truck and a train are both vehicles built to carry heavy loads.",
  },
  {
    id: "si-16", d: 4, prompt: "How are an orange and a lemon alike?",
    options: [
      { text: "They are both citrus fruits", points: 2 },
      { text: "They are both round and juicy", points: 1 },
      { text: "They are both vegetables", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "An orange and a lemon are both citrus fruits.",
  },
  // d5: function or abstract pairs, age 9 to 10
  {
    id: "si-17", d: 5, prompt: "How are a clock and a calendar alike?",
    options: [
      { text: "They both help people keep track of time", points: 2 },
      { text: "They both have numbers on them", points: 1 },
      { text: "They are both kinds of food", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A clock and a calendar both help people keep track of time.",
  },
  {
    id: "si-18", d: 5, prompt: "How are a map and a compass alike?",
    options: [
      { text: "They both help people find their way", points: 2 },
      { text: "They are both used when traveling", points: 1 },
      { text: "They are both worn on your feet", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A map and a compass both help people find their way.",
  },
  {
    id: "si-19", d: 5, prompt: "How are a thermometer and a scale alike?",
    options: [
      { text: "They both measure something about a person", points: 2 },
      { text: "They both give you a number", points: 1 },
      { text: "They are both used to write letters", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A thermometer and a scale both measure something about a person.",
  },
  {
    id: "si-20", d: 5, prompt: "How are a key and a password alike?",
    options: [
      { text: "They both let you get into something that is locked", points: 2 },
      { text: "They are both kept secret or safe", points: 1 },
      { text: "They are both kinds of animals", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A key and a password both let you get into something that is locked.",
  },
  // d6: function or abstract pairs, age 9 to 10
  {
    id: "si-21", d: 6, prompt: "How are a book and a movie alike?",
    options: [
      { text: "They both tell a story", points: 2 },
      { text: "They can both make you feel happy or sad", points: 1 },
      { text: "They are both eaten for lunch", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A book and a movie both tell a story.",
  },
  {
    id: "si-22", d: 6, prompt: "How are a doctor and a nurse alike?",
    options: [
      { text: "They both help sick people get better", points: 2 },
      { text: "They both work in a hospital", points: 1 },
      { text: "They both fly airplanes", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A doctor and a nurse both help sick people get better.",
  },
  {
    id: "si-23", d: 6, prompt: "How are a river and a road alike?",
    options: [
      { text: "They both let things travel from one place to another", points: 2 },
      { text: "They are both long and go a long way", points: 1 },
      { text: "They are both worn as clothing", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A river and a road both let things travel from one place to another.",
  },
  {
    id: "si-24", d: 6, prompt: "How are a seed and an egg alike?",
    options: [
      { text: "They both grow into a living thing", points: 2 },
      { text: "They are both small and round", points: 1 },
      { text: "They are both loud sounds", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A seed and an egg both grow into a living thing.",
  },
  // d7: abstract nouns, age 11 to 12
  {
    id: "si-25", d: 7, prompt: "How are a promise and a rule alike?",
    options: [
      { text: "They both tell you what you are expected to do", points: 2 },
      { text: "They can both be broken", points: 1 },
      { text: "They are both kinds of weather", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A promise and a rule both tell you what you are expected to do.",
  },
  {
    id: "si-26", d: 7, prompt: "How are courage and confidence alike?",
    options: [
      { text: "They are both feelings that help you face something hard", points: 2 },
      { text: "They are both feelings a person can have", points: 1 },
      { text: "They are both colors", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Courage and confidence are both feelings that help a person face something hard.",
  },
  {
    id: "si-27", d: 7, prompt: "How are a plan and a goal alike?",
    options: [
      { text: "They both help you decide what to do to reach something you want", points: 2 },
      { text: "They both come before an action", points: 1 },
      { text: "They are both animals", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A plan and a goal both help a person decide what to do to reach something they want.",
  },
  {
    id: "si-28", d: 7, prompt: "How are kindness and generosity alike?",
    options: [
      { text: "They are both ways of treating other people well", points: 2 },
      { text: "They are both good qualities to have", points: 1 },
      { text: "They are both types of weather", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Kindness and generosity are both ways of treating other people well.",
  },
  // d8: abstract nouns, age 11 to 12
  {
    id: "si-29", d: 8, prompt: "How are patience and persistence alike?",
    options: [
      { text: "They both help you keep going when something is hard", points: 2 },
      { text: "They are both qualities a person can have", points: 1 },
      { text: "They are both places you can visit", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Patience and persistence both help a person keep going when something is hard.",
  },
  {
    id: "si-30", d: 8, prompt: "How are honesty and trust alike?",
    options: [
      { text: "They both help people believe and depend on each other", points: 2 },
      { text: "They are both important in a friendship", points: 1 },
      { text: "They are both kinds of food", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Honesty and trust both help people believe and depend on each other.",
  },
  {
    id: "si-31", d: 8, prompt: "How are freedom and choice alike?",
    options: [
      { text: "They both let a person decide things for themselves", points: 2 },
      { text: "They are both ideas people value", points: 1 },
      { text: "They are both shapes", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Freedom and choice both let a person decide things for themselves.",
  },
  {
    id: "si-32", d: 8, prompt: "How are a habit and a routine alike?",
    options: [
      { text: "They are both things a person does the same way often", points: 2 },
      { text: "They both happen again and again", points: 1 },
      { text: "They are both kinds of music", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A habit and a routine are both things a person does the same way often.",
  },
  // d9: hard abstractions, age 13
  {
    id: "si-33", d: 9, prompt: "How are a doubt and a fear alike?",
    options: [
      { text: "Both are feelings about something that might go wrong", points: 2 },
      { text: "Both are things you feel", points: 1 },
      { text: "Both are kinds of fruit", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A doubt and a fear are both feelings about something that might go wrong.",
  },
  {
    id: "si-34", d: 9, prompt: "How are a poem and a song alike?",
    options: [
      { text: "Both use words in a rhythm to express a feeling or idea", points: 2 },
      { text: "Both can be read or listened to", points: 1 },
      { text: "Both are worn as clothing", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "A poem and a song both use words in a rhythm to express a feeling or idea.",
  },
  {
    id: "si-35", d: 9, prompt: "How are pride and shame alike?",
    options: [
      { text: "Both are strong feelings about something a person has done", points: 2 },
      { text: "Both are feelings a person can have", points: 1 },
      { text: "Both are types of weather", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Pride and shame are both strong feelings about something a person has done.",
  },
  {
    id: "si-36", d: 9, prompt: "How are memory and imagination alike?",
    options: [
      { text: "Both let the mind picture something that is not right in front of you", points: 2 },
      { text: "Both happen inside your mind", points: 1 },
      { text: "Both are kinds of vehicles", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Memory and imagination both let the mind picture something that is not right in front of you.",
  },
  // d10: hard abstractions, age 13
  {
    id: "si-37", d: 10, prompt: "How are justice and mercy alike?",
    options: [
      { text: "Both are about how a person or a rule treats someone who did wrong", points: 2 },
      { text: "Both are ideas about being fair to people", points: 1 },
      { text: "Both are types of weather", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Justice and mercy are both about how a person or a rule treats someone who did wrong.",
  },
  {
    id: "si-38", d: 10, prompt: "How are wisdom and knowledge alike?",
    options: [
      { text: "Both are about understanding things well enough to make good decisions", points: 2 },
      { text: "Both come from learning or experience", points: 1 },
      { text: "Both are kinds of music", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Wisdom and knowledge are both about understanding things well enough to make good decisions.",
  },
  {
    id: "si-39", d: 10, prompt: "How are hope and optimism alike?",
    options: [
      { text: "Both are ways of expecting good things to happen in the future", points: 2 },
      { text: "Both are positive feelings", points: 1 },
      { text: "Both are kinds of tools", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Hope and optimism are both ways of expecting good things to happen in the future.",
  },
  {
    id: "si-40", d: 10, prompt: "How are loyalty and commitment alike?",
    options: [
      { text: "Both mean staying true to a person or a promise over time", points: 2 },
      { text: "Both are qualities that show up in how a person acts", points: 1 },
      { text: "Both are types of food", points: 0 },
      { text: "They are not alike", points: 0 },
    ],
    explanation: "Loyalty and commitment both mean staying true to a person or a promise over time.",
  },
];
