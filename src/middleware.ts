import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute for general API
const MAX_LOGIN_ATTEMPTS = 5 // 5 login attempts per minute
const MAX_FORM_SUBMISSIONS = 10 // 10 form submissions per minute

function getClientIP(request: NextRequest): string {
 const forwarded = request.headers.get('x-forwarded-for')
 const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
 return ip
}

function checkRateLimit(key: string, limit: number): boolean {
 const now = Date.now()
 const record = rateLimit.get(key)

 if (!record || now > record.resetTime) {
 rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
 return true
 }

 if (record.count >= limit) {
 return false
 }

 record.count++
 return true
}

// Clean up old entries periodically
setInterval(() => {
 const now = Date.now()
 for (const [key, value] of rateLimit.entries()) {
 if (now > value.resetTime) {
 rateLimit.delete(key)
 }
 }
}, 60000) // Clean every minute

export function middleware(request: NextRequest) {
 const ip = getClientIP(request)
 const pathname = request.nextUrl.pathname

 // Skip rate limiting for static files
 if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
 return NextResponse.next()
 }

 // Apply rate limiting to API routes
 if (pathname.startsWith('/api')) {
 let limit = MAX_REQUESTS

 // Stricter limits for sensitive endpoints
 if (pathname.includes('/auth/login') || pathname.includes('/auth/signup')) {
 limit = MAX_LOGIN_ATTEMPTS
 } else if (pathname === '/api/responses' && request.method === 'POST') {
 limit = MAX_FORM_SUBMISSIONS
 }

 const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`

 if (!checkRateLimit(key, limit)) {
 return new NextResponse(
 JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
 {
 status: 429,
 headers: {
 'Content-Type': 'application/json',
 'Retry-After': '60'
 }
 }
 )
 }
 }

 // Add security headers to response
 const response = NextResponse.next()

 // Prevent clickjacking
 response.headers.set('X-Frame-Options', 'DENY')

 // Prevent MIME type sniffing
 response.headers.set('X-Content-Type-Options', 'nosniff')

 // XSS Protection
 response.headers.set('X-XSS-Protection', '1; mode=block')

 // Referrer Policy
 response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

 // Permissions Policy
 response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

 // CORS headers for API routes
 if (pathname.startsWith('/api')) {
 const origin = request.headers.get('origin')
 const allowedOrigins = [
 process.env.NEXT_PUBLIC_APP_URL,
 'http://localhost:3000',
 'http://localhost:3001',
 ].filter(Boolean)

 if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
 response.headers.set('Access-Control-Allow-Origin', origin)
 }

 response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
 response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
 response.headers.set('Access-Control-Max-Age', '86400')
 }

 return response
}

export const config = {
 matcher: [
 // Match all paths except static files
 '/((?!_next/static|_next/image|favicon.ico).*)',
 ],
}
