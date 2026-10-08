// Pixel palette shared by the in-app PenkoIcon and the icon generator script.
// 0=transparent, 1=black, 2=white, 3=blue-gray, 4=orange, 5=red, 6=yellow/gold,
// 7=blue, 8=green, 9=purple, 10=pink, 11=brown, 12=cyan, 13=gray
export const PENKO_COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#111',    // Outline/Black
  2: '#fff',    // Belly/Eyes/White
  3: '#64748b', // Slate-500 (Body)
  4: '#f97316', // Orange-500 (Beak/Feet)
  5: '#ef4444', // Red
  6: '#fbbf24', // Amber/Yellow
  7: '#3b82f6', // Blue
  8: '#22c55e', // Green
  9: '#a855f7', // Purple
  10: '#ec4899', // Pink
  11: '#8B4513', // Brown
  12: '#06b6d4', // Cyan
  13: '#9ca3af', // Light Gray
};
