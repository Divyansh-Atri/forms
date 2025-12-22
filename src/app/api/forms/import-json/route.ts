import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validateSectionedFormJSON, convertSectionFieldToQuestion } from '@/types/sections'

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Parse JSON body
        const jsonData = await request.json()

        // Validate the JSON structure
        const validation = validateSectionedFormJSON(jsonData)
        if (!validation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid form JSON format',
                    details: validation.errors
                },
                { status: 400 }
            )
        }

        // Create a slug from the title
        const baseSlug = jsonData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        // Ensure unique slug
        let slug = baseSlug
        let counter = 1
        while (await prisma.form.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`
        }

        // Create form with sections
        const form = await prisma.form.create({
            data: {
                title: jsonData.title,
                description: jsonData.description || '',
                slug,
                status: 'DRAFT',
                createdById: user.id,
                workspaceId: user.id, // Using user ID as workspace for now
                // Create sections
                formSections: {
                    create: jsonData.sections.map((section: any, sectionIndex: number) => {
                        // Convert section fields to questions
                        const questions = section.fields.map((field: any, fieldIndex: number) =>
                            convertSectionFieldToQuestion(field, section.id, fieldIndex)
                        )

                        return {
                            title: section.title,
                            description: section.description || '',
                            order: sectionIndex,
                            questions: questions,
                        }
                    })
                }
            },
            include: {
                formSections: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                id: form.id,
                title: form.title,
                slug: form.slug,
                sectionsCount: form.formSections.length,
                sections: form.formSections
            }
        })

    } catch (error) {
        console.error('JSON import error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to import form',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
