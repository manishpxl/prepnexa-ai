import React, { useMemo, useState } from "react";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] =
    useState(null);

  // DARK MODE STATE
  const [isDarkMode, setIsDarkMode] =
    useState(() => {
      return (
        JSON.parse(
          localStorage.getItem("darkMode")
        ) || false
      );
    });

  // SAVE DARK MODE
  const toggleDarkMode = () => {
    const updated = !isDarkMode;

    setIsDarkMode(updated);

    localStorage.setItem(
      "darkMode",
      JSON.stringify(updated)
    );
  };

  const steps = useMemo(
    () => [
      {
        id: 1,
        title: "Setup",
        subtitle:
          "Configure your interview",
        desc: "Choose role, mode, and interview preferences.",
      },
      {
        id: 2,
        title: "Session",
        subtitle:
          "Take the interview",
        desc: "Answer questions in a timed AI-powered interview round.",
      },
      {
        id: 3,
        title: "Report",
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
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-[#030712] text-white"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* TOP BAR */}
      <div
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          isDarkMode
            ? "border-white/10 bg-[#030712]/80"
            : "border-slate-200 bg-white/80"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* LEFT */}
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                isDarkMode
                  ? "text-emerald-400"
                  : "text-emerald-600"
              }`}
            >
              PREPNEXA AI INTERVIEW WORKFLOW
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {currentStep?.subtitle}
            </h1>

            <p
              className={`mt-2 text-sm ${
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
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                isDarkMode
                  ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
              }`}
            >
              {isDarkMode
                ? "☀ Light"
                : "🌙 Dark"}
            </button>

            {/* STEP */}
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
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
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* STEP CARDS */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((item) => {
            const isActive =
              item.id === step;

            const isCompleted =
              item.id < step;

            return (
              <div
                key={item.id}
                className={`rounded-[24px] border p-6 transition-all duration-300 ${
                  isActive
                    ? isDarkMode
                      ? "border-emerald-400/30 bg-emerald-500/10"
                      : "border-emerald-200 bg-emerald-50"
                    : isDarkMode
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
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

                    <h3 className="mt-4 text-2xl font-bold">
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

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
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

      {/* MAIN STEP CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {step === 1 && (
          <Step1SetUp
            onNext={(data) => {
              setInterviewData(data);
              setStep(2);
            }}
            isDarkMode={isDarkMode}
          />
        )}

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

        {step === 3 && (
          <Step3Report
            interviewData={interviewData}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
}

export default InterviewPage;
