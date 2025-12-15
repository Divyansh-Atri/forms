import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/responses - Get all responses (optionally filter by formId)
export async function GET(request: NextRequest) {
    try {
        const { prisma } = await import('@/lib/db')
        const { searchParams } = new URL(request.url)
        const formId = searchParams.get('formId')

        if (!formId) {
            // If no formId, maybe return 400 or fetch all... 
            // Fetching ALL responses for ALL forms might be heavy. Let's restrict it.
            // But for now, let's just return empty or recent.
            const responses = await prisma.response.findMany({
                take: 100,
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json({
                success: true,
                data: responses,
                count: responses.length,
            })
        }

        const responses = await prisma.response.findMany({
            where: {
                formId: formId
            },
            orderBy: {
                createdAt: 'desc'
            }
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

// POST /api/responses - Submit a new response
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

        // Check if form exists
        const form = await prisma.form.findUnique({
            where: { id: formId }
        })

        if (!form) {
            return NextResponse.json({
                success: false,
                error: "Form not found",
            }, { status: 404 })
        }

        const newResponse = await prisma.response.create({
            data: {
                formId,
                data: data || {},
                metadata: metadata || {},
                isComplete: true, // Assuming submission means complete
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
