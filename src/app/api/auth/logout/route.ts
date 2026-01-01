import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth/logout - Handle logout
export async function POST(request: NextRequest) {
 const response = NextResponse.json({
 success: true,
 message: "Logged out successfully",
 })

 // Clear auth cookie
 response.cookies.set('auth-token', '', {
 httpOnly: true,
 secure: process.env.NODE_ENV === 'production',
 sameSite: 'lax',
 maxAge: 0, // Expire immediately
 })

 return response
}
