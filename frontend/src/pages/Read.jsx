import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { workService } from '@/lib/api';
import { ChevronLeft, PlusCircle } from 'lucide-react';

// The languages offered as pills. Any other code still works via ?lang= --
// add one here to give it a pill.
const TARGET_LANGUAGES = ['ko', 'en', 'es', 'fr'];

/**
 * The target language lives in the URL (?lang=ko) so a reading link carries
 * the language it was read in. There is no default: with no language the view
 * shows every translation, whatever language it is in, and a pill narrows it.
 */
const useTargetLanguage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const language = searchParams.get('lang') || '';

  // A language reached by ?lang= gets a pill too, so it can be switched away
  // from and back.
  const languages = language && !TARGET_LANGUAGES.includes(language)
    ? [...TARGET_LANGUAGES, language]
    : TARGET_LANGUAGES;

  const setLanguage = (code) => {
    const next = new URLSearchParams(searchParams);
    if (code) next.set('lang', code);
    else next.delete('lang');
    setSearchParams(next, { replace: true });
  };

  return { language, languages, setLanguage };
};

const languageQuery = (language) => (language ? `?lang=${encodeURIComponent(language)}` : '');

const LanguagePicker = ({ languages, language, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs text-slate-400 uppercase tracking-wider">Target</span>
    <button
      type="button"
      onClick={() => onChange('')}
      className={`px-2.5 py-1 rounded-md text-sm transition-colors ${
        language === ''
          ? 'bg-teal-50 text-teal-700 font-medium'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
      }`}
    >
      all
    </button>
    {languages.map((code) => (
      <button
        key={code}
        type="button"
        onClick={() => onChange(code)}
        className={`px-2.5 py-1 rounded-md text-sm transition-colors ${
          code === language
            ? 'bg-teal-50 text-teal-700 font-medium'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        {code}
      </button>
    ))}
  </div>
);

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

const Shelf = ({ language, languages, setLanguage }) => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setWorks(await workService.getWorks(language || undefined));
      } catch (err) {
        console.error('Failed to fetch works:', err);
        setError('Could not load works. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]);

  // With a language chosen, a work you cannot read a word of in that language
  // is noise; unfiltered, everything is worth listing.
  const visibleWorks = language ? works.filter((work) => work.translatedCount > 0) : works;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-reader text-3xl text-slate-900">
          {language ? `Read in ${language}` : 'Read translations'}
        </h1>
        <p className="text-sm text-slate-500 mt-2 mb-4">
          {language
            ? `The ${language} translations alone, read as a book. Passages nobody has translated yet are waiting for you.`
            : 'Every translation, in every language. Pick a target language to read one straight through.'}
        </p>
        <LanguagePicker languages={languages} language={language} onChange={setLanguage} />
      </div>

      {loading && <p className="text-center text-slate-500 py-12">Loading…</p>}
      {error && <p className="text-center text-red-500 py-12">{error}</p>}

      {!loading && !error && (
        visibleWorks.length === 0 ? (
          <p className="text-slate-500 py-12 text-center">
            {language
              ? `Nothing has been translated into ${language} yet.`
              : 'No source texts yet.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {visibleWorks.map((work) => (
              <li key={work.id}>
                <Link
                  to={`/read/${work.id}${languageQuery(language)}`}
                  className="flex items-baseline justify-between gap-4 py-5 group"
                >
                  <span className="font-reader text-xl text-slate-900 group-hover:text-teal-700 transition-colors">
                    {work.title}
                    <span className="ml-2 text-xs text-slate-400 font-sans">{work.language}</span>
                  </span>
                  <span className="text-sm text-slate-400 shrink-0">
                    {language
                      ? `${work.translatedCount}/${work.passageCount} translated`
                      : `${work.translationCount} translations · ${work.passageCount} passages`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};

const UntranslatedPassage = ({ passage, user, language }) => (
  <p className="mb-5 indent-[1em] text-[1.05rem] leading-[2] text-slate-400 italic">
    {passage.text}
    {user && (
      <Link
        to={`/share?passage=${passage.id}${language ? `&lang=${encodeURIComponent(language)}` : ''}`}
        className="not-italic inline-flex items-center gap-1 ml-2 text-xs text-teal-600 hover:text-teal-700 align-middle"
      >
        <PlusCircle className="w-3 h-3" />
        Translate
      </Link>
    )}
  </p>
);

const BookPage = ({ workId, language, languages, setLanguage }) => {
  const { user } = useAuth();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setWork(await workService.getWork(workId, language || undefined));
      } catch (err) {
        console.error('Failed to fetch work:', err);
        setError('That work could not be found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workId, language]);

  if (loading) return <p className="text-center text-slate-500 py-12">Loading…</p>;

  if (error || !work) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-slate-500">{error || 'Work not found.'}</p>
        <Link to="/read" className="text-teal-600 hover:underline text-sm mt-4 inline-block">
          Back to the list
        </Link>
      </div>
    );
  }

  const backTo = `/read/${work.id}${languageQuery(language)}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/read${languageQuery(language)}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All works
        </Link>
        <LanguagePicker languages={languages} language={language} onChange={setLanguage} />
      </div>

      <header className="text-center py-12 border-b border-slate-200 mb-12">
        <h1 className="font-reader text-4xl text-slate-900 leading-snug">{work.title}</h1>
        <p className="text-xs text-slate-400 mt-4">
          {work.language} → {language || 'any language'} · {work.translatedCount}/{work.passageCount} passages translated
        </p>
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
                return (
                  <UntranslatedPassage
                    key={passage.id}
                    passage={passage}
                    user={user}
                    language={language}
                  />
                );
              }

              return (
                <p
                  key={passage.id}
                  className="text-[1.15rem] leading-[2.1] indent-[1em] mb-5 break-keep"
                >
                  <Link
                    to={`/translations/${reading.id}`}
                    state={{ from: backTo }}
                    className="decoration-slate-300 underline-offset-[6px] hover:underline hover:text-teal-800 transition-colors"
                  >
                    {reading.translatedText}
                  </Link>
                  {/* Without a language filter the prose is mixed, so each
                      line says which language it is in. */}
                  {!language && (
                    <span className="ml-2 align-super text-[0.65rem] text-slate-400 font-sans">
                      {reading.targetLanguage}
                    </span>
                  )}
                  {alternatives.length > 0 && (
                    <Link
                      to={`/translations/${reading.id}`}
                      state={{ from: backTo }}
                      className="ml-1 align-super text-[0.65rem] text-slate-400 hover:text-teal-600 no-underline"
                      title={`${passage.translations.length} translations of this passage`}
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
        <p className="text-xs text-slate-400">{work.passageCount} passages</p>
      </footer>
    </div>
  );
};

const Read = () => {
  const { workId } = useParams();
  const { language, languages, setLanguage } = useTargetLanguage();

  return workId ? (
    <BookPage workId={workId} language={language} languages={languages} setLanguage={setLanguage} />
  ) : (
    <Shelf language={language} languages={languages} setLanguage={setLanguage} />
  );
};

export default Read;
