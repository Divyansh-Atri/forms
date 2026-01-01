import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/forms/import-csv - Import form structure from CSV
export async function POST(request: NextRequest) {
 try {
 const { prisma } = await import('@/lib/db')
 const cookieStore = await cookies()
 const userId = cookieStore.get('user-id')?.value
 const workspaceId = cookieStore.get('workspace-id')?.value

 if (!userId || !workspaceId) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const formData = await request.formData()
 const file = formData.get('file') as File
 const formTitle = formData.get('title') as string || 'Imported Form'

 if (!file) {
 return NextResponse.json(
 { success: false, error: 'No file provided' },
 { status: 400 }
 )
 }

 // Read CSV content
 const csvContent = await file.text()
 const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line)

 if (lines.length < 2) {
 return NextResponse.json(
 { success: false, error: 'CSV must have at least a header row and one data row' },
 { status: 400 }
 )
 }

 // Parse CSV - first row is headers (field names)
 const headers = parseCSVLine(lines[0])

 // Create questions from headers
 const questions = headers.map((header, index) => ({
 id: `q_${index}_${Date.now()}`,
 type: detectFieldType(header),
 title: header,
 description: '',
 required: false,
 order: index
 }))

 // Generate unique slug
 const baseSlug = formTitle
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/^-+|-+$/g, '')

 let slug = baseSlug
 let counter = 1
 while (await prisma.form.findUnique({ where: { slug } })) {
 slug = `${baseSlug}-${counter++}`
 }

 // Create form
 const form = await prisma.form.create({
 data: {
 title: formTitle,
 description: `Imported from CSV with ${headers.length} fields`,
 slug,
 status: 'DRAFT',
 questions,
 workspaceId,
 createdById: userId
 }
 })

 // If there are data rows, optionally create responses
 const dataRows = lines.slice(1)
 let responsesCreated = 0

 if (dataRows.length > 0) {
 const responses = dataRows.map(line => {
 const values = parseCSVLine(line)
 const data: Record<string, string> = {}
 headers.forEach((header, index) => {
 const question = questions[index]
 if (question && values[index]) {
 data[question.id] = values[index]
 }
 })
 return {
 formId: form.id,
 data,
 isComplete: true,
 completedAt: new Date()
 }
 })

 await prisma.response.createMany({
 data: responses
 })
 responsesCreated = responses.length
 }

 return NextResponse.json({
 success: true,
 data: {
 id: form.id,
 title: form.title,
 slug: form.slug,
 fieldsCount: headers.length,
 responsesCreated
 }
 })

 } catch (error) {
 console.error('CSV import error:', error)
 return NextResponse.json(
 {
 success: false,
 error: 'Failed to import CSV',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 )
 }
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
 const result: string[] = []
 let current = ''
 let inQuotes = false

 for (let i = 0; i < line.length; i++) {
 const char = line[i]

 if (char === '"') {
 inQuotes = !inQuotes
 } else if (char === ',' && !inQuotes) {
 result.push(current.trim())
 current = ''
 } else {
 current += char
 }
 }

 result.push(current.trim())
 return result
}

// Detect field type from header name
function detectFieldType(header: string): string {
 const lowerHeader = header.toLowerCase()

 if (lowerHeader.includes('email')) return 'EMAIL'
 if (lowerHeader.includes('phone') || lowerHeader.includes('tel')) return 'PHONE'
 if (lowerHeader.includes('date') || lowerHeader.includes('dob')) return 'DATE'
 if (lowerHeader.includes('number') || lowerHeader.includes('count') || lowerHeader.includes('qty') || lowerHeader.includes('amount')) return 'NUMBER'
 if (lowerHeader.includes('address') || lowerHeader.includes('description') || lowerHeader.includes('comment')) return 'LONG_TEXT'
 if (lowerHeader.includes('url') || lowerHeader.includes('link') || lowerHeader.includes('website')) return 'URL'

 return 'SHORT_TEXT'
}
