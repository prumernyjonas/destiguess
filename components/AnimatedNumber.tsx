'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({ value, duration = 1, className = '', decimals = 0 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { 
    damping: 30, 
    stiffness: 200,
  });
  
  const rounded = useTransform(spring, (latest) => {
    return Number(latest.toFixed(decimals));
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [rounded]);

  return (
    <span className={className}>
      {displayValue.toFixed(decimals)}
    </span>
  );
}

interface AccuracyLabelProps {
  distanceKm: number;
}

export function AccuracyLabel({ distanceKm }: AccuracyLabelProps) {
  let label = '';
  let color = '';

  if (distanceKm < 1) {
    label = 'Insane';
    color = 'text-emerald-400';
  } else if (distanceKm < 10) {
    label = 'Great';
    color = 'text-cyan-400';
  } else if (distanceKm < 100) {
    label = 'Good';
    color = 'text-lime-400';
  } else if (distanceKm < 1000) {
    label = 'Ok';
    color = 'text-yellow-400';
  } else {
    label = 'Far';
    color = 'text-orange-400';
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-2xl font-semibold ${color}`}
    >
      {label}
    </motion.span>
  );
}
