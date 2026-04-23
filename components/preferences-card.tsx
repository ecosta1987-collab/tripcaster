import { UserPreference } from "@/lib/types";

type PreferencesCardProps = {
  preferences: UserPreference | null;
  onSave: (preferences: {
    homeTimezone: string;
    favoriteAirport: string;
    packingStyle: UserPreference["packingStyle"];
  }) => Promise<void>;
  isLoading: boolean;
};

export function PreferencesCard({
  preferences,
  onSave,
  isLoading
}: PreferencesCardProps) {
  async function handleSubmit(formData: FormData) {
    await onSave({
      homeTimezone: String(formData.get("homeTimezone") ?? "Europe/Rome"),
      favoriteAirport: String(formData.get("favoriteAirport") ?? ""),
      packingStyle: String(formData.get("packingStyle") ?? "standard") as UserPreference["packingStyle"]
    });
  }

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/45">Preferences</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Travel defaults</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        These preferences are saved to your account and used when generating packing lists and timezone views.
      </p>

      <form action={handleSubmit} className="mt-6 grid gap-4">
        <label className="text-sm font-medium text-ink">
          Home timezone
          <input
            name="homeTimezone"
            defaultValue={preferences?.homeTimezone ?? "Europe/Rome"}
            placeholder="Europe/Rome"
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
          />
        </label>

        <label className="text-sm font-medium text-ink">
          Favorite airport
          <input
            name="favoriteAirport"
            defaultValue={preferences?.favoriteAirport ?? ""}
            placeholder="FCO"
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
          />
        </label>

        <label className="text-sm font-medium text-ink">
          Packing style
          <select
            name="packingStyle"
            defaultValue={preferences?.packingStyle ?? "standard"}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
          >
            <option value="light">Light</option>
            <option value="standard">Standard</option>
            <option value="extended">Extended</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-fit items-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save preferences
        </button>
      </form>
    </section>
  );
}
