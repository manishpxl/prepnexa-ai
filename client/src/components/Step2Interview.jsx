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
  const { interviewId, questions = [], userName, mode } =
    interviewData || {};

  const [hasStarted, setHasStarted] = useState(false);
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const answerRef = useRef("");
  const speakingRef = useRef(false);
  const utteranceRef = useRef(null);
  const finishingRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const videoSource =
    voiceGender === "male" ? maleVideo : femaleVideo;

  const totalQuestions = questions.length || 0;

  const progressPercent = totalQuestions
    ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
    : 0;

  const sectionLabel = useMemo(() => {
    const rawSection =
      currentQuestion?.section ||
      currentQuestion?.category ||
      "";

    if (rawSection) return rawSection;

    if (currentIndex === 0) return "Introduction";

    if ((mode || "").toLowerCase() === "hr")
      return "Behavioral Round";

    return "Technical Round";
  }, [currentQuestion, currentIndex, mode]);

  const statusLabel = useMemo(() => {
    if (isAIPlaying) return "AI speaking";

    if (
      isSubmitting ||
      isTransitioning ||
      isFinishing
    )
      return "Processing";

    if (!isMicOn) return "Mic paused";

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
      "webkitSpeechRecognition" in window ||
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

      if (!voices || !voices.length) return;

      const femaleVoice =
        voices.find((voice) => {
          const name = voice.name.toLowerCase();

          return (
            name.includes("zira") ||
            name.includes("samantha") ||
            name.includes("female")
          );
        }) ||
        voices.find((voice) =>
          voice.lang?.toLowerCase().includes("en")
        );

      const maleVoice = voices.find((voice) => {
        const name = voice.name.toLowerCase();

        return (
          name.includes("david") ||
          name.includes("mark") ||
          name.includes("male")
        );
      });

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

      utteranceRef.current = utterance;

      if (selectedVoice)
        utterance.voice = selectedVoice;

      utterance.lang =
        selectedVoice?.lang || "en-US";

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
          videoRef.current.currentTime = 0;

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
          utteranceRef.current = null;
          resolve();
        }, 250);
      };

      utterance.onerror = () => {
        speakingRef.current = false;

        setIsAIPlaying(false);

        setSubtitle("");

        videoRef.current?.pause?.();

        if (videoRef.current)
          videoRef.current.currentTime = 0;

        utteranceRef.current = null;

        resolve();
      };

      try {
        setTimeout(() => {
          try {
            window.speechSynthesis.speak(
              utterance
            );
          } catch {
            resolve();
          }
        }, 80);
      } catch {
        resolve();
      }
    });
  };

  useEffect(() => {
    if (!speechSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

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
        recognition.abort();
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
      !currentQuestion ||
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
    currentQuestion,
    feedback,
    isTransitioning,
  ]);

  const beginInterview = async () => {
    setError("");

    setHasStarted(true);

    await speakText(
      `Hi ${
        userName || "there"
      }, welcome to Prepnexa AI.`
    );

    await speakText(
      "Please answer clearly and keep your response structured."
    );

    setIsIntroPhase(false);

    setTimeout(async () => {
      if (questions[0]?.question) {
        await speakText(
          questions[0].question
        );
      }
    }, 400);
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
          "Please answer the current question before submitting."
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
            (currentQuestion.timeLimit || 60) -
              timeLeft
          ),
        },
        { withCredentials: true }
      );

      const receivedFeedback =
        result?.data?.feedback ||
        "Your answer has been submitted.";

      setFeedback(receivedFeedback);

      await speakText(receivedFeedback);

      if (
        currentIndex + 1 <
        questions.length
      ) {
        setTimeout(() => {
          setAnswer("");
          setFeedback("");
          setCurrentIndex(
            (prev) => prev + 1
          );
        }, 1500);
      } else {
        onFinish(result.data);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Answer submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors dark:bg-[#070b11] dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-colors dark:border-white/10 dark:bg-[#0b1118] dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
        >
          <div className="grid lg:grid-cols-[420px_minmax(0,1fr)]">
            <div className="border-b border-slate-200 dark:border-white/10 lg:border-b-0 lg:border-r">
              <div className="p-6 sm:p-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <HiSparkles />
                  Live interview
                </div>

                <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black">
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

                <div className="mt-5 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Progress
                      </p>

                      <p className="text-sm font-medium text-slate-800 dark:text-white/90">
                        {Math.min(
                          currentIndex + 1,
                          totalQuestions || 1
                        )}{" "}
                        / {totalQuestions}
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

                  <div className="grid grid-cols-2 gap-6 border-y border-slate-200 py-4 dark:border-white/10">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Section
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-white/90">
                        {sectionLabel}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Status
                      </p>

                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-500">
                        <FaWaveSquare className="text-[11px]" />
                        {statusLabel}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/8 dark:bg-white/5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Time remaining
                      </span>

                      <span className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <FaRegClock />
                        {currentQuestion?.timeLimit ||
                          60}
                        s limit
                      </span>
                    </div>

                    <div className="flex items-center justify-center rounded-[18px] bg-white px-4 py-5 dark:bg-[#06090f]">
                      <Timer
                        timeLeft={timeLeft}
                        totalTime={
                          currentQuestion?.timeLimit ||
                          60
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                    Answer each question clearly and stay concise.
                  </p>
                </div>

                {!hasStarted ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-6 dark:border-white/8 dark:bg-white/5">
                    <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                      Your interview is ready.
                    </p>

                    <button
                      onClick={beginInterview}
                      className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                    >
                      Begin Interview
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-white/8 dark:bg-white/5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Question{" "}
                          {currentIndex + 1} of{" "}
                          {questions.length}
                        </p>

                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                          {sectionLabel}
                        </span>
                      </div>

                      <div className="text-base font-semibold leading-8 text-slate-900 dark:text-white sm:text-[18px]">
                        {
                          currentQuestion?.question
                        }
                      </div>
                    </div>

                    <div className="pt-6">
                      <textarea
                        placeholder="Start speaking or type your answer here..."
                        onChange={(e) => {
                          setAnswer(
                            e.target.value
                          );

                          if (error)
                            setError("");
                        }}
                        value={answer}
                        disabled={
                          isSubmitting
                        }
                        className="h-[260px] w-full resize-none rounded-[20px] border border-slate-200 bg-white p-4 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 sm:h-[320px] sm:p-5 dark:border-white/8 dark:bg-[#0d141d] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                      />

                      {error && (
                        <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/5 dark:text-red-300">
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
                          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                        >
                          {isMicOn ? (
                            <FaMicrophone />
                          ) : (
                            <FaMicrophoneSlash />
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
                          className="flex-1 rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black"
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
