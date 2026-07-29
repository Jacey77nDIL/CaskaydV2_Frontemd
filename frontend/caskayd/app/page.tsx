"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();
  const placeholders = [
    "food creators in lagos",
    "gadget review influencers in Ondo",
    "male creator for a skincare campaign.",
    "female fashion creators under 100k followers",
    "TikTok creators for a fintech launch",
    "parenting creators in Abuja",
    "creators similar to Aproko Doctor"
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [fade, setFade] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"landing" | "pricing">("landing");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("jason@caskayd.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePricingSelection = (tier: "individual" | "team") => {
    const payload = {
      tier,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    localStorage.setItem("caskayd_package_intent", JSON.stringify(payload));
    router.push("/signup");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "pricing") {
        setView("pricing");
      }
    }

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
        setFade(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <div className="page-wrapper font-sans">
      {/* ===== Full-page background canvas ===== */}
      <div className="bg-canvas" aria-hidden="true">
        {/* Sun Orb */}
        <div className="sun-orb"></div>
        {/* Horizon Lens Flare */}
        <div className="horizon-lens-flare"></div>
        {/* Ambient Left Glow */}
        <div className="glow-left"></div>
        {/* Geometric Mountain Ranges */}
        <div className="mountain-range">
          <div className="peaks-bg"></div>
          <div className="peaks-mid"></div>
          <div className="peaks-fg"></div>
        </div>
      </div>

      {/* ===== Sticky Navigation Bar ===== */}
      <nav className="sticky top-0 w-full backdrop-blur-md bg-black/10 border-b border-white/10 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button 
              onClick={() => setView("landing")} 
              className="text-white font-extrabold text-xl tracking-tight cursor-pointer bg-transparent border-none focus:outline-none"
            >
              Caskayd
            </button>
          </div>
          
          <div className="hidden md:flex flex-none items-center gap-8 text-white/80 text-sm font-medium">
            <a
              href="https://calendly.com/jacey77n/intro-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Request a demo
            </a>
            <button 
              onClick={() => setView("pricing")} 
              className={`hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm font-medium focus:outline-none ${view === "pricing" ? "text-orange-200 font-bold" : ""}`}
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

          <div className="flex-1 flex justify-end">
            <button 
              onClick={() => router.push("/signup")}
              className="bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-semibold px-6 py-2.5 rounded-full hover:scale-105 transition-transform cursor-pointer"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {view === "landing" ? (
        <>
          {/* ===== Hero Section ===== */}
          <main className="relative z-10 flex flex-col items-center justify-center text-center pt-24 md:pt-32 pb-48 max-w-5xl mx-auto px-4">
            <h1 className="font-serif font-medium tracking-tight text-white text-4xl md:text-6xl mb-6 drop-shadow-xl leading-tight">
              Find the right creator in MINUTES not DAYS.
            </h1>

            {/* Animating Search Input UI */}
            <div className="w-full max-w-2xl mx-auto relative mb-16">
              <div className="relative flex items-center w-full h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 px-6 shadow-2xl overflow-hidden pointer-events-none select-none">
                <Search className="w-6 h-6 text-white/50 mr-4 flex-shrink-0" />
                <div className="relative flex-1 h-full flex items-center">
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="w-full h-full bg-transparent outline-none text-white text-lg placeholder-transparent cursor-default"
                    aria-label="Search creators"
                  />
                  <div
                    className={`absolute left-0 text-white font-semibold text-lg pointer-events-none transition-opacity duration-500 ease-in-out ${
                      fade ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {placeholders[currentPlaceholder]}
                  </div>
                </div>
                <div className="bg-[#ff6b35] text-white font-semibold px-6 py-2 rounded-full ml-4 cursor-default" aria-hidden="true">
                  Search
                </div>
              </div>
            </div>

            {/* Creator Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16">
              {[
                {
                  name: "Chef Tolu",
                  followers: "120K",
                  location: "Lagos",
                  niche: "Food",
                  photo: "/chef.webp",
                },
                {
                  name: "Tech Bro Femi",
                  followers: "85K",
                  location: "Ondo",
                  niche: "Tech",
                  photo: "/techbro.webp",
                },
                {
                  name: "Dami Skincare",
                  followers: "250K",
                  location: "Abuja",
                  niche: "Skincare",
                  photo: "/dami.webp",
                },
              ].map((creator, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-left text-white flex flex-col hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={creator.photo}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/20"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{creator.name}</h3>
                      <p className="text-sm text-white/70">
                        {creator.followers} Followers
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm font-medium opacity-80 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {creator.location}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider border border-white/10">
                      {creator.niche}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/signup")}
              className="mt-12 bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-lg cursor-pointer"
            >
              Get started
            </button>
          </main>

          {/* ===== Deep Analytics Value Prop (Section 2) ===== */}
          <section className="section-overlay text-white py-24 px-4 relative z-10 w-full">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              <h2 className="text-center font-bold text-3xl md:text-4xl tracking-tight mb-4">
                Your next campaign starts with the right creators
              </h2>
              <p className="text-center text-white/50 text-lg max-w-2xl mb-12 font-light leading-relaxed">
                Caskayd goes beyond vanity metrics. Our advanced matching engine
                scales campaign discoverability by analyzing deep performance data
                that actually matters.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full mb-14">
                <div className="feature-card rounded-2xl p-6 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#ff6b35]/20 flex items-center justify-center mb-4 text-[#ff6b35]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">
                    Posting Frequency
                  </h4>
                  <p className="text-sm text-white/60">
                    Track consistency and audience engagement rhythms to ensure
                    optimal campaign timing.
                  </p>
                </div>
                <div className="feature-card rounded-2xl p-6 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#7b2cbf]/20 flex items-center justify-center mb-4 text-[#7b2cbf]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">
                    Sentiment Analysis
                  </h4>
                  <p className="text-sm text-white/60">
                    Deep dive into comments to understand true audience sentiment
                    and brand safety.
                  </p>
                </div>
                <div className="feature-card rounded-2xl p-6 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#f7b731]/20 flex items-center justify-center mb-4 text-[#f7b731]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">Deep Metrics</h4>
                  <p className="text-sm text-white/60">
                    Analyze conversion rates, audience demographics, and historical
                    campaign ROI.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/signup")}
                className="bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-lg cursor-pointer"
              >
                Get started
              </button>
            </div>
          </section>
        </>
      ) : (
        /* ===== Pricing Section ===== */
        <main className="relative z-10 flex flex-col items-center justify-center pt-16 pb-20 px-4 max-w-5xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-white tracking-tight mb-8 drop-shadow-md">
            Prices that are easy on the pocket
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full mb-12">
            {/* Plan 1: Individual */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-left text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold tracking-wider text-orange-200 uppercase mb-2">
                  Individual
                </div>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-black font-sans">₦7,500</span>
                  <span className="text-sm text-white/70 ml-1">/ month</span>
                </div>
                <button 
                  onClick={() => handlePricingSelection("individual")}
                  className="w-full bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-bold py-3 px-6 rounded-xl transition-all text-center font-sans mt-4 mb-6 cursor-pointer focus:outline-none"
                >
                  Get started
                </button>
                <div className="border-t border-white/10 my-4"></div>
                <div className="text-xs font-bold tracking-widest text-white/50 mb-4 uppercase">
                  FEATURES
                </div>
                <ul className="space-y-3">
                  {[
                    "Unlimited searches",
                    "Full Profiles",
                    "Contact Information",
                    "Unlimited saved campaigns",
                  ].map((perk, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Plan 2: Team */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-left text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold tracking-wider text-orange-200 uppercase mb-2">
                  Team
                </div>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-black font-sans">₦60,000</span>
                  <span className="text-sm text-white/70 ml-1">/ month</span>
                </div>
                <button 
                  onClick={() => handlePricingSelection("team")}
                  className="w-full bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-bold py-3 px-6 rounded-xl transition-all text-center font-sans mt-4 mb-6 cursor-pointer focus:outline-none"
                >
                  Get started
                </button>
                <div className="border-t border-white/10 my-4"></div>
                <div className="text-xs font-bold tracking-widest text-white/50 mb-4 uppercase">
                  FEATURES
                </div>
                <ul className="space-y-3">
                  {[
                    "Everything in the Individual plan",
                    "5 seats per team",
                  ].map((perk, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 mb-4">
            <h2 className="font-serif text-2xl md:text-3xl text-white font-medium mb-3">
              Pause your subscription at anytime.
            </h2>
            <p className="font-sans text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              We know influencer marketing is dynamic. You might not have active campaigns running every single month. Feel free to pause your subscription whenever you hit a down-period, and instantly pick up right where you left off with all your saved progress intact.
            </p>
          </div>
        </main>
      )}

      {/* ===== Minimalist Site Footer ===== */}
      <footer className="w-full border-t border-white/10 bg-[#1c0512] py-8 px-6 flex flex-col md:flex-row justify-between items-center text-sm text-white/60 relative z-40">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <a href="#" className="hover:text-white transition-colors">
            Privacy policy
          </a>
          <span className="text-white/20">|</span>
          <span>Copyright © 2026 Caskayd</span>
        </div>
        <div className="flex items-center gap-6">
          {/* Instagram */}
          <a href="#" className="hover:text-white transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          {/* X (Twitter) */}
          <a href="#" className="hover:text-white transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* LinkedIn */}
          <a href="#" className="hover:text-white transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          {/* TikTok */}
          <a href="#" className="hover:text-white transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.5 5.54-3.9 7.15-2.4 1.61-5.61 2.15-8.31 1.05-2.7-1.1-4.83-3.66-5.26-6.52-.43-2.86.6-5.83 2.76-7.85 2.16-2.02 5.25-2.78 8.11-1.92v4.21c-1.25-.33-2.61-.17-3.7.53-1.09.7-1.83 1.96-1.85 3.25-.02 1.29.69 2.58 1.76 3.3 1.07.72 2.47.93 3.7.56 1.23-.37 2.2-1.35 2.58-2.58.26-.83.29-1.72.29-2.58.01-4.47.01-8.94.02-13.41h3.94z" />
            </svg>
          </a>
        </div>
      </footer>

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
