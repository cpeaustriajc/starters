import { ManagedRuntime } from "effect";
import { TodoRepository } from "#/server/todo-repository.ts";

const runtime = ManagedRuntime.make(TodoRepository.layer);

export { runtime };
