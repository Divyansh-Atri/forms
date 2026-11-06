// Rules for "File upload" questions, shared by the browser and the server.
//
// Files are stored in Postgres (Neon). Vercel rejects any request over
// ~4.5 MB, so files travel in CHUNK_BYTES pieces; the free Neon plan has
// 1 GB in total, so uploads also have an overall budget (see /api/upload).

/** Hard cap per file. Builders can set a lower limit, never a higher one. */
export const MAX_FILE_MB = 20
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

/** Size of each upload piece: comfortably under Vercel's 4.5 MB request limit. */
export const CHUNK_BYTES = 3 * 1024 * 1024

export function chunkCount(size: number) {
 return Math.max(1, Math.ceil(size / CHUNK_BYTES))
}

/** Exact byte length piece `index` of a file of `size` bytes must have. */
export function chunkLength(size: number, index: number) {
 const last = chunkCount(size) - 1
 return index < last ? CHUNK_BYTES : size - CHUNK_BYTES * last
}

/** Most files one question can take. */
export const MAX_FILES_PER_QUESTION = 10

/** Answer stored in Response.data for a file question (always an array). */
export interface StoredFile {
 id: string
 name: string
 size: number
 type: string
 url: string
}

export function fileUrl(id: string) {
 return `/api/files/${id}`
}

/** fileUpload / FILE_UPLOAD / file_upload / file all count. */
export function isFileQuestionType(type: unknown): boolean {
 if (typeof type !== 'string') return false
 const t = type.toLowerCase().replace(/[\s_-]/g, '')
 return t === 'fileupload' || t === 'file'
}

interface FileQuestionLike {
 maxFileSize?: unknown
 max?: unknown
 maxFiles?: unknown
 allowedTypes?: unknown
}

// Shorthands builders can type instead of MIME types
const TYPE_GROUPS: Record<string, string[]> = {
 image: ['image/*'],
 images: ['image/*'],
 photo: ['image/*'],
 photos: ['image/*'],
 video: ['video/*'],
 videos: ['video/*'],
 audio: ['audio/*'],
 pdf: ['.pdf', 'application/pdf'],
 document: ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'],
 documents: ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'],
 spreadsheet: ['.xls', '.xlsx', '.ods', '.csv'],
 spreadsheets: ['.xls', '.xlsx', '.ods', '.csv'],
}

// For "image/*" style rules the file name has to fit too, so a page saved
// as evil.html can't get in by claiming to be image/png
const WILDCARD_EXTENSIONS: Record<string, string[]> = {
 'image/': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif', 'bmp', 'tif', 'tiff'],
 'video/': ['mp4', 'mov', 'webm', 'm4v', 'avi', 'mkv', '3gp'],
 'audio/': ['mp3', 'm4a', 'wav', 'ogg', 'aac', 'flac', 'opus', 'webm'],
}

function positiveInt(value: unknown): number | null {
 const n = typeof value === 'string' ? Number(value) : value
 return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : null
}

/** Turn "pdf, jpg, images" or ["image/*"] into accept tokens. */
function acceptTokens(allowed: unknown): string[] {
 const list = Array.isArray(allowed)
 ? allowed
 : typeof allowed === 'string' ? allowed.split(',') : []
 const tokens: string[] = []
 for (const raw of list) {
 if (typeof raw !== 'string') continue
 const t = raw.trim().toLowerCase()
 if (!t || t === '*' || t === 'any' || t === '*/*') return [] // anything goes
 if (TYPE_GROUPS[t]) tokens.push(...TYPE_GROUPS[t])
 else if (t.includes('/')) tokens.push(t)
 else tokens.push(t.startsWith('.') ? t : `.${t}`)
 }
 return [...new Set(tokens)]
}

export interface FileRules {
 maxFiles: number
 maxBytes: number
 maxMB: number
 /** Value for <input accept>; empty means any type */
 accept: string
 allows: (name: string, type: string) => boolean
}

export function fileRules(question: FileQuestionLike): FileRules {
 const maxMB = Math.min(positiveInt(question.maxFileSize) ?? positiveInt(question.max) ?? MAX_FILE_MB, MAX_FILE_MB)
 const maxFiles = Math.min(positiveInt(question.maxFiles) ?? 1, MAX_FILES_PER_QUESTION)
 const tokens = acceptTokens(question.allowedTypes)

 const allows = (name: string, type: string) => {
 if (tokens.length === 0) return true
 const lowerName = name.toLowerCase()
 const lowerType = (type || '').toLowerCase()
 const ext = lowerName.includes('.') ? lowerName.split('.').pop()! : ''
 return tokens.some((t) => {
 if (t.startsWith('.')) return lowerName.endsWith(t)
 if (t.endsWith('/*')) {
 const group = t.slice(0, -1)
 const extensions = WILDCARD_EXTENSIONS[group]
 return lowerType.startsWith(group) && (!ext || !extensions || extensions.includes(ext))
 }
 return lowerType === t
 })
 }

 return { maxFiles, maxBytes: maxMB * 1024 * 1024, maxMB, accept: tokens.join(','), allows }
}

/** Read a file answer in any shape (new array, or the old single Blob object). */
export function asFileList(value: unknown): Array<{ id?: string; name: string; size?: number; type?: string; url: string }> | null {
 const items = Array.isArray(value) ? value : value && typeof value === 'object' ? [value] : null
 if (!items || items.length === 0) return null
 const files = []
 for (const item of items) {
 if (!item || typeof item !== 'object') return null
 const f = item as Record<string, unknown>
 if (typeof f.url !== 'string' || typeof f.name !== 'string') return null
 files.push({
 id: typeof f.id === 'string' ? f.id : undefined,
 name: f.name,
 size: typeof f.size === 'number' ? f.size : undefined,
 type: typeof f.type === 'string' ? f.type : undefined,
 url: f.url,
 })
 }
 return files
}

export function isImageType(type: string | undefined) {
 return !!type && /^image\/(jpeg|png|gif|webp|avif|bmp)$/i.test(type)
}

export function formatBytes(bytes: number | undefined) {
 if (bytes === undefined) return ''
 if (bytes < 1024) return `${bytes} B`
 if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
 return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
