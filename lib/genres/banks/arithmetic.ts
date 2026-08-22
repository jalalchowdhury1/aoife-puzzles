import type { ArithmeticBankItem } from "../bankGenre";

// Original story problem templates. {a}/{b}/{c} placeholders are filled from
// `vars` ranges by the rng; `answer` always computes a non-negative integer
// for the full range (an optional `ok` only prefers nicer-looking numbers,
// so a fallback draw is always still a valid problem). Age ramped: d1-2
// counting/adding within 10 (about age 6); d3-4 add/subtract within 20, one
// step (about age 7 to 8); d5-6 two-step within 100 including simple time
// and money (about age 9 to 10); d7-8 multiplication/division facts in
// stories, with remainders (about age 11 to 12); d9-10 multi-step problems
// with fractions of groups and rates (about age 13).
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
];
