"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useKonamiCode } from "@/hooks/use-konami-code";
import { EasterEggModal } from "@/components/ui/easter-egg-modal";
import { logConsoleEasterEgg, logKonamiSecret } from "@/lib/console-easter-egg";

interface EasterEggContextType {
  /**
   * Whether the Konami code has been triggered in this session
   */
  konamiTriggered: boolean;
  /**
   * Manually trigger the easter egg modal
   */
  triggerEasterEgg: () => void;
  /**
   * Number of times the easter egg has been triggered
   */
  triggerCount: number;
}

const EasterEggContext = createContext<EasterEggContextType | undefined>(
  undefined
);

interface EasterEggProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and manages easter egg state.
 * Listens for the Konami code and displays the easter egg modal when triggered.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <EasterEggProvider>
 *   {children}
 * </EasterEggProvider>
 * ```
 */
export function EasterEggProvider({ children }: EasterEggProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [konamiTriggered, setKonamiTriggered] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);
  const [hasLoggedConsole, setHasLoggedConsole] = useState(false);

  // Log console easter egg on mount (only once)
  useEffect(() => {
    if (!hasLoggedConsole) {
      // Small delay to ensure console is ready
      const timer = setTimeout(() => {
        logConsoleEasterEgg();
        setHasLoggedConsole(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasLoggedConsole]);

  const handleKonamiSuccess = useCallback(() => {
    setKonamiTriggered(true);
    setTriggerCount((prev) => prev + 1);
    setIsModalOpen(true);
    logKonamiSecret();
  }, []);

  // Listen for Konami code
  useKonamiCode({
    onSuccess: handleKonamiSuccess,
    allowRepeat: true,
  });

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const triggerEasterEgg = useCallback(() => {
    setKonamiTriggered(true);
    setTriggerCount((prev) => prev + 1);
    setIsModalOpen(true);
  }, []);

  const value: EasterEggContextType = {
    konamiTriggered,
    triggerEasterEgg,
    triggerCount,
  };

  return (
    <EasterEggContext.Provider value={value}>
      {children}
      <EasterEggModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </EasterEggContext.Provider>
  );
}

/**
 * Hook to access easter egg context.
 * Must be used within an EasterEggProvider.
 *
 * @example
 * ```tsx
 * const { konamiTriggered, triggerEasterEgg } = useEasterEgg();
 * ```
 */
export function useEasterEgg(): EasterEggContextType {
  const context = useContext(EasterEggContext);
  if (context === undefined) {
    throw new Error("useEasterEgg must be used within an EasterEggProvider");
  }
  return context;
}
