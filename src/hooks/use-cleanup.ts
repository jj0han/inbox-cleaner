"use client";

import { trpc } from "@/lib/trpc";
import { useUndo } from "@/lib/undo-context";
import { useState } from "react";

export function useCleanup() {
  const { startAction, updateProgress, activeAction } = useUndo();
  const [isProcessing, setIsProcessing] = useState(false);
  const utils = trpc.useUtils();

  const startMutation = trpc.inbox.startCleanupAction.useMutation();
  const executeBatchMutation = trpc.inbox.executeBatch.useMutation();

  const cleanup = async (type: "NEWSLETTERS" | "PROMOTIONS" | "SOCIAL" | "SMART_CLEANUP") => {
    setIsProcessing(true);
    try {
      const result = await startMutation.mutateAsync({ type });

      if (!result.actionId || result.total === 0) {
        setIsProcessing(false);
        return;
      }

      const { actionId, total, messageIds } = result;

      startAction(actionId, total, type);

      const batchSize = 100;
      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize);
        await executeBatchMutation.mutateAsync({
          actionId,
          messageIds: batch,
        });
        updateProgress(Math.min(i + batchSize, total));
      }

      // Refresh data
      utils.inbox.getSummary.invalidate();
    } catch (e) {
      console.error("Cleanup failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return { cleanup, isProcessing };
}
