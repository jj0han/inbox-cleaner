import { router } from "../trpc";
import { inboxRouter } from "./inbox";

export const appRouter = router({
  inbox: inboxRouter,
});

export type AppRouter = typeof appRouter;
