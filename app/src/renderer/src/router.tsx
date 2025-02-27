import { createRouter as TanstackCreateRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { NotFound } from "./components/NotFound"
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./client/query"

export const createRouter = () => {
  const router = routerWithQueryClient(
    TanstackCreateRouter({
      routeTree,
      defaultPreloadDelay: 0,
      defaultPendingMinMs: 0,
      defaultPendingMs: 0,
      defaultPreload: "intent",
      defaultStaleTime: 1,
      defaultNotFoundComponent: () => {
        return <NotFound />;
      },
      context: {
        queryClient,
      },
    }),
    queryClient
  );

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
