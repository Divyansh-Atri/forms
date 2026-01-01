import { NextRequest, NextResponse } from 'next/server'

// GET /api/forms/public/[slug] - Get a public form by slug
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ slug: string }> }
) {
 try {
 const { prisma } = await import('@/lib/db')
 const { slug } = await params

 // Fetch form by slug - only return PUBLISHED forms
 const form = await prisma.form.findUnique({
 where: { slug },
 select: {
 id: true,
 title: true,
 description: true,
 slug: true,
 status: true,
 questions: true,
 theme: true,
 settings: true,
 welcomeScreen: true,
 thankYouScreen: true,
 formSections: {
 orderBy: {
 order: 'asc'
 },
 select: {
 id: true,
 title: true,
 description: true,
 order: true,
 questions: true,
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

 // Only allow access to published forms
 if (form.status !== 'PUBLISHED') {
 return NextResponse.json({
 success: false,
 error: "This form is not accepting responses",
 }, { status: 403 })
 }

 return NextResponse.json({
 success: true,
 data: form,
 })
 } catch (error) {
 console.error("Failed to fetch public form:", error)
 return NextResponse.json({
 success: false,
 error: "Failed to load form",
 }, { status: 500 })
 }
}
