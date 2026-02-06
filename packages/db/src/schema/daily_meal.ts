import { pgTable, text, date, integer, serial, uniqueIndex, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { subscription } from "./subscription";
import { relations } from "drizzle-orm";

export const dailyMeal = pgTable(
    "daily_meal",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        date: date("date").notNull(),
        mealType: text("meal_type", { enum: ["breakfast", "lunch", "dinner"] }).notNull(),
        subscriptionId: integer("subscription_id")
            .references(() => subscription.id, { onDelete: "set null" }),
    },
    (table) => [
        uniqueIndex("daily_meal_userId_date_mealType_key").on(
            table.userId,
            table.date,
            table.mealType
        ),
        index("daily_meal_userId_idx").on(table.userId),
        index("daily_meal_date_idx").on(table.date),
    ]
);

export const dailyMealRelations = relations(dailyMeal, ({ one }) => ({
    user: one(user, {
        fields: [dailyMeal.userId],
        references: [user.id],
    }),
    subscription: one(subscription, {
        fields: [dailyMeal.subscriptionId],
        references: [subscription.id],
    }),
}));
