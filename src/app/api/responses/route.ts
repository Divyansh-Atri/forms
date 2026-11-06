import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Prisma } from '@prisma/client'
import {
 MAX_RESPONSE_BYTES,
 byteLength,
 cleanResponseData,
 collectQuestionIds,
} from '@/lib/response-guard'
import { fileRules, fileUrl, isFileQuestionType } from '@/lib/attachments'

export const dynamic = 'force-dynamic'

// GET /api/responses - Get responses for a form (with ownership check)
export async function GET(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const { searchParams } = new URL(request.url)
 const formId = searchParams.get('formId')
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Unauthorized",
 }, { status: 401 })
 }

 if (!formId) {
 return NextResponse.json({
 success: false,
 error: "formId is required",
 }, { status: 400 })
 }

 // Verify the form belongs to user's workspace
 const form = await prisma.form.findUnique({
 where: { id: formId },
 select: { workspaceId: true }
 })

 if (!form) {
 return NextResponse.json({
 success: false,
 error: "Form not found",
 }, { status: 404 })
 }

 if (form.workspaceId !== workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Access denied",
 }, { status: 403 })
 }

 // Get responses for this form
 const responses = await prisma.response.findMany({
 where: { formId },
 orderBy: { createdAt: 'desc' }
 })

 return NextResponse.json({
 success: true,
 data: responses,
 count: responses.length,
 })
 } catch (error) {
 console.error("Failed to fetch responses:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to fetch responses"
 }, { status: 500 })
 }
}

// POST /api/responses - Submit a new response (public - no auth needed)
export async function POST(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')

 // Reject oversized submissions before parsing them
 const tooLarge = NextResponse.json({
 success: false,
 error: "Response is too large",
 }, { status: 413 })

 const declaredSize = Number(request.headers.get('content-length') || 0)
 if (declaredSize > MAX_RESPONSE_BYTES) return tooLarge

 const raw = await request.text()
 if (byteLength(raw) > MAX_RESPONSE_BYTES) return tooLarge

 let body: { formId?: unknown; data?: unknown; metadata?: { referrer?: unknown } }
 try {
 body = JSON.parse(raw)
 } catch {
 return NextResponse.json({
 success: false,
 error: "Invalid JSON",
 }, { status: 400 })
 }

 const { formId, data } = body ?? {}

 if (!formId || typeof formId !== 'string') {
 return NextResponse.json({
 success: false,
 error: "formId is required",
 }, { status: 400 })
 }

 // Check if form exists and is published
 const form = await prisma.form.findUnique({
 where: { id: formId },
 select: {
 status: true,
 questions: true,
 formSections: { select: { questions: true } },
 }
 })

 if (!form) {
 return NextResponse.json({
 success: false,
 error: "Form not found",
 }, { status: 404 })
 }

 if (form.status !== 'PUBLISHED') {
 return NextResponse.json({
 success: false,
 error: "This form is not accepting responses",
 }, { status: 403 })
 }

 // Keep only answers to this form's questions; refuse inline files
 const questionLists = [
 form.questions,
 ...form.formSections.map((section) => section.questions),
 ]
 const questionIds = collectQuestionIds(questionLists)
 const checked = cleanResponseData(data, questionIds)
 if (!checked.ok) {
 return NextResponse.json({
 success: false,
 error: checked.error,
 }, { status: checked.status })
 }

 // File answers: keep only files that were really uploaded to that
 // question of this form and not used by another response, and rebuild
 // them from the database instead of trusting the browser's copy
 const answers = { ...checked.data }
 const wanted = new Map<string, string[]>()
 for (const list of questionLists) {
 if (!Array.isArray(list)) continue
 for (const q of list as Array<Record<string, unknown> | null>) {
 if (!q || typeof q.id !== 'string' || !isFileQuestionType(q.type) || !(q.id in answers)) continue
 const value = answers[q.id]
 const ids = (Array.isArray(value) ? value : [value])
 .map((f) => (f as { id?: unknown } | null)?.id)
 .filter((id): id is string => typeof id === 'string')
 wanted.set(q.id, [...new Set(ids)].slice(0, fileRules(q).maxFiles))
 }
 }
 const allIds = [...wanted.values()].flat()
 const found = allIds.length === 0 ? [] : await prisma.attachment.findMany({
 where: { id: { in: allIds }, formId, responseId: null },
 select: { id: true, questionId: true, name: true, size: true, type: true },
 })
 const byId = new Map(found.map((f) => [f.id, f]))
 const claimed: string[] = []
 for (const [questionId, ids] of wanted) {
 const files = ids
 .map((id) => byId.get(id))
 .filter((f): f is NonNullable<typeof f> => !!f && f.questionId === questionId)
 .map((f) => ({ id: f.id, name: f.name, size: f.size, type: f.type, url: fileUrl(f.id) }))
 if (files.length > 0) {
 answers[questionId] = files
 claimed.push(...files.map((f) => f.id))
 } else {
 delete answers[questionId]
 }
 }
 if (Object.keys(answers).length === 0) {
 return NextResponse.json({
 success: false,
 error: "Please answer at least one question",
 }, { status: 400 })
 }

 // Build metadata here rather than storing whatever the client sent
 const metadata: Record<string, string> = {
 userAgent: (request.headers.get('user-agent') || '').slice(0, 500),
 }
 const referrer = body.metadata?.referrer
 if (typeof referrer === 'string' && referrer) {
 metadata.referrer = referrer.slice(0, 500)
 }

 const newResponse = await prisma.response.create({
 data: {
 formId,
 data: answers as Prisma.InputJsonObject,
 metadata,
 isComplete: true,
 ...(claimed.length > 0 && {
 attachments: { connect: claimed.map((id) => ({ id })) },
 }),
 }
 })

 return NextResponse.json({
 success: true,
 data: newResponse,
 }, { status: 201 })
 } catch (error) {
 console.error("Failed to submit response:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to submit response",
 }, { status: 500 })
 }
}

