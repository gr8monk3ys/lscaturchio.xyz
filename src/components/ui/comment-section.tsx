"use client";

import * as React from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { formatDate } from "@/lib/formatDate";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: Date;
  avatarUrl?: string;
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // This would be replaced with actual API calls in production
  const addComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const comment: Comment = {
      id: Date.now().toString(),
      author: "Anonymous User", // Replace with actual user name when auth is implemented
      content: newComment,
      date: new Date(),
      avatarUrl: undefined // Replace with actual user avatar when auth is implemented
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="mt-16 space-y-8">
      <h2 className="text-2xl font-bold">Comments</h2>
      
      {/* Comment Form */}
      <div className="space-y-4">
        <Textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <Button 
          onClick={addComment} 
          disabled={isSubmitting || !newComment.trim()}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      {/* Comments List */}
      <AnimatePresence>
        {comments.length > 0 ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex space-x-4 rounded-lg bg-muted/50 p-4"
              >
                <Avatar>
                  <AvatarImage src={comment.avatarUrl} />
                  <AvatarFallback>
                    {comment.author.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{comment.author}</h3>
                    <time className="text-sm text-muted-foreground">
                      {formatDate(comment.date)}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.p 
            className="text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Be the first to comment on this post!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
