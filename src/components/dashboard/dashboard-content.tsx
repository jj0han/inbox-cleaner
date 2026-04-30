"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ActionCard } from "./action-card";
import { PreviewModal } from "./preview-modal";
import { SuggestionsSection } from "./suggestions-section";
import { useState } from "react";
import { useCleanup } from "@/hooks/use-cleanup";
import { useSuggestion } from "@/hooks/use-suggestion";
import { useUndo } from "@/lib/undo-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type ActionType = "NEWSLETTERS" | "PROMOTIONS" | "SOCIAL" | "SMART_CLEANUP";

export function DashboardContent() {
  const { data, isLoading, error } = trpc.inbox.getSummary.useQuery();
  const { data: cardCounts, isLoading: isCountsLoading } = trpc.inbox.getCardCounts.useQuery();
  const {
    data: suggestions,
    isLoading: isSuggestionsLoading,
    refetch: refetchSuggestions,
  } = trpc.inbox.getSuggestions.useQuery();

  const [previewAction, setPreviewAction] = useState<{ type: ActionType; title: string } | null>(null);
  const [unsubscribeEnabled, setUnsubscribeEnabled] = useState(false);
  const { cleanup, isProcessing } = useCleanup();
  const { apply: applySuggestion, isPending: isApplying } = useSuggestion();
  const { activeAction } = useUndo();

  return (
    <div className="w-full max-w-4xl space-y-8">
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
        <h2 className="text-lg font-semibold mb-4 text-zinc-700">Resumo da Caixa de Entrada</h2>

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            Não foi possível carregar os dados. Verifique as permissões.
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-48" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-2">E-mails encontrados</span>
            <span className="text-6xl font-black text-zinc-900 tracking-tighter">
              {new Intl.NumberFormat('pt-BR').format(data?.messagesTotal || 0)}
            </span>
            <div className="mt-8 flex flex-col items-center gap-4">
              <Button
                onClick={() => cleanup("SMART_CLEANUP")}
                disabled={activeAction !== null}
                className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Limpeza Inteligente
              </Button>
              <p className="text-xs font-medium text-zinc-400">
                Arquiva e-mails promocionais e sociais com mais de 30 dias
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ActionCard
          title="Remover Newsletters"
          description="E-mails promocionais, boletins informativos e atualizações de produtos."
          type="NEWSLETTERS"
          count={isCountsLoading ? undefined : (cardCounts as Record<string, number>)?.NEWSLETTERS}
          onPreviewClick={() => setPreviewAction({ type: "NEWSLETTERS", title: "Remover Newsletters" })}
          onCleanupClick={() => cleanup("NEWSLETTERS", unsubscribeEnabled)}
          isCleaning={isProcessing && activeAction?.type === "NEWSLETTERS"}
          isDisabled={activeAction !== null || isProcessing}
          progress={activeAction?.type === "NEWSLETTERS" ? { current: activeAction.current, total: activeAction.total } : undefined}
          cleanupText={unsubscribeEnabled ? "Limpar e Descadastrar" : "Limpar Agora"}
          footerExtra={
            <div className="flex items-center space-x-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 transition-colors">
              <Switch 
                id="unsub-toggle" 
                checked={unsubscribeEnabled}
                onCheckedChange={setUnsubscribeEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="unsub-toggle" className="text-xs font-bold text-blue-700 cursor-pointer">
                Descadastrar e arquivar (Unsubscribe)
              </Label>
            </div>
          }
        />
        <ActionCard
          title="Limpar Notificações"
          description="Avisos de redes sociais, confirmações de segurança e alertas automáticos."
          type="SOCIAL"
          count={isCountsLoading ? undefined : (cardCounts as Record<string, number>)?.SOCIAL}
          onPreviewClick={() => setPreviewAction({ type: "SOCIAL", title: "Limpar Notificações" })}
          onCleanupClick={() => cleanup("SOCIAL")}
          isCleaning={isProcessing && activeAction?.type === "SOCIAL"}
          isDisabled={activeAction !== null || isProcessing}
          progress={activeAction?.type === "SOCIAL" ? { current: activeAction.current, total: activeAction.total } : undefined}
        />
      </section>

      <SuggestionsSection
        suggestions={suggestions ?? []}
        isLoading={isSuggestionsLoading}
        isApplying={isApplying}
        onRefresh={() => refetchSuggestions()}
        onApply={applySuggestion}
      />

      <PreviewModal
        isOpen={previewAction !== null}
        type={previewAction?.type ?? "NEWSLETTERS"}
        title={previewAction?.title ?? ""}
        onClose={() => setPreviewAction(null)}
      />
    </div>
  );
}