// DELETE /api/responses - Delete all responses for a form
export async function DELETE(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const { searchParams } = new URL(request.url)
 const formId = searchParams.get('formId')
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Unauthorized",
 }, { status: 401 })
 }

 if (!formId) {
 return NextResponse.json({
 success: false,
 error: "formId is required",
 }, { status: 400 })
 }

 // Verify the form belongs to user's workspace
 const form = await prisma.form.findUnique({
 where: { id: formId },
 select: { workspaceId: true }
 })

 if (!form) {
 return NextResponse.json({
 success: false,
 error: "Form not found",
 }, { status: 404 })
 }

 if (form.workspaceId !== workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Access denied",
 }, { status: 403 })
 }

 // Get responses to find any file URLs for blob cleanup
 const responses = await prisma.response.findMany({
 where: { formId },
 select: { data: true }
 })

 // Extract file URLs from response data for blob cleanup
 const fileUrls: string[] = []
 for (const response of responses) {
 const data = response.data as Record<string, unknown>
 for (const value of Object.values(data)) {
 // Check if value is a file object with url
 if (value && typeof value === 'object' && 'url' in value) {
 const fileValue = value as { url?: string }
 if (fileValue.url && fileValue.url.includes('blob.vercel-storage.com')) {
 fileUrls.push(fileValue.url)
 }
 }
 }
 }

 // Delete files from blob storage
 if (fileUrls.length > 0) {
 try {
 const { del } = await import('@vercel/blob')
 await del(fileUrls)
 } catch (blobError) {
 console.error('Failed to delete some blob files:', blobError)
 // Continue with response deletion even if blob cleanup fails
 }
 }

 // Delete all responses for this form
 const result = await prisma.response.deleteMany({
 where: { formId }
 })

 return NextResponse.json({
 success: true,
 message: `Deleted ${result.count} responses and ${fileUrls.length} files`,
 count: result.count,
 filesDeleted: fileUrls.length,
 })
 } catch (error) {
 console.error("Failed to delete responses:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to delete responses"
 }, { status: 500 })
 }
}
