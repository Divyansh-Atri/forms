import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isImageType } from '@/lib/attachments'

export const dynamic = 'force-dynamic'

// GET /api/files/[id] - the form owner opens or downloads an attached file.
// Only the workspace that owns the form can read it. ?download=1 forces a
// download instead of showing images and PDFs in the browser.
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { prisma } = await import('@/lib/db')
 const { id } = await params
 const cookieStore = await cookies()
 const workspaceId = cookieStore.get('workspace-id')?.value
 if (!cookieStore.get('user-id')?.value || !workspaceId) {
 return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
 }

 const file = await prisma.attachment.findUnique({
 where: { id },
 select: { name: true, type: true, size: true, data: true, form: { select: { workspaceId: true } } },
 })
 // Same answer for "missing" and "not yours", so ids can't be probed
 if (!file || file.form.workspaceId !== workspaceId) {
 return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 })
 }

 const isImage = isImageType(file.type)
 const isPdf = file.type === 'application/pdf'
 const inline = (isImage || isPdf) && request.nextUrl.searchParams.get('download') !== '1'
 const asciiName = file.name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_')

 const headers: Record<string, string> = {
 // Anything that is not a plain image or PDF is served as a download,
 // so an uploaded HTML or SVG file can never run in this site's origin
 'Content-Type': inline ? file.type : 'application/octet-stream',
 'Content-Length': String(file.size),
 'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
 'X-Content-Type-Options': 'nosniff',
 'Cache-Control': 'private, max-age=3600',
 }

 return new NextResponse(Buffer.from(file.data), { headers })
 } catch (error) {
 console.error('File download error:', error)
 return NextResponse.json({ success: false, error: 'Failed to load file' }, { status: 500 })
 }
}
