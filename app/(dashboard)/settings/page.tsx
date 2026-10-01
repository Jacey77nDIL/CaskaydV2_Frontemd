// app/(dashboard)/settings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";

interface PlanItem {
  plan: "FREELANCER" | "INDIVIDUAL" | "TEAM";
  displayName: string;
  amount: number;
  durationDays: number;
  includedSearches: number | null;
  accountLimit: number;
  searchLimit: number | null;
  description?: string;
  perks: string[];
  popular?: boolean;
}

interface CurrentSubscription {
  plan: "FREELANCER" | "INDIVIDUAL" | "TEAM" | string;
  status: string;
  expiresAt: string;
  autoRenew: boolean;
  searchesUsed?: number;
  searchCredits?: number;
  isOwner?: boolean;
  isTeamOwner?: boolean;
  role?: string;
  teamRole?: string;
  ownerId?: string;
  userId?: string;
}

interface SearchUsage {
  plan: string;
  searchesUsed: number;
  additionalSearches?: number;
  searchLimit: number | null;
  searchesRemaining: number | null;
  periodEndsAt?: string;
}

interface TeamMember {
  id: string;
  email: string;
  role?: string;
  createdAt?: string;
}

const DEFAULT_PLANS: PlanItem[] = [
  {
    plan: "FREELANCER",
    displayName: "Freelancer",
    amount: 2000,
    durationDays: 30,
    includedSearches: 50,
    accountLimit: 1,
    searchLimit: 50,
    description: "Ideal for solo recruiters and creators exploring discovery.",
    perks: [
      "50 searches per 30-day period",
      "1 user account",
      "Full creator profiles & demographics",
      "Direct contact info",
      "Buy extra 50-search packs anytime (₦2,000)",
    ],
  },
  {
    plan: "INDIVIDUAL",
    displayName: "Individual",
    amount: 7500,
    durationDays: 30,
    includedSearches: null,
    accountLimit: 1,
    searchLimit: null,
    popular: true,
    description: "Best for independent marketers, managers, and brands.",
    perks: [
      "Unlimited creator searches",
      "1 user account",
      "Full creator profiles & demographics",
      "Direct contact info",
      "Unlimited saved campaigns",
    ],
  },
  {
    plan: "TEAM",
    displayName: "Group",
    amount: 50000,
    durationDays: 30,
    includedSearches: null,
    accountLimit: 10,
    searchLimit: null,
    description: "Full collaborative access for agencies and growth teams.",
    perks: [
      "Unlimited creator searches",
      "10 total accounts (owner + 9 team members)",
      "Team member access management",
      "Full creator profiles & direct contact info",
      "Unlimited saved campaigns",
    ],
  },
];

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
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [searchUsage, setSearchUsage] = useState<SearchUsage | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>(DEFAULT_PLANS);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subMsg, setSubMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingSearchPack, setIsProcessingSearchPack] = useState(false);
  const [isCancellingAutoRenew, setIsCancellingAutoRenew] = useState(false);

  // Team / Group Management States (for TEAM subscribers)
  const [isTeamOwner, setIsTeamOwner] = useState<boolean | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [teamMsg, setTeamMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Show switch plan section
  const [showSwitchPlans, setShowSwitchPlans] = useState(false);

  // Format Helper for dates
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Helper for Plan display name
  // Helper for Plan display name
  const getPlanDisplayName = (planCode?: string) => {
    if (!planCode) return "Unknown";
    const code = planCode.toUpperCase();
    if (code === "TEAM") return "Group";
    if (code === "INDIVIDUAL") return "Individual";
    if (code === "FREELANCER") return "Freelancer";
    return planCode;
  };

  // Robust Helpers for Team Member properties
  const getMemberEmail = (member: any): string => {
    if (!member) return "";
    if (typeof member === "string") return member;
    return (
      member.email ||
      member.user?.email ||
      member.member?.email ||
      member.account?.email ||
      member.memberUser?.email ||
      member.invitee?.email ||
      member.invitedUser?.email ||
      member.invitedEmail ||
      member.userEmail ||
      member.user_email ||
      ""
    );
  };

  const getMemberName = (member: any): string => {
    if (!member) return "";
    return (
      member.fullName ||
      member.name ||
      member.user?.fullName ||
      member.user?.name ||
      member.member?.fullName ||
      member.member?.name ||
      member.account?.fullName ||
      member.account?.name ||
      member.displayName ||
      ""
    );
  };

  const getMemberId = (member: any): string => {
    if (!member) return "";
    return (
      member.id ||
      member._id ||
      member.memberId ||
      member.member_id ||
      member.userId ||
      member.user?.id ||
      member.user?._id ||
      ""
    );
  };

  // Robust Helper for Searches Used across various potential backend field names
  const getSearchesUsed = (usage: any, sub: any): number => {
    const candidates = [
      usage?.searchesUsed,
      usage?.searches_used,
      usage?.searchesPerformed,
      usage?.searches_performed,
      usage?.searchCount,
      usage?.search_count,
      usage?.searches,
      usage?.used,
      usage?.usedSearches,
      usage?.totalSearches,
      usage?.data?.searchesUsed,
      usage?.data?.searches_used,
      sub?.searchesUsed,
      sub?.searches_used,
      sub?.searchesPerformed,
      sub?.searchCount,
      sub?.searches,
      sub?.used,
    ];

    for (const c of candidates) {
      if (typeof c === "number" && !isNaN(c)) return c;
      if (typeof c === "string" && c.trim() !== "" && !isNaN(Number(c))) return Number(c);
    }
    return 0;
  };

  // Fetch Team Members
  const fetchTeamMembers = useCallback(async () => {
    setLoadingTeam(true);
    try {
      const res = await fetchWithAuth("/api/subscriptions/team/members");
      if (!res.ok) {
        console.log("[Caskayd] /api/subscriptions/team/members non-ok status:", res.status);
        setIsTeamOwner(false);
        setTeamMembers([]);
        return;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      console.log("[Caskayd] Team members response:", data);

      if (data && (data.error || data.statusCode === 403 || data.statusCode === 401)) {
        setIsTeamOwner(false);
        setTeamMembers([]);
        return;
      }

      const membersList = Array.isArray(data)
        ? data
        : Array.isArray(data.members)
        ? data.members
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.team)
        ? data.team
        : Array.isArray(data.items)
        ? data.items
        : [];
      setTeamMembers(membersList);
      setIsTeamOwner(true);
    } catch (err) {
      console.error("Failed to load team members:", err);
      setIsTeamOwner(false);
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  // Fetch Subscriptions & Search Usage
  const fetchSubscriptionData = useCallback(async () => {
    try {
      const [meRes, usageRes, plansRes] = await Promise.all([
        fetchWithAuth("/api/subscriptions/me"),
        fetchWithAuth("/api/subscriptions/search-usage"),
        fetchWithAuth("/api/subscriptions"),
      ]);

      let activePlanCode: string | null = null;

      if (meRes.ok) {
        const text = await meRes.text();
        const meData: CurrentSubscription = text ? JSON.parse(text) : null;
        console.log("[Caskayd] /api/subscriptions/me response:", meData);
        if (meData && meData.plan) {
          setCurrentSub(meData);
          if (meData.status === "ACTIVE") {
            activePlanCode = meData.plan.toUpperCase();
            if (
              meData.isOwner === false ||
              meData.isTeamOwner === false ||
              meData.role?.toUpperCase() === "MEMBER" ||
              meData.teamRole?.toUpperCase() === "MEMBER"
            ) {
              setIsTeamOwner(false);
            } else if (
              meData.isOwner === true ||
              meData.isTeamOwner === true ||
              meData.role?.toUpperCase() === "OWNER" ||
              meData.teamRole?.toUpperCase() === "OWNER"
            ) {
              setIsTeamOwner(true);
            }
          }
        } else {
          setCurrentSub(null);
        }
      }

      if (usageRes.ok) {
        const text = await usageRes.text();
        const usageData: SearchUsage = text ? JSON.parse(text) : null;
        console.log("[Caskayd] /api/subscriptions/search-usage response:", usageData);
        setSearchUsage(usageData);
      }

      if (plansRes.ok) {
        const text = await plansRes.text();
        const plansData = text ? JSON.parse(text) : [];
        const list = Array.isArray(plansData) ? plansData : plansData.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mergedPlans = DEFAULT_PLANS.map((defaultPlan) => {
            const apiPlan = list.find(
              (p: any) => p.plan?.toUpperCase() === defaultPlan.plan
            );
            if (apiPlan) {
              return {
                ...defaultPlan,
                amount: apiPlan.amount ?? defaultPlan.amount,
                durationDays: apiPlan.durationDays ?? defaultPlan.durationDays,
                includedSearches:
                  apiPlan.includedSearches ?? defaultPlan.includedSearches,
                accountLimit:
                  apiPlan.accountLimit ?? defaultPlan.accountLimit,
                searchLimit:
                  apiPlan.searchLimit ?? defaultPlan.searchLimit,
              };
            }
            return defaultPlan;
          });
          setPlans(mergedPlans);
        }
      }

      // If active plan is TEAM, load team members
      if (activePlanCode === "TEAM") {
        fetchTeamMembers();
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoadingSub(false);
    }
  }, [fetchTeamMembers]);

  // Initial Data Fetch
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

      // 2. Fetch Subscriptions & Search Quota
      await fetchSubscriptionData();
    };

    fetchAllData();
    checkForPaymentCallback();
  }, [fetchSubscriptionData]);

  // --- Payment Callback Handler ---
  const checkForPaymentCallback = async () => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transaction_id") || params.get("transactionId");
    const paymentStatus = params.get("payment");

    if (transactionId) {
      setSubMsg({ type: "success", text: "Verifying payment with Flutterwave..." });
      try {
        const res = await fetchWithAuth("/api/subscriptions/verify", {
          method: "POST",
          body: JSON.stringify({ transactionId }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || errData.error?.message || "Payment verification failed.");
        }

        setSubMsg({ type: "success", text: "Payment verified! Your subscription is now active." });
        window.history.replaceState(null, "", window.location.pathname);
        await fetchSubscriptionData();
      } catch (err: any) {
        setSubMsg({ type: "error", text: err.message || "Failed to verify transaction." });
      }
    } else if (paymentStatus === "success") {
      setSubMsg({ type: "success", text: "Payment was successful! Your subscription is active." });
      window.history.replaceState(null, "", window.location.pathname);
      await fetchSubscriptionData();
    } else if (paymentStatus === "failed") {
      setSubMsg({ type: "error", text: "Payment was cancelled or failed. Please try again." });
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  // --- Start Subscription Checkout ---
  const handleSubscribe = async (planIdentifier: "FREELANCER" | "INDIVIDUAL" | "TEAM") => {
    setIsProcessingPayment(true);
    setSubMsg(null);

    try {
      const res = await fetchWithAuth("/api/subscriptions/initialize", {
        method: "POST",
        body: JSON.stringify({ plan: planIdentifier }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error?.message || "Failed to initialize payment checkout.");
      }

      const data = await res.json();
      const checkoutUrl =
        data.paymentLink || data.paymentUrl || data.link || data.data?.link;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No payment link received from payment provider.");
      }
    } catch (err: any) {
      setSubMsg({ type: "error", text: err.message || "Checkout initialization failed." });
      setIsProcessingPayment(false);
    }
  };

  // --- Buy 50 Additional Searches (Freelancer only) ---
  const handleBuySearchPack = async () => {
    setIsProcessingSearchPack(true);
    setSubMsg(null);

    try {
      const res = await fetchWithAuth("/api/subscriptions/search-packs/initialize", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || data.error?.message || "Failed to initialize search pack purchase."
        );
      }

      const data = await res.json();
      const checkoutUrl =
        data.paymentLink || data.paymentUrl || data.link || data.data?.link;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No payment link received for search pack.");
      }
    } catch (err: any) {
      setSubMsg({ type: "error", text: err.message || "Failed to purchase search pack." });
      setIsProcessingSearchPack(false);
    }
  };

  // --- Cancel Auto-Renewal ---
  const handleCancelAutoRenew = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel auto-renewal? Future recurring charges will stop, and your access will remain active until the end of your current 30-day period."
      )
    ) {
      return;
    }

    setIsCancellingAutoRenew(true);
    setSubMsg(null);

    try {
      const res = await fetchWithAuth("/api/subscriptions/cancel", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error?.message || "Failed to cancel auto-renewal.");
      }

      setSubMsg({
        type: "success",
        text: "Auto-renewal has been cancelled. Your access remains active until your current period expires.",
      });
      await fetchSubscriptionData();
    } catch (err: any) {
      setSubMsg({ type: "error", text: err.message || "Failed to update auto-renewal." });
    } finally {
      setIsCancellingAutoRenew(false);
    }
  };

  // --- Team Member: Add Member ---
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsAddingMember(true);
    setTeamMsg(null);

    try {
      const res = await fetchWithAuth("/api/subscriptions/team/members", {
        method: "POST",
        body: JSON.stringify({ email: newMemberEmail.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ||
            data.error?.message ||
            "Failed to add group member. Make sure the user already has a registered Caskayd account."
        );
      }

      setTeamMsg({ type: "success", text: `Successfully added ${newMemberEmail} to your group!` });
      setNewMemberEmail("");
      await fetchTeamMembers();
    } catch (err: any) {
      setTeamMsg({ type: "error", text: err.message || "Failed to add member." });
    } finally {
      setIsAddingMember(false);
    }
  };

  // --- Team Member: Remove Member ---
  const handleRemoveTeamMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from your group?`)) {
      return;
    }

    setRemovingMemberId(memberId);
    setTeamMsg(null);

    try {
      const res = await fetchWithAuth(`/api/subscriptions/team/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error?.message || "Failed to remove member.");
      }

      setTeamMsg({ type: "success", text: `Removed ${memberEmail} from group.` });
      await fetchTeamMembers();
    } catch (err: any) {
      setTeamMsg({ type: "error", text: err.message || "Failed to remove member." });
    } finally {
      setRemovingMemberId(null);
    }
  };

  // Profile update
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

  // Password update
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

  const isCurrentSubActive = currentSub && currentSub.status === "ACTIVE";
  const activePlanKey = currentSub?.plan?.toUpperCase();
  const isFreelancer = activePlanKey === "FREELANCER";
  const isTeam = activePlanKey === "TEAM";

  return (
    <div className="w-full max-w-3xl mx-auto font-sans pb-16">
      <h1 className="font-serif font-medium tracking-tight text-gray-900 text-4xl md:text-5xl mb-8 drop-shadow-sm leading-tight">
        Settings
      </h1>

      <div className="space-y-10">
        {/* ===== Profile Section ===== */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>

          {profileMsg && (
            <div
              className={`p-3 text-xs rounded-xl mb-4 text-center ${
                profileMsg.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Display Name
              </label>
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
            <div
              className={`p-3 text-xs rounded-xl mb-4 text-center ${
                passwordMsg.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                New Password
              </label>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Subscription & Billing</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your billing, search quotas, and account memberships.
              </p>
            </div>
            {isCurrentSubActive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            )}
          </div>

          {subMsg && (
            <div
              className={`p-3.5 text-xs rounded-xl mb-6 text-center font-medium ${
                subMsg.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {subMsg.text}
            </div>
          )}

          {loadingSub ? (
            <div className="py-8 text-center text-sm text-gray-400 animate-pulse">
              Loading subscription details...
            </div>
          ) : isCurrentSubActive ? (
            <div className="space-y-6">
              {/* Active Plan Card */}
              <div className="p-5 sm:p-6 bg-gradient-to-br from-orange-50/60 to-orange-100/30 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff6b35]">
                      Current Plan
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      (30-day billing period)
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {getPlanDisplayName(currentSub.plan)} Plan
                    {isTeam && isTeamOwner === false && (
                      <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 align-middle">
                        Member
                      </span>
                    )}
                  </h3>
                  <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
                    <p>
                      {isTeam && isTeamOwner === false ? (
                        <span className="text-emerald-700 font-medium">
                          Active membership managed by your group owner
                        </span>
                      ) : currentSub.autoRenew ? (
                        <span className="text-emerald-700 font-medium">
                          Auto-renews on {formatDate(currentSub.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium">
                          Auto-renewal off — access ends on {formatDate(currentSub.expiresAt)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  {isTeam && isTeamOwner === false ? null : currentSub.autoRenew ? (
                    <button
                      onClick={handleCancelAutoRenew}
                      disabled={isCancellingAutoRenew}
                      className="bg-white text-red-600 border border-red-200 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl transition-all text-xs cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isCancellingAutoRenew ? "Cancelling..." : "Cancel Auto-Renewal"}
                    </button>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-center">
                      Auto-renewal cancelled
                    </span>
                  )}

                  <button
                    onClick={() => setShowSwitchPlans(!showSwitchPlans)}
                    className="text-xs font-semibold text-[#ff6b35] hover:text-[#e05a2b] hover:underline cursor-pointer py-1"
                  >
                    {showSwitchPlans ? "Hide other plans" : "Change or upgrade plan →"}
                  </button>
                </div>
              </div>

              {/* Search Quota / Usage Card */}
              <div className="p-5 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h4 className="text-sm font-bold text-gray-900">Search Quota & Usage</h4>
                  </div>
                  {searchUsage?.periodEndsAt && (
                    <span className="text-[11px] text-gray-500">
                      Resets {formatDate(searchUsage.periodEndsAt)}
                    </span>
                  )}
                </div>

                {isFreelancer ? (
                  // Freelancer Quota Details
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-900 text-base">
                          {getSearchesUsed(searchUsage, currentSub)}
                        </span>{" "}
                        / {searchUsage?.searchLimit ?? 50} searches used
                      </span>
                      <span className="font-semibold text-gray-700">
                        {searchUsage?.searchesRemaining ?? 0} remaining
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#ff6b35] h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (getSearchesUsed(searchUsage, currentSub) /
                                (searchUsage?.searchLimit || 50)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    {Boolean(searchUsage?.additionalSearches) && (
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>+{searchUsage?.additionalSearches} bonus search pack credits active</span>
                      </p>
                    )}

                    {/* Buy 50 More Searches Pack Button */}
                    <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Need more creator searches?</p>
                        <p className="text-[11px] text-gray-500">
                          Add 50 extra searches to your period for ₦2,000.
                        </p>
                      </div>
                      <button
                        onClick={handleBuySearchPack}
                        disabled={isProcessingSearchPack}
                        className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
                      >
                        {isProcessingSearchPack ? "Redirecting..." : "Buy 50 Searches — ₦2,000"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Individual / Group Unlimited Usage Details
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Unlimited Searches
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your plan includes unlimited creator searches, deep analytics, and direct contact details with zero usage caps.
                    </p>
                  </div>
                )}
              </div>

              {/* Group / TEAM Members Section - Only visible to Group Owners */}
              {isTeam && isTeamOwner === true && (
                <div className="p-5 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Group Members</h4>
                      <p className="text-xs text-gray-500">
                        Owner + up to 9 members = 10 total accounts. Members must have registered accounts.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-[#ff6b35]">
                      {teamMembers.length} / 9 invited
                    </span>
                  </div>

                  {teamMsg && (
                    <div
                      className={`p-3 text-xs rounded-xl my-3 text-center ${
                        teamMsg.type === "success"
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                          : "bg-red-50 border border-red-200 text-red-600"
                      }`}
                    >
                      {teamMsg.text}
                    </div>
                  )}

                  {/* Add Member Form */}
                  <form onSubmit={handleAddTeamMember} className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      placeholder="member@example.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      disabled={isAddingMember || teamMembers.length >= 9}
                      className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] disabled:opacity-50 text-gray-900"
                    />
                    <button
                      type="submit"
                      disabled={isAddingMember || teamMembers.length >= 9 || !newMemberEmail.trim()}
                      className="bg-black hover:bg-gray-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {isAddingMember ? "Adding..." : "Add Member"}
                    </button>
                  </form>

                  {/* Member List */}
                  <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                    {/* Owner row */}
                    <div className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">You</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600">
                          Owner
                        </span>
                      </div>
                      <span className="text-gray-400">Account Owner</span>
                    </div>

                    {loadingTeam ? (
                      <div className="py-3 text-xs text-gray-400 text-center">Loading members...</div>
                    ) : teamMembers.length === 0 ? (
                      <div className="py-3 text-xs text-gray-400 text-center">
                        No team members added yet. Add up to 9 registered accounts.
                      </div>
                    ) : (
                      teamMembers.map((member, idx) => {
                        const email = getMemberEmail(member);
                        const memberName = getMemberName(member);
                        const memberId = getMemberId(member) || String(idx);

                        return (
                          <div key={memberId || idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex flex-col min-w-0 pr-3">
                              {memberName && memberName !== email ? (
                                <>
                                  <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
                                    {memberName}
                                  </span>
                                  <span className="text-gray-500 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                                    {email || "Registered Account"}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs">
                                  {email || memberName || "Registered Account"}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(memberId, email || memberName || "Member")}
                              disabled={removingMemberId === memberId}
                              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer text-xs disabled:opacity-50 flex-shrink-0"
                            >
                              {removingMemberId === memberId ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Plan Switcher / Upgrade Section (Collapsible) */}
              {showSwitchPlans && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Available Plans</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((p) => {
                      const isCurrent = p.plan === activePlanKey;
                      return (
                        <div
                          key={p.plan}
                          className={`p-4 rounded-xl border flex flex-col justify-between ${
                            isCurrent
                              ? "border-orange-300 bg-orange-50/40 ring-1 ring-orange-200"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase text-gray-900">
                                {p.displayName}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-[#ff6b35] bg-orange-100 px-1.5 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-black text-gray-900 mb-2">
                              ₦{p.amount.toLocaleString()}
                              <span className="text-[11px] font-normal text-gray-500"> / 30 days</span>
                            </div>
                            <ul className="text-[11px] text-gray-600 space-y-1 mb-4">
                              {p.perks.map((perk, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-emerald-600">✓</span>
                                  <span>{perk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {!isCurrent && (
                            <button
                              onClick={() => handleSubscribe(p.plan)}
                              disabled={isProcessingPayment}
                              className="w-full bg-[#ff6b35] hover:bg-[#e05a2b] text-white text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50 text-center"
                            >
                              {isProcessingPayment ? "Redirecting..." : `Switch to ${p.displayName}`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // No Active Subscription UI
            <div>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                You currently do not have an active subscription. Choose a plan to unlock creator search discovery, verified demographics, and campaign tools. All plans run for 30 days.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((p) => {
                  return (
                    <div
                      key={p.plan}
                      className={`relative p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                        p.popular
                          ? "border-[#ff6b35] bg-orange-50/20 shadow-md ring-1 ring-[#ff6b35]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6b35] text-white shadow-xs">
                          Most Popular
                        </span>
                      )}

                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base uppercase tracking-tight mb-1">
                          {p.displayName}
                        </h3>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="font-black text-gray-900 text-2xl leading-none">
                            ₦{p.amount.toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-xs font-medium">/ 30 days</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 min-h-[32px]">{p.description}</p>

                        <div className="border-t border-gray-100 pt-3 mb-5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                            Included
                          </span>
                          <ul className="text-xs text-gray-700 space-y-2">
                            {p.perks.map((perk, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <svg
                                  className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSubscribe(p.plan)}
                        disabled={isProcessingPayment}
                        className={`w-full flex items-center justify-center gap-1.5 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs cursor-pointer disabled:opacity-50 ${
                          p.popular
                            ? "bg-[#ff6b35] hover:bg-[#e05a2b] text-white shadow-xs"
                            : "bg-black hover:bg-gray-800 text-white"
                        }`}
                      >
                        {isProcessingPayment ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Redirecting...</span>
                          </>
                        ) : (
                          `Subscribe to ${p.displayName}`
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}