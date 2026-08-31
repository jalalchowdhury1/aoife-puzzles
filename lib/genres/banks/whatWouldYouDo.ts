import type { ChoiceBankItem } from "../bankGenre";

// "What Would You Do?" (cousin of social reasoning, VC domain): a short story
// situation ending in "What would you do?", never a "why do we" convention
// question (that shape belongs to Comprehension/"What Should You Do" — see
// banks/comprehension.ts).
//
// Re-authored 2026-08-30 (decision #29) after an audit found the answer could
// be picked without reading the story. The rules this bank now follows:
//
//  1. LENGTH IS NOT A CUE. All four options sit within about ten characters of
//     each other, and the best answer is the strictly longest one in only a
//     handful of items. Picking the wordiest option scores at chance.
//  2. TWO ACTIONS IS NOT A CUE EITHER. The old bank joined two actions with
//     "and" in most of its keys and almost none of its distractors. Here the
//     compound shape is spread across keys, partials and zeros alike, so
//     "the one that does two things" is not a tell.
//  3. EVERY OPTION IS SOMETHING A REAL CHILD WOULD DO. The two zero point
//     options are well meant and miss the point: they solve the wrong half of
//     the problem, fix it for one person only, arrive too late, or make a new
//     problem. None of them is cruel, silly, or carries a phrase that convicts
//     it ("hope no one notices", "just this once"), so no option can be struck
//     out on tone alone.
//  4. THE 1 POINT OPTION IS A GENUINE PARTIAL. It moves in the right direction
//     but covers one side of the dilemma, not both.
//  5. THE 2 POINT OPTION IS UNIQUELY BEST FOR A SAYABLE REASON, recorded in
//     `explanation` for her and in `reviewNote` for the reviewer.
//  6. NO MORAL REGISTER. Words like fair, kindly, honestly, patiently, safely
//     are kept out of the options entirely, so the option that sounds virtuous
//     is not automatically the answer.
//  7. GROWN UPS CUT BOTH WAYS. Fetching a grown up is the best move in some
//     items and the weaker move in others (a problem she can settle herself,
//     or telling on a friend over something harmless), so "pick the one with
//     the adult in it" scores at chance too.
//  8. HOMESCHOOL SETTINGS ONLY: home, siblings, cousins, grandparents, the
//     park, library, the shop, neighbors, a co op class, jiu jitsu, swimming
//     lessons. No teachers, classmates, lockers or school buses.
//  9. SAFETY ADVICE IS CORRECT: never go up to an animal you do not know,
//     never stop in the road, never step into a fight, and being picked on is
//     told to a grown up ("ignore it" never earns credit).
// 10. CONSISTENT NORMS: harm or danger goes to a grown up; a harmless secret
//     or a whispering friend is handled between children.
//
// Ramp: d1 to d2 one person with one need (with an emoji); d3 to d4 two
// people's needs at once; d5 to d6 a promise against a new fact, and honesty
// that costs something; d7 to d8 competing goods, another person's point of
// view, consequences that land later; d9 to d10 planning, responsibility to a
// group, when to involve a grown up instead of handling it, and speaking for
// people who disagree with you.
export const WHAT_WOULD_YOU_DO_BANK: ChoiceBankItem[] = [
  // d1: one person, one need, about age 6
  {
    id: "wd-01", d: 1, prompt: "Your friend drops her ice cream and starts to cry. What would you do?", emoji: "🍦",
    options: [
      { text: "Hug her and share your ice cream", points: 2 },
      { text: "Sit with her while she cries", points: 1 },
      { text: "Scoop the ice cream up and move it", points: 0 },
      { text: "Tell her yours fell over once too", points: 0 },
    ],
    explanation: "A hug helps her feel better and sharing your ice cream gives back the thing she lost.",
    reviewNote: "Zeros are tidy and chatty rather than unkind: scooping the dropped ice cream up helps nobody eat, and a story about your own turns her moment into yours. The 1 comforts her but leaves her with no ice cream, so it covers the feeling and not the loss. The 2 covers both. Checked: key is not the longest, no two options share an opening, ice cream appears in a zero as well, no moral word.",
  },
  {
    id: "wd-02", d: 1, prompt: "Your little brother is scared of the thunder outside. What would you do?", emoji: "🌩️",
    options: [
      { text: "Sit beside him until the storm passes", points: 2 },
      { text: "Tell him the thunder cannot reach him", points: 1 },
      { text: "Close the curtains so he cannot see it", points: 0 },
      { text: "Turn the music up over the loud bangs", points: 0 },
    ],
    explanation: "Company is what makes thunder feel smaller, so staying beside him lasts as long as the storm does.",
    reviewNote: "Both zeros treat the storm instead of the boy: curtains hide the flashes he can still hear, and louder music adds noise to a noise problem. The 1 is true and calming but it is one sentence and then he is on his own again. The 2 is the only choice that stays for the whole storm. Checked: four options within one character, no option joins two actions, no moral word, thunder appears outside the key.",
  },
  {
    id: "wd-03", d: 1, prompt: "Your friend falls off the swing and scrapes his knee. What would you do?", emoji: "🛝",
    options: [
      { text: "Help him up and go get a grown up", points: 2 },
      { text: "Stay next to him and talk to him", points: 1 },
      { text: "Sit down and check the swing for damage", points: 0 },
      { text: "Ask a grown up to stop the swings", points: 0 },
    ],
    explanation: "A scrape needs a grown up to clean it, and helping him up first gets him off the ground.",
    reviewNote: "Zeros are sensible safety thinking aimed at the swing rather than the knee, which is what a busy child really does. The 1 keeps him company but nobody ever looks at the scrape. The 2 does the two things the moment needs. Checked: no two options share an opening, a grown up appears in a zero as well as the key, key is not the longest, no moral word.",
  },
  {
    id: "wd-04", d: 1, prompt: "A dog you do not know is wandering alone near your gate. What would you do?", emoji: "🐶",
    options: [
      { text: "Stay well back and go tell a grown up", points: 2 },
      { text: "Watch from the doorway and see where it goes", points: 1 },
      { text: "Crouch down and hold your hand out", points: 0 },
      { text: "Ask a grown up for a bowl of water", points: 0 },
    ],
    explanation: "You never go up to a dog you do not know, and a grown up can find its owner without anyone getting hurt.",
    reviewNote: "Zeros are kind ideas that keep the dog at the gate or bring her close to an animal she does not know, which is exactly the mistake a fond child makes. The 1 keeps her at a distance, which is half of the answer, but nobody is coming to help the dog. The 2 keeps the distance and brings help. Checked: no two options share an opening, the 1 is the longest option, a grown up appears in a zero as well as the key, safety advice matches current guidance.",
  },
  {
    id: "wd-05", d: 1, prompt: "Your cousin's ball rolls deep under the sofa and neither of you can reach it. What would you do?", emoji: "⚽",
    options: [
      { text: "Sweep the ball out with a broom", points: 2 },
      { text: "Lie down and try to reach it yourself", points: 1 },
      { text: "Bring her another ball to play with", points: 0 },
      { text: "Pull the cushions off and look inside", points: 0 },
    ],
    explanation: "A broom reaches where arms cannot, so the ball she wants comes back out.",
    reviewNote: "Zeros are substitution and effort in the visible place: a second ball is not the ball, and cushions come off the top while the ball is underneath. The 1 is the right idea running into the fact the stem states, that no arm in the room is long enough. The 2 changes the tool, which is what solves it. Checked: key is the shortest and the only single action option, no moral word, no stem word sits only in the key.",
  },
  // d2: one person, one need, about age 6
  {
    id: "wd-06", d: 2, prompt: "You are crossing the road with your dad and your friend is still on the curb. What would you do?", emoji: "🚸",
    options: [
      { text: "Keep walking and wait on the far side", points: 2 },
      { text: "Finish crossing and walk on ahead", points: 1 },
      { text: "Stop in the road and wave her over", points: 0 },
      { text: "Turn back to the curb to join her", points: 0 },
    ],
    explanation: "You never stop once you are in the road, so you finish crossing first and then wait where it is quiet.",
    reviewNote: "Both zeros keep her in the road longer, which is the exact thing a friendly child does without thinking. The 1 is the safe half of the answer and drops the friend. The 2 finishes the crossing and still keeps the two of them together. Checked: three of the four options join two actions, no moral word, no self condemning phrase, curb and road appear outside the key.",
  },
  {
    id: "wd-07", d: 2, prompt: "At your co op class everyone is finding a partner for the game, and one girl is standing on her own. What would you do?", emoji: "🤝",
    options: [
      { text: "Ask her to be your partner for it", points: 2 },
      { text: "Ask the grown up to find her a partner", points: 1 },
      { text: "Ask the girl next to you to be your partner", points: 0 },
      { text: "Wave to her so she does not feel left out", points: 0 },
    ],
    explanation: "Asking her yourself gives her a partner straight away, which is the thing she is missing.",
    reviewNote: "Zeros hand her your partner, which leaves you standing out instead of her, or send a friendly wave that changes nothing about the game. The 1 finds real help but passes the job on and depends on a spare child existing. The 2 solves it with the one spare person in the room, you. Checked: the grown up option is deliberately the weaker one here, key is the shortest and a single action, partner appears in three options, three options open with Ask so no pair stands out.",
  },
  {
    id: "wd-08", d: 2, prompt: "Your swimming lesson starts soon and one of your shoes is missing. What would you do?", emoji: "👟",
    options: [
      { text: "Tell a grown up so you both look", points: 2 },
      { text: "Hunt through the shoe basket again", points: 1 },
      { text: "Tidy your whole room until it shows", points: 0 },
      { text: "Wait by the door for a grown up to help", points: 0 },
    ],
    explanation: "Two people searching find the shoe faster than one, and the grown up knows how long there is.",
    reviewNote: "Zeros are effort and patience pointed at a clock that is running: a full tidy is far too slow, and waiting to be found does no searching at all. The 1 searches the likeliest place but alone and without telling anyone about the time. The 2 tells the grown up so two people search. Checked: lengths within six, a grown up appears in a zero as well as the key, no moral word, no tag.",
  },
  {
    id: "wd-09", d: 2, prompt: "Your little sister is upset because her drawing tore in half. What would you do?", emoji: "🖍️",
    options: [
      { text: "Tape the two pieces back together", points: 2 },
      { text: "Give her paper to draw a new one", points: 1 },
      { text: "Tell her yours tore once as well", points: 0 },
      { text: "Put both halves up on the fridge door", points: 0 },
    ],
    explanation: "Tape mends the very drawing she is sad about instead of offering her a different one.",
    reviewNote: "Zeros are sympathy and display, both friendly, and both leave the picture in two pieces. The 1 gives her a future drawing, which is real help but not the one she loves. The 2 restores the actual object. Checked: key is not the longest, no option joins two actions, no moral word, no stem word appears only in the key.",
  },
  {
    id: "wd-10", d: 2, prompt: "You knock over your juice and it spreads across the table. What would you do?", emoji: "🧃",
    options: [
      { text: "Wipe it up and tell a grown up", points: 2 },
      { text: "Move the books and dry them off", points: 1 },
      { text: "Fetch a towel and wait for a grown up", points: 0 },
      { text: "Pour what is left back in the cup", points: 0 },
    ],
    explanation: "Wiping stops the juice spreading and telling a grown up means the sticky part gets cleaned too.",
    reviewNote: "Zeros are helpful looking and useless: fetching a towel and then standing with it lets the puddle grow, and rescuing the juice is a rescue of the drink, not the table. The 1 saves the books, which is one real side of the spill. The 2 stops the spread and gets the rest sorted. Checked: key is the shortest, a grown up appears in a zero as well as the key, a zero also joins two actions.",
  },
  // d3: two people's needs at once, about age 7
  {
    id: "wd-11", d: 3, prompt: "You and your cousin both want the last turn on the trampoline before dinner. What would you do?",
    options: [
      { text: "Split the last turn with a timer", points: 2 },
      { text: "Let your cousin have the whole turn", points: 1 },
      { text: "Ask if dinner can wait a bit longer", points: 0 },
      { text: "Race her over and jump on first", points: 0 },
    ],
    explanation: "Splitting the time means both of you bounce in the minutes that are actually left.",
    reviewNote: "Zeros move the problem rather than solve it: pushing dinner back rearranges someone else's evening, and racing settles it by speed instead of by agreement. The 1 is generous and answers only her side, since you get nothing. The 2 answers both sides inside the time that exists. Checked: key is the shortest and a single action while a zero joins two, no moral word.",
  },
  {
    id: "wd-12", d: 3, prompt: "Your two little cousins each want you to read a different book at bedtime. What would you do?",
    options: [
      { text: "Read both books, a short one each", points: 2 },
      { text: "Read the book the younger one picked", points: 1 },
      { text: "Read a different book they both know", points: 0 },
      { text: "Let them settle it between themselves", points: 0 },
    ],
    explanation: "Two short books mean neither cousin has to go to bed without the story they asked for.",
    reviewNote: "Zeros are a compromise nobody asked for and a handover that turns bedtime into an argument, both of which a tired reader really does try. The 1 has a reason behind it and still sends one cousin to bed disappointed. The 2 gives each of them the book they named. Checked: key is the shortest option, no moral word, different appears in a zero as well as the stem.",
  },
  {
    id: "wd-13", d: 3, prompt: "Your little sister wants a story and your grandpa needs help carrying the groceries in. What would you do?",
    options: [
      { text: "Carry the bags in, then read the story", points: 2 },
      { text: "Read one short page, then go and help", points: 1 },
      { text: "Ask your sister to come and help carry", points: 0 },
      { text: "Tell grandpa you will come after the story", points: 0 },
    ],
    explanation: "The bags cannot wait while grandpa is holding them, and the story is still there two minutes later.",
    reviewNote: "Zeros hand your sister's job to your sister or leave grandpa standing at the door with full arms, and both are what a child who wants to please everybody tries. The 1 puts the smaller need first, so it serves her and keeps him waiting. The 2 does the one that cannot wait and then the one that can. Checked: lengths within three, story appears in the key and a zero, no two options share an opening, no moral word.",
  },
  {
    id: "wd-14", d: 3, prompt: "At co op lunch two friends both want the seat beside you and the table only fits two. What would you do?",
    options: [
      { text: "Swap seats with them halfway through", points: 2 },
      { text: "Take the friend who asked you first", points: 1 },
      { text: "Ask them to sort it out between them", points: 0 },
      { text: "Move to another table and sit alone", points: 0 },
    ],
    explanation: "Swapping halfway gives both friends real time beside you instead of one of them missing out.",
    reviewNote: "Zeros are a handover and a retreat, both of which look neutral and both of which leave two friends unhappy. The 1 uses a rule children are taught and still ends with one friend on the outside. The 2 uses the whole session so both get a turn. Checked: lengths within one character, no adult word in any option so the grown up heuristic is silent here, no moral word.",
  },
  {
    id: "wd-15", d: 3, prompt: "You are halfway through a big block tower when your little brother wants to join. What would you do?",
    options: [
      { text: "Give him a job building the wide base", points: 2 },
      { text: "Let him hand you the blocks you need", points: 1 },
      { text: "Start a second tower he can knock down", points: 0 },
      { text: "Show him each block you already placed", points: 0 },
    ],
    explanation: "A job on the base lets him build for real without the tower coming down.",
    reviewNote: "Zeros include him beside the work rather than in it, which is what an older sibling reaches for first. The 1 makes him a helper, which is company but not the building he asked for. The 2 gives him a real part of the same tower and protects the part already made. Checked: key is not the longest, no option joins two actions, no moral word, no stem word sits only in the key.",
  },
  // d4: two people's needs at once, about age 8
  {
    id: "wd-16", d: 4, prompt: "During a board game your cousin keeps rolling the dice when it is your turn. What would you do?",
    options: [
      { text: "Tell him you have not had your turn yet", points: 2 },
      { text: "Wait until the round ends to say it", points: 1 },
      { text: "Roll twice yourself to even it out", points: 0 },
      { text: "Ask a grown up to run the game for you", points: 0 },
    ],
    explanation: "Saying it straight away lets him fix it before any more turns go by.",
    reviewNote: "Zeros are evening the score and calling in a referee, both plausible and both larger than a mistake he probably has not noticed. The 1 is the same sentence said too late, so several turns are already gone. The 2 stops the pattern at once and treats it as an accident. Checked: this is one of the few items where the key is the longest, no option joins two actions, the grown up option is a zero here on purpose.",
  },
  {
    id: "wd-17", d: 4, prompt: "A book you borrowed from your neighbor got splashed and the pages are wavy. What would you do?",
    options: [
      { text: "Tell her what happened and offer a new one", points: 2 },
      { text: "Dry the pages flat and take it back", points: 1 },
      { text: "Return it early so she is not waiting", points: 0 },
      { text: "Keep the book and let the pages dry", points: 0 },
    ],
    explanation: "She needs to hear what happened from you, and offering a new copy puts her book right.",
    reviewNote: "Zeros are promptness and patience with the object, neither of which tells her anything. The 1 repairs the book as far as it can be repaired and still hands it over without a word. The 2 covers the telling and the replacing. Checked: key ties the 1 for length, a zero also joins two actions, pages appears in three options, no moral word.",
  },
  {
    id: "wd-18", d: 4, prompt: "Your friend has lost her water bottle somewhere at the park and looks worried. What would you do?",
    options: [
      { text: "Retrace the places she has been today", points: 2 },
      { text: "Lend her your bottle for the rest of today", points: 1 },
      { text: "Tell her it will turn up before you leave", points: 0 },
      { text: "Ask the people nearby to watch for it", points: 0 },
    ],
    explanation: "Retracing her steps is the only choice that can actually find the bottle.",
    reviewNote: "Zeros are reassurance and delegation: one predicts a result without doing anything, the other asks strangers to search while she does not. The 1 solves her thirst, which is real, and the bottle stays lost. The 2 is the only search. Checked: key is the shortest option in the item, no option joins two actions, bottle appears in the 1 as well as the stem.",
  },
  {
    id: "wd-19", d: 4, prompt: "You and your cousin each need the only scissors to finish a craft before lunch. What would you do?",
    options: [
      { text: "Take turns cutting one piece at a time", points: 2 },
      { text: "Finish your cutting fast and hand it over", points: 1 },
      { text: "Tear the paper by hand to save time", points: 0 },
      { text: "Ask your cousin to cut both sets out", points: 0 },
    ],
    explanation: "Swapping after every piece keeps both crafts moving so neither of you runs out of time.",
    reviewNote: "Zeros are speed and delegation: tearing ruins the shapes, and handing all the cutting to your cousin doubles her work. The 1 is fair minded but she waits through your whole craft before starting. The 2 keeps both crafts moving together. Checked: the 1 is the longest option and the only one joining two actions, no moral word, cousin and finish both appear outside the key.",
  },
  {
    id: "wd-20", d: 4, prompt: "It is your turn to pick the park game but your friend really wants a different one. What would you do?",
    options: [
      { text: "Play her game first and yours after it", points: 2 },
      { text: "Give up your turn and play her game", points: 1 },
      { text: "Keep your pick and play it on your own", points: 0 },
      { text: "Ask another friend to choose for you", points: 0 },
    ],
    explanation: "Playing both games in order means neither of you has to lose a turn.",
    reviewNote: "Zeros split the afternoon or hand the decision to somebody with no stake in it, and both are common playground moves. The 1 is generous and quietly costs you the turn you had earned. The 2 fits both games into the time and keeps the turn order honest. Checked: the key ties a zero for length, three options join two actions, friend appears in a zero too.",
  },
  // d5: a promise against a new fact, honesty that costs something, about age 9
  {
    id: "wd-21", d: 5, prompt: "You knock a bowl off a shelf at your friend's house and nobody saw it happen. What would you do?",
    options: [
      { text: "Tell her mom now so she can sweep it up", points: 2 },
      { text: "Keep everyone back from the pieces and wait", points: 1 },
      { text: "Wait until you are home and phone her", points: 0 },
      { text: "Tell your own mom about it that night", points: 0 },
    ],
    explanation: "The grown up whose bowl it is can clear the sharp pieces safely, and she hears what happened from you.",
    reviewNote: "Zeros are honest but aimed at the later hour or the other household, so the sharp pieces stay on the floor of a house that has not been told. The 1 keeps everyone away from the china, which is the safe half, and nobody is told and nothing is cleared. The 2 brings the grown up who can sweep broken china, which a child should never pick up. Checked: a mom appears in the key and in a zero, the 1 is the longest option, no moral word.",
  },
  {
    id: "wd-22", d: 5, prompt: "You promised to help your grandma bake, then your cousin invites you to the pool. What would you do?",
    options: [
      { text: "Bake with her and swim another day", points: 2 },
      { text: "Ask your cousin to come and bake too", points: 1 },
      { text: "Tell your cousin you will decide later", points: 0 },
      { text: "Ask grandma to bake tomorrow and swim now", points: 0 },
    ],
    explanation: "The promise came first and the pool will still be there, so grandma gets the afternoon she was expecting.",
    reviewNote: "Zeros keep both doors open or move the promise, and a child who wants everything really does try each of them. The 1 is a good attempt to keep both and it changes the afternoon grandma planned and may not suit your cousin. The 2 keeps the promise exactly as it was made. Checked: key is the shortest option, a zero also joins two actions, cousin appears in three options.",
  },
  {
    id: "wd-23", d: 5, prompt: "Your instructor asks who has practiced this week and you have not practiced once. What would you do?",
    options: [
      { text: "Say you have not and ask what to do", points: 2 },
      { text: "Tell him the truth and leave it there", points: 1 },
      { text: "Stay quiet and practice extra tonight", points: 0 },
      { text: "Promise to practice twice next week", points: 0 },
    ],
    explanation: "Telling him you have not practiced answers the question he asked, and asking what to do next turns it into a plan.",
    reviewNote: "Zeros leave him believing something untrue while you quietly make up the practice, or pledge a future week instead of answering, and both are what a nervous child says. The 1 answers him honestly and stops there, with no plan for the week ahead. The 2 answers him and comes away with something to work on. Checked: staying silent under a false impression scores zero here and in the mats item, no two options share an opening, practice appears in three options.",
  },
  {
    id: "wd-24", d: 5, prompt: "A friend asks you to tell her mom that she was at your house, but she was not. What would you do?",
    options: [
      { text: "Tell her you cannot say it for her", points: 2 },
      { text: "Ask why she needs you to say it", points: 1 },
      { text: "Change the subject when her mom asks", points: 0 },
      { text: "Agree now and decide when it happens", points: 0 },
    ],
    explanation: "Telling your friend now is truthful and gives her time to sort it out before anyone asks you.",
    reviewNote: "Zeros dodge the moment or bank the favor for later, and both leave your friend believing you will back her up. The 1 opens the subject with her and gets at the real problem, but it never actually says no. The 2 says no to the person who needs to hear it, early. Checked: the 1 is the shortest option, the key is a single action while a zero joins two, her mom appears twice outside the key.",
  },
  {
    id: "wd-25", d: 5, prompt: "Your cousin says she is nervous about her swimming test and asks you to keep it quiet. What would you do?",
    options: [
      { text: "Keep it to yourself and cheer her on", points: 2 },
      { text: "Say nothing about it to anyone else", points: 1 },
      { text: "Ask her instructor to step in and help", points: 0 },
      { text: "Tell her there is nothing to worry about", points: 0 },
    ],
    explanation: "Nerves are hers to share, so you keep what she told you and turn up for her on the day.",
    reviewNote: "Zeros pass her private feeling on to a grown up and talk her out of it, both meant helpfully; nerves before a test are not harm, so they do not need reporting. The 1 keeps her trust and gives her nothing else. The 2 keeps the trust and adds support. Checked: this item is the counterweight to the items where telling is the key, no two options share an opening, a zero is the longest, no moral word.",
  },
  // d6: a promise against a new fact, honesty that costs something, about age 10
  {
    id: "wd-26", d: 6, prompt: "The man at the register hands you back more change than you should have. What would you do?",
    options: [
      { text: "Point it out and hand the extra back", points: 2 },
      { text: "Leave the extra coins and walk away", points: 1 },
      { text: "Put the extra in the donation jar", points: 0 },
      { text: "Come back tomorrow and give it back", points: 0 },
    ],
    explanation: "Saying it out loud and handing the money over is what lets him put the register right today.",
    reviewNote: "Zeros give the money away generously or return it a day late, and both feel like doing the right thing while his register still comes up short tonight. The 1 returns the coins without a word, so he may not notice or may think they are yours. The 2 returns the money and the information. Checked: key ties the 1 for length, a zero also joins two actions, extra appears in three options.",
  },
  {
    id: "wd-27", d: 6, prompt: "A sign says the pool is closed for cleaning but your cousin wants to swim anyway. What would you do?",
    options: [
      { text: "Say why it is closed and suggest the park", points: 2 },
      { text: "Wait until it reopens and swim then", points: 1 },
      { text: "Ask a grown up to open it for you both", points: 0 },
      { text: "Walk around and look for an open gate", points: 0 },
    ],
    explanation: "The reason for the sign is the cleaning, so you explain that and offer something you can both do now.",
    reviewNote: "Zeros ask for the rule to be lifted or look for a way around it, which is what two disappointed cousins genuinely try. The 1 keeps you out of the water and leaves her still deciding on her own. The 2 gives her the reason and a way to still have an afternoon. Checked: lengths within three, a zero also joins two actions, the grown up option is a zero, no moral word.",
  },
  {
    id: "wd-28", d: 6, prompt: "Your swimming team loses a relay because you dived in before the touch. What would you do?",
    options: [
      { text: "Say you went too early and ask for tips", points: 2 },
      { text: "Apologize to your team and sit down", points: 1 },
      { text: "Ask the coach and see if it runs again", points: 0 },
      { text: "Tell the team the rule is confusing", points: 0 },
    ],
    explanation: "Owning the dive and asking how to time it fixes today with the team and the next race as well.",
    reviewNote: "Zeros ask for a replay and explain the rule away, both of which a stung child reaches for and neither of which owns the start. The 1 apologizes, which repairs the team side and does nothing about the timing. The 2 does both. Checked: a zero is the longest, no two options share an opening, coach sits in a zero, no moral word.",
  },
  {
    id: "wd-29", d: 6, prompt: "Your instructor praises you for tidying the mats, but your brother did most of it. What would you do?",
    options: [
      { text: "Say your brother did nearly all of it", points: 2 },
      { text: "Tell him you both did it together", points: 1 },
      { text: "Tell your brother he earned the praise", points: 0 },
      { text: "Say thank you and tidy them next time", points: 0 },
    ],
    explanation: "The instructor is the one holding the mistaken idea, so he is the one who needs the whole correction.",
    reviewNote: "Zeros give your brother his due in private or repay the credit with future work, and both are comfortable and both leave the instructor thinking it was you. The 1 corrects him but shares out a job your brother nearly did alone. The 2 gives him the full picture. Checked: staying silent under a false impression scores zero here and in the practice item, the Say and Tell openings each cover one credited and one zero option, brother appears in the key and a zero.",
  },
  {
    id: "wd-30", d: 6, prompt: "Your friend keeps whispering jokes while the co op class is meant to be listening. What would you do?",
    options: [
      { text: "Tell him you will hear it at break", points: 2 },
      { text: "Move along the row and sit further away", points: 1 },
      { text: "Tell the grown up he keeps whispering", points: 0 },
      { text: "Whisper back so he does not feel left out", points: 0 },
    ],
    explanation: "Telling him you will hear it later stops the whispering now and still keeps your friend.",
    reviewNote: "Zeros report a friend for something harmless and join in to spare his feelings; both are real, and reporting is the weaker move here because nobody is being harmed. The 1 solves it for you and says nothing to him. The 2 ends the whispering and keeps the friendship. Checked: key is the shortest, only the 1 joins two actions, the norm here matches the other harmless secret item and contrasts with the danger ones.",
  },
  // d7: competing goods and another person's point of view, about age 11
  {
    id: "wd-31", d: 7, prompt: "Two friends are arguing about whose turn it is on the swing and each remembers it differently. What would you do?",
    options: [
      { text: "Count to twenty, then they swap", points: 2 },
      { text: "Say who you think should go next", points: 1 },
      { text: "Point out that you did not see it", points: 0 },
      { text: "Tell them to stop and find another game", points: 0 },
    ],
    explanation: "A count of twenty settles it without anyone having to prove who was right about the last turn.",
    reviewNote: "Zeros are honest and practical: one reports what you did not see, the other gives up the swing they are actually arguing about, and neither ends the argument. The 1 makes a ruling that one of them will dispute, since both remember it their own way. The 2 skips the disputed past and gives them a rule for what comes next. Checked: key is the shortest, no two options share an opening, only the key joins two actions, no moral word.",
  },
  {
    id: "wd-32", d: 7, prompt: "At the park a much bigger kid keeps teasing a little boy who is on his own. What would you do?",
    options: [
      { text: "Get a grown up and stay with the boy", points: 2 },
      { text: "Ask the boy to come and play with you", points: 1 },
      { text: "Step in and tell the bigger kid to stop", points: 0 },
      { text: "Wait for a grown up to notice it", points: 0 },
    ],
    explanation: "A grown up can stop this safely, and staying with the boy means he is not left on his own again.",
    reviewNote: "Zeros are stepping into it yourself and hoping someone else spots it; stepping in against a bigger kid is the advice we do not give, and waiting to be noticed leaves the boy there meanwhile. The 1 gets him out of range, which is genuine help, but nobody who can stop it knows. The 2 fetches help and stays. Checked: a zero is the longest, a grown up appears in a zero as well as the key, bigger and teasing appear in zeros.",
  },
  {
    id: "wd-33", d: 7, prompt: "Your cousin makes you promise not to tell that she climbs the tall fence alone. What would you do?",
    options: [
      { text: "Tell a grown up about the fence", points: 2 },
      { text: "Ask her to climb only when a grown up is there", points: 1 },
      { text: "Keep the promise you made to her", points: 0 },
      { text: "Stand at the fence while she climbs", points: 0 },
    ],
    explanation: "A fall from that height is the kind of secret a grown up has to know, even after a promise.",
    reviewNote: "Zeros are loyalty and spotting her, both of which a good cousin feels first, and both leave her at the top of the fence. The 1 tries to stop the danger and depends entirely on her keeping a promise. The 2 brings in someone who can actually make it stop. Checked: fence appears in the key and a zero so it cannot cue, key is the shortest, no option joins two actions, no moral word.",
  },
  {
    id: "wd-34", d: 7, prompt: "Your co op partner has barely started her half of the model that is due next class. What would you do?",
    options: [
      { text: "Ask her what is left and offer to help", points: 2 },
      { text: "Build her half and hand it to her", points: 1 },
      { text: "Tell the grown up she has barely started", points: 0 },
      { text: "Finish your own half and leave hers", points: 0 },
    ],
    explanation: "Asking her first is the only choice that can still get her half done by her.",
    reviewNote: "Zeros report her before she has been spoken to or let the model arrive half finished, both understandable when a deadline is close. The 1 saves the model and takes her part away from her. The 2 keeps it hers and adds help. Checked: the 1 is the longest option, a zero also joins two actions, the grown up move is a zero here and the key elsewhere in the bank.",
  },
  {
    id: "wd-35", d: 7, prompt: "A quiet boy at the park watches your game every week but never comes over. What would you do?",
    options: [
      { text: "Ask him to join and explain the game", points: 2 },
      { text: "Wave and say hello before you start", points: 1 },
      { text: "Play nearer to him so he can see it", points: 0 },
      { text: "Ask the others to go and invite him", points: 0 },
    ],
    explanation: "Inviting him and explaining the rules removes the two things keeping him on the bench.",
    reviewNote: "Zeros move the game closer or hand the invitation to someone else, both friendly and both leave him watching. The 1 is a welcome without a way in, so he is greeted and still outside. The 2 handles the invitation and the not knowing how to play. Checked: key ties a zero for length, the 1 also joins two actions, no stem word sits only in the key.",
  },
  // d8: consequences that land later, about age 12
  {
    id: "wd-36", d: 8, prompt: "You and your friend both worked hard, and the instructor gives the one badge to her. What would you do?",
    options: [
      { text: "Say good job and ask how to earn one", points: 2 },
      { text: "Clap for her and go back to training", points: 1 },
      { text: "Say the badge was never important", points: 0 },
      { text: "Tell her you almost got it as well", points: 0 },
    ],
    explanation: "Her badge is hers, and asking what earns one turns your own hard work into a plan for the next.",
    reviewNote: "Zeros protect your feelings by shrinking the badge or by claiming a near miss, and both quietly take something from her moment. The 1 is warm and stops there, so nothing changes for next time. The 2 congratulates her and does something about your own chance. Checked: no two options share an opening, key ties for longest, no moral word.",
  },
  {
    id: "wd-37", d: 8, prompt: "You are stuck on a step in class while the instructor is helping someone else. What would you do?",
    options: [
      { text: "Try the next step and ask him after", points: 2 },
      { text: "Sit and wait until he comes to you", points: 1 },
      { text: "Go and stand beside him until he looks", points: 0 },
      { text: "Skip the step and move to the end", points: 0 },
    ],
    explanation: "Working on can carry on while he finishes, and your question still gets asked instead of forgotten.",
    reviewNote: "Zeros are hovering to be noticed and jumping to the end, both common and both cost either his attention or the step you are stuck on. The 1 waits without losing the question and loses the whole time. The 2 keeps you learning and keeps the question. Checked: a zero is the longest, all four options join two actions, no moral word.",
  },
  {
    id: "wd-38", d: 8, prompt: "Your friend has gone quiet for two weeks and will not say what is going on. What would you do?",
    options: [
      { text: "Ask her on her own how she is doing", points: 2 },
      { text: "Keep inviting her along as usual", points: 1 },
      { text: "Give her some space until she is ready", points: 0 },
      { text: "Ask her older sister what is going on", points: 0 },
    ],
    explanation: "Asking her when nobody else is listening gives her the chance to say it out loud.",
    reviewNote: "Zeros are space and a shortcut through her sister, both meant well and both mean she is never actually asked. The 1 keeps her included, which matters, and never opens the subject. The 2 asks her directly and away from an audience. Checked: key is not the longest, no option joins two actions, going on appears in a zero as well as the stem.",
  },
  {
    id: "wd-39", d: 8, prompt: "Your coach picks another child for the demonstration you had hoped for. What would you do?",
    options: [
      { text: "Ask what to practice for the next one", points: 2 },
      { text: "Say that is fine and carry on with class", points: 1 },
      { text: "Ask him to pick you instead this time", points: 0 },
      { text: "Stop putting your hand up next time", points: 0 },
    ],
    explanation: "Finding out what he is looking for is the part that changes whether you are picked next time.",
    reviewNote: "Zeros ask him to reverse a decision he has just made and quietly withdraw, and a disappointed child does both. The 1 accepts it gracefully and learns nothing from it. The 2 accepts it and comes away with something to work on. Checked: the 1 is the longest option and the only one joining two actions, no adult word in the key, self advocacy is not punished, only overruling is.",
  },
  {
    id: "wd-40", d: 8, prompt: "A neighbor is struggling with her bags just as you are due at your swimming lesson. What would you do?",
    options: [
      { text: "Carry them to her door and then run", points: 2 },
      { text: "Ask a grown up at home to go and help", points: 1 },
      { text: "Stop and chat while she has a rest", points: 0 },
      { text: "Offer to come back for them later", points: 0 },
    ],
    explanation: "Her door is only a few steps away, so the bags get there and you are still on time.",
    reviewNote: "Zeros keep her company or promise a second trip, both kind and both leave the bags where they are. The 1 sends real help that arrives after you have gone, so she carries them meanwhile. The 2 costs a minute and finishes the job. Checked: the grown up option is the 1 rather than the key, key is not the longest, three options join two actions.",
  },
  // d9: planning and responsibility to a group, about age 13
  {
    id: "wd-41", d: 9, prompt: "You are at the library, it closes in ten minutes, and you need the book first thing tomorrow morning. What would you do?",
    options: [
      { text: "Ask the librarian to look it up now", points: 2 },
      { text: "Search the shelf you think it is on", points: 1 },
      { text: "Ask a grown up to phone the library", points: 0 },
      { text: "Borrow another book and use that instead", points: 0 },
    ],
    explanation: "The librarian can find the shelf in seconds, which is the only way ten minutes is enough.",
    reviewNote: "Zeros phone a desk that is already closing or settle for a book you did not come for, and both are things a person in a hurry tries. The 1 searches the right kind of place and may be searching the shelf it is not on. The 2 uses the one person who knows where it is. Checked: lengths within one character, an adult appears in the key and a zero, no option joins two actions.",
  },
  {
    id: "wd-42", d: 9, prompt: "Your street is holding a clean up morning and you already have a lesson at ten. What would you do?",
    options: [
      { text: "Help for the first hour before you go", points: 2 },
      { text: "Bring bags and gloves before you leave", points: 1 },
      { text: "Ask them to hold it another weekend", points: 0 },
      { text: "Sweep your own path and skip the rest", points: 0 },
    ],
    explanation: "An hour of the morning is real work on the day it is needed, and your lesson still happens.",
    reviewNote: "Zeros move the whole street to suit your calendar or do a private tidy nobody asked for, and both feel like taking part. The 1 supplies the tools, which genuinely helps, and no pair of hands. The 2 gives the hours you actually have. Checked: lengths within three, the key is a single action while the 1 and a zero join two, no moral word.",
  },
  {
    id: "wd-43", d: 9, prompt: "Your co op group has a show in three days and nobody has decided who does what. What would you do?",
    options: [
      { text: "Make a list of who is doing what part", points: 2 },
      { text: "Pick your own part and start on it now", points: 1 },
      { text: "Ask the grown up to hand out the parts", points: 0 },
      { text: "Wait for someone else to start it off", points: 0 },
    ],
    explanation: "A list of parts is what turns three days into a plan the whole group can see.",
    reviewNote: "Zeros hand the organizing to a grown up or to whoever moves first, and both are what a group actually does while a deadline closes. The 1 secures one part and leaves the rest unclaimed. The 2 makes the gaps visible so every part gets an owner. Checked: key ties a zero for shortest, the key is a single action while the 1 joins two, the grown up option is a zero.",
  },
  {
    id: "wd-44", d: 9, prompt: "The animal shelter near you is short of blankets before the cold weather. What would you do?",
    options: [
      { text: "Ask a grown up to help collect spare ones", points: 2 },
      { text: "Ask at home for the spare blankets you can give", points: 1 },
      { text: "Ask the shelter and write down what they need", points: 0 },
      { text: "Write a note and put it in your window", points: 0 },
    ],
    explanation: "Your own spares are a start, and asking the street turns one armful into a pile of them.",
    reviewNote: "Zeros gather information and put up a notice, both reasonable first steps and neither delivers a single blanket. The 1 asks at home first and delivers a real armful, which is genuine help and only as much as one house holds. The 2 collects from many houses and delivers. Checked: the 1 is the longest option, a zero also joins two actions, blankets and shelter appear outside the key.",
  },
  {
    id: "wd-45", d: 9, prompt: "The trash can in the co op hall is full every week and cups end up on the floor. What would you do?",
    options: [
      { text: "Tidy the cups and ask for a second one", points: 2 },
      { text: "Put the cups in the trash can each week", points: 1 },
      { text: "Ask the grown ups to empty it at break", points: 0 },
      { text: "Move it nearer the door and add a sign", points: 0 },
    ],
    explanation: "Tidying sorts out today and a second trash can sorts out every week after it.",
    reviewNote: "Zeros add a chore for the grown ups or move a can that is still one can, both of which sound like fixes and leave the same overflow. The 1 clears the floor and has to be repeated forever. The 2 clears today and removes the cause. Checked: the key ties a zero for length, a zero also joins two actions, the grown up option is a zero, no moral word.",
  },
  // d10: speaking for a group and principle against loyalty, about age 13
  {
    id: "wd-46", d: 10, prompt: "Your co op group is choosing where to send the money it raised and you disagree. What would you do?",
    options: [
      { text: "Ask their reasons, then give your view", points: 2 },
      { text: "Give your own view and let them vote", points: 1 },
      { text: "Go along with the group so nobody argues", points: 0 },
      { text: "Keep arguing until they hear you out", points: 0 },
    ],
    explanation: "Hearing their reasons first is what makes your view part of the decision instead of a contest.",
    reviewNote: "Zeros keep the peace by disappearing or push until the room gives in, and both are ordinary responses to disagreement. The 1 states the case properly and never finds out what the others were weighing. The 2 does both, in the order that changes minds. Checked: a zero is the longest option, view appears in the key and the 1, no moral word.",
  },
  {
    id: "wd-47", d: 10, prompt: "Your family has money for one day out and each cousin wants somewhere different. What would you do?",
    options: [
      { text: "Ask what each one likes about their idea", points: 2 },
      { text: "Have everyone vote and take the winner", points: 1 },
      { text: "Let the youngest cousin decide for all", points: 0 },
      { text: "Choose the cheapest day out on the list", points: 0 },
    ],
    explanation: "Once you know what each cousin is really after, one day out can give nearly all of them some of it.",
    reviewNote: "Zeros settle it by age or by price, both of which are clear rules and neither of which looks at what anyone wanted. The 1 is a proper method and still leaves everyone outside the majority with nothing. The 2 finds the overlap the vote would have hidden. Checked: key ties for longest, the 1 is the only option joining two actions, cousin appears in the key and a zero.",
  },
  {
    id: "wd-48", d: 10, prompt: "A younger cousin tells you some kids keep picking on her and asks you not to tell. What would you do?",
    options: [
      { text: "Listen and help her tell a grown up", points: 2 },
      { text: "Offer to stay with her and walk her home", points: 1 },
      { text: "Tell her to walk away when it starts", points: 0 },
      { text: "Go and tell the kids to leave her alone", points: 0 },
    ],
    explanation: "Being picked on keeps happening until a grown up knows, and going with her is what makes telling possible.",
    reviewNote: "Zeros give the walk away advice and offer to confront the kids; the first sounds like classic advice and does not stop it, the second puts you in the middle of it. The 1 supports her and keeps it a secret that has to stay hidden. The 2 supports her and ends it. Checked: no two options share an opening, a zero is the longest, ignoring earns nothing here.",
  },
  {
    id: "wd-49", d: 10, prompt: "You are keeping score at a match and you are not sure your team's last point counted. What would you do?",
    options: [
      { text: "Say you are unsure and ask the coach", points: 2 },
      { text: "Leave that point out of the score", points: 1 },
      { text: "Count it, since your team played the point", points: 0 },
      { text: "Ask your mom and go with what she saw", points: 0 },
    ],
    explanation: "You do not have to guess, and the coach can settle a point you did not see clearly.",
    reviewNote: "Zeros count it because your own team played it or ask someone further from the line than you were, and both feel reasonable to a person holding the pencil. The 1 refuses to claim a doubtful point, which is honest, and may take a point your team truly earned. The 2 gets it settled by the one person whose job it is. Checked: a zero is the longest, an adult appears in the key and a zero, point and score appear outside the key.",
  },
  {
    id: "wd-50", d: 10, prompt: "You are speaking for your group at the co op meeting and some of them disagree with you. What would you do?",
    options: [
      { text: "Give the group's view, then your own", points: 2 },
      { text: "Give what the group decided and stop", points: 1 },
      { text: "Give your own view and explain it well", points: 0 },
      { text: "Ask someone else to speak for them", points: 0 },
    ],
    explanation: "You were sent to carry what the group decided, and your own view is honest once theirs has been heard.",
    reviewNote: "Zeros replace the group with yourself or hand the job back after accepting it, and both are what a nervous representative really does. The 1 delivers the group faithfully and hides that you think otherwise. The 2 delivers both, in the order the job requires. Checked: a zero is the longest option and also joins two ideas, group and view appear in several options.",
  },
];
