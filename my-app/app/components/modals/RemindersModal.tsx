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
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-[#5A0D36]">All Reminders</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <label className="flex cursor-pointer items-center gap-3 text-xs font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => onToggleReminder(reminder.id)}
                  className="h-4 w-4 rounded border-gray-300 text-[#E94E77]"
                />
                <span className={reminder.completed ? "line-through opacity-50" : ""}>
                  {reminder.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onDeleteReminder(reminder.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 border-t pt-4">
          <input
            type="text"
            value={newReminderText}
            onChange={(event) => onNewReminderTextChange(event.target.value)}
            placeholder="New reminder..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-pink-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onAddReminder}
            className="shrink-0 rounded-xl bg-[#5A0D36] px-4 py-2 text-xs font-bold text-white hover:bg-[#430928]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
