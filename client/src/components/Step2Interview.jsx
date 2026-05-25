import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

function Step2Interview({
  interviewData,
  onFinish,
}) {
  const {
    interviewId,
    questions = [],
    userName,
    mode,
  } = interviewData || {};

  // DARK MODE AUTO DETECT

  const isDarkMode =
    document.documentElement.classList.contains(
      "dark"
    );

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

  useEffect(() => {
    const speechRecognitionSupported =
      "webkitSpeechRecognition" in
        window ||
      "SpeechRecognition" in window;

    const speechSynthesisSupported =
      "speechSynthesis" in window;

    if (
      !speechRecognitionSupported ||
      !speechSynthesisSupported
    ) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    if (
      !speechSupported ||
      !window.speechSynthesis
    )
      return;

    const assignVoices = () => {
      const voices =
        window.speechSynthesis.getVoices();

      if (!voices || !voices.length)
        return;

      const femaleVoice =
        voices.find((voice) => {
          const name =
            voice.name.toLowerCase();

          return (
            name.includes("zira") ||
            name.includes("samantha") ||
            name.includes("female")
          );
        }) ||
        voices.find((voice) =>
          voice.lang
            ?.toLowerCase()
            .includes("en")
        );

      const maleVoice = voices.find(
        (voice) => {
          const name =
            voice.name.toLowerCase();

          return (
            name.includes("david") ||
            name.includes("mark") ||
            name.includes("male")
          );
        }
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
      } else if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
      } else {
        setSelectedVoice(voices[0]);
      }
    };

    assignVoices();

    window.speechSynthesis.onvoiceschanged =
      assignVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, [speechSupported]);

  const stopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const startMic = () => {
    if (
      !speechSupported ||
      !recognitionRef.current ||
      isAIPlaying ||
      !isMicOn ||
      isSubmitting ||
      isTransitioning ||
      isFinishing
    ) {
      return;
    }

    try {
      recognitionRef.current.start();
    } catch {}
  };

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (
        !speechSupported ||
        !window.speechSynthesis ||
        !text
      ) {
        resolve();
        return;
      }

      try {
        window.speechSynthesis.cancel();
      } catch {}

      const utterance =
        new SpeechSynthesisUtterance(
          text
            .replace(/,/g, ", ")
            .replace(/\./g, ". ")
        );

      utteranceRef.current =
        utterance;

      if (selectedVoice)
        utterance.voice =
          selectedVoice;

      utterance.lang =
        selectedVoice?.lang ||
        "en-US";

      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        speakingRef.current = true;

        setIsAIPlaying(true);

        stopMic();

        setSubtitle(text);

        videoRef.current
          ?.play?.()
          .catch(() => {});
      };

      utterance.onend = () => {
        speakingRef.current = false;

        setIsAIPlaying(false);

        videoRef.current?.pause?.();

        if (videoRef.current)
          videoRef.current.currentTime =
            0;

        if (
          isMicOn &&
          !isTransitioning &&
          !isSubmitting &&
          !isFinishing
        ) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");

          utteranceRef.current =
            null;

          resolve();
        }, 250);
      };

      utterance.onerror = () => {
        speakingRef.current = false;

        setIsAIPlaying(false);

        setSubtitle("");

        videoRef.current?.pause?.();

        utteranceRef.current = null;

        resolve();
      };

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(
            utterance
          );
        } catch {
          resolve();
        }
      }, 80);
    });
  };

  const theme = {
    page:
      "min-h-screen bg-transparent text-slate-900 dark:text-white",

    shell:
      "overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#0b1118] dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]",

    leftBorder:
      "border-b border-slate-200 dark:border-white/10 lg:border-b-0 lg:border-r",

    badge:
      "mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",

    videoWrap:
      "overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black",

    textarea:
      "h-[260px] w-full resize-none rounded-[20px] border border-slate-200 bg-white p-4 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white sm:h-[320px] sm:p-5 disabled:opacity-70 dark:border-white/8 dark:bg-[#0d141d] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:bg-[#101925]",
  };

  return (
    <div className={theme.page}>
      <div className="mx-auto max-w-6xl">

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

                <div className="mt-5">

                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">

                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Progress
                      </p>

                      <p className="text-sm font-medium">
                        {Math.min(
                          currentIndex +
                            1,
                          totalQuestions ||
                            1
                        )}{" "}
                        /{" "}
                        {totalQuestions}
                      </p>

                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">

                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                        }}
                      />

                    </div>
                  </div>

                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Time remaining
                      </span>

                      <span className="inline-flex items-center gap-2 text-xs text-slate-500">

                        <FaRegClock />

                        {currentQuestion?.timeLimit ||
                          60}
                        s

                      </span>

                    </div>

                    <div className="rounded-[18px] bg-white px-4 py-5 dark:bg-[#06090f]">

                      <Timer
                        timeLeft={
                          timeLeft
                        }
                        totalTime={
                          currentQuestion?.timeLimit ||
                          60
                        }
                        isDarkMode={
                          isDarkMode
                        }
                      />

                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="mx-auto max-w-2xl">

                <div className="mb-8 border-b border-slate-200 pb-6 dark:border-white/10">

                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-600 dark:text-emerald-400">
                    PREPNEXA AI
                  </p>

                  <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
                    Interview Session
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Answer each question
                    clearly and stay
                    concise.
                  </p>

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

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Your answer
                    </p>

                    <p className="text-xs text-slate-500">

                      {answer.trim()
                        .length}{" "}
                      characters

                    </p>

                  </div>

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
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
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
                      className="flex-1 rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
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
