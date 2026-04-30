"use client";

import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionCard } from "./action-card";

export function DashboardContent() {
  const { data, isLoading, error } = trpc.inbox.getSummary.useQuery();

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
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Remover Newsletters"
          description="E-mails promocionais, boletins informativos e atualizações de produtos."
          onPreviewClick={() => console.log("Preview Newsletters")}
        />
        <ActionCard
          title="Limpar Notificações"
          description="Avisos de redes sociais, confirmações de segurança e alertas automáticos."
          onPreviewClick={() => console.log("Preview Notifications")}
        />
      </section>
    </div>
  );
}
