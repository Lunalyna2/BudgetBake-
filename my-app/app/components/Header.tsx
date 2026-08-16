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

      <div className="ml-6 flex items-center gap-3">
        <span className="text-2xl font-black tracking-tight text-[#E94E77]">
          BudgetBake
        </span>
        <div className="h-6 w-[1.5px] bg-[#E94E77]/40" />
        <span className="text-[10px] font-medium leading-tight text-[#E94E77] uppercase tracking-wider">
          freshly
          <br />
          baked
          <br />
          pastries
        </span>
      </div>
    </header>
  );
}
