import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

export interface MeteorsProps {
  number?: number;
  className?: string;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
  angle?: number;
}

export const Meteors: React.FC<MeteorsProps> = ({
  number = 30,
  className,
  minDelay = 0.2,
  maxDelay = 2.5,
  minDuration = 3,
  maxDuration = 9,
  angle = 215,
}) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    // Distribute meteors across the top and right boundaries
    const styles = Array.from({ length: number }).map(() => ({
      top: `${Math.floor(Math.random() * 80) - 20}%`,
      left: `${Math.floor(Math.random() * 120) - 10}%`,
      animationDelay: `${(Math.random() * (maxDelay - minDelay) + minDelay).toFixed(2)}s`,
      animationDuration: `${(Math.random() * (maxDuration - minDuration) + minDuration).toFixed(2)}s`,
    }));
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          style={style}
          className={cn(
            "pointer-events-none absolute h-0.5 w-0.5 rounded-full bg-slate-200 shadow-[0_0_0_1px_#ffffff25,0_0_12px_2px_rgba(255,255,255,0.9)] animate-meteor",
            className
          )}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[90px] sm:w-[130px] -translate-y-1/2 bg-gradient-to-r from-slate-200 via-zinc-400/50 to-transparent" />
        </span>
      ))}
    </div>
  );
};
