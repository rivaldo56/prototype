import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "../../lib/utils";

export interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  circleClassName?: string;
  className?: string;
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.25,
  numCircles = 7,
  className,
  circleClassName,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none overflow-visible",
        className
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 65;
        const opacity = Math.max(0.04, mainCircleOpacity - i * 0.03);
        const animationDelay = `${i * 0.18}s`;

        return (
          <div
            key={i}
            className={cn(
              "animate-ripple absolute rounded-full border border-[#8da47e]/35 shadow-lg",
              circleClassName
            )}
            style={
              {
                "--i": i,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle: "solid",
                borderWidth: "1px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";
export default Ripple;
