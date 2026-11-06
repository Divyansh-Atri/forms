import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { MAX_FILE_BYTES, MAX_FILE_MB, fileRules, fileUrl, isFileQuestionType } from '@/lib/attachments'

export const dynamic = 'force-dynamic'

// Attachments may use this much of the database in total, so they can never
// fill Neon's free 1 GB and take the forms themselves down with them.
const STORAGE_LIMIT_BYTES = (Number(process.env.ATTACHMENT_STORAGE_MB) || 700) * 1024 * 1024

// Uploads per visitor (by IP) per hour
const UPLOADS_PER_HOUR = 60

// Files picked but never submitted are removed after this long
const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000

const fail = (error: string, status: number) =>
 NextResponse.json({ success: false, error }, { status })

function cleanName(name: string) {
 const base = name.split(/[\\/]/).pop() || 'file'
 return base.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200) || 'file'
}

function cleanType(type: string) {
 return /^[\w.+-]+\/[\w.+-]+$/.test(type) ? type.toLowerCase().slice(0, 100) : 'application/octet-stream'
}

function ipHashOf(request: NextRequest) {
 const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
 || request.headers.get('x-real-ip')
 || 'unknown'
 return createHash('sha256').update(ip).digest('hex')
}

// POST /api/upload - a respondent attaches a file to a "File upload" question
// multipart fields: file, formId, questionId
export async function POST(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')

 // Refuse oversized bodies before reading them
 const declared = Number(request.headers.get('content-length') || 0)
 if (declared > MAX_FILE_BYTES + 64 * 1024) {
 return fail(`Files can be at most ${MAX_FILE_MB} MB`, 413)
 }

 let formData: FormData
 try {
 formData = await request.formData()
 } catch {
 return fail('Invalid upload', 400)
 }

 const file = formData.get('file')
 const formId = formData.get('formId')
 const questionId = formData.get('questionId')
 if (!(file instanceof File) || typeof formId !== 'string' || typeof questionId !== 'string') {
 return fail('file, formId and questionId are required', 400)
 }
 if (file.size === 0) return fail('That file is empty', 400)

 const form = await prisma.form.findUnique({
 where: { id: formId },
 select: { status: true, questions: true, formSections: { select: { questions: true } } },
 })
 if (!form) return fail('Form not found', 404)
 if (form.status !== 'PUBLISHED') return fail('This form is not accepting responses', 403)

 // The question must exist on this form and be a file question
 const lists = [form.questions, ...form.formSections.map((s) => s.questions)]
 let question: Record<string, unknown> | undefined
 for (const list of lists) {
 if (!Array.isArray(list)) continue
 question = list.find((q) => {
 const item = q as Record<string, unknown> | null
 return item?.id === questionId && isFileQuestionType(item?.type)
 }) as Record<string, unknown> | undefined
 if (question) break
 }
 if (!question) return fail('This question does not take files', 400)

 const rules = fileRules(question)
 const name = cleanName(file.name)
 const type = cleanType(file.type)
 if (file.size > rules.maxBytes) return fail(`Files can be at most ${rules.maxMB} MB`, 413)
 if (!rules.allows(name, type)) return fail('That file type is not allowed here', 415)

 const ipHash = ipHashOf(request)
 const now = Date.now()

 const recent = await prisma.attachment.count({
 where: { ipHash, createdAt: { gt: new Date(now - 60 * 60 * 1000) } },
 })
 if (recent >= UPLOADS_PER_HOUR) return fail('Too many uploads. Please try again later', 429)

 // Clear out files nobody submitted, then check the storage budget
 await prisma.attachment.deleteMany({
 where: { responseId: null, createdAt: { lt: new Date(now - ORPHAN_AGE_MS) } },
 })
 const used = await prisma.attachment.aggregate({ _sum: { size: true } })
 if ((used._sum.size ?? 0) + file.size > STORAGE_LIMIT_BYTES) {
 console.error('Attachment storage limit reached')
 return fail('File storage is full. Please contact the form owner', 507)
 }

 const saved = await prisma.attachment.create({
 data: {
 formId,
 questionId,
 name,
 type,
 size: file.size,
 data: new Uint8Array(await file.arrayBuffer()),
 ipHash,
 },
 select: { id: true },
 })

 return NextResponse.json({
 success: true,
 data: { id: saved.id, name, size: file.size, type, url: fileUrl(saved.id) },
 }, { status: 201 })
 } catch (error) {
 console.error('Upload error:', error)
 return fail('Failed to upload file', 500)
 }
}
