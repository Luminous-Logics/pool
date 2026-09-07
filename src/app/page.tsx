import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Film, QrCode, PlayCircle, Eye, Flame, CheckCircle } from "lucide-react";
import { db, ensureTables } from "@/db";
import { polls, votes } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getRecentPolls() {
  try {
    await ensureTables();
    const pollList = await db
      .select({
        id: polls.id,
        title: polls.title,
        description: polls.description,
        status: polls.status,
        createdAt: polls.createdAt,
      })
      .from(polls)
      .orderBy(desc(polls.createdAt))
      .limit(6);

    // Fetch counts
    const pollsWithCounts = await Promise.all(
      pollList.map(async (p) => {
        const countRes = await db
          .select({
            count: sql<number>`count(distinct ${votes.voterIdentifier})`.as("count"),
          })
          .from(votes)
          .where(sql`${votes.pollId} = ${p.id}`);

        return {
          ...p,
          participants: Number(countRes[0]?.count) || 0,
        };
      })
    );

    return pollsWithCounts;
  } catch (e) {
    console.error("Failed to load polls for home:", e);
    return [];
  }
}

export default async function HomePage() {
  const recentPolls = await getRecentPolls();

  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-3xl mx-auto">
        {/* Floating pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-xl shadow-glass animate-float">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Gen Liquid Glass Polling Experience</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Where Opinions Meet{" "}
          <span className="shimmer-text">Liquid Elegance</span>
        </h1>

        <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          Create breathtaking interactive polls with images, videos up to 10MB,
          real-time controls, instant QR codes, and suspenseful animated answer reveals.
          No bot spam, strictly 1 vote per person.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-500/30 border border-white/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Create Free Poll</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#recent-polls"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-white font-semibold text-base backdrop-blur-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Explore Active Polls</span>
          </a>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-2xl shadow-glass hover:border-cyan-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-4 group-hover:scale-110 transition-transform">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Rich Media Options</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Upload high-res images or crisp videos up to 10MB as poll choices with automatic responsive previews.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-2xl shadow-glass hover:border-purple-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Dramatic Animated Reveals</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Suspense drumroll, radiant glass glow, confetti explosion, and victory fanfare to unveil the correct answer!
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-2xl shadow-glass hover:border-emerald-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Strict 1-Vote Enforcement</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Voter verification ensures honest results. Host controls: Start, Pause, or End voting on the fly.
          </p>
        </div>
      </section>

      {/* Recent Polls Showcase */}
      <section id="recent-polls" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-black text-white">Live & Recent Polls</h2>
          </div>
          <Link
            href="/create"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>+ Create Yours</span>
          </Link>
        </div>

        {recentPolls.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No Polls Created Yet</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto mt-2 mb-6">
              Be the trailblazer! Launch the first poll, add funny media options, and share the QR code with friends or colleagues.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
            >
              <span>Create the First Poll</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPolls.map((poll) => {
              const statusColors: Record<string, string> = {
                active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                paused: "bg-amber-500/20 text-amber-300 border-amber-500/40",
                ended: "bg-rose-500/20 text-rose-300 border-rose-500/40",
                draft: "bg-slate-500/20 text-slate-300 border-slate-500/40",
              };

              return (
                <Link
                  key={poll.id}
                  href={`/poll/${poll.id}`}
                  className="group block p-6 rounded-3xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/15 hover:border-cyan-500/40 backdrop-blur-2xl shadow-glass transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        statusColors[poll.status] || statusColors.active
                      }`}
                    >
                      {poll.status}
                    </span>
                    <span className="text-xs text-white/50">
                      {poll.participants} {poll.participants === 1 ? "voter" : "voters"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1 mb-1">
                    {poll.title}
                  </h3>

                  {poll.description && (
                    <p className="text-xs text-white/60 line-clamp-2 mb-4">
                      {poll.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Vote Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
