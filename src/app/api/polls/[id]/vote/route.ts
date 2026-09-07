import { NextRequest, NextResponse } from "next/server";
import { db, ensureTables } from "@/db";
import { polls, questions, options, votes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateVoterHash } from "@/lib/utils";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTables();
    const pollId = params.id;
    const body = await req.json();

    const {
      voterName,
      voterEmail,
      clientToken,
      votes: voterChoices, // Array of { questionId, optionId }
    } = body;

    if (!voterName || typeof voterName !== "string" || !voterName.trim()) {
      return NextResponse.json({ error: "Please provide your name to vote" }, { status: 400 });
    }

    if (!Array.isArray(voterChoices) || voterChoices.length === 0) {
      return NextResponse.json({ error: "Please select an answer" }, { status: 400 });
    }

    // 1. Fetch Poll
    const pollRows = await db
      .select()
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1);

    if (pollRows.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const poll = pollRows[0];

    // Check status
    if (poll.status === "paused") {
      return NextResponse.json(
        { error: "⏸️ Hold your horses! The poll host has temporarily paused voting. Please check back shortly." },
        { status: 403 }
      );
    }

    if (poll.status === "ended") {
      return NextResponse.json(
        { error: "🏁 The curtain has fallen! This poll has ended and is no longer accepting new votes." },
        { status: 403 }
      );
    }

    if (poll.status !== "active") {
      return NextResponse.json(
        { error: "This poll is not currently active." },
        { status: 403 }
      );
    }

    // Check email requirement
    if (poll.collectEmail && (!voterEmail || !voterEmail.includes("@"))) {
      return NextResponse.json(
        { error: "A valid email address is required by the host for this poll." },
        { status: 400 }
      );
    }

    // 2. Single-vote enforcement!
    const voterIdentifier = generateVoterHash(voterName, voterEmail, clientToken);

    const existingVotes = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.pollId, pollId),
          eq(votes.voterIdentifier, voterIdentifier)
        )
      )
      .limit(1);

    if (existingVotes.length > 0) {
      return NextResponse.json(
        {
          error: "Nice try! 😉 You have already cast your vote in this poll. Strictly 1 vote per person!",
          alreadyVoted: true,
        },
        { status: 409 }
      );
    }

    // Also verify by name if no email is collected
    const existingNameVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.pollId, pollId),
          eq(votes.voterName, voterName.trim().toLowerCase())
        )
      )
      .limit(1);

    if (existingNameVote.length > 0) {
      return NextResponse.json(
        {
          error: `Someone with the name "${voterName.trim()}" has already cast a vote. If this is you, your vote is already recorded!`,
          alreadyVoted: true,
        },
        { status: 409 }
      );
    }

    // 3. Record the votes
    const recordedChoices: Array<{
      questionId: string;
      optionId: string;
      isCorrect?: boolean;
    }> = [];

    const now = new Date();

    for (const choice of voterChoices) {
      // Verify option belongs to this question
      const optRows = await db
        .select()
        .from(options)
        .where(
          and(
            eq(options.id, choice.optionId),
            eq(options.questionId, choice.questionId)
          )
        )
        .limit(1);

      if (optRows.length === 0) {
        continue;
      }

      const opt = optRows[0];

      await db.insert(votes).values({
        id: nanoid(12),
        pollId,
        questionId: choice.questionId,
        optionId: choice.optionId,
        voterName: voterName.trim(),
        voterEmail: voterEmail ? voterEmail.trim().toLowerCase() : null,
        voterIdentifier,
        createdAt: now,
      });

      recordedChoices.push({
        questionId: choice.questionId,
        optionId: choice.optionId,
        isCorrect: poll.revealImmediately || poll.isAnswerRevealed ? opt.isCorrect : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: "🎉 Booyah! Your vote has been officially cast and sealed into history!",
      choices: recordedChoices,
      revealImmediately: poll.revealImmediately,
    });
  } catch (error: unknown) {
    console.error("Submit vote error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to submit vote" },
      { status: 500 }
    );
  }
}
