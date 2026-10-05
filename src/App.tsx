/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Header } from "./components/Header";
import { QASection } from "./components/QASection";
import { ExplanationSection } from "./components/ExplanationSection";
import { SummarySection } from "./components/SummarySection";
import { QuizSection } from "./components/QuizSection";
import { LearningPathSection } from "./components/LearningPathSection";
import { ScenarioPresets } from "./components/ScenarioPresets";
import { ProjectInfoBanner } from "./components/AboutModal";

export default function App() {
  const [viewMode, setViewMode] = useState<"all" | "tabs">("all");
  const [activeTab, setActiveTab] = useState("qa");

  // State keys to trigger re-renders or pre-fill with scenario values
  const [qaKey, setQaKey] = useState(0);
  const [qaInitial, setQaInitial] = useState("");

  const [explainKey, setExplainKey] = useState(0);
  const [explainInitial, setExplainInitial] = useState("");

  const [summaryKey, setSummaryKey] = useState(0);
  const [summaryInitial, setSummaryInitial] = useState("");

  const [quizKey, setQuizKey] = useState(0);
  const [quizInitial, setQuizInitial] = useState("");

  const [learnKey, setLearnKey] = useState(0);
  const [learnInitial, setLearnInitial] = useState("");

  // Refs for smooth scroll in "all" mode
  const qaRef = useRef<HTMLDivElement>(null);
  const explainRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const learnRef = useRef<HTMLDivElement>(null);

  const handleSelectScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case "scenario-1":
        setQaInitial("Which is the largest ocean?");
        setQaKey((k) => k + 1);
        if (viewMode === "tabs") {
          setActiveTab("qa");
        } else {
          qaRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "scenario-2":
        setQuizInitial("The Pythagoras Theorem");
        setQuizKey((k) => k + 1);
        if (viewMode === "tabs") {
          setActiveTab("quiz");
        } else {
          quizRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "scenario-3":
        setLearnInitial("SQL");
        setLearnKey((k) => k + 1);
        if (viewMode === "tabs") {
          setActiveTab("learn");
        } else {
          learnRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "scenario-4":
        setExplainInitial("Binary Search Algorithm");
        setExplainKey((k) => k + 1);
        if (viewMode === "tabs") {
          setActiveTab("explain");
        } else {
          explainRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "scenario-5":
        setSummaryInitial(
          "The Industrial Revolution, which began in the late 18th century, marked a profound shift from manual labor and agrarian economies to industrialized, machine-driven manufacturing. Innovations like James Watt's steam engine revolutionized transportation and factory production. Cities expanded rapidly as millions migrated for work. While this dramatically increased economic output and improved standards of living for many, it also sparked severe social challenges, including harsh factory conditions, child labor, and pollution."
        );
        setSummaryKey((k) => k + 1);
        if (viewMode === "tabs") {
          setActiveTab("summary");
        } else {
          summaryRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Navigation & Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 flex-1 w-full space-y-8">
        {/* Quick Scenario Preset Launcher */}
        <ScenarioPresets onSelectScenario={handleSelectScenario} />

        {/* View Mode: All Modules on One Page (Classic EduGenie Layout from PDF) */}
        {viewMode === "all" ? (
          <div className="space-y-8">
            <div ref={qaRef}>
              <QASection key={`qa-${qaKey}`} initialQuestion={qaInitial} />
            </div>

            <div ref={explainRef}>
              <ExplanationSection key={`exp-${explainKey}`} initialTopic={explainInitial} />
            </div>

            <div ref={summaryRef}>
              <SummarySection key={`sum-${summaryKey}`} initialText={summaryInitial} />
            </div>

            <div ref={quizRef}>
              <QuizSection key={`quiz-${quizKey}`} initialTopic={quizInitial} />
            </div>

            <div ref={learnRef}>
              <LearningPathSection key={`learn-${learnKey}`} initialTopic={learnInitial} />
            </div>
          </div>
        ) : (
          /* View Mode: Tabbed Studio View */
          <div className="transition-all">
            {activeTab === "qa" && (
              <QASection key={`qa-tab-${qaKey}`} initialQuestion={qaInitial} />
            )}
            {activeTab === "explain" && (
              <ExplanationSection key={`exp-tab-${explainKey}`} initialTopic={explainInitial} />
            )}
            {activeTab === "summary" && (
              <SummarySection key={`sum-tab-${summaryKey}`} initialText={summaryInitial} />
            )}
            {activeTab === "quiz" && (
              <QuizSection key={`quiz-tab-${quizKey}`} initialTopic={quizInitial} />
            )}
            {activeTab === "learn" && (
              <LearningPathSection key={`learn-tab-${learnKey}`} initialTopic={learnInitial} />
            )}
          </div>
        )}

        {/* Project Architecture & Submission Info */}
        <ProjectInfoBanner />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <p>
          EduGenie — AI-Powered Educational Assistant &bull; Built with Google Gemini &bull; SmartBridge & Smart Internz Project
        </p>
      </footer>
    </div>
  );
}
