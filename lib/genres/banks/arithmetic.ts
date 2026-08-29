import type { ArithmeticBankItem } from "../bankGenre";

// Original story problem templates. {a}/{b}/{c} placeholders are filled from
// `vars` ranges by the rng; `answer` always computes a non-negative integer
// for the full range (an optional `ok` only prefers nicer-looking numbers,
// so a fallback draw is always still a valid problem). Age ramped: d1-2
// counting/adding within 10 (about age 6); d3-4 add/subtract within 20, one
// step (about age 7 to 8); d5-6 two-step within 100 including simple time
// and money (about age 9 to 10); d7-8 multiplication/division facts in
// stories, with remainders (about age 11 to 12); d9-10 multi-step problems
// with fractions of groups and rates (about age 13); d11-15 fractions of
// totals, percents, unit rates, averages and ratio shares (about age 14).
//
// Widened to d20 on 2026-08-29 (decision #26). Her Level 8A probe climbed
// d10 to d15 with 13 of 14 correct and NO miss above d10, so d15 was our
// ceiling, not hers. The new bands add the algebraic moves, still told as
// stories and still answered with one whole number:
//   d16 chains of fractions, and sequences that grow by a fixed step.
//   d17 combined rates and averages.
//   d18 two unknowns from a total plus a relationship between them.
//   d19 working backwards through a chain of operations.
//   d20 capstone: several of the above in one problem.
//
// INTEGER SAFETY (the rule that matters here): `ok` is only a PREFERENCE.
// After 50 rejected draws bankGenre.ts falls back to the first draw anyway,
// so `answer` must still return a non-negative whole number for that draw.
// Every template below is therefore built from +, -, * and floor, or uses an
// `ok` whose hit rate is at worst 1 in 5 — never a long shot that would
// eventually render a fraction as her "correct" answer.
export const ARITHMETIC_BANK: ArithmeticBankItem[] = [
  // d1: counting/adding within 10, age 6
  {
    id: "ar-01", d: 1,
    template: "Aoife has {a} apples and picks {b} more. How many apples does she have now?",
    vars: { a: [2, 4], b: [2, 3] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-02", d: 1,
    template: "There are {a} ducks in the pond. {b} more ducks swim in. How many ducks are in the pond now?",
    vars: { a: [2, 5], b: [2, 3] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-03", d: 1,
    template: "Sam has {a} red balloons and {b} blue balloons. How many balloons does he have in all?",
    vars: { a: [2, 5], b: [2, 4] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-04", d: 1,
    template: "There are {a} cars in the lot. {b} more cars park. How many cars are in the lot now?",
    vars: { a: [2, 6], b: [2, 3] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-05", d: 1,
    template: "Aoife counts {a} birds on a branch. {b} more birds land on it. How many birds are on the branch now?",
    vars: { a: [2, 4], b: [2, 3] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-06", d: 1,
    template: "Mia has {a} pencils and {b} more in her bag. How many pencils does she have altogether?",
    vars: { a: [2, 5], b: [2, 3] },
    answer: v => v.a + v.b,
  },
  // d2: counting/adding and simple taking away within 10, age 6
  {
    id: "ar-07", d: 2,
    template: "Aoife has {a} stickers and gets {b} more. How many stickers does she have now?",
    vars: { a: [2, 6], b: [2, 4] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-08", d: 2,
    template: "There are {a} kittens in the basket. {b} more kittens climb in. How many kittens are in the basket now?",
    vars: { a: [2, 5], b: [2, 4] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-09", d: 2,
    template: "Aoife had {a} grapes and ate {b} of them. How many grapes are left?",
    vars: { a: [5, 9], b: [1, 4] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-10", d: 2,
    template: "There were {a} birds on the fence. {b} birds flew away. How many birds are left on the fence?",
    vars: { a: [5, 9], b: [2, 4] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-11", d: 2,
    template: "Tom has {a} toy cars. He gives {b} to his brother. How many toy cars does Tom have left?",
    vars: { a: [6, 9], b: [1, 5] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-12", d: 2,
    template: "Aoife picks {a} flowers. She picks {b} more. How many flowers does she have now?",
    vars: { a: [3, 6], b: [2, 4] },
    answer: v => v.a + v.b,
  },
  // d3: add/subtract within 20, one step, age 7 to 8
  {
    id: "ar-13", d: 3,
    template: "There are {a} children on the bus. {b} more children get on. How many children are on the bus now?",
    vars: { a: [8, 14], b: [2, 6] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-14", d: 3,
    template: "Aoife has {a} crayons. She buys {b} more. How many crayons does she have now?",
    vars: { a: [7, 13], b: [3, 7] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-15", d: 3,
    template: "A farmer has {a} sheep. He sells {b} of them. How many sheep does the farmer have left?",
    vars: { a: [12, 19], b: [3, 9] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-16", d: 3,
    template: "There were {a} apples in a basket. {b} apples were eaten. How many apples are left in the basket?",
    vars: { a: [10, 18], b: [2, 8] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-17", d: 3,
    template: "Aoife had {a} dollars. She spent {b} dollars on a toy. How many dollars does she have left?",
    vars: { a: [10, 19], b: [2, 9] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-18", d: 3,
    template: "There are {a} birds in a tree. {b} more birds land in the tree. How many birds are in the tree now?",
    vars: { a: [9, 15], b: [2, 5] },
    answer: v => v.a + v.b,
  },
  // d4: add/subtract within 20, one step, age 7 to 8
  {
    id: "ar-19", d: 4,
    template: "Aoife reads {a} pages of her book. Then she reads {b} more pages. How many pages has she read in all?",
    vars: { a: [6, 12], b: [3, 8] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-20", d: 4,
    template: "There are {a} eggs in a carton. {b} eggs break. How many eggs are left?",
    vars: { a: [12, 18], b: [2, 7] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-21", d: 4,
    template: "A shop has {a} balloons. It sells {b} of them. How many balloons are left in the shop?",
    vars: { a: [13, 19], b: [3, 9] },
    answer: v => v.a - v.b,
  },
  {
    id: "ar-22", d: 4,
    template: "Aoife has {a} marbles. Her friend gives her {b} more marbles. How many marbles does she have now?",
    vars: { a: [5, 11], b: [4, 9] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-23", d: 4,
    template: "There are {a} fish in a tank. {b} more fish are added. How many fish are in the tank now?",
    vars: { a: [7, 13], b: [3, 7] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-24", d: 4,
    template: "A baker makes {a} muffins. {b} muffins are sold. How many muffins are left?",
    vars: { a: [14, 19], b: [2, 6] },
    answer: v => v.a - v.b,
  },
  // d5: two-step within 100 including simple time and money, age 9 to 10
  {
    id: "ar-25", d: 5,
    template: "Aoife has {a} dollars. She gets {b} dollars for chores and then spends {c} dollars on a book. How many dollars does she have now?",
    vars: { a: [20, 40], b: [5, 15], c: [3, 10] },
    answer: v => v.a + v.b - v.c,
  },
  {
    id: "ar-26", d: 5,
    template: "It is {a} o'clock. In {b} hours it will be a new hour. What hour will it be?",
    vars: { a: [1, 6], b: [2, 5] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-27", d: 5,
    template: "A farmer has {a} chickens. He buys {b} more chickens, then gives away {c} chickens. How many chickens does he have now?",
    vars: { a: [20, 40], b: [5, 15], c: [3, 10] },
    answer: v => v.a + v.b - v.c,
  },
  {
    id: "ar-28", d: 5,
    template: "Aoife has {a} cents. She finds {b} more cents. How many cents does she have now?",
    vars: { a: [30, 60], b: [10, 30] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-29", d: 5,
    template: "A library has {a} books. {b} books are borrowed and {c} books are returned. How many books are in the library now?",
    vars: { a: [40, 70], b: [10, 25], c: [5, 15] },
    answer: v => v.a - v.b + v.c,
  },
  {
    id: "ar-30", d: 5,
    template: "Aoife saves {a} dollars one week and {b} dollars the next week. How many dollars has she saved in all?",
    vars: { a: [10, 30], b: [10, 30] },
    answer: v => v.a + v.b,
  },
  // d6: two-step within 100 including simple time and money, age 9 to 10
  {
    id: "ar-31", d: 6,
    template: "A store has {a} toys. It gets a delivery of {b} more toys, then sells {c} toys. How many toys does the store have now?",
    vars: { a: [30, 50], b: [10, 20], c: [10, 25] },
    answer: v => v.a + v.b - v.c,
  },
  {
    id: "ar-32", d: 6,
    template: "A train leaves at {a} o'clock and the ride takes {b} hours. What hour does it arrive if it does not pass midnight?",
    vars: { a: [1, 5], b: [2, 6] },
    answer: v => v.a + v.b,
  },
  {
    id: "ar-33", d: 6,
    template: "Aoife has {a} dollars. She buys a toy for {b} dollars and a book for {c} dollars. How much money does she have left?",
    vars: { a: [50, 90], b: [10, 20], c: [10, 20] },
    answer: v => v.a - v.b - v.c,
  },
  {
    id: "ar-34", d: 6,
    template: "There are {a} students in a school. {b} students move away and {c} new students join. How many students are in the school now?",
    vars: { a: [60, 85], b: [5, 15], c: [5, 15] },
    answer: v => v.a - v.b + v.c,
  },
  {
    id: "ar-35", d: 6,
    template: "Aoife earns {a} dollars for chores and {b} dollars for babysitting. She spends {c} dollars on a game. How many dollars does she have left?",
    vars: { a: [10, 25], b: [10, 25], c: [10, 20] },
    answer: v => v.a + v.b - v.c,
  },
  {
    id: "ar-36", d: 6,
    template: "A garden has {a} red flowers and {b} yellow flowers. {c} flowers are picked. How many flowers are left in the garden?",
    vars: { a: [20, 40], b: [20, 40], c: [10, 30] },
    answer: v => v.a + v.b - v.c,
  },
  // d7: multiplication facts in stories, age 11 to 12
  {
    id: "ar-37", d: 7,
    template: "There are {a} bags with {b} apples in each bag. How many apples are there in total?",
    vars: { a: [3, 9], b: [2, 9] },
    answer: v => v.a * v.b,
  },
  {
    id: "ar-38", d: 7,
    template: "Aoife buys {a} packs of stickers. Each pack has {b} stickers. How many stickers does she have in total?",
    vars: { a: [2, 8], b: [3, 9] },
    answer: v => v.a * v.b,
  },
  {
    id: "ar-39", d: 7,
    template: "A classroom has {a} rows of desks with {b} desks in each row. How many desks are there in the classroom?",
    vars: { a: [3, 7], b: [4, 8] },
    answer: v => v.a * v.b,
  },
  {
    id: "ar-40", d: 7,
    template: "There are {a} boxes with {b} pencils in each box. How many pencils are there altogether?",
    vars: { a: [3, 8], b: [3, 9] },
    answer: v => v.a * v.b,
  },
  {
    id: "ar-41", d: 7,
    template: "Aoife plants {a} rows of carrots with {b} carrots in each row. How many carrots did she plant?",
    vars: { a: [3, 7], b: [4, 9] },
    answer: v => v.a * v.b,
  },
  {
    id: "ar-42", d: 7,
    template: "A parking lot has {a} rows of cars with {b} cars in each row. How many cars are in the parking lot?",
    vars: { a: [4, 9], b: [3, 8] },
    answer: v => v.a * v.b,
  },
  // d8: division facts in stories, with remainders, age 11 to 12
  {
    id: "ar-43", d: 8,
    template: "Aoife has {a} candies to share equally among {b} friends. How many candies does each friend get?",
    vars: { a: [10, 60], b: [2, 9] },
    ok: v => v.a % v.b === 0,
    answer: v => Math.floor(v.a / v.b),
  },
  {
    id: "ar-44", d: 8,
    template: "Aoife has {a} stickers to put into {b} equal piles, with some left over. How many stickers are in each full pile?",
    vars: { a: [10, 50], b: [3, 9] },
    ok: v => v.a % v.b !== 0,
    answer: v => Math.floor(v.a / v.b),
  },
  {
    id: "ar-45", d: 8,
    template: "A teacher has {a} pencils to give equally to {b} students. How many pencils does each student get?",
    vars: { a: [12, 60], b: [2, 8] },
    ok: v => v.a % v.b === 0,
    answer: v => Math.floor(v.a / v.b),
  },
  {
    id: "ar-46", d: 8,
    template: "There are {a} cupcakes shared equally among {b} children, with some cupcakes left over. How many cupcakes does each child get?",
    vars: { a: [10, 50], b: [3, 9] },
    ok: v => v.a % v.b !== 0,
    answer: v => Math.floor(v.a / v.b),
  },
  {
    id: "ar-47", d: 8,
    template: "A farmer has {a} eggs to pack into cartons of {b}. How many full cartons can he make?",
    vars: { a: [10, 60], b: [4, 9] },
    answer: v => Math.floor(v.a / v.b),
  },
  {
    id: "ar-48", d: 8,
    template: "Aoife has {a} beads to make bracelets using {b} beads in each bracelet. How many full bracelets can she make?",
    vars: { a: [10, 60], b: [4, 9] },
    answer: v => Math.floor(v.a / v.b),
  },
  // d9: multi-step, fractions of groups, and rates, age 13
  {
    id: "ar-49", d: 9,
    template: "A train goes {a} miles every hour. How far does it go in {b} hours?",
    vars: { a: [20, 60], b: [2, 4] },
    ok: v => v.a % 10 === 0,
    answer: v => v.a * v.b,
  },
  {
    id: "ar-50", d: 9,
    template: "Aoife has {a} marbles. She gives away one half of them. How many marbles does she have left?",
    vars: { a: [10, 40] },
    ok: v => v.a % 2 === 0,
    answer: v => v.a - Math.floor(v.a / 2),
  },
  {
    id: "ar-51", d: 9,
    template: "A baker makes {a} cookies. She sells one third of them. How many cookies are left unsold?",
    vars: { a: [9, 30] },
    ok: v => v.a % 3 === 0,
    answer: v => v.a - Math.floor(v.a / 3),
  },
  {
    id: "ar-52", d: 9,
    template: "A car travels {a} miles every hour. How far does it travel in {b} hours?",
    vars: { a: [30, 70], b: [2, 5] },
    answer: v => v.a * v.b,
  },
  {
    id: "ar-53", d: 9,
    template: "Aoife has {a} stickers. She gives one quarter of them to her sister and {b} more to her friend. How many stickers does she have left?",
    vars: { a: [8, 40], b: [1, 4] },
    ok: v => v.a % 4 === 0,
    answer: v => v.a - Math.floor(v.a / 4) - v.b,
  },
  {
    id: "ar-54", d: 9,
    template: "A factory makes {a} toys every hour for {b} hours, then ships {c} toys away. How many toys are left?",
    vars: { a: [10, 30], b: [2, 4], c: [5, 20] },
    answer: v => v.a * v.b - v.c,
  },
  // d10: multi-step, fractions of groups, and rates, age 13
  {
    id: "ar-55", d: 10,
    template: "A shop has {a} shirts. It sells two thirds of them on Monday. How many shirts are left?",
    vars: { a: [12, 60] },
    ok: v => v.a % 3 === 0,
    answer: v => v.a - Math.floor((2 * v.a) / 3),
  },
  {
    id: "ar-56", d: 10,
    template: "A pool fills at {a} liters every minute for {b} minutes. Then {c} liters are used to fill buckets. How many liters are left in the pool?",
    vars: { a: [10, 40], b: [3, 8], c: [5, 25] },
    answer: v => v.a * v.b - v.c,
  },
  {
    id: "ar-57", d: 10,
    template: "A garden has {a} tulips. One quarter of them are red and the rest are yellow. How many yellow tulips are there?",
    vars: { a: [8, 48] },
    ok: v => v.a % 4 === 0,
    answer: v => v.a - Math.floor(v.a / 4),
  },
  {
    id: "ar-58", d: 10,
    template: "Aoife reads {a} pages every day for {b} days, then reads {c} more pages on the weekend. How many pages has she read in all?",
    vars: { a: [5, 15], b: [3, 6], c: [5, 20] },
    answer: v => v.a * v.b + v.c,
  },
  {
    id: "ar-59", d: 10,
    template: "A bus can carry {a} passengers. If {b} people want to ride and each bus fills up before the next one leaves, how many buses are needed?",
    vars: { a: [10, 30], b: [15, 90] },
    answer: v => Math.ceil(v.b / v.a),
  },
  {
    id: "ar-60", d: 10,
    template: "Aoife saves {a} dollars every week for {b} weeks. She then spends {c} dollars on a gift. How much money does she have left?",
    vars: { a: [5, 20], b: [4, 10], c: [5, 20] },
    answer: v => v.a * v.b - v.c,
  },
  // ------------------------------------------------------------------
  // d11-15: the widened band (decision #17, 2026-08-28 — she topped the
  // d10 cap with clean wins on the 1.5x clock). Multi-step chains,
  // simple percents, working backwards, unit rates, ratio shares.
  // Every template still renders a non-negative integer answer.
  // ------------------------------------------------------------------
  // d11: two-step chains with fractions of the WHOLE result
  {
    id: "ar-61", d: 11,
    template: "Aoife buys {a} packs of stickers with {b} stickers in each pack. She uses half of all her stickers. How many stickers does she have left?",
    vars: { a: [2, 6], b: [4, 12] },
    ok: v => (v.a * v.b) % 2 === 0,
    answer: v => (v.a * v.b) / 2,
  },
  {
    id: "ar-62", d: 11,
    template: "One tenth of the {a} children at a school wear glasses. How many children wear glasses?",
    vars: { a: [20, 90] },
    ok: v => v.a % 10 === 0,
    answer: v => v.a / 10,
  },
  {
    id: "ar-63", d: 11,
    template: "Aoife walks for {a} minutes every day. How many minutes does she walk in two whole weeks?",
    vars: { a: [5, 20] },
    answer: v => 14 * v.a,
  },
  {
    id: "ar-64", d: 11,
    template: "A box holds {a} red pens and twice as many blue pens. How many pens are in the box altogether?",
    vars: { a: [3, 12] },
    answer: v => 3 * v.a,
  },
  // d12: simple percents and three-step chains
  {
    id: "ar-65", d: 12,
    template: "A toy costs {a} dollars. Its price goes up by ten percent. What is the new price in dollars?",
    vars: { a: [10, 90] },
    ok: v => v.a % 10 === 0,
    answer: v => v.a + v.a / 10,
  },
  {
    id: "ar-66", d: 12,
    template: "There are {a} students in a hall. Twenty five percent of them are in the choir. How many students are in the choir?",
    vars: { a: [8, 80] },
    ok: v => v.a % 4 === 0,
    answer: v => v.a / 4,
  },
  {
    id: "ar-67", d: 12,
    template: "Aoife scores {a} points in round one, doubles her score in round two, then loses {b} points. How many points does she have now?",
    vars: { a: [5, 20], b: [2, 9] },
    answer: v => 2 * v.a - v.b,
  },
  {
    id: "ar-68", d: 12,
    template: "A game costs {a} dollars. In a sale the price is cut in half, and then {b} more dollars are taken off. What is the final price in dollars?",
    vars: { a: [12, 60], b: [2, 5] },
    ok: v => v.a % 2 === 0 && v.a / 2 > v.b,
    answer: v => v.a / 2 - v.b,
  },
  // d13: unit rates and averages
  {
    id: "ar-69", d: 13,
    template: "Aoife reads {a} pages in {b} minutes, always at the same speed. How many pages does she read in one minute?",
    vars: { a: [10, 60], b: [2, 6] },
    ok: v => v.a % v.b === 0,
    answer: v => v.a / v.b,
  },
  {
    id: "ar-70", d: 13,
    template: "Three friends score {a}, {b} and {c} points in a game. What is their average score?",
    vars: { a: [2, 20], b: [2, 20], c: [2, 20] },
    ok: v => (v.a + v.b + v.c) % 3 === 0,
    answer: v => (v.a + v.b + v.c) / 3,
  },
  {
    id: "ar-71", d: 13,
    template: "A tap fills {a} liters of water every minute. How many minutes does it take to fill a {b} liter tank?",
    vars: { a: [2, 9], b: [10, 90] },
    ok: v => v.b % v.a === 0,
    answer: v => v.b / v.a,
  },
  {
    id: "ar-72", d: 13,
    template: "A baker uses {a} cups of flour to make {b} loaves of bread. How many cups does she need for {c} loaves?",
    vars: { a: [4, 24], b: [2, 6], c: [3, 9] },
    ok: v => v.a % v.b === 0,
    answer: v => (v.a / v.b) * v.c,
  },
  // d14: working backwards
  {
    id: "ar-73", d: 14,
    template: "Aoife thinks of a number. She doubles it and then adds {a}. The result is {b}. What was her number?",
    vars: { a: [2, 10], b: [10, 50] },
    ok: v => v.b > v.a && (v.b - v.a) % 2 === 0,
    answer: v => (v.b - v.a) / 2,
  },
  {
    id: "ar-74", d: 14,
    template: "Aoife spends half of her money on a book and then {a} dollars on a snack. She has {b} dollars left. How many dollars did she start with?",
    vars: { a: [2, 9], b: [2, 20] },
    answer: v => 2 * (v.a + v.b),
  },
  {
    id: "ar-75", d: 14,
    template: "A number machine takes a number, subtracts {a} from it, then multiplies the result by three. The answer that comes out is {b}. What number went in?",
    vars: { a: [1, 9], b: [6, 60] },
    ok: v => v.b % 3 === 0,
    answer: v => v.b / 3 + v.a,
  },
  {
    id: "ar-76", d: 14,
    template: "A quarter of the {a} children at camp can swim. Half of the swimmers wear goggles. How many children wear goggles?",
    vars: { a: [8, 80] },
    ok: v => v.a % 8 === 0,
    answer: v => v.a / 8,
  },
  // d15: capstone — ratio shares, combined rates, doubling chains
  {
    id: "ar-77", d: 15,
    template: "Aoife and her friend share {a} stickers so that Aoife gets two stickers for every one sticker her friend gets. How many stickers does Aoife get?",
    vars: { a: [6, 60] },
    ok: v => v.a % 3 === 0,
    answer: v => (2 * v.a) / 3,
  },
  {
    id: "ar-78", d: 15,
    template: "One tap fills {a} liters per minute and another tap fills {b} liters per minute. Running together, how many minutes do they take to fill a {c} liter tub?",
    vars: { a: [2, 6], b: [2, 6], c: [12, 96] },
    ok: v => v.c % (v.a + v.b) === 0,
    answer: v => v.c / (v.a + v.b),
  },
  {
    id: "ar-79", d: 15,
    template: "A recipe for {a} people needs {b} eggs. How many eggs are needed to cook for {c} people?",
    vars: { a: [2, 4], b: [2, 12], c: [6, 12] },
    ok: v => v.b % v.a === 0,
    answer: v => (v.b / v.a) * v.c,
  },
  {
    id: "ar-80", d: 15,
    template: "Aoife saves {a} dollars in week one and doubles the amount she saves every week after that. How many dollars does she save in week three?",
    vars: { a: [2, 12] },
    answer: v => 4 * v.a,
  },

  // -------------------------------------------------------------------
  // d16: chains of fractions, and sequences growing by a fixed step
  // -------------------------------------------------------------------
  {
    id: "ar-81", d: 16,
    template: "Aoife reads {a} pages on Monday. Every day after that she reads {b} more pages than she read the day before. How many pages does she read on Friday?",
    vars: { a: [5, 30], b: [2, 9] },
    answer: v => v.a + 4 * v.b,
    explanation: "Friday is four days after Monday, so add {b} four times: {a} plus four lots of {b}.",
  },
  {
    id: "ar-82", d: 16,
    template: "A shirt costs {a} dollars. In a sale the price falls by one quarter. Then it falls again by one third of that new price. How many dollars does the shirt cost now?",
    // Divisible by FOUR, not just two: a %2 price like 14 dollars gives a
    // correct final answer of 7 but an intermediate of 10.50, and she works
    // these in whole steps. Every stage has to land on a whole number.
    vars: { a: [12, 80] },
    ok: v => v.a % 4 === 0,
    answer: v => v.a / 2,
    explanation: "Taking away a quarter leaves three quarters, and taking away a third of that leaves two thirds of three quarters, which is exactly half of {a}.",
  },
  {
    id: "ar-83", d: 16,
    template: "A box holds {a} groups of ten pencils. In every group of ten, {b} of the pencils are red. How many pencils in the box are not red?",
    vars: { a: [3, 9], b: [1, 8] },
    answer: v => v.a * (10 - v.b),
    explanation: "Each group of ten has ten take away {b} pencils that are not red, and there are {a} groups.",
  },
  {
    id: "ar-84", d: 16,
    template: "Aoife has {a} marbles. She gives away one fifth of them, and then she finds {b} more. How many marbles does she have now?",
    vars: { a: [15, 90], b: [2, 20] },
    ok: v => v.a % 5 === 0,
    answer: v => (v.a * 4) / 5 + v.b,
    explanation: "Giving away one fifth leaves four fifths of {a}, and then {b} more are added.",
  },

  // -------------------------------------------------------------------
  // d17: combined rates and averages
  // -------------------------------------------------------------------
  {
    id: "ar-85", d: 17,
    template: "One printer prints {a} pages a minute and another prints {b} pages a minute. Running at the same time, how many pages do they print in {c} minutes?",
    vars: { a: [2, 9], b: [2, 9], c: [3, 12] },
    answer: v => (v.a + v.b) * v.c,
    explanation: "Together they print {a} plus {b} pages every minute, for {c} minutes.",
  },
  {
    id: "ar-86", d: 17,
    template: "Aoife scores {a} points on each of her first three tests, and {b} points on her fourth test. What is her average score across the four tests?",
    vars: { a: [60, 96], b: [40, 100] },
    ok: v => (3 * v.a + v.b) % 4 === 0,
    answer: v => (3 * v.a + v.b) / 4,
    explanation: "Add all four scores, which is three lots of {a} plus {b}, then share that total between the four tests.",
  },
  {
    id: "ar-87", d: 17,
    template: "A car travels {a} miles in {b} hours. Going at that same steady speed, how many miles does it travel in {c} hours?",
    vars: { a: [60, 240], b: [2, 5], c: [3, 10] },
    ok: v => v.a % v.b === 0,
    answer: v => (v.a / v.b) * v.c,
    explanation: "First find the miles in one hour, which is {a} shared between {b} hours, then multiply by {c}.",
  },
  {
    id: "ar-88", d: 17,
    template: "Aoife walks for {a} minutes covering {b} meters each minute, then runs for {c} minutes covering {d} meters each minute. How many meters does she cover altogether?",
    vars: { a: [5, 15], b: [40, 80], c: [3, 8], d: [90, 140] },
    answer: v => v.a * v.b + v.c * v.d,
    explanation: "Work out the walking distance and the running distance separately, then add them together.",
  },

  // -------------------------------------------------------------------
  // d18: two unknowns, from a total plus a relationship
  // -------------------------------------------------------------------
  {
    id: "ar-89", d: 18,
    template: "Aoife and her brother have {a} stickers between them. Aoife has {b} more stickers than her brother. How many stickers does Aoife have?",
    vars: { a: [20, 100], b: [2, 20] },
    ok: v => (v.a + v.b) % 2 === 0 && v.a > v.b,
    answer: v => Math.floor((v.a + v.b) / 2),
    explanation: "If they had the same number they would have half of {a} each. Aoife has half of the extra {b} more than that, so take {a} plus {b} and halve it.",
  },
  {
    id: "ar-90", d: 18,
    template: "Two numbers add up to {a}. The bigger number is {b} times the smaller number. What is the smaller number?",
    vars: { a: [12, 120], b: [2, 5] },
    ok: v => v.a % (v.b + 1) === 0,
    answer: v => Math.floor(v.a / (v.b + 1)),
    explanation: "The total is made of one small part plus {b} more small parts, so {a} splits into {b} plus one equal parts.",
  },
  {
    id: "ar-91", d: 18,
    template: "A rope {a} meters long is cut into two pieces, and one piece is {b} meters longer than the other. How many meters long is the shorter piece?",
    vars: { a: [20, 100], b: [2, 18] },
    ok: v => (v.a - v.b) % 2 === 0 && v.a > v.b,
    answer: v => Math.floor((v.a - v.b) / 2),
    explanation: "Take the extra {b} meters off first, and what remains splits into two equal pieces.",
  },
  {
    id: "ar-92", d: 18,
    template: "A box of {a} fruits holds only apples and pears, and there are {b} times as many apples as pears. How many pears are in the box?",
    vars: { a: [12, 96], b: [2, 5] },
    ok: v => v.a % (v.b + 1) === 0,
    answer: v => Math.floor(v.a / (v.b + 1)),
    explanation: "For every one pear there are {b} apples, so the {a} fruits come in groups of {b} plus one, and each group holds a single pear.",
  },

  // -------------------------------------------------------------------
  // d19: working backwards through a chain
  // -------------------------------------------------------------------
  {
    id: "ar-93", d: 19,
    template: "Aoife has some stickers. She gives {a} of them away, then shares everything left equally among {b} friends, and each friend gets {c} stickers. How many stickers did she start with?",
    vars: { a: [3, 25], b: [2, 8], c: [3, 15] },
    answer: v => v.b * v.c + v.a,
    explanation: "Undo the sharing first, so {b} friends with {c} each is {b} times {c}, then put the {a} she gave away back on top.",
  },
  {
    id: "ar-94", d: 19,
    template: "Aoife thinks of a number. She doubles it and then adds {a}. Her answer is {b}. What number did she think of?",
    vars: { a: [3, 20], b: [30, 120] },
    ok: v => (v.b - v.a) % 2 === 0 && v.b > v.a,
    answer: v => Math.floor((v.b - v.a) / 2),
    explanation: "Undo the steps backwards: take the {a} back off {b}, then halve what is left.",
  },
  {
    id: "ar-95", d: 19,
    template: "A tank leaks {a} liters every hour. After {b} hours it holds {c} liters. How many liters did it hold at the start?",
    vars: { a: [3, 15], b: [2, 9], c: [10, 80] },
    answer: v => v.a * v.b + v.c,
    explanation: "It lost {a} liters {b} times over, so add all of that back onto the {c} liters still there.",
  },
  {
    id: "ar-96", d: 19,
    template: "Aoife spends one third of her money on a book, and after that she has {a} dollars left. How many dollars did she have to begin with?",
    vars: { a: [12, 90] },
    ok: v => v.a % 2 === 0,
    answer: v => Math.floor((v.a * 3) / 2),
    explanation: "The {a} dollars left are two thirds of what she started with, so half of {a} is one third, and three of those thirds is the beginning amount.",
  },

  // -------------------------------------------------------------------
  // d20: capstone, several stages in one problem
  // -------------------------------------------------------------------
  {
    id: "ar-97", d: 20,
    template: "A shop buys {a} boxes with {b} pens in each box. It sells {c} pens and packs all the rest into bags of {d}. How many full bags does it pack?",
    vars: { a: [6, 12], b: [12, 20], c: [10, 60], d: [4, 10] },
    answer: v => Math.floor((v.a * v.b - v.c) / v.d),
    explanation: "Find the total pens, which is {a} boxes of {b}, take away the {c} sold, then see how many whole groups of {d} that leaves.",
  },
  {
    id: "ar-98", d: 20,
    template: "Aoife saves {a} dollars a week for {b} weeks. She then spends {c} dollars, and after that saves {d} dollars a week for {e} more weeks. How many dollars does she have at the end?",
    vars: { a: [8, 20], b: [6, 12], c: [10, 45], d: [5, 15], e: [3, 10] },
    answer: v => v.a * v.b - v.c + v.d * v.e,
    explanation: "Work through it in order: {a} a week for {b} weeks, take away {c}, then add {d} a week for {e} weeks.",
  },
  {
    id: "ar-99", d: 20,
    template: "A hall has {a} rows of {b} seats. {c} of the seats are broken, and the working seats are shared equally between {d} classes. How many working seats does each class get?",
    vars: { a: [8, 15], b: [10, 20], c: [5, 40], d: [2, 5] },
    ok: v => (v.a * v.b - v.c) % v.d === 0,
    answer: v => Math.floor((v.a * v.b - v.c) / v.d),
    explanation: "Count all the seats as {a} rows of {b}, take off the {c} broken ones, then share what is left between {d} classes.",
  },
  {
    id: "ar-100", d: 20,
    template: "Aoife is {a} years old and her mother is {b} times as old as she is. How old will her mother be in {c} years?",
    vars: { a: [7, 12], b: [3, 5], c: [2, 15] },
    answer: v => v.a * v.b + v.c,
    explanation: "Her mother is {b} lots of {a} years old right now, and {c} more years will pass.",
  },
];
