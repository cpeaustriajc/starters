import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import stylesheet from "#/styles.css?url";

const RootDocument = (): ReactElement => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      <Outlet />
      <Scripts />
    </body>
  </html>
);
const Route = createRootRoute({
  component: RootDocument,
  head: () => ({
    links: [{ href: stylesheet, rel: "stylesheet" }],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "Todos" },
    ],
  }),
});

export { Route };
