import React, { useState } from "react";
import { FileText, Sparkles, Copy, Check, Volume2, VolumeX, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/speech";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface SummarySectionProps {
  initialText?: string;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ initialText = "" }) => {
  const [text, setText] = useState(initialText);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const samplePassage =
    "The Industrial Revolution, which began in the late 18th century, marked a profound shift from manual labor and agrarian economies to industrialized, machine-driven manufacturing. Innovations like James Watt's steam engine revolutionized transportation and factory production. Cities expanded rapidly as millions migrated for work. While this dramatically increased economic output and improved standards of living for many, it also sparked severe social challenges, including harsh factory conditions, child labor, and pollution.";

  const handleSummarize = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || text;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to summarize text");
      }

      const data = await res.json();
      setSummary(data.summary);
      if (customText) setText(customText);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!summary) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(summary, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Summarize a Paragraph</h2>
          <p className="text-xs text-slate-500">Condense long educational texts into high-retention revision summaries</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSummarize(e)} className="space-y-3">
        <div className="space-y-2">
          <textarea
            id="summaryText"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste long content to summarize..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setText(samplePassage);
              handleSummarize(undefined, samplePassage);
            }}
            className="text-xs text-purple-700 hover:text-purple-800 flex items-center gap-1 font-medium bg-purple-50 hover:bg-purple-100/80 px-3 py-1.5 rounded-lg border border-purple-200 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Load Sample (The Industrial Revolution)</span>
          </button>

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <span>Summarize</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Result Container - matches Page 13 Fig. EDUGENIE */}
      {summary && (
        <div className="mt-6 border border-purple-100 bg-purple-50/40 rounded-xl p-5 relative transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100/80 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-purple-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Summary
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeech}
                title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                  isSpeaking
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Summary"
                className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <MarkdownRenderer content={summary} />
          </div>
        </div>
      )}
    </div>
  );
};
