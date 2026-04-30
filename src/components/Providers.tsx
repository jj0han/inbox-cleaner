"use client";

import { SessionProvider } from "next-auth/react";
import { UndoProvider } from "@/lib/undo-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UndoProvider>{children}</UndoProvider>
    </SessionProvider>
  );
}
