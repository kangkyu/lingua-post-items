import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { workService } from '@/lib/api';
import { ChevronLeft, PlusCircle } from 'lucide-react';

const TARGET_LANGUAGE = 'ko';

// Consecutive passages sharing a chapter become one run, headed once.
const toChapterRuns = (passages) => {
  const runs = [];
  for (const passage of passages) {
    const last = runs[runs.length - 1];
    if (last && last.chapter === passage.chapter) last.passages.push(passage);
    else runs.push({ chapter: passage.chapter, passages: [passage] });
  }
  return runs;
};

const Shelf = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setWorks(await workService.getWorks(TARGET_LANGUAGE));
      } catch (err) {
        console.error('Failed to fetch works:', err);
        setError('작품을 불러오지 못했습니다. 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-center text-slate-500 py-12">불러오는 중…</p>;
  if (error) return <p className="text-center text-red-500 py-12">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-reader text-3xl text-slate-900">한국어로 읽기</h1>
        <p className="text-sm text-slate-500 mt-2">
          번역문만 모아 한 권의 책처럼 읽습니다. 아직 번역되지 않은 문장은 직접 옮길 수 있습니다.
        </p>
      </div>

      {works.length === 0 ? (
        <p className="text-slate-500 py-12 text-center">아직 등록된 원문이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {works.map((work) => (
            <li key={work.id}>
              <Link
                to={`/read/${work.id}`}
                className="flex items-baseline justify-between gap-4 py-5 group"
              >
                <span className="font-reader text-xl text-slate-900 group-hover:text-teal-700 transition-colors">
                  {work.title}
                </span>
                <span className="text-sm text-slate-400 shrink-0">
                  {work.translatedCount}/{work.passageCount}문장 번역됨
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const UntranslatedPassage = ({ passage, user }) => (
  <p className="mb-5 indent-[1em] text-[1.05rem] leading-[2] text-slate-400 italic">
    {passage.text}
    {user && (
      <Link
        to={`/share?passage=${passage.id}`}
        className="not-italic inline-flex items-center gap-1 ml-2 text-xs text-teal-600 hover:text-teal-700 align-middle"
      >
        <PlusCircle className="w-3 h-3" />
        번역하기
      </Link>
    )}
  </p>
);

const BookPage = ({ workId }) => {
  const { user } = useAuth();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setWork(await workService.getWork(workId, TARGET_LANGUAGE));
      } catch (err) {
        console.error('Failed to fetch work:', err);
        setError('그 작품을 찾을 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workId]);

  if (loading) return <p className="text-center text-slate-500 py-12">불러오는 중…</p>;

  if (error || !work) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-slate-500">{error || '작품을 찾을 수 없습니다.'}</p>
        <Link to="/read" className="text-teal-600 hover:underline text-sm mt-4 inline-block">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/read"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        목록
      </Link>

      <header className="text-center py-12 border-b border-slate-200 mb-12">
        <h1 className="font-reader text-4xl text-slate-900 leading-snug">{work.title}</h1>
        {work.translatedCount < work.passageCount && (
          <p className="text-xs text-slate-400 mt-4">
            {work.passageCount}문장 중 {work.translatedCount}문장 번역됨
          </p>
        )}
      </header>

      <article className="font-reader text-slate-900">
        {toChapterRuns(work.passages).map((run, runIndex) => (
          <section key={`${run.chapter || 'untitled'}-${runIndex}`} className="mb-14">
            {run.chapter && (
              <h2 className="text-center text-base tracking-[0.3em] text-slate-400 mb-10">
                {run.chapter}
              </h2>
            )}
            {run.passages.map((passage) => {
              // The first rendering is the reading text; the rest are
              // alternatives to compare on the translation's own page.
              const [reading, ...alternatives] = passage.translations;

              if (!reading) {
                return <UntranslatedPassage key={passage.id} passage={passage} user={user} />;
              }

              return (
                <p
                  key={passage.id}
                  className="text-[1.15rem] leading-[2.1] indent-[1em] mb-5 break-keep"
                >
                  <Link
                    to={`/translations/${reading.id}`}
                    state={{ from: `/read/${work.id}` }}
                    className="decoration-slate-300 underline-offset-[6px] hover:underline hover:text-teal-800 transition-colors"
                  >
                    {reading.translatedText}
                  </Link>
                  {alternatives.length > 0 && (
                    <Link
                      to={`/translations/${reading.id}`}
                      state={{ from: `/read/${work.id}` }}
                      className="ml-2 align-super text-[0.65rem] text-slate-400 hover:text-teal-600 no-underline"
                      title={`이 문장의 번역 ${passage.translations.length}개`}
                    >
                      +{alternatives.length}
                    </Link>
                  )}
                </p>
              );
            })}
          </section>
        ))}
      </article>

      <footer className="border-t border-slate-200 pt-6 pb-12 text-center">
        <p className="text-xs text-slate-400">{work.passageCount}문장</p>
      </footer>
    </div>
  );
};

const Read = () => {
  const { workId } = useParams();
  return workId ? <BookPage workId={workId} /> : <Shelf />;
};

export default Read;
