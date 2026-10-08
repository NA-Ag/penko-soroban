// The steps of soroban multiplication and division, as plain data for the screens to walk through

const digitsOf = (n: number) => String(n).split('').map(Number);

// Multiplication: every digit of a times every digit of b, highest places first. Each product
// is added to the soroban so its last digit lands on the rod for (place of x) + (place of y).
export interface MulStep { x: number; y: number; product: number; place: number; value: number }

export const mulSteps = (a: number, b: number): MulStep[] => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const steps: MulStep[] = [];
  db.forEach((y, j) => {
    const placeY = db.length - 1 - j;
    da.forEach((x, i) => {
      const placeX = da.length - 1 - i;
      const product = x * y;
      if (product) steps.push({ x, y, product, place: placeX + placeY, value: product * 10 ** (placeX + placeY) });
    });
  });
  return steps;
};

export const mulRods = (a: number, b: number) => String(a).length + String(b).length + 1;

// Division: one digit of the answer per place, highest first. `part` is what the divisor is
// compared with at that place; the soroban then loses quotientDigit × divisor at that place.
export interface DivStep { place: number; part: number; digit: number; value: number }

export const divSteps = (dividend: number, divisor: number): DivStep[] => {
  const steps: DivStep[] = [];
  let rest = dividend;
  for (let place = String(dividend).length - String(divisor).length; place >= 0; place--) {
    const unit = divisor * 10 ** place;
    const digit = Math.floor(rest / unit);
    // No leading zeros: the answer starts at the first place the divisor fits
    if (digit === 0 && steps.length === 0) continue;
    steps.push({ place, part: Math.floor(rest / 10 ** place), digit, value: digit * unit });
    rest -= digit * unit;
  }
  return steps;
};

export const divRods = (dividend: number) => String(dividend).length + 1;
