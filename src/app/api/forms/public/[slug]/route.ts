import { NextRequest, NextResponse } from 'next/server'

// GET /api/forms/public/[slug] - Get a public form by slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params

    // Mock form data - in production, fetch from database by slug
    // Only return public forms that are accepting responses
    const publicForm = {
        id: "1",
        title: "Customer Feedback Survey",
        description: "We'd love to hear your feedback about our service.",
        slug,
        theme: {
            primaryColor: "#3b82f6",
            backgroundColor: "#f8fafc",
        },
        questions: [
            {
                id: "q1",
                type: "SHORT_TEXT",
                title: "What is your name?",
                required: true,
            },
            {
                id: "q2",
                type: "EMAIL",
                title: "What is your email address?",
                required: true,
            },
            {
                id: "q3",
                type: "SINGLE_CHOICE",
                title: "How satisfied are you with our service?",
                required: true,
                choices: [
                    { id: "c1", label: "Very Satisfied" },
                    { id: "c2", label: "Satisfied" },
                    { id: "c3", label: "Neutral" },
                    { id: "c4", label: "Dissatisfied" },
                    { id: "c5", label: "Very Dissatisfied" },
                ],
            },
            {
                id: "q4",
                type: "STAR_RATING",
                title: "Rate your overall experience",
                required: true,
                min: 1,
                max: 5,
            },
            {
                id: "q5",
                type: "LONG_TEXT",
                title: "Any additional comments or suggestions?",
                required: false,
            },
        ],
        settings: {
            showProgressBar: true,
            acceptingResponses: true,
        },
    }

    // In production:
    // const form = await prisma.form.findUnique({
    //     where: { slug, status: 'PUBLISHED' },
    //     select: { id, title, description, questions, theme, settings }
    // })

    if (!publicForm) {
        return NextResponse.json({
            success: false,
            error: "Form not found",
        }, { status: 404 })
    }

    return NextResponse.json({
        success: true,
        data: publicForm,
    })
}
