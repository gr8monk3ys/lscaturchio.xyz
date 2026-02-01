"use client";

import { useCallback, useSyncExternalStore } from "react";

// ============================================
// TYPES
// ============================================

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

// ============================================
// TOAST STORE (External Store Pattern)
// ============================================

const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 5000;

let toasts: Toast[] = [];
let listeners: Set<() => void> = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return toasts;
}

function getServerSnapshot() {
  return [];
}

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function addToast(options: ToastOptions): string {
  const id = generateId();
  const newToast: Toast = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? "default",
    duration: options.duration ?? DEFAULT_DURATION,
    action: options.action,
  };

  toasts = [newToast, ...toasts].slice(0, TOAST_LIMIT);
  emitChange();

  // Auto-dismiss after duration (0 means no auto-dismiss)
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }

  return id;
}

function dismissToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emitChange();
}

function dismissAllToasts() {
  toasts = [];
  emitChange();
}

// ============================================
// TOAST FUNCTION (Simple API)
// ============================================

export function toast(options: ToastOptions): string {
  return addToast(options);
}

// Convenience methods
toast.success = (title: string, options?: Omit<ToastOptions, "title" | "variant">) =>
  addToast({ ...options, title, variant: "success" });

toast.error = (title: string, options?: Omit<ToastOptions, "title" | "variant">) =>
  addToast({ ...options, title, variant: "error" });

toast.warning = (title: string, options?: Omit<ToastOptions, "title" | "variant">) =>
  addToast({ ...options, title, variant: "warning" });

toast.info = (title: string, options?: Omit<ToastOptions, "title" | "variant">) =>
  addToast({ ...options, title, variant: "info" });

toast.dismiss = dismissToast;
toast.dismissAll = dismissAllToasts;

// ============================================
// USE TOAST HOOK
// ============================================

export function useToast() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addToastCallback = useCallback((options: ToastOptions) => {
    return addToast(options);
  }, []);

  const dismissToastCallback = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  const dismissAllCallback = useCallback(() => {
    dismissAllToasts();
  }, []);

  return {
    toasts: currentToasts,
    toast: addToastCallback,
    dismiss: dismissToastCallback,
    dismissAll: dismissAllCallback,
  };
}
