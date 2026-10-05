import React, { useState } from "react";
import { HelpCircle, Sparkles, Copy, Check, Volume2, VolumeX, ArrowRight, Loader2 } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/speech";

interface QASectionProps {
  initialQuestion?: string;
  autoFocus?: boolean;
}

export const QASection: React.FC<QASectionProps> = ({ initialQuestion = "" }) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleQuestions = [
    "Which is the largest ocean?",
    "Why is the sky blue?",
    "What is Newton's third law of motion?",
    "How does photosynthesis produce oxygen?",
  ];

  const handleAsk = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = customQ || question;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get answer");
      }

      const data = await res.json();
      setAnswer(data.answer);
      if (customQ) setQuestion(customQ);
    } catch (err: any) {
      setError(err.message || "An error occurred while getting the answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!answer) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(answer, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ask EduGenie a Question</h2>
          <p className="text-xs text-slate-500">Get direct, factual, and student-friendly answers in seconds</p>
        </div>
      </div>

      <form onSubmit={(e) => handleAsk(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which is the largest ocean?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Get Answer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400">Suggestions:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(q);
                handleAsk(undefined, q);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg transition border border-slate-200"
            >
              {q}
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

      {/* Result Container - matches Page 12 Fig. EDUGENIE */}
      {answer && (
        <div className="mt-6 border border-blue-100 bg-blue-50/40 rounded-xl p-5 relative transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100/80 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Answer
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeech}
                title={isSpeaking ? "Stop Speaking" : "Read Answer Aloud"}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                  isSpeaking
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Answer"
                className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          <div className="prose prose-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};
