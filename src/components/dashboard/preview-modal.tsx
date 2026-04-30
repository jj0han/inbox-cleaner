"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

type ActionType = "NEWSLETTERS" | "PROMOTIONS" | "SOCIAL" | "SMART_CLEANUP";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: ActionType;
}

export function PreviewModal({ isOpen, onClose, title, type }: PreviewModalProps) {
  const { data, isLoading, error, refetch } = trpc.inbox.getPreview.useQuery(
    { type },
    { enabled: isOpen }
  );

  const [processingId, setProcessingId] = useState<string | null>(null);

  const unsubscribeMutation = trpc.inbox.unsubscribe.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Descadastramento solicitado com sucesso!");
        refetch();
      } else {
        toast.error("Não foi possível realizar o descadastramento.");
      }
      setProcessingId(null);
    },
    onError: () => {
      toast.error("Erro ao processar o descadastramento.");
      setProcessingId(null);
    },
  });

  const handleUnsubscribe = (id: string) => {
    setProcessingId(id);
    unsubscribeMutation.mutate({ messageId: id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>
            Preview dos e-mails que serão afetados por esta ação.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              Não foi possível carregar o preview.
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-2 p-3 border border-zinc-100 rounded-lg">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : data?.error === "gmail_auth_error" ? (
            <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-sm">
              Não foi possível conectar ao Gmail. Verifique as permissões.
            </div>
          ) : (
            <ScrollArea className="h-[380px] w-full rounded-md border border-zinc-200 p-4">
              {data?.emails.length === 0 ? (
                <div className="text-sm text-zinc-500 text-center py-8">Nenhum e-mail encontrado.</div>
              ) : (
                <div className="space-y-3">
                  {data?.emails.map((email) => (
                    <div
                      key={email.id}
                      className="group relative p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-sm font-semibold text-zinc-900 line-clamp-1 flex-1">{email.sender}</p>
                        {email.unsubscribeUrl && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded-full ml-2 whitespace-nowrap">
                            Descadastrar disponível
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 line-clamp-1 pr-20">{email.subject}</p>
                      {email.snippet && (
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1 pr-24">{email.snippet}</p>
                      )}

                      {email.unsubscribeUrl && (
                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-7 text-[11px] font-bold shadow-sm"
                            onClick={() => handleUnsubscribe(email.id)}
                            disabled={processingId === email.id}
                          >
                            {processingId === email.id ? "Aguarde..." : "Descadastrar"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
