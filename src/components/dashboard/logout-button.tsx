"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </Button>
  );
}
