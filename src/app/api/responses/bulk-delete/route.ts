import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// The page sends larger selections in rounds of this many
const MAX_IDS = 500

const fail = (error: string, status: number) =>
 NextResponse.json({ success: false, error }, { status })

// Old answers may point at files in Vercel Blob; collect those so they go too
function blobUrls(data: unknown): string[] {
 const urls: string[] = []
 const visit = (value: unknown) => {
 if (Array.isArray(value)) return value.forEach(visit)
 if (value && typeof value === 'object' && 'url' in value) {
 const url = (value as { url?: unknown }).url
 if (typeof url === 'string' && url.includes('blob.vercel-storage.com')) urls.push(url)
 }
 }
 if (data && typeof data === 'object') Object.values(data).forEach(visit)
 return urls
}

// POST /api/responses/bulk-delete - Delete several responses of one form
// Body: { formId: string, ids: string[] }
// Uploaded files go with them (the database cascades).
export async function POST(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value
 if (!userId || !workspaceId) return fail('Unauthorized', 401)

 let body: unknown
 try {
 body = await request.json()
 } catch {
 return fail('Invalid JSON', 400)
 }

 const { formId, ids: rawIds } = (body ?? {}) as { formId?: unknown; ids?: unknown }
 if (typeof formId !== 'string' || !formId) return fail('formId is required', 400)
 if (!Array.isArray(rawIds) || rawIds.length === 0 || !rawIds.every((id) => typeof id === 'string' && id.length > 0)) {
 return fail('ids must be a non-empty list of response ids', 400)
 }
 const ids = [...new Set(rawIds as string[])]
 if (ids.length > MAX_IDS) return fail(`You can delete at most ${MAX_IDS} responses at once`, 400)

 const form = await prisma.form.findUnique({ where: { id: formId }, select: { workspaceId: true } })
 if (!form) return fail('Form not found', 404)
 if (form.workspaceId !== workspaceId) return fail('Access denied', 403)

 // Ids from other forms are ignored rather than deleted
 const scope = { id: { in: ids }, formId }

 const rows = await prisma.response.findMany({ where: scope, select: { data: true } })
 const urls = rows.flatMap((r) => blobUrls(r.data))

 const { count } = await prisma.response.deleteMany({ where: scope })

 if (urls.length > 0) {
 try {
 const { del } = await import('@vercel/blob')
 await del(urls)
 } catch (blobError) {
 console.error('Failed to delete blob files:', blobError)
 }
 }

 return NextResponse.json({ success: true, data: { deleted: count } })
 } catch (error) {
 console.error('Failed to bulk delete responses:', error)
 return fail('Failed to delete responses', 500)
 }
}
