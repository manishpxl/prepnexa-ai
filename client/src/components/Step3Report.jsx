import React, { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaCheckCircle,
  FaChartLine,
  FaBolt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HiSparkles } from "react-icons/hi2";

function Step3Report({ report }) {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!report) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:55px_55px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_0_80px_rgba(16,185,129,0.08)] backdrop-blur-2xl">
            <div className="mx-auto mb-5 h-12 w-12 animate-pulse rounded-2xl bg-emerald-500/20" />
            <p className="text-lg font-semibold text-white">Loading report...</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Preparing your interview insights and final evaluation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((item, index) => ({
    name: `Q${index + 1}`,
    score: item?.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";
  let advice = "";
  let scoreColor = "#ef4444";

  if (finalScore >= 8) {
    performanceText = "You are interview-ready for strong opportunities.";
    shortTagline = "Excellent clarity, structure, and confidence.";
    advice =
      "Excellent performance. Keep refining your examples, maintain confidence, and continue practicing concise structured responses for real interviews.";
    scoreColor = "#10b981";
  } else if (finalScore >= 5) {
    performanceText = "You have a solid base with room for refinement.";
    shortTagline = "Good foundation, improve precision and delivery.";
    advice =
      "Good foundation shown. Improve answer structure, speaking flow, and supporting examples. Practice delivering concise and more confident responses.";
    scoreColor = "#f59e0b";
  } else {
    performanceText = "You need more focused practice before real interviews.";
    shortTagline = "Work on clarity, structure, and confidence.";
    advice =
      "Significant improvement is needed. Focus on structured thinking, clearer explanations, and stronger confidence. Practice answering aloud consistently.";
    scoreColor = "#ef4444";
  }

  const percentage = Math.min((finalScore / 10) * 100, 100);
  const hasQuestions = questionWiseScore.length > 0;

  const safeQuestionIndex = hasQuestions
    ? Math.min(currentQuestionIndex, questionWiseScore.length - 1)
    : 0;

  const currentQuestion = hasQuestions
    ? questionWiseScore[safeQuestionIndex]
    : null;

  const currentQuestionNumber = safeQuestionIndex + 1;

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) =>
      Math.min(prev + 1, questionWiseScore.length - 1)
    );
  };

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 18;

    const addFooter = (pageNumber, totalPages) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Page ${pageNumber} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    };

    const addWrappedText = (
      text,
      x,
      y,
      maxWidth,
      lineHeight = 5.5,
      fontSize = 10.5,
      color = [75, 85, 99]
    ) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      const split = doc.splitTextToSize(text || "", maxWidth);
      doc.text(split, x, y);
      return split.length * lineHeight;
    };

    doc.setFillColor(8, 15, 26);
    doc.rect(0, 0, pageWidth, 36, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text("Prepnexa AI Interview Report", pageWidth / 2, 16, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text("AI-generated interview performance summary", pageWidth / 2, 24, {
      align: "center",
    });

    currentY = 44;

    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin, currentY, contentWidth, 24, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(17, 24, 39);
    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 9, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(75, 85, 99);
    doc.text(shortTagline, pageWidth / 2, currentY + 17, {
      align: "center",
    });

    currentY += 32;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("Performance Summary", margin, currentY);

    currentY += 7;

    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 22, 4, 4, "FD");

    doc.setFont("helvetica", "normal");
    currentY += 8;
    const perfHeight = addWrappedText(
      performanceText,
      margin + 8,
      currentY,
      contentWidth - 16,
      5.5,
      11,
      [31, 41, 55]
    );

    currentY += Math.max(perfHeight + 10, 22);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Metric", "Score"]],
      body: [
        ["Confidence", `${confidence}/10`],
        ["Communication", `${communication}/10`],
        ["Correctness", `${correctness}/10`],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [55, 65, 81],
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.65 },
        1: { halign: "center" },
      },
    });

    currentY = doc.lastAutoTable.finalY + 12;

    if (currentY > pageHeight - 70) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("Professional Advice", margin, currentY);

    currentY += 6;

    const adviceLines = doc.splitTextToSize(advice, contentWidth - 16);
    const adviceBoxHeight = Math.max(24, adviceLines.length * 5.5 + 12);

    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, currentY, contentWidth, adviceBoxHeight, 4, 4, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(75, 85, 99);
    doc.text(adviceLines, margin + 8, currentY + 8);

    currentY += adviceBoxHeight + 12;

    if (currentY > pageHeight - 90) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("Question-wise Review", margin, currentY);

    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q?.question || "Question not available",
        `${q?.score ?? 0}/10`,
        q?.feedback?.trim() || "No feedback available",
      ]),
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        valign: "top",
        overflow: "linebreak",
        textColor: [55, 65, 81],
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      rowPageBreak: "avoid",
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 68 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: "auto" },
      },
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i += 1) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    const cleanDate = new Date().toISOString().slice(0, 10);
    doc.save(`Prepnexa_Interview_Report_${cleanDate}.pdf`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:55px_55px]" />

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate("/history")}
                className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                <FaArrowLeft />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
                  <HiSparkles />
                  PREPNEXA AI REPORT
                </div>

                <h1 className="mt-4 text-3xl font-bold text-white sm:text-[36px]">
                  Interview Performance Report
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                  A clear summary of your interview performance, strengths, and
                  areas to improve before your next round.
                </p>
              </div>
            </div>

            <button
              onClick={downloadPDF}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] sm:text-base"
            >
              <FaDownload size={14} />
              Download PDF
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-[0_0_80px_rgba(16,185,129,0.08)] backdrop-blur-2xl sm:p-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1.2fr_320px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                  <FaChartLine className="text-[11px]" />
                  Performance Summary
                </div>

                <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  {performanceText}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                  {shortTagline}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      Confidence
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {confidence}/10
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      Communication
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {communication}/10
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      Correctness
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {correctness}/10
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full max-w-[280px] rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Final Score
                  </p>

                  <div className="mx-auto mt-5 h-36 w-36">
                    <CircularProgressbar
                      value={percentage}
                      text={`${finalScore}/10`}
                      styles={buildStyles({
                        textSize: "16px",
                        pathColor: scoreColor,
                        textColor: "#ffffff",
                        trailColor: "rgba(255,255,255,0.12)",
                      })}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    Overall interview outcome based on your full session.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-2xl"
            >
              <h3 className="text-lg font-semibold text-white">Skill Evaluation</h3>

              <div className="mt-6 space-y-5">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">
                        {skill.label}
                      </span>
                      <span className="text-sm font-semibold text-emerald-400">
                        {skill.value}/10
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        style={{ width: `${Math.min(skill.value * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[24px] bg-slate-950/80 p-5 text-white">
                <div className="flex items-center gap-2">
                  <FaBolt className="text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                    AI Insight
                  </p>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">{advice}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-2xl"
            >
              <h3 className="text-lg font-semibold text-white">Performance Trend</h3>

              <p className="mt-2 text-sm text-slate-400">
                Score movement across each interview question.
              </p>

              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={questionScoreData}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                      tickLine={{ stroke: "rgba(255,255,255,0.10)" }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                      tickLine={{ stroke: "rgba(255,255,255,0.10)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.10)",
                        backgroundColor: "#0f172a",
                        color: "#e2e8f0",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      fill="url(#scoreFill)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-2xl sm:p-7"
          >
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Question Review</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Review one question at a time with focused feedback.
                </p>
              </div>

              {hasQuestions && (
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-300">
                  {currentQuestionNumber} / {questionWiseScore.length}
                </div>
              )}
            </div>

            {hasQuestions ? (
              <div className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-4xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Question {currentQuestionNumber}
                    </p>

                    <p className="mt-3 text-base font-semibold leading-8 text-white sm:text-[17px]">
                      {currentQuestion?.question || "Question not available"}
                    </p>
                  </div>

                  <div className="inline-flex items-center self-start rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-300">
                    {currentQuestion?.score ?? 0}/10
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-400" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">
                      AI Feedback
                    </p>
                  </div>

                  <p className="max-w-4xl text-sm leading-8 text-slate-300">
                    {currentQuestion?.feedback?.trim()
                      ? currentQuestion.feedback
                      : "No feedback available for this question."}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={safeQuestionIndex === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <FaChevronLeft size={12} />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={safeQuestionIndex === questionWiseScore.length - 1}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Next
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-6 text-sm text-slate-400">
                No question-level breakdown is available for this report.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Step3Report;