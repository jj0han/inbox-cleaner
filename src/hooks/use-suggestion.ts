"use client";

import { trpc } from "@/lib/trpc";
import { useUndo } from "@/lib/undo-context";

export function useSuggestion() {
  const { startAction } = useUndo();
  const applyMutation = trpc.inbox.applySuggestion.useMutation();
  const utils = trpc.useUtils();

  const apply = async (senderEmail: string) => {
    const result = await applyMutation.mutateAsync({ senderEmail });

    if (!result.actionId) return;

    // Register with undo context — triggers the 30s undo toast
    startAction(result.actionId, result.total, "RULE_APPLY");

    // Invalidate related queries so counts + summary update
    utils.inbox.getSummary.invalidate();
    utils.inbox.getCardCounts.invalidate();
    utils.inbox.getSuggestions.invalidate();
  };

  return { apply, isPending: applyMutation.isPending };
}
