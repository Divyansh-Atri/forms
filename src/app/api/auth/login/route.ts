import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth/login - Handle login
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: "Email and password are required",
            }, { status: 400 })
        }

        // In production: validate against database and create session
        // const user = await prisma.user.findUnique({ where: { email } })
        // const valid = await bcrypt.compare(password, user.password)

        // Mock successful login
        const mockUser = {
            id: "user_1",
            email,
            name: "Demo User",
        }

        // In production: create JWT or session token
        const token = `mock_token_${Date.now()}`

        const response = NextResponse.json({
            success: true,
            data: {
                user: mockUser,
                token,
            },
        })

        // Set auth cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return response
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Login failed",
        }, { status: 401 })
    }
}
