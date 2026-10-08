// The course, in order. Each unit builds on the ones before it, ending with mental math.
// Titles and lesson text live in the language files; this is just the structure.
export const UNITS = [
  { id: 'meet', kanji: '一' },      // Meet the soroban: beads, numbers, reading and clearing
  { id: 'direct', kanji: '二' },    // Direct addition and subtraction
  { id: 'five', kanji: '三' },      // Small friends: 5-complements
  { id: 'ten', kanji: '四' },       // Big friends: 10-complements
  { id: 'mixed', kanji: '五' },     // Mixing both friends
  { id: 'multi', kanji: '六' },     // Bigger numbers, long carries, adding lists
  { id: 'multiply', kanji: '七' },  // Multiplication
  { id: 'divide', kanji: '八' },    // Division
  { id: 'anzan', kanji: '九' },     // The soroban in your head: anzan
] as const;

export type UnitId = (typeof UNITS)[number]['id'];
