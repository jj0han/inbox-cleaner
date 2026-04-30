"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

type ActionType = "NEWSLETTERS" | "PROMOTIONS" | "SOCIAL" | "SMART_CLEANUP";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: ActionType;
}

export function PreviewModal({ isOpen, onClose, title, type }: PreviewModalProps) {
  const { data, isLoading, error } = trpc.inbox.getPreview.useQuery(
    { type },
    { enabled: isOpen }
  );

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
            <ScrollArea className="h-[320px] w-full rounded-md border border-zinc-200 p-4">
              {data?.emails.length === 0 ? (
                <div className="text-sm text-zinc-500 text-center py-8">Nenhum e-mail encontrado.</div>
              ) : (
                <div className="space-y-3">
                  {data?.emails.map((email) => (
                    <div
                      key={email.id}
                      className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-100 transition-colors"
                    >
                      <p className="text-sm font-semibold text-zinc-900 truncate">{email.sender}</p>
                      <p className="text-sm text-zinc-600 truncate">{email.subject}</p>
                      {email.snippet && (
                        <p className="text-xs text-zinc-400 mt-0.5 truncate">{email.snippet}</p>
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
