import React, { useState } from "react";
import { ListChecks, Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, Loader2, Award } from "lucide-react";
import { QuizQuestion } from "../types";

interface QuizSectionProps {
  initialTopic?: string;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ initialTopic = "" }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checkedStatus, setCheckedStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTopics = [
    "Pythagoras theorem",
    "Solar System",
    "Newtonian Mechanics",
    "DNA & Genetics",
  ];

  const handleGenerate = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = customTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setUserAnswers({});
    setCheckedStatus({});

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate quiz");
      }

      const data = await res.json();
      if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
        throw new Error("No quiz questions generated.");
      }
      setQuestions(data.quiz);
      if (customTopic) setTopic(customTopic);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (checkedStatus[qIdx]) return; // locked once checked
    setUserAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleCheckAnswer = (qIdx: number) => {
    if (!userAnswers[qIdx]) return;
    setCheckedStatus((prev) => ({ ...prev, [qIdx]: true }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setCheckedStatus({});
  };

  // Calculate score
  const totalChecked = Object.keys(checkedStatus).length;
  const correctCount = questions.reduce((acc, q, idx) => {
    if (checkedStatus[idx] && userAnswers[idx]?.trim().toLowerCase() === q.answer?.trim().toLowerCase()) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <ListChecks className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Generate a Quiz</h2>
          <p className="text-xs text-slate-500">Test and validate your understanding with 3 interactive MCQs</p>
        </div>
      </div>

      <form onSubmit={(e) => handleGenerate(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              id="quizTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Pythagoras theorem or Solar System"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Quiz...</span>
              </>
            ) : (
              <>
                <span>Generate Quiz</span>
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
                handleGenerate(undefined, t);
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition border border-slate-200"
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

      {/* Result Container - matches Page 14 Fig. EDUGENIE Quiz Flow */}
      {questions.length > 0 && (
        <div className="mt-6 border border-emerald-100 bg-emerald-50/30 rounded-xl p-5 md:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-emerald-200/60 mb-5">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quiz: {topic}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Select your answer for each question and click Check Answer</p>
            </div>

            {totalChecked > 0 && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-full shadow-xs">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Score: {correctCount} / {questions.length}
                </span>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((q, qIdx) => {
              const isChecked = Boolean(checkedStatus[qIdx]);
              const selectedOption = userAnswers[qIdx];
              const isCorrect =
                isChecked &&
                selectedOption?.trim().toLowerCase() === q.answer?.trim().toLowerCase();

              return (
                <div
                  key={qIdx}
                  className={`bg-white rounded-xl p-5 border transition-all ${
                    isChecked
                      ? isCorrect
                        ? "border-emerald-300 ring-1 ring-emerald-200"
                        : "border-red-300 ring-1 ring-red-200"
                      : "border-slate-200 shadow-xs"
                  }`}
                >
                  {/* Question Title */}
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base leading-snug mb-3">
                    Q{qIdx + 1}: {q.question}
                  </h3>

                  {/* 4 Options */}
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedOption === opt;
                      const isThisCorrect =
                        opt.trim().toLowerCase() === q.answer.trim().toLowerCase();

                      let optionStyle =
                        "border-slate-200 hover:bg-slate-50 text-slate-700";

                      if (isChecked) {
                        if (isThisCorrect) {
                          optionStyle =
                            "border-emerald-400 bg-emerald-50 text-emerald-900 font-medium";
                        } else if (isSelected && !isThisCorrect) {
                          optionStyle =
                            "border-red-300 bg-red-50 text-red-800 line-through opacity-80";
                        } else {
                          optionStyle = "border-slate-200 opacity-60 text-slate-500";
                        }
                      } else if (isSelected) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50/60 text-emerald-900 font-medium";
                      }

                      return (
                        <label
                          key={oIdx}
                          onClick={() => handleSelectOption(qIdx, opt)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition ${optionStyle}`}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${qIdx}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleSelectOption(qIdx, opt)}
                            disabled={isChecked}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="leading-snug">{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Check Answer Button & Feedback (Matches Page 14) */}
                  {!isChecked ? (
                    <button
                      type="button"
                      onClick={() => handleCheckAnswer(qIdx)}
                      disabled={!selectedOption}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs rounded-lg transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {isCorrect ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-xs font-medium">
                          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Incorrect.</span> Correct answer:{" "}
                            <span className="font-bold underline">{q.answer}</span>
                          </div>
                        </div>
                      )}

                      {q.explanation && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <strong className="text-slate-700">Explanation: </strong>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
