import { router, publicProcedure } from "../trpc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google, gmail_v1 } from "googleapis";
import { db } from "@/lib/db";
import { z } from "zod";
import { withRetry } from "@/lib/gmail-retry";

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
  getPreview: publicProcedure
    .input(z.object({
      type: z.enum(["NEWSLETTERS", "PROMOTIONS", "SOCIAL", "SMART_CLEANUP"]),
    }))
    .query(async ({ input }) => {
      try {
        const gmail = await getGmailClient();

        const PREVIEW_QUERIES: Record<string, string> = {
          NEWSLETTERS:   "label:INBOX has:list-unsubscribe",
          PROMOTIONS:    "label:INBOX category:promotions",
          SOCIAL:        "label:INBOX category:social",
          SMART_CLEANUP: "label:INBOX (category:promotions OR category:social OR category:updates) older_than:30d",
        };

        const q = PREVIEW_QUERIES[input.type];
        const listRes = await withRetry(() =>
          gmail.users.messages.list({
            userId: "me",
            q,
            maxResults: 10,
          })
        );

        const messages = listRes.data.messages || [];
        if (messages.length === 0) return { emails: [], error: null };

        const details = await Promise.all(
          messages.map(m =>
            withRetry(() =>
              gmail.users.messages.get({
                userId: "me",
                id: m.id!,
                format: "metadata",
                metadataHeaders: ["From", "Subject", "List-Unsubscribe"],
              })
            )
          )
        );

        const emails = details.map(detail => {
          const headers = detail.data.payload?.headers || [];
          const from = headers.find(h => h.name === "From")?.value || "";
          const subject = headers.find(h => h.name === "Subject")?.value || "(sem assunto)";
          const unsubHeader = headers.find(h => h.name === "List-Unsubscribe")?.value || "";
          const snippet = detail.data.snippet || "";

          // Parse List-Unsubscribe header (e.g., "<mailto:unsub@...>, <https://...>")
          const unsubLinks = unsubHeader.match(/<([^>]+)>/g)?.map(l => l.slice(1, -1)) || [];
          const unsubscribeUrl = unsubLinks.find(l => l.startsWith("https://")) || 
                                 unsubLinks.find(l => l.startsWith("mailto:")) || 
                                 null;

          // Extract display name or raw email
          const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
          const emailMatch = from.match(/<([^>]+)>/);
          const sender = nameMatch
            ? nameMatch[1].trim()
            : emailMatch
            ? emailMatch[1]
            : from;

          return {
            id: detail.data.id!,
            sender,
            subject,
            snippet: snippet.slice(0, 120),
            unsubscribeUrl,
          };
        });

        return { emails, error: null };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("getPreview failed", msg);
        return { emails: [], error: "gmail_auth_error" };
      }
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

      // For RULE_APPLY actions: also delete the Gmail filter so future emails are no longer skipped
      if (action.filterId) {
        try {
          await gmail.users.settings.filters.delete({
            userId: "me",
            id: action.filterId,
          });
        } catch (e) {
          // Log but don't fail undo — filter may already be deleted
          console.error("Failed to delete Gmail filter during undo", e);
        }
      }

      await db.actionLog.update({
        where: { id: input.actionId },
        data: { status: "UNDONE" },
      });

      return { success: true };
    }),

  // POL-01 + POL-03: Per-key fault isolation — each count fails independently, returning null
  getCardCounts: publicProcedure.query(async () => {
    const gmail = await getGmailClient(); // auth failure throws → tRPC surfaces as error state
    const queries: Record<string, string> = {
      NEWSLETTERS: "label:INBOX has:list-unsubscribe",
      PROMOTIONS: "label:INBOX category:promotions",
      SOCIAL: "label:INBOX category:social",
      SMART_CLEANUP: "label:INBOX (category:promotions OR category:social OR category:updates) older_than:30d",
    };
    const counts = await Promise.all(
      Object.entries(queries).map(async ([type, q]) => {
        try {
          const res = await withRetry(() =>
            gmail.users.messages.list({ userId: "me", q, maxResults: 1 })
          );
          return [type, res.data.resultSizeEstimate ?? 0] as [string, number | null];
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error(`getCardCounts: failed to fetch count for ${type}`, msg);
          return [type, null] as [string, number | null];
        }
      })
    );
    return Object.fromEntries(counts) as Record<string, number | null>;
  }),

  // Plan 1.3: Analyse inbox for senders with ≥3 unread emails older than 14 days
  getSuggestions: publicProcedure.query(async () => {
    try {
      const gmail = await getGmailClient();
      const listRes = await withRetry(() =>
        gmail.users.messages.list({
          userId: "me",
          q: "is:unread older_than:14d label:INBOX",
          maxResults: 100,
        })
      );

      const messages = listRes.data.messages || [];
      if (messages.length === 0) return [];

      // Fetch metadata in parallel chunks of 10
      const chunks: gmail_v1.Schema$Message[][] = [];
      for (let i = 0; i < messages.length; i += 10) {
        chunks.push(messages.slice(i, i + 10));
      }

      const senderMap = new Map<string, { count: number; oldestDate: string }>();

      for (const chunk of chunks) {
        const details = await Promise.all(
          chunk.map(m =>
            withRetry(() =>
              gmail.users.messages.get({
                userId: "me",
                id: m.id!,
                format: "metadata",
                metadataHeaders: ["From", "Date"],
              })
            )
          )
        );

        for (const detail of details) {
          const headers = detail.data.payload?.headers || [];
          const fromHeader = headers.find(h => h.name === "From")?.value || "";
          const dateHeader = headers.find(h => h.name === "Date")?.value || "";

          // Extract email address from "Display Name <email@example.com>" or "email@example.com"
          const emailMatch = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([^\s]+@[^\s]+)/);
          const email = emailMatch ? emailMatch[1].toLowerCase() : fromHeader.toLowerCase();

          if (!email || !email.includes("@")) continue;

          const existing = senderMap.get(email);
          if (!existing) {
            senderMap.set(email, { count: 1, oldestDate: dateHeader });
          } else {
            existing.count++;
            // Keep oldest date
            if (dateHeader && new Date(dateHeader) < new Date(existing.oldestDate)) {
              existing.oldestDate = dateHeader;
            }
          }
        }
      }

      // Filter ≥3 messages, sort descending, return top 3
      const suggestions = Array.from(senderMap.entries())
        .filter(([, v]) => v.count >= 3)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([email, v]) => ({ email, count: v.count, oldestDate: v.oldestDate }));

      return suggestions;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("getSuggestions failed", msg);
      return [];
    }
  }),

  // Plan 1.4: Archive existing inbox emails from sender + create Gmail filter for future emails
  applySuggestion: publicProcedure
    .input(z.object({ senderEmail: z.string().email() }))
    .mutation(async ({ input }) => {
      const gmail = await getGmailClient();
      const session = await getServerSession(authOptions);
      const userId = session!.user!.email!;

      // 1. Find all inbox messages from this sender
      const listRes = await gmail.users.messages.list({
        userId: "me",
        q: `from:${input.senderEmail} label:INBOX`,
        maxResults: 500,
      });

      const messageIds = (listRes.data.messages || []).map(m => m.id as string);

      // 2. Archive existing messages if any
      if (messageIds.length > 0) {
        await gmail.users.messages.batchModify({
          userId: "me",
          requestBody: {
            ids: messageIds,
            removeLabelIds: ["INBOX"],
          },
        });
      }

      // 3. Create Gmail filter so future emails from this sender skip inbox
      // Gmail returns 400 if an identical filter already exists — find and reuse it in that case
      let filterId: string;
      try {
        const filterRes = await gmail.users.settings.filters.create({
          userId: "me",
          requestBody: {
            criteria: { from: input.senderEmail },
            action: { removeLabelIds: ["INBOX"] },
          },
        });
        filterId = filterRes.data.id!;
      } catch (filterErr: unknown) {
        const msg = filterErr instanceof Error ? filterErr.message : String(filterErr);
        if (!msg.toLowerCase().includes("filter already exists")) throw filterErr;

        // Find the existing matching filter and reuse its ID
        const existing = await gmail.users.settings.filters.list({ userId: "me" });
        const match = (existing.data.filter || []).find(
          f => f.criteria?.from?.toLowerCase() === input.senderEmail.toLowerCase()
        );
        if (!match?.id) throw new Error(`Filter already exists but could not be located for ${input.senderEmail}`);
        filterId = match.id;
      }

      // 4. Log the action for undo support
      const expiresAt = new Date(Date.now() + 30 * 1000); // 30s undo window
      const action = await db.actionLog.create({
        data: {
          userId,
          actionType: "RULE_APPLY",
          expiresAt,
          filterId,
          items: {
            create: messageIds.map(id => ({ messageId: id })),
          },
        },
      });

      return {
        actionId: action.id,
        total: messageIds.length,
        messageIds,
        filterId,
      };
    }),

  unsubscribe: publicProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ input }) => {
      const gmail = await getGmailClient();
      
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: input.messageId,
        format: "metadata",
        metadataHeaders: ["List-Unsubscribe"],
      });
      
      const unsubHeader = (detail.data.payload?.headers || []).find(h => h.name === "List-Unsubscribe")?.value || "";
      const unsubLinks = unsubHeader.match(/<([^>]+)>/g)?.map(l => l.slice(1, -1)) || [];
      const link = unsubLinks.find(l => l.startsWith("https://")) || unsubLinks.find(l => l.startsWith("mailto:")) || null;
      
      if (!link) return { success: false, error: "No unsubscribe link found" };
      
      try {
        if (link.startsWith("https://")) {
          await fetch(link, { method: "GET" });
        } else if (link.startsWith("mailto:")) {
          const target = link.replace("mailto:", "");
          const [email, query] = target.split("?");
          const subject = query?.match(/subject=([^&]+)/)?.[1] || "Unsubscribe";
          
          const raw = Buffer.from(
            `To: ${email}\r\nSubject: ${decodeURIComponent(subject)}\r\n\r\nUnsubscribe`
          ).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          
          await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw }
          });
        }
        return { success: true };
      } catch (e) {
        console.error("Unsubscribe execution failed", e);
        return { success: false, error: "Execution failed" };
      }
    }),

  bulkUnsubscribe: publicProcedure
    .input(z.object({ messageIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const gmail = await getGmailClient();
      const results = { success: 0, failed: 0 };
      
      // Process in small serial chunks to avoid rate limiting
      for (const id of input.messageIds) {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id,
            format: "metadata",
            metadataHeaders: ["List-Unsubscribe"],
          });
          
          const unsubHeader = (detail.data.payload?.headers || []).find(h => h.name === "List-Unsubscribe")?.value || "";
          const unsubLinks = unsubHeader.match(/<([^>]+)>/g)?.map(l => l.slice(1, -1)) || [];
          const link = unsubLinks.find(l => l.startsWith("https://")) || unsubLinks.find(l => l.startsWith("mailto:")) || null;
          
          if (link) {
            if (link.startsWith("https://")) {
              await fetch(link, { method: "GET" });
            } else if (link.startsWith("mailto:")) {
              const target = link.replace("mailto:", "");
              const [email, query] = target.split("?");
              const subject = query?.match(/subject=([^&]+)/)?.[1] || "Unsubscribe";
              const raw = Buffer.from(`To: ${email}\r\nSubject: ${decodeURIComponent(subject)}\r\n\r\nUnsubscribe`).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
              await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
            }
            results.success++;
          } else {
            results.failed++;
          }
        } catch (e) {
          console.error(`Bulk unsubscribe failed for ${id}`, e);
          results.failed++;
        }
      }
      
      return results;
    }),
});

