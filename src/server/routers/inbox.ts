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
      const response = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"],
        maxResults: 1,
      });
      return { messagesTotal: response.data.resultSizeEstimate || 0, error: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Auth errors (401/Unauthorized) → return safe fallback, don't crash dashboard
      console.error("Failed to fetch from Gmail API", msg);
      return { messagesTotal: 0, error: "gmail_auth_error" };
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
  }),

  startCleanupAction: publicProcedure
    .input(z.object({
      type: z.enum(["NEWSLETTERS", "PROMOTIONS", "SOCIAL", "SMART_CLEANUP"]),
    }))
    .mutation(async ({ input }) => {
      const gmail = await getGmailClient();
      const session = await getServerSession(authOptions);
      const userId = session!.user!.email!; // Guaranteed by auth check

      let query = "label:INBOX ";
      if (input.type === "NEWSLETTERS") query += "has:list-unsubscribe";
      else if (input.type === "PROMOTIONS") query += "category:promotions";
      else if (input.type === "SOCIAL") query += "category:social";
      else if (input.type === "SMART_CLEANUP") query += "(category:promotions OR category:social OR category:updates) older_than:30d";

      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 500, // Limit for phase 3 stability
      });

      const messageIds = (response.data.messages || []).map(m => m.id as string);

      if (messageIds.length === 0) {
        return { actionId: null, total: 0 };
      }

      const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds

      const action = await db.actionLog.create({
        data: {
          userId,
          actionType: input.type,
          expiresAt,
          items: {
            create: messageIds.map(id => ({ messageId: id })),
          },
        },
      });

      return { 
        actionId: action.id, 
        total: messageIds.length,
        messageIds 
      };
    }),

  executeBatch: publicProcedure
    .input(z.object({
      actionId: z.string(),
      messageIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const gmail = await getGmailClient();
      
      // Batch modify to remove INBOX label (archiving)
      await gmail.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: input.messageIds,
          removeLabelIds: ["INBOX"],
        },
      });

      return { success: true };
    }),

  undoAction: publicProcedure
    .input(z.object({
      actionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const gmail = await getGmailClient();
      
      const action = await db.actionLog.findUnique({
        where: { id: input.actionId },
        include: { items: true },
      });

      if (!action || action.status === "UNDONE") {
        throw new Error("Action not found or already undone");
      }

      const messageIds = action.items.map(i => i.messageId);

      // Batch modify to add INBOX label back
      await gmail.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: messageIds,
          addLabelIds: ["INBOX"],
        },
      });

      await db.actionLog.update({
        where: { id: input.actionId },
        data: { status: "UNDONE" },
      });

      return { success: true };
    }),
});
