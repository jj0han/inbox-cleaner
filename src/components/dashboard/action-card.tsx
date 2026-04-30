"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  title: string;
  description: string;
  type: "NEWSLETTERS" | "PROMOTIONS" | "SOCIAL" | "SMART_CLEANUP";
  count?: number; // undefined = loading, 0 = no emails, N = N emails
  onPreviewClick: () => void;
  onCleanupClick: () => void;
  isCleaning?: boolean;
  isDisabled?: boolean;
  progress?: { current: number; total: number };
  footerExtra?: React.ReactNode;
  cleanupText?: string;
}

export function ActionCard({ 
  title, 
  description, 
  type,
  count,
  onPreviewClick, 
  onCleanupClick,
  isCleaning,
  isDisabled,
  progress,
  footerExtra,
  cleanupText = "Limpar Agora"
}: ActionCardProps) {
  return (
    <Card className="relative overflow-hidden flex flex-col border-zinc-200 shadow-sm transition-shadow hover:shadow-md h-full">
      {/* Count badge — top-right corner */}
      <div className="absolute top-3 right-3 z-20">
        {count === undefined ? (
          // Loading skeleton
          <span className="inline-block h-5 w-16 rounded-full bg-zinc-200 animate-pulse" />
        ) : count > 0 ? (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
            {count.toLocaleString()} emails
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-200">
            0 emails
          </span>
        )}
      </div>

      {isCleaning && (
        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <p className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Limpando...</p>
          {progress && progress.total > 0 && (
            <>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs font-medium text-zinc-500">
                {progress.current} de {progress.total} removidos
              </p>
            </>
          )}
        </div>
      )}

      <CardHeader className="flex-1 pb-4 pr-20">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">{title}</CardTitle>
        <CardDescription className="text-sm font-medium text-zinc-500 mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col pt-4 border-t border-zinc-100 items-stretch gap-4">
        {footerExtra && (
          <div className="w-full">
            {footerExtra}
          </div>
        )}
        <div className="flex gap-2 w-full">
          <Button variant="outline" onClick={onPreviewClick} className="flex-1 font-semibold">
            Ver E-mails
          </Button>
          <Button variant="default" onClick={onCleanupClick} disabled={isCleaning || isDisabled} className="flex-1 font-semibold bg-blue-600 hover:bg-blue-700">
            {cleanupText}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
