// Penko as the soroban sensei: hachimaki headband and a wooden abacus, drawn over one of the
// shared 16x16 Penko frames. Used by the in-app mascot and by the icon generator.
export const dressAsSensei = (frame: number[][]) => {
  const m = frame.map(row => [...row]);
  // Hachimaki: white band with a red sun, tails flying to the left
  for (let x = 3; x <= 12; x++) m[2][x] = 2;
  m[2][7] = 5; m[2][8] = 5;
  m[3][2] = 2; m[4][1] = 2;
  // Wooden abacus held in front: frame, beam and four gold beads
  for (let y = 8; y <= 12; y++) { m[y][1] = 11; m[y][7] = 11; }
  for (let x = 1; x <= 7; x++) { m[8][x] = 11; m[12][x] = 11; m[10][x] = 11; }
  m[9][3] = 6; m[11][3] = 6; m[9][5] = 6; m[11][5] = 6;
  return m;
};
