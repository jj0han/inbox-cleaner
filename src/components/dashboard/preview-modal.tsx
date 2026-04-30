"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function PreviewModal({ isOpen, onClose, title }: PreviewModalProps) {
  const { data, isLoading, error } = trpc.inbox.getPreview.useQuery(undefined, {
    enabled: isOpen,
  });

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
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[300px] w-full rounded-md border border-zinc-200 p-4">
              {data?.emails.length === 0 ? (
                <div className="text-sm text-zinc-500 text-center py-8">Nenhum e-mail encontrado.</div>
              ) : (
                <div className="space-y-3">
                  {data?.emails.map((email) => (
                    <div key={email.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-100 transition-colors">
                      <p className="text-sm font-semibold text-zinc-900">{email.sender}</p>
                      <p className="text-sm text-zinc-600 truncate">{email.subject}</p>
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
