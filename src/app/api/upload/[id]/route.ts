import { NextRequest, NextResponse } from 'next/server'
import { CHUNK_BYTES, chunkCount, chunkLength, fileUrl } from '@/lib/attachments'

export const dynamic = 'force-dynamic'

const fail = (error: string, status: number) =>
 NextResponse.json({ success: false, error }, { status })

// Pieces must arrive within this long of starting the upload
const UPLOAD_WINDOW_MS = 2 * 60 * 60 * 1000

async function pendingUpload(id: string) {
 const { prisma } = await import('@/lib/db')
 const row = await prisma.attachment.findUnique({
 where: { id },
 select: { size: true, ready: true, responseId: true, createdAt: true, name: true, type: true },
 })
 if (!row || row.ready || row.responseId || row.createdAt.getTime() < Date.now() - UPLOAD_WINDOW_MS) return null
 return row
}

// PUT /api/upload/[id]?index=N - one piece of the file (raw bytes).
// Every piece but the last is exactly CHUNK_BYTES; sending a piece again
// replaces it, so a failed piece can simply be retried.
export async function PUT(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { id } = await params
 const index = Number(request.nextUrl.searchParams.get('index'))

 // Refuse oversized bodies before reading them
 if (Number(request.headers.get('content-length') || 0) > CHUNK_BYTES) return fail('Piece too large', 413)

 const row = await pendingUpload(id)
 if (!row) return fail('Upload not found. Please pick the file again', 404)
 if (!Number.isInteger(index) || index < 0 || index >= chunkCount(row.size)) return fail('Invalid piece', 400)

 const data = new Uint8Array(await request.arrayBuffer())
 if (data.length !== chunkLength(row.size, index)) return fail('Piece has the wrong size', 400)

 const { prisma } = await import('@/lib/db')
 await prisma.attachmentChunk.upsert({
 where: { attachmentId_index: { attachmentId: id, index } },
 create: { attachmentId: id, index, data },
 update: { data },
 })
 return NextResponse.json({ success: true })
 } catch (error) {
 console.error('Upload piece error:', error)
 return fail('Failed to upload', 500)
 }
}

// POST /api/upload/[id] - finish: every piece must be there, adding up to
// the declared size. Only then can the file be attached to a response.
export async function POST(
 _request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { id } = await params
 const row = await pendingUpload(id)
 if (!row) return fail('Upload not found. Please pick the file again', 404)

 const { prisma } = await import('@/lib/db')
 const [{ pieces, bytes }] = await prisma.$queryRaw<Array<{ pieces: number; bytes: number }>>`
 SELECT count(*)::int AS pieces, coalesce(sum(octet_length(data)), 0)::int AS bytes
 FROM "AttachmentChunk" WHERE "attachmentId" = ${id}`
 if (pieces !== chunkCount(row.size) || bytes !== row.size) {
 return fail('Some of the file is missing. Please try again', 400)
 }

 await prisma.attachment.update({ where: { id }, data: { ready: true } })
 return NextResponse.json({
 success: true,
 data: { id, name: row.name, size: row.size, type: row.type, url: fileUrl(id) },
 })
 } catch (error) {
 console.error('Upload finish error:', error)
 return fail('Failed to finish upload', 500)
 }
}
