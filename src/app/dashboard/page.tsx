import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/");
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

        <DashboardContent />
      </div>
    </main>
  );
}
