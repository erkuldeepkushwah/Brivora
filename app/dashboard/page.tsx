"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";

interface Engagement {
  id: string;
  title: string;
  category: string;
  leadAdvisor: string;
  advisorRole: string;
  progress: number;
  status: "In Progress" | "Under Review" | "Completed" | "Scheduled";
  nextMilestone: string;
  dueDate: string;
  impactScore: string;
}

interface AdvisorySession {
  id: string;
  topic: string;
  advisor: string;
  advisorRole: string;
  date: string;
  time: string;
  duration: string;
  type: "Strategy Session" | "Quarterly Review" | "Technical Advisory";
  linkText: string;
}

interface Deliverable {
  id: string;
  title: string;
  type: "PDF Report" | "Financial Model" | "Audit Matrix" | "Roadmap";
  fileSize: string;
  uploadedDate: string;
  status: "Approved" | "Ready for Download" | "In Revision";
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"engagements" | "sessions" | "deliverables" | "metrics">("engagements");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [selectedSessionTopic, setSelectedSessionTopic] = useState<string>("");

  const engagements: Engagement[] = [
    {
      id: "eng-1",
      title: "Global Supply Chain Modernization & Cost Optimization",
      category: "Operations & Logistics",
      leadAdvisor: "Dr. Marcus Vance",
      advisorRole: "Senior Partner, Supply Operations",
      progress: 78,
      status: "In Progress",
      nextMilestone: "Vendor contract renegotiation phase completion",
      dueDate: "Oct 15, 2026",
      impactScore: "+$1.2M annual savings",
    },
    {
      id: "eng-2",
      title: "Enterprise AI & Cloud Infrastructure Architecture",
      category: "Digital Transformation",
      leadAdvisor: "Elena Rostova",
      advisorRole: "Principal Technology Strategist",
      progress: 92,
      status: "Under Review",
      nextMilestone: "Final cybersecurity hardening and compliance signoff",
      dueDate: "Oct 02, 2026",
      impactScore: "3.4x throughput speed",
    },
    {
      id: "eng-3",
      title: "Executive Leadership Alignment & Change Governance",
      category: "Organizational Strategy",
      leadAdvisor: "Sarah Jenkins",
      advisorRole: "Managing Director, Governance",
      progress: 60,
      status: "In Progress",
      nextMilestone: "Cross-functional executive workshop Series 3",
      dueDate: "Nov 10, 2026",
      impactScore: "94% leadership cohesion",
    },
    {
      id: "eng-4",
      title: "Q4 Market Expansion & APAC Regulatory Compliance",
      category: "Market Expansion",
      leadAdvisor: "David Chen",
      advisorRole: "Partner, International Advisory",
      progress: 35,
      status: "Scheduled",
      nextMilestone: "Jurisdiction risk mapping & partner agreements",
      dueDate: "Dec 05, 2026",
      impactScore: "2 new regional licenses",
    },
  ];

  const sessions: AdvisorySession[] = [
    {
      id: "ses-1",
      topic: "Q4 Supply Chain Benchmarking & Logistics Audit",
      advisor: "Dr. Marcus Vance",
      advisorRole: "Senior Partner",
      date: "Tomorrow, Sep 18, 2026",
      time: "10:00 AM - 11:30 AM EST",
      duration: "90 min",
      type: "Strategy Session",
      linkText: "Join Executive Room",
    },
    {
      id: "ses-2",
      topic: "Digital Architecture Security Hardening Review",
      advisor: "Elena Rostova",
      advisorRole: "Principal Strategist",
      date: "Tuesday, Sep 22, 2026",
      time: "2:00 PM - 3:00 PM EST",
      duration: "60 min",
      type: "Technical Advisory",
      linkText: "Join Video Bridge",
    },
    {
      id: "ses-3",
      topic: "Executive Steering Committee Monthly Debrief",
      advisor: "Sarah Jenkins",
      advisorRole: "Managing Director",
      date: "Monday, Sep 28, 2026",
      time: "1:00 PM - 2:30 PM EST",
      duration: "90 min",
      type: "Quarterly Review",
      linkText: "Calendar Invite",
    },
  ];

