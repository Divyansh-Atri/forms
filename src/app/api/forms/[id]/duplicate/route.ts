import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/forms/[id]/duplicate - Duplicate a form
export async function POST(
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
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 )
 }

 // Fetch the original form with all data
 const originalForm = await prisma.form.findUnique({
 where: { id },
 include: {
 formSections: {
 orderBy: { order: 'asc' }
 }
 }
 })

 if (!originalForm) {
 return NextResponse.json(
 { success: false, error: 'Form not found' },
 { status: 404 }
 )
 }

 // Generate unique slug
 const baseSlug = `${originalForm.slug}-copy`
 let slug = baseSlug
 let counter = 1
 while (await prisma.form.findUnique({ where: { slug } })) {
 slug = `${baseSlug}-${counter++}`
 }

 // Create the duplicated form
 const duplicatedForm = await prisma.form.create({
 data: {
 title: `${originalForm.title} (copy)`,
 description: originalForm.description,
 slug,
 status: 'DRAFT',
 questions: originalForm.questions ?? [],
 logic: originalForm.logic ?? [],
 variables: originalForm.variables ?? [],
 sections: originalForm.sections ?? [],
 welcomeScreen: originalForm.welcomeScreen ?? undefined,
 thankYouScreen: originalForm.thankYouScreen ?? undefined,
 settings: originalForm.settings ?? {},
 theme: originalForm.theme ?? {},
 isQuiz: originalForm.isQuiz,
 quizSettings: originalForm.quizSettings ?? undefined,
 accessType: originalForm.accessType,
 showProgressBar: originalForm.showProgressBar,
 shuffleQuestions: originalForm.shuffleQuestions,
 collectEmail: originalForm.collectEmail,
 workspaceId,
 createdById: userId,
 // Also duplicate sections if they exist
 formSections: originalForm.formSections.length > 0 ? {
 create: originalForm.formSections.map(section => ({
 title: section.title,
 description: section.description,
 order: section.order,
 questions: section.questions ?? [],
 }))
 } : undefined
 },
 include: {
 formSections: true,
 _count: {
 select: { responses: true }
 }
 }
 })

 return NextResponse.json({
 success: true,
 data: duplicatedForm
 })

 } catch (error) {
 console.error('Failed to duplicate form:', error)
 return NextResponse.json(
 { success: false, error: 'Failed to duplicate form' },
 { status: 500 }
 )
 }
}
