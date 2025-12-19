import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

// Maximum file size in bytes (5MB default)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const maxSizeMB = formData.get('maxSize') as string | null

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'No file provided',
            }, { status: 400 })
        }

        // Check file size
        const maxSize = maxSizeMB ? parseInt(maxSizeMB) * 1024 * 1024 : MAX_FILE_SIZE
        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                error: `File size exceeds ${maxSizeMB || 5}MB limit`,
            }, { status: 400 })
        }

        // Check if Blob token is configured
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('BLOB_READ_WRITE_TOKEN not configured')
            return NextResponse.json({
                success: false,
                error: 'File storage not configured',
            }, { status: 500 })
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        })

        return NextResponse.json({
            success: true,
            data: {
                url: blob.url,
                name: file.name,
                size: file.size,
                type: file.type,
            },
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to upload file',
        }, { status: 500 })
    }
}
