-- Neon cleanup for oversized / junk form responses.
--
-- Run in the Neon console -> SQL Editor, ONE STEP AT A TIME.
-- Steps 1 and 2 only read. Step 3 deletes; look at step 2's output first.
-- Deploy the /api/responses size limit BEFORE cleaning, or junk keeps arriving.

-- =====================================================================
-- STEP 1 - How big is the database, and which table is it?
-- =====================================================================
SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size;

SELECT relname AS table_name,
       pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;


-- =====================================================================
-- STEP 2 - Sort every response into a group and show the size of each
-- =====================================================================
--   junk: not an object  -> "data" is a string/array, the app never sends that
--   junk: no real answers -> none of its keys is a question on that form
--   inline file           -> old (Dec 2025) upload stored as base64 text
--   oversized             -> over 100 KB, the new limit
--   normal                -> keep
--
-- CAUTION: if you deleted or re-created questions on a form, real old
-- responses to those questions also show up as "junk: no real answers".
-- Run STEP 2b to look at them before deleting anything.
WITH q AS (
 SELECT f.id AS form_id, x->>'id' AS qid
 FROM "Form" f,
      jsonb_array_elements(CASE WHEN jsonb_typeof(f.questions) = 'array' THEN f.questions ELSE '[]' END) x
 UNION
 SELECT s."formId", x->>'id'
 FROM "Section" s,
      jsonb_array_elements(CASE WHEN jsonb_typeof(s.questions) = 'array' THEN s.questions ELSE '[]' END) x
),
classified AS (
 SELECT r.id, r."formId",
        pg_column_size(r.data) + pg_column_size(r.metadata) AS bytes,
        CASE
         WHEN jsonb_typeof(r.data) <> 'object' THEN 'junk: not an object'
         WHEN NOT EXISTS (
          SELECT 1 FROM jsonb_object_keys(r.data) k
          JOIN q ON q.form_id = r."formId" AND q.qid = k
         ) THEN 'junk: no real answers'
         WHEN r.data::text LIKE '%;base64,%' THEN 'inline file'
         WHEN octet_length(r.data::text) > 102400 THEN 'oversized'
         ELSE 'normal'
        END AS kind
 FROM "Response" r
)
SELECT kind, count(*) AS responses, pg_size_pretty(sum(bytes)) AS size
FROM classified
GROUP BY kind
ORDER BY sum(bytes) DESC;


-- STEP 2b - Peek at the junk rows (change the kind to look at other groups)
WITH q AS (
 SELECT f.id AS form_id, x->>'id' AS qid
 FROM "Form" f,
      jsonb_array_elements(CASE WHEN jsonb_typeof(f.questions) = 'array' THEN f.questions ELSE '[]' END) x
 UNION
 SELECT s."formId", x->>'id'
 FROM "Section" s,
      jsonb_array_elements(CASE WHEN jsonb_typeof(s.questions) = 'array' THEN s.questions ELSE '[]' END) x
)
SELECT r.id, f.title AS form, r."createdAt",
       pg_size_pretty(pg_column_size(r.data)::bigint) AS size,
       left(r.data::text, 150) AS start_of_data
FROM "Response" r
JOIN "Form" f ON f.id = r."formId"
WHERE jsonb_typeof(r.data) <> 'object'
   OR NOT EXISTS (
    SELECT 1 FROM jsonb_object_keys(r.data) k
    JOIN q ON q.form_id = r."formId" AND q.qid = k
   )
ORDER BY pg_column_size(r.data) DESC
LIMIT 50;


-- =====================================================================
-- STEP 3 - Delete junk and oversized responses
-- =====================================================================
-- Export any form's responses you want to keep first (Responses page -> Export).
-- Remove a group from the IN (...) list if step 2b showed real data in it.
WITH q AS (
 SELECT f.id AS form_id, x->>'id' AS qid
 FROM "Form" f,
      jsonb_array_elements(CASE WHEN jsonb_typeof(f.questions) = 'array' THEN f.questions ELSE '[]' END) x
 UNION
 SELECT s."formId", x->>'id'
 FROM "Section" s,
      jsonb_array_elements(CASE WHEN jsonb_typeof(s.questions) = 'array' THEN s.questions ELSE '[]' END) x
),
classified AS (
 SELECT r.id,
        CASE
         WHEN jsonb_typeof(r.data) <> 'object' THEN 'junk: not an object'
         WHEN NOT EXISTS (
          SELECT 1 FROM jsonb_object_keys(r.data) k
          JOIN q ON q.form_id = r."formId" AND q.qid = k
         ) THEN 'junk: no real answers'
         WHEN r.data::text LIKE '%;base64,%' THEN 'inline file'
         WHEN octet_length(r.data::text) > 102400 THEN 'oversized'
         ELSE 'normal'
        END AS kind
 FROM "Response" r
)
DELETE FROM "Response" r
USING classified c
WHERE r.id = c.id
  AND c.kind IN ('junk: not an object', 'junk: no real answers', 'oversized');


-- STEP 3b - Old inline files: keep the response, drop the file contents.
-- The responses page can't open these files anyway (it only reads "url").
-- The file itself is gone after this; ask for a migration script instead
-- if you need those files back.
UPDATE "Response" r
SET data = (
 SELECT jsonb_object_agg(
  e.key,
  CASE WHEN jsonb_typeof(e.value) = 'object' AND e.value ? 'content'
       THEN (e.value - 'content') || '{"fileRemoved": true}'
       ELSE e.value END)
 FROM jsonb_each(r.data) e
)
WHERE jsonb_typeof(r.data) = 'object'
  AND r.data::text LIKE '%;base64,%';


-- =====================================================================
-- STEP 4 - Give the space back, then re-run STEP 1 to see the new size
-- =====================================================================
-- Run this line on its own. If Neon refuses it because the project is
-- at its size limit, run `VACUUM "Response";` instead: the freed space
-- becomes reusable so new submissions save again, though the size shown
-- in the console won't drop.
VACUUM FULL "Response";
