import { Effect, Schema } from "effect";
import { Todo } from "#/domain/todo.ts";
import { createSerializationAdapter } from "@tanstack/react-router";

const todoSerialization = createSerializationAdapter({
  fromSerializable: (encoded: typeof Todo.Encoded) =>
    Effect.runSync(Schema.decodeEffect(Todo)(encoded)),
  key: "todo",
  test: Schema.is(Todo),
  toSerializable: (todo: Todo) => Effect.runSync(Schema.encodeEffect(Todo)(todo)),
});

export { todoSerialization };
