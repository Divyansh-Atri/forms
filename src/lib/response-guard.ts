// Checks for public form submissions (POST /api/responses).
//
// That endpoint needs no login, and whatever it receives is stored as JSON in
// Postgres. Without these checks one request can put megabytes into the
// database, so every submission is size-capped, trimmed to the form's real
// questions, and refused if it carries a file inline instead of a Blob URL.

// A long-text answer is a few KB, so 100 KB leaves room for big forms.
export const MAX_RESPONSE_BYTES = 100 * 1024

// Files embedded as data URLs (e.g. "data:application/pdf;base64,...").
// Real uploads go through /api/upload and only store the Blob URL.
const INLINE_FILE = /data:[^"\s]*;base64,/

export type GuardResult =
 | { ok: true; data: Record<string, unknown> }
 | { ok: false; status: number; error: string }

export function byteLength(text: string): number {
 return new TextEncoder().encode(text).length
}

// Question IDs live in Form.questions and in each Section.questions.
export function collectQuestionIds(questionLists: unknown[]): Set<string> {
 const ids = new Set<string>()
 for (const list of questionLists) {
 if (!Array.isArray(list)) continue
 for (const question of list) {
 const id = (question as { id?: unknown } | null)?.id
 if (typeof id === 'string') ids.add(id)
 }
 }
 return ids
}

export function cleanResponseData(data: unknown, questionIds: Set<string>): GuardResult {
 if (!data || typeof data !== 'object' || Array.isArray(data)) {
 return { ok: false, status: 400, error: 'Invalid response data' }
 }

 // Keep only answers to questions that exist on this form
 const cleaned: Record<string, unknown> = {}
 for (const [key, value] of Object.entries(data)) {
 if (questionIds.has(key)) cleaned[key] = value
 }

 if (Object.keys(cleaned).length === 0) {
 return { ok: false, status: 400, error: 'Please answer at least one question' }
 }

 if (INLINE_FILE.test(JSON.stringify(cleaned))) {
 return { ok: false, status: 400, error: 'Files must be uploaded, not embedded in the response' }
 }

 return { ok: true, data: cleaned }
}
