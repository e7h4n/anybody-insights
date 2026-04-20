import { OPINIONS, DATA_POINTS } from "@/lib/data";

export default function Home() {
  const empty = OPINIONS.length === 0 && DATA_POINTS.length === 0;

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">anybody-insights scaffold</h1>

      {empty ? (
        <div className="text-[color:var(--fg-muted)] leading-relaxed space-y-4">
          <p>
            This is an empty template. Follow the prompt in{" "}
            <code className="bg-white/10 px-1.5 py-0.5 rounded">README.md</code>{" "}
            to extract opinions &amp; data points for your subject, then write them
            into <code className="bg-white/10 px-1.5 py-0.5 rounded">lib/data.ts</code>.
          </p>
          <p>
            Once <code className="bg-white/10 px-1.5 py-0.5 rounded">OPINIONS</code>{" "}
            and <code className="bg-white/10 px-1.5 py-0.5 rounded">DATA_POINTS</code>{" "}
            are populated, rebuild the UI (v0.dev or hand-write) — this page is a
            placeholder so you can verify the build pipeline works before extraction.
          </p>
        </div>
      ) : (
        <div className="text-[color:var(--fg-muted)]">
          Loaded <span className="text-[color:var(--fg)] font-medium">{OPINIONS.length}</span> opinions
          and <span className="text-[color:var(--fg)] font-medium">{DATA_POINTS.length}</span> data
          points. Replace this placeholder with your real UI (see README).
        </div>
      )}
    </main>
  );
}
