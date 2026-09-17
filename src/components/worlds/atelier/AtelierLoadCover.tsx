import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface AtelierLoadCoverProps {
  onComplete: () => void;
}

export const AtelierLoadCover: React.FC<AtelierLoadCoverProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 700);
    }, 400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="atelier-load-cover"
      aria-hidden="true"
    />
  );
};
