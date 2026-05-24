import React, { useEffect, useMemo, useState } from "react";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  // ✅ DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // ✅ SYNC WITH LOCAL STORAGE
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };

    // Initial check
    handleThemeChange();

    // Listen for storage/theme changes
    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const steps = useMemo(
    () => [
      {
        id: 1,
        label: "Setup",
        title: "Configure your interview",
        desc: "Choose role, mode, and interview preferences.",
      },
      {
        id: 2,
        label: "Session",
        title: "Take the interview",
        desc: "Answer questions in a timed AI-powered interview round.",
      },
      {
        id: 3,
        label: "Report",
        title: "Review performance",
        desc: "Check feedback, score breakdown, and improvement areas.",
      },
    ],
    []
  );

  const currentStepData = steps.find((item) => item.id === step);

  const progressWidth = `${(step / steps.length) * 100}%`;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#070b11] text-white"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div
          className={`mb-8 rounded-[28px] border p-5 shadow-sm backdrop-blur transition-colors duration-300 sm:p-6 ${
            isDarkMode
              ? "border-white/10 bg-[#0f172a]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div
                className={`mb-3 inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  isDarkMode
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                Prepnexa AI interview workflow
              </div>

              <h1
                className={`text-2xl font-bold sm:text-3xl ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {currentStepData?.title}
              </h1>

              <p
                className={`mt-2 text-sm leading-relaxed sm:text-base ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {currentStepData?.desc}
              </p>
            </div>

            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                isDarkMode
                  ? "bg-white/5 text-slate-300"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <span
                className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Step {step}
              </span>{" "}
              of {steps.length}
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-6">
            <div
              className={`mb-4 h-2 w-full overflow-hidden rounded-full ${
                isDarkMode ? "bg-white/10" : "bg-slate-200"
              }`}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: progressWidth }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((item) => {
                const isActive = step === item.id;
                const isCompleted = step > item.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all duration-300 ${
                      isActive
                        ? isDarkMode
                          ? "border-emerald-400/20 bg-emerald-400/10"
                          : "border-emerald-200 bg-emerald-50"
                        : isCompleted
                        ? isDarkMode
                          ? "border-white/10 bg-[#111827]"
                          : "border-slate-200 bg-slate-100"
                        : isDarkMode
                        ? "border-white/10 bg-[#0f172a]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                          isActive
                            ? isDarkMode
                              ? "text-emerald-300"
                              : "text-emerald-700"
                            : isCompleted
                            ? isDarkMode
                              ? "text-slate-300"
                              : "text-slate-700"
                            : isDarkMode
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        {item.label}
                      </span>

                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-emerald-500 text-black"
                            : isCompleted
                            ? isDarkMode
                              ? "bg-white text-slate-900"
                              : "bg-slate-900 text-white"
                            : isDarkMode
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.id}
                      </div>
                    </div>

                    <p
                      className={`text-sm font-semibold ${
                        isActive || isCompleted
                          ? isDarkMode
                            ? "text-white"
                            : "text-slate-900"
                          : isDarkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        isActive || isCompleted
                          ? isDarkMode
                            ? "text-slate-400"
                            : "text-slate-600"
                          : isDarkMode
                          ? "text-slate-500"
                          : "text-slate-500"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <Step1SetUp
            isDarkMode={isDarkMode}
            onStart={(data) => {
              setInterviewData(data);
              setStep(2);
            }}
          />
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Step2Interview
            interviewData={interviewData}
            isDarkMode={isDarkMode}
            onFinish={(report) => {
              setInterviewData(report);
              setStep(3);
            }}
          />
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Step3Report
            report={interviewData}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
}

export default InterviewPage;
