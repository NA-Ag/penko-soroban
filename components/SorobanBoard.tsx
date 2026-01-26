import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';

interface SorobanBoardProps {
  initialValue?: number;
  digits?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  resetLabel?: string;
}

// Increased sizes for better clickability and realistic feel
const BEAD_HEIGHT = 36;
const BEAD_WIDTH = 60;
const ROD_SPACING = 72;
const BEAM_HEIGHT = 16;
const TOP_MARGIN = 20;

const SorobanBoard: React.FC<SorobanBoardProps> = ({ 
    initialValue = 0, 
    digits = 7, 
    readOnly = false,
    onChange,
    showValue = true,
    resetLabel = "Reset"
}) => {
  const [columns, setColumns] = useState<number[]>(Array(digits).fill(0));
  const [unitIndex, setUnitIndex] = useState(0); // 0 is the rightmost column

  useEffect(() => {
    const valStr = initialValue.toString();
    const newCols = Array(digits).fill(0);
    for (let i = 0; i < valStr.length; i++) {
        const digit = parseInt(valStr[valStr.length - 1 - i]);
        if (digits - 1 - i >= 0) {
            newCols[digits - 1 - i] = digit;
        }
    }
    setColumns(newCols);
  }, [initialValue, digits]);

  const toggleBead = (colIndex: number, type: 'HEAVEN' | 'EARTH', beadIndex: number) => {
    if (readOnly) return;

    setColumns(prev => {
      const newCols = [...prev];
      const currentVal = newCols[colIndex];
      const heavenVal = currentVal >= 5 ? 5 : 0;
      const earthVal = currentVal % 5;

      let newHeaven = heavenVal;
      let newEarth = earthVal;

      if (type === 'HEAVEN') {
        newHeaven = heavenVal === 5 ? 0 : 5;
      } else {
        // Improved Earth bead logic:
        // If clicking an active bead (beadIndex < earthVal), set value to that bead's index (effectively removing it and those below).
        // If clicking an inactive bead, set value to beadIndex + 1 (adding it and those above).
        // This allows clicking the bottom active bead to subtract 1, or the top active bead to clear the column.
        if (beadIndex < earthVal) newEarth = beadIndex;
        else newEarth = beadIndex + 1;
      }

      newCols[colIndex] = newHeaven + newEarth;
      
      const newVal = parseInt(newCols.join(''));
      if(onChange) onChange(newVal / Math.pow(10, unitIndex));
      
      return newCols;
    });
  };

  const resetBoard = () => {
    if (readOnly) return;
    // Reset to initialValue instead of 0
    const valStr = initialValue.toString();
    const newCols = Array(digits).fill(0);
    for (let i = 0; i < valStr.length; i++) {
        const digit = parseInt(valStr[valStr.length - 1 - i]);
        if (digits - 1 - i >= 0) {
            newCols[digits - 1 - i] = digit;
        }
    }
    setColumns(newCols);
    if (onChange) onChange(initialValue);
  };

  const totalValue = parseInt(columns.join('')) / Math.pow(10, unitIndex);

  return (
    <div className="flex flex-col items-center select-none overflow-x-auto p-6 pt-16 max-w-full">
      <div 
        className="relative p-3 rounded-lg shadow-2xl shrink-0"
        style={{ 
            width: digits * ROD_SPACING + 40,
            backgroundColor: COLORS.woodDark,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        {/* Reset Button (Professional Abacus Style) */}
        {!readOnly && (
            <button
                onClick={resetBoard}
                className="absolute -top-12 left-0 z-30 bg-slate-800 text-white text-xs font-bold uppercase px-3 py-1.5 rounded border border-slate-600 shadow-sm hover:bg-slate-700 active:translate-y-[1px] transition-all"
                title={resetLabel}
            >
                {resetLabel}
            </button>
        )}
        {/* Inner Frame */}
        <div className="rounded h-full w-full relative p-2 bg-slate-900/50" style={{ height: 280 }}>
          
          {/* Beam (The divider) */}
          <div 
            className="absolute left-0 right-0 z-10 flex items-center justify-between px-2 shadow-md"
            style={{ 
                top: 85, 
                height: BEAM_HEIGHT,
                backgroundColor: COLORS.woodDark,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(0,0,0,0.3)'
            }}
          >
            {/* Dot markers */}
            {Array.from({ length: digits }).map((_, i) => {
               const fromRight = digits - 1 - i;
               const isMarker = fromRight > 0 && fromRight % 3 === 0;
               const isUnit = fromRight === unitIndex;
               return (
                   <div 
                      key={i} 
                      className={`flex justify-center items-center ${!readOnly ? 'cursor-pointer hover:bg-white/5' : ''}`}
                      style={{ width: BEAD_WIDTH, height: '100%', marginRight: i === digits-1 ? 0 : (ROD_SPACING - BEAD_WIDTH) }}
                      onClick={() => !readOnly && setUnitIndex(fromRight)}
                      title={!readOnly ? "Set Unit Point" : ""}
                   >
                       {isUnit && <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.8)] z-20" />}
                       {!isUnit && isMarker && <div className="w-2 h-2 rounded-full bg-black/60 shadow-sm" />}
                   </div>
               )
            })}
          </div>

          {/* Rods and Beads */}
          <div className="flex justify-between relative h-full">
            {columns.map((colVal, colIndex) => {
              const heavenActive = colVal >= 5;
              const earthVal = colVal % 5;

              return (
                <div key={colIndex} className="relative flex flex-col items-center h-full" style={{ width: BEAD_WIDTH }}>
                  {/* Rod */}
                  <div 
                    className="absolute top-0 bottom-0 w-2 rounded-full z-0"
                    style={{ backgroundColor: COLORS.rod }}
                  ></div>

                  {/* Heaven Bead */}
                  <div className="absolute top-0 z-20" style={{ paddingTop: 10 }}>
                    <div 
                      onClick={() => toggleBead(colIndex, 'HEAVEN', 0)}
                      className={`cursor-pointer relative transition-transform duration-150 ease-out ${heavenActive ? 'translate-y-[26px]' : 'translate-y-0'}`}
                      style={{ height: BEAD_HEIGHT, width: BEAD_WIDTH }}
                    >
                         <BeadShape active={heavenActive} />
                    </div>
                  </div>

                  {/* Earth Beads */}
                  <div className="absolute top-[106px] flex flex-col gap-[1px] z-20">
                    {[0, 1, 2, 3].map((beadIndex) => {
                      const isActive = beadIndex < earthVal;
                      return (
                        <div 
                          key={beadIndex}
                          onClick={() => toggleBead(colIndex, 'EARTH', beadIndex)}
                          className={`cursor-pointer relative transition-transform duration-150 ease-out ${isActive ? 'translate-y-[-16px]' : 'translate-y-0'}`}
                          style={{ height: BEAD_HEIGHT, width: BEAD_WIDTH }}
                        >
                            <BeadShape active={isActive} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {showValue && (
          <div className="mt-8 text-5xl font-mono text-amber-500 font-bold bg-slate-900 px-8 py-3 rounded-2xl border border-slate-700 shadow-lg tracking-widest">
            {totalValue.toLocaleString(undefined, { maximumFractionDigits: 20 })}
          </div>
      )}
    </div>
  );
};

// Skeuomorphic Bead Shape
const BeadShape = ({ active }: { active: boolean }) => (
    <div className={`w-full h-full rounded-3xl relative shadow-md
        transition-colors duration-200
        ${active ? 'shadow-lg' : ''}
    `}
    style={{
        backgroundColor: active ? COLORS.beadHighlight : COLORS.bead,
        borderBottom: '3px solid rgba(0,0,0,0.3)',
        borderRight: '1px solid rgba(0,0,0,0.3)',
        transform: 'perspective(500px) rotateX(5deg)'
    }}>
        {/* Shine highlight */}
        <div className="absolute top-1 left-2 w-2/3 h-1/3 bg-white/20 rounded-full blur-[1px]"></div>
        {/* Center ridge for tactile feel */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/10"></div>
    </div>
);

export default SorobanBoard;