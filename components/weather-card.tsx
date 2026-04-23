import { CloudRain, SunMedium, Wind } from "lucide-react";
import { WeatherSummary } from "@/lib/types";

type WeatherCardProps = {
  weather: WeatherSummary;
};

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/45">Weather</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Destination forecast</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">{weather.summary}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
          <SunMedium className="h-5 w-5 text-coral" />
          <p className="mt-3 text-sm text-ink/60">Temperature</p>
          <p className="text-xl font-semibold text-ink">
            {weather.lowTempC}C to {weather.highTempC}C
          </p>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
          <CloudRain className="h-5 w-5 text-sky" />
          <p className="mt-3 text-sm text-ink/60">Rain chance</p>
          <p className="text-xl font-semibold text-ink">{weather.rainChance}%</p>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
          <Wind className="h-5 w-5 text-mint" />
          <p className="mt-3 text-sm text-ink/60">Notes</p>
          <p className="text-base font-semibold text-ink">{weather.note}</p>
        </div>
      </div>
    </section>
  );
}
