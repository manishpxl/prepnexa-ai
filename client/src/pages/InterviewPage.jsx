import React, { useMemo, useState } from "react";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

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
    <div className="min-h-screen bg-[#070b11] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Prepnexa AI interview workflow
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {currentStepData?.title}
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
                {currentStepData?.desc}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span className="font-semibold text-white">Step {step}</span> of{" "}
              {steps.length}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
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
                    className={`rounded-2xl border p-4 transition-all ${
                      isActive
                        ? "border-emerald-400/20 bg-emerald-400/10"
                        : isCompleted
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                          isActive
                            ? "text-emerald-300"
                            : isCompleted
                            ? "text-slate-300"
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
                            ? "bg-white text-slate-900"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {item.id}
                      </div>
                    </div>

                    <p
                      className={`text-sm font-semibold ${
                        isActive || isCompleted ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        isActive || isCompleted
                          ? "text-slate-400"
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

        {step === 1 && (
          <Step1SetUp
            onStart={(data) => {
              setInterviewData(data);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <Step2Interview
            interviewData={interviewData}
            isDarkMode={true}
            onFinish={(report) => {
              setInterviewData(report);
              setStep(3);
            }}
          />
        )}

        {step === 3 && <Step3Report report={interviewData} />}
      </div>
    </div>
  );
}

export default InterviewPage;
