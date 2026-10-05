import React from "react";
import { GraduationCap, LayoutGrid, Layers, HelpCircle, Lightbulb, FileText, ListChecks, Compass } from "lucide-react";

interface HeaderProps {
  viewMode: "all" | "tabs";
  setViewMode: (mode: "all" | "tabs") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: "qa", label: "Q&A", icon: HelpCircle, color: "text-blue-600" },
    { id: "explain", label: "Explanation", icon: Lightbulb, color: "text-amber-600" },
    { id: "summary", label: "Summarize", icon: FileText, color: "text-purple-600" },
    { id: "quiz", label: "Quiz", icon: ListChecks, color: "text-emerald-600" },
    { id: "learn", label: "Learning Path", icon: Compass, color: "text-indigo-600" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome to EduGenie 🧠✨
                </h1>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Your personal AI tutor for learning support!
              </p>
            </div>
          </div>

          {/* View Mode Toggle: All-in-One vs Tabbed Focus */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                viewMode === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Modules (Full Page)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tabs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                viewMode === "tabs"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tabbed Studio</span>
            </button>
          </div>
        </div>

        {/* Tab Bar (Only when in Tabbed Mode) */}
        {viewMode === "tabs" && (
          <nav className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
