import { createRouter } from "@tanstack/react-router";
import { routeTree } from "#/routeTree.gen.ts";

type AppRouter = ReturnType<typeof createRouter<typeof routeTree>>;

const getRouter = (): AppRouter =>
  createRouter({ defaultPreload: "intent", routeTree, scrollRestoration: true });

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}

export { getRouter };
