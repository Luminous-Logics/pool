import { NextRequest, NextResponse } from "next/server";
import { db, ensureTables } from "@/db";
import { polls, questions, options } from "@/db/schema";
import { nanoid } from "nanoid";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureTables();
    const recentPolls = await db
      .select({
        id: polls.id,
        title: polls.title,
        description: polls.description,
        status: polls.status,
        showPublicResults: polls.showPublicResults,
        createdAt: polls.createdAt,
      })
      .from(polls)
      .orderBy(desc(polls.createdAt))
      .limit(20);

    return NextResponse.json({ polls: recentPolls });
  } catch (error: unknown) {
    console.error("Failed to fetch polls:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const body = await req.json();
    const {
      title,
      description,
      status = "active",
      collectEmail = false,
      revealImmediately = true,
      showPublicResults = true,
      showVoterDetails = true,
      questions: questionList = [],
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Poll title is required" }, { status: 400 });
    }

    if (!Array.isArray(questionList) || questionList.length === 0) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      );
    }

    // Validate that each question has at least 2 options
    for (let i = 0; i < questionList.length; i++) {
      const q = questionList[i];
      if (!q.questionText || !q.questionText.trim()) {
        return NextResponse.json(
          { error: `Question #${i + 1} text is required` },
          { status: 400 }
        );
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json(
          { error: `Question #${i + 1} must have at least 2 options` },
          { status: 400 }
        );
      }
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text && !opt.mediaUrl) {
          return NextResponse.json(
            { error: `Option #${j + 1} in question #${i + 1} requires text or media` },
            { status: 400 }
          );
        }
      }
    }

    const pollId = nanoid(10);
    const creatorKey = `key_${nanoid(24)}`;
    const now = new Date();

    // Insert poll
    await db.insert(polls).values({
      id: pollId,
      title: title.trim(),
      description: (description || "").trim(),
      status: status || "active",
      creatorKey,
      collectEmail: Boolean(collectEmail),
      revealImmediately: Boolean(revealImmediately),
      isAnswerRevealed: false,
      showPublicResults: Boolean(showPublicResults),
      showVoterDetails: Boolean(showVoterDetails),
      createdAt: now,
    });

    // Insert questions and options
    for (let qIdx = 0; qIdx < questionList.length; qIdx++) {
      const qData = questionList[qIdx];
      const questionId = nanoid(12);

      await db.insert(questions).values({
        id: questionId,
        pollId,
        questionText: qData.questionText.trim(),
        orderIndex: qIdx,
      });

      for (let oIdx = 0; oIdx < qData.options.length; oIdx++) {
        const optData = qData.options[oIdx];
        const optionId = nanoid(12);

        await db.insert(options).values({
          id: optionId,
          questionId,
          text: (optData.text || "").trim(),
          mediaType: optData.mediaType || (optData.mediaUrl ? "image" : "text"),
          mediaUrl: optData.mediaUrl || null,
          isCorrect: Boolean(optData.isCorrect),
          orderIndex: oIdx,
        });
      }
    }

    return NextResponse.json({
      success: true,
      pollId,
      creatorKey,
      message: "Poll created successfully! Let the voting commence.",
    });
  } catch (error: unknown) {
    console.error("Create poll error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to create poll" },
      { status: 500 }
    );
  }
}
