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

        // Import Prisma (dynamically to avoid build errors if env var not set yet)
        const { prisma } = await import("@/lib/db")

        // Ensure User exists in DB
        const user = await prisma.user.upsert({
            where: { email },
            update: { name: "Sanjeev Atri" },
            create: {
                email,
                name: "Sanjeev Atri",
                password: "hashed_password_placeholder", // In a real app, hash this
            },
        })

        // Ensure Default Workspace exists
        const workspaceSlug = "sanjeev-workspace"
        let workspace = await prisma.workspace.findUnique({
            where: { slug: workspaceSlug },
        });

        if (!workspace) {
            workspace = await prisma.workspace.create({
                data: {
                    name: "Sanjeev's Workspace",
                    slug: workspaceSlug,
                    members: {
                        create: {
                            userId: user.id,
                            role: "OWNER",
                        }
                    }
                }
            })
        }

        // In production: create JWT or session token
        const token = `mock_token_${Date.now()}` // You should use proper JWT here in next steps

        const response = NextResponse.json({
            success: true,
            data: {
                user,
                workspace,
                token,
            },
        })

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
        console.error("Login error:", error)
        return NextResponse.json({
            success: false,
            error: "Login failed - Database connection might be missing",
        }, { status: 500 })
    }
}
