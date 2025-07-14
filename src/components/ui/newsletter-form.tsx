// Rule: TypeScript Usage - Use TypeScript for all code with explicit return types
"use client";

import { useState, useRef, useEffect } from "react";
import { MailPlus, Check, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  className?: string;
  title?: string;
  description?: string;
  position?: 'center' | 'left' | 'right';
  variant?: 'default' | 'glass' | 'card';
  showCategories?: boolean;
  categories?: Array<{ id: string; label: string }>;
}

type SubscriptionStatus = "idle" | "loading" | "success" | "error";

// Rule: TypeScript Usage - Define strict types for form state
interface FormState {
  email: string;
  status: SubscriptionStatus;
  errorMessage: string;
  selectedCategories: string[];
}

// Rule: UI and Styling - Use shadcn UI components and Tailwind CSS
export function NewsletterForm({
  className = "",
  title = "Stay updated",
  description = "Get the latest articles, tutorials, and updates delivered to your inbox.",
  position = 'center',
  variant = 'default',
  showCategories = false,
  categories = [
    { id: 'tech', label: 'Technology' },
    { id: 'design', label: 'Design' },
    { id: 'career', label: 'Career' },
    { id: 'tutorials', label: 'Tutorials' }
  ]
}: NewsletterFormProps): JSX.Element {
  // Rule: State Management - Use React hooks for state management
  const [formState, setFormState] = useState<FormState>({
    email: "",
    status: "idle",
    errorMessage: "",
    selectedCategories: []
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle input focus animation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Animation variants for framer motion
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };
  
  const inputVariants = {
    focused: { scale: 1.02, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" },
    unfocused: { scale: 1, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }
  };
  
  // Update email in form state
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, email: e.target.value }));
  };

  // Rule: Error Handling - Implement proper validation and error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!formState.email) {
      setFormState(prev => ({ ...prev, status: "error", errorMessage: "Please enter your email address" }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setFormState(prev => ({ ...prev, status: "error", errorMessage: "Please enter a valid email address" }));
      return;
    }

    setFormState(prev => ({ ...prev, status: "loading" }));

    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formState.email,
          categories: formState.selectedCategories
        }),
      });

      if (response.ok) {
        setFormState({
          email: "",
          status: "success",
          errorMessage: "",
          selectedCategories: []
        });
      } else {
        setFormState(prev => ({
          ...prev, 
          status: "error", 
          errorMessage: "An error occurred. Please try again."
        }));
      }
    } catch (error) {
      setFormState(prev => ({
        ...prev, 
        status: "error", 
        errorMessage: "Network error. Please try again."
      }));
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setFormState(prev => {
      const isSelected = prev.selectedCategories.includes(categoryId);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter(id => id !== categoryId)
          : [...prev.selectedCategories, categoryId]
      };
    });
  };

  // Get container classes based on variant
  // Rule: UI and Styling - Implement consistent border radius and minimal shadows
  const getContainerClasses = () => {
    const baseClasses = "rounded-md p-6 transition-all duration-300";
    
    switch (variant) {
      case 'glass':
        return cn(baseClasses, "backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50", className);
      case 'card':
        return cn(baseClasses, "bg-card text-card-foreground shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-200 dark:border-gray-700/70", className);
      default:
        return cn(baseClasses, "bg-white dark:bg-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800/70", className);
    }
  };
  
  // Get alignment classes based on position
  const getAlignmentClasses = () => {
    switch (position) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className={getContainerClasses()}
    >
      <div className={`${getAlignmentClasses()} mb-6`}>
        <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          {title}
          <Sparkles className="h-5 w-5 text-primary" />
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div 
          className="relative"
          animate={isFocused ? "focused" : "unfocused"}
          variants={inputVariants}
        >
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MailPlus className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full pl-10 pr-16 py-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-0 transition-colors duration-200"
            value={formState.email}
            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={formState.status === "loading" || formState.status === "success"}
          />
          {formState.status !== "idle" && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {formState.status === "loading" ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : formState.status === "success" ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : formState.status === "error" ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : null}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {showCategories && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2 text-foreground">Interests (optional)</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-colors duration-200",
                    formState.selectedCategories.includes(category.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {formState.status === "error" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-destructive text-sm"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{formState.errorMessage}</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={cn(
            "w-full py-2.5 px-4 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm transition-all duration-200 flex items-center justify-center gap-2",
            formState.status === "loading" 
              ? "bg-primary/70 text-primary-foreground" 
              : formState.status === "success" 
                ? "bg-green-600/90 text-white" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          disabled={formState.status === "loading" || formState.status === "success"}
        >
          {formState.status === "loading" ? (
            <>
              <span className="animate-pulse">Subscribing...</span>
            </>
          ) : formState.status === "success" ? (
            <>
              <Check className="h-4 w-4" />
              <span>Subscribed!</span>
            </>
          ) : (
            <>
              <span>Subscribe</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {formState.status === "success" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm text-green-600 dark:text-green-400 animate-in"
        >
          <p>Thank you for subscribing! Check your inbox for confirmation.</p>
          <p className="mt-2 text-xs text-muted-foreground">You can unsubscribe at any time.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
