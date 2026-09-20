// app/(dashboard)/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // --- API Function: Logout ---
  const handleLogout = async () => {
    try { 
      // fetchWithAuth automatically handles the token!
      await fetchWithAuth("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("caskayd_token");
      localStorage.removeItem("caskayd_refresh_token");
      router.push("/login");
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Search", href: "/search" },
    { name: "Campaigns", href: "/campaigns" },
    { name: "Favorites", href: "/favorites" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* ===== Authenticated Navigation Bar ===== */}
      <nav className="sticky top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex-1 flex justify-start">
            <Link 
              href="/dashboard" 
              className="text-gray-900 font-extrabold text-xl tracking-tight"
            >
              Caskayd
            </Link>
          </div>
          
          {/* Main Navigation Links (Desktop) */}
          <div className="hidden md:flex flex-none items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-colors ${
                  isActive(link.href) 
                    ? "text-[#ff6b35] font-bold" 
                    : "text-gray-600 hover:text-[#ff6b35]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action / Profile Area (Desktop) */}
          <div className="hidden md:flex flex-1 justify-end">
            <button 
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold px-5 py-2 rounded-full transition-colors text-sm cursor-pointer"
            >
              Log out
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-black focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-6 pt-2 pb-6 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 text-base font-medium transition-colors ${
                  isActive(link.href) 
                    ? "text-[#ff6b35] font-bold" 
                    : "text-gray-700 hover:text-[#ff6b35]"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-base font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ===== Page Content ===== */}
      <main className="flex-1 w-full mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}