  const deliverables: Deliverable[] = [
    {
      id: "del-1",
      title: "Executive Summary: FY26 Q3 Operational Efficiency Report",
      type: "PDF Report",
      fileSize: "8.4 MB",
      uploadedDate: "Sep 12, 2026",
      status: "Ready for Download",
    },
    {
      id: "del-2",
      title: "Comprehensive Strategic Financial Model & Sensitivity Analysis",
      type: "Financial Model",
      fileSize: "14.2 MB",
      uploadedDate: "Sep 08, 2026",
      status: "Approved",
    },
    {
      id: "del-3",
      title: "Global Supply Chain Vendor Risk & Redundancy Matrix",
      type: "Audit Matrix",
      fileSize: "5.1 MB",
      uploadedDate: "Aug 29, 2026",
      status: "Ready for Download",
    },
    {
      id: "del-4",
      title: "2026-2028 Digital Transformation Roadmap & Architecture Blueprint",
      type: "Roadmap",
      fileSize: "19.8 MB",
      uploadedDate: "Aug 15, 2026",
      status: "Approved",
    },
  ];

  const filteredEngagements = engagements.filter((e) => {
    if (filterStatus === "all") return true;
    return e.status.toLowerCase().replace(" ", "-") === filterStatus;
  });

  return (
    <div id="brivora-dashboard-app" className="min-h-screen bg-[#f8fafc] text-[#1d273a] font-sans antialiased">
      {/* Client scripts for navigation & image hydration */}
      <Script src="/nav-links.js" strategy="afterInteractive" />

      {/* Primary Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#ffffff] border-b border-[#dde4ee] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <img
                  referrerPolicy="no-referrer"
                  src="/public/logo.png"
                  alt="Brivora"
                  className="h-10 w-auto object-contain"
                  width={150}
                  height={40}
                />
              </Link>
              <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-[#165dfc] bg-[#eef6ff] px-2.5 py-1 rounded-full border border-[#badaff]">
                Client Portal
              </span>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-[15px] font-medium text-[#344056]">
              <Link href="/" className="px-3 py-2 rounded-md hover:text-[#165dfc] hover:bg-[#f1f5f9] transition-colors">
                Home
              </Link>
              <Link href="/about" className="px-3 py-2 rounded-md hover:text-[#165dfc] hover:bg-[#f1f5f9] transition-colors">
                About
              </Link>
              <Link href="/services" className="px-3 py-2 rounded-md hover:text-[#165dfc] hover:bg-[#f1f5f9] transition-colors">
                Services
              </Link>
              <Link href="/case-studies" className="px-3 py-2 rounded-md hover:text-[#165dfc] hover:bg-[#f1f5f9] transition-colors">
                Case Studies
              </Link>
              <Link href="/course" className="px-3 py-2 rounded-md hover:text-[#165dfc] hover:bg-[#f1f5f9] transition-colors">
                Courses
              </Link>
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-[#165dfc] font-semibold bg-[#eef6ff] transition-colors">
                Dashboard
              </Link>
              <Link href="/blog" className="px-3 py-2 rounded-md hover:text-[#165dfc] hover:bg-[#f1f5f9] transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="px-3 py-2 rounded-md hover:text-[#165dfc] hover:bg-[#f1f5f9] transition-colors">
                Contact
              </Link>
            </nav>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-[#0f172a]">Alexander Wright</span>
                <span className="text-xs text-[#64748b]">Apex Global Enterprises</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#101e4c] text-white flex items-center justify-center font-bold text-sm shadow">
                AW
              </div>
              <Link
                href="/login"
                className="text-xs font-semibold text-[#64748b] hover:text-[#cf2e2e] transition-colors border border-[#dde4ee] rounded-md px-2.5 py-1.5 hover:bg-[#f8fafc]"
                title="Sign out of portal"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Executive Welcome Hero */}
      <section className="bg-gradient-to-r from-[#101e4c] via-[#1238b5] to-[#165dfc] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-white/20 text-white px-3 py-0.5 rounded-full backdrop-blur-sm">
                  Executive Client Tier 1
                </span>
                <span className="text-xs text-blue-200">
                  Engagement Ref: #BRV-2026-984
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Executive Advisory Dashboard
              </h1>
              <p className="text-blue-100 text-base max-w-2xl">
                Real-time tracking of strategic consulting initiatives, milestone deliverables, advisory consultations, and organizational ROI metrics.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-quick-schedule"
                onClick={() => {
                  setSelectedSessionTopic("Ad-hoc Executive Strategy Briefing");
                  setBookingSuccess(true);
                  setTimeout(() => setBookingSuccess(false), 4000);
                }}
                className="bg-white text-[#101e4c] hover:bg-blue-50 transition-colors font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#165dfc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Advisory Session
              </button>
              <Link
                href="/course"
                className="bg-[#101e4c]/40 hover:bg-[#101e4c]/60 text-white border border-white/30 transition-colors font-medium px-4 py-2.5 rounded-lg text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Executive Courses
              </Link>
            </div>
          </div>

          {bookingSuccess && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-300/40 rounded-lg text-emerald-100 text-sm flex items-center justify-between">
              <span>Appointment request for <strong>{selectedSessionTopic}</strong> received. Your dedicated Partner will confirm via email within 2 hours.</span>
              <button onClick={() => setBookingSuccess(false)} className="text-xs text-white/80 hover:text-white underline">Dismiss</button>
            </div>
          )}
        </div>
      </section>

