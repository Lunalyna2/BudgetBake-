"use client";

import { useState, useEffect, useRef } from "react";
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

  const navbarRef = useRef<HTMLDivElement>(null);

  // hide navbar on login, sign-in, and sign-up pages
  const authPages = ["/login", "/signup"];

  const isAuthPage = authPages.includes(pathname);

  const toggleNavbar = () => {
    setIsNavbarOpen((previous) => !previous);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  //hide navbar when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isNavbarOpen &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        closeNavbar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavbarOpen]);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/*only show navigation on non-auth pages */}
      {!isAuthPage && (
        <>
          {/*top navbar */}
          <TopNavbar onMenuClick={toggleNavbar} />

          {/*sidebar */}
          <div ref={navbarRef}>
            <Navbar
              isOpen={isNavbarOpen}
              onClose={closeNavbar}
            />
          </div>
        </>
      )}

      {/*main content*/}
      <main
        className={
          isAuthPage ? "min-h-screen" : "min-h-screen pt-18"
        }
      >
        {children}
      </main>
    </div>
  );
}