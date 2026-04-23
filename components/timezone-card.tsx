import { Clock3 } from "lucide-react";
import { getTimezoneComparisons } from "@/lib/utils";

type TimezoneCardProps = {
  homeTimezone: string;
  destinationTimezone: string;
};

export function TimezoneCard({
  homeTimezone,
  destinationTimezone
}: TimezoneCardProps) {
  const comparisons = getTimezoneComparisons(homeTimezone, destinationTimezone);

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-sky/15 p-3 text-sky">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/45">Timezone</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Conversion quick view</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Useful anchors for scheduling calls between your home office and the destination.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {comparisons.map((comparison) => (
          <div
            key={comparison.label}
            className="rounded-3xl border border-ink/10 bg-[#fffdf8] px-5 py-4"
          >
            <p className="text-sm font-semibold text-ink">{comparison.label}</p>
            <p className="mt-1 text-sm text-ink/65">
              {comparison.home} in {homeTimezone}
            </p>
            <p className="text-sm text-ink/65">
              {comparison.destination} in {destinationTimezone}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
