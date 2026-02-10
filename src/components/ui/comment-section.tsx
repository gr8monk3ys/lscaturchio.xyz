"use client";

import { useState } from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { formatDate } from "../../../lib/formatDate";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  avatar?: string;
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: "Anonymous User",
      content: newComment,
      date: new Date().toISOString(),
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">Comments</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          className="min-h-[100px]"
        />
        <Button type="submit">Post Comment</Button>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={comment.avatar} />
              <AvatarFallback>{comment.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{comment.author}</h3>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {formatDate(comment.date)}
                </span>
              </div>
              <p className="mt-1 text-stone-600 dark:text-stone-300">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
