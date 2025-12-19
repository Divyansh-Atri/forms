import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// POST /api/auth/signup - Handle user registration
export async function POST(request: NextRequest) {
    try {
        const { prisma } = await import('@/lib/db')
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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: "An account with this email already exists",
            }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user in database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        })

        // Create default workspace for user
        const workspaceSlug = `${name.toLowerCase().replace(/\s+/g, '-')}-workspace-${Date.now()}`
        const workspace = await prisma.workspace.create({
            data: {
                name: `${name}'s Workspace`,
                slug: workspaceSlug,
                members: {
                    create: {
                        userId: user.id,
                        role: "OWNER",
                    }
                }
            }
        })

        // Create auth token (simple for now)
        const token = `auth_${Date.now()}_${user.id}`

        const response = NextResponse.json({
            success: true,
            data: {
                user,
                workspace,
                message: "Account created successfully",
            },
        }, { status: 201 })

        // Set auth cookies
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        response.cookies.set('user-id', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set('workspace-id', workspace.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        })

        return response
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({
            success: false,
            error: "Registration failed. Please try again.",
        }, { status: 500 })
    }
}
