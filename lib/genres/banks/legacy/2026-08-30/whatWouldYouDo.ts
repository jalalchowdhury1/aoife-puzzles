import type { ChoiceBankItem } from "../../../bankGenre";

// Original "What Would You Do?" items (cousin of social reasoning, VC
// domain): a two-sentence story situation ending in "What would you do?",
// never a "why do we" convention question (that shape belongs to
// Comprehension/"What Should You Do" — see banks/comprehension.ts). Every
// item has one best answer (2: kind AND sensible), one partial answer (1:
// kind in spirit but not the most complete or sensible fix), and two answers
// that are unkind, unsafe, or unrelated to the problem (0, 0). Age ramped d1
// (about age 6, simple kindness/safety with an emoji) through d10 (about age
// 13, consequences/planning/community dilemmas).
export const WHAT_WOULD_YOU_DO_BANK: ChoiceBankItem[] = [
  // d1: simple kindness/safety, age 6
  {
    id: "wd-01", d: 1, prompt: "Mia's friend drops her ice cream and starts to cry. What would you do?", emoji: "🍦",
    options: [
      { text: "Give her a hug and share your ice cream", points: 2 },
      { text: "Tell her it will be okay and keep playing", points: 1 },
      { text: "Laugh because it looked funny", points: 0 },
      { text: "Walk away and ignore her", points: 0 },
    ],
    explanation: "Sharing a hug and your own ice cream comforts Mia and fixes the problem too.",
  },
  {
    id: "wd-02", d: 1, prompt: "Your little brother is scared of the thunder outside. What would you do?", emoji: "🌩️",
    options: [
      { text: "Sit with him and tell him he is safe", points: 2 },
      { text: "Give him a hug and then go back to your game", points: 1 },
      { text: "Laugh at him for being scared", points: 0 },
      { text: "Turn up the TV and ignore him", points: 0 },
    ],
    explanation: "Sitting with your brother helps him feel safe until the thunder passes.",
  },
  {
    id: "wd-03", d: 1, prompt: "Your friend falls off the swing and scrapes his knee. What would you do?", emoji: "🩹",
    options: [
      { text: "Help him up and get a grown up", points: 2 },
      { text: "Tell him it will feel better soon and keep swinging", points: 1 },
      { text: "Keep swinging and do not look", points: 0 },
      { text: "Tell him it is his own fault", points: 0 },
    ],
    explanation: "Helping your friend up and getting a grown up takes care of the scrape right away.",
  },
  {
    id: "wd-04", d: 1, prompt: "You see a lost puppy shivering by itself in the cold. What would you do?", emoji: "🐶",
    options: [
      { text: "Bring it somewhere warm and find a grown up to help", points: 2 },
      { text: "Pet it for a while and then go back to playing", points: 1 },
      { text: "Chase it away", points: 0 },
      { text: "Ignore it and keep walking", points: 0 },
    ],
    explanation: "Warming the puppy up and getting a grown up gives it the best chance of getting home safely.",
  },
  {
    id: "wd-05", d: 1, prompt: "Your friend cannot reach the puzzle piece on the top shelf. What would you do?", emoji: "🧩",
    options: [
      { text: "Reach it for her and hand it over", points: 2 },
      { text: "Tell her to ask someone taller", points: 1 },
      { text: "Take the puzzle for yourself", points: 0 },
      { text: "Say she should have picked an easier puzzle", points: 0 },
    ],
    explanation: "Reaching the piece for your friend solves the problem right away.",
  },
  // d2: simple kindness/safety, age 6
  {
    id: "wd-06", d: 2, prompt: "You are crossing the street and see a friend still on the sidewalk. What would you do?", emoji: "🚸",
    options: [
      { text: "Wait for her and cross together when it is safe", points: 2 },
      { text: "Wave and tell her to hurry up", points: 1 },
      { text: "Cross without her", points: 0 },
      { text: "Run ahead so you get there first", points: 0 },
    ],
    explanation: "Waiting and crossing together keeps both of you safe.",
  },
  {
    id: "wd-07", d: 2, prompt: "At lunch, you notice a classmate forgot their food. What would you do?", emoji: "🥪",
    options: [
      { text: "Offer to share some of your lunch", points: 2 },
      { text: "Tell a teacher and then eat your own lunch", points: 1 },
      { text: "Eat your lunch quickly so no one asks", points: 0 },
      { text: "Tell them to figure it out themselves", points: 0 },
    ],
    explanation: "Sharing your lunch makes sure your classmate has something to eat right away.",
  },
  {
    id: "wd-08", d: 2, prompt: "You cannot find your shoes and the bus is about to leave. What would you do?", emoji: "🧦",
    options: [
      { text: "Ask a grown up for help finding them", points: 2 },
      { text: "Wear different shoes and hope no one notices", points: 1 },
      { text: "Yell and stomp your feet", points: 0 },
      { text: "Miss the bus and stay home upset", points: 0 },
    ],
    explanation: "Asking a grown up for help is the fastest way to solve the problem and still catch the bus.",
  },
  {
    id: "wd-09", d: 2, prompt: "Your classmate is sad because they broke their favorite crayon. What would you do?", emoji: "🖍️",
    options: [
      { text: "Offer to share one of your own crayons", points: 2 },
      { text: "Tell them it is only a crayon", points: 1 },
      { text: "Laugh because it broke", points: 0 },
      { text: "Take their other crayons too", points: 0 },
    ],
    explanation: "Sharing a crayon helps your classmate keep drawing and feel better.",
  },
  {
    id: "wd-10", d: 2, prompt: "You spill your juice on the table by accident. What would you do?", emoji: "🧃",
    options: [
      { text: "Wipe it up and tell a grown up what happened", points: 2 },
      { text: "Move to a different seat and say nothing", points: 1 },
      { text: "Blame someone else for it", points: 0 },
      { text: "Leave it and walk away", points: 0 },
    ],
    explanation: "Wiping it up and telling a grown up fixes the spill and keeps things honest.",
  },
  // d3: sharing, turn-taking, lost items, age 7 to 8
  {
    id: "wd-11", d: 3, prompt: "You and your friend both want to go first on the trampoline, but there is only room for one. What would you do?",
    options: [
      { text: "Suggest taking turns and decide fairly who goes first", points: 2 },
      { text: "Let your friend go first every single time", points: 1 },
      { text: "Push your friend out of the way", points: 0 },
      { text: "Say the trampoline is only yours", points: 0 },
    ],
    explanation: "Taking turns fairly lets both of you enjoy the trampoline.",
  },
  {
    id: "wd-12", d: 3, prompt: "Your classroom only has one class pet and everyone wants a turn feeding it today. What would you do?",
    options: [
      { text: "Make a list so everyone gets a fair turn", points: 2 },
      { text: "Let the loudest kid go first", points: 1 },
      { text: "Feed it yourself and not tell anyone", points: 0 },
      { text: "Say only your friends can have a turn", points: 0 },
    ],
    explanation: "A turn list makes sure everyone gets a fair chance.",
  },
  {
    id: "wd-13", d: 3, prompt: "You find a toy on the playground that is not yours. What would you do?",
    options: [
      { text: "Give it to a teacher so the owner can find it", points: 2 },
      { text: "Leave it in the same spot in case the owner comes back", points: 1 },
      { text: "Keep it because you like it", points: 0 },
      { text: "Hide it so no one else finds it", points: 0 },
    ],
    explanation: "Giving it to a teacher gives the toy the best chance of getting back to its owner.",
  },
  {
    id: "wd-14", d: 3, prompt: "Two friends both want to sit next to you at lunch, but there is only one seat. What would you do?",
    options: [
      { text: "Suggest switching seats halfway through lunch", points: 2 },
      { text: "Pick whoever asked first", points: 1 },
      { text: "Tell them to fight over it", points: 0 },
      { text: "Sit somewhere else by yourself", points: 0 },
    ],
    explanation: "Switching halfway lets both friends get a turn sitting with you.",
  },
  {
    id: "wd-15", d: 3, prompt: "You are building a tower with blocks and your little sister wants to help too. What would you do?",
    options: [
      { text: "Give her some blocks and build together", points: 2 },
      { text: "Tell her to watch instead of helping", points: 1 },
      { text: "Knock down her blocks", points: 0 },
      { text: "Tell her to go away", points: 0 },
    ],
    explanation: "Building together lets your sister join in and have fun too.",
  },
  // d4: sharing, turn-taking, lost items, age 7 to 8
  {
    id: "wd-16", d: 4, prompt: "During a board game, it is your turn but your friend keeps grabbing the dice first. What would you do?",
    options: [
      { text: "Remind them kindly that it is your turn", points: 2 },
      { text: "Let them go again to avoid a fuss", points: 1 },
      { text: "Grab the dice back and yell", points: 0 },
      { text: "Quit the game without saying why", points: 0 },
    ],
    explanation: "A kind reminder keeps the game fair without anyone getting upset.",
  },
  {
    id: "wd-17", d: 4, prompt: "You borrowed a book from a friend and it got a little wet by accident. What would you do?",
    options: [
      { text: "Tell your friend what happened and offer to help fix it", points: 2 },
      { text: "Dry it off and hope they do not notice", points: 1 },
      { text: "Say you never borrowed it", points: 0 },
      { text: "Blame your friend for lending you the book", points: 0 },
    ],
    explanation: "Telling your friend honestly and offering to help keeps your friendship strong.",
  },
  {
    id: "wd-18", d: 4, prompt: "You notice your friend lost their favorite hat on the playground. What would you do?",
    options: [
      { text: "Help them look for it", points: 2 },
      { text: "Tell them it will probably turn up", points: 1 },
      { text: "Keep playing and ignore them", points: 0 },
      { text: "Say they should be more careful", points: 0 },
    ],
    explanation: "Helping your friend search gives the hat the best chance of being found.",
  },
  {
    id: "wd-19", d: 4, prompt: "You and a classmate both need the only red marker to finish your drawings. What would you do?",
    options: [
      { text: "Ask to share it by taking turns", points: 2 },
      { text: "Let them use it the whole time", points: 1 },
      { text: "Grab it and hide it in your desk", points: 0 },
      { text: "Say red is a silly color anyway", points: 0 },
    ],
    explanation: "Sharing turns means both drawings can get finished.",
  },
  {
    id: "wd-20", d: 4, prompt: "It is your friend's turn to pick the game at recess, but you really want to play something else. What would you do?",
    options: [
      { text: "Let them pick this time and suggest your game next time", points: 2 },
      { text: "Ask nicely if you can switch games just this once", points: 1 },
      { text: "Refuse to play unless it is your choice", points: 0 },
      { text: "Tell everyone their game is boring", points: 0 },
    ],
    explanation: "Letting your friend have their turn and asking for a turn next time keeps things fair.",
  },
  // d5: honesty, rules with reasons, small dilemmas, age 9 to 10
  {
    id: "wd-21", d: 5, prompt: "You accidentally break a vase at your friend's house while no one is looking. What would you do?",
    options: [
      { text: "Tell your friend's parent what happened right away", points: 2 },
      { text: "Try to glue it back together and say nothing", points: 1 },
      { text: "Hide the pieces and leave", points: 0 },
      { text: "Blame the family's pet", points: 0 },
    ],
    explanation: "Telling a grown up right away is the most honest way to handle the accident.",
  },
  {
    id: "wd-22", d: 5, prompt: "You find some money on the classroom floor. What would you do?",
    options: [
      { text: "Give it to the teacher to find who lost it", points: 2 },
      { text: "Ask your classmates if anyone lost some money", points: 1 },
      { text: "Keep it and buy something for yourself", points: 0 },
      { text: "Tell your friends so you can split it", points: 0 },
    ],
    explanation: "Giving it to the teacher gives the money the best chance of getting back to its owner.",
  },
  {
    id: "wd-23", d: 5, prompt: "Your teacher asks who forgot to do their homework, and you did not do yours. What would you do?",
    options: [
      { text: "Raise your hand and explain honestly", points: 2 },
      { text: "Stay quiet and finish it at recess", points: 1 },
      { text: "Say someone else forgot instead", points: 0 },
      { text: "Pretend you already turned it in", points: 0 },
    ],
    explanation: "Being honest with your teacher is the most trustworthy way to handle the mistake.",
  },
  {
    id: "wd-24", d: 5, prompt: "A friend asks you to say you were with them, but you were not. What would you do?",
    options: [
      { text: "Tell them you cannot say something that is not true", points: 2 },
      { text: "Change the subject so you do not have to answer", points: 1 },
      { text: "Say yes so your friend does not get upset", points: 0 },
      { text: "Tell everyone else your friend is lying", points: 0 },
    ],
    explanation: "Telling the truth, even kindly, keeps you and your friend trustworthy.",
  },
  {
    id: "wd-25", d: 5, prompt: "You notice a classmate copying your answers during a quiet test. What would you do?",
    options: [
      { text: "Cover your paper and tell a teacher after the test", points: 2 },
      { text: "Move your paper away and say nothing else", points: 1 },
      { text: "Let them keep copying so they do not get mad", points: 0 },
      { text: "Copy their answers back as a joke", points: 0 },
    ],
    explanation: "Covering your work and telling the teacher afterward keeps the test fair for everyone.",
  },
  // d6: honesty, rules with reasons, small dilemmas, age 9 to 10
  {
    id: "wd-26", d: 6, prompt: "You promised to help a friend with a project, but a more fun invitation comes up at the same time. What would you do?",
    options: [
      { text: "Keep your promise and help your friend as planned", points: 2 },
      { text: "Help for a little while then leave early", points: 1 },
      { text: "Skip your friend without telling them", points: 0 },
      { text: "Pretend you forgot about the promise", points: 0 },
    ],
    explanation: "Keeping your promise shows your friend they can count on you.",
  },
  {
    id: "wd-27", d: 6, prompt: "You see a sign that says the pool is closed for cleaning, but a friend wants to swim anyway. What would you do?",
    options: [
      { text: "Explain the rule and suggest something else to do", points: 2 },
      { text: "Go along with it just this once", points: 1 },
      { text: "Sneak in through a side gate", points: 0 },
      { text: "Dare your friend to jump the fence", points: 0 },
    ],
    explanation: "Explaining the rule keeps everyone safe while the pool is being cleaned.",
  },
  {
    id: "wd-28", d: 6, prompt: "Your team loses a game because of a mistake you made. What would you do?",
    options: [
      { text: "Admit your mistake and encourage the team for next time", points: 2 },
      { text: "Apologize quietly and say nothing else", points: 1 },
      { text: "Blame a teammate instead", points: 0 },
      { text: "Quit the team so it will not happen again", points: 0 },
    ],
    explanation: "Admitting the mistake and encouraging the team helps everyone move forward.",
  },
  {
    id: "wd-29", d: 6, prompt: "A cashier gives you too much change by mistake. What would you do?",
    options: [
      { text: "Point it out and give the extra money back", points: 2 },
      { text: "Mention it quietly but keep the change if they say it is fine", points: 1 },
      { text: "Keep it and buy something extra", points: 0 },
      { text: "Tell your friends how lucky you got", points: 0 },
    ],
    explanation: "Pointing out the mistake and returning the money is the honest choice.",
  },
  {
    id: "wd-30", d: 6, prompt: "You are asked to line up quietly, but a friend keeps whispering jokes to you. What would you do?",
    options: [
      { text: "Quietly ask them to wait until after line up", points: 2 },
      { text: "Whisper back just once and then stop", points: 1 },
      { text: "Laugh loudly and keep joking", points: 0 },
      { text: "Tell the teacher your friend is annoying", points: 0 },
    ],
    explanation: "Asking your friend to wait keeps the line quiet without hurting their feelings.",
  },
  // d7: fairness with competing needs, helping vs telling a grown up, age 11 to 12
  {
    id: "wd-31", d: 7, prompt: "Two of your friends are arguing over whose turn it is to use the class computer, and both have a fair point. What would you do?",
    options: [
      { text: "Suggest a fair way to decide, like a timer for each turn", points: 2 },
      { text: "Pick whichever friend seems more upset", points: 1 },
      { text: "Tell them to figure it out themselves and walk away", points: 0 },
      { text: "Use the computer yourself instead", points: 0 },
    ],
    explanation: "A fair method like a timer settles the argument without picking sides.",
  },
  {
    id: "wd-32", d: 7, prompt: "You see an older kid teasing a younger student near the lockers. What would you do?",
    options: [
      { text: "Step in to help the younger student and tell a teacher", points: 2 },
      { text: "Tell the older kid to stop and then walk away", points: 1 },
      { text: "Watch and do nothing", points: 0 },
      { text: "Join in so the older kid likes you", points: 0 },
    ],
    explanation: "Stepping in and telling a teacher keeps the younger student safe.",
  },
  {
    id: "wd-33", d: 7, prompt: "A friend tells you a secret that means someone could get hurt if nothing is done. What would you do?",
    options: [
      { text: "Tell a trusted adult, even though you promised to keep the secret", points: 2 },
      { text: "Ask your friend to tell an adult themselves", points: 1 },
      { text: "Keep the secret no matter what", points: 0 },
      { text: "Tell other classmates about it", points: 0 },
    ],
    explanation: "Telling a trusted adult keeps everyone safe, even when it means breaking a promise.",
  },
  {
    id: "wd-34", d: 7, prompt: "Your group project partner has not done any of their part, and the project is due tomorrow. What would you do?",
    options: [
      { text: "Talk to your partner and tell the teacher if it is still not fixed", points: 2 },
      { text: "Finish their part yourself without saying anything", points: 1 },
      { text: "Turn in an unfinished project and blame your partner", points: 0 },
      { text: "Refuse to turn in anything at all", points: 0 },
    ],
    explanation: "Talking to your partner first, and telling the teacher if needed, is the fairest way to solve it.",
  },
  {
    id: "wd-35", d: 7, prompt: "You notice a classmate seems left out at recess every single day. What would you do?",
    options: [
      { text: "Invite them to join your group", points: 2 },
      { text: "Say hi but keep playing with your usual friends", points: 1 },
      { text: "Ignore it because it is not your problem", points: 0 },
      { text: "Tell others to leave them out too", points: 0 },
    ],
    explanation: "Inviting them to join actually changes how their day feels.",
  },
  // d8: fairness with competing needs, helping vs telling a grown up, age 11 to 12
  {
    id: "wd-36", d: 8, prompt: "You and a friend both worked hard on a project, but the teacher only has one award to give. What would you do?",
    options: [
      { text: "Congratulate your friend and be proud of your own effort", points: 2 },
      { text: "Say congratulations but feel upset the rest of the day", points: 1 },
      { text: "Tell others your friend did not deserve it", points: 0 },
      { text: "Refuse to talk to your friend afterward", points: 0 },
    ],
    explanation: "Being genuinely proud of your own work and happy for your friend keeps the friendship strong.",
  },
  {
    id: "wd-37", d: 8, prompt: "You need extra help with math, but the teacher is busy helping another struggling student. What would you do?",
    options: [
      { text: "Wait patiently and ask a classmate for help in the meantime", points: 2 },
      { text: "Interrupt the teacher right away", points: 1 },
      { text: "Give up on the assignment", points: 0 },
      { text: "Copy a classmate's answers instead", points: 0 },
    ],
    explanation: "Waiting and asking a classmate keeps you moving forward without interrupting.",
  },
  {
    id: "wd-38", d: 8, prompt: "You find out a friend has been struggling at home and has been quiet lately. What would you do?",
    options: [
      { text: "Check in with them privately and tell a trusted adult if needed", points: 2 },
      { text: "Wait for them to bring it up on their own", points: 1 },
      { text: "Ignore it since it is not your business", points: 0 },
      { text: "Tell other classmates about what you noticed", points: 0 },
    ],
    explanation: "Checking in privately, and looping in an adult if needed, is the most caring and sensible response.",
  },
  {
    id: "wd-39", d: 8, prompt: "Your coach has to pick only some players for the final game, and you and a friend both want the last spot. What would you do?",
    options: [
      { text: "Accept the coach's decision and support whoever is picked", points: 2 },
      { text: "Ask the coach to change the decision", points: 1 },
      { text: "Stop trying in practice if you are not picked", points: 0 },
      { text: "Say mean things about whoever gets picked", points: 0 },
    ],
    explanation: "Accepting the decision and supporting your teammate keeps the team strong.",
  },
  {
    id: "wd-40", d: 8, prompt: "A classmate needs help carrying supplies, but you are already running late for your own class. What would you do?",
    options: [
      { text: "Help quickly and explain to your teacher why you are late", points: 2 },
      { text: "Help them and just accept being late without saying anything", points: 1 },
      { text: "Say you are too busy and walk past", points: 0 },
      { text: "Tell them to find someone else", points: 0 },
    ],
    explanation: "Helping quickly and explaining afterward balances kindness with responsibility.",
  },
  // d9: consequences, planning, community, age 13
  {
    id: "wd-41", d: 9, prompt: "The library is closing soon and you still need one more book for a report due tomorrow. What would you do?",
    options: [
      { text: "Ask the librarian quickly for help finding it before closing", points: 2 },
      { text: "Rush around searching alone until the doors lock", points: 1 },
      { text: "Give up and write the report without it", points: 0 },
      { text: "Take the book without checking it out", points: 0 },
    ],
    explanation: "Asking the librarian for help is the fastest way to find the book before closing time.",
  },
  {
    id: "wd-42", d: 9, prompt: "Your neighborhood is planning a cleanup day, but you already have plans for that morning. What would you do?",
    options: [
      { text: "Join for part of the time or help set up beforehand", points: 2 },
      { text: "Skip it and hope someone else covers your part", points: 1 },
      { text: "Ignore it completely since it is optional", points: 0 },
      { text: "Tell others the cleanup does not matter", points: 0 },
    ],
    explanation: "Joining for part of the time still helps the cleanup succeed.",
  },
  {
    id: "wd-43", d: 9, prompt: "You realize a group project deadline is much closer than everyone thought, and no one has planned ahead. What would you do?",
    options: [
      { text: "Organize a quick plan so everyone knows their part before it is too late", points: 2 },
      { text: "Do only your own part and hope others catch up", points: 1 },
      { text: "Wait until the last minute to worry about it", points: 0 },
      { text: "Tell the teacher the group cannot finish", points: 0 },
    ],
    explanation: "Organizing a plan right away gives the whole group the best chance of finishing on time.",
  },
  {
    id: "wd-44", d: 9, prompt: "A local food pantry announces they are running low on donations before a big holiday. What would you do?",
    options: [
      { text: "Organize a donation drive with friends or family", points: 2 },
      { text: "Drop off a few items on your own", points: 1 },
      { text: "Assume someone else will handle it", points: 0 },
      { text: "Post about it online and do nothing else", points: 0 },
    ],
    explanation: "Organizing a donation drive brings in far more help than acting alone.",
  },
  {
    id: "wd-45", d: 9, prompt: "You notice the recycling bins at school are always overflowing and trash ends up on the ground. What would you do?",
    options: [
      { text: "Suggest a plan to the school for more bins or regular pickup", points: 2 },
      { text: "Pick up the trash yourself once and move on", points: 1 },
      { text: "Ignore it since it is the school's job", points: 0 },
      { text: "Complain to friends but tell no one who could fix it", points: 0 },
    ],
    explanation: "Suggesting a real plan to the school can fix the problem for good.",
  },
  // d10: consequences, planning, community, age 13
  {
    id: "wd-46", d: 10, prompt: "Your town is voting on whether to build a new park, and you have strong feelings about it either way. What would you do?",
    options: [
      { text: "Learn more about both sides and share your opinion at the meeting", points: 2 },
      { text: "Just go along with what your friends think", points: 1 },
      { text: "Ignore it since you cannot vote yet", points: 0 },
      { text: "Argue loudly without listening to other views", points: 0 },
    ],
    explanation: "Learning about both sides before sharing your opinion leads to a more thoughtful decision.",
  },
  {
    id: "wd-47", d: 10, prompt: "You are planning a class trip and realize the budget will not cover everyone's ideas. What would you do?",
    options: [
      { text: "Work with others to find a fair plan everyone can afford", points: 2 },
      { text: "Pick the option you personally like best", points: 1 },
      { text: "Cancel the trip instead of solving the problem", points: 0 },
      { text: "Let only a few people decide for everyone", points: 0 },
    ],
    explanation: "Working together on a fair plan makes the trip work for the whole class.",
  },
  {
    id: "wd-48", d: 10, prompt: "A younger student asks you for advice about being bullied, and you are not sure what the best answer is. What would you do?",
    options: [
      { text: "Listen carefully and help them tell a trusted adult", points: 2 },
      { text: "Tell them to ignore it and it will go away", points: 1 },
      { text: "Tell them it does not matter", points: 0 },
      { text: "Change the subject to avoid the conversation", points: 0 },
    ],
    explanation: "Listening and helping them reach a trusted adult gives them real support.",
  },
  {
    id: "wd-49", d: 10, prompt: "Your community center is short on volunteers for an event that helps many families. What would you do?",
    options: [
      { text: "Sign up to help and encourage others to join too", points: 2 },
      { text: "Show up without telling anyone else about it", points: 1 },
      { text: "Assume enough people will already volunteer", points: 0 },
      { text: "Skip it since it is not required", points: 0 },
    ],
    explanation: "Signing up and encouraging others brings in more help than going alone.",
  },
  {
    id: "wd-50", d: 10, prompt: "You are chosen to represent your class in a school decision, but you know some classmates disagree with your own opinion. What would you do?",
    options: [
      { text: "Ask classmates for their views and represent the group fairly", points: 2 },
      { text: "Just share your own opinion without asking others", points: 1 },
      { text: "Avoid the responsibility and let someone else decide", points: 0 },
      { text: "Only listen to your closest friends' opinions", points: 0 },
    ],
    explanation: "Asking classmates for their views lets you represent the whole group fairly.",
  },
];
