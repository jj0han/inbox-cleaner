import { router, publicProcedure } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google, gmail_v1 } from "googleapis";
import { db } from "@/lib/db";
import { z } from "zod";

const getGmailClient = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    throw new Error("Unauthorized");
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  return google.gmail({ 
    version: "v1", 
    auth: oauth2Client 
  });
};

export const inboxRouter = router({
  getSummary: publicProcedure.query(async () => {
    try {
      const gmail = await getGmailClient();
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
