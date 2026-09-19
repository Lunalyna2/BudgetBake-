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

    </header>
  );
}