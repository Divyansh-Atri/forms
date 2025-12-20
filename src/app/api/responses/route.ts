import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET /api/responses - Get responses for a form (with ownership check)
export async function GET(request: NextRequest) {
    try {
        const { prisma } = await import('@/lib/db')
        const { searchParams } = new URL(request.url)
        const formId = searchParams.get('formId')
        const cookieStore = await cookies()
        const userId = cookieStore.get('user-id')?.value
        const workspaceId = cookieStore.get('workspace-id')?.value

        if (!userId || !workspaceId) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized",
            }, { status: 401 })
        }

        if (!formId) {
            return NextResponse.json({
                success: false,
                error: "formId is required",
            }, { status: 400 })
        }

        // Verify the form belongs to user's workspace
        const form = await prisma.form.findUnique({
            where: { id: formId },
            select: { workspaceId: true }
        })

        if (!form) {
            return NextResponse.json({
                success: false,
                error: "Form not found",
            }, { status: 404 })
        }

        if (form.workspaceId !== workspaceId) {
            return NextResponse.json({
                success: false,
                error: "Access denied",
            }, { status: 403 })
        }

        // Get responses for this form
        const responses = await prisma.response.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            success: true,
            data: responses,
            count: responses.length,
        })
    } catch (error) {
        console.error("Failed to fetch responses:", error)
        return NextResponse.json({
            success: false,
            error: "Failed to fetch responses"
        }, { status: 500 })
    }
}

// POST /api/responses - Submit a new response (public - no auth needed)
export async function POST(request: NextRequest) {
    try {
        const { prisma } = await import('@/lib/db')
        const body = await request.json()
        const { formId, data, metadata } = body

        if (!formId) {
            return NextResponse.json({
                success: false,
                error: "formId is required",
            }, { status: 400 })
        }

        // Check if form exists and is published
        const form = await prisma.form.findUnique({
            where: { id: formId },
            select: { status: true }
        })

        if (!form) {
            return NextResponse.json({
                success: false,
                error: "Form not found",
            }, { status: 404 })
        }

        if (form.status !== 'PUBLISHED') {
            return NextResponse.json({
                success: false,
                error: "This form is not accepting responses",
            }, { status: 403 })
        }

        const newResponse = await prisma.response.create({
            data: {
                formId,
                data: data || {},
                metadata: metadata || {},
                isComplete: true,
            }
        })

        return NextResponse.json({
            success: true,
            data: newResponse,
        }, { status: 201 })
    } catch (error) {
        console.error("Failed to submit response:", error)
        return NextResponse.json({
            success: false,
            error: "Failed to submit response",
        }, { status: 500 })
    }
}

// DELETE /api/responses - Delete all responses for a form
export async function DELETE(request: NextRequest) {
    try {
        const { prisma } = await import('@/lib/db')
        const { searchParams } = new URL(request.url)
        const formId = searchParams.get('formId')
        const cookieStore = await cookies()
        const userId = cookieStore.get('user-id')?.value
        const workspaceId = cookieStore.get('workspace-id')?.value

        if (!userId || !workspaceId) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized",
            }, { status: 401 })
        }

        if (!formId) {
            return NextResponse.json({
                success: false,
                error: "formId is required",
            }, { status: 400 })
        }

        // Verify the form belongs to user's workspace
        const form = await prisma.form.findUnique({
            where: { id: formId },
            select: { workspaceId: true }
        })

        if (!form) {
            return NextResponse.json({
                success: false,
                error: "Form not found",
            }, { status: 404 })
        }

        if (form.workspaceId !== workspaceId) {
            return NextResponse.json({
                success: false,
                error: "Access denied",
            }, { status: 403 })
        }

        // Delete all responses for this form
        const result = await prisma.response.deleteMany({
            where: { formId }
        })

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.count} responses`,
            count: result.count,
        })
    } catch (error) {
        console.error("Failed to delete responses:", error)
        return NextResponse.json({
            success: false,
            error: "Failed to delete responses"
        }, { status: 500 })
    }
}
