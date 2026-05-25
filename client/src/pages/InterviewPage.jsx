import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

function InterviewPage() {
  const [step, setStep] = useState(1);

  const [interviewData, setInterviewData] =
    useState(null);

  // DARK MODE
  const [isDarkMode, setIsDarkMode] =
    useState(() => {
      return (
        JSON.parse(
          localStorage.getItem("darkMode")
        ) || false
      );
    });

  // BODY BG UPDATE
  useEffect(() => {
    document.body.className = isDarkMode
      ? "bg-[#020617]"
      : "bg-[#f8fafc]";
  }, [isDarkMode]);

  // TOGGLE
  const toggleDarkMode = () => {
    const updated = !isDarkMode;

    setIsDarkMode(updated);

    localStorage.setItem(
      "darkMode",
      JSON.stringify(updated)
    );
  };

  // STEPS
  const steps = useMemo(
    () => [
      {
        id: 1,
        title: "SETUP",
        subtitle:
          "Configure your interview",
        desc: "Choose role, mode, and interview preferences.",
      },
      {
        id: 2,
        title: "SESSION",
        subtitle:
          "Take the interview",
        desc: "Answer questions in a timed AI-powered interview round.",
      },
      {
        id: 3,
        title: "REPORT",
        subtitle:
          "Review performance",
        desc: "Check feedback, score breakdown, and improvement areas.",
      },
    ],
    []
  );

  const currentStep = steps.find(
    (item) => item.id === step
  );

  const progressPercent =
    ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#020617] via-[#071129] to-[#020617] text-white"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900"
      }`}
    >
      {/* TOP NAVBAR */}
      <div
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
          isDarkMode
            ? "border-white/10 bg-[#020617]/80 shadow-lg"
            : "border-slate-200 bg-white/80 shadow-sm"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* LEFT */}
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                isDarkMode
                  ? "text-emerald-400"
                  : "text-emerald-600"
              }`}
            >
              PREPNEXA AI INTERVIEW
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {currentStep?.subtitle}
            </h1>

            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              {currentStep?.desc}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* DARK MODE BUTTON */}
            <button
              onClick={toggleDarkMode}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                isDarkMode
                  ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                  : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
              }`}
            >
              {isDarkMode
                ? "☀ Light"
                : "🌙 Dark"}
            </button>

            {/* STEP */}
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                isDarkMode
                  ? "bg-white/10 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Step {step} of {steps.length}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div
          className={`h-1 ${
            isDarkMode
              ? "bg-white/10"
              : "bg-slate-200"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDarkMode
                ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                : "bg-gradient-to-r from-emerald-500 to-teal-500"
            }`}
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* STEP CARDS */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((item) => {
            const isActive =
              item.id === step;

            const isCompleted =
              item.id < step;

            return (
              <div
                key={item.id}
                className={`group rounded-[28px] border p-6 transition-all duration-300 hover:-translate-y-1 ${
                  isActive
                    ? isDarkMode
                      ? "border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.15)]"
                      : "border-emerald-200 bg-emerald-50 shadow-lg"
                    : isDarkMode
                    ? "border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,170,0.05)]"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-xl"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                        isDarkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {item.title}
                    </p>

                    <h3 className="mt-4 text-2xl font-bold leading-tight">
                      {item.subtitle}
                    </h3>

                    <p
                      className={`mt-3 text-sm leading-7 ${
                        isDarkMode
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  {/* NUMBER */}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      isCompleted
                        ? "bg-emerald-400 text-black"
                        : isActive
                        ? isDarkMode
                          ? "bg-white text-black"
                          : "bg-slate-900 text-white"
                        : isDarkMode
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          className={`rounded-[32px] border p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            isDarkMode
              ? "border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.3)]"
              : "border-slate-200 bg-white shadow-xl"
          }`}
        >
          {/* STEP 1 */}
          {step === 1 && (
            <Step1SetUp
              onNext={(data) => {
                setInterviewData(data);
                setStep(2);
              }}
              isDarkMode={isDarkMode}
            />
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <Step2Interview
              interviewData={interviewData}
              onFinish={(reportData) => {
                setInterviewData(reportData);
                setStep(3);
              }}
              isDarkMode={isDarkMode}
            />
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <Step3Report
              interviewData={interviewData}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;
