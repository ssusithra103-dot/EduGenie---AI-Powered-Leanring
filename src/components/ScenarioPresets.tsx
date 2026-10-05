import React from "react";
import { HelpCircle, Lightbulb, ListChecks, FileText, Compass, Sparkles } from "lucide-react";

interface ScenarioPresetsProps {
  onSelectScenario: (scenarioId: string) => void;
  activeModule?: string;
}

export const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({ onSelectScenario }) => {
  const scenarios = [
    {
      id: "scenario-1",
      badge: "Scenario 1 (Q&A)",
      title: "Which is the largest ocean?",
      icon: HelpCircle,
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80",
    },
    {
      id: "scenario-2",
      badge: "Scenario 2 (Quiz)",
      title: "The Pythagoras Theorem",
      icon: ListChecks,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80",
    },
    {
      id: "scenario-3",
      badge: "Scenario 3 (Roadmap)",
      title: "SQL Zero to Hero",
      icon: Compass,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/80",
    },
    {
      id: "scenario-4",
      badge: "Concept Explanation",
      title: "Binary Search Algorithm",
      icon: Lightbulb,
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80",
    },
    {
      id: "scenario-5",
      badge: "Text Summary",
      title: "The Industrial Revolution",
      icon: FileText,
      color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/80",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold tracking-wide uppercase text-slate-600">
          Try Verified Project Scenarios (SmartBridge / EduGenie)
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectScenario(sc.id)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition cursor-pointer ${sc.color}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-90 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span>{sc.badge}</span>
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-1">
                {sc.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
