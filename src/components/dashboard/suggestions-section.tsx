"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Suggestion {
  email: string;
  count: number;
  oldestDate: string;
}

interface SuggestionsSectionProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  isApplying: boolean;
  error?: boolean;
  onRefresh: () => void;
  onApply: (email: string) => void;
}

function daysAgo(dateStr: string): number {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 0;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function SuggestionsSection({
  suggestions,
  isLoading,
  isApplying,
  error = false,
  onRefresh,
  onApply,
}: SuggestionsSectionProps) {
  const [dismissedEmails, setDismissedEmails] = useState<Set<string>>(new Set());
  const [applyingEmail, setApplyingEmail] = useState<string | null>(null);

  const visible = suggestions.filter(s => !dismissedEmails.has(s.email));

  const handleDismiss = (email: string) => {
    setDismissedEmails(prev => new Set(prev).add(email));
  };

  const handleApply = async (email: string) => {
    setApplyingEmail(email);
    try {
      await onApply(email);
      // Dismiss from view after apply
      setDismissedEmails(prev => new Set(prev).add(email));
    } finally {
      setApplyingEmail(null);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Sugestões Inteligentes</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Remetentes com muitos e-mails não lidos antigos
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || isApplying}
          className="text-xs text-zinc-500 hover:text-zinc-900 gap-1.5"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          Analisar novamente
        </Button>
      </div>

      {/* Body */}
      <div className="divide-y divide-zinc-50">
        {error ? (
          // Error state — analysis failed (POL-02)
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm font-semibold text-zinc-700">Não foi possível analisar sua caixa.</p>
            <p className="text-xs text-zinc-400">Ocorreu um erro ao buscar sugestões.</p>
            <button
              onClick={onRefresh}
              className="mt-1 px-4 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : isLoading ? (
          // Loading skeleton — 3 rows
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 gap-4">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))
        ) : visible.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <span className="text-3xl mb-3">🎉</span>
            <p className="text-sm font-semibold text-zinc-700">Sua caixa está ótima!</p>
            <p className="text-xs text-zinc-400 mt-1">
              Não encontramos padrões suspeitos de remetentes repetidos.
            </p>
          </div>
        ) : (
          visible.map(s => {
            const days = daysAgo(s.oldestDate);
            const thisApplying = applyingEmail === s.email;
            return (
              <div key={s.email} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-6 py-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{s.email}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    <span className="font-medium text-zinc-600">{s.count}</span> e-mails não lidos
                    {days > 0 && (
                      <> · não abertos há <span className="font-medium text-zinc-600">{days}d</span></>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={thisApplying || isApplying}
                    onClick={() => handleApply(s.email)}
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
                  >
                    {thisApplying ? (
                      <span className="flex items-center gap-1">
                        <SpinIcon className="w-3 h-3 animate-spin" />
                        Arquivando…
                      </span>
                    ) : (
                      "Arquivar"
                    )}
                  </Button>
                  <button
                    aria-label={`Ignorar sugestão de ${s.email}`}
                    onClick={() => handleDismiss(s.email)}
                    disabled={thisApplying || isApplying}
                    className="p-1.5 rounded-full text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

// Inline SVG icons — no extra dependency
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SpinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
