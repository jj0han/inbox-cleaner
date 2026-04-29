"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-zinc-900">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-zinc-900">
          Você pode limpar milhares de e-mails agora
        </h1>
        <p className="text-xl text-zinc-500 max-w-xl mx-auto">
          Sem deletar nada importante.
        </p>
        
        <div className="pt-8">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 rounded-xl"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            Continuar com Google
          </Button>
        </div>
      </div>
    </main>
  );
}
