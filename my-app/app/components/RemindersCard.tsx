import { Eye, Plus } from "lucide-react";

import type { Reminder } from "../types/recipe";

type RemindersCardProps = {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onOpenModal: () => void;
};

export default function RemindersCard({
  reminders,
  onToggleReminder,
  onOpenModal,
}: RemindersCardProps) {
  return (
    <div className="relative flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#5A0D36]">Reminders</h2>
          <button
            type="button"
            onClick={onOpenModal}
            className="rounded-full bg-pink-100/70 p-2 text-[#E94E77] hover:bg-pink-100 transition-colors"
            aria-label="View all reminders"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {reminders.slice(0, 3).map((reminder) => (
            <label
              key={reminder.id}
              className="flex cursor-pointer items-center gap-3 text-xs font-medium text-amber-900/80"
            >
              <input
                type="checkbox"
                checked={reminder.completed}
                onChange={() => onToggleReminder(reminder.id)}
                className="h-4 w-4 rounded border-gray-300 text-[#E94E77] focus:ring-pink-200"
              />
              <span className={reminder.completed ? "line-through opacity-50" : ""}>
                {reminder.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B185DB] via-[#D291BC] to-[#FFC3D0] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:opacity-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          ADD NEW TASK
        </button>
      </div>
    </div>
  );
}
