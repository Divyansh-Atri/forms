import { NextRequest, NextResponse } from 'next/server'
import { CHUNK_BYTES, chunkCount } from '@/lib/attachments'
import { checkQuota, cleanName, cleanType, ipHashOf, loadFileQuestion } from '@/lib/attachment-store'

export const dynamic = 'force-dynamic'

const fail = (error: string, status: number) =>
 NextResponse.json({ success: false, error }, { status })

// POST /api/upload - step 1 of attaching a file to a "File upload" question.
// Body: { formId, questionId, name, type, size }
// Checks the file is allowed and there is room, then returns an upload id.
// Step 2: PUT each piece to /api/upload/<id>?index=N (raw bytes, CHUNK_BYTES
// each, the last one shorter). Step 3: POST /api/upload/<id> to finish.
export async function POST(request: NextRequest) {
 try {
 let body: Record<string, unknown>
 try {
 body = await request.json()
 } catch {
 return fail('Invalid upload', 400)
 }
 const { formId, questionId, name: rawName, type: rawType, size } = body ?? {}
 if (typeof formId !== 'string' || typeof questionId !== 'string' || typeof rawName !== 'string'
 || typeof rawType !== 'string' || typeof size !== 'number' || !Number.isInteger(size)) {
 return fail('formId, questionId, name, type and size are required', 400)
 }
 if (size <= 0) return fail('That file is empty', 400)

 const found = await loadFileQuestion(formId, questionId)
 if (!found.ok) return fail(found.error, found.status)
 const { rules } = found

 const name = cleanName(rawName)
 const type = cleanType(rawType)
 if (size > rules.maxBytes) return fail(`Files can be at most ${rules.maxMB} MB`, 413)
 if (!rules.allows(name, type)) return fail('That file type is not allowed here', 415)

 const ipHash = ipHashOf(request)
 const quota = await checkQuota(ipHash, size)
 if (!quota.ok) return fail(quota.error, quota.status)

 const { prisma } = await import('@/lib/db')
 const row = await prisma.attachment.create({
 data: { formId, questionId, name, type, size, ready: false, ipHash },
 select: { id: true },
 })

 return NextResponse.json({
 success: true,
 data: { id: row.id, chunkSize: CHUNK_BYTES, chunks: chunkCount(size) },
 }, { status: 201 })
 } catch (error) {
 console.error('Upload start error:', error)
 return fail('Failed to start upload', 500)
 }
}
