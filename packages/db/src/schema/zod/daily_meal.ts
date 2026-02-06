import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { dailyMeal } from "../daily_meal";
import { z } from "zod";

export const insertDailyMealSchema = createInsertSchema(dailyMeal, {
    date: (schema) => schema.min(1, "日付は必須です"),
    mealType: (schema) => schema,
});

export const selectDailyMealSchema = createSelectSchema(dailyMeal);

export const updateDailyMealSchema = insertDailyMealSchema
    .partial()
    .omit({ userId: true });

export type InsertDailyMeal = z.infer<typeof insertDailyMealSchema>;
export type SelectDailyMeal = z.infer<typeof selectDailyMealSchema>;
export type UpdateDailyMeal = z.infer<typeof updateDailyMealSchema>;
