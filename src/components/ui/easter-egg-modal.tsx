"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

// Confetti colors
const CONFETTI_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#9b59b6",
  "#ff9f43",
  "#00cec9",
  "#fd79a8",
];

// Fun facts to display randomly
const FUN_FACTS = [
  "I once debugged code for 6 hours only to find a missing semicolon... in a language that doesn't require semicolons.",
  "My first program was a 'Hello World' that somehow had 47 bugs.",
  "I've had more conversations with rubber ducks than most people have with their neighbors.",
  "Coffee consumption directly correlates with code quality. This is science.",
  "I dream in syntax highlighting.",
  "The best code I ever wrote was the code I deleted.",
  "I have a love-hate relationship with CSS. Mostly hate. But also love.",
  "My git commit history reads like a novel of desperation.",
];

// Retro game quotes
const RETRO_QUOTES = [
  '"It\'s dangerous to go alone! Take this." - The Legend of Zelda',
  '"The cake is a lie." - Portal',
  '"War. War never changes." - Fallout',
  '"Do a barrel roll!" - Star Fox 64',
  '"Hey! Listen!" - Navi, Ocarina of Time',
  '"Thank you Mario! But our princess is in another castle!" - Toad',
  '"All your base are belong to us." - Zero Wing',
  '"!?" - Metal Gear Solid',
];

export function EasterEggModal({ isOpen, onClose }: EasterEggModalProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [funFact] = useState(
    () => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]
  );
  const [retroQuote] = useState(
    () => RETRO_QUOTES[Math.floor(Math.random() * RETRO_QUOTES.length)]
  );
  const modalRef = useRef<HTMLDivElement>(null);

  // Generate confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      const newConfetti: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 8,
      }));
      setConfetti(newConfetti);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="easter-egg-title"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute top-0"
                style={{
                  left: `${piece.x}%`,
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                }}
                initial={{ y: -20, rotate: 0, opacity: 1 }}
                animate={{
                  y: "100vh",
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: piece.duration,
                  delay: piece.delay,
                  ease: "easeIn" as const,
                }}
              />
            ))}
          </div>

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className="relative z-10 w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: "spring" as const, damping: 25, stiffness: 300 }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" as const, damping: 10 }}
                className="text-6xl mb-2"
              >
                🎮
              </motion.div>
              <motion.h2
                id="easter-egg-title"
                className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Achievement Unlocked!
              </motion.h2>
              <motion.p
                className="text-muted-foreground mt-1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You entered the Konami Code!
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Retro Quote */}
              <motion.div
                className="bg-muted/50 rounded-lg p-4 border border-border"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm italic text-muted-foreground">{retroQuote}</p>
              </motion.div>

              {/* Fun Fact */}
              <motion.div
                className="space-y-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Random Developer Confession
                </h3>
                <p className="text-foreground">{funFact}</p>
              </motion.div>

              {/* Secret page link */}
              <motion.div
                className="pt-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="/secret"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  onClick={onClose}
                >
                  <span>Discover the secret page</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Nice!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
