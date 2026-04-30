"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  title: string;
  description: string;
  type: "NEWSLETTERS" | "PROMOTIONS" | "SOCIAL";
  onPreviewClick: () => void;
  onCleanupClick: () => void;
  isCleaning?: boolean;
  isDisabled?: boolean;
  progress?: { current: number; total: number };
}

export function ActionCard({ 
  title, 
  description, 
  type,
  onPreviewClick, 
  onCleanupClick,
  isCleaning,
  isDisabled,
  progress 
}: ActionCardProps) {
  return (
    <Card className="relative overflow-hidden flex flex-col border-zinc-200 shadow-sm transition-shadow hover:shadow-md h-full">
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

      <CardHeader className="flex-1 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">{title}</CardTitle>
        <CardDescription className="text-sm font-medium text-zinc-500 mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-4 border-t border-zinc-100 flex gap-2">
        <Button variant="outline" onClick={onPreviewClick} className="flex-1 font-semibold">
          Ver E-mails
        </Button>
        <Button variant="default" onClick={onCleanupClick} disabled={isCleaning || isDisabled} className="flex-1 font-semibold bg-blue-600 hover:bg-blue-700">
          Limpar Agora
        </Button>
      </CardFooter>
    </Card>
  );
}
