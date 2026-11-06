// Read-only report on what is using space in the database.
//
// Run from the repo root, with DATABASE_URL in a local .env file:
//   node --env-file=.env scripts/db-insights.mjs
//
// Every query runs inside a READ ONLY transaction, so this script
// cannot change or delete anything.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real question IDs per form (from Form.questions and Section.questions)
const QUESTION_IDS = `
 SELECT f.id AS form_id, x->>'id' AS qid
 FROM "Form" f,
      jsonb_array_elements(CASE WHEN jsonb_typeof(f.questions) = 'array' THEN f.questions ELSE '[]' END) x
 UNION
 SELECT s."formId", x->>'id'
 FROM "Section" s,
      jsonb_array_elements(CASE WHEN jsonb_typeof(s.questions) = 'array' THEN s.questions ELSE '[]' END) x`

const report = [
 ['Database size', `
  SELECT pg_size_pretty(pg_database_size(current_database())) AS size`],

 ['Biggest tables', `
  SELECT relname AS "table", pg_size_pretty(pg_total_relation_size(relid)) AS size,
         n_live_tup::int AS rows, n_dead_tup::int AS dead_rows
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(relid) DESC
  LIMIT 8`],

 ['Responses per form', `
  SELECT f.title, f.slug, f.status::text AS status, count(r.id)::int AS responses,
         pg_size_pretty(coalesce(sum(pg_column_size(r.data) + pg_column_size(r.metadata)), 0)::bigint) AS size,
         to_char(max(r."createdAt"), 'YYYY-MM-DD HH24:MI') AS latest
  FROM "Form" f LEFT JOIN "Response" r ON r."formId" = f.id
  GROUP BY f.id
  ORDER BY coalesce(sum(pg_column_size(r.data) + pg_column_size(r.metadata)), 0) DESC
  LIMIT 15`],

 ['Responses per day (last 14 days, UTC)', `
  SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day, count(*)::int AS responses,
         pg_size_pretty(sum(pg_column_size(data) + pg_column_size(metadata))::bigint) AS size
  FROM "Response"
  WHERE "createdAt" > (now() at time zone 'utc') - interval '14 days'
  GROUP BY 1 ORDER BY 1`],

 ['Response groups (same groups as scripts/neon-cleanup.sql)', `
  WITH q AS (${QUESTION_IDS}),
  classified AS (
   SELECT pg_column_size(r.data) + pg_column_size(r.metadata) AS bytes,
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
  SELECT kind, count(*)::int AS responses, pg_size_pretty(sum(bytes)::bigint) AS size
  FROM classified GROUP BY kind ORDER BY sum(bytes) DESC`],

 ['10 largest responses', `
  SELECT r.id, f.slug AS form, to_char(r."createdAt", 'YYYY-MM-DD HH24:MI') AS created,
         pg_size_pretty(pg_column_size(r.data)::bigint) AS size,
         left(r.data::text, 60) AS start_of_data
  FROM "Response" r JOIN "Form" f ON f.id = r."formId"
  ORDER BY pg_column_size(r.data) DESC
  LIMIT 10`],
]

try {
 await prisma.$transaction(async (tx) => {
  await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
  for (const [title, sql] of report) {
   const rows = await tx.$queryRawUnsafe(sql)
   console.log(`\n== ${title} ==`)
   if (rows.length) console.table(rows)
   else console.log('(none)')
  }
 }, { timeout: 60_000 })
} catch (e) {
 console.error('Report failed:', e.message)
 process.exitCode = 1
} finally {
 await prisma.$disconnect()
}
