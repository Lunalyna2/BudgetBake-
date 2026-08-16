"use client";

interface TopNavbarProps {
  onMenuClick: () => void;
}

export default function TopNavbar({
  onMenuClick,
}: TopNavbarProps) {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-18 w-full items-center bg-[#F7A9CF] px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
        className="mr-2 flex cursor-pointer flex-col gap-1.25"
      >
        <span className="block h-0.5 w-5 bg-[#E64B7A]" />
        <span className="block h-0.5 w-5 bg-[#E64B7A]" />
        <span className="block h-0.5 w-5 bg-[#E64B7A]" />
      </button>

      <h1 className="text-[25px] font-extrabold text-[#D83E72]">
        BudgetBake
      </h1>

      <div className="mx-2 h-9.75 w-px bg-white" />

      <p className="text-[10px] text-white">
        freshly
        <br />
        baked
        <br />
        pastries
      </p>
    </header>
  );
}