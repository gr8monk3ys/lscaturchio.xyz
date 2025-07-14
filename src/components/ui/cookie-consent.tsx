// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, Info } from "lucide-react";
import { Button } from "./button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import Link from "next/link";

interface CookieConsentProps {
  privacyPolicyUrl?: string;
}

export function CookieConsent({
  privacyPolicyUrl = "/privacy-policy",
}: CookieConsentProps): JSX.Element | null {
  const [showConsent, setShowConsent] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Cookie consent state
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Check if consent has been given previously
  useEffect(() => {
    const consentGiven = localStorage.getItem("cookieConsent");
    if (!consentGiven) {
      // Delay showing the banner for a better UX
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consentGiven);
        setCookiePreferences(savedPreferences);
      } catch (e) {
        console.error("Error parsing cookie preferences:", e);
      }
    }
  }, []);

  const acceptAll = () => {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    setCookiePreferences(preferences);
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setShowConsent(false);
  };

  const rejectAll = () => {
    const preferences = {
      necessary: true, // Always necessary
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    setCookiePreferences(preferences);
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setShowConsent(false);
  };

  const savePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(cookiePreferences));
    setShowConsent(false);
    setShowPreferences(false);
  };

  // If already consented, don't show the banner
  if (!showConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="mx-auto max-w-4xl rounded-lg border border-stone-200 bg-white p-4 shadow-lg dark:border-stone-700 dark:bg-stone-900 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Cookie className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-medium">Cookie Consent</h3>
          </div>
          
          <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
            This website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
            By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can manage your preferences or reject non-essential cookies by clicking the respective buttons.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={acceptAll} variant="default">
              Accept All
            </Button>
            <Button onClick={rejectAll} variant="outline">
              Reject All
            </Button>
            <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
              <DialogTrigger asChild>
                <Button variant="outline">Preferences</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cookie Preferences</DialogTitle>
                  <DialogDescription>
                    Select which cookies you want to accept. Necessary cookies help with the basic functionality of our website.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="space-y-4">
                    {/* Necessary cookies - always enabled */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Necessary</h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Essential for the website to function properly.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked 
                        disabled 
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary" 
                      />
                    </div>
                    
                    {/* Analytics cookies */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Analytics</h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Help us understand how visitors interact with the website.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={cookiePreferences.analytics} 
                        onChange={(e) => setCookiePreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary" 
                      />
                    </div>
                    
                    {/* Marketing cookies */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing</h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Used to track visitors across websites for advertising purposes.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={cookiePreferences.marketing} 
                        onChange={(e) => setCookiePreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary" 
                      />
                    </div>
                    
                    {/* Preferences cookies */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Preferences</h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Remember your settings and preferences for a better experience.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={cookiePreferences.preferences} 
                        onChange={(e) => setCookiePreferences(prev => ({ ...prev, preferences: e.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary" 
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
                  <Button variant="outline" asChild>
                    <Link href={privacyPolicyUrl}>
                      <Info className="mr-2 h-4 w-4" />
                      Privacy Policy
                    </Link>
                  </Button>
                  <Button onClick={savePreferences}>Save Preferences</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto h-8 w-8" 
              onClick={() => setShowConsent(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
