import React from 'react';
import { PENKO_ANIMATIONS } from '../penko_anim';
import { PENKO_COLORS } from './penkoColors';
import { dressAsSensei } from './senseiCostume';

export type PenkoPose = 'idle' | 'talk' | 'jump' | 'hurt' | 'walk';

interface PenkoProps {
  size?: number;
  pose?: PenkoPose;
  className?: string;
}

// Penko as the soroban sensei (see senseiCostume.ts), animated
export const Penko: React.FC<PenkoProps> = React.memo(({ size = 64, pose = 'idle', className = '' }) => {
  const frames = PENKO_ANIMATIONS[pose];
  const [frameIndex, setFrameIndex] = React.useState(0);

  React.useEffect(() => {
    setFrameIndex(0);
    if (frames.length <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setFrameIndex(i => (i + 1) % frames.length), pose === 'talk' ? 300 : 500);
    return () => clearInterval(timer);
  }, [frames, pose]);

  // One <rect> per horizontal run of colour: a few dozen nodes instead of 256
  const rects = React.useMemo(() => {
    const out: { x: number; y: number; w: number; fill: string }[] = [];
    dressAsSensei(frames[frameIndex] ?? frames[0]).forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        let w = 1;
        while (x + w < row.length && row[x + w] === row[x]) w++;
        if (row[x] !== 0) out.push({ x, y, w, fill: PENKO_COLORS[row[x]] });
        x += w;
      }
    });
    return out;
  }, [frames, frameIndex]);

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {rects.map(r => <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />)}
    </svg>
  );
});
