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
  isDarkMode,
}) {
  const {
    interviewId,
    questions = [],
    userName,
    mode,
  } = interviewData || {};

  // DARK MODE FIX
  const darkMode =
    isDarkMode ??
    JSON.parse(
      localStorage.getItem("darkMode")
    ) ??
    false;

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

  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] =
    useState("");

  const [timeLeft, setTimeLeft] = useState(
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

  const [error, setError] = useState("");

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  const recognitionRef = useRef(null);

  const videoRef = useRef(null);

  const answerRef = useRef("");

  const speakingRef = useRef(false);

  const utteranceRef = useRef(null);

  const currentQuestion =
    questions[currentIndex];

  const videoSource =
    voiceGender === "male"
      ? maleVideo
      : femaleVideo;

  const totalQuestions =
    questions.length || 0;

  const progressPercent = totalQuestions
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
      (mode || "").toLowerCase() === "hr"
    )
      return "Behavioral Round";

    return "Technical Round";
  }, [currentQuestion, currentIndex, mode]);

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

      if (!voices.length) return;

      const femaleVoice =
        voices.find((voice) =>
          voice.name
            .toLowerCase()
            .includes("female")
        ) ||
        voices.find((voice) =>
          voice.name
            .toLowerCase()
            .includes("zira")
        ) ||
        voices[0];

      const maleVoice = voices.find(
        (voice) =>
          voice.name
            .toLowerCase()
            .includes("male")
      );

      setSelectedVoice(femaleVoice);

      if (maleVoice) {
        setVoiceGender("male");
      } else {
        setVoiceGender("female");
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
    )
      return;

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
        );

      utteranceRef.current = utterance;

      if (selectedVoice)
        utterance.voice = selectedVoice;

      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;

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

        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }

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
          resolve();
        }, 300);
      };

      utterance.onerror = () => {
        setIsAIPlaying(false);
        resolve();
      };

      setTimeout(() => {
        window.speechSynthesis.speak(
          utterance
        );
      }, 100);
    });
  };

  useEffect(() => {
    if (!speechSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = true;

    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[
          event.results.length - 1
        ][0].transcript?.trim() || "";

      if (transcript) {
        setAnswer((prev) =>
          prev
            ? `${prev} ${transcript}`
            : transcript
        );
      }
    };

    recognition.onend = () => {
      if (
        isMicOn &&
        !speakingRef.current &&
        !feedback &&
        !isSubmitting &&
        !isTransitioning &&
        !isFinishing
      ) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [
    speechSupported,
    isMicOn,
    feedback,
    isSubmitting,
    isTransitioning,
    isFinishing,
  ]);

  useEffect(() => {
    if (
      !hasStarted ||
      isIntroPhase ||
      !currentQuestion
    )
      return;

    setTimeLeft(
      currentQuestion.timeLimit || 60
    );
  }, [
    hasStarted,
    isIntroPhase,
    currentIndex,
    currentQuestion,
  ]);

  useEffect(() => {
    if (
      !hasStarted ||
      isIntroPhase ||
      feedback ||
      isTransitioning
    )
      return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    hasStarted,
    isIntroPhase,
    feedback,
    isTransitioning,
  ]);

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !isSubmitting &&
      !feedback
    ) {
      submitAnswer(true);
    }
  }, [timeLeft]);

  const beginInterview = async () => {
    setError("");

    setHasStarted(true);

    await speakText(
      `Hi ${
        userName || "there"
      }, welcome to Prepnexa AI Interview.`
    );

    await speakText(
      "Please answer clearly and confidently."
    );

    setIsIntroPhase(false);

    setTimeout(async () => {
      if (questions[0]?.question) {
        await speakText(
          questions[0].question
        );
      }
    }, 500);
  };

  const submitAnswer = async (
    isAutoSubmit = false
  ) => {
    if (
      isSubmitting ||
      !currentQuestion ||
      isTransitioning
    )
      return;

    if (!answerRef.current.trim()) {
      if (isAutoSubmit) {
        setAnswer("No answer provided.");
        answerRef.current =
          "No answer provided.";
      } else {
        setError(
          "Please answer before submitting."
        );
        return;
      }
    }

    stopMic();

    setError("");

    setIsSubmitting(true);

    try {
      const finalAnswer =
        answerRef.current.trim() ||
        "No answer provided.";

      const result = await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex: currentIndex,
          answer: finalAnswer,
          timeTaken: Math.max(
            0,
            (currentQuestion.timeLimit ||
              60) - timeLeft
          ),
        },
        {
          withCredentials: true,
        }
      );

      const receivedFeedback =
        result?.data?.feedback ||
        "Answer submitted successfully.";

      setFeedback(receivedFeedback);

      await speakText(receivedFeedback);

      if (
        currentIndex + 1 <
        questions.length
      ) {
        setIsTransitioning(true);

        await speakText(
          "Great. Let's move to the next question."
        );

        const nextIndex =
          currentIndex + 1;

        setCurrentIndex(nextIndex);

        setAnswer("");

        answerRef.current = "";

        setFeedback("");

        setTimeLeft(
          questions[nextIndex]
            ?.timeLimit || 60
        );

        setTimeout(async () => {
          await speakText(
            questions[nextIndex]
              ?.question
          );

          setIsTransitioning(false);
        }, 700);
      } else {
        setIsFinishing(true);

        await speakText(
          `Thank you ${
            userName || ""
          }. Your interview has been completed successfully.`
        );

        const finalReport =
          await axios.post(
            `${ServerUrl}/api/interview/finish`,
            { interviewId },
            {
              withCredentials: true,
            }
          );

        onFinish(finalReport.data);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Answer submission failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const theme = {
    page: darkMode
      ? "min-h-screen bg-[#070b11] text-white"
      : "min-h-screen bg-[#f8fafc] text-slate-900",

    shell: darkMode
      ? "overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1118] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      : "overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]",

    leftBorder: darkMode
      ? "border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10"
      : "border-b border-slate-200 lg:border-b-0 lg:border-r lg:border-slate-200",

    badge: darkMode
      ? "mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"
      : "mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700",
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
            <div className={theme.leftBorder}>
              <div className="p-6 sm:p-8">
                <div className={theme.badge}>
                  <HiSparkles />
                  Live interview
                </div>

                <div
                  className={`overflow-hidden rounded-[20px] ${
                    darkMode
                      ? "border border-white/10 bg-black"
                      : "border border-slate-200 bg-slate-100"
                  }`}
                >
                  <video
                    src={videoSource}
                    ref={videoRef}
                    muted
                    playsInline
                    preload="auto"
                    className="aspect-[4/4.7] w-full object-cover"
                  />
                </div>

                {subtitle && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={`mt-5 rounded-[18px] px-4 py-4 ${
                      darkMode
                        ? "border border-emerald-400/15 bg-emerald-500/5"
                        : "border border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        darkMode
                          ? "text-emerald-300"
                          : "text-emerald-700"
                      }`}
                    >
                      AI speaking
                    </p>

                    <p
                      className={`mt-2 text-sm leading-7 ${
                        darkMode
                          ? "text-emerald-100"
                          : "text-emerald-900"
                      }`}
                    >
                      {subtitle}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mx-auto max-w-2xl">
                <div
                  className={`mb-8 border-b pb-6 ${
                    darkMode
                      ? "border-white/10"
                      : "border-slate-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.26em] ${
                      darkMode
                        ? "text-emerald-400"
                        : "text-emerald-600"
                    }`}
                  >
                    PREPNEXA AI
                  </p>

                  <h2
                    className={`mt-3 text-[30px] font-semibold tracking-[-0.02em] ${
                      darkMode
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    Interview Session
                  </h2>
                </div>

                {!hasStarted ? (
                  <div
                    className={`rounded-[22px] p-6 ${
                      darkMode
                        ? "border border-white/8 bg-white/[0.025]"
                        : "border border-slate-200 bg-slate-50"
                    }`}
                  >
                    <button
                      onClick={
                        beginInterview
                      }
                      className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                    >
                      Begin Interview
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`rounded-[22px] p-5 sm:p-6 ${
                        darkMode
                          ? "border border-white/8 bg-white/[0.02]"
                          : "border border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          Question{" "}
                          {currentIndex + 1} of{" "}
                          {questions.length}
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            darkMode
                              ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {sectionLabel}
                        </span>
                      </div>

                      <div
                        className={`text-base font-semibold leading-8 sm:text-[18px] ${
                          darkMode
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {
                          currentQuestion?.question
                        }
                      </div>
                    </div>

                    <div className="pt-6">
                      <textarea
                        value={answer}
                        onChange={(e) =>
                          setAnswer(
                            e.target.value
                          )
                        }
                        placeholder="Start speaking or type your answer here..."
                        className={`h-[260px] w-full resize-none rounded-[20px] p-4 text-[15px] leading-7 outline-none transition sm:h-[320px] sm:p-5 ${
                          darkMode
                            ? "border border-white/8 bg-[#0d141d] text-white placeholder:text-slate-500"
                            : "border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                        }`}
                      />

                      {error && (
                        <div
                          className={`mt-4 rounded-[18px] px-4 py-4 text-sm ${
                            darkMode
                              ? "border border-red-400/20 bg-red-500/5 text-red-300"
                              : "border border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {error}
                        </div>
                      )}

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
                            darkMode
                              ? "border-white/10 bg-white/10 text-white hover:bg-white/15"
                              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          {isMicOn ? (
                            <FaMicrophone size={18} />
                          ) : (
                            <FaMicrophoneSlash
                              size={18}
                            />
                          )}
                        </motion.button>

                        <motion.button
                          onClick={() =>
                            submitAnswer(
                              false
                            )
                          }
                          whileTap={{
                            scale: 0.98,
                          }}
                          className={`flex-1 rounded-2xl py-3.5 text-sm font-semibold transition sm:text-base ${
                            darkMode
                              ? "bg-white text-black hover:bg-slate-100"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : "Submit Answer"}
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Step2Interview;
