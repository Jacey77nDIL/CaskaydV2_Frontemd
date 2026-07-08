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
  const [copied, setCopied] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to login page for prototype demo
    router.push("/login");
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

      {/* Layer 3: Ambient Sky Volumetrics (Left Cloud) */}
      <div className="absolute top-[10%] left-[-20%] w-[800px] h-[400px] rounded-full bg-radial from-[#4d1266]/40 via-[#d14d1a]/10 to-transparent blur-[80px] z-0"></div>

      {/* Layer 4: Sharp Geometric Mountain Ranges */}
      <div className="absolute bottom-0 left-0 w-full h-[35vh] min-h-[220px] pointer-events-none">
        {/* Distant Background Peaks */}
        <div 
          className="absolute bottom-0 w-full h-full bg-gradient-to-b from-[#b03e1b] to-[#4a1525] opacity-65 z-20"
          style={{ clipPath: "polygon(0% 80%, 8% 68%, 18% 78%, 28% 62%, 42% 75%, 55% 58%, 68% 72%, 78% 52%, 88% 68%, 100% 55%, 100% 100%, 0% 100%)" }}
        ></div>

        {/* Mid-ground High Peaks */}
        <div 
          className="absolute bottom-0 w-full h-[90%] bg-gradient-to-b from-[#591b19] to-[#260914] z-25"
          style={{ clipPath: "polygon(0% 85%, 12% 50%, 22% 70%, 35% 40%, 48% 75%, 62% 60%, 72% 78%, 85% 45%, 94% 65%, 100% 58%, 100% 100%, 0% 100%)" }}
        ></div>

        {/* Closest Foreground Slopes */}
        <div 
          className="absolute bottom-[-2px] w-full h-[65%] bg-[#1c0612] z-30"
          style={{ clipPath: "polygon(0% 90%, 15% 72%, 30% 85%, 50% 65%, 68% 82%, 82% 70%, 100% 88%, 100% 100%, 0% 100%)" }}
        ></div>
      </div>

      {/* Sticky Navigation Bar (No Get Started button) */}
      <nav className="absolute top-0 left-0 w-full backdrop-blur-md bg-black/10 border-b border-white/10 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button 
              onClick={() => router.push("/")} 
              className="text-white font-extrabold text-xl tracking-tight cursor-pointer bg-transparent border-none focus:outline-none"
            >
              Caskayd
            </button>
          </div>

          <div className="flex flex-none items-center gap-8 text-white/80 text-sm font-medium">
            <a
              href="https://calendly.com/jacey77n/intro-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Request a demo
            </a>
            <button 
              onClick={() => router.push("/?view=pricing")} 
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm font-medium focus:outline-none"
            >
              Pricing
            </button>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm font-medium focus:outline-none"
            >
              Contact
            </button>
          </div>

          <div className="flex-1 flex justify-end"></div>
        </div>
      </nav>

      {/* Layer 5: Interactive Interface Content Overlay */}
      <div className="relative z-40 w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen pt-24 pb-8 px-4">
        {/* Centered Glassmorphic Form Card (Scaled down to prevent vertical scroll) */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 md:p-8 w-full max-w-[420px] flex flex-col items-center relative">
          
          {/* Header Icon (box with user symbol) */}
          <div className="w-11 h-11 rounded-xl bg-white border border-gray-200/80 shadow-md flex items-center justify-center mb-4">
            <svg
              className="w-5.5 h-5.5 text-gray-800"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 9v3m0 0v3m0-3h3m-3-3h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight text-center">
            Create your Caskayd account
          </h1>

          {/* Form */}
          <form onSubmit={handleSignUp} className="w-full flex flex-col gap-3">
            {/* Name Field */}
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Agency Field (Optional) */}
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Agency (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter agency name (optional)"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full bg-[#1c0512] text-white font-semibold py-3 rounded-xl hover:bg-[#2d0a1d] transition-all text-center mt-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              Sign up
            </button>
          </form>

          {/* Footer Navigation Redirect */}
          <p className="text-sm text-gray-600 mt-4 text-center">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-orange-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer focus:outline-none"
            >
              Login
            </button>
          </p>

        </div>
      </div>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setIsContactModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-md bg-[#1d0b34]/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl text-left text-white overflow-hidden transform scale-100 transition-transform duration-300">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#ff6b35]/20 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#7b2cbf]/20 blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-serif font-medium tracking-tight text-white">Contact Us</h3>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-white/70 mb-6 font-light leading-relaxed text-sm">
                Have questions or want to learn more about Caskayd? Reach out to us directly.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 mb-6 hover:bg-white/10 transition-colors">
                <div className="overflow-hidden">
                  <span className="text-xs text-white/50 block mb-1">Email address</span>
                  <a
                    href="mailto:jason@caskayd.com"
                    className="text-lg font-semibold text-[#ff6b35] hover:underline break-all"
                  >
                    jason@caskayd.com
                  </a>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white px-4 py-2 rounded-xl transition-colors flex-shrink-0 text-sm font-semibold flex items-center gap-1.5 cursor-pointer min-w-[85px] justify-center"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setIsContactModalOpen(false)}
                className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-colors cursor-pointer text-center text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
