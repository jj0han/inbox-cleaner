import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { google } from "googleapis";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/");
  }

  let messagesTotal = 0;
  let error = null;

  try {
    const gmail = google.gmail({ 
      version: "v1", 
      headers: { Authorization: `Bearer ${session.accessToken}` } 
    });
    
    const profile = await gmail.users.getProfile({ userId: "me" });
    messagesTotal = profile.data.messagesTotal || 0;
  } catch (e) {
    console.error("Failed to fetch from Gmail API", e);
    error = "Não foi possível conectar ao Gmail. Verifique as permissões.";
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-zinc-50 text-zinc-900">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex items-center justify-between pb-8 border-b border-zinc-200">
          <h1 className="text-2xl font-bold tracking-tight">Inbox Cleaner</h1>
          <div className="text-sm font-medium text-zinc-500">
            {session.user?.email}
          </div>
        </header>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
          <h2 className="text-lg font-semibold mb-4 text-zinc-700">Resumo da Caixa de Entrada</h2>
          
          {error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-2">E-mails encontrados</span>
              <span className="text-6xl font-black text-zinc-900 tracking-tighter">
                {new Intl.NumberFormat('pt-BR').format(messagesTotal)}
              </span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
