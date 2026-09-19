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
    <div className="relative flex flex-col justify-between rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-[#5A0D36]">
            Reminders
          </h2>

          <button
            type="button"
            onClick={onOpenModal}
            className="
              rounded-full
              bg-gradient-to-r
              from-[#B185DB]/20
              via-[#D291BC]/20
              to-[#FFC3D0]/30
              p-2.5
              text-[#B185DB]
              transition
              hover:opacity-80
            "
            aria-label="View all reminders"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {reminders.slice(0, 3).map((reminder) => (
            <label
              key={reminder.id}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                rounded-xl
                border
                border-pink-100
                bg-gradient-to-r
                from-[#FFF8FC]
                to-[#FFF1F7]
                px-4
                py-3
                text-sm
                font-medium
                text-amber-900/80
                transition
                hover:border-[#D291BC]/40
              "
            >
              <input
                type="checkbox"
                checked={reminder.completed}
                onChange={() => onToggleReminder(reminder.id)}
                className="
                  h-4
                  w-4
                  cursor-pointer
                  rounded
                  border-pink-200
                  accent-[#D291BC]
                  focus:ring-2
                  focus:ring-[#FFC3D0]
                "
              />

              <span
                className={
                  reminder.completed
                    ? "line-through opacity-50"
                    : ""
                }
              >
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
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-gradient-to-r
            from-[#B185DB]
            via-[#D291BC]
            to-[#FFC3D0]
            px-7
            py-3.5
            text-base
            font-bold
            uppercase
            tracking-wide
            text-white
            shadow-md
            transition
            hover:opacity-95
          "
        >
          <Plus className="h-5 w-5 stroke-[3]" />
          ADD NEW TASK
        </button>
      </div>
    </div>
  );
}