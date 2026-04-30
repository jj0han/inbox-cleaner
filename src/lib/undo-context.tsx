"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface UndoState {
  actionId: string;
  total: number;
  current: number;
  type: string;
}

interface UndoContextType {
  activeAction: UndoState | null;
  startAction: (actionId: string, total: number, type: string) => void;
  updateProgress: (current: number) => void;
  clearAction: () => void;
}

const UndoContext = createContext<UndoContextType | undefined>(undefined);

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const [activeAction, setActiveAction] = useState<UndoState | null>(null);

  const startAction = (actionId: string, total: number, type: string) => {
    setActiveAction({ actionId, total, current: 0, type });
  };

  const updateProgress = (current: number) => {
    setActiveAction((prev) => (prev ? { ...prev, current } : null));
  };

  const clearAction = () => {
    setActiveAction(null);
  };

  return (
    <UndoContext.Provider value={{ activeAction, startAction, updateProgress, clearAction }}>
      {children}
    </UndoContext.Provider>
  );
}

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) throw new Error("useUndo must be used within UndoProvider");
  return context;
}
