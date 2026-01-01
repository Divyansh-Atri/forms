import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET /api/forms - List all forms
export async function GET(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 // Fallback for public demo if mostly needed, but best to require auth
 // For now, return empty or mock if no DB connection/auth
 }

 const forms = await prisma.form.findMany({
 where: {
 workspaceId: workspaceId // Filter by workspace
 },
 include: {
 _count: {
 select: { responses: true }
 }
 },
 orderBy: {
 createdAt: 'desc'
 }
 })

 return NextResponse.json({
 success: true,
 data: forms,
 })
 } catch (error) {
 console.error("Failed to fetch forms:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to fetch forms",
 data: [] // Return empty array on error to prevent UI crash
 }, { status: 500 })
 }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const body = await request.json()
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Unauthorized",
 }, { status: 401 })
 }

 const newForm = await prisma.form.create({
 data: {
 title: body.title || "Untitled Form",
 description: body.description || "",
 status: "DRAFT",
 slug: body.slug || `form-${Date.now()}`,
 questions: body.questions || [],
 workspaceId: workspaceId,
 createdById: userId
 }
 })

 return NextResponse.json({
 success: true,
 data: newForm,
 }, { status: 201 })
 } catch (error) {
 console.error("Failed to create form:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to create form",
 }, { status: 500 })
 }
}
