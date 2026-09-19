"use client";

import Link from "next/link";
import React from "react";
import { BookOpen, ClipboardList, Calculator } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  {
    name: "RECIPE LIBRARY",
    href: "/recipe-library",
    icon: BookOpen,
  },
  {
    name: "ORDER LIST",
    href: "/order-list",
    icon: ClipboardList,
  },
  {
    name: "COST CALCULATOR",
    href: "/cost_calculator",
    icon: Calculator,
  },
];

const Navbar: React.FC<NavbarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-60 flex h-screen w-65 flex-col bg-white shadow-xl transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/*header*/}
      <div className="bg-[#F7A9CF] px-6 pb-6 pt-5">
        <div className="flex items-center justify-between">
          {/*close*/}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white text-lg font-bold text-white transition hover:bg-white hover:text-[#D83E72]">
            ←
          </button>
        </div>
      </div>

      {/*navigation*/}
      <nav className="flex flex-1 flex-col px-7 pt-5">
        <div className="space-y-7">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-4 text-[12px] font-bold text-[#7A4428] transition hover:text-[#D83E72]"
              >
                <span className="flex w-5 justify-center">
                  <Icon size={23} strokeWidth={2} />
                </span>

                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/*logout*/}
        <div className="mt-auto pb-6">
          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-4 text-[12px] font-bold text-[#7A4428] transition hover:text-red-400"
          >
            <span className="text-[24px]">↪</span>

            <span>LOG OUT</span>
          </button>
        </div>
      </nav>

      {/*footer*/}
      <div className="px-6 pb-6 text-left">
        <p className="text-[8px] leading-6px text-black">
          © 2026 BudgetBake by Hi Five Productions.
          <br />
          All rights reserved.
        </p>
      </div>
    </aside>
  );
};

export default Navbar;