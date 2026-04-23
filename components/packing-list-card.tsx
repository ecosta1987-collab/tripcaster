import { CheckCircle2 } from "lucide-react";

type PackingListCardProps = {
  items: string[];
};

export function PackingListCard({ items }: PackingListCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/45">Packing</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Suggested list</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Built from trip weather, event types, and standard business travel essentials.
      </p>

      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3"
          >
            <CheckCircle2 className="h-4 w-4 text-mint" />
            <span className="text-sm text-ink/80">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
