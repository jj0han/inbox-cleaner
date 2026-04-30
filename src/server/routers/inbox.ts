import { router, publicProcedure } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";

export const inboxRouter = router({
  getSummary: publicProcedure.query(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      throw new Error("Unauthorized");
    }

    try {
      const gmail = google.gmail({ 
        version: "v1", 
        headers: { Authorization: `Bearer ${session.accessToken}` } 
      });
      
      const profile = await gmail.users.getProfile({ userId: "me" });
      return { messagesTotal: profile.data.messagesTotal || 0 };
    } catch (e) {
      console.error("Failed to fetch from Gmail API", e);
      throw new Error("Failed to fetch from Gmail API");
    }
  }),
  getPreview: publicProcedure.query(() => {
    return {
      emails: [
        { id: "1", sender: "marketing@loja.com", subject: "Promoção exclusiva de 50%!" },
        { id: "2", sender: "newsletter@tecnologia.com", subject: "Resumo semanal de notícias tech" },
        { id: "3", sender: "ofertas@viagens.com", subject: "Sua próxima viagem está aqui" },
        { id: "4", sender: "updates@socialmedia.com", subject: "Veja quem visitou seu perfil" },
        { id: "5", sender: "contato@academia.com", subject: "Não perca seu plano mensal" },
      ]
    };
  })
});
