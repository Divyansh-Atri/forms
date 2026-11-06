// Server-side checks shared by the upload routes.

import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'
import { fileRules, isFileQuestionType, type FileRules } from '@/lib/attachments'

// Attachments may use this much of the database in total, so they can never
// fill Neon's free 1 GB and take the forms themselves down with them.
const STORAGE_LIMIT_BYTES = (Number(process.env.ATTACHMENT_STORAGE_MB) || 700) * 1024 * 1024

// Per visitor (by IP), per hour
const UPLOADS_PER_HOUR = 60
const BYTES_PER_HOUR = 200 * 1024 * 1024

// Files picked but never submitted are removed after this long
const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000

export type Check<T> = ({ ok: true } & T) | { ok: false; status: number; error: string }

export function cleanName(name: string) {
 const base = name.split(/[\\/]/).pop() || 'file'
 return base.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200) || 'file'
}

export function cleanType(type: string) {
 return /^[\w.+-]+\/[\w.+-]+$/.test(type) ? type.toLowerCase().slice(0, 100) : 'application/octet-stream'
}

export function ipHashOf(request: NextRequest) {
 const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
 || request.headers.get('x-real-ip')
 || 'unknown'
 return createHash('sha256').update(ip).digest('hex')
}

/** The form must be published and the question must be one of its file questions. */
export async function loadFileQuestion(formId: string, questionId: string): Promise<Check<{ rules: FileRules }>> {
 const { prisma } = await import('@/lib/db')
 const form = await prisma.form.findUnique({
 where: { id: formId },
 select: { status: true, questions: true, formSections: { select: { questions: true } } },
 })
 if (!form) return { ok: false, status: 404, error: 'Form not found' }
 if (form.status !== 'PUBLISHED') return { ok: false, status: 403, error: 'This form is not accepting responses' }

 for (const list of [form.questions, ...form.formSections.map((s) => s.questions)]) {
 if (!Array.isArray(list)) continue
 const question = list.find((q) => {
 const item = q as Record<string, unknown> | null
 return item?.id === questionId && isFileQuestionType(item?.type)
 }) as Record<string, unknown> | undefined
 if (question) return { ok: true, rules: fileRules(question) }
 }
 return { ok: false, status: 400, error: 'This question does not take files' }
}

/** Rate limits, orphan cleanup and the storage budget, checked before each upload. */
export async function checkQuota(ipHash: string, size: number): Promise<Check<object>> {
 const { prisma } = await import('@/lib/db')
 const hourAgo = new Date(Date.now() - 60 * 60 * 1000)

 const recent = await prisma.attachment.aggregate({
 where: { ipHash, createdAt: { gt: hourAgo } },
 _count: true,
 _sum: { size: true },
 })
 if (recent._count >= UPLOADS_PER_HOUR || (recent._sum.size ?? 0) + size > BYTES_PER_HOUR) {
 return { ok: false, status: 429, error: 'Too many uploads. Please try again later' }
 }

 // Files nobody submitted (their pieces go with them)
 await prisma.attachment.deleteMany({
 where: { responseId: null, createdAt: { lt: new Date(Date.now() - ORPHAN_AGE_MS) } },
 })

 const used = await prisma.attachment.aggregate({ _sum: { size: true } })
 if ((used._sum.size ?? 0) + size > STORAGE_LIMIT_BYTES) {
 console.error('Attachment storage limit reached')
 return { ok: false, status: 507, error: 'File storage is full. Please contact the form owner' }
 }
 return { ok: true }
}
