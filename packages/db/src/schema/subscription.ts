import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    boolean,
    serial,
    integer,
    index,
    primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// サブスクリプションジャンルテーブル
export const subscriptionGenre = pgTable(
    "subscription_genre",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull(),
        color: text("color").default("amber").notNull(), // amber, blue, emerald, purple, pink, cyan
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        isCalendarTarget: boolean("is_calendar_target").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("subscription_genre_userId_idx").on(table.userId)],
);

// サブスクリプションテーブル（genreIdを削除）
export const subscription = pgTable(
    "subscription",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull(),
        price: integer("price").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        description: text("description"),
        isActive: boolean("is_active").default(true).notNull(),
        monthlyCount: integer("monthly_count"),
        dailyCount: integer("daily_count"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("subscription_userId_idx").on(table.userId)],
);

// 中間テーブル（多対多）
export const subscriptionToGenre = pgTable(
    "subscription_to_genre",
    {
        subscriptionId: integer("subscription_id")
            .notNull()
            .references(() => subscription.id, { onDelete: "cascade" }),
        genreId: integer("genre_id")
            .notNull()
            .references(() => subscriptionGenre.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.subscriptionId, table.genreId] }),
        index("subscription_to_genre_subscriptionId_idx").on(table.subscriptionId),
        index("subscription_to_genre_genreId_idx").on(table.genreId),
    ],
);

// リレーション定義
export const subscriptionGenreRelations = relations(
    subscriptionGenre,
    ({ one, many }) => ({
        user: one(user, {
            fields: [subscriptionGenre.userId],
            references: [user.id],
        }),
        subscriptionToGenres: many(subscriptionToGenre),
    }),
);

export const subscriptionRelations = relations(subscription, ({ one, many }) => ({
    user: one(user, {
        fields: [subscription.userId],
        references: [user.id],
    }),
    subscriptionToGenres: many(subscriptionToGenre),
}));

export const subscriptionToGenreRelations = relations(
    subscriptionToGenre,
    ({ one }) => ({
        subscription: one(subscription, {
            fields: [subscriptionToGenre.subscriptionId],
            references: [subscription.id],
        }),
        genre: one(subscriptionGenre, {
            fields: [subscriptionToGenre.genreId],
            references: [subscriptionGenre.id],
        }),
    }),
);
