import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { todo } from "../todo";
import { z } from "zod";

// Todo schemas
export const insertTodoSchema = createInsertSchema(todo, {
    text: (schema) => schema.min(1, "Text cannot be empty"),
});

export const selectTodoSchema = createSelectSchema(todo);

// Type exports
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type SelectTodo = z.infer<typeof selectTodoSchema>;
