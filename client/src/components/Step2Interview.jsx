import React, { useEffect, useMemo, useRef, useState } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaWaveSquare,
  FaRegClock,
} from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { HiSparkles } from "react-icons/hi2";

function Step2Interview({ interviewData, onFinish }) {

  const isDarkMode =
    document.documentElement.classList.contains(
      "dark"
    );

  // GLOBAL DARK MODE SYNC
  const isDarkMode =
    document.documentElement.classList.contains(
      "dark"
    );

  const {
    interviewId,
    questions = [],
    userName,
    mode,
  } = interviewData || {};

  const [hasStarted, setHasStarted] =
    useState(false);

  const [isIntroPhase, setIsIntroPhase] =
    useState(true);

  const [isMicOn, setIsMicOn] =
    useState(true);

  const [isAIPlaying, setIsAIPlaying] =
    useState(false);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [feedback, setFeedback] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState(
      questions[0]?.timeLimit || 60
    );

  const [selectedVoice, setSelectedVoice] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isFinishing, setIsFinishing] =
    useState(false);

  const [voiceGender, setVoiceGender] =
    useState("female");

  const [subtitle, setSubtitle] =
    useState("");

  const [error, setError] =
    useState("");

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  const recognitionRef = useRef(null);

  const videoRef = useRef(null);

  const answerRef = useRef("");

  const speakingRef = useRef(false);

  const utteranceRef = useRef(null);

  const finishingRef = useRef(false);

  const currentQuestion =
    questions[currentIndex];

  const videoSource =
    voiceGender === "male"
      ? maleVideo
      : femaleVideo;

  const totalQuestions =
    questions.length || 0;

  const progressPercent =
    totalQuestions
      ? Math.round(
          ((currentIndex + 1) /
            totalQuestions) *
            100
        )
      : 0;

  const sectionLabel = useMemo(() => {
    const rawSection =
      currentQuestion?.section ||
      currentQuestion?.category ||
      "";

    if (rawSection) return rawSection;

    if (currentIndex === 0)
      return "Introduction";

    if (
      (mode || "").toLowerCase() ===
      "hr"
    )
      return "Behavioral Round";

    return "Technical Round";
  }, [
    currentQuestion,
    currentIndex,
    mode,
  ]);

  const statusLabel = useMemo(() => {
    if (isAIPlaying)
      return "AI speaking";

    if (
      isSubmitting ||
      isTransitioning ||
      isFinishing
    )
      return "Processing";

    if (!isMicOn)
      return "Mic paused";

    return "Listening";
  }, [
    isAIPlaying,
    isSubmitting,
    isTransitioning,
    isFinishing,
    isMicOn,
  ]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  const theme = {
    page:
      "min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#070b11] dark:text-white",

    shell: isDarkMode
      ? "overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1118] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      : "overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]",

    leftBorder: isDarkMode
      ? "border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10"
      : "border-b border-slate-200 lg:border-b-0 lg:border-r lg:border-slate-200",

    badge: isDarkMode
      ? "mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"
      : "mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700",

    videoWrap: isDarkMode
      ? "overflow-hidden rounded-[20px] border border-white/10 bg-black"
      : "overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100",

    textarea: isDarkMode
      ? "h-[260px] w-full resize-none rounded-[20px] border border-white/8 bg-[#0d141d] p-4 text-[15px] leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:bg-[#101925] sm:h-[320px] sm:p-5 disabled:opacity-70"
      : "h-[260px] w-full resize-none rounded-[20px] border border-slate-200 bg-white p-4 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white sm:h-[320px] sm:p-5 disabled:opacity-70",
  };

  return (
    <div className={theme.page}>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className={theme.shell}
        >

          <div className="grid lg:grid-cols-[420px_minmax(0,1fr)]">

            {/* LEFT */}

            <div
              className={
                theme.leftBorder
              }
            >

              <div className="p-6 sm:p-8">

                <div
                  className={
                    theme.badge
                  }
                >
                  <HiSparkles />
                  Live interview
                </div>

                <div
                  className={
                    theme.videoWrap
                  }
                >

                  <video
                    src={videoSource}
                    key={videoSource}
                    ref={videoRef}
                    muted
                    playsInline
                    preload="auto"
                    className="aspect-[4/4.7] w-full object-cover"
                  />

                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="mx-auto max-w-2xl">

                <div className="mb-8">

                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-400">
                    PREPNEXA AI
                  </p>

                  <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.02em]">
                    Interview Session
                  </h2>

                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">

                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">

                      Question{" "}
                      {currentIndex +
                        1}{" "}
                      of{" "}
                      {questions.length}

                    </p>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">

                      {sectionLabel}

                    </span>

                  </div>

                  <div className="text-base font-semibold leading-8 text-slate-900 dark:text-white sm:text-[18px]">

                    {currentQuestion?.question}

                  </div>

                </div>

                <div className="pt-6">

                  <textarea
                    placeholder="Start speaking or type your answer here..."
                    onChange={(e) =>
                      setAnswer(
                        e.target.value
                      )
                    }
                    value={answer}
                    className={
                      theme.textarea
                    }
                  />

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">

                    <motion.button
                      onClick={() =>
                        setIsMicOn(
                          !isMicOn
                        )
                      }
                      whileTap={{
                        scale: 0.96,
                      }}
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition ${
                        isDarkMode
                          ? "border-white/10 bg-white/10 text-white"
                          : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >

                      {isMicOn ? (
                        <FaMicrophone
                          size={18}
                        />
                      ) : (
                        <FaMicrophoneSlash
                          size={18}
                        />
                      )}

                    </motion.button>

                    <motion.button
                      whileTap={{
                        scale: 0.98,
                      }}
                      className={`flex-1 rounded-2xl py-3.5 text-sm font-semibold transition ${
                        isDarkMode
                          ? "bg-white text-black"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      Submit Answer
                    </motion.button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}

export default Step2Interview;
