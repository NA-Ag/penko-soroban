import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlashSettings } from '../types';

interface FlashAnzanProps {
  settings: FlashSettings;
  onComplete: (numbers: number[], sum: number) => void;
  onCancel: () => void;
}

const FlashAnzan: React.FC<FlashAnzanProps> = ({ settings, onComplete, onCancel }) => {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1: Ready, 0...N: Showing, N+1: Input
  const [numbers, setNumbers] = useState<number[]>([]);
  const [showBlank, setShowBlank] = useState(false);
  
  // Audio context for beep (optional enhancement for rhythm)
  // const playBeep = () => { ... }

  useEffect(() => {
    // Generate numbers on mount
    const min = Math.pow(10, settings.digits - 1);
    const max = Math.pow(10, settings.digits) - 1;
    const generated = Array.from({ length: settings.count }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
    setNumbers(generated);
    
    // Start countdown
    let count = 3;
    const countdown = setInterval(() => {
      if (count > 0) {
        setCurrentNumber(count * -1); // Negative indicates countdown
        count--;
      } else {
        clearInterval(countdown);
        startSequence();
      }
    }, 1000);

    return () => clearInterval(countdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const startSequence = () => {
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (numbers.length === 0 || currentIndex === -1) return;

    if (currentIndex >= numbers.length) {
      // Finished
      const sum = numbers.reduce((a, b) => a + b, 0);
      onComplete(numbers, sum);
      return;
    }

    // Sequence logic: Show Number -> Show Blank -> Next Number
    // The "Interval" includes the visual duration. 
    // Usually Flash Anzan is: Number (X ms) -> Blank (Y ms). 
    // To simplify: Show number for 80% of interval, blank for 20%.
    
    const showDuration = Math.max(settings.interval * 0.7, 50); // Ensure at least 50ms visibility
    const blankDuration = settings.interval - showDuration;

    setCurrentNumber(numbers[currentIndex]);
    setShowBlank(false);

    const blankTimer = setTimeout(() => {
      setShowBlank(true);
    }, showDuration);

    const nextTimer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
    }, settings.interval);

    return () => {
      clearTimeout(blankTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, numbers, settings, onComplete]);

  // Render logic
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center cursor-none">
       {/* Exit button visible on hover/touch only ideally, but we'll make it subtle */}
      <button 
        onClick={onCancel}
        className="absolute top-4 right-4 text-gray-600 hover:text-white px-4 py-2"
      >
        Exit
      </button>

      <div className="text-center w-full">
        {currentIndex === -1 && currentNumber !== null ? (
            // Countdown
            <div className="text-9xl font-mono text-amber-500 font-bold animate-pulse">
                {Math.abs(currentNumber)}
            </div>
        ) : (
            // Flash Number
            <div className="text-[15vw] font-mono text-white font-bold leading-none select-none">
                 {showBlank ? (
                     <span className="opacity-0">_</span>
                 ) : (
                     currentNumber?.toLocaleString()
                 )}
            </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-10 left-10 right-10 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
            className="h-full bg-amber-500 transition-all duration-300 ease-linear"
            style={{ width: `${Math.max(0, (currentIndex / settings.count) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FlashAnzan;