import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 w-full items-center bg-[#FFC3D0] px-6">
      <button
        type="button"
        className="text-[#E94E77] hover:opacity-80 transition-opacity"
        aria-label="Open menu"
      >
        <Menu className="h-7 w-7" />
      </button>

    </header>
  );
}
