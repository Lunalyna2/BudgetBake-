import { Trash2, X } from "lucide-react";

import type { Reminder } from "../../types/recipe";

type RemindersModalProps = {
  isOpen: boolean;
  reminders: Reminder[];
  newReminderText: string;
  onClose: () => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onNewReminderTextChange: (value: string) => void;
  onAddReminder: () => void;
};

export default function RemindersModal({
  isOpen,
  reminders,
  newReminderText,
  onClose,
  onToggleReminder,
  onDeleteReminder,
  onNewReminderTextChange,
  onAddReminder,
}: RemindersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-pink-100 bg-white p-6 shadow-2xl">
        {/*header */}
        <div className="flex items-center justify-between border-b border-pink-100 pb-4">
          <h3 className="text-xl font-extrabold text-[#5A0D36]">
            All Reminders
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-full
              bg-linear-to-r
              from-[#B185DB]/20
              via-[#D291BC]/20
              to-[#FFC3D0]/30
              p-2
              text-[#B185DB]
              transition
              hover:opacity-80
            "
            aria-label="Close reminders"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/*reminder list*/}
        <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-pink-100
                bg-linear-to-r
                from-[#FFF8FC]
                to-[#FFF1F7]
                p-3
                transition
                hover:border-[#D291BC]/40
              "
            >
              <label className="flex cursor-pointer items-center gap-3 text-xs font-medium text-amber-900/80">
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

              <button
                type="button"
                onClick={() => onDeleteReminder(reminder.id)}
                className="
                  rounded-full
                  p-2
                  text-[#D291BC]
                  transition
                  hover:bg-[#FFC3D0]/30
                  hover:text-[#B185DB]
                "
                aria-label="Delete reminder"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/*add reminder */}
        <div className="mt-4 flex gap-2 border-t border-pink-100 pt-4">
          <input
            type="text"
            value={newReminderText}
            onChange={(event) =>
              onNewReminderTextChange(event.target.value)
            }
            placeholder="New reminder..."
            className="
              w-full
              rounded-xl
              border
              border-pink-100
              bg-[#FFF8FC]
              px-4
              py-2
              text-xs
              text-[#5A0D36]
              placeholder:text-pink-300
              focus:border-[#D291BC]
              focus:outline-none
              focus:ring-2
              focus:ring-[#FFC3D0]/40
            "
          />

          <button
            type="button"
            onClick={onAddReminder}
            className="
              shrink-0
              rounded-full
              bg-linear-to-r
              from-[#B185DB]
              via-[#D291BC]
              to-[#FFC3D0]
              px-5
              py-2
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-md
              transition
              hover:opacity-95
            "
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}