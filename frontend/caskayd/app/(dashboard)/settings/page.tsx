// app/(dashboard)/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api"; 

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState("");

  // Profile States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Security States
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Subscription States
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subMsg, setSubMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      // 1. Fetch User Profile
      try {
        const res = await fetchWithAuth("/api/users/me");
        if (res.ok) {
          const text = await res.text();
          const data = text ? JSON.parse(text) : {};
          setName(data.fullName || data.name || "");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoadingProfile(false);
      }

      // 2. Fetch Current Subscription & Available Plans safely
      try {
        const [meRes, plansRes] = await Promise.all([
          fetchWithAuth("/api/subscriptions/me"),
          fetchWithAuth("/api/subscriptions")
        ]);

        if (meRes.ok) {
          const text = await meRes.text();
          const meData = text ? JSON.parse(text) : null;
          setCurrentSub(meData?.plan ? meData : null); 
        }
        
        if (plansRes.ok) {
          const text = await plansRes.text();
          const plansData = text ? JSON.parse(text) : [];
          setPlans(Array.isArray(plansData) ? plansData : (plansData.data || []));
        }
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        setLoadingSub(false);
      }
    };

    fetchAllData();
    checkForPaymentCallback();
  }, []);

  // --- Payment Callback Handler ---
  const checkForPaymentCallback = async () => {
    if (typeof window === "undefined") return;
    
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transaction_id") || params.get("transactionId");

    if (transactionId) {
      setSubMsg({ type: "success", text: "Verifying payment..." });
      try {
        const res = await fetchWithAuth("/api/subscriptions/verify", {
          method: "POST",
          body: JSON.stringify({ transactionId }),
        });

        if (!res.ok) throw new Error("Payment verification failed.");
        
        setSubMsg({ type: "success", text: "Subscription activated successfully!" });
        
        window.history.replaceState(null, "", window.location.pathname);
        setTimeout(() => window.location.reload(), 2000);
      } catch (err: any) {
        setSubMsg({ type: "error", text: err.message });
      }
    }
  };

  // --- Payment Initializer ---
  const handleSubscribe = async (planIdentifier: string) => {
    setIsProcessingPayment(true);
    setSubMsg(null);

    try {
      const formattedPlan = planIdentifier.toUpperCase();

      const res = await fetchWithAuth("/api/subscriptions/initialize", {
        method: "POST",
        body: JSON.stringify({ plan: formattedPlan }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to initialize payment.");
      }

      const data = await res.json();
      
      // Look for the specific 'paymentLink' property the backend is now returning!
      const checkoutUrl = data.paymentLink || data.paymentUrl || data.link || data.data?.link;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No payment URL received from server.");
      }
    } catch (err: any) {
      setSubMsg({ type: "error", text: err.message });
      setIsProcessingPayment(false);
    }
  };

  // --- API Function: Cancel Subscription ---
  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose premium access when your current billing cycle ends.")) return;
    
    setSubMsg({ type: "success", text: "Cancelling subscription..." });
    try {
      const res = await fetchWithAuth("/api/subscriptions/cancel", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to cancel subscription.");
      }
      
      setSubMsg({ type: "success", text: "Subscription successfully cancelled." });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setSubMsg({ type: "error", text: err.message });
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetchWithAuth("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName: name }),
      });

      if (!res.ok) throw new Error("Failed to update profile.");
      setProfileMsg({ type: "success", text: "Display name updated successfully!" });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg(null);

    try {
      const res = await fetchWithAuth("/api/users/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update password.");
      }

      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">
      <h1 className="font-serif font-medium tracking-tight text-gray-900 text-4xl md:text-5xl mb-8 drop-shadow-sm leading-tight">
        Settings
      </h1>

      <div className="space-y-10">
        
        {/* ===== Profile Section ===== */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>
          
          {profileMsg && (
            <div className={`p-3 text-xs rounded-xl mb-4 text-center ${profileMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                required
                disabled={loadingProfile}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={loadingProfile ? "Loading..." : "Enter full name"}
                className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900 disabled:opacity-50"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={savingProfile || loadingProfile}
                className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2.5 rounded-xl transition-all text-sm mt-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* ===== Security Section ===== */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>

          {passwordMsg && (
            <div className={`p-3 text-xs rounded-xl mb-4 text-center ${passwordMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={savingPassword}
                className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2.5 rounded-xl transition-all text-sm mt-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {savingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </section>

        {/* ===== Subscription Section ===== */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription</h2>
          
          {subMsg && (
            <div className={`p-3 text-xs rounded-xl mb-4 text-center ${subMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {subMsg.text}
            </div>
          )}

          {loadingSub ? (
            <div className="text-sm text-gray-400 py-4">Loading subscription details...</div>
          ) : currentSub && currentSub.status === "ACTIVE" ? (
            <>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-lg">
                Manage your billing and active plans. You won't be billed if you pause your subscription.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl gap-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{currentSub.plan.toLowerCase()} Plan</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {currentSub.autoRenew ? "Active — Renews automatically" : "Cancels at the end of billing period"}
                  </p>
                </div>
                {currentSub.autoRenew && (
                  <button 
                    onClick={handleCancelSubscription}
                    className="bg-white text-red-600 border border-red-200 hover:bg-red-50 font-semibold px-5 py-2 rounded-lg transition-all text-sm cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-lg">
                You currently do not have an active subscription. Choose a plan below to unlock full access to creator data and campaign tools.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Updated the fallback array to match the backend's new "INDIVIDUAL" and "TEAM" Enums */}
                {(plans.length > 0 ? plans : [
                  { plan: "INDIVIDUAL", amount: 7500, desc: "For independent marketers" }, 
                  { plan: "TEAM", amount: 25000, desc: "For scaling agencies" }
                ]).map((p, idx) => (
                  <div key={idx} className="p-5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1 uppercase">{p.plan}</h3>
                      <p className="font-semibold text-[#ff6b35] mb-2">₦{p.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mb-4">{p.desc || "Unlock premium features."}</p>
                    </div>
                    <button
                      onClick={() => handleSubscribe(p.plan)}
                      disabled={isProcessingPayment}
                      className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-2.5 rounded-lg transition-all text-sm cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? "Redirecting..." : "Subscribe Now"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  );
}