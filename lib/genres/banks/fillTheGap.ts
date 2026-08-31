import type { ChoiceBankItem } from "../bankGenre";

// "Fill the Gap" (cousin of word knowledge, VC domain), reauthored
// 2026-08-30 under decision #29 after an audit found the whole bank was
// solvable by register alone ("pick the rarer word" scored 2 on about 48 of
// 50 items) with a recycled pool of never the answer fillers.
//
// Design rules this bank now follows:
//  1. The SENTENCE carries the evidence. Every stem contains the detail that
//     picks the 2 point word over the 1 point near synonym (a whole night of
//     rain picks soaked over damp; two tall trees pick ambiguous over
//     unclear). Nothing depends on knowing which word sounds fancier.
//  2. Four options of one kind: same part of speech, same word form (all the
//     picture items are ing verbs), same register and frequency band, similar
//     length. No option can be dropped on tone, grammar, article or length.
//  3. The 1 point option is genuinely partial: right direction, less precise
//     or less complete for THIS sentence. The two 0 point options are real
//     words a child could reasonably try, true of a similar sentence, never
//     silly, never cruel, never a color.
//  4. 50 distinct keys, and no key is used as a distractor anywhere. No
//     filler word sits in more than two items. No intensifier before the
//     blank, no article before the blank, and the key never echoes the stem.
//  5. Difficulty comes from the precision demanded, not from rarer words.
//     d1 to d2 concrete actions with in sentence evidence (emoji present, and
//     the emoji shows the scene or the subject, never the answer); d3 to d4 everyday
//     adjectives; d5 to d6 feelings and qualities in subtle shades; d7 to d8
//     academic adjectives; d9 to d10 abstract nouns and precise academic
//     vocabulary. d1 is about age 6, d10 about age 13.
//  6. Every item carries a reviewNote recording the human red team pass.
export const FILL_THE_GAP_BANK: ChoiceBankItem[] = [
  // d1: picture items, about age 6. All four options are ing verbs the animal
  // or object could really do; the sentence says which one.
  {
    id: "fg-01", d: 1, prompt: "The cat is ___ on the mat and has not opened her eyes since lunch.", emoji: "🐱",
    options: [
      { text: "sleeping", points: 2 },
      { text: "resting", points: 1 },
      { text: "hunting", points: 0 },
      { text: "prowling", points: 0 },
    ],
    explanation: "Eyes that have stayed shut since lunch mean the cat is sleeping, not only resting.",
    reviewNote: "Hunting and prowling are true cat verbs but both mean moving after something, which no cat lying still on a mat is doing. Resting is the right direction and earns partial credit, yet a cat can rest wide awake with her eyes following you round the room. Has not opened her eyes since lunch is the evidence in the sentence itself, so sleeping is uniquely right. Seven and eight letters, all ing forms, all plain register, the cat emoji shows the animal and not the action, and no option is silly.",
  },
  {
    id: "fg-02", d: 1, prompt: "The frog is ___ from one lily pad to the next.", emoji: "🐸",
    options: [
      { text: "hopping", points: 2 },
      { text: "moving", points: 1 },
      { text: "floating", points: 0 },
      { text: "diving", points: 0 },
    ],
    explanation: "Going from pad to pad in little jumps is hopping.",
    reviewNote: "Floating and diving are things that really happen on a pond, but neither gets you from one pad to another pad. Moving is true and scores one, yet it names no way of travelling. From one lily pad to the next is the evidence: crossing a gap needs a jump, so hopping is uniquely right. All four are ing verbs of six to eight letters in the same plain register, the frog emoji shows the subject not the answer, the key never appears in the stem, and nothing here is silly or moralized.",
  },
  {
    id: "fg-03", d: 1, prompt: "The baby is ___ across the floor on her hands and knees.", emoji: "👶",
    options: [
      { text: "crawling", points: 2 },
      { text: "creeping", points: 1 },
      { text: "rolling", points: 0 },
      { text: "stomping", points: 0 },
    ],
    explanation: "Moving on hands and knees is what crawling means.",
    reviewNote: "Rolling and stomping are real ways of crossing a floor and both fit a slightly different sentence, but neither uses hands and knees. Creeping is close and earns one, yet it only says slow and quiet and could be done on tiptoe. On her hands and knees is the clause that makes crawling the exact fit. Lengths run seven to eight letters, all ing forms, all everyday words, the baby emoji shows the subject, and no distractor is babyish or absurd.",
  },
  {
    id: "fg-04", d: 1, prompt: "The bus is ___ at the corner so the children can climb on.", emoji: "🚌",
    options: [
      { text: "stopping", points: 2 },
      { text: "slowing", points: 1 },
      { text: "swerving", points: 0 },
      { text: "turning", points: 0 },
    ],
    explanation: "Children can only climb on once the bus has come to a full halt, so it is stopping.",
    reviewNote: "Swerving and turning are true bus verbs at a corner and are plausible in a similar sentence, but neither lets anyone climb aboard. Slowing points the right way and takes one, yet a bus that is only slowing is still moving. So the children can climb on is the evidence that demands a full halt. Four ing verbs of seven and eight letters, same register, bus emoji shows the vehicle rather than the action, key absent from the stem, no silliness.",
  },
  {
    id: "fg-05", d: 1, prompt: "The ice cube is ___ fast because Aoife is holding it in her warm hand.", emoji: "🧊",
    options: [
      { text: "melting", points: 2 },
      { text: "shrinking", points: 1 },
      { text: "cracking", points: 0 },
      { text: "spinning", points: 0 },
    ],
    explanation: "A warm hand turns ice into water, and that change is melting.",
    reviewNote: "Cracking and spinning are things ice really does in other sentences, but a warm hand causes neither. Shrinking is the right direction and scores one because the cube truly is getting smaller, yet it says nothing about turning into water. Warm hand is the evidence that names the change, so melting is uniquely right. Seven to nine letters, all ing forms, plain register, the ice emoji shows the object not the change, and no option is a color or a joke.",
  },
  // d2: picture items, about age 6 to 7. Same shape as d1, but the 2 point
  // word is a step more specific than the 1 point one.
  {
    id: "fg-06", d: 2, prompt: "The river is ___ so fast that it carries whole branches away.", emoji: "🏞️",
    options: [
      { text: "rushing", points: 2 },
      { text: "flowing", points: 1 },
      { text: "sinking", points: 0 },
      { text: "spilling", points: 0 },
    ],
    explanation: "Water strong enough to carry branches away is rushing.",
    reviewNote: "Sinking and spilling are real water verbs that fit other sentences, but a river that carries branches downstream is doing neither. Flowing is true of every river and takes one, yet it carries no sense of force. Carries whole branches away is the evidence for speed and power, so rushing is uniquely right. All four are ing verbs of seven or eight letters in the same register, the landscape emoji shows the river rather than its speed, and no distractor is silly.",
  },
  {
    id: "fg-07", d: 2, prompt: "The bread is ___ in the oven and filling the house with a warm smell.", emoji: "🍞",
    options: [
      { text: "baking", points: 2 },
      { text: "cooking", points: 1 },
      { text: "chilling", points: 0 },
      { text: "burning", points: 0 },
    ],
    explanation: "Bread in a hot oven is baking, which is the special word for cooking bread.",
    reviewNote: "Chilling belongs to a fridge and burning would give a sharp smell instead of a warm one, so both are plausible in a neighboring sentence and ruled out here. Cooking is true and scores one, yet it is the general word for any food and any method. Oven plus a warm smell picks the one method bread gets, so baking is uniquely right. Six to eight letters, all ing forms, the loaf emoji shows the bread not the process, and no option is fancier than the rest.",
  },
  {
    id: "fg-08", d: 2, prompt: "The puppy is ___ a hole under the fence to get into the yard.", emoji: "🐶",
    options: [
      { text: "digging", points: 2 },
      { text: "scratching", points: 1 },
      { text: "sniffing", points: 0 },
      { text: "chewing", points: 0 },
    ],
    explanation: "Making a hole in the dirt with his paws is digging.",
    reviewNote: "Sniffing and chewing are ordinary puppy actions that suit a similar sentence, but neither one opens a way under a fence. Scratching is the right direction and takes one because his paws really are scratching, yet scratching alone makes marks rather than a hole. A hole that gets him into the yard is the evidence, so digging is uniquely right. All four are ing verbs, seven to ten letters, same plain register, and the dog emoji shows the puppy rather than the action.",
  },
  {
    id: "fg-09", d: 2, prompt: "The library bell is ___ to tell everyone that story time is starting.", emoji: "📖",
    options: [
      { text: "ringing", points: 2 },
      { text: "sounding", points: 1 },
      { text: "shining", points: 0 },
      { text: "rattling", points: 0 },
    ],
    explanation: "The clear note a bell makes to call people together is ringing.",
    reviewNote: "Shining fits a polished bell and rattling fits one shaken loose on its bracket, so both are believable elsewhere and neither is the clear note a bell is rung for. Sounding is the right direction and scores one, yet it is the general word for making any noise at all. To tell everyone story time is starting is the evidence for a deliberate signal, so ringing is uniquely right. Seven and eight letters, all ing forms, and the open book emoji points at story time rather than at the answer.",
  },
  {
    id: "fg-10", d: 2, prompt: "The rain is ___ against the window so hard that we cannot hear the radio.", emoji: "🌧️",
    options: [
      { text: "pounding", points: 2 },
      { text: "falling", points: 1 },
      { text: "misting", points: 0 },
      { text: "sprinkling", points: 0 },
    ],
    explanation: "Rain loud enough to drown out the radio is pounding on the glass.",
    reviewNote: "Misting and sprinkling are true rain verbs, which is what makes them tempting, but both describe gentle rain that no one could hear over a radio. Falling is true of all rain and takes one, yet it says nothing about force. So hard that we cannot hear the radio is the evidence, so pounding is uniquely right. Seven to ten letters, all ing forms, same register, and the rain cloud emoji shows the weather rather than how hard it hits.",
  },
  // d3: everyday adjectives, about age 7 to 8. The sentence names the effect;
  // the child picks the adjective that causes exactly that effect.
  {
    id: "fg-11", d: 3, prompt: "The path was so ___ that we had to walk one behind the other.",
    options: [
      { text: "narrow", points: 2 },
      { text: "small", points: 1 },
      { text: "steep", points: 0 },
      { text: "uneven", points: 0 },
    ],
    explanation: "A path with room for only one person at a time is narrow.",
    reviewNote: "Steep and uneven are honest path words that fit a hiking sentence, but neither forces walkers into single file. Small is the right direction and scores one, yet it lumps every dimension together instead of naming width. Walking one behind the other is about width alone, so narrow is uniquely right. Five and six letters across all four, all plain adjectives of the same frequency band, no stem echo, no moral word, no silly option.",
  },
  {
    id: "fg-12", d: 3, prompt: "The towel was still ___ after hanging outside all night in the rain.",
    options: [
      { text: "soaked", points: 2 },
      { text: "damp", points: 1 },
      { text: "frozen", points: 0 },
      { text: "neat", points: 0 },
    ],
    explanation: "A whole night of rain leaves a towel soaked, which is far wetter than damp.",
    reviewNote: "Frozen suits a cold night and neat suits a laundry basket, so both are believable in a close sentence and neither follows from rain. Damp earns one because it is on the wet scale, yet damp means only slightly wet. All night in the rain is the evidence for the far end of that scale, so soaked is uniquely right. Four to six letters, all everyday adjectives, key absent from the stem, no elaboration gradient and nothing absurd.",
  },
  {
    id: "fg-13", d: 3, prompt: "The waiting room was so ___ that people stood shoulder to shoulder along the walls.",
    options: [
      { text: "crowded", points: 2 },
      { text: "busy", points: 1 },
      { text: "warm", points: 0 },
      { text: "peaceful", points: 0 },
    ],
    explanation: "Too many people packed into one room is crowded.",
    reviewNote: "Warm and peaceful are real descriptions of a waiting room and work in a nearby sentence, but neither makes anyone stand along the walls. Busy is the right direction and takes one, yet a busy room is one with a lot going on and can still have empty chairs. Standing shoulder to shoulder is the evidence that the space itself has run out, so crowded is uniquely right. Four to eight letters, all plain adjectives, same register, and spotless was moved out so it no longer sits in two items in a row.",
  },
  {
    id: "fg-14", d: 3, prompt: "The kitchen floor was so ___ that Aoife slid all the way across it in her socks.",
    options: [
      { text: "slippery", points: 2 },
      { text: "smooth", points: 1 },
      { text: "sticky", points: 0 },
      { text: "spotless", points: 0 },
    ],
    explanation: "A floor you can slide right across in socks is slippery.",
    reviewNote: "Sticky is the opposite effect and spotless is about cleanliness, yet both are genuine floor words that fit a similar sentence, so neither is a throwaway. Smooth scores one because a smooth floor helps, yet a smooth rug or a smooth wooden board can still grip. Sliding all the way across is the evidence for no grip at all, so slippery is uniquely right. Six to eight letters, matched register, key never appears in the stem.",
  },
  {
    id: "fg-15", d: 3, prompt: "The medicine tasted so ___ that she needed a spoonful of honey right after.",
    options: [
      { text: "bitter", points: 2 },
      { text: "strong", points: 1 },
      { text: "chalky", points: 0 },
      { text: "sugary", points: 0 },
    ],
    explanation: "A sharp taste that sweetness has to cover up is bitter.",
    reviewNote: "Chalky is a true medicine texture and sugary fits a syrup, so both are plausible in a neighboring sentence and neither explains reaching for honey. Strong takes one because it is on the taste scale, yet strong describes how much flavor there is rather than which flavor. Honey is sweet, and sweetness is the cure for one taste in particular, so bitter is uniquely right. All four are six letter adjectives in the same register.",
  },
  // d4: everyday adjectives at the extreme end, about age 8. The 1 point word
  // is the mild version of the same scale; the sentence names the extreme.
  {
    id: "fg-16", d: 4, prompt: "By the end of the long hike Mia was so ___ that she fell asleep at the table.",
    options: [
      { text: "exhausted", points: 2 },
      { text: "tired", points: 1 },
      { text: "dizzy", points: 0 },
      { text: "impatient", points: 0 },
    ],
    explanation: "Falling asleep sitting at the table shows Mia was exhausted, far past ordinary tired.",
    reviewNote: "Dizzy and impatient are believable after a long hike and each fits a close sentence, but neither puts anyone to sleep at a table. Tired is on the right scale and earns one, yet plenty of tired people finish dinner awake. Falling asleep at the table is the evidence for the far end of the scale, so exhausted is uniquely right. All four run five to nine letters, all plain feeling adjectives, no moral word and no silly option.",
  },
  {
    id: "fg-17", d: 4, prompt: "Dad was so ___ about the deep scratch on his new car that he could barely speak.",
    options: [
      { text: "furious", points: 2 },
      { text: "annoyed", points: 1 },
      { text: "puzzled", points: 0 },
      { text: "anxious", points: 0 },
    ],
    explanation: "Anger big enough to take your words away is being furious.",
    reviewNote: "Puzzled and anxious are real reactions to damage on a car and both suit a nearby sentence, but neither leaves a person unable to speak. Annoyed is on the anger scale and scores one, yet annoyed people usually have plenty to say. Barely able to speak is the evidence for the top of that scale, so furious is uniquely right. All four are seven letter feeling adjectives in the same register, with no stem echo and nothing cruel.",
  },
  {
    id: "fg-18", d: 4, prompt: "The hikers had eaten nothing since sunrise, so by dinner they were ___.",
    options: [
      { text: "starving", points: 2 },
      { text: "hungry", points: 1 },
      { text: "sleepy", points: 0 },
      { text: "homesick", points: 0 },
    ],
    explanation: "A whole day with no food leaves you starving, which is much more than hungry.",
    reviewNote: "Sleepy and homesick are true of many long days out and each works in a close sentence, but the clause here is about food only. Hungry is the right scale and takes one, yet you can be hungry an hour after lunch. Nothing at all since sunrise is the evidence for the extreme, so starving is uniquely right. Six to eight letters, all everyday feeling adjectives, key never appears in the stem, and no option is absurd or babyish.",
  },
  {
    id: "fg-19", d: 4, prompt: "The wind off the sea was ___, and their fingers ached even inside their mittens.",
    options: [
      { text: "freezing", points: 2 },
      { text: "chilly", points: 1 },
      { text: "constant", points: 0 },
      { text: "steady", points: 0 },
    ],
    explanation: "Cold that makes fingers ache even inside mittens is freezing.",
    reviewNote: "Constant and steady are honest descriptions of a sea wind and fit a neighboring sentence, but neither makes fingers hurt. Chilly is on the cold scale and earns one, yet mittens are enough for chilly. Aching fingers even inside mittens is the evidence for the far end of that scale, so freezing is uniquely right. The stem was rewritten so the blank sits in a plain predicate slot every option fills naturally. Six to eight letters, all plain weather adjectives, no intensifier before the blank.",
  },
  {
    id: "fg-20", d: 4, prompt: "After squeezing under the porch, his shirt was ___ from the collar to the hem.",
    options: [
      { text: "filthy", points: 2 },
      { text: "dirty", points: 1 },
      { text: "damp", points: 0 },
      { text: "torn", points: 0 },
    ],
    explanation: "Covered in muck from top to bottom is filthy, which is far dirtier than dirty.",
    reviewNote: "Damp and torn are real things that happen to a shirt under a porch and both suit a close sentence, but neither is about muck. Dirty is the right scale and scores one, yet one grass stain makes a shirt dirty. From the collar to the hem is the evidence that every part is covered, so filthy is uniquely right. Five to eight letters, all everyday adjectives, same register, no moral word and no color word.",
  },
  // d5: feelings and qualities, about age 9. The sentence supplies the
  // behavior; the child names the shade of feeling that behavior shows.
  {
    id: "fg-21", d: 5, prompt: "She had practiced for weeks, yet her hands still shook, because she felt ___ about the recital.",
    options: [
      { text: "nervous", points: 2 },
      { text: "uneasy", points: 1 },
      { text: "eager", points: 0 },
      { text: "curious", points: 0 },
    ],
    explanation: "Shaking hands just before you perform is what feeling nervous looks like.",
    reviewNote: "Eager and curious are genuine feelings before a recital and both fit a close sentence, but neither makes hands shake. Uneasy is the right direction and earns one, yet uneasy is a vague background discomfort with no particular event attached. Shaking hands tied to one coming performance is the evidence, so nervous is uniquely right. Six and seven letters across all four, all plain feeling adjectives, key absent from the stem, nothing moralized.",
  },
  {
    id: "fg-22", d: 5, prompt: "Nadia had only two cookies left, and she handed one to her cousin, which was ___ of her.",
    options: [
      { text: "generous", points: 2 },
      { text: "kind", points: 1 },
      { text: "polite", points: 0 },
      { text: "sensible", points: 0 },
    ],
    explanation: "Giving away half of the little you have left is generous.",
    reviewNote: "Polite and sensible are real ways to describe an action and both suit a neighboring sentence, but sharing your last food is neither good manners nor a shrewd move. Kind is the right direction and scores one, yet holding a door is kind too. Only two left and she gave one away is the evidence about cost to herself, so generous is uniquely right. Four to eight letters, all adjectives, and no moral cue sits in the key alone since kind and polite carry it too.",
  },
  {
    id: "fg-23", d: 5, prompt: "Even after everyone showed him the rule in the book, Sam would not change his answer, because he can be ___ about things.",
    options: [
      { text: "stubborn", points: 2 },
      { text: "determined", points: 1 },
      { text: "forgetful", points: 0 },
      { text: "confused", points: 0 },
    ],
    explanation: "Refusing to change your mind even after being shown the rule is being stubborn.",
    reviewNote: "Forgetful and confused would each explain a mistaken answer and both work in a close sentence, but neither explains refusing after the rule was shown. Determined takes one because it names sticking to something, yet determined people bend when the facts arrive. Even after everyone showed him is the evidence, so stubborn is uniquely right. The intensifier was dropped from the stem so nothing is picked on grammar. Eight to ten letters, syllables run two, three, three and two so the key is not the odd one out, and the key is not the longest option.",
  },
  {
    id: "fg-24", d: 5, prompt: "Nana knitted her a scarf, and Aoife wrote a card to tell her how ___ she felt.",
    options: [
      { text: "grateful", points: 2 },
      { text: "delighted", points: 1 },
      { text: "surprised", points: 0 },
      { text: "impressed", points: 0 },
    ],
    explanation: "Writing a card to thank the person who gave you something shows you feel grateful.",
    reviewNote: "Surprised and impressed are believable reactions to a handmade scarf and each fits a nearby sentence, but neither is aimed at the giver. Delighted earns one because it is warm and true, yet it is about the scarf rather than about Nana. Writing a card to tell her is the evidence that the feeling points back at the person, so grateful is uniquely right. Eight and nine letters, all feeling adjectives, matched register, no stem echo.",
  },
  {
    id: "fg-25", d: 5, prompt: "The door banged shut behind her without any warning, and she jumped, feeling ___.",
    options: [
      { text: "startled", points: 2 },
      { text: "surprised", points: 1 },
      { text: "annoyed", points: 0 },
      { text: "delighted", points: 0 },
    ],
    explanation: "Jumping at a bang you never saw coming is being startled.",
    reviewNote: "Annoyed and delighted are real feelings after a door bangs and each fits a close sentence, but neither explains why she jumped. Surprised is the right direction and earns one, yet you can be surprised slowly by news that arrives in a letter. Banged shut without any warning and she jumped is the evidence for a fright that lands in one instant, so startled is uniquely right. Seven to nine letters, all feeling adjectives in one register, key absent from the stem, nothing moralized and nothing cruel.",
  },
  // d6: the same skill one shade finer, about age 10. Both credited words are
  // adult vocabulary, so the choice cannot be made on register.
  {
    id: "fg-26", d: 6, prompt: "Tom did not want the spicy stew at all, but he took one small bite to be polite, so he was ___.",
    options: [
      { text: "reluctant", points: 2 },
      { text: "hesitant", points: 1 },
      { text: "puzzled", points: 0 },
      { text: "impatient", points: 0 },
    ],
    explanation: "Doing the thing you truly did not want to do is being reluctant.",
    reviewNote: "Puzzled and impatient are real states at a dinner table and each suits a neighboring sentence, but neither is about not wanting the food. Hesitant scores one because it names holding back, yet hesitating is a pause that can end either way. He did not want it at all and still took a bite is the evidence, so reluctant is uniquely right. Seven to nine letters, all feeling adjectives, and the key is not the only long word.",
  },
  {
    id: "fg-27", d: 6, prompt: "He changed the subject every time she asked about the broken window, which made her ___.",
    options: [
      { text: "suspicious", points: 2 },
      { text: "uncertain", points: 1 },
      { text: "indifferent", points: 0 },
      { text: "defensive", points: 0 },
    ],
    explanation: "Dodging the same question again and again makes people suspicious that something is being hidden.",
    reviewNote: "Indifferent and defensive are believable reactions to a person changing the subject and both fit a close sentence, but she has nothing to defend and she plainly still cares, so neither answers the dodging itself. Uncertain earns one because she is left not knowing, yet uncertainty has no direction. Every time she asked is the evidence for a pattern that points at him, so suspicious is uniquely right. Nine and ten letters across the four, all feeling adjectives, key absent from the stem.",
  },
  {
    id: "fg-28", d: 6, prompt: "The zipper stuck for the tenth time, and Aoife threw the jacket down because she was so ___.",
    options: [
      { text: "frustrated", points: 2 },
      { text: "irritated", points: 1 },
      { text: "embarrassed", points: 0 },
      { text: "surprised", points: 0 },
    ],
    explanation: "Being blocked over and over by the same thing leaves you frustrated.",
    reviewNote: "Embarrassed and surprised are honest feelings in a similar sentence, but a stuck zipper on the tenth try is neither shameful nor unexpected. Irritated is the right direction and takes one, yet irritation is about a single annoyance rather than a blocked goal. For the tenth time is the evidence for repeated blocking, so frustrated is uniquely right. Nine to eleven letters, all feeling adjectives in the same register, and the key is not the longest.",
  },
  {
    id: "fg-29", d: 6, prompt: "The lost puppy trotted up the path at last, and Dad let out a long breath because he felt ___.",
    options: [
      { text: "relieved", points: 2 },
      { text: "pleased", points: 1 },
      { text: "confused", points: 0 },
      { text: "hopeful", points: 0 },
    ],
    explanation: "That long breath out when a worry finally ends is feeling relieved.",
    reviewNote: "Confused and hopeful are real feelings around a missing pet and each fits a close sentence, but nothing here is muddled and hopeful belongs to the waiting rather than to the end of it. Pleased scores one because he is glad, yet pleased would fit a puppy that had never been lost. At last plus the long breath is the evidence that a fear lifted, so relieved is uniquely right. Seven and eight letters throughout.",
  },
  {
    id: "fg-30", d: 6, prompt: "She had swum that distance twenty times in practice, so she stepped onto the starting block feeling ___.",
    options: [
      { text: "confident", points: 2 },
      { text: "certain", points: 1 },
      { text: "anxious", points: 0 },
      { text: "distracted", points: 0 },
    ],
    explanation: "Twenty practice swims give you confident trust in what your own body can do.",
    reviewNote: "Anxious and distracted are genuine race day feelings and both suit a nearby sentence, but neither comes from having practiced. Certain is the right direction and earns one, yet no swimmer can be certain of a race, only sure of herself. Twenty times in practice is the evidence about her own ability, so confident is uniquely right. Lengths run seven, seven, nine and ten so the key is neither the longest nor the odd one out, and there is no stem echo.",
  },
  // d7: academic adjectives, about age 11. All four options are words an
  // adult would use; only the sentence separates them.
  {
    id: "fg-31", d: 7, prompt: "The hollow eggshell broke the moment her thumb pressed it, showing just how ___ it was.",
    options: [
      { text: "fragile", points: 2 },
      { text: "delicate", points: 1 },
      { text: "flexible", points: 0 },
      { text: "polished", points: 0 },
    ],
    explanation: "Something that breaks under the lightest press is fragile.",
    reviewNote: "Flexible and polished are true of other shells and objects and each fits a close sentence, but flexible things bend instead of breaking and polish has nothing to do with strength. Delicate scores one because it is in the same family, yet delicate is mainly about being finely made and a delicate chain does not break at a touch. Broke the moment her thumb pressed it is the evidence, so fragile is uniquely right. Seven and eight letters, matched register.",
  },
  {
    id: "fg-32", d: 7, prompt: "Even after being carried back to his bed four times, the puppy kept scratching at the door, so he was ___.",
    options: [
      { text: "persistent", points: 2 },
      { text: "insistent", points: 1 },
      { text: "affectionate", points: 0 },
      { text: "forgetful", points: 0 },
    ],
    explanation: "Trying again after being stopped four separate times is being persistent.",
    reviewNote: "Affectionate and forgetful are believable of any puppy and both fit a neighboring sentence, but a puppy who wants the door does not want a cuddle and nothing here is forgotten. Insistent earns one because it names demanding what you want, yet insisting happens in one moment while the sentence spans four. Carried back four times and still going is the evidence for continuing through setbacks, so persistent is uniquely right. The intensifier was dropped from the stem.",
  },
  {
    id: "fg-33", d: 7, prompt: "The hill never rose sharply anywhere, and the climb was so ___ that we barely noticed we were going up.",
    options: [
      { text: "gradual", points: 2 },
      { text: "easy", points: 1 },
      { text: "muddy", points: 0 },
      { text: "unusual", points: 0 },
    ],
    explanation: "A rise so slow and even that you hardly notice it is gradual.",
    reviewNote: "Muddy and unusual are honest trail words that fit a close sentence, but a muddy path can still rise evenly and an unusual one would be noticed at once. Easy takes one because a rise like this is not hard work, yet easy measures the effort while the sentence measures the rise. Barely noticed we were going up is the evidence for change spread evenly over distance, so gradual is uniquely right. Four to seven letters, all plain adjectives, no stem echo.",
  },
  {
    id: "fg-34", d: 7, prompt: "The old truck started on the first try every single morning for twenty years, so Grandpa called it ___.",
    options: [
      { text: "reliable", points: 2 },
      { text: "sturdy", points: 1 },
      { text: "valuable", points: 0 },
      { text: "roomy", points: 0 },
    ],
    explanation: "Something you can count on every single time is reliable.",
    reviewNote: "Valuable and roomy are real ways to praise a truck and both fit a nearby sentence, but neither follows from starting on the first try. Sturdy scores one because it points at good build, yet a sturdy engine can still refuse to start. Every single morning for twenty years is the evidence about dependability over time, so reliable is uniquely right. Six to eight letters, all adjectives of the same frequency band, key absent from the stem.",
  },
  {
    id: "fg-35", d: 7, prompt: "Nobody had to guess who ate the pie, because the crumbs on the puppy's nose made it ___.",
    options: [
      { text: "obvious", points: 2 },
      { text: "likely", points: 1 },
      { text: "amusing", points: 0 },
      { text: "curious", points: 0 },
    ],
    explanation: "An answer nobody even has to think about is obvious.",
    reviewNote: "Amusing is true of the picture and curious means strange, yet both are natural words in a close sentence and neither answers what the crumbs did to the question. Likely earns one because the crumbs really do point at the puppy, yet likely still leaves room for somebody else. Nobody had to guess is the evidence that no working out was needed at all, so obvious is uniquely right. Six and seven letters, same register throughout.",
  },
  // d8: academic adjectives one step finer, about age 12. The 1 point word is
  // a real synonym that misses one feature the sentence supplies.
  {
    id: "fg-36", d: 8, prompt: "Blackberries were so ___ along the lane that we filled four buckets and still left most of them behind.",
    options: [
      { text: "abundant", points: 2 },
      { text: "common", points: 1 },
      { text: "fragrant", points: 0 },
      { text: "juicy", points: 0 },
    ],
    explanation: "So many that four buckets hardly make a dent means the berries were abundant.",
    reviewNote: "Fragrant and juicy both describe real ripe bramble, so both fit a neighboring sentence and neither says how many berries there are. Common takes one because it means often found, yet common is about how widely a thing occurs rather than how much of it is here now. Filled four buckets and left most behind is the evidence for sheer quantity, so abundant is uniquely right. Six to nine letters, matched register.",
  },
  {
    id: "fg-37", d: 8, prompt: "He looked straight at her, then pushed the vase off the shelf with one finger, so what he did was ___.",
    options: [
      { text: "deliberate", points: 2 },
      { text: "planned", points: 1 },
      { text: "sudden", points: 0 },
      { text: "mysterious", points: 0 },
    ],
    explanation: "Choosing to do something while watching the other person makes the act deliberate.",
    reviewNote: "Sudden and mysterious are ordinary words for an act with a broken vase and each fits a close sentence, but he looked first and pushed with one finger, so nothing was hurried and nothing was hidden. Planned scores one because it also rules out accident, yet planning means working it out beforehand and the sentence shows only the moment. Looked straight at her then pushed is the evidence for on purpose, so deliberate is uniquely right.",
  },
  {
    id: "fg-38", d: 8, prompt: "The rope walkway was only meant to last until the new bridge opened, so everyone knew it was ___.",
    options: [
      { text: "temporary", points: 2 },
      { text: "fleeting", points: 1 },
      { text: "risky", points: 0 },
      { text: "expensive", points: 0 },
    ],
    explanation: "Something built to be replaced later is temporary.",
    reviewNote: "Risky and expensive are true of many rope walkways and both fit a nearby sentence, but neither follows from the clause about the new bridge. Fleeting earns one because it also means short lasting, yet fleeting belongs to moments and feelings while this sentence is about a structure standing in for another. Only meant to last until the new bridge opened is the evidence, so temporary is uniquely right. Five to nine letters, all adjectives, no stem echo and no register cue.",
  },
  {
    id: "fg-39", d: 8, prompt: "You can hike without a map or a hat, but water is ___ on a day this hot.",
    options: [
      { text: "essential", points: 2 },
      { text: "useful", points: 1 },
      { text: "optional", points: 0 },
      { text: "heavy", points: 0 },
    ],
    explanation: "Something you truly cannot go without is essential.",
    reviewNote: "Optional and heavy are real words about supplies on a hike and each fits a close sentence, but the contrast with the map and the hat rules out optional and the weight of a bottle is not the point. Useful takes one because water certainly helps, yet the map is useful too and the sentence has just set it aside. The contrast between what you can skip and what you cannot is the evidence, so essential is uniquely right.",
  },
  {
    id: "fg-40", d: 8, prompt: "Guessing at half a cup will ruin the cake, so a recipe needs measurements that are ___.",
    options: [
      { text: "precise", points: 2 },
      { text: "correct", points: 1 },
      { text: "sensible", points: 0 },
      { text: "familiar", points: 0 },
    ],
    explanation: "Measurements that have to be exact to the last spoonful are precise.",
    reviewNote: "Sensible and familiar are true of good recipes and both fit a neighboring sentence, but neither is about exactness. Correct scores one because a mistaken amount does ruin a cake, yet correct only means not mistaken and about half a cup can be correct in a stew. Guessing at half a cup will ruin it is the evidence for fine exactness rather than mere accuracy, so precise is uniquely right. Seven and eight letters throughout, same register.",
  },
  // d9: precise academic vocabulary, about age 13. Abstract nouns sit beside
  // abstract nouns and abstract adjectives beside abstract adjectives, so no
  // option can be dropped for being a physical object.
  {
    id: "fg-41", d: 9, prompt: "Nobody could prove it either way, but his story fit every fact they already knew, so they called it ___.",
    options: [
      { text: "plausible", points: 2 },
      { text: "possible", points: 1 },
      { text: "peculiar", points: 0 },
      { text: "confusing", points: 0 },
    ],
    explanation: "A story that fits all the known facts sounds plausible, even before anyone can prove it.",
    reviewNote: "Peculiar and confusing are real verdicts on a story and each fits a close sentence, but neither follows from a story that fits every fact. Possible earns one because it also survives the lack of proof, yet possible only means not ruled out and a wild tale can be possible. Fit every fact they already knew is the evidence for positive support, so plausible is uniquely right. Eight and nine letters, all adjectives, same register, no stem echo.",
  },
  {
    id: "fg-42", d: 9, prompt: "Before she touched a single seed, Rosa wrote down that the plants under the lamp would grow taller, and that sentence was her ___.",
    options: [
      { text: "hypothesis", points: 2 },
      { text: "theory", points: 1 },
      { text: "conclusion", points: 0 },
      { text: "reason", points: 0 },
    ],
    explanation: "The testable sentence you write before an experiment is your hypothesis.",
    reviewNote: "Conclusion and reason are genuine science words and each fits a nearby sentence, but a conclusion comes after the results and a reason says why she expects something rather than what she expects. Theory scores one because it names an idea about how things work, yet a theory is a broad explanation already backed by evidence. Before she touched a single seed is the evidence that this is the statement written to be tested, so hypothesis is uniquely right. All four are abstract nouns of six to ten letters.",
  },
  {
    id: "fg-43", d: 9, prompt: "Every label on her rock collection carried the same neat handwriting, the date, and the exact spot the stone was found, which showed how ___ she was.",
    options: [
      { text: "meticulous", points: 2 },
      { text: "organized", points: 1 },
      { text: "ambitious", points: 0 },
      { text: "adventurous", points: 0 },
    ],
    explanation: "Caring about every tiny detail like that is being meticulous.",
    reviewNote: "Ambitious and adventurous are believable of a rock collector and both fit a close sentence, but neither is shown by the labels themselves. Organized takes one because the collection clearly has a system, yet organized is about arrangement and a tidy box can hold blank labels. The date and the exact spot on every single label is the evidence about fine detail, so meticulous is uniquely right. Nine to eleven letters, all character adjectives, key not the longest.",
  },
  {
    id: "fg-44", d: 9, prompt: "Losing her turn on the trampoline was the ___ she had been warned about for breaking the same rule twice.",
    options: [
      { text: "consequence", points: 2 },
      { text: "result", points: 1 },
      { text: "reminder", points: 0 },
      { text: "explanation", points: 0 },
    ],
    explanation: "What follows from a choice you made, and follows because you made it, is the consequence.",
    reviewNote: "Reminder and explanation are real nouns for this slot and each fits a nearby sentence, but a lost turn does not explain the rule breaking and it is more than a nudge to remember. Result earns one because it also names what came after, yet a result can follow anything at all, including luck. She had been warned about it is the evidence that this outcome was named in advance as what the rule breaking would bring, so consequence is uniquely right. All four are abstract nouns.",
  },
  {
    id: "fg-45", d: 9, prompt: "The note said to meet by the tall tree, but there were two tall trees, so the message was ___.",
    options: [
      { text: "ambiguous", points: 2 },
      { text: "unclear", points: 1 },
      { text: "anonymous", points: 0 },
      { text: "playful", points: 0 },
    ],
    explanation: "A message that can honestly be read two different ways is ambiguous.",
    reviewNote: "Anonymous and playful are real descriptions of a note and both fit a close sentence, but neither has anything to do with there being two trees. Unclear scores one because the reader is left not knowing, yet unclear covers messy handwriting too. Two tall trees is the evidence that the words have exactly two good readings, so ambiguous is uniquely right. Seven to ten letters, all adjectives, matched register, key absent from the stem.",
  },
  // d10: the finest distinctions in the bank, about age 13. Both credited
  // options are academic words; only the evidence in the sentence separates.
  {
    id: "fg-46", d: 10, prompt: "Once the last stone at the bottom slipped, the whole wall coming down was ___.",
    options: [
      { text: "inevitable", points: 2 },
      { text: "predictable", points: 1 },
      { text: "silent", points: 0 },
      { text: "regrettable", points: 0 },
    ],
    explanation: "Something that can no longer be stopped by anyone is inevitable.",
    reviewNote: "Silent and regrettable are honest descriptions of a collapsing wall and each fits a nearby sentence, but neither says anything about whether it had to happen. Predictable takes one because anyone watching could see it coming, yet being easy to foresee is not the same as being impossible to stop. Once the last stone slipped is the evidence that the outcome was locked in, so inevitable is uniquely right. Six to eleven letters, all adjectives, key not the longest.",
  },
  {
    id: "fg-47", d: 10, prompt: "He never asked whether she could swim and simply took it for granted, and that ___ nearly ended in trouble.",
    options: [
      { text: "assumption", points: 2 },
      { text: "guess", points: 1 },
      { text: "warning", points: 0 },
      { text: "suggestion", points: 0 },
    ],
    explanation: "Treating something as true without ever checking it is an assumption.",
    reviewNote: "Warning and suggestion are real nouns for something said between two people and each fits a close sentence, but he said nothing at all. Guess earns one because he also did not know, yet a guess is made knowing you might be mistaken, and he was not weighing anything. Never asked and simply took it for granted is the evidence, so assumption is uniquely right. All four are abstract nouns of five to ten letters in one register.",
  },
  {
    id: "fg-48", d: 10, prompt: "Three of his fish stories had already turned out to be invented, so this time the family listened politely and asked for proof, staying ___.",
    options: [
      { text: "skeptical", points: 2 },
      { text: "doubtful", points: 1 },
      { text: "hopeful", points: 0 },
      { text: "indifferent", points: 0 },
    ],
    explanation: "Holding back belief until proof arrives is staying skeptical.",
    reviewNote: "Hopeful and indifferent are real stances a listener can take and both fit a nearby sentence, but the family neither took his side nor stopped caring, since they asked for proof. Doubtful scores one because it also withholds belief, yet doubtful simply leans against believing. Listened politely and asked for proof is the evidence for a stance that would change given evidence, so skeptical is uniquely right.",
  },
  {
    id: "fg-49", d: 10, prompt: "He said he had never been inside the shed, then described the fresh paint on its walls, and the family noticed the ___.",
    options: [
      { text: "contradiction", points: 2 },
      { text: "mistake", points: 1 },
      { text: "exaggeration", points: 0 },
      { text: "coincidence", points: 0 },
    ],
    explanation: "Two statements that cannot both be true at once make a contradiction.",
    reviewNote: "Exaggeration and coincidence are genuine nouns for something odd in a story and each fits a close sentence, but nothing here was stretched and nothing lined up by chance. Mistake earns one because something has certainly gone amiss, yet mistake covers a slip of memory or a misheard word. Never been inside set against describing the paint inside is the evidence for two claims that clash, so contradiction is uniquely right. All four are abstract nouns.",
  },
  {
    id: "fg-50", d: 10, prompt: "Every single cousin raised a hand for pizza, so the choice was ___.",
    options: [
      { text: "unanimous", points: 2 },
      { text: "popular", points: 1 },
      { text: "spontaneous", points: 0 },
      { text: "hasty", points: 0 },
    ],
    explanation: "When everybody agrees with no one left out, the choice is unanimous.",
    reviewNote: "Spontaneous and hasty are real ways to describe a group decision and both fit a nearby sentence, but neither follows from counting the hands. Popular takes one because plenty of people wanted it, yet popular allows a few holdouts. Every single cousin is the evidence that not one person differed, so unanimous is uniquely right. Seven to ten letters, all adjectives, same register, no stem echo, and no option carries a moral cue.",
  },
];
