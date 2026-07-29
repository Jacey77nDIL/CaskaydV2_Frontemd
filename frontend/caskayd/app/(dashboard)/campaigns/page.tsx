// app/(dashboard)/campaigns/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

// --- Types ---
interface Campaign {
  id: string;
  name: string;
}

type CampaignStatus = 
  | "NOT_CONTACTED"
  | "REACHED_OUT"
  | "RESPONDED"
  | "ACCEPTED"
  | "DECLINED"
  | "CONTENT_APPROVED"
  | "POSTED";

interface CampaignCreator {
  id: string; 
  name: string;
  email: string;
  status: CampaignStatus;
  notes: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string>("");
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");

  const [creators, setCreators] = useState<CampaignCreator[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (activeCampaignId) {
      fetchActiveCampaignDetails(activeCampaignId);
    } else {
      setCreators([]);
    }
  }, [activeCampaignId]);

  // --- API Functions ---

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/campaigns");
      if (!res.ok) throw new Error("Failed to load campaigns");
      
      const data = await res.json();
      const campaignList = Array.isArray(data) ? data : (data.data || []);
      setCampaigns(campaignList);

      if (campaignList.length > 0 && !activeCampaignId) {
        setActiveCampaignId(campaignList[0].id || campaignList[0]._id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCampaignDetails = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/campaigns/${id}`);
      if (!res.ok) throw new Error("Failed to load campaign details");
      
      const data = await res.json();
      
      const formattedCreators = (data.campaignCreators || []).map((cc: any) => {
        const c = cc.creator || {};
        const latestNote = cc.notes && cc.notes.length > 0 ? cc.notes[cc.notes.length - 1].note : "";
        return { 
          id: cc.creatorId || c.id,
          name: c.name || "Unknown",
          email: c.businessEmail || "No email provided",
          status: cc.status || "NOT_CONTACTED",
          notes: latestNote 
        };
      });
      
      setCreators(formattedCreators);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    try {
      const res = await fetchWithAuth("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({ name: newCampaignName }),
      });
      
      if (!res.ok) throw new Error("Failed to create campaign");
      
      const newCampaign = await res.json();
      setCampaigns([...campaigns, newCampaign]);
      setActiveCampaignId(newCampaign.id || newCampaign._id);
      setIsCampaignModalOpen(false);
      setNewCampaignName("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (creatorId: string, newStatus: CampaignStatus) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, status: newStatus } : c))
    );

    try {
      await fetchWithAuth(`/api/campaigns/${activeCampaignId}/creators/${creatorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err: any) {
      console.error("Failed to update status", err);
    }
  };

  const handleDeleteCreator = async (creatorId: string) => {
    if (!confirm("Remove this creator from the campaign?")) return;
    
    setCreators((prev) => prev.filter((c) => c.id !== creatorId));

    try {
      await fetchWithAuth(`/api/campaigns/${activeCampaignId}/creators/${creatorId}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      console.error("Failed to delete creator", err);
    }
  };

  const handleNotesChange = (id: string, newNotes: string) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: newNotes } : c))
    );
  };

  const handleNotesBlur = async (creatorId: string, noteText: string) => {
    if (!noteText.trim()) return;

    try {
      await fetchWithAuth(`/api/campaigns/${activeCampaignId}/creators/${creatorId}/notes`, {
        method: "POST",
        body: JSON.stringify({ note: noteText }),
      });
    } catch (err: any) {
      console.error("Failed to save note", err);
    }
  };

  // --- UI Helpers ---

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "REACHED_OUT": return "bg-blue-50 text-blue-700 border-blue-200";
      case "RESPONDED": return "bg-purple-50 text-purple-700 border-purple-200";
      case "ACCEPTED": return "bg-green-50 text-green-700 border-green-200";
      case "DECLINED": return "bg-red-50 text-red-700 border-red-200";
      case "CONTENT_APPROVED": return "bg-orange-50 text-orange-700 border-orange-200";
      case "POSTED": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-sans text-gray-900">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="font-serif font-medium tracking-tight text-gray-900 text-4xl md:text-5xl mb-2 drop-shadow-sm leading-tight">
            Campaign Tracker
          </h1>
          
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Folder:</span>
            {loading ? (
              <span className="text-sm text-gray-400">Loading...</span>
            ) : campaigns.length > 0 ? (
              <div className="relative inline-block w-64">
                <select 
                  value={activeCampaignId}
                  onChange={(e) => setActiveCampaignId(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-semibold text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all shadow-sm cursor-pointer"
                >
                  {campaigns.map(camp => (
                    <option key={camp.id || (camp as any)._id} value={camp.id || (camp as any)._id}>
                      {camp.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">No campaigns found</span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsCampaignModalOpen(true)}
            className="bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-sm"
          >
            + New Campaign
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%]">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%]">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%]">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[30%]">Notes</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[5%] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!activeCampaignId ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    Please create or select a campaign to view creators.
                  </td>
                </tr>
              ) : creators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No creators in this campaign yet. Find and add creators from the Search page.
                  </td>
                </tr>
              ) : (
                creators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{creator.name || "Unknown"}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {creator.email || "No email provided"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block w-full">
                        <select
                          value={creator.status || "NOT_CONTACTED"}
                          onChange={(e) => handleStatusChange(creator.id, e.target.value as CampaignStatus)}
                          className={`w-full appearance-none text-xs font-semibold rounded-lg px-3 py-2 pr-8 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all ${getStatusColor(creator.status)}`}
                        >
                          <option value="NOT_CONTACTED">Not Contacted</option>
                          <option value="REACHED_OUT">Reached Out</option>
                          <option value="RESPONDED">Responded</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="DECLINED">Declined</option>
                          <option value="CONTENT_APPROVED">Content Approved</option>
                          <option value="POSTED">Posted</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <textarea
                        value={creator.notes || ""}
                        onChange={(e) => handleNotesChange(creator.id, e.target.value)}
                        onBlur={(e) => handleNotesBlur(creator.id, e.target.value)}
                        placeholder="Add a note..."
                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-[#ff6b35] focus:bg-white focus:shadow-sm rounded-lg px-3 py-2 text-sm text-gray-700 transition-all duration-300 ease-in-out outline-none resize-none overflow-hidden focus:overflow-y-auto block h-[38px] focus:h-[100px] leading-tight"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDeleteCreator(creator.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Remove Creator"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: New Parent Campaign */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-serif font-medium tracking-tight text-gray-900 mb-6">Create New Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all text-sm text-gray-900"
                  placeholder="e.g. Summer Streetwear Launch"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#ff6b35] text-white hover:bg-[#e05a2b] font-semibold py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-sm"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}