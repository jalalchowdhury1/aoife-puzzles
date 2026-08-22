import type { ChoiceBankItem } from "../bankGenre";

// Original "what should you do" and "why do we" items: safety, fairness,
// community rules, and everyday conventions, moving toward reasoning about
// consequences at the higher difficulties. Age ramped d1 (about age 6)
// through d10 (about age 13).
export const COMPREHENSION_BANK: ChoiceBankItem[] = [
  // d1: basic safety and rules, age 6
  {
    id: "co-01", d: 1, prompt: "Why do we wash our hands before eating?",
    options: [
      { text: "To wash away germs so we do not get sick", points: 2 },
      { text: "Because a grown up told us to", points: 1 },
      { text: "To make our hands warm", points: 0 },
      { text: "To make our food taste better", points: 0 },
    ],
    explanation: "Washing our hands before eating washes away germs so we do not get sick.",
  },
  {
    id: "co-02", d: 1, prompt: "Why do we look both ways before crossing the street?",
    options: [
      { text: "To make sure no cars are coming so we stay safe", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To see our friends", points: 0 },
      { text: "To find something to pick up", points: 0 },
    ],
    explanation: "Looking both ways lets us make sure no cars are coming so we stay safe.",
  },
  {
    id: "co-03", d: 1, prompt: "Why do we wear a helmet when we ride a bike?",
    options: [
      { text: "To protect our head if we fall", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To look taller", points: 0 },
      { text: "To keep our hair dry", points: 0 },
    ],
    explanation: "A helmet protects our head if we fall while riding a bike.",
  },
  {
    id: "co-04", d: 1, prompt: "Why do we put toys away after playing?",
    options: [
      { text: "So no one trips over them and the room stays safe", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the toys tired", points: 0 },
      { text: "To make the room colder", points: 0 },
    ],
    explanation: "Putting toys away means no one trips over them and the room stays safe.",
  },
  // d2: basic safety and rules, age 6
  {
    id: "co-05", d: 2, prompt: "Why should you not touch a hot stove?",
    options: [
      { text: "Because it could burn you", points: 2 },
      { text: "Because a grown up said not to", points: 1 },
      { text: "Because it is too quiet", points: 0 },
      { text: "Because it is too far away", points: 0 },
    ],
    explanation: "A hot stove could burn you if you touch it.",
  },
  {
    id: "co-06", d: 2, prompt: "Why do we listen to a lifeguard at the pool?",
    options: [
      { text: "So we stay safe in the water", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "Because the lifeguard likes to talk", points: 0 },
      { text: "Because the pool is closed", points: 0 },
    ],
    explanation: "Listening to a lifeguard helps us stay safe in the water.",
  },
  {
    id: "co-07", d: 2, prompt: "Why do we say sorry when we hurt someone by accident?",
    options: [
      { text: "To show we care and help them feel better", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make them go away", points: 0 },
      { text: "To end the game", points: 0 },
    ],
    explanation: "Saying sorry shows we care and helps the other person feel better.",
  },
  {
    id: "co-08", d: 2, prompt: "Why do we hold an adult's hand in a busy parking lot?",
    options: [
      { text: "So we stay safe and do not get hit by a car", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To keep our hand warm", points: 0 },
      { text: "To play a game", points: 0 },
    ],
    explanation: "Holding an adult's hand keeps us safe from cars in a busy parking lot.",
  },
  // d3: safety and community rules, age 7 to 8
  {
    id: "co-09", d: 3, prompt: "Why do we wear seatbelts in a car?",
    options: [
      { text: "To keep us safe if the car stops suddenly", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To keep us warm", points: 0 },
      { text: "To hold our snacks", points: 0 },
    ],
    explanation: "A seatbelt keeps us safe if the car stops suddenly.",
  },
  {
    id: "co-10", d: 3, prompt: "Why do firefighters practice fire drills at school?",
    options: [
      { text: "So everyone knows how to leave safely if there is a real fire", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the school louder", points: 0 },
      { text: "To use up class time", points: 0 },
    ],
    explanation: "Fire drills teach everyone how to leave safely if there is a real fire.",
  },
  {
    id: "co-11", d: 3, prompt: "Why do we take turns on the playground slide?",
    options: [
      { text: "So everyone gets a fair chance and no one gets hurt", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the line longer", points: 0 },
      { text: "To finish recess faster", points: 0 },
    ],
    explanation: "Taking turns means everyone gets a fair chance and no one gets hurt.",
  },
  {
    id: "co-12", d: 3, prompt: "Why should you tell a grown up if you get lost in a store?",
    options: [
      { text: "So a grown up can help you find your family safely", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To find a snack", points: 0 },
      { text: "To look at toys", points: 0 },
    ],
    explanation: "Telling a grown up helps you find your family safely if you get lost.",
  },
  // d4: safety and community rules, age 7 to 8
  {
    id: "co-13", d: 4, prompt: "Why do we cover our mouth when we cough?",
    options: [
      { text: "To stop germs from spreading to other people", points: 2 },
      { text: "Because it is polite", points: 1 },
      { text: "To make a funny noise", points: 0 },
      { text: "To finish coughing faster", points: 0 },
    ],
    explanation: "Covering our mouth stops germs from spreading to other people.",
  },
  {
    id: "co-14", d: 4, prompt: "Why do schools have a lost and found box?",
    options: [
      { text: "So people can get back things they accidentally left behind", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the classroom bigger", points: 0 },
      { text: "To collect old toys", points: 0 },
    ],
    explanation: "A lost and found box lets people get back things they accidentally left behind.",
  },
  {
    id: "co-15", d: 4, prompt: "Why do we wait for the walk signal before crossing at a crosswalk?",
    options: [
      { text: "So cars have time to stop and we cross safely", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To see the traffic lights change color", points: 0 },
      { text: "To make the walk take longer", points: 0 },
    ],
    explanation: "Waiting for the walk signal gives cars time to stop so we cross safely.",
  },
  {
    id: "co-16", d: 4, prompt: "Why is it important to tell the truth, even when it is hard?",
    options: [
      { text: "So people can trust what you say", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the story longer", points: 0 },
      { text: "To end the conversation", points: 0 },
    ],
    explanation: "Telling the truth helps people trust what you say.",
  },
  // d5: fairness and why questions, age 9 to 10
  {
    id: "co-17", d: 5, prompt: "Why do libraries lend books for free?",
    options: [
      { text: "So everyone can read and learn, not just people who can buy books", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the library quieter", points: 0 },
      { text: "To fill up the shelves", points: 0 },
    ],
    explanation: "Free lending lets everyone read and learn, not just people who can buy books.",
  },
  {
    id: "co-18", d: 5, prompt: "Why do we recycle bottles and cans?",
    options: [
      { text: "To reduce waste and protect the environment", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make more noise", points: 0 },
      { text: "To fill up the trash can faster", points: 0 },
    ],
    explanation: "Recycling reduces waste and helps protect the environment.",
  },
  {
    id: "co-19", d: 5, prompt: "Why do sports games have referees or umpires?",
    options: [
      { text: "To make sure the rules are followed fairly for both teams", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the game longer", points: 0 },
      { text: "To cheer for one team", points: 0 },
    ],
    explanation: "Referees make sure the rules are followed fairly for both teams.",
  },
  {
    id: "co-20", d: 5, prompt: "Why do we say please and thank you?",
    options: [
      { text: "To show respect and appreciation for other people", points: 2 },
      { text: "Because it is polite", points: 1 },
      { text: "To end the conversation", points: 0 },
      { text: "To make people laugh", points: 0 },
    ],
    explanation: "Saying please and thank you shows respect and appreciation for other people.",
  },
  // d6: fairness and community rules, age 9 to 10
  {
    id: "co-21", d: 6, prompt: "Why do communities have traffic laws?",
    options: [
      { text: "To keep drivers and walkers safe from accidents", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make streets look nicer", points: 0 },
      { text: "To slow down bicycles only", points: 0 },
    ],
    explanation: "Traffic laws keep drivers and walkers safe from accidents.",
  },
  {
    id: "co-22", d: 6, prompt: "Why do we apologize even when we did not mean to cause harm?",
    options: [
      { text: "To show we understand someone was hurt and we care about them", points: 2 },
      { text: "Because it is polite", points: 1 },
      { text: "To end the conversation", points: 0 },
      { text: "To change the subject", points: 0 },
    ],
    explanation: "Apologizing shows we understand someone was hurt and we care about them.",
  },
  {
    id: "co-23", d: 6, prompt: "Why is it unfair to cheat in a game?",
    options: [
      { text: "Because it takes away an honest chance for everyone else to win", points: 2 },
      { text: "Because it is against the rule", points: 1 },
      { text: "Because it makes the game longer", points: 0 },
      { text: "Because it is too easy", points: 0 },
    ],
    explanation: "Cheating takes away an honest chance for everyone else to win.",
  },
  {
    id: "co-24", d: 6, prompt: "Why do doctors wash their hands between patients?",
    options: [
      { text: "To stop germs from spreading from one patient to another", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make their hands soft", points: 0 },
      { text: "To finish the visit faster", points: 0 },
    ],
    explanation: "Washing hands between patients stops germs from spreading from one patient to another.",
  },
  // d7: community rules and reasoning, age 11 to 12
  {
    id: "co-25", d: 7, prompt: "Why do countries have laws that everyone must follow?",
    options: [
      { text: "So people can live together safely and fairly", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make government buildings bigger", points: 0 },
      { text: "To give people something to talk about", points: 0 },
    ],
    explanation: "Laws let people live together safely and fairly.",
  },
  {
    id: "co-26", d: 7, prompt: "Why is it important to listen to someone who disagrees with you?",
    options: [
      { text: "Because you might understand their reasons and learn something new", points: 2 },
      { text: "Because it is polite", points: 1 },
      { text: "Because it ends the conversation faster", points: 0 },
      { text: "Because it makes you agree with them", points: 0 },
    ],
    explanation: "Listening to someone who disagrees can help you understand their reasons and learn something new.",
  },
  {
    id: "co-27", d: 7, prompt: "Why do jury members have to consider evidence carefully before deciding a case?",
    options: [
      { text: "So the decision is fair and based on facts, not guesses", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the trial take longer", points: 0 },
      { text: "To keep the courtroom quiet", points: 0 },
    ],
    explanation: "Considering evidence carefully keeps the decision fair and based on facts, not guesses.",
  },
  {
    id: "co-28", d: 7, prompt: "Why should you keep a promise even when it becomes inconvenient?",
    options: [
      { text: "Because breaking it could hurt someone who was counting on you", points: 2 },
      { text: "Because it is polite", points: 1 },
      { text: "Because it makes the day shorter", points: 0 },
      { text: "Because it is easier", points: 0 },
    ],
    explanation: "Breaking a promise could hurt someone who was counting on you.",
  },
  // d8: community rules and reasoning, age 11 to 12
  {
    id: "co-29", d: 8, prompt: "Why do workplaces have safety rules for using machines?",
    options: [
      { text: "To prevent injuries that could seriously hurt workers", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the machines louder", points: 0 },
      { text: "To slow down the work", points: 0 },
    ],
    explanation: "Safety rules prevent injuries that could seriously hurt workers.",
  },
  {
    id: "co-30", d: 8, prompt: "Why is it important to consider how your actions affect other people?",
    options: [
      { text: "Because your choices can help or hurt people even when you do not mean to", points: 2 },
      { text: "Because it is polite", points: 1 },
      { text: "Because it makes decisions faster", points: 0 },
      { text: "Because it is easier", points: 0 },
    ],
    explanation: "Your choices can help or hurt other people even when you do not mean to.",
  },
  {
    id: "co-31", d: 8, prompt: "Why do communities set aside land for public parks?",
    options: [
      { text: "So everyone has a shared place to enjoy nature and be outside", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make the town smaller", points: 0 },
      { text: "To use up empty land", points: 0 },
    ],
    explanation: "Public parks give everyone a shared place to enjoy nature and be outside.",
  },
  {
    id: "co-32", d: 8, prompt: "Why should you ask before using something that belongs to someone else?",
    options: [
      { text: "Because it respects their right to decide what happens to their own things", points: 2 },
      { text: "Because it is polite", points: 1 },
      { text: "Because it makes the task faster", points: 0 },
      { text: "Because it is easier to remember", points: 0 },
    ],
    explanation: "Asking first respects the other person's right to decide what happens to their own things.",
  },
  // d9: reasoning about consequences, age 13
  {
    id: "co-33", d: 9, prompt: "What is likely to happen if a whole community ignores traffic laws?",
    options: [
      { text: "Accidents become much more likely because no one can predict what others will do", points: 2 },
      { text: "People might get in trouble", points: 1 },
      { text: "The streets will look different", points: 0 },
      { text: "Cars will go faster", points: 0 },
    ],
    explanation: "Ignoring traffic laws makes accidents more likely because no one can predict what others will do.",
  },
  {
    id: "co-34", d: 9, prompt: "Why can a small lie sometimes cause a bigger problem later?",
    options: [
      { text: "Because it can be discovered and make people trust you less than if you had told the truth", points: 2 },
      { text: "Because lying is against the rule", points: 1 },
      { text: "Because it takes longer to say", points: 0 },
      { text: "Because it uses more words", points: 0 },
    ],
    explanation: "A discovered lie can make people trust you less than if you had told the truth.",
  },
  {
    id: "co-35", d: 9, prompt: "What might happen if a company dumps waste into a river without being stopped?",
    options: [
      { text: "The water could become unsafe for the people, animals, and plants that depend on it", points: 2 },
      { text: "The river might look different", points: 1 },
      { text: "The company will get more customers", points: 0 },
      { text: "The river will move faster", points: 0 },
    ],
    explanation: "Dumping waste can make the water unsafe for the people, animals, and plants that depend on it.",
  },
  {
    id: "co-36", d: 9, prompt: "Why is it risky for a whole town to depend on only one source of drinking water?",
    options: [
      { text: "If that one source becomes polluted or dries up, everyone loses access at once", points: 2 },
      { text: "It might cost more money", points: 1 },
      { text: "The water might taste different", points: 0 },
      { text: "The town will need more pipes", points: 0 },
    ],
    explanation: "If the one source becomes polluted or dries up, everyone loses access at once.",
  },
  // d10: complex reasoning about consequences, age 13
  {
    id: "co-37", d: 10, prompt: "Why do many governments separate the people who make laws from the people who judge them?",
    options: [
      { text: "So that no single group has too much power and decisions stay checked and fair", points: 2 },
      { text: "Because it is the rule", points: 1 },
      { text: "To make government buildings bigger", points: 0 },
      { text: "To create more jobs", points: 0 },
    ],
    explanation: "Separating these roles means no single group has too much power, so decisions stay checked and fair.",
  },
  {
    id: "co-38", d: 10, prompt: "What long term problem can happen if a country spends much more money than it collects, year after year?",
    options: [
      { text: "It can build up a large debt that makes it harder to pay for things in the future", points: 2 },
      { text: "The money might look different", points: 1 },
      { text: "People will need bigger wallets", points: 0 },
      { text: "Prices will drop right away", points: 0 },
    ],
    explanation: "Spending much more than is collected, year after year, can build up a debt that makes future spending harder.",
  },
  {
    id: "co-39", d: 10, prompt: "Why might a quick fix for a problem sometimes cause a bigger problem later on?",
    options: [
      { text: "Because it can hide the surface issue while leaving the real cause untouched, so it comes back worse", points: 2 },
      { text: "Because it happens quickly", points: 1 },
      { text: "Because it costs less money", points: 0 },
      { text: "Because it uses fewer people", points: 0 },
    ],
    explanation: "A quick fix can hide the surface issue while leaving the real cause untouched, so it comes back worse.",
  },
  {
    id: "co-40", d: 10, prompt: "Why is it important for scientists to test an idea many times before trusting it?",
    options: [
      { text: "Because one result could be a coincidence, and repeating it shows whether it is really true", points: 2 },
      { text: "Because testing takes a long time", points: 1 },
      { text: "Because it uses more equipment", points: 0 },
      { text: "Because it makes the report longer", points: 0 },
    ],
    explanation: "Repeating a test shows whether one result was a coincidence or something that is really true.",
  },
];
