-- Splits the flat translations table into works -> passages -> translations.
--
-- Before: one row carried both the source sentence and one person's rendering
-- of it, so "several people translated this passage" was inferred by exact
-- string equality on original_text, and a book was the free-text source_name.
--
-- After: the source text lives once in passages, ordered by position within a
-- work; translations point at a passage. A passage can exist with no
-- translations, which is how an untranslated chapter is represented.

-- CreateTable
CREATE TABLE "works" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passages" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "chapter" TEXT,
    "page_number" INTEGER,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "work_id" INTEGER NOT NULL,

    CONSTRAINT "passages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "works_title_language_key" ON "works"("title", "language");

-- CreateIndex
CREATE INDEX "passages_work_id_idx" ON "passages"("work_id");

-- CreateIndex
CREATE UNIQUE INDEX "passages_work_id_position_key" ON "passages"("work_id", "position");

-- AddForeignKey
ALTER TABLE "passages" ADD CONSTRAINT "passages_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one work per (source_name, source_language). Rows with no
-- source_name collect under "Untitled" in their source language.
INSERT INTO "works" ("title", "language", "created_at", "updated_at")
SELECT DISTINCT
    COALESCE(NULLIF(BTRIM("source_name"), ''), 'Untitled'),
    "source_language",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "translations";

-- AlterTable
ALTER TABLE "translations" ADD COLUMN "passage_id" INTEGER;

-- Backfill: one passage per distinct original text within a work. Chapter,
-- page and context are taken from the earliest row that carried them, and
-- position follows today's read order: chapter number, then page, then id.
INSERT INTO "passages" ("work_id", "text", "position", "chapter", "page_number", "context", "created_at", "updated_at")
SELECT
    w."id",
    g."original_text",
    ROW_NUMBER() OVER (PARTITION BY w."id" ORDER BY g."chapter_ord", g."page_ord", g."min_id"),
    g."chapter",
    g."page_number",
    g."context",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT
        COALESCE(NULLIF(BTRIM("source_name"), ''), 'Untitled') AS "title",
        "source_language",
        "original_text",
        MIN("id") AS "min_id",
        (ARRAY_AGG("chapter" ORDER BY "id"))[1] AS "chapter",
        (ARRAY_AGG("page_number" ORDER BY "id"))[1] AS "page_number",
        (ARRAY_AGG("context" ORDER BY "id"))[1] AS "context",
        COALESCE(
            NULLIF(REGEXP_REPLACE(COALESCE((ARRAY_AGG("chapter" ORDER BY "id"))[1], ''), '\D', '', 'g'), ''),
            '2147483647'
        )::INTEGER AS "chapter_ord",
        COALESCE((ARRAY_AGG("page_number" ORDER BY "id"))[1], 2147483647) AS "page_ord"
    FROM "translations"
    GROUP BY 1, 2, 3
) g
JOIN "works" w
    ON w."title" = g."title"
   AND w."language" = g."source_language";

-- Link every translation to its passage.
UPDATE "translations" t
SET "passage_id" = p."id"
FROM "passages" p
JOIN "works" w ON w."id" = p."work_id"
WHERE w."title" = COALESCE(NULLIF(BTRIM(t."source_name"), ''), 'Untitled')
  AND w."language" = t."source_language"
  AND p."text" = t."original_text";

-- Refuse to drop the source columns if anything failed to match.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "translations" WHERE "passage_id" IS NULL) THEN
        RAISE EXCEPTION 'Aborting: % translation(s) could not be matched to a passage',
            (SELECT COUNT(*) FROM "translations" WHERE "passage_id" IS NULL);
    END IF;
END $$;

-- AlterTable
ALTER TABLE "translations" ALTER COLUMN "passage_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "translations_passage_id_idx" ON "translations"("passage_id");

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The source text now lives on the passage, so drop it from the translation.
ALTER TABLE "translations" RENAME COLUMN "translated_text" TO "text";

ALTER TABLE "translations"
    DROP COLUMN "original_text",
    DROP COLUMN "source_language",
    DROP COLUMN "source_name",
    DROP COLUMN "context",
    DROP COLUMN "chapter",
    DROP COLUMN "page_number";
