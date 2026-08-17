import { Plus } from "lucide-react";

type GreetingsCardProps = {
  onAddRecipe: () => void;
};

export default function GreetingsCard({ onAddRecipe }: GreetingsCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm">
      <div>
        <h2 className="text-3xl font-extrabold text-[#5A0D36]">
          Greetings, Neil!
        </h2>
        <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-amber-900/70 font-medium">
          Your bakery is heating up today. You have 12 active orders and a batch of
          sourdough ready to proof.
        </p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onAddRecipe}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:opacity-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          ADD NEW RECIPE
        </button>
      </div>
    </div>
  );
}
