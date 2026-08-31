import type { ChoiceBankItem } from "../../../bankGenre";

// Original general knowledge questions: body, calendar and time, animals,
// earth and sky, simple science, geography, and famous firsts. Widely taught
// facts only, age ramped from d1 (about age 6) through d10 (about age 13).
export const INFORMATION_BANK: ChoiceBankItem[] = [
  // d1: age 6
  {
    id: "in-01", d: 1, prompt: "How many legs does a dog have?",
    options: [
      { text: "Four", points: 1 },
      { text: "Two", points: 0 },
      { text: "Six", points: 0 },
      { text: "Eight", points: 0 },
    ],
    explanation: "A dog has four legs.",
  },
  {
    id: "in-02", d: 1, prompt: "What color is the sky on a clear day?",
    options: [
      { text: "Blue", points: 1 },
      { text: "Green", points: 0 },
      { text: "Purple", points: 0 },
      { text: "Brown", points: 0 },
    ],
    explanation: "The sky looks blue on a clear day.",
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
  },
  // d2: age 6
  {
    id: "in-05", d: 2, prompt: "How many days are in a week?",
    options: [
      { text: "Seven", points: 1 },
      { text: "Five", points: 0 },
      { text: "Ten", points: 0 },
      { text: "Three", points: 0 },
    ],
    explanation: "There are seven days in a week.",
  },
  {
    id: "in-06", d: 2, prompt: "What season comes after winter?",
    options: [
      { text: "Spring", points: 1 },
      { text: "Summer", points: 0 },
      { text: "Fall", points: 0 },
      { text: "Winter", points: 0 },
    ],
    explanation: "Spring comes after winter.",
  },
  {
    id: "in-07", d: 2, prompt: "How many fingers does a person usually have on one hand?",
    options: [
      { text: "Five", points: 1 },
      { text: "Four", points: 0 },
      { text: "Six", points: 0 },
      { text: "Three", points: 0 },
    ],
    explanation: "A person usually has five fingers on one hand.",
  },
  {
    id: "in-08", d: 2, prompt: "What do bees make?",
    options: [
      { text: "Honey", points: 1 },
      { text: "Milk", points: 0 },
      { text: "Bread", points: 0 },
      { text: "Butter", points: 0 },
    ],
    explanation: "Bees make honey.",
  },
  // d3: age 7 to 8
  {
    id: "in-09", d: 3, prompt: "How many months are in a year?",
    options: [
      { text: "Twelve", points: 1 },
      { text: "Ten", points: 0 },
      { text: "Six", points: 0 },
      { text: "Fifteen", points: 0 },
    ],
    explanation: "There are twelve months in a year.",
  },
  {
    id: "in-10", d: 3, prompt: "Which part of the body pumps blood?",
    options: [
      { text: "The heart", points: 1 },
      { text: "The lungs", points: 0 },
      { text: "The stomach", points: 0 },
      { text: "The brain", points: 0 },
    ],
    explanation: "The heart pumps blood through the body.",
  },
  {
    id: "in-11", d: 3, prompt: "What do plants need to grow, along with water and soil?",
    options: [
      { text: "Sunlight", points: 1 },
      { text: "Salt", points: 0 },
      { text: "Sand", points: 0 },
      { text: "Ice", points: 0 },
    ],
    explanation: "Plants need sunlight, along with water and soil, to grow.",
  },
  {
    id: "in-12", d: 3, prompt: "What is the largest planet in our solar system?",
    options: [
      { text: "Jupiter", points: 1 },
      { text: "Mars", points: 0 },
      { text: "Mercury", points: 0 },
      { text: "Venus", points: 0 },
    ],
    explanation: "Jupiter is the largest planet in our solar system.",
  },
  // d4: age 7 to 8
  {
    id: "in-13", d: 4, prompt: "How many hours are in one day?",
    options: [
      { text: "Twenty four", points: 1 },
      { text: "Twelve", points: 0 },
      { text: "Thirty", points: 0 },
      { text: "Sixty", points: 0 },
    ],
    explanation: "There are twenty four hours in one day.",
  },
  {
    id: "in-14", d: 4, prompt: "Which body part do you use to breathe?",
    options: [
      { text: "Your lungs", points: 1 },
      { text: "Your liver", points: 0 },
      { text: "Your bones", points: 0 },
      { text: "Your skin", points: 0 },
    ],
    explanation: "You use your lungs to breathe.",
  },
  {
    id: "in-15", d: 4, prompt: "What is frozen water called?",
    options: [
      { text: "Ice", points: 1 },
      { text: "Steam", points: 0 },
      { text: "Fog", points: 0 },
      { text: "Rain", points: 0 },
    ],
    explanation: "Frozen water is called ice.",
  },
  {
    id: "in-16", d: 4, prompt: "Which ocean is the largest on Earth?",
    options: [
      { text: "The Pacific Ocean", points: 1 },
      { text: "The Atlantic Ocean", points: 0 },
      { text: "The Indian Ocean", points: 0 },
      { text: "The Arctic Ocean", points: 0 },
    ],
    explanation: "The Pacific Ocean is the largest ocean on Earth.",
  },
  // d5: age 9 to 10
  {
    id: "in-17", d: 5, prompt: "How many continents are there on Earth?",
    options: [
      { text: "Seven", points: 1 },
      { text: "Five", points: 0 },
      { text: "Nine", points: 0 },
      { text: "Twelve", points: 0 },
    ],
    explanation: "There are seven continents on Earth.",
  },
  {
    id: "in-18", d: 5, prompt: "What is the closest star to Earth?",
    options: [
      { text: "The Sun", points: 1 },
      { text: "The Moon", points: 0 },
      { text: "Mars", points: 0 },
      { text: "A comet", points: 0 },
    ],
    explanation: "The Sun is the closest star to Earth.",
  },
  {
    id: "in-19", d: 5, prompt: "What gas do people need to breathe to stay alive?",
    options: [
      { text: "Oxygen", points: 1 },
      { text: "Helium", points: 0 },
      { text: "Nitrogen", points: 0 },
      { text: "Hydrogen", points: 0 },
    ],
    explanation: "People need to breathe oxygen to stay alive.",
  },
  {
    id: "in-20", d: 5, prompt: "Which body organ do you use to think?",
    options: [
      { text: "The brain", points: 1 },
      { text: "The heart", points: 0 },
      { text: "The stomach", points: 0 },
      { text: "The kidneys", points: 0 },
    ],
    explanation: "The brain is the organ you use to think.",
  },
  // d6: age 9 to 10
  {
    id: "in-21", d: 6, prompt: "What is the hardest natural substance found on Earth?",
    options: [
      { text: "Diamond", points: 1 },
      { text: "Iron", points: 0 },
      { text: "Glass", points: 0 },
      { text: "Wood", points: 0 },
    ],
    explanation: "Diamond is the hardest natural substance found on Earth.",
  },
  {
    id: "in-22", d: 6, prompt: "Which planet is known as the red planet?",
    options: [
      { text: "Mars", points: 1 },
      { text: "Venus", points: 0 },
      { text: "Saturn", points: 0 },
      { text: "Neptune", points: 0 },
    ],
    explanation: "Mars is known as the red planet.",
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
  },
  {
    id: "in-24", d: 6, prompt: "About how many bones are in the adult human body?",
    options: [
      { text: "Two hundred six", points: 1 },
      { text: "One hundred", points: 0 },
      { text: "Three hundred fifty", points: 0 },
      { text: "Fifty", points: 0 },
    ],
    explanation: "An adult human body has about two hundred six bones.",
  },
  // d7: age 11 to 12
  {
    id: "in-25", d: 7, prompt: "What is the process called when plants make their own food using sunlight?",
    options: [
      { text: "Photosynthesis", points: 1 },
      { text: "Respiration", points: 0 },
      { text: "Digestion", points: 0 },
      { text: "Evaporation", points: 0 },
    ],
    explanation: "Photosynthesis is the process plants use to make their own food using sunlight.",
  },
  {
    id: "in-26", d: 7, prompt: "What force pulls objects toward the Earth?",
    options: [
      { text: "Gravity", points: 1 },
      { text: "Friction", points: 0 },
      { text: "Magnetism", points: 0 },
      { text: "Pressure", points: 0 },
    ],
    explanation: "Gravity pulls objects toward the Earth.",
  },
  {
    id: "in-27", d: 7, prompt: "Which gas makes up most of the air we breathe?",
    options: [
      { text: "Nitrogen", points: 1 },
      { text: "Oxygen", points: 0 },
      { text: "Carbon dioxide", points: 0 },
      { text: "Helium", points: 0 },
    ],
    explanation: "Nitrogen makes up most of the air we breathe.",
  },
  {
    id: "in-28", d: 7, prompt: "What is the center of an atom called?",
    options: [
      { text: "The nucleus", points: 1 },
      { text: "The electron", points: 0 },
      { text: "The orbit", points: 0 },
      { text: "The shell", points: 0 },
    ],
    explanation: "The center of an atom is called the nucleus.",
  },
  // d8: age 11 to 12
  {
    id: "in-29", d: 8, prompt: "What gas do plants take in from the air?",
    options: [
      { text: "Carbon dioxide", points: 1 },
      { text: "Oxygen", points: 0 },
      { text: "Nitrogen", points: 0 },
      { text: "Hydrogen", points: 0 },
    ],
    explanation: "Plants take in carbon dioxide from the air.",
  },
  {
    id: "in-30", d: 8, prompt: "Who is remembered as the first person to walk on the Moon?",
    options: [
      { text: "Neil Armstrong", points: 1 },
      { text: "Isaac Newton", points: 0 },
      { text: "Albert Einstein", points: 0 },
      { text: "Charles Darwin", points: 0 },
    ],
    explanation: "Neil Armstrong is remembered as the first person to walk on the Moon.",
  },
  {
    id: "in-31", d: 8, prompt: "What do we call water that has changed into a gas?",
    options: [
      { text: "Water vapor", points: 1 },
      { text: "Ice", points: 0 },
      { text: "Frost", points: 0 },
      { text: "Slush", points: 0 },
    ],
    explanation: "Water that has changed into a gas is called water vapor.",
  },
  {
    id: "in-32", d: 8, prompt: "Which continent is the largest by area?",
    options: [
      { text: "Asia", points: 1 },
      { text: "Africa", points: 0 },
      { text: "Europe", points: 0 },
      { text: "Australia", points: 0 },
    ],
    explanation: "Asia is the largest continent by area.",
  },
  // d9: age 13
  {
    id: "in-33", d: 9, prompt: "What is the name of the layer of gases surrounding the Earth?",
    options: [
      { text: "The atmosphere", points: 1 },
      { text: "The core", points: 0 },
      { text: "The mantle", points: 0 },
      { text: "The crust", points: 0 },
    ],
    explanation: "The atmosphere is the layer of gases surrounding the Earth.",
  },
  {
    id: "in-34", d: 9, prompt: "What do we call an animal that eats both plants and meat?",
    options: [
      { text: "An omnivore", points: 1 },
      { text: "A herbivore", points: 0 },
      { text: "A carnivore", points: 0 },
      { text: "A decomposer", points: 0 },
    ],
    explanation: "An animal that eats both plants and meat is called an omnivore.",
  },
  {
    id: "in-35", d: 9, prompt: "Which simple machine is a ramp that helps move things up or down?",
    options: [
      { text: "An inclined plane", points: 1 },
      { text: "A pulley", points: 0 },
      { text: "A lever", points: 0 },
      { text: "A wheel and axle", points: 0 },
    ],
    explanation: "A ramp that helps move things up or down is called an inclined plane.",
  },
  {
    id: "in-36", d: 9, prompt: "What is the name for the path a planet takes around the sun?",
    options: [
      { text: "An orbit", points: 1 },
      { text: "An axis", points: 0 },
      { text: "An eclipse", points: 0 },
      { text: "A galaxy", points: 0 },
    ],
    explanation: "The path a planet takes around the sun is called an orbit.",
  },
  // d10: age 13
  {
    id: "in-37", d: 10, prompt: "What do we call the imaginary line around the middle of the Earth?",
    options: [
      { text: "The equator", points: 1 },
      { text: "The meridian", points: 0 },
      { text: "The horizon", points: 0 },
      { text: "The axis", points: 0 },
    ],
    explanation: "The imaginary line around the middle of the Earth is called the equator.",
  },
  {
    id: "in-38", d: 10, prompt: "Which scientist is best known for the theory of evolution by natural selection?",
    options: [
      { text: "Charles Darwin", points: 1 },
      { text: "Isaac Newton", points: 0 },
      { text: "Albert Einstein", points: 0 },
      { text: "Marie Curie", points: 0 },
    ],
    explanation: "Charles Darwin is best known for the theory of evolution by natural selection.",
  },
  {
    id: "in-39", d: 10, prompt: "What is the smallest unit that all living things are made of?",
    options: [
      { text: "A cell", points: 1 },
      { text: "An atom", points: 0 },
      { text: "A molecule", points: 0 },
      { text: "An organ", points: 0 },
    ],
    explanation: "A cell is the smallest unit that all living things are made of.",
  },
  {
    id: "in-40", d: 10, prompt: "What do we call energy that comes from the sun?",
    options: [
      { text: "Solar energy", points: 1 },
      { text: "Wind energy", points: 0 },
      { text: "Nuclear energy", points: 0 },
      { text: "Geothermal energy", points: 0 },
    ],
    explanation: "Energy that comes from the sun is called solar energy.",
  },
  // ------------------------------------------------------------------
  // d11-15: the widened band (decision #17, 2026-08-28 — she reached the
  // d10 cap on 2026-08-27). Ages roughly 13 through 15; still widely
  // taught, single-answer facts only. Same shape rules as d1-10.
  // ------------------------------------------------------------------
  // d11: age 13 to 14
  {
    id: "in-41", d: 11, prompt: "What is the smallest prime number?",
    options: [
      { text: "Two", points: 1 },
      { text: "One", points: 0 },
      { text: "Three", points: 0 },
      { text: "Zero", points: 0 },
    ],
    explanation: "Two is the smallest prime number. One is not counted as a prime.",
  },
  {
    id: "in-42", d: 11, prompt: "What is the chemical formula for water?",
    options: [
      { text: "H2O", points: 1 },
      { text: "CO2", points: 0 },
      { text: "O2", points: 0 },
      { text: "NaCl", points: 0 },
    ],
    explanation: "The chemical formula for water is H2O: two hydrogen atoms and one oxygen atom.",
  },
  {
    id: "in-43", d: 11, prompt: "Which organs filter waste out of the blood to make urine?",
    options: [
      { text: "The kidneys", points: 1 },
      { text: "The lungs", points: 0 },
      { text: "The ears", points: 0 },
      { text: "The muscles", points: 0 },
    ],
    explanation: "The kidneys filter waste out of the blood to make urine.",
  },
  {
    id: "in-44", d: 11, prompt: "Which gas, added to the air by burning fuels, traps extra heat around the Earth?",
    options: [
      { text: "Carbon dioxide", points: 1 },
      { text: "Oxygen", points: 0 },
      { text: "Helium", points: 0 },
      { text: "Neon", points: 0 },
    ],
    explanation: "Carbon dioxide from burning fuels traps extra heat around the Earth.",
  },
  // d12: age 13 to 14
  {
    id: "in-45", d: 12, prompt: "What is the name of the galaxy that contains our solar system?",
    options: [
      { text: "The Milky Way", points: 1 },
      { text: "Andromeda", points: 0 },
      { text: "The Big Dipper", points: 0 },
      { text: "Orion", points: 0 },
    ],
    explanation: "Our solar system is inside the Milky Way galaxy.",
  },
  {
    id: "in-46", d: 12, prompt: "Which blood cells help the body fight infection?",
    options: [
      { text: "White blood cells", points: 1 },
      { text: "Red blood cells", points: 0 },
      { text: "Skin cells", points: 0 },
      { text: "Bone cells", points: 0 },
    ],
    explanation: "White blood cells help the body fight infection.",
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
  },
  {
    id: "in-48", d: 12, prompt: "Which is faster, light or sound?",
    options: [
      { text: "Light", points: 1 },
      { text: "Sound", points: 0 },
      { text: "They are the same speed", points: 0 },
      { text: "Neither one moves", points: 0 },
    ],
    explanation: "Light travels much faster than sound, which is why you see lightning before you hear thunder.",
  },
  // d13: age 14
  {
    id: "in-49", d: 13, prompt: "Which particle in an atom carries a negative charge?",
    options: [
      { text: "The electron", points: 1 },
      { text: "The proton", points: 0 },
      { text: "The neutron", points: 0 },
      { text: "The photon", points: 0 },
    ],
    explanation: "The electron carries a negative charge.",
  },
  {
    id: "in-50", d: 13, prompt: "Which ancient civilization built the great pyramids at Giza?",
    options: [
      { text: "The Egyptians", points: 1 },
      { text: "The Romans", points: 0 },
      { text: "The Vikings", points: 0 },
      { text: "The Aztecs", points: 0 },
    ],
    explanation: "The ancient Egyptians built the great pyramids at Giza.",
  },
  {
    id: "in-51", d: 13, prompt: "What is the main gas that makes up the Sun?",
    options: [
      { text: "Hydrogen", points: 1 },
      { text: "Oxygen", points: 0 },
      { text: "Carbon dioxide", points: 0 },
      { text: "Iron vapor", points: 0 },
    ],
    explanation: "The Sun is made mostly of hydrogen.",
  },
  {
    id: "in-52", d: 13, prompt: "What do we call it when liquid water slowly turns into a gas at its surface?",
    options: [
      { text: "Evaporation", points: 1 },
      { text: "Condensation", points: 0 },
      { text: "Freezing", points: 0 },
      { text: "Melting", points: 0 },
    ],
    explanation: "Evaporation is when liquid water slowly turns into a gas at its surface.",
  },
  // d14: age 14 to 15
  {
    id: "in-53", d: 14, prompt: "What is the name for the slow change of living things over many generations?",
    options: [
      { text: "Evolution", points: 1 },
      { text: "Erosion", points: 0 },
      { text: "Rotation", points: 0 },
      { text: "Hibernation", points: 0 },
    ],
    explanation: "Evolution is the slow change of living things over many generations.",
  },
  {
    id: "in-54", d: 14, prompt: "Which part of a cell is often called its powerhouse because it releases energy from food?",
    options: [
      { text: "The mitochondria", points: 1 },
      { text: "The nucleus", points: 0 },
      { text: "The cell wall", points: 0 },
      { text: "The vacuole", points: 0 },
    ],
    explanation: "The mitochondria release energy from food, so they are called the powerhouse of the cell.",
  },
  {
    id: "in-55", d: 14, prompt: "What is molten rock called after it erupts out of a volcano?",
    options: [
      { text: "Lava", points: 1 },
      { text: "Magma", points: 0 },
      { text: "Ash", points: 0 },
      { text: "Granite", points: 0 },
    ],
    explanation: "Molten rock is called magma underground and lava once it erupts out of a volcano.",
  },
  {
    id: "in-56", d: 14, prompt: "Which measurement tells how much matter an object contains?",
    options: [
      { text: "Mass", points: 1 },
      { text: "Weight", points: 0 },
      { text: "Volume", points: 0 },
      { text: "Length", points: 0 },
    ],
    explanation: "Mass tells how much matter an object contains. Weight can change with gravity, but mass does not.",
  },
  // d15: age 15
  {
    id: "in-57", d: 15, prompt: "Which element is the basis of the chemistry of all living things on Earth?",
    options: [
      { text: "Carbon", points: 1 },
      { text: "Gold", points: 0 },
      { text: "Helium", points: 0 },
      { text: "Sodium", points: 0 },
    ],
    explanation: "The chemistry of all living things on Earth is based on carbon.",
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
  },
  {
    id: "in-59", d: 15, prompt: "In which body system are the trachea and the bronchi found?",
    options: [
      { text: "The respiratory system", points: 1 },
      { text: "The digestive system", points: 0 },
      { text: "The circulatory system", points: 0 },
      { text: "The nervous system", points: 0 },
    ],
    explanation: "The trachea and the bronchi are parts of the respiratory system, which we breathe with.",
  },
  {
    id: "in-60", d: 15, prompt: "What is the name for an animal that has no backbone?",
    options: [
      { text: "An invertebrate", points: 1 },
      { text: "A vertebrate", points: 0 },
      { text: "A reptile", points: 0 },
      { text: "A mammal", points: 0 },
    ],
    explanation: "An animal that has no backbone is called an invertebrate.",
  },
];
