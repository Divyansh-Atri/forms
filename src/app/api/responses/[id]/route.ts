import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// DELETE /api/responses/[id] - Delete a single response
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { prisma } = await import('@/lib/db')
        const { id } = await params
        const cookieStore = await cookies()
        const userId = cookieStore.get('user-id')?.value
        const workspaceId = cookieStore.get('workspace-id')?.value

        if (!userId || !workspaceId) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized",
            }, { status: 401 })
        }

        // Get response and verify ownership
        const response = await prisma.response.findUnique({
            where: { id },
            include: {
                form: {
                    select: { workspaceId: true }
                }
            }
        })

        if (!response) {
            return NextResponse.json({
                success: false,
                error: "Response not found",
            }, { status: 404 })
        }

        if (response.form.workspaceId !== workspaceId) {
            return NextResponse.json({
                success: false,
                error: "Access denied",
            }, { status: 403 })
        }

        // Extract file URLs from response data for blob cleanup
        const fileUrls: string[] = []
        const data = response.data as Record<string, unknown>
        for (const value of Object.values(data)) {
            if (value && typeof value === 'object' && 'url' in value) {
                const fileValue = value as { url?: string }
                if (fileValue.url && fileValue.url.includes('blob.vercel-storage.com')) {
                    fileUrls.push(fileValue.url)
                }
            }
        }

        // Delete files from blob storage
        if (fileUrls.length > 0) {
            try {
                const { del } = await import('@vercel/blob')
                await del(fileUrls)
            } catch (blobError) {
                console.error('Failed to delete blob files:', blobError)
            }
        }

        // Delete the response
        await prisma.response.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: "Response deleted",
            filesDeleted: fileUrls.length,
        })
    } catch (error) {
        console.error("Failed to delete response:", error)
        return NextResponse.json({
            success: false,
            error: "Failed to delete response"
        }, { status: 500 })
    }
}
