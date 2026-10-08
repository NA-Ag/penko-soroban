// Turns a planned step into what Penko says about it, in the learner's language
import type { DigitStep } from './abacus';
import { fill, type Strings } from '../i18n';

// The place name of a rod ("ones", "tens", ...), counted from the ones rod
export const placeName = (t: Strings, rod: number, unitRod: number) => t.places[unitRod - rod] ?? t.places[t.places.length - 1];

export const explainStep = (t: Strings, step: DigitStep, unitRod: number) => {
  const d = step.digit;
  const values = { d, place: placeName(t, step.rod, unitRod), c: 0, c5: 0 };
  let text: string;
  if (step.op === '+') {
    if (step.technique === 'direct') text = t.guide.addDirect;
    else if (step.technique === 'five') { values.c = 5 - d; text = t.guide.addFive; }
    else if (step.technique === 'ten') { values.c = 10 - d; text = t.guide.addTen; }
    else { values.c = 10 - d; values.c5 = 5 - values.c; text = t.guide.addTenFive; }
  } else {
    if (step.technique === 'direct') text = t.guide.subDirect;
    else if (step.technique === 'five') { values.c = 5 - d; text = t.guide.subFive; }
    else if (step.technique === 'ten') { values.c = 10 - d; text = t.guide.subTen; }
    else { values.c = 10 - d; values.c5 = 5 - values.c; text = t.guide.subTenFive; }
  }
  const main = fill(text, values);
  // A carry or borrow that itself needs a friend (e.g. 4 + 1 on the left rod, or 9 + 1)
  return step.carry && step.carry.technique !== 'direct' ? `${main} ${t.guide.chain}` : main;
};

export const formatProblem = (start: number, terms: readonly { op: '+' | '-'; value: number }[]) =>
  [String(start), ...terms.map(term => `${term.op === '+' ? '+' : '−'} ${term.value}`)].join(' ');
