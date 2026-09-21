/**
 * Translations now live behind Work -> Passage -> Translation. The API keeps
 * returning a flat object so callers see the source text and its rendering in
 * one place, with passageId/workId added so clients can group by identity
 * instead of by comparing strings.
 */

/** Everything a serialized translation needs loaded. */
export const translationInclude = {
  passage: {
    include: { work: true },
  },
  translator: {
    select: { id: true, name: true, email: true },
  },
  _count: {
    select: { comments: true },
  },
};

export function serializeTranslation(translation) {
  const { passage, translator } = translation;
  const work = passage.work;

  return {
    id: translation.id,

    // The passage, flattened in for convenience.
    passageId: passage.id,
    originalText: passage.text,
    position: passage.position,
    chapter: passage.chapter,
    pageNumber: passage.pageNumber,
    context: passage.context,

    // The work.
    workId: work.id,
    sourceName: work.title,
    sourceLanguage: work.language,

    // This person's rendering.
    translatedText: translation.text,
    targetLanguage: translation.targetLanguage,
    createdAt: translation.createdAt,
    createdDate: translation.createdAt.toLocaleDateString(),
    translatorId: translator.id,
    createdBy: translator.name || translator.email || 'Anonymous',

    likesCount: 0, // TODO: Implement likes system
    commentsCount: translation._count?.comments ?? 0,
    tags: [work.language, translation.targetLanguage],
  };
}

/** A passage plus every rendering of it -- the unit the reading view shows. */
export function serializePassage(passage) {
  return {
    id: passage.id,
    workId: passage.workId,
    text: passage.text,
    position: passage.position,
    chapter: passage.chapter,
    pageNumber: passage.pageNumber,
    context: passage.context,
    translations: (passage.translations || []).map((t) => ({
      id: t.id,
      translatedText: t.text,
      targetLanguage: t.targetLanguage,
      translatorId: t.translator?.id ?? t.translatorId,
      createdBy: t.translator ? t.translator.name || t.translator.email : undefined,
      createdAt: t.createdAt,
      commentsCount: t._count?.comments ?? 0,
    })),
  };
}

export function serializeWork(work, counts = {}) {
  return {
    id: work.id,
    title: work.title,
    language: work.language,
    passageCount: counts.passageCount ?? work._count?.passages ?? 0,
    translationCount: counts.translationCount ?? 0,
    createdAt: work.createdAt,
  };
}
