import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { TodoPage } from "#/components/todo/todo-page.tsx";
import { listTodos } from "#/server/todo-functions.ts";

const TodoRoute = (): ReactElement => <TodoPage todos={useLoaderData({ from: "/" })} />;
const Route = createFileRoute("/")({ component: TodoRoute, loader: () => listTodos() });

export { Route };
