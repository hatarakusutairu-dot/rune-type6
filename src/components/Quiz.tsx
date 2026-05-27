import { useEffect, useMemo, useState } from 'react';
import { useRoom } from '../RoomContext';
import {
  judgeType,
  scoreAnswers,
  shuffledIndices,
  WORK1_ORDER,
  WORK2_ORDER,
  type Question,
} from '../lib/scoreUtils';
import { loadState, patchWork } from '../lib/storage';
import ResultCard from './ResultCard';

interface Props {
  workId: 1 | 2;
  questions: Question[];
}

export default function Quiz({ workId, questions }: Props) {
  const room = useRoom();
  const sid = room.sid ?? 'anon';

  const persisted = loadState();
  const persistedWork = workId === 1 ? persisted.work1 : persisted.work2;
  const initialAnswers = persistedWork?.answers ?? [];

  const [answers, setAnswers] = useState<number[]>(initialAnswers);
  const [index, setIndex] = useState<number>(Math.min(initialAnswers.length, Math.max(0, questions.length - 1)));
  const [submitted, setSubmitted] = useState<boolean>(
    !!(persistedWork?.mainType && persistedWork?.scores),
  );

  const total = questions.length;
  const order = workId === 1 ? WORK1_ORDER : WORK2_ORDER;

  // If we already submitted, skip the quiz UI.
  useEffect(() => {
    if (submitted) return;
    if (answers.length >= total && total > 0) {
      finalize(answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = questions[index];

  const shuffledOpts = useMemo(() => {
    if (!current) return [];
    const idx = shuffledIndices(current.options.length, sid, current.id);
    return idx.map((i) => ({ ...current.options[i], originalIndex: i }));
  }, [current, sid]);

  function choose(originalIndex: number) {
    const next = [...answers];
    next[index] = originalIndex;
    setAnswers(next);
    patchWork(workId, { answers: next });
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      finalize(next);
    }
  }

  function finalize(finalAnswers: number[]) {
    const scores = scoreAnswers(finalAnswers, questions);
    const { mainType, subType } = judgeType(scores, order);
    patchWork(workId, { answers: finalAnswers, scores, mainType, subType });
    room.send({
      type: 'S_WORK_RESULT',
      payload: {
        workId,
        scores: scores as never,
        mainType,
        subType,
      },
    });
    setSubmitted(true);
  }

  if (total === 0) {
    return (
      <div className="panel max-w-md w-full mx-auto text-center">
        <p className="text-white/70">
          診断問題は授業当日に配信されます。少々お待ちください。
        </p>
      </div>
    );
  }

  if (submitted) {
    const w = workId === 1 ? loadState().work1 : loadState().work2;
    if (w?.scores && w?.mainType) {
      return (
        <div className="space-y-3">
          <div className="panel text-center py-3">
            <p className="text-white/90 font-bold">送信完了！</p>
            <p className="text-white/60 text-xs mt-1">
              講師の合図まで、先に自分の結果を読んでおこう
            </p>
          </div>
          <ResultCard
            workId={workId}
            scores={w.scores}
            mainType={w.mainType}
            subType={w.subType ?? ''}
          />
        </div>
      );
    }
    return (
      <div className="panel max-w-md w-full mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">回答ありがとう！</h2>
        <p className="text-white/70">講師の合図で結果が表示されます。</p>
      </div>
    );
  }

  if (!current) return null;

  const progress = Math.round(((index + (answers[index] != null ? 1 : 0)) / total) * 100);

  return (
    <div className="panel max-w-lg w-full mx-auto">
      {workId === 2 && index === 0 && (
        <p className="text-white/70 text-xs mb-4 p-3 rounded bg-white/5 border border-white/10">
          ここからはチームでのピンチ場面を想像して答えてください。チーム経験がなくても大丈夫。
          『もしそうなったら自分はどうするかな？』と想像しながら、直感で選んでOKです。
        </p>
      )}

      <div className="flex justify-between text-sm text-white/60 mb-2">
        <span>第 {index + 1} 問 / {total} 問</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded mb-5">
        <div
          className="h-2 bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="text-lg font-bold mb-4 leading-relaxed">{current.text}</h3>

      <div className="space-y-2">
        {shuffledOpts.map((opt) => (
          <button
            key={opt.originalIndex}
            onClick={() => choose(opt.originalIndex)}
            className="w-full text-left rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:bg-white/15 px-4 py-3 transition"
          >
            {opt.text}
          </button>
        ))}
      </div>

      <p className="text-white/40 text-xs mt-5 text-center">
        一度選ぶと次の問題に進みます（戻れません）。
      </p>
    </div>
  );
}
