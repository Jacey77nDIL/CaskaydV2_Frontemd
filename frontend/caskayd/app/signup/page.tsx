// app/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const [copied, setCopied] = useState(false);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: name,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create account.");
      }

      // Successfully registered -> send to login page
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("jason@caskayd.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-[#1d0b34] via-[#4d1266] via-[#d14d1a] via-[#f79e22] to-[#ffda73] font-sans">
      {/* Layer 2: The Sun Orb & Horizon Lens Flare */}
      <div className="absolute bottom-[8%] right-[15%] w-[220px] h-[220px] rounded-full bg-radial from-white via-[#fffde6]/95 via-[#f79e22]/40 to-transparent blur-[4px] z-10"></div>
      <div className="absolute bottom-[18%] left-[-25%] w-[150%] h-[24px] bg-gradient-to-r from-transparent via-white/60 via-white/60 to-transparent blur-[8px] -rotate-[0.5deg] z-10"></div>

      {/* Layer 3: Ambient Sky Volumetrics */}
      <div className="absolute top-[10%] left-[-20%] w-[800px] h-[400px] rounded-full bg-radial from-[#4d1266]/40 via-[#d14d1a]/10 to-transparent blur-[80px] z-0"></div>

      {/* Layer 4: Mountain Ranges */}
      <div className="absolute bottom-0 left-0 w-full h-[35vh] min-h-[220px] pointer-events-none">
        <div 
          className="absolute bottom-0 w-full h-full bg-gradient-to-b from-[#b03e1b] to-[#4a1525] opacity-65 z-20"
          style={{ clipPath: "polygon(0% 80%, 8% 68%, 18% 78%, 28% 62%, 42% 75%, 55% 58%, 68% 72%, 78% 52%, 88% 68%, 100% 55%, 100% 100%, 0% 100%)" }}
        ></div>
        <div 
          className="absolute bottom-0 w-full h-[90%] bg-gradient-to-b from-[#591b19] to-[#260914] z-25"
          style={{ clipPath: "polygon(0% 85%, 12% 50%, 22% 70%, 35% 40%, 48% 75%, 62% 60%, 72% 78%, 85% 45%, 94% 65%, 100% 58%, 100% 100%, 0% 100%)" }}
        ></div>
        <div 
          className="absolute bottom-[-2px] w-full h-[65%] bg-[#1c0612] z-30"
          style={{ clipPath: "polygon(0% 90%, 15% 72%, 30% 85%, 50% 65%, 68% 82%, 82% 70%, 100% 88%, 100% 100%, 0% 100%)" }}
        ></div>
      </div>

      {/* Nav */}
      <nav className="absolute top-0 left-0 w-full backdrop-blur-md bg-black/10 border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.push("/")} 
            className="text-white font-extrabold text-xl tracking-tight cursor-pointer bg-transparent border-none focus:outline-none"
          >
            Caskayd
          </button>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-white/80 text-sm font-medium">
            <a href="https://calendly.com/jacey77n/intro-chat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Request a demo
            </a>
            <button onClick={() => router.push("/?view=pricing")} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm font-medium">
              Pricing
            </button>
            <button onClick={() => setIsContactModalOpen(true)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm font-medium">
              Contact
            </button>
          </div>

          {/* Hamburger (Mobile Only) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/80 hover:text-white p-2 focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
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
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#1d0b34]/95 backdrop-blur-xl border-b border-white/10 flex flex-col py-4 px-6 gap-4 shadow-2xl z-40 animate-in slide-in-from-top-2 duration-200">
            <a
              href="https://calendly.com/jacey77n/intro-chat"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white font-medium py-2 hover:text-[#ff6b35] transition-colors"
            >
              Request a demo
            </a>
            <button 
              onClick={() => {
                router.push("/?view=pricing");
                setIsMobileMenuOpen(false);
              }} 
              className="text-left text-white font-medium py-2 hover:text-[#ff6b35] transition-colors cursor-pointer focus:outline-none"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                setIsContactModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-white font-medium py-2 hover:text-[#ff6b35] transition-colors cursor-pointer focus:outline-none"
            >
              Contact
            </button>
          </div>
        )}
      </nav>

      {/* Form Overlay */}
      <div className="relative z-40 w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen pt-24 pb-8 px-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 md:p-8 w-full max-w-[420px] flex flex-col items-center relative">
          
          <div className="w-11 h-11 rounded-xl bg-white border border-gray-200/80 shadow-md flex items-center justify-center mb-4">
            <svg className="w-5.5 h-5.5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3-3h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight text-center">
            Create your Caskayd account
          </h1>

          {/* Error Alert */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agency (Optional)</label>
              <input
                type="text"
                placeholder="Enter agency name (optional)"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1c0512] text-white font-semibold py-3 rounded-xl hover:bg-[#2d0a1d] transition-all text-center mt-1 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-orange-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Login
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}