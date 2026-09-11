"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import TopNavbar from "../top_navbar/topNavbar";
import Navbar from "../navbar/navbar";

export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const pathname = usePathname();

  // Hide navbar on login and sign-in pages
  const isAuthPage =
    pathname === "/login" || pathname === "/sign-in";

  const toggleNavbar = () => {
    setIsNavbarOpen((previous) => !previous);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Only show navigation on non-auth pages */}
      {!isAuthPage && (
        <>
          {/* Top Navbar */}
          <TopNavbar onMenuClick={toggleNavbar} />

          {/* Sidebar */}
          <Navbar
            isOpen={isNavbarOpen}
            onClose={closeNavbar}
          />
        </>
      )}

      {/* Main Content */}
      <main className={isAuthPage ? "min-h-screen" : "min-h-screen pt-18"}>
        {children}
      </main>
    </div>
  );
}

