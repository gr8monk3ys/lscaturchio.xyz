"use client";

import { useState, useEffect, RefObject } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextToSpeechProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

export function TextToSpeech({ contentRef }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);
      const newUtterance = new SpeechSynthesisUtterance();
      newUtterance.rate = 0.9;

      newUtterance.onend = () => {
        setIsPlaying(false);
      };

      setUtterance(newUtterance);
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggle = () => {
    if (!contentRef.current || !utterance) return;

    if (!isPlaying) {
      utterance.text = contentRef.current.textContent || "";
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      className="flex items-center gap-2"
      aria-label={isPlaying ? "Pause text-to-speech" : "Listen to article"}
    >
      {isPlaying ? (
        <>
          <Pause className="h-4 w-4" /> Pause
        </>
      ) : (
        <>
          <Play className="h-4 w-4" /> Listen
        </>
      )}
    </Button>
  );
}
