"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, CircleX, Gem, LockKeyhole, ScrollText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { answerQuiz, getSpot, getSpotQuizzes } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useProgressStore } from "@/stores/progress-store";
import type { Quiz, QuizAnswerResult, QuizOption, Spot } from "@/types/domain";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowLink } from "@/components/ui/GlowButton";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SpotQuizPage() {
  const params = useParams<{ id: string }>();
  const spotId = Number(params.id);
  const { token } = useAuthStore();
  const applyQuizResult = useProgressStore((state) => state.applyQuizResult);
  const queryClient = useQueryClient();
  const [results, setResults] = useState<Record<number, QuizAnswerResult>>({});

  const { data: spot } = useQuery({
    queryKey: ["spot", spotId, token],
    queryFn: () => getSpot(spotId, token),
  });
  const { data: quizzes = [] } = useQuery({
    queryKey: ["spot-quizzes", spotId, token],
    queryFn: () => getSpotQuizzes(spotId, token),
  });

  const answer = useMutation({
    mutationFn: ({ quizId, selectedOption }: { quizId: number; selectedOption: QuizOption }) => {
      if (!token) {
        throw new Error("LOGIN_REQUIRED");
      }

      return answerQuiz(quizId, selectedOption, token);
    },
    onSuccess: (result) => {
      setResults((current) => ({ ...current, [result.quiz_id]: result }));
      applyQuizResult(result);
      if (result.is_correct) {
        queryClient.setQueryData<Spot>(["spot", spotId, token], (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            is_unlocked: true,
            unlocked_at: result.user_progress?.unlocked_at ?? current.unlocked_at,
            visited_at: result.user_progress?.visited_at ?? current.visited_at,
            user_progress: {
              ...current.user_progress,
              ...result.user_progress,
              is_unlocked: true,
              stamp_obtained: result.user_progress?.stamp_obtained ?? true,
            },
            stamp: current.stamp
              ? {
                  ...current.stamp,
                  ...result.stamp,
                  is_obtained: true,
                  obtained_at: result.stamp?.obtained_at ?? current.stamp.obtained_at,
                }
              : result.stamp ?? current.stamp,
            stamp_obtained: true,
            obtained_at: result.stamp?.obtained_at ?? current.obtained_at,
          };
        });
      }
      queryClient.setQueryData<Quiz[]>(["spot-quizzes", spotId, token], (current = []) =>
        current.map((quiz) =>
          quiz.id === result.quiz_id
            ? {
                ...quiz,
                answered_at: new Date().toISOString(),
                selected_option: result.selected_option,
                is_correct: result.is_correct,
              }
            : quiz,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["spot-quizzes", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      queryClient.invalidateQueries({ queryKey: ["stamps"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Link className="mb-5 inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-white" href={`/spots/${spotId}`}>
        <ArrowLeft className="h-4 w-4" />
        詳細へ戻る
      </Link>
      <PageHeader title={`${spot?.name ?? "神域"}の神話クイズ`} subtitle="神話と歴史の記憶を読み解き、正解して神力ポイントと御朱印を獲得します。" />
      {!token ? (
        <GlassPanel className="p-6">
          <LockKeyhole className="h-8 w-8 text-violet-100" />
          <h2 className="mt-4 text-2xl font-semibold text-white">ログインが必要です</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">クイズ報酬と御朱印を保存するため、旅人としてログインしてください。</p>
          <GlowLink className="mt-5" href="/login">ログインへ</GlowLink>
        </GlassPanel>
      ) : (
        <div className="grid gap-5">
          {quizzes.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              index={index}
              isPending={answer.isPending}
              onAnswer={(selectedOption) => answer.mutate({ quizId: quiz.id, selectedOption })}
              quiz={quiz}
              result={results[quiz.id]}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function QuizCard({
  quiz,
  index,
  result,
  isPending,
  onAnswer,
}: {
  quiz: Quiz;
  index: number;
  result?: QuizAnswerResult;
  isPending: boolean;
  onAnswer: (selectedOption: QuizOption) => void;
}) {
  const answered = Boolean(result) || Boolean(quiz.answered_at);
  const isCorrect = result?.is_correct ?? quiz.is_correct;
  const selected = result?.selected_option ?? quiz.selected_option;
  const explanation = result?.explanation ?? quiz.explanation;

  return (
    <GlassPanel glow={isCorrect === true} className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-cyan-100/70">MYTH QUIZ {index + 1}</p>
          <h2 className="mt-2 text-xl font-semibold leading-8 text-white">{quiz.question}</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-500/14 px-3 py-1 text-sm text-violet-100">
          <Gem className="h-4 w-4" />
          +{quiz.reward_points} pt
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(Object.entries(quiz.options) as Array<[QuizOption, string]>).map(([option, label]) => {
          const active = selected === option;

          return (
            <button
              key={option}
              className={cn(
                "min-h-14 rounded-[8px] border border-violet-300/20 bg-slate-950/45 px-4 text-left text-sm text-slate-100 transition hover:border-cyan-100/45 hover:bg-cyan-500/12 disabled:cursor-not-allowed",
                active && "border-violet-200/70 bg-violet-500/24 text-white",
              )}
              disabled={answered || isPending}
              onClick={() => onAnswer(option)}
              type="button"
            >
              <span className="mr-2 text-cyan-100">{option}.</span>
              {label}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className="mt-5 rounded-[8px] border border-violet-300/20 bg-slate-950/45 p-4">
          <div className={cn("flex items-center gap-2 text-sm font-semibold", isCorrect ? "text-cyan-100" : "text-rose-100")}>
            {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <CircleX className="h-5 w-5" />}
            {isCorrect ? "正解です" : "不正解です"}
            {result?.already_answered ? " / 回答済みのため報酬は重複しません" : null}
          </div>
          {explanation ? <p className="mt-3 text-sm leading-6 text-slate-300">{explanation}</p> : null}
          {result?.stamp_obtained ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-violet-100">
              <ScrollText className="h-4 w-4" />
              御朱印「{result.stamp?.name}」を獲得しました
            </p>
          ) : null}
        </div>
      ) : null}
    </GlassPanel>
  );
}
