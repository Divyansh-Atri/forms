import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo - replace with database in production
const responses: Record<string, Array<{
    id: string
    formId: string
    data: Record<string, unknown>
    createdAt: string
    metadata?: Record<string, unknown>
}>> = {}

// GET /api/responses - Get all responses (optionally filter by formId)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')

    if (formId) {
        const formResponses = responses[formId] || []
        return NextResponse.json({
            success: true,
            data: formResponses,
            count: formResponses.length,
        })
    }

    // Return all responses
    const allResponses = Object.values(responses).flat()
    return NextResponse.json({
        success: true,
        data: allResponses,
        count: allResponses.length,
    })
}

// POST /api/responses - Submit a new response
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { formId, data, metadata } = body

        if (!formId) {
            return NextResponse.json({
                success: false,
                error: "formId is required",
            }, { status: 400 })
        }

        const newResponse = {
            id: `resp_${Date.now()}`,
            formId,
            data: data || {},
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
        }

        // Store response
        if (!responses[formId]) {
            responses[formId] = []
        }
        responses[formId].push(newResponse)

        // In production: save to database
        // await prisma.response.create({ data: newResponse })

        return NextResponse.json({
            success: true,
            data: newResponse,
        }, { status: 201 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to submit response",
        }, { status: 400 })
    }
}
