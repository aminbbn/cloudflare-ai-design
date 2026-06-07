import React, { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'motion/react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  gradientColors?: string[];
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  delay?: number;
  sweepDirection?: 'horizontal' | 'vertical';
  cycleDuration?: number;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 1.6,
  className = '',
  color = '#4b5563',
  gradientColors = ['#ea580c', '#fa8a14', '#f59e0b', '#fa8a14', '#ea580c'],
  spread = 170,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
  sweepDirection = 'vertical',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(-delay * 1000);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = speed * 1000;

  useAnimationFrame(time => {
    if (disabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    elapsedRef.current += deltaTime;

    const currentElapsed = Math.max(0, elapsedRef.current);
    const p = (currentElapsed % animationDuration) / animationDuration * 100;
    progress.set(direction === 'left' ? p : 100 - p);
  });

  const backgroundPosition = useTransform(progress, p => {
    // To make it sweep smoothly: we want it to go from fully outside to fully outside.
    const pos = 200 - (p * 3); // 200 to -100
    if (sweepDirection === 'vertical') {
      return `center ${pos}%`;
    } else {
      return `${pos}% center`;
    }
  });

  const handleMouseEnter = useCallback(() => pauseOnHover && setIsPaused(true), [pauseOnHover]);
  const handleMouseLeave = useCallback(() => pauseOnHover && setIsPaused(false), [pauseOnHover]);

  const gradientStops = [
    `${color} 0%`,
    `${color} 40%`,
    ...gradientColors.map((col, idx) => {
      const percentage = 45 + (idx * (10 / Math.max(1, gradientColors.length - 1)));
      return `${col} ${percentage.toFixed(1)}%`;
    }),
    `${color} 60%`,
    `${color} 100%`
  ].join(', ');

  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${gradientStops})`,
    backgroundSize: sweepDirection === 'vertical' ? '100% 300%' : '300% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent'
  };

  return (
    <motion.div
      className={`inline-block select-none pointer-events-none ${className}`}
      style={{ ...gradientStyle, backgroundPosition }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </motion.div>
  );
};

export default ShinyText;
