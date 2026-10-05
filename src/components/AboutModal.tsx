import React, { useState } from "react";
import { Info, ExternalLink, CheckCircle, ChevronDown, ChevronUp, Cpu, Server, Layout } from "lucide-react";

export const ProjectInfoBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                EduGenie: Google Gemini Powered Learning Assistant
              </h3>
              <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                SmartBridge / Smart Internz
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Submitted by: <strong className="text-slate-200">Tella Divya Sree</strong> | Mentor: <strong className="text-slate-200">Siri</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <span>{expanded ? "Hide Details" : "View Architecture & API Specs"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 font-bold text-blue-300 mb-2">
                <Cpu className="w-4 h-4" />
                <span>AI Model Pipeline</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Powered by <strong className="text-white">Google Gemini 3.8 Flash</strong> for cloud reasoning, structured JSON quiz generation, high-density summarization, and beginner-to-advanced learning roadmaps.
              </p>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 font-bold text-emerald-300 mb-2">
                <Server className="w-4 h-4" />
                <span>REST Endpoints</span>
              </div>
              <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
                <li>• <span className="text-emerald-400">POST /qa</span> - Question Answering</li>
                <li>• <span className="text-amber-400">POST /explain</span> - Concept Explanations</li>
                <li>• <span className="text-purple-400">POST /quiz</span> - 3-MCQ Quiz Generator</li>
                <li>• <span className="text-pink-400">POST /summarize</span> - Text Summarizer</li>
                <li>• <span className="text-indigo-400">POST /learn/recommendations</span></li>
              </ul>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 font-bold text-purple-300 mb-2">
                <Layout className="w-4 h-4" />
                <span>Core Capabilities</span>
              </div>
              <ul className="text-slate-300 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Real-time Interactive Quiz Runner</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Web Speech Voice Audio (TTS)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Copy, Retry, and Export Roadmaps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
