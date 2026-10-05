import React, { useState } from "react";
import { Compass, Sparkles, Copy, Check, Volume2, VolumeX, ArrowRight, Loader2, Download } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/speech";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface LearningPathSectionProps {
  initialTopic?: string;
}

export const LearningPathSection: React.FC<LearningPathSectionProps> = ({ initialTopic = "" }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleTopics = [
    "SQL",
    "Linear Regression",
    "Python for Beginners",
    "Web Development (HTML/CSS/JS)",
    "Data Structures & Algorithms",
  ];

  const handleRecommend = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = customTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch("/api/learn/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate learning path");
      }

      const data = await res.json();
      setRecommendation(data.recommendation);
      if (customTopic) setTopic(customTopic);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating learning path.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!recommendation) return;
    navigator.clipboard.writeText(recommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!recommendation) return;
    const blob = new Blob([recommendation], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `learning-path-${topic.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSpeech = () => {
    if (!recommendation) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(recommendation, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Get Learning Recommendations</h2>
          <p className="text-xs text-slate-500">Stepwise roadmap from beginner to advanced with timelines and resources</p>
        </div>
      </div>

      <form onSubmit={(e) => handleRecommend(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              id="learningTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. SQL or Linear Regression"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Path...</span>
              </>
            ) : (
              <>
                <span>Get Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400">Suggestions:</span>
          {sampleTopics.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTopic(t);
                handleRecommend(undefined, t);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg transition border border-slate-200"
            >
              {t}
            </button>
          ))}
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Result Container - matches Page 15-16 Fig. EDUGENIE */}
      {recommendation && (
        <div className="mt-6 border border-indigo-100 bg-indigo-50/30 rounded-xl p-5 md:p-6 relative transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100 mb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Learning Recommendations for "{topic}"
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeech}
                title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                  isSpeaking
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                title="Download Markdown"
                className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Roadmap"
                className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <MarkdownRenderer content={recommendation} />
          </div>
        </div>
      )}
    </div>
  );
};
