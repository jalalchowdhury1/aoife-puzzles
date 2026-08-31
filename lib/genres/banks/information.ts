import type { ChoiceBankItem } from "../bankGenre";

// General knowledge ("Do You Know") facts: body, calendar, animals, earth and
// sky, physical science, geography and history. Re authored 2026-08-30
// (decision #29) against these rules:
//
//   * Items are stored in ramp order, d1 (about age 6) to d15 (about age 13 to
//     14, middle school science, geography and history). Every tier has four
//     items, and every tier is harder than the two below it, because the
//     demand goes up (more precision, finer distinctions), not because the
//     words got rarer.
//   * Every zero point option is a same category near miss: another ocean,
//     another planet, another astronaut, another map line, another galaxy. A
//     child who does not know the fact must not be able to win by throwing out
//     the options that come from a different world than the key.
//   * No key is reused anywhere in the bank, and no filler distractor appears
//     as a zero point option in more than three items.
//   * A key of two or more words always sits beside at least one distractor of
//     two or more words, articles and capitals match across the four options,
//     and every option is speakable by TTS.
//   * No word of the stem appears in the key and nowhere else, no key is the
//     only option with a telltale prefix, and mean key length is held close to
//     mean distractor length so "pick the longest" stays at chance.
//   * Facts are widely taught, current and uncontested. US conventions are
//     used where a fact depends on one. US spelling, and no dashes of any kind
//     anywhere, because the text is read aloud by TTS.
//   * Every item carries a reviewNote recording the red team pass. Never shown
//     to her.
export const INFORMATION_BANK: ChoiceBankItem[] = [
  // ------------------------------------------------------------------
  // d1: about age 6. Facts a child meets before she can read.
  // ------------------------------------------------------------------
  {
    id: "in-01", d: 1, prompt: "How many legs does a dog have?",
    options: [
      { text: "Four", points: 1 },
      { text: "Two", points: 0 },
      { text: "Six", points: 0 },
      { text: "Eight", points: 0 },
    ],
    explanation: "A dog has four legs.",
    reviewNote: "All four options are leg counts of familiar animals: two is a bird, six is an insect, eight is a spider, so each zero is a real animal a child could be thinking of. Four is uniquely right for a dog. Checked length (Eight is longest, not the key), register (four bare number words) and stem echo (no stem word sits in the key).",
  },
  {
    id: "in-02", d: 1, prompt: "What color is the sky in the middle of a clear day?",
    options: [
      { text: "Blue", points: 1 },
      { text: "Gray", points: 0 },
      { text: "Green", points: 0 },
      { text: "Purple", points: 0 },
    ],
    explanation: "The sky looks blue in the middle of a clear day.",
    reviewNote: "Every option is a sky color a child has really seen: gray on a cloudy day, purple at dusk, green in a storm light. The stem says the middle of a clear day, which rules out both the cloud colors and the sunset colors, so blue is uniquely right. Checked length (Purple is longest), register (four plain color words) and stem echo (no color word appears in the stem).",
  },
  {
    id: "in-03", d: 1, prompt: "What do you use your eyes for?",
    options: [
      { text: "Seeing", points: 1 },
      { text: "Hearing", points: 0 },
      { text: "Smelling", points: 0 },
      { text: "Tasting", points: 0 },
    ],
    explanation: "Eyes are used for seeing.",
    reviewNote: "The three zeros are the other senses, each tied to a different body part, so a child who mixes up ears and eyes has somewhere real to go wrong. Seeing is the only sense the eyes do. Checked length (Smelling is longest), register (four ing verbs) and stem echo (eyes does not appear in any option).",
  },
  {
    id: "in-04", d: 1, prompt: "Which animal says moo?",
    options: [
      { text: "A cow", points: 1 },
      { text: "A dog", points: 0 },
      { text: "A cat", points: 0 },
      { text: "A duck", points: 0 },
    ],
    explanation: "A cow says moo.",
    reviewNote: "All four are common farm and home animals with sounds a child can name, so each zero is a live guess for a child who has not sorted the sounds yet. Only the cow says moo. Checked length (A duck is longest), register (four short animal names with the same article) and stem echo (moo appears in no option).",
  },
  // ------------------------------------------------------------------
  // d2: about age 6 to 7. Counting, everyday nature, everyday matter.
  // ------------------------------------------------------------------
  {
    id: "in-05", d: 2, prompt: "How many days are there in one week?",
    options: [
      { text: "Seven", points: 1 },
      { text: "Five", points: 0 },
      { text: "Ten", points: 0 },
      { text: "Three", points: 0 },
    ],
    explanation: "There are seven days in one week.",
    reviewNote: "Five is the count of weekdays, ten is a round guess and three is a short stretch of days, so every zero is a number a child could attach to a week. Seven is the only full count. Checked length (Seven ties Three, so the key is not the longest), register (four number words) and stem echo (no number appears in the stem).",
  },
  {
    id: "in-07", d: 2, prompt: "How many toes does a person usually have on one foot?",
    options: [
      { text: "Five", points: 1 },
      { text: "Four", points: 0 },
      { text: "Six", points: 0 },
      { text: "Ten", points: 0 },
    ],
    explanation: "A person usually has five toes on one foot.",
    reviewNote: "Ten is the count for both feet, four is what a child gets by skipping the big toe and six is a miscount, so every zero comes from a real counting error. Toes avoid the finger and thumb argument, so five is uniquely right. Checked length (Five ties Four), register (four number words) and stem echo (no option repeats a stem word).",
  },
  {
    id: "in-08", d: 2, prompt: "What do bees make in their hive?",
    options: [
      { text: "Honey", points: 1 },
      { text: "Milk", points: 0 },
      { text: "Bread", points: 0 },
      { text: "Butter", points: 0 },
    ],
    explanation: "Bees make honey in their hive.",
    reviewNote: "Milk, bread and butter are all sweet or spreadable foods from the same shelf as honey, so a child who has not connected bees to honey has three real foods to reach for. Only honey is made by bees. Checked length (Butter is longest), register (four one word foods) and stem echo (hive appears in no option).",
  },
  {
    id: "in-15", d: 2, prompt: "What is frozen water called?",
    options: [
      { text: "Ice", points: 1 },
      { text: "Steam", points: 0 },
      { text: "Fog", points: 0 },
      { text: "Rain", points: 0 },
    ],
    explanation: "Frozen water is called ice.",
    reviewNote: "Steam, fog and rain are all water wearing another form, so the three zeros are the same kind of answer as the key and none can be dropped as silly. Only ice is water that is frozen. Checked length (Steam is longest and the key is the shortest option), register (four one word water words) and stem echo (frozen and water appear in no option).",
  },
  // ------------------------------------------------------------------
  // d3: about age 7. Calendar order, the body at work, what plants need.
  // ------------------------------------------------------------------
  {
    id: "in-06", d: 3, prompt: "Which month comes right after April?",
    options: [
      { text: "May", points: 1 },
      { text: "June", points: 0 },
      { text: "March", points: 0 },
      { text: "August", points: 0 },
    ],
    explanation: "May comes right after April.",
    reviewNote: "June is one month too far, March is the month right before, and August is a spring to summer slip, so each zero is a real place in the calendar. Only May is next. Checked length (the key is the shortest option, so length cannot pick it), register (four bare month names) and stem echo (April appears in no option).",
  },
  {
    id: "in-09", d: 3, prompt: "How many months are in a year?",
    options: [
      { text: "Twelve", points: 1 },
      { text: "Ten", points: 0 },
      { text: "Six", points: 0 },
      { text: "Fifteen", points: 0 },
    ],
    explanation: "There are twelve months in a year.",
    reviewNote: "Ten is a round guess, six is half a year and fifteen overshoots, so each zero is a number a child could hold for a year. Twelve is the only true count. Checked length (Fifteen is longest), register (four number words) and stem echo (no number word sits in the stem).",
  },
  {
    id: "in-10", d: 3, prompt: "Which body part pushes blood all around your body?",
    options: [
      { text: "The heart", points: 1 },
      { text: "The lungs", points: 0 },
      { text: "The stomach", points: 0 },
      { text: "The brain", points: 0 },
    ],
    explanation: "The heart pushes blood all around the body.",
    reviewNote: "Lungs, stomach and brain are all organs a child knows and all sit in the chest or head near the heart, so each zero is a real organ guess rather than a throwaway. Only the heart pumps. Checked length (The stomach is longest), register (four the plus organ phrases) and stem echo (blood and body appear in no option).",
  },
  {
    id: "in-11", d: 3, prompt: "Besides water and soil, what do most plants need in order to grow?",
    options: [
      { text: "Sunlight", points: 1 },
      { text: "Moonlight", points: 0 },
      { text: "Starlight", points: 0 },
      { text: "Candlelight", points: 0 },
    ],
    explanation: "Most plants need sunlight, along with water and soil, to grow.",
    reviewNote: "All four options are kinds of light, so the item cannot be won by throwing out things that are not light, and moonlight is the near miss a child who thinks any light will do actually picks. Only sunlight is strong enough to feed a plant. Checked length (Candlelight is longest), register (four light compounds) and stem echo (plants and water appear in no option).",
  },
  // ------------------------------------------------------------------
  // d4: about age 7 to 8. Counting time, the body breathing, first sky facts.
  // ------------------------------------------------------------------
  {
    id: "in-13", d: 4, prompt: "How many hours are in one whole day and night?",
    options: [
      { text: "Twenty four", points: 1 },
      { text: "Twelve", points: 0 },
      { text: "Forty eight", points: 0 },
      { text: "Sixteen", points: 0 },
    ],
    explanation: "There are twenty four hours in one whole day and night.",
    reviewNote: "Twelve is the daylight half and what a clock face shows, forty eight is two days and sixteen is a waking day, so every zero is a real way to count the hours. Twenty four counts day and night together. Checked length (Forty eight ties the key, and a second option is two words so shape gives nothing away) and stem echo (no stem word sits in the key).",
  },
  {
    id: "in-14", d: 4, prompt: "Which body part fills with air when you take a deep breath?",
    options: [
      { text: "Your lungs", points: 1 },
      { text: "Your heart", points: 0 },
      { text: "Your liver", points: 0 },
      { text: "Your kidneys", points: 0 },
    ],
    explanation: "Your lungs fill with air when you take a deep breath.",
    reviewNote: "Heart, liver and kidneys are all organs inside the trunk, and the heart in particular beats faster on a deep breath, so each zero is a reason a child could believe. Only the lungs hold the air. Checked length (Your kidneys is longest), register (four your plus organ phrases) and stem echo (air and breath appear in no option).",
  },
  {
    id: "in-18", d: 4, prompt: "Which star is closest to Earth?",
    options: [
      { text: "The Sun", points: 1 },
      { text: "The North Star", points: 0 },
      { text: "The Dog Star", points: 0 },
      { text: "Alpha Centauri", points: 0 },
    ],
    explanation: "The Sun is the closest star to Earth.",
    reviewNote: "All three zeros are real stars, not moons or planets, so a child cannot win by dropping the things that are not stars: the North Star is the one she can find, the Dog Star is the brightest at night, and Alpha Centauri is the nearest star after ours. The Sun is uniquely closest. Checked length (two zeros are longer than the key, and the key is multi word beside multi word distractors) and stem echo (star and Earth appear in no option).",
  },
  {
    id: "in-22", d: 4, prompt: "Which planet is often called the red planet?",
    options: [
      { text: "Mars", points: 1 },
      { text: "Venus", points: 0 },
      { text: "Mercury", points: 0 },
      { text: "Saturn", points: 0 },
    ],
    explanation: "Mars is often called the red planet.",
    reviewNote: "Venus and Mercury are the hot close planets a child pairs with red heat, and Saturn is the other planet with a nickname, so all three zeros are real planet guesses. Mars is uniquely right because its rusty dust really looks red. Checked length (Mercury is longest), register (four planet names) and stem echo (red and planet appear in no option).",
  },
  // ------------------------------------------------------------------
  // d5: about age 8 to 9. Superlatives and named forces.
  // ------------------------------------------------------------------
  {
    id: "in-12", d: 5, prompt: "Which is the largest planet in our solar system?",
    options: [
      { text: "Jupiter", points: 1 },
      { text: "Saturn", points: 0 },
      { text: "Neptune", points: 0 },
      { text: "Mercury", points: 0 },
    ],
    explanation: "Jupiter is the largest planet in our solar system.",
    reviewNote: "Saturn is the true near miss because it is the second largest and looks biggest with its rings, Neptune is the far giant and Mercury is the smallest, which is the mirror error. Jupiter is uniquely largest. Checked length (Neptune and Mercury tie the key), register (four planet names) and stem echo (largest and planet appear in no option).",
  },
  {
    id: "in-16", d: 5, prompt: "Which ocean is the largest on Earth?",
    options: [
      { text: "The Pacific Ocean", points: 1 },
      { text: "The Atlantic Ocean", points: 0 },
      { text: "The Indian Ocean", points: 0 },
      { text: "The Arctic Ocean", points: 0 },
    ],
    explanation: "The Pacific Ocean is the largest ocean on Earth.",
    reviewNote: "All three zeros are real oceans, and the Atlantic is the one a child on the Rhode Island coast knows best, so the item cannot be won by category. The Pacific is uniquely the largest. Checked length (The Atlantic Ocean is longer than the key), register (four the plus ocean names) and stem echo (ocean sits in every option, not just the key).",
  },
  {
    id: "in-19", d: 5, prompt: "Which gas in the air do our bodies need in order to stay alive?",
    options: [
      { text: "Oxygen", points: 1 },
      { text: "Nitrogen", points: 0 },
      { text: "Hydrogen", points: 0 },
      { text: "Helium", points: 0 },
    ],
    explanation: "Our bodies need oxygen from the air to stay alive.",
    reviewNote: "All four are gases, and nitrogen is the strongest near miss because there is far more of it in the air, which is a separate item asked a different way further up the ramp. Only oxygen is the gas the body uses. Checked length (Nitrogen and Hydrogen beat the key), register (four gas names) and stem echo (gas and alive appear in no option).",
  },
  {
    id: "in-26", d: 5, prompt: "Which force pulls a dropped ball down toward the ground?",
    options: [
      { text: "Gravity", points: 1 },
      { text: "Friction", points: 0 },
      { text: "Magnetism", points: 0 },
      { text: "Pressure", points: 0 },
    ],
    explanation: "Gravity pulls a dropped ball down toward the ground.",
    reviewNote: "Friction, magnetism and pressure are all named forces a child has heard of, and magnetism in particular is the pulling force she can feel in her hand, so every zero is a real candidate. Only gravity pulls everything down. Checked length (Magnetism is longest), register (four force nouns) and stem echo (force and ground appear in no option).",
  },
  // ------------------------------------------------------------------
  // d6: about age 9. Named fields, named places, what runs the body,
  // and the first sorting of animals into groups.
  // ------------------------------------------------------------------
  {
    id: "in-17", d: 6, prompt: "What is the capital city of the United States?",
    options: [
      { text: "Washington DC", points: 1 },
      { text: "New York City", points: 0 },
      { text: "Philadelphia", points: 0 },
      { text: "Boston", points: 0 },
    ],
    explanation: "Washington DC is the capital city of the United States.",
    reviewNote: "Every zero is a real United States city with a real claim: New York is the biggest and was an early capital, Philadelphia is where the country was founded, and Boston is the big city nearest her. Only Washington DC is the capital now. Checked length (New York City ties the key and a second option is multi word), register (four city names) and stem echo (capital and city appear in no option).",
  },
  {
    id: "in-20", d: 6, prompt: "Which organ sends messages to the rest of the body through the nerves?",
    options: [
      { text: "The brain", points: 1 },
      { text: "The heart", points: 0 },
      { text: "The liver", points: 0 },
      { text: "The stomach", points: 0 },
    ],
    explanation: "The brain sends messages to the rest of the body through the nerves.",
    reviewNote: "The heart is the classic near miss because we talk about feeling things with our heart and it races when we are scared, the stomach is where nerves give us butterflies, and the liver is the fourth big organ a child can name. Only the brain is the sender, and asking about nerves rather than thinking raises the demand past naming the thinking organ. Checked length (The stomach is longest), register (four the plus organ phrases) and stem echo (messages and nerves appear in no option).",
  },
  {
    id: "in-23", d: 6, prompt: "What do we call the study of living things?",
    options: [
      { text: "Biology", points: 1 },
      { text: "Geology", points: 0 },
      { text: "Astronomy", points: 0 },
      { text: "Chemistry", points: 0 },
    ],
    explanation: "Biology is the study of living things.",
    reviewNote: "Geology, astronomy and chemistry are the three sciences a child is most likely to have heard named beside biology, and geology shares the ology ending so the shape of the word gives nothing away. Only biology is about living things. Checked length (Astronomy ties Chemistry and both beat the key), register (four science names) and stem echo (study and living appear in no option).",
  },
  {
    id: "in-34", d: 6, prompt: "What do we call an animal that eats both plants and meat?",
    options: [
      { text: "Omnivore", points: 1 },
      { text: "Herbivore", points: 0 },
      { text: "Carnivore", points: 0 },
      { text: "Decomposer", points: 0 },
    ],
    explanation: "An animal that eats both plants and meat is called an omnivore.",
    reviewNote: "Herbivore and carnivore are the halves of the answer, one for each word in the stem, and decomposer is the fourth feeding group, so all three zeros come from the same chart. The articles are dropped from all four options so that the key is not the only one starting with An. Checked length (Decomposer is longest), register (four bare feeding group nouns) and stem echo (plants and animal appear in no option).",
  },
  // ------------------------------------------------------------------
  // d7: about age 9 to 10. Exact numbers, materials, map lines, first history.
  // ------------------------------------------------------------------
  {
    id: "in-21", d: 7, prompt: "Which natural material is the hardest of all?",
    options: [
      { text: "Diamond", points: 1 },
      { text: "Quartz", points: 0 },
      { text: "Granite", points: 0 },
      { text: "Marble", points: 0 },
    ],
    explanation: "Diamond is the hardest natural material of all.",
    reviewNote: "All four are natural minerals and rocks, so nothing can be dropped for being manufactured, and quartz is the true near miss because it is the hard mineral that scratches glass. Diamond is uniquely the hardest. Checked length (Granite ties the key), register (four rock and mineral names) and stem echo (natural and material appear in no option).",
  },
  {
    id: "in-24", d: 7, prompt: "About how many bones are in a grown up person's body?",
    options: [
      { text: "Two hundred six", points: 1 },
      { text: "One hundred six", points: 0 },
      { text: "Three hundred twelve", points: 0 },
      { text: "One hundred sixty", points: 0 },
    ],
    explanation: "A grown up person's body has about two hundred six bones.",
    reviewNote: "Every option is an odd looking count, not a round number beside one exact one, so the key cannot be spotted by shape: one hundred six is half a memory of the real number, three hundred twelve is closer to a baby's count and sixty four is a low guess. Two hundred six is the taught number. Checked length (Three hundred twelve is longest) and stem echo (bones and body appear in no option).",
  },
  {
    id: "in-37", d: 7, prompt: "What do we call the imaginary line around the middle of the Earth?",
    options: [
      { text: "The equator", points: 1 },
      { text: "The North Pole", points: 0 },
      { text: "The horizon", points: 0 },
      { text: "The axis", points: 0 },
    ],
    explanation: "The imaginary line around the middle of the Earth is called the equator.",
    reviewNote: "Every zero is something a globe really shows: the North Pole is the marked point at the top, the axis is the line drawn through the middle of the globe, and the horizon is the line she can see outdoors. Only the equator runs around the middle. Checked length (The North Pole is longer than the key), register (four the plus geography terms) and stem echo (imaginary and middle appear in no option).",
  },
  {
    id: "in-50", d: 7, prompt: "Which ancient people built the great pyramids at Giza?",
    options: [
      { text: "The Egyptians", points: 1 },
      { text: "The Babylonians", points: 0 },
      { text: "The Romans", points: 0 },
      { text: "The Aztecs", points: 0 },
    ],
    explanation: "The ancient Egyptians built the great pyramids at Giza.",
    reviewNote: "Every zero is an ancient people who built huge stone monuments: the Babylonians raised stepped ziggurats and the Aztecs built pyramids of their own, so the category cannot be used to eliminate. Giza pins the answer to Egypt alone. Checked length (The Babylonians is longer than the key), register (four the plus people names) and stem echo (ancient and pyramids appear in no option).",
  },
  // ------------------------------------------------------------------
  // d8: about age 10. Causes, named people, and where the water goes.
  // ------------------------------------------------------------------
  {
    id: "in-30", d: 8, prompt: "Who is remembered as the first person to walk on the Moon?",
    options: [
      { text: "Neil Armstrong", points: 1 },
      { text: "Buzz Aldrin", points: 0 },
      { text: "Yuri Gagarin", points: 0 },
      { text: "Michael Collins", points: 0 },
    ],
    explanation: "Neil Armstrong is remembered as the first person to walk on the Moon.",
    reviewNote: "All three zeros are astronauts, and each is a genuine confusion: Aldrin walked on the Moon minutes later, Collins flew the same mission but stayed in orbit, and Gagarin was first into space. Armstrong alone stepped out first. Checked length (Michael Collins is longer than the key), register (four astronaut names) and stem echo (person and Moon appear in no option).",
  },
  {
    id: "in-43", d: 8, prompt: "Which body part takes waste out of the blood and turns it into urine?",
    options: [
      { text: "The kidneys", points: 1 },
      { text: "The bladder", points: 0 },
      { text: "The liver", points: 0 },
      { text: "The lungs", points: 0 },
    ],
    explanation: "The kidneys take waste out of the blood and turn it into urine.",
    reviewNote: "Every zero really does handle waste: the bladder stores the urine once it is made, the liver cleans the blood of other wastes and the lungs carry away waste gas, so all three are near misses instead of unrelated organs. Only the kidneys make the urine. Checked length (The bladder ties the key), register (mixed singular and plural across options so number is no cue) and stem echo (waste, blood and urine appear in no option).",
  },
  {
    id: "in-48", d: 8, prompt: "You see a flash of lightning before you hear the thunder. Why?",
    options: [
      { text: "Light travels faster than sound", points: 1 },
      { text: "Sound travels faster than light", points: 0 },
      { text: "The thunder starts later than the lightning", points: 0 },
      { text: "Your eyes work faster than your ears", points: 0 },
    ],
    explanation: "Light travels much faster than sound, so the flash reaches you before the noise does.",
    reviewNote: "All four are explanations a real child gives: the reversed speed claim, the belief that the bang happens afterward, and the belief that eyes are quicker than ears. Only the speed of light answer is true, and the reversed one is written in the same words so wording gives nothing away. Checked length (two zeros are longer than the key), register (four full clauses) and stem echo (lightning and thunder appear only in zeros, never only in the key).",
  },
  {
    id: "in-52", d: 8, prompt: "What do we call it when a puddle slowly dries up and its water goes into the air?",
    options: [
      { text: "Evaporation", points: 1 },
      { text: "Condensation", points: 0 },
      { text: "Precipitation", points: 0 },
      { text: "Absorption", points: 0 },
    ],
    explanation: "Evaporation is when a liquid slowly turns into a gas and goes into the air.",
    reviewNote: "All four are water cycle words, and condensation is the true near miss because it is the same change running backward, while absorption is what a child picks who thinks the ground drank the puddle. Only evaporation sends the water up as gas. Checked length (Precipitation is longest), register (four process nouns) and stem echo (puddle and water appear in no option).",
  },
  // ------------------------------------------------------------------
  // d9: about age 10 to 11. Named processes, chemical notation, and
  // geography that has to be read off a map rather than recalled.
  // ------------------------------------------------------------------
  {
    id: "in-25", d: 9, prompt: "What is the process that green plants use to make their own food?",
    options: [
      { text: "Photosynthesis", points: 1 },
      { text: "Respiration", points: 0 },
      { text: "Crystallization", points: 0 },
      { text: "Decomposition", points: 0 },
    ],
    explanation: "Photosynthesis is the process green plants use to make their own food.",
    reviewNote: "Respiration is the strongest near miss because plants do it too, and decomposition and crystallization are the other long science process words a child has met, so the key is not the only technical term on the screen. Only photosynthesis makes the food. Checked length (Crystallization is longer than the key), register (four process nouns) and stem echo (process and plants appear in no option).",
  },
  {
    id: "in-32", d: 9, prompt: "Which continent lies just south of Europe, across the Mediterranean Sea?",
    options: [
      { text: "Africa", points: 1 },
      { text: "Asia", points: 0 },
      { text: "South America", points: 0 },
      { text: "Antarctica", points: 0 },
    ],
    explanation: "Africa lies just south of Europe, across the Mediterranean Sea.",
    reviewNote: "All four are continents, so category is no help: Asia is the neighbor on the other side of Europe, Antarctica is the far southern one and South America is the one whose name says south. Only Africa faces Europe across that sea. Checked length (South America is more than twice the key), register (four continent names) and stem echo (south sits in a zero option, not only in the key).",
  },
  {
    id: "in-36", d: 9, prompt: "What is the name for the path a planet takes around the Sun?",
    options: [
      { text: "An orbit", points: 1 },
      { text: "A rotation", points: 0 },
      { text: "An axis", points: 0 },
      { text: "An eclipse", points: 0 },
    ],
    explanation: "The path a planet takes around the Sun is called an orbit.",
    reviewNote: "Rotation is the true near miss because it is the planet's other motion, the axis is the line it spins about, and an eclipse is the other event a child links to planets lining up. Only orbit names the path around the Sun. Checked length (A rotation ties An eclipse and both beat the key), register (four astronomy nouns) and stem echo (planet and around appear in no option).",
  },
  {
    id: "in-42", d: 9, prompt: "What is the chemical formula for water?",
    options: [
      { text: "H2O", points: 1 },
      { text: "CO2", points: 0 },
      { text: "O2", points: 0 },
      { text: "CH4", points: 0 },
    ],
    explanation: "The chemical formula for water is H2O, which is two hydrogen atoms and one oxygen atom.",
    reviewNote: "All four are real formulas of everyday substances and all four read aloud cleanly letter by letter: CO2 is the gas we breathe out, O2 is the gas we breathe in and CH4 is the methane that burns in a gas stove. Only H2O is water itself. Checked length (all four options are two or three characters), register (four chemical formulas) and stem echo (water and formula appear in no option).",
  },
  // ------------------------------------------------------------------
  // d10: about age 11. Naming the unit, the center and the exception.
  // ------------------------------------------------------------------
  {
    id: "in-28", d: 10, prompt: "What is the center of an atom called?",
    options: [
      { text: "The nucleus", points: 1 },
      { text: "The proton", points: 0 },
      { text: "The neutron", points: 0 },
      { text: "The electron", points: 0 },
    ],
    explanation: "The center of an atom is called the nucleus.",
    reviewNote: "The three zeros are the three particles of an atom, and protons and neutrons really do sit in the center, so they are the sharpest possible near misses rather than words from another subject. Only nucleus names the center itself. Checked length (The electron is longer than the key), register (four the plus atom terms) and stem echo (center and atom appear in no option).",
  },
  {
    id: "in-31", d: 10, prompt: "Which mountain range runs down the western side of South America?",
    options: [
      { text: "The Andes", points: 1 },
      { text: "The Alps", points: 0 },
      { text: "The Rockies", points: 0 },
      { text: "The Himalayas", points: 0 },
    ],
    explanation: "The Andes run down the western side of South America.",
    reviewNote: "All four are famous mountain ranges, and the Rockies are the sharpest near miss because they run down the western side of the other American continent. Only the Andes are in South America. Checked length (The Himalayas and The Rockies both beat the key), register (four the plus range names) and stem echo (mountain and America appear in no option).",
  },
  {
    id: "in-39", d: 10, prompt: "What is the smallest living unit that every plant and animal is built from?",
    options: [
      { text: "A cell", points: 1 },
      { text: "A tissue", points: 0 },
      { text: "An organ", points: 0 },
      { text: "A molecule", points: 0 },
    ],
    explanation: "A cell is the smallest living unit that plants and animals are built from.",
    reviewNote: "Tissue and organ are the next two steps up the same ladder and a molecule is the step down, so all three zeros come from the same list and the word living is what rules the molecule out. Only the cell is both smallest and alive. Checked length (A molecule is twice the key), register (four biology level nouns) and stem echo (smallest and living appear in no option).",
  },
  {
    id: "in-41", d: 10, prompt: "What is the smallest prime number?",
    options: [
      { text: "Two", points: 1 },
      { text: "One", points: 0 },
      { text: "Three", points: 0 },
      { text: "Zero", points: 0 },
    ],
    explanation: "Two is the smallest prime number. One is not counted as a prime.",
    reviewNote: "One is the answer of every child who thinks smallest means first, zero is the answer of a child who thinks smallest means lowest, and three is the smallest odd prime, which is the trap for a child who believes primes must be odd. Only two fits the definition. Checked length (Three is longest), register (four number words) and stem echo (prime and smallest appear in no option).",
  },
  // ------------------------------------------------------------------
  // d11: about age 11 to 12. The whole versus its parts, proportions,
  // how materials behave, and history with a date on it.
  // ------------------------------------------------------------------
  {
    id: "in-27", d: 11, prompt: "Which gas makes up about four fifths of the air by volume?",
    options: [
      { text: "Nitrogen", points: 1 },
      { text: "Oxygen", points: 0 },
      { text: "Argon", points: 0 },
      { text: "Carbon dioxide", points: 0 },
    ],
    explanation: "Nitrogen makes up about four fifths of the air by volume.",
    reviewNote: "Oxygen is the near miss almost every child picks because it is the gas we need, argon is the third gas of the air and carbon dioxide is the one they hear about most, so all three are genuinely in the air. The stem asks about amount, not usefulness, so nitrogen is uniquely right. Checked length (Carbon dioxide is much longer than the key), register (four gas names) and stem echo (air and volume appear in no option).",
  },
  {
    id: "in-33", d: 11, prompt: "What is the name of the whole layer of gases that surrounds the Earth?",
    options: [
      { text: "The atmosphere", points: 1 },
      { text: "The stratosphere", points: 0 },
      { text: "The troposphere", points: 0 },
      { text: "The ozone layer", points: 0 },
    ],
    explanation: "The whole layer of gases that surrounds the Earth is called the atmosphere.",
    reviewNote: "Every zero is a real part of that blanket of gas, so the item asks for the whole rather than a piece: the troposphere is the part we live in, the stratosphere is where planes fly and the ozone layer is the part that blocks sunburn. Only atmosphere names all of it. Checked length (The stratosphere is longer than the key), register (four the plus air layer terms) and stem echo (layer sits in a zero option too, and gases appears in none).",
  },
  {
    id: "in-44", d: 11, prompt: "Which ship carried the Pilgrims to America in the year 1620?",
    options: [
      { text: "The Mayflower", points: 1 },
      { text: "The Santa Maria", points: 0 },
      { text: "The Titanic", points: 0 },
      { text: "The Endeavour", points: 0 },
    ],
    explanation: "The Mayflower carried the Pilgrims to America in 1620.",
    reviewNote: "All four are famous ships that crossed an ocean: the Santa Maria sailed for Columbus, the Endeavour carried Captain Cook and the Titanic is the ship every child has heard of. Only the Mayflower carried the Pilgrims. Checked length (The Santa Maria is longer than the key), register (four the plus ship names) and stem echo (Pilgrims and America appear in no option).",
  },
  {
    id: "in-49", d: 11, prompt: "What do we call a material that lets electricity flow through it easily?",
    options: [
      { text: "A conductor", points: 1 },
      { text: "An insulator", points: 0 },
      { text: "A resistor", points: 0 },
      { text: "A magnet", points: 0 },
    ],
    explanation: "A material that lets electricity flow through it easily is called a conductor.",
    reviewNote: "Three of the four options describe how easily current passes, so the item is a graded choice and not a coin flip: an insulator blocks the current, a resistor slows it down and a magnet is the electrical word a child reaches for when she is unsure. Only conductor means it passes easily. Checked length (An insulator is longer than the key), register (four electricity nouns) and stem echo (material and electricity appear in no option).",
  },
  // ------------------------------------------------------------------
  // d12: about age 12. Instruments, cells, machines and where gases go.
  // ------------------------------------------------------------------
  {
    id: "in-29", d: 12, prompt: "Which gas do plants take in from the air when they make their food?",
    options: [
      { text: "Carbon dioxide", points: 1 },
      { text: "Water vapor", points: 0 },
      { text: "Nitrogen", points: 0 },
      { text: "Oxygen", points: 0 },
    ],
    explanation: "Plants take in carbon dioxide from the air to make their food.",
    reviewNote: "Oxygen is the trap because plants really do take oxygen in when they breathe, so the stem is pinned to food making; water vapor is in the air and water is needed too, and nitrogen is what plants take from the soil. Only carbon dioxide is the food gas. Checked length (the key is the longest here, which is why a second multi word option sits beside it) and stem echo (gas and plants appear in no option).",
  },
  {
    id: "in-35", d: 12, prompt: "A screw is really which simple machine, wrapped around and around a post?",
    options: [
      { text: "Inclined plane", points: 1 },
      { text: "Wheel and axle", points: 0 },
      { text: "Pulley", points: 0 },
      { text: "Lever", points: 0 },
    ],
    explanation: "A screw is an inclined plane wrapped around and around a post.",
    reviewNote: "All four are simple machines from the same list, and the wheel and axle is the sharpest near miss because a screw does turn in a circle, while the pulley and the lever are the two machines a child names first. Only the inclined plane is the ramp that is wound around the post, and the item now asks her to see one machine hidden inside another instead of matching a machine to its own description. The articles are dropped from all four options so that the key is not the only one needing An. Checked length (the key is one character longer than the wheel and axle, which is not a usable cue) and stem echo (screw and machine appear in no option).",
  },
  {
    id: "in-46", d: 12, prompt: "Which cells in the body attack germs and fight infection?",
    options: [
      { text: "White blood cells", points: 1 },
      { text: "Red blood cells", points: 0 },
      { text: "Bone marrow cells", points: 0 },
      { text: "Nerve cells", points: 0 },
    ],
    explanation: "White blood cells attack germs and fight infection.",
    reviewNote: "Every zero is a real cell type with a real claim: red blood cells are the other blood cell, bone marrow cells are where blood cells are made and nerve cells carry the alarm signals. Only white blood cells do the attacking. Checked length (Bone marrow cells ties the key), register (four cell type phrases, all multi word) and stem echo (cells sits in every option, not only the key).",
  },
  {
    id: "in-47", d: 12, prompt: "What instrument is used to measure air pressure?",
    options: [
      { text: "A barometer", points: 1 },
      { text: "A thermometer", points: 0 },
      { text: "An odometer", points: 0 },
      { text: "A stethoscope", points: 0 },
    ],
    explanation: "A barometer measures air pressure.",
    reviewNote: "All four are measuring instruments and three of them end in meter, so the ending cannot be used to find the key: a thermometer measures the weather too, an odometer measures distance and a stethoscope is the instrument she has seen used on her. Only a barometer reads pressure. Checked length (A thermometer ties A stethoscope and both beat the key), register (four instrument names) and stem echo (instrument and pressure appear in no option).",
  },
  // ------------------------------------------------------------------
  // d13: about age 12 to 13. Middle school science and map work.
  // ------------------------------------------------------------------
  {
    id: "in-40", d: 13, prompt: "What do we call energy sources such as coal and oil, which formed from living things that died long ago?",
    options: [
      { text: "Fossil fuels", points: 1 },
      { text: "Nuclear fuels", points: 0 },
      { text: "Mineral fuels", points: 0 },
      { text: "Biofuels", points: 0 },
    ],
    explanation: "Coal and oil are called fossil fuels because they formed from living things that died long ago.",
    reviewNote: "All four options are fuels, so the field is not halved into fuels against power sources: biofuels are the sharp near miss because they do come from living things but living things alive today, nuclear fuel is dug out of the ground but never lived, and mineral fuel sounds right until you remember a mineral was never alive. Only fossil fuels are made of ancient life. Checked length (Nuclear fuels and Mineral fuels tie and both beat the key), register (four fuel names) and stem echo (energy and living appear in no option).",
  },
  {
    id: "in-51", d: 13, prompt: "Which gas makes up most of the Sun?",
    options: [
      { text: "Hydrogen", points: 1 },
      { text: "Helium", points: 0 },
      { text: "Nitrogen", points: 0 },
      { text: "Oxygen", points: 0 },
    ],
    explanation: "The Sun is made mostly of hydrogen.",
    reviewNote: "Helium is the real near miss because it is the second most common gas in the Sun and it was found in sunlight first, while nitrogen and oxygen are the two gases a child assumes are everywhere because they are in our air. Only hydrogen is most of the Sun. Checked length (Nitrogen ties the key), register (four gas names) and stem echo (gas and Sun appear in no option).",
  },
  {
    id: "in-53", d: 13, prompt: "What do we call a body feature that helps an animal survive where it lives, such as a polar bear's thick fur?",
    options: [
      { text: "An adaptation", points: 1 },
      { text: "A migration", points: 0 },
      { text: "An inheritance", points: 0 },
      { text: "A hibernation", points: 0 },
    ],
    explanation: "A body feature that helps an animal survive where it lives is called an adaptation.",
    reviewNote: "Every zero is a real biology word about surviving a hard place: migration and hibernation are how other animals get through winter, and inheritance is how the fur was passed down. The stem asks for a body feature, so adaptation is uniquely right. Checked length (An inheritance is longer than the key), register (four biology nouns) and stem echo (animal and survive appear in no option).",
  },
  {
    id: "in-56", d: 13, prompt: "Which imaginary line on a globe is at zero degrees longitude?",
    options: [
      { text: "The Prime Meridian", points: 1 },
      { text: "The Tropic of Cancer", points: 0 },
      { text: "The Arctic Circle", points: 0 },
      { text: "The International Date Line", points: 0 },
    ],
    explanation: "The Prime Meridian is the line at zero degrees longitude.",
    reviewNote: "All four are named lines printed on a globe and all four are capitalized the same way, so neither category nor style picks the key: the International Date Line is the other line that runs pole to pole, and the Tropic of Cancer and the Arctic Circle are the named lines that circle the globe the other way. Only the Prime Meridian is at zero longitude. Checked length (two zeros are longer than the key), register (four the plus map line names) and stem echo (imaginary and degrees appear in no option).",
  },
  // ------------------------------------------------------------------
  // d14: about age 13. Fine distinctions inside a topic.
  // ------------------------------------------------------------------
  {
    id: "in-45", d: 14, prompt: "Which galaxy is the nearest large galaxy to our own?",
    options: [
      { text: "The Andromeda Galaxy", points: 1 },
      { text: "The Milky Way Galaxy", points: 0 },
      { text: "The Whirlpool Galaxy", points: 0 },
      { text: "The Sombrero Galaxy", points: 0 },
    ],
    explanation: "The Andromeda Galaxy is the nearest large galaxy to our own Milky Way.",
    reviewNote: "The Milky Way is the galaxy every child can name, and here it is a zero, because our own galaxy cannot be the nearest one to itself: a child has to know which galaxy is ours before she can answer. The Whirlpool and the Sombrero are the other galaxies pictured in books. Only Andromeda is the nearest large neighbor. Checked length (The Milky Way Galaxy ties the key), register (four the plus name plus Galaxy) and stem echo (galaxy sits in every option, not only the key).",
  },
  {
    id: "in-54", d: 14, prompt: "Which parts of a cell release energy from food and are often called the powerhouses of the cell?",
    options: [
      { text: "The mitochondria", points: 1 },
      { text: "The chloroplasts", points: 0 },
      { text: "The ribosomes", points: 0 },
      { text: "The vacuoles", points: 0 },
    ],
    explanation: "The mitochondria release energy from food, so they are called the powerhouses of the cell.",
    reviewNote: "All four are parts of a cell, all four are written in the plural to match a plural stem, and the chloroplasts are the sharpest near miss because they are the other part that handles energy, while ribosomes build proteins and vacuoles store what the cell keeps. Only the mitochondria release energy from food. Checked length (The chloroplasts ties the key), register (four the plus plural cell part names) and stem echo (energy and powerhouses appear in no option).",
  },
  {
    id: "in-55", d: 14, prompt: "What is molten rock called after it erupts out of a volcano?",
    options: [
      { text: "Lava", points: 1 },
      { text: "Magma", points: 0 },
      { text: "Ash", points: 0 },
      { text: "Granite", points: 0 },
    ],
    explanation: "Molten rock is called magma while it is underground and lava once it erupts out of a volcano.",
    reviewNote: "Magma is the same stuff before it comes out, which makes it the near miss the whole item is built around, while ash and granite are the other two things a volcano throws out or leaves behind. Only lava is the name used after the eruption. Checked length (Granite is longest and the key is short), register (four rock nouns) and stem echo (molten and volcano appear in no option).",
  },
  {
    id: "in-59", d: 14, prompt: "In which body system are the trachea and the bronchi found?",
    options: [
      { text: "The respiratory system", points: 1 },
      { text: "The digestive system", points: 0 },
      { text: "The circulatory system", points: 0 },
      { text: "The nervous system", points: 0 },
    ],
    explanation: "The trachea and the bronchi are the tubes that carry air, so they belong to the respiratory system.",
    reviewNote: "All four are body systems, and each zero is a real confusion: the digestive tube runs right beside the trachea in the throat, the circulatory system reaches the same organs and the nervous system controls the whole thing. Only the respiratory system owns those tubes. Checked length (The circulatory system is longer than the key), register (four the plus system names) and stem echo (system sits in every option, not only the key).",
  },
  // ------------------------------------------------------------------
  // d15: about age 13 to 14, the top of the ramp. Named theories, the
  // chemistry of life, optics, and middle school civics.
  // ------------------------------------------------------------------
  {
    id: "in-38", d: 15, prompt: "Which scientist is best known for the theory of evolution by natural selection?",
    options: [
      { text: "Charles Darwin", points: 1 },
      { text: "Isaac Newton", points: 0 },
      { text: "Albert Einstein", points: 0 },
      { text: "Marie Curie", points: 0 },
    ],
    explanation: "Charles Darwin is best known for the theory of evolution by natural selection.",
    reviewNote: "All three zeros are famous scientists with a famous theory of their own, so a child cannot pick out the only scientist on the list: Newton for gravity, Einstein for relativity and Curie for radioactivity. Only Darwin is tied to natural selection. Checked length (Albert Einstein is longer than the key), register (four full scientist names) and stem echo (scientist and evolution appear in no option).",
  },
  {
    id: "in-57", d: 15, prompt: "Which element forms the backbone of the large molecules in every living thing?",
    options: [
      { text: "Carbon", points: 1 },
      { text: "Sulfur", points: 0 },
      { text: "Hydrogen", points: 0 },
      { text: "Phosphorus", points: 0 },
    ],
    explanation: "Carbon forms the backbone of the large molecules in every living thing.",
    reviewNote: "All four elements are genuinely in living things, so none can be dropped as irrelevant: hydrogen is the most numerous atom, sulfur is what holds a protein folded into shape and phosphorus holds DNA together. Only carbon links into the long chains the molecules are built on. Checked length (Phosphorus is longest, Sulfur ties the key), register (four element names) and stem echo (element and living appear in no option).",
  },
  {
    id: "in-58", d: 15, prompt: "What do we call the bending of light as it passes from air into water?",
    options: [
      { text: "Refraction", points: 1 },
      { text: "Reflection", points: 0 },
      { text: "Radiation", points: 0 },
      { text: "Rotation", points: 0 },
    ],
    explanation: "Refraction is the bending of light as it passes from air into water.",
    reviewNote: "All four begin with the same letter and have the same rhythm, so sound gives nothing away, and reflection is the true near miss because it is the other thing light does at the surface of water. Only refraction is the bending as light passes through. Checked length (Reflection ties the key), register (four physics nouns) and stem echo (bending and light appear in no option).",
  },
  {
    id: "in-60", d: 15, prompt: "Which famous American document begins with the words We the People?",
    options: [
      { text: "The Constitution", points: 1 },
      { text: "The Bill of Rights", points: 0 },
      { text: "The Gettysburg Address", points: 0 },
      { text: "The Declaration of Independence", points: 0 },
    ],
    explanation: "The Constitution of the United States begins with the words We the People.",
    reviewNote: "Every zero is a famous American document of the same kind and two of them are closely tied to the key: the Bill of Rights is the first ten changes made to it, the Declaration is the older founding paper and the Gettysburg Address is the speech that echoes it. Only the Constitution opens with those words. Checked length (The Declaration of Independence is nearly twice the key), register (four the plus document names) and stem echo (document and famous appear in no option).",
  },
];
