import { NextRequest, NextResponse } from 'next/server'

// Mock forms data - in production, this would come from database
const mockForms = [
    {
        id: "1",
        title: "Customer Feedback Survey",
        description: "Gather feedback from our customers about their experience",
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
                    { id: "c4", label: "Dissatisfied" },
                ]
            },
        ],
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z",
    },
    {
        id: "2",
        title: "Job Application Form",
        description: "Collect applications for open positions",
        status: "PUBLISHED",
        slug: "job-application",
        questions: [],
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: "2024-01-18T00:00:00Z",
    },
]

// GET /api/forms - List all forms
export async function GET() {
    return NextResponse.json({
        success: true,
        data: mockForms,
    })
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const newForm = {
            id: `form_${Date.now()}`,
            title: body.title || "Untitled Form",
            description: body.description || "",
            status: "DRAFT",
            slug: body.slug || `form-${Date.now()}`,
            questions: body.questions || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        // In production: save to database using Prisma
        // await prisma.form.create({ data: newForm })

        return NextResponse.json({
            success: true,
            data: newForm,
        }, { status: 201 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to create form",
        }, { status: 400 })
    }
}
