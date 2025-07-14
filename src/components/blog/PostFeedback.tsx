// Rule: TypeScript Usage - Use TypeScript for all code with explicit return types
"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface PostFeedbackProps {
  postId: string;
  title: string;
  className?: string;
}

type FeedbackRating = "helpful" | "not_helpful" | null;
type FeedbackState = "initial" | "rated" | "feedback" | "submitted";

export function PostFeedback({ 
  postId, 
  title,
  className 
}: PostFeedbackProps): JSX.Element {
  const storageKey = `post-feedback-${postId}`;
  const [storedFeedback, setStoredFeedback] = useLocalStorage<{
    rating: FeedbackRating;
    comment?: string;
    date: string;
  } | null>(storageKey, null);
  
  const [rating, setRating] = useState<FeedbackRating>(storedFeedback?.rating || null);
  const [state, setState] = useState<FeedbackState>(
    storedFeedback ? "submitted" : "initial"
  );
  const [comment, setComment] = useState<string>(storedFeedback?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // If we have stored feedback, initialize with that
    if (storedFeedback) {
      setRating(storedFeedback.rating);
      setComment(storedFeedback.comment || "");
      setState("submitted");
    }
  }, [storedFeedback]);

  const handleRating = (newRating: FeedbackRating): void => {
    if (state === "submitted") return;
    
    setRating(newRating);
    
    // If the user rates it not helpful, we'll ask for additional feedback
    if (newRating === "not_helpful") {
      setState("feedback");
    } else {
      submitFeedback(newRating);
    }
  };

  const submitFeedback = async (
    submittedRating: FeedbackRating, 
    submittedComment?: string
  ): Promise<void> => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, you would submit to an API
      // const response = await fetch('/api/post-feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     postId,
      //     rating: submittedRating,
      //     comment: submittedComment
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store in local storage
      const feedbackData = {
        rating: submittedRating,
        comment: submittedComment,
        date: new Date().toISOString()
      };
      
      setStoredFeedback(feedbackData);
      setState("submitted");
      
      toast({
        title: "Thank you for your feedback",
        description: "Your feedback helps improve our content.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "We couldn't submit your feedback. Please try again later.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = (): void => {
    submitFeedback(rating, comment);
  };

  return (
    <div className={cn(
      "mt-8 rounded-lg border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900/50",
      className
    )}>
      {state === "submitted" ? (
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-base font-medium text-stone-800 dark:text-stone-200">
            Thanks for your feedback
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Your input helps us improve our content.
          </p>
        </div>
      ) : (
        <>
          <h3 className="mb-3 text-base font-medium text-stone-800 dark:text-stone-200">
            Was this article helpful?
          </h3>
          
          <div className="flex items-center gap-4">
            <Button
              variant={rating === "helpful" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRating("helpful")}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Yes</span>
            </Button>
            
            <Button
              variant={rating === "not_helpful" ? "default" : "outline"}
              size="sm"
              onClick={() => handleRating("not_helpful")}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>No</span>
            </Button>
          </div>
          
          {state === "feedback" && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                How can we improve this article?
              </p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Your feedback helps us improve our content..."
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !comment.trim()}
                  size="sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
