"use client";

import { useState } from "react";
import TopNavbar from "../top_navbar/topNavbar";
import Navbar from "../navbar/navbar";

export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const toggleNavbar = () => {
    setIsNavbarOpen((previous) => !previous);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/*top navbar*/}
      <TopNavbar onMenuClick={toggleNavbar} />

      {/*sidebar*/}
      <Navbar
        isOpen={isNavbarOpen}
        onClose={closeNavbar}
      />

      {/*main content*/}
      <main className="min-h-screen pt-18">
        {children}
      </main>
    </div>
  );
}