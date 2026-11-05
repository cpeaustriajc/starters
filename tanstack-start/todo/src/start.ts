import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { todoSerialization } from "#/domain/todo-serialization.ts";

const csrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === "serverFn",
});
const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  serializationAdapters: [todoSerialization],
}));

declare module "@tanstack/react-start" {
  interface Register {
    config: Awaited<ReturnType<typeof startInstance.getOptions>>;
  }
}

export { startInstance };
