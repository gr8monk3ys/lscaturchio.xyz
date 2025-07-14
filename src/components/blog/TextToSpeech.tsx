// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

// Note: This is a temporary simplified version until we fix the full component

interface TextToSpeechProps {
  content: string;
  title: string;
  className?: string;
}

export function TextToSpeech({ 
  content, 
  title,
  className = "" 
}: TextToSpeechProps): JSX.Element | null {
  const [isEnabled, setIsEnabled] = useState(false);

  // Check if speech synthesis is available
  const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Display a message if speech synthesis is not supported
  if (!isSpeechSynthesisSupported) {
    return null;
  }  

  return (
    <div className={`${className} space-y-4 mb-6 p-4 rounded-md bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)]`}>
      <h3 className="text-lg font-bold font-space-mono text-stone-800 dark:text-stone-100">Listen to this article</h3>
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => setIsEnabled(!isEnabled)}
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full p-0 bg-stone-100 dark:bg-stone-700 border-0 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]">
          <Play className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Text-to-speech functionality is temporarily disabled
          </p>
        </div>
      </div>
    </div>
  );
}
