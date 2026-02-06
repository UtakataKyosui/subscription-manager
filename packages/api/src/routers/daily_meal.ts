import { db } from "@my-better-t-app/db";
import { dailyMeal } from "@my-better-t-app/db/schema/daily_meal";
import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";

export const dailyMealRouter = {
    list: protectedProcedure
        .input(z.object({ start: z.string(), end: z.string() }))
        .handler(async ({ input, context }) => {
            return await db
                .select()
                .from(dailyMeal)
                .where(
                    and(
                        eq(dailyMeal.userId, context.session.user.id),
                        gte(dailyMeal.date, input.start),
                        lte(dailyMeal.date, input.end)
                    )
                );
        }),

    upsert: protectedProcedure
        .input(
            z.object({
                date: z.string(),
                mealType: z.enum(["breakfast", "lunch", "dinner"]),
                subscriptionId: z.number().nullable().optional(),
            })
        )
        .handler(async ({ input, context }) => {
            const [meal] = await db
                .insert(dailyMeal)
                .values({
                    userId: context.session.user.id,
                    date: input.date,
                    mealType: input.mealType,
                    subscriptionId: input.subscriptionId,
                })
                .onConflictDoUpdate({
                    target: [dailyMeal.userId, dailyMeal.date, dailyMeal.mealType],
                    set: {
                        subscriptionId: input.subscriptionId,
                    },
                })
                .returning();
            return meal;
        }),

    delete: protectedProcedure
        .input(
            z.object({
                date: z.string(),
                mealType: z.enum(["breakfast", "lunch", "dinner"]),
            })
        )
        .handler(async ({ input, context }) => {
            await db
                .delete(dailyMeal)
                .where(
                    and(
                        eq(dailyMeal.userId, context.session.user.id),
                        eq(dailyMeal.date, input.date),
                        eq(dailyMeal.mealType, input.mealType)
                    )
                );
            return { success: true };
        }),
};
