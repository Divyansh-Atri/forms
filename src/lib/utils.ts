import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
 return title
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/(^-|-$)/g, '') +
 '-' +
 Math.random().toString(36).substring(2, 8)
}

export function formatDate(date: Date | string): string {
 return new Intl.DateTimeFormat('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 }).format(new Date(date))
}

export function timeAgo(date: Date | string): string {
 const now = new Date()
 const then = new Date(date)
 const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

 if (seconds < 60) return 'just now'
 if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
 if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
 if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
 return formatDate(date)
}

export function generateToken(length: number = 32): string {
 const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
 let result = ''
 for (let i = 0; i < length; i++) {
 result += chars.charAt(Math.floor(Math.random() * chars.length))
 }
 return result
}
