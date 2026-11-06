import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Prisma } from '@prisma/client'

// GET /api/forms/[id] - Get a single form
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { prisma } = await import('@/lib/db')
 const { id } = await params
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Unauthorized",
 }, { status: 401 })
 }

 const form = await prisma.form.findUnique({
 where: { id },
 include: {
 _count: {
 select: { responses: true }
 },
 formSections: {
 orderBy: {
 order: 'asc'
 }
 }
 }
 })

 if (!form) {
 return NextResponse.json({
 success: false,
 error: "Form not found",
 }, { status: 404 })
 }

 // Verify user has access to this form (belongs to their workspace)
 if (form.workspaceId !== workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Access denied",
 }, { status: 403 })
 }

 return NextResponse.json({
 success: true,
 data: form,
 })
 } catch (error) {
 console.error("Failed to fetch form:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to fetch form",
 }, { status: 500 })
 }
}

// PUT /api/forms/[id] - Update a form
export async function PUT(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { prisma } = await import('@/lib/db')
 const body = await request.json()
 const { id } = await params
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Unauthorized",
 }, { status: 401 })
 }

 // Check if form exists
 const existingForm = await prisma.form.findUnique({
 where: { id }
 })

 if (!existingForm) {
 return NextResponse.json({
 success: false,
 error: "Form not found",
 }, { status: 404 })
 }

 // Verify user has access to this form
 if (existingForm.workspaceId !== workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Access denied",
 }, { status: 403 })
 }

 // Sectioned (imported) forms send { sections: [{ id, questions }] }:
 // write each section's questions back, but only for this form's sections
 const sectionUpdates: Array<{ id: string; questions: Prisma.InputJsonValue }> = []
 if (Array.isArray(body.sections)) {
 const own = await prisma.section.findMany({ where: { formId: id }, select: { id: true } })
 const ownIds = new Set(own.map((s) => s.id))
 for (const section of body.sections) {
 if (!section || typeof section.id !== 'string' || !Array.isArray(section.questions)) {
 return NextResponse.json({ success: false, error: "Invalid sections" }, { status: 400 })
 }
 if (!ownIds.has(section.id)) {
 return NextResponse.json({ success: false, error: "Section not found" }, { status: 400 })
 }
 sectionUpdates.push({ id: section.id, questions: section.questions })
 }
 }

 // Update form (and its sections) together
 const [updatedForm] = await prisma.$transaction([
 prisma.form.update({
 where: { id },
 data: {
 title: body.title,
 description: body.description,
 status: body.status,
 slug: body.slug,
 questions: body.questions,
 settings: body.settings,
 theme: body.theme,
 welcomeScreen: body.welcomeScreen,
 thankYouScreen: body.thankYouScreen,
 }
 }),
 ...sectionUpdates.map((s) =>
 prisma.section.update({ where: { id: s.id }, data: { questions: s.questions } })
 ),
 ])

 return NextResponse.json({
 success: true,
 data: updatedForm,
 })
 } catch (error) {
 console.error("Failed to update form:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to update form",
 }, { status: 500 })
 }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { prisma } = await import('@/lib/db')
 const { id } = await params
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Unauthorized",
 }, { status: 401 })
 }

 // Check if form exists
 const existingForm = await prisma.form.findUnique({
 where: { id }
 })

 if (!existingForm) {
 return NextResponse.json({
 success: false,
 error: "Form not found",
 }, { status: 404 })
 }

 // Verify user has access to this form
 if (existingForm.workspaceId !== workspaceId) {
 return NextResponse.json({
 success: false,
 error: "Access denied",
 }, { status: 403 })
 }

 // Delete responses first (cascade)
 await prisma.response.deleteMany({
 where: { formId: id }
 })

 // Then delete form
 await prisma.form.delete({
 where: { id }
 })

 return NextResponse.json({
 success: true,
 message: "Form deleted successfully",
 })
 } catch (error) {
 console.error("Failed to delete form:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to delete form",
 }, { status: 500 })
 }
}
