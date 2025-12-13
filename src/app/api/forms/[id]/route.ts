import { NextRequest, NextResponse } from 'next/server'

// GET /api/forms/[id] - Get a single form
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // Mock form data - in production, fetch from database
    const form = {
        id,
        title: "Customer Feedback Survey",
        description: "Gather feedback from our customers",
        status: "PUBLISHED",
        slug: "customer-feedback",
        questions: [
            { id: "q1", type: "SHORT_TEXT", title: "What is your name?", required: true },
            { id: "q2", type: "EMAIL", title: "What is your email address?", required: true },
            {
                id: "q3", type: "SINGLE_CHOICE", title: "How satisfied are you?", required: true,
                choices: [
                    { id: "c1", label: "Very Satisfied" },
                    { id: "c2", label: "Satisfied" },
                    { id: "c3", label: "Neutral" },
                ]
            },
            { id: "q4", type: "STAR_RATING", title: "Rate your experience", required: true, min: 1, max: 5 },
            { id: "q5", type: "LONG_TEXT", title: "Any additional comments?", required: false },
        ],
        settings: {
            isPublic: true,
            acceptingResponses: true,
            showProgressBar: true,
        },
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z",
    }

    return NextResponse.json({
        success: true,
        data: form,
    })
}

// PUT /api/forms/[id] - Update a form
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json()
        const { id } = await params

        // In production: update in database
        const updatedForm = {
            id,
            ...body,
            updatedAt: new Date().toISOString(),
        }

        return NextResponse.json({
            success: true,
            data: updatedForm,
        })
    } catch {
        return NextResponse.json({
            success: false,
            error: "Failed to update form",
        }, { status: 400 })
    }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // In production: delete from database
    // await prisma.form.delete({ where: { id } })

    return NextResponse.json({
        success: true,
        message: `Form ${id} deleted`,
    })
}
