"use client";

import { useEffect, useState } from "react";
import { useUndo } from "@/lib/undo-context";
import { trpc } from "@/lib/trpc";
import { Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UndoToast() {
  const { activeAction, clearAction } = useUndo();
  const [timeLeft, setTimeLeft] = useState(30);
  const [isUndoing, setIsUndoing] = useState(false);
  
  const utils = trpc.useUtils();
  const undoMutation = trpc.inbox.undoAction.useMutation({
    onSuccess: () => {
      utils.inbox.getSummary.invalidate();
      clearAction();
    }
  });

  // Reset timer when action changes
  useEffect(() => {
    if (!activeAction) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAction]);

  // Clear action when timer expires — separate effect to avoid setState-in-render
  useEffect(() => {
    if (activeAction && timeLeft === 0) {
      clearAction();
    }
  }, [timeLeft, activeAction, clearAction]);

  if (!activeAction) return null;

  const handleUndo = async () => {
    setIsUndoing(true);
    await undoMutation.mutateAsync({ actionId: activeAction.actionId });
    setIsUndoing(false);
  };

  const progress = (timeLeft / 30) * 100;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4">
        {/* Progress Bar Background */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-blue-500/30 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Ação concluída
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {timeLeft}s restantes para desfazer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndo}
            disabled={isUndoing}
            className="h-9 rounded-lg border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
          >
            {isUndoing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Desfazer
          </Button>
          <button 
            onClick={clearAction}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
