import { Schema } from "effect";

class TodoStoreError extends Schema.TaggedError<
  TodoStoreError,
  { readonly brand: unique symbol }
>()("TodoStoreError", { cause: Schema.Defect() }) {}

export { TodoStoreError };
