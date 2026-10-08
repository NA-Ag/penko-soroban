import React, { useEffect, useId, useRef, useState } from 'react';
import { applyMove, earth, heaven, tapBead, type Board, type Move } from '../core/abacus';
import { playBeadClick } from '../core/sound';
import { fill } from '../i18n';
import { useApp } from '../AppContext';

// Geometry, in SVG units. The drawing scales to fit its container.
const ROD_GAP = 60;
const SIDE = 22;
const FRAME = 14;
const BEAD_W = 52;
const BEAD_H = 26;
const BEAM_Y = FRAME + 2 * BEAD_H + 8;
const BEAM_H = 10;
const EARTH_TOP = BEAM_Y + BEAM_H;
const EARTH_BOTTOM = EARTH_TOP + 5 * BEAD_H + 8;
const HEIGHT = EARTH_BOTTOM + FRAME;
const VALUE_ROW = 30;
// The abacus fills the screen space left below it, but never shrinks under this height
// (on a very short screen the page scrolls instead)
const MIN_HEIGHT_PX = 220;

// How much height is left between the top of an element and the bottom of the screen, kept up
// to date as the window resizes or content above it grows (e.g. a longer message from Penko)
const useSpaceBelow = (ref: React.RefObject<HTMLElement | null>) => {
  const [space, setSpace] = useState<number | null>(null);
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // Leave room for a bottom tab bar if one is showing
      const bar = document.querySelector<HTMLElement>('nav.fixed.bottom-0');
      const barHeight = bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
      setSpace(Math.max(MIN_HEIGHT_PX, window.innerHeight - top - barHeight - 16));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [ref]);
  return space;
};

// Below this on-screen width per rod, beads get too small to tap: the abacus scrolls sideways instead
const MIN_ROD_PX = 40;
// Rods grow up to this width on big screens (tablets); the height cap keeps the controls below it in view
const MAX_ROD_PX = 150;

interface AbacusProps {
  board: Board;
  onChange?: (next: Board, move: Move) => void;
  readOnly?: boolean;
  // The rod holding the ones digit; unit dots on the beam count from it in threes
  unitRod?: number;
  showValues?: boolean;
  // A move to point out: its beads glow and an arrow shows the direction
  hint?: Move | null;
  // Point out a part of the soroban while Penko explains it
  glow?: 'heaven' | 'earth' | 'beam';
  // Rods to draw attention to (e.g. the rod a lesson is about)
  focusRods?: readonly number[];
  label?: string;
  className?: string;
}

// The bicone ("diamond") profile of a soroban bead
const beadPath = (cx: number, y: number) => {
  const l = cx - BEAD_W / 2;
  const r = cx + BEAD_W / 2;
  return `M${l},${y + BEAD_H / 2} L${l + 11},${y + 1.5} L${r - 11},${y + 1.5} L${r},${y + BEAD_H / 2} L${r - 11},${y + BEAD_H - 1.5} L${l + 11},${y + BEAD_H - 1.5} Z`;
};

const heavenY = (active: boolean) => (active ? BEAM_Y - BEAD_H : FRAME + 2);
// Earth beads are numbered from the beam outwards: active ones rest against the beam,
// the others at the bottom of the frame
const earthY = (index: number, activeCount: number) =>
  index < activeCount ? EARTH_TOP + index * BEAD_H : EARTH_BOTTOM - (4 - index) * BEAD_H;

// Which beads a hint moves on a given rod
const hintedBeads = (hint: Move | null | undefined, rod: number, value: number) => {
  if (!hint || hint.rod !== rod) return { heaven: false, earth: new Set<number>() };
  if (hint.bead === 'heaven') return { heaven: true, earth: new Set<number>() };
  const active = earth(value);
  const from = hint.delta > 0 ? active : active + hint.delta;
  return { heaven: false, earth: new Set(Array.from({ length: Math.abs(hint.delta) }, (_, i) => from + i)) };
};

