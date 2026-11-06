import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// A workspace with more forms than this is deleted in a few rounds
const MAX_IDS = 500

// POST /api/forms/bulk-delete - Delete several forms and their responses
// Body: { ids: string[] }
export async function POST(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
 }

 let body: unknown
 try {
 body = await request.json()
 } catch {
 return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 })
 }

 const rawIds = (body as { ids?: unknown } | null)?.ids
 if (!Array.isArray(rawIds) || rawIds.length === 0 || !rawIds.every((id) => typeof id === 'string' && id.length > 0)) {
 return NextResponse.json({ success: false, error: "ids must be a non-empty list of form ids" }, { status: 400 })
 }
 const ids = [...new Set(rawIds as string[])]
 if (ids.length > MAX_IDS) {
 return NextResponse.json({ success: false, error: `You can delete at most ${MAX_IDS} forms at once` }, { status: 400 })
 }

 // Only forms in the caller's workspace are touched, so ids from
 // another workspace are silently ignored rather than deleted
 const scope = { id: { in: ids }, workspaceId }

 const [deletedResponses, deletedForms] = await prisma.$transaction([
 prisma.response.deleteMany({ where: { form: scope } }),
 prisma.form.deleteMany({ where: scope }),
 ])

 return NextResponse.json({
 success: true,
 data: { forms: deletedForms.count, responses: deletedResponses.count },
 })
 } catch (error) {
 console.error("Failed to bulk delete forms:", error)
 return NextResponse.json({ success: false, error: "Failed to delete forms" }, { status: 500 })
 }
}
