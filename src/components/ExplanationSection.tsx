import React, { useState } from "react";
import { Lightbulb, Sparkles, Copy, Check, Volume2, VolumeX, ArrowRight, Loader2 } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/speech";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ExplanationSectionProps {
  initialTopic?: string;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({ initialTopic = "" }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleTopics = [
    "Photosynthesis",
    "quantum computing",
    "Binary Search Algorithm",
    "Plate Tectonics",
  ];

  const handleExplain = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = customTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get explanation");
      }

      const data = await res.json();
      setExplanation(data.explanation);
      if (customTopic) setTopic(customTopic);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating explanation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!explanation) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(explanation, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Need an Explanation?</h2>
          <p className="text-xs text-slate-500">Break down complex topics into intuitive, easy-to-grasp concepts</p>
        </div>
      </div>

      <form onSubmit={(e) => handleExplain(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. quantum computing or Binary Search Algorithm"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <span>Explain</span>
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
                handleExplain(undefined, t);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-lg transition border border-slate-200"
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

      {/* Result Container - matches Page 13 Fig. EDUGENIE */}
      {explanation && (
        <div className="mt-6 border border-amber-100 bg-amber-50/40 rounded-xl p-5 relative transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100/80 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Explanation
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeech}
                title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                  isSpeaking
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Explanation"
                className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <MarkdownRenderer content={explanation} />
          </div>
        </div>
      )}
    </div>
  );
};
