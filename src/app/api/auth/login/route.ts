import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// POST /api/auth/login - Handle login
export async function POST(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const body = await request.json()
 const { email, password } = body

 if (!email || !password) {
 return NextResponse.json({
 success: false,
 error: "Email and password are required",
 }, { status: 400 })
 }

 // Find user by email
 const user = await prisma.user.findUnique({
 where: { email },
 include: {
 workspaces: {
 include: {
 workspace: true
 },
 take: 1 // Get first workspace
 }
 }
 })

 if (!user) {
 return NextResponse.json({
 success: false,
 error: "Invalid email or password",
 }, { status: 401 })
 }

 // Check if user has a password (might be OAuth-only user)
 if (!user.password) {
 return NextResponse.json({
 success: false,
 error: "Please use Google Sign-In for this account",
 }, { status: 401 })
 }

 // Verify password with bcrypt
 const isPasswordValid = await bcrypt.compare(password, user.password)

 if (!isPasswordValid) {
 return NextResponse.json({
 success: false,
 error: "Invalid email or password",
 }, { status: 401 })
 }

 // Get or create workspace
 let workspace = user.workspaces[0]?.workspace

 if (!workspace) {
 // Create default workspace if user doesn't have one
 const workspaceSlug = `${user.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}-workspace-${Date.now()}`
 workspace = await prisma.workspace.create({
 data: {
 name: `${user.name || 'My'}'s Workspace`,
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

 // Create auth token
 const token = `auth_${Date.now()}_${user.id}`

 const response = NextResponse.json({
 success: true,
 data: {
 user: {
 id: user.id,
 name: user.name,
 email: user.email,
 image: user.image,
 },
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
 } catch (error: unknown) {
 console.error("Login error:", error)
 return NextResponse.json({
 success: false,
 error: "Login failed. Please try again.",
 }, { status: 500 })
 }
}
