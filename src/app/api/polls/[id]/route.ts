import { NextRequest, NextResponse } from "next/server";
import { db, ensureTables } from "@/db";
import { polls, questions, options, votes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTables();
    const pollId = params.id;
    const creatorKeyHeader = req.headers.get("x-creator-key");

    const pollRows = await db
      .select()
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);

    if (pollRows.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const poll = pollRows[0];
    const isCreator = Boolean(creatorKeyHeader && creatorKeyHeader === poll.creatorKey);

    // Fetch questions
    const questionRows = await db
      .select()
      .from(questions)
      .where(eq(questions.pollId, pollId))
      .orderBy(questions.orderIndex);

    // Fetch options for all questions
    const questionIds = questionRows.map((q) => q.id);
    const optionsByQuestion: Record<string, typeof options.$inferSelect[]> = {};

    for (const q of questionRows) {
      const optRows = await db
        .select()
        .from(options)
        .where(eq(options.questionId, q.id))
        .orderBy(options.orderIndex);

      optionsByQuestion[q.id] = optRows;
    }

    // Aggregate votes per option
    const voteAggregates = await db
      .select({
        optionId: votes.optionId,
        questionId: votes.questionId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(votes)
      .where(eq(votes.pollId, pollId))
      .groupBy(votes.optionId, votes.questionId);

    const voteCountMap: Record<string, number> = {};
    const questionTotalMap: Record<string, number> = {};

    for (const va of voteAggregates) {
      voteCountMap[va.optionId] = Number(va.count) || 0;
      questionTotalMap[va.questionId] =
        (questionTotalMap[va.questionId] || 0) + (Number(va.count) || 0);
    }

    // Fetch voter details if allowed (either public setting is on or user is creator)
    let voterLedger: Array<{
      id: string;
      voterName: string;
      voterEmail?: string | null;
      optionId: string;
      questionId: string;
      createdAt: Date;
    }> = [];

    if (poll.showVoterDetails || isCreator) {
      const voteRecords = await db
        .select({
          id: votes.id,
          voterName: votes.voterName,
          voterEmail: votes.voterEmail,
          optionId: votes.optionId,
          questionId: votes.questionId,
          createdAt: votes.createdAt,
        })
        .from(votes)
        .where(eq(votes.pollId, pollId))
        .orderBy(votes.createdAt);

      voterLedger = voteRecords.map((v) => ({
        ...v,
        voterEmail: isCreator ? v.voterEmail : null,
      }));
    }

    // Format questions with options and stats
    const enrichedQuestions = questionRows.map((q) => {
      const opts = optionsByQuestion[q.id] || [];
      const totalVotesForQuestion = questionTotalMap[q.id] || 0;

      const enrichedOptions = opts.map((opt) => {
        const count = voteCountMap[opt.id] || 0;
        const percentage =
          totalVotesForQuestion > 0
            ? Math.round((count / totalVotesForQuestion) * 100)
            : 0;

        // Mask correct answer from regular voters until revealed
        const shouldShowCorrect =
          isCreator || poll.isAnswerRevealed;

        return {
          id: opt.id,
          text: opt.text,
          mediaType: opt.mediaType,
          mediaUrl: opt.mediaUrl,
          orderIndex: opt.orderIndex,
          isCorrect: shouldShowCorrect ? opt.isCorrect : undefined,
          voteCount: poll.showPublicResults || isCreator ? count : undefined,
          percentage: poll.showPublicResults || isCreator ? percentage : undefined,
        };
      });

      return {
        id: q.id,
        questionText: q.questionText,
        orderIndex: q.orderIndex,
        totalVotes: totalVotesForQuestion,
        options: enrichedOptions,
      };
    });

    const totalParticipants = await db
      .select({
        count: sql<number>`count(distinct ${votes.voterIdentifier})`.as("count"),
      })
      .from(votes)
      .where(eq(votes.pollId, pollId));

    return NextResponse.json({
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        collectEmail: poll.collectEmail,
        revealImmediately: poll.revealImmediately,
        isAnswerRevealed: poll.isAnswerRevealed,
        showPublicResults: poll.showPublicResults,
        showVoterDetails: poll.showVoterDetails,
        createdAt: poll.createdAt,
        isCreator,
      },
      questions: enrichedQuestions,
      totalParticipants: Number(totalParticipants[0]?.count) || 0,
      voters: voterLedger,
    });
  } catch (error: unknown) {
    console.error("Get poll error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to load poll" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTables();
    const pollId = params.id;
    const body = await req.json();
    const creatorKey =
      req.headers.get("x-creator-key") || body.creatorKey;

    if (!creatorKey) {
      return NextResponse.json({ error: "Unauthorized: Missing creator key" }, { status: 401 });
    }

    const pollRows = await db
      .select()
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);

    if (pollRows.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const poll = pollRows[0];
    if (poll.creatorKey !== creatorKey) {
      return NextResponse.json({ error: "Forbidden: Invalid creator key" }, { status: 403 });
    }

    const updateData: Partial<typeof polls.$inferInsert> = {};

    if (body.status && ["draft", "active", "paused", "ended"].includes(body.status)) {
      updateData.status = body.status;
    }

    if (typeof body.isAnswerRevealed === "boolean") {
      updateData.isAnswerRevealed = body.isAnswerRevealed;
    }

    if (typeof body.collectEmail === "boolean") {
      updateData.collectEmail = body.collectEmail;
    }

    if (typeof body.revealImmediately === "boolean") {
      updateData.revealImmediately = body.revealImmediately;
    }

    if (typeof body.showPublicResults === "boolean") {
      updateData.showPublicResults = body.showPublicResults;
    }

    if (typeof body.showVoterDetails === "boolean") {
      updateData.showVoterDetails = body.showVoterDetails;
    }

    if (body.title) {
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(polls).set(updateData).where(eq(polls.id, pollId));
    }

    return NextResponse.json({
      success: true,
      message: "Poll settings updated successfully",
      updatedFields: updateData,
    });
  } catch (error: unknown) {
    console.error("Patch poll error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to update poll" },
      { status: 500 }
    );
  }
}
