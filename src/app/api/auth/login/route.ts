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

        // Hardcoded credentials as requested
        const ALLOWED_EMAIL = "sanjeevatri81@gmail.com"
        const ALLOWED_PASSWORD = "Sanjeev@99"

        if (email !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
            return NextResponse.json({
                success: false,
                error: "Invalid email or password",
            }, { status: 401 })
        }

        // Mock successful login
        const mockUser = {
            id: "user_1",
            email,
            name: "Sanjeev Atri",
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
