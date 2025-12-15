import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth/signup - Handle user registration
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, password } = body

        if (!email || !password || !name) {
            return NextResponse.json({
                success: false,
                error: "Name, email, and password are required",
            }, { status: 400 })
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                error: "Invalid email format",
            }, { status: 400 })
        }

        // Password validation
        if (password.length < 8) {
            return NextResponse.json({
                success: false,
                error: "Password must be at least 8 characters",
            }, { status: 400 })
        }

        // In production: check if user exists and hash password
        // const existingUser = await prisma.user.findUnique({ where: { email } })
        // const hashedPassword = await bcrypt.hash(password, 10)
        // const user = await prisma.user.create({ data: { name, email, password: hashedPassword } })

        // Registration is disabled for this single-user instance
        return NextResponse.json({
            success: false,
            error: "Registration is disabled. Please log in with your credentials.",
        }, { status: 403 })


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Registration failed",
        }, { status: 400 })
    }
}