export const Abacus: React.FC<AbacusProps> = ({
  board, onChange, readOnly = false, unitRod = board.length - 1, showValues = false,
  hint, glow, focusRods = [], label, className = '',
}) => {
  const { t } = useApp();
  const gradientId = useId();
  const rods = board.length;
  const width = SIDE * 2 + rods * ROD_GAP;
  const height = HEIGHT + (showValues ? VALUE_ROW : 0);
  const [focusedRod, setFocusedRod] = useState(unitRod);
  // The focus ring shows for keyboard focus only, not when a bead is tapped
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const rodRefs = useRef<(SVGGElement | null)[]>([]);
  const wrapper = useRef<HTMLDivElement>(null);
  const spaceBelow = useSpaceBelow(wrapper);

  const move = (m: Move) => {
    if (readOnly || !onChange) return;
    try {
      onChange(applyMove(board, m), m);
      playBeadClick();
    } catch {
      /* not a move a real soroban can make (e.g. a keyboard press past the last bead) */
    }
  };

  const onKeyDown = (rod: number) => (e: React.KeyboardEvent) => {
    const value = board[rod];
    const focus = (r: number) => { setFocusedRod(r); rodRefs.current[r]?.focus(); };
    switch (e.key) {
      case 'ArrowUp': move({ rod, bead: 'earth', delta: 1 }); break;
      case 'ArrowDown': move({ rod, bead: 'earth', delta: -1 }); break;
      case 'h': case 'H': case 'Enter': case ' ': move({ rod, bead: 'heaven', delta: heaven(value) ? -1 : 1 }); break;
      case 'ArrowLeft': if (rod > 0) focus(rod - 1); break;
      case 'ArrowRight': if (rod < rods - 1) focus(rod + 1); break;
      case 'Home': focus(0); break;
      case 'End': focus(rods - 1); break;
      default: return;
    }
    e.preventDefault();
  };

  return (
    <div ref={wrapper} className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={label ?? t.abacus.label}
        aria-describedby={readOnly ? undefined : `${gradientId}-help`}
        className="block mx-auto select-none touch-manipulation"
        style={{ width: '100%', minWidth: rods * MIN_ROD_PX + 40, maxWidth: rods * MAX_ROD_PX + 60, maxHeight: spaceBelow ?? '52vh' }}
      >
        <defs>
          <linearGradient id={`${gradientId}-bead`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'rgb(var(--bead-light))' }} />
            <stop offset="0.45" style={{ stopColor: 'rgb(var(--bead))' }} />
            <stop offset="1" style={{ stopColor: 'rgb(var(--bead))', stopOpacity: 0.85 }} />
          </linearGradient>
          <linearGradient id={`${gradientId}-wood`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'rgb(var(--wood))' }} />
            <stop offset="1" style={{ stopColor: 'rgb(var(--wood-dark))' }} />
          </linearGradient>
        </defs>

        {/* Frame and the window behind the rods */}
        <rect x="0" y="0" width={width} height={HEIGHT} rx="10" fill={`url(#${gradientId}-wood)`} />
        <rect x={FRAME} y={FRAME} width={width - 2 * FRAME} height={HEIGHT - 2 * FRAME} rx="3" style={{ fill: 'rgb(var(--sunken))' }} />

        {focusRods.map(rod => (
          <rect key={`focus-${rod}`} x={SIDE + rod * ROD_GAP + 2} y={FRAME} width={ROD_GAP - 4} height={HEIGHT - 2 * FRAME} style={{ fill: 'rgb(var(--shu) / 0.10)' }} />
        ))}

        {/* Rods */}
        {board.map((_, rod) => {
          const cx = SIDE + rod * ROD_GAP + ROD_GAP / 2;
          return <line key={`rod-${rod}`} x1={cx} x2={cx} y1={FRAME} y2={HEIGHT - FRAME} strokeWidth="3" style={{ stroke: 'rgb(var(--gold) / 0.55)' }} />;
        })}

        {/* Beam, with a unit dot every third rod counted from the ones rod */}
        <rect x={FRAME - 4} y={BEAM_Y} width={width - 2 * FRAME + 8} height={BEAM_H} fill={`url(#${gradientId}-wood)`}
          strokeWidth={glow === 'beam' ? 3 : 0} className={glow === 'beam' ? 'animate-pulse' : undefined} style={{ stroke: 'rgb(var(--shu))' }} />
        {board.map((_, rod) => (unitRod - rod) % 3 === 0 && (
          <circle key={`dot-${rod}`} cx={SIDE + rod * ROD_GAP + ROD_GAP / 2} cy={BEAM_Y + BEAM_H / 2} r="2.6" style={{ fill: 'rgb(var(--paper))' }}>
            <title>{rod === unitRod ? t.abacus.unitRod : ''}</title>
          </circle>
        ))}

        {/* Beads, one focusable group per rod */}
        {board.map((value, rod) => {
          const cx = SIDE + rod * ROD_GAP + ROD_GAP / 2;
          const hinted = hintedBeads(hint, rod, value);
          const activeEarth = earth(value);
          const interactive = !readOnly && !!onChange;
          const beadProps = (glow: boolean) => ({
            style: { fill: `url(#${gradientId}-bead)`, stroke: glow ? 'rgb(var(--shu))' : 'rgb(0 0 0 / 0.35)' },
            strokeWidth: glow ? 3 : 1,
            className: glow ? 'animate-pulse' : undefined,
          });
          return (
            <g
              key={`beads-${rod}`}
              ref={el => { rodRefs.current[rod] = el; }}
              role={interactive ? 'slider' : 'img'}
              tabIndex={interactive ? (rod === focusedRod ? 0 : -1) : undefined}
              aria-label={fill(t.abacus.rod, { n: rods - rod, value })}
              aria-valuemin={interactive ? 0 : undefined}
              aria-valuemax={interactive ? 9 : undefined}
              aria-valuenow={interactive ? value : undefined}
              onKeyDown={interactive ? onKeyDown(rod) : undefined}
              onFocus={e => { setFocusedRod(rod); setKeyboardFocus(e.currentTarget.matches(':focus-visible')); }}
              onBlur={() => setKeyboardFocus(false)}
              className={interactive ? 'cursor-pointer outline-none' : undefined}
            >
              {/* Heaven bead */}
              <g style={{ transform: `translateY(${heavenY(heaven(value) === 1)}px)`, transition: 'transform 120ms ease-out' }}
                onPointerDown={interactive ? () => move(tapBead(board, rod, 'heaven')) : undefined}>
                <rect x={cx - ROD_GAP / 2} y={-3} width={ROD_GAP} height={BEAD_H + 6} fill="transparent" />
                <path d={beadPath(cx, 0)} {...beadProps(hinted.heaven || glow === 'heaven')} />
              </g>
              {/* Earth beads */}
              {[0, 1, 2, 3].map(i => (
                <g key={i} style={{ transform: `translateY(${earthY(i, activeEarth)}px)`, transition: 'transform 120ms ease-out' }}
                  onPointerDown={interactive ? () => move(tapBead(board, rod, 'earth', i)) : undefined}>
                  <rect x={cx - ROD_GAP / 2} y={0} width={ROD_GAP} height={BEAD_H} fill="transparent" />
                  <path d={beadPath(cx, 0)} {...beadProps(hinted.earth.has(i) || glow === 'earth')} />
                </g>
              ))}
              {/* Direction arrow for a hinted move: toward the beam adds, away from it removes */}
              {hint?.rod === rod && (() => {
                const towardBeam = hint.delta > 0;
                const y = hint.bead === 'heaven' ? heavenY(heaven(value) === 1) + BEAD_H / 2 : earthY([...hinted.earth][0] ?? 0, activeEarth) + (BEAD_H * hinted.earth.size) / 2;
                const down = hint.bead === 'heaven' ? towardBeam : !towardBeam;
                const x = cx + BEAD_W / 2 + 2;
                return (
                  <path d={down ? `M${x},${y - 9} l0,16 m-5,-6 l5,6 l5,-6` : `M${x},${y + 9} l0,-16 m-5,6 l5,-6 l5,6`}
                    fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'rgb(var(--shu))' }} />
                );
              })()}
              {rod === focusedRod && interactive && keyboardFocus && (
                <rect x={cx - ROD_GAP / 2 + 2} y={FRAME + 1} width={ROD_GAP - 4} height={HEIGHT - 2 * FRAME - 2} rx="4" fill="none"
                  strokeWidth="2.5" style={{ stroke: 'rgb(var(--shu))' }} />
              )}
              {showValues && (
                <text x={cx} y={HEIGHT + 21} textAnchor="middle" className="tabular font-semibold" fontSize="18" style={{ fill: 'rgb(var(--muted))' }}>{value}</text>
              )}
            </g>
          );
        })}
      </svg>
      {!readOnly && <p id={`${gradientId}-help`} className="sr-only">{t.abacus.rodHelp}</p>}
    </div>
  );
};
