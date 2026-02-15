"use client";

import { useState, useEffect, useRef, useCallback, FormEvent, KeyboardEvent } from "react";
import { Paperclip, Mic, CornerDownLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/chat/chat-bubble";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi! I'm Lorenzo. How can I help you today?",
      sender: "ai",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the modal is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus trap: cycle Tab/Shift+Tab within the modal
  const handleModalKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [onClose]
  );

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      content: query,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          `Chat request failed with status ${response.status}`
        );
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: data.answer,
          sender: "ai",
        },
      ]);
    } catch (error) {
      logError("Chat request failed", error, { component: "ChatModal", action: "handleSubmit" });
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "I apologize, but I'm having trouble responding right now. Please try again later.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
        onKeyDown={handleModalKeyDown}
        className="fixed inset-4 md:inset-x-auto md:inset-y-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-background rounded-lg shadow-lg border flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h2 id="chat-modal-title" className="text-lg font-semibold">Chat with Lorenzo</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={
                    message.sender === "user"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                      : "/images/portrait.webp"
                  }
                  fallback={message.sender === "user" ? "Y" : "LS"}
                />
                <ChatBubbleMessage
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src="/images/portrait.webp"
                  fallback="LS"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </div>

        <div className="p-4 border-t">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Ctrl + Enter to send)"
              aria-label="Chat message"
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <div className="flex">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label="Attach file"
                  className="hidden md:inline-flex"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label="Voice input"
                  className="hidden md:inline-flex"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" size="sm" className="ml-auto h-8 px-4 gap-1.5">
                Send Message
                <CornerDownLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
