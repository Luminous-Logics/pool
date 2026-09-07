import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const polls = sqliteTable("polls", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // "draft" | "active" | "paused" | "ended"
  creatorKey: text("creator_key").notNull(),
  collectEmail: integer("collect_email", { mode: "boolean" }).notNull().default(false),
  revealImmediately: integer("reveal_immediately", { mode: "boolean" }).notNull().default(true),
  isAnswerRevealed: integer("is_answer_revealed", { mode: "boolean" }).notNull().default(false),
  showPublicResults: integer("show_public_results", { mode: "boolean" }).notNull().default(true),
  showVoterDetails: integer("show_voter_details", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  pollId: text("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const options = sqliteTable("options", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  mediaType: text("media_type").notNull().default("text"), // "text" | "image" | "video"
  mediaUrl: text("media_url"),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  pollId: text("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  optionId: text("option_id")
    .notNull()
    .references(() => options.id, { onDelete: "cascade" }),
  voterName: text("voter_name").notNull(),
  voterEmail: text("voter_email"),
  voterIdentifier: text("voter_identifier").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