      {/* Main KPI Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-xl p-5 border border-[#dde4ee] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Initiatives</span>
              <span className="p-1.5 bg-[#eef6ff] text-[#165dfc] rounded-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0f172a]">4 Projects</div>
            <p className="text-xs text-[#00835b] mt-1.5 flex items-center gap-1 font-medium">
              <span>●</span> 2 in final delivery phase
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-5 border border-[#dde4ee] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Advisory Hours</span>
              <span className="p-1.5 bg-[#eef6ff] text-[#165dfc] rounded-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0f172a]">142 / 180 hrs</div>
            <div className="w-full bg-[#dde4ee] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-[#165dfc] h-full rounded-full" style={{ width: "79%" }} />
            </div>
            <span className="text-[11px] text-[#64748b] mt-1 block">38 hours remaining this quarter</span>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-5 border border-[#dde4ee] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Milestone Success Rate</span>
              <span className="p-1.5 bg-emerald-50 text-[#00835b] rounded-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0f172a]">86% Completed</div>
            <p className="text-xs text-[#00835b] mt-1.5 flex items-center gap-1 font-medium">
              <span>↑</span> 18 of 21 key deliverables verified
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl p-5 border border-[#dde4ee] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Estimated Value Created</span>
              <span className="p-1.5 bg-blue-50 text-[#165dfc] rounded-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0f172a]">$2.4M</div>
            <p className="text-xs text-[#00835b] mt-1.5 flex items-center gap-1 font-medium">
              <span>↑ 24.8%</span> operational efficiency gain
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Sections with Interactive Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#dde4ee] pb-4 mb-6 gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              id="tab-btn-engagements"
              onClick={() => setActiveTab("engagements")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "engagements"
                  ? "bg-[#101e4c] text-white shadow-sm"
                  : "text-[#47566b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              }`}
            >
              Active Engagements ({engagements.length})
            </button>
            <button
              id="tab-btn-sessions"
              onClick={() => setActiveTab("sessions")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "sessions"
                  ? "bg-[#101e4c] text-white shadow-sm"
                  : "text-[#47566b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              }`}
            >
              Consultations ({sessions.length})
            </button>
            <button
              id="tab-btn-deliverables"
              onClick={() => setActiveTab("deliverables")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "deliverables"
                  ? "bg-[#101e4c] text-white shadow-sm"
                  : "text-[#47566b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              }`}
            >
              Executive Deliverables ({deliverables.length})
            </button>
            <button
              id="tab-btn-metrics"
              onClick={() => setActiveTab("metrics")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "metrics"
                  ? "bg-[#101e4c] text-white shadow-sm"
                  : "text-[#47566b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              }`}
            >
              Strategic Roadmap
            </button>
          </div>

          {activeTab === "engagements" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#64748b]">Filter Status:</span>
              <select
                id="select-status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-[#dde4ee] rounded-md px-2.5 py-1.5 text-xs text-[#344056] outline-none font-medium"
              >
                <option value="all">All Engagements</option>
                <option value="in-progress">In Progress</option>
                <option value="under-review">Under Review</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: ENGAGEMENTS */}
        {activeTab === "engagements" && (
          <div className="space-y-4">
            {filteredEngagements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#dde4ee] p-6 shadow-sm hover:border-[#badaff] transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold bg-[#f1f5f9] text-[#47566b] px-2.5 py-1 rounded">
                        {item.category}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          item.status === "In Progress"
                            ? "bg-blue-50 text-[#165dfc] border border-blue-200"
                            : item.status === "Under Review"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Target Impact: {item.impactScore}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#0f172a]">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b]">
                      <div>
                        Lead Advisor: <strong className="text-[#344056]">{item.leadAdvisor}</strong> ({item.advisorRole})
                      </div>
                      <div>•</div>
                      <div>
                        Target Completion: <strong className="text-[#344056]">{item.dueDate}</strong>
                      </div>
                    </div>

                    <div className="text-xs text-[#47566b] bg-[#f8fafc] p-3 rounded-lg border border-[#dde4ee]">
                      <span className="font-semibold text-[#101e4c]">Active Milestone: </span>
                      {item.nextMilestone}
                    </div>
                  </div>

                  {/* Progress Ring / Bar */}
                  <div className="lg:w-64 flex flex-col justify-center space-y-2 bg-[#f8fafc] p-4 rounded-xl border border-[#dde4ee]">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-[#47566b]">Execution Progress</span>
                      <span className="text-[#165dfc]">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-[#dde4ee] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#165dfc] to-[#00bd7d] h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => alert(`Detailed roadmap and workstream log for "${item.title}" opened.`)}
                        className="text-xs font-semibold text-[#165dfc] hover:underline cursor-pointer"
                      >
                        View Workstreams →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SESSIONS */}
        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="bg-[#eef6ff] border border-[#badaff] rounded-xl p-4 text-xs text-[#101e4c] flex items-center justify-between">
              <span>All sessions include high-definition executive video conferencing, encrypted shared whiteboards, and automatic transcript synthesis.</span>
              <button
                onClick={() => {
                  setSelectedSessionTopic("Advisory Session Coordination");
                  setBookingSuccess(true);
                  setTimeout(() => setBookingSuccess(false), 4000);
                }}
                className="bg-[#165dfc] text-white font-semibold px-3 py-1.5 rounded-md hover:bg-[#1238b5] transition-colors whitespace-nowrap cursor-pointer"
              >
                + Request New Time
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className="bg-white rounded-xl border border-[#dde4ee] p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#165dfc] px-2.5 py-1 rounded">
                        {ses.type}
                      </span>
                      <span className="text-xs text-[#64748b]">{ses.duration}</span>
                    </div>

                    <h4 className="text-base font-bold text-[#0f172a] leading-snug">
                      {ses.topic}
                    </h4>

                    <div className="text-xs text-[#47566b] space-y-1">
                      <p className="font-semibold text-[#101e4c]">With {ses.advisor}</p>
                      <p className="text-[#64748b]">{ses.advisorRole}</p>
                      <div className="pt-2 border-t border-[#f1f5f9] mt-2">
                        <span className="block font-semibold text-[#0f172a]">{ses.date}</span>
                        <span className="text-[#64748b]">{ses.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#f1f5f9]">
                    <button
                      onClick={() => alert(`Starting video bridge for: "${ses.topic}"... Connecting to advisor room.`)}
                      className="w-full bg-[#165dfc] hover:bg-[#1238b5] text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {ses.linkText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERABLES */}
        {activeTab === "deliverables" && (
          <div className="bg-white rounded-xl border border-[#dde4ee] overflow-hidden shadow-sm">
            <div className="p-4 bg-[#f8fafc] border-b border-[#dde4ee] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0f172a]">Verified Deliverables & Strategic Briefings</h3>
              <span className="text-xs text-[#64748b]">Encrypted via AES-256</span>
            </div>

            <div className="divide-y divide-[#dde4ee]">
              {deliverables.map((doc) => (
                <div key={doc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f8fafc] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eef6ff] text-[#165dfc] flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0f172a]">{doc.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#64748b] mt-1">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span>Uploaded {doc.uploadedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-[#00835b] border border-emerald-200">
                      {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Downloading "${doc.title}" (${doc.fileSize}). File downloaded securely.`)}
                      className="text-xs font-semibold text-[#165dfc] bg-[#eef6ff] hover:bg-[#badaff] transition-colors px-3 py-1.5 rounded-lg border border-[#badaff] flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: METRICS & STRATEGIC ROADMAP */}
        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#dde4ee] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0f172a]">2026-2027 Strategic Roadmap Milestones</h3>
              <p className="text-xs text-[#64748b]">Overview of corporate phases defined during Brivora diagnostic phase.</p>

              <div className="relative pl-6 border-l-2 border-[#165dfc] space-y-6 pt-2">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#165dfc] border-2 border-white" />
                  <h4 className="text-sm font-bold text-[#0f172a]">Phase 1: Diagnostic & Opportunity Sizing (Completed)</h4>
                  <p className="text-xs text-[#64748b] mt-1">Full operational benchmark across 14 enterprise divisions. Completed with $2.4M identified savings.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#165dfc] border-2 border-white" />
                  <h4 className="text-sm font-bold text-[#0f172a]">Phase 2: Supply Chain Restructuring & AI Automation (In Progress)</h4>
                  <p className="text-xs text-[#64748b] mt-1">Vendor contract restructuring and automated warehouse inventory replenishment system rollout.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                  <h4 className="text-sm font-bold text-[#0f172a]">Phase 3: APAC Regional Expansion & Regulatory Approvals</h4>
                  <p className="text-xs text-[#64748b] mt-1">Target kickoff: Q1 2027. Application filing in Singapore & Tokyo commercial branches.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#dde4ee] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0f172a]">Executive Leadership Team Assigned</h3>
              <p className="text-xs text-[#64748b]">Your dedicated senior partners from Brivora Advisory.</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <div className="w-10 h-10 rounded-full bg-[#1238b5] text-white flex items-center justify-center font-bold text-xs">
                    MV
                  </div>
                  <div className="flex-1 text-xs">
                    <h5 className="font-bold text-[#0f172a]">Dr. Marcus Vance</h5>
                    <p className="text-[#64748b]">Senior Partner, Global Operations</p>
                  </div>
                  <span className="text-[11px] text-[#165dfc] font-semibold">Lead Partner</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <div className="w-10 h-10 rounded-full bg-[#00835b] text-white flex items-center justify-center font-bold text-xs">
                    ER
                  </div>
                  <div className="flex-1 text-xs">
                    <h5 className="font-bold text-[#0f172a]">Elena Rostova</h5>
                    <p className="text-[#64748b]">Principal Technology & AI Strategist</p>
                  </div>
                  <span className="text-[11px] text-[#47566b] font-medium">Technology Lead</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <div className="w-10 h-10 rounded-full bg-[#0d45e8] text-white flex items-center justify-center font-bold text-xs">
                    SJ
                  </div>
                  <div className="flex-1 text-xs">
                    <h5 className="font-bold text-[#0f172a]">Sarah Jenkins</h5>
                    <p className="text-[#64748b]">Managing Director, Organizational Governance</p>
                  </div>
                  <span className="text-[11px] text-[#47566b] font-medium">Governance Lead</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Prompt */}
        <div className="mt-12 bg-white rounded-xl border border-[#dde4ee] p-6 text-center space-y-3">
          <h3 className="text-lg font-bold text-[#0f172a]">Explore More from Brivora Strategic Advisory</h3>
          <p className="text-xs text-[#64748b] max-w-lg mx-auto">
            Review detailed case studies of previous client outcomes or browse executive courses available to your leadership cohort.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/services"
              className="px-4 py-2 text-xs font-semibold text-[#165dfc] bg-[#eef6ff] border border-[#badaff] rounded-lg hover:bg-[#badaff] transition-colors"
            >
              Consulting Services
            </Link>
            <Link
              href="/case-studies"
              className="px-4 py-2 text-xs font-semibold text-[#165dfc] bg-[#eef6ff] border border-[#badaff] rounded-lg hover:bg-[#badaff] transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="/course"
              className="px-4 py-2 text-xs font-semibold text-[#165dfc] bg-[#eef6ff] border border-[#badaff] rounded-lg hover:bg-[#badaff] transition-colors"
            >
              Executive Courses
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-xs font-semibold text-[#101e4c] bg-[#f1f5f9] border border-[#dde4ee] rounded-lg hover:bg-[#dde4ee] transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      {/* Footer matching Brivora standards */}
      <footer className="bg-[#0f172a] text-[#94a3b8] py-12 px-4 sm:px-6 lg:px-8 border-t border-[#1d273a] mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              referrerPolicy="no-referrer"
              src="/public/logo.png"
              alt="Brivora"
              className="h-9 w-auto brightness-200"
              width={140}
              height={36}
            />
            <span className="text-xs text-[#64748b]">| Client Advisory Portal</span>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link>
            <Link href="/course" className="hover:text-white transition-colors">Courses</Link>
            <Link href="/dashboard" className="text-[#53a3ff] font-semibold">Dashboard</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-[#64748b]">
            © {new Date().getFullYear()} Brivora Strategic Advisory. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
