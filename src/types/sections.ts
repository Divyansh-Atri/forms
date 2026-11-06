// Types for sectioned forms

export interface SectionField {
 name: string
 label: string
 type: 'text' | 'number' | 'date' | 'email' | 'tel' | 'url' | 'textarea' | 'file' | 'image'
 required?: boolean
 // For type "file" / "image"
 accept?: string | string[] // e.g. "image/*", "pdf, docx", ["images", "pdf"]
 maxFiles?: number // default 1, at most 10
 maxSizeMB?: number // default and maximum 4
 placeholder?: string
 defaultValue?: string | number
 validation?: {
 min?: number
 max?: number
 pattern?: string
 minLength?: number
 maxLength?: number
 }
}

export interface FormSection {
 id: string
 title: string
 description?: string
 order: number
 fields: SectionField[]
}

export interface SectionedFormJSON {
 title: string
 description?: string
 sections: Array<{
 id: string
 title: string
 fields: Array<{
 name: string
 label: string
 type: string
 required?: boolean
 }>
 }>
}

export interface SectionedForm {
 id: string
 title: string
 description?: string
 sections: FormSection[]
 createdAt: Date
 updatedAt: Date
}

// Convert JSON import format to internal Question format
export function convertSectionFieldToQuestion(field: SectionField, sectionId: string, order: number): any {
 const baseQuestion = {
 id: `${sectionId}_${field.name}`,
 type: mapFieldTypeToQuestionType(field.type),
 title: field.label,
 description: field.placeholder || '',
 required: field.required || false,
 order,
 sectionId,
 }

 // File fields carry their upload rules ("image" means photos only)
 if (baseQuestion.type === 'FILE_UPLOAD') {
 const kind = field.type.toLowerCase()
 const accept = field.accept ?? (kind === 'image' || kind === 'photo' ? 'image/*' : undefined)
 return {
 ...baseQuestion,
 ...(accept !== undefined && { allowedTypes: Array.isArray(accept) ? accept : accept.split(',').map((t) => t.trim()) }),
 ...(field.maxFiles !== undefined && { maxFiles: field.maxFiles }),
 ...(field.maxSizeMB !== undefined && { maxFileSize: field.maxSizeMB }),
 }
 }

 // Add validation if present
 if (field.validation) {
 return {
 ...baseQuestion,
 validation: field.validation
 }
 }

 return baseQuestion
}

function mapFieldTypeToQuestionType(fieldType: string): string {
 const typeMap: Record<string, string> = {
 'text': 'SHORT_TEXT',
 'textarea': 'LONG_TEXT',
 'number': 'NUMBER',
 'date': 'DATE',
 'email': 'EMAIL',
 'tel': 'PHONE',
 'url': 'URL',
 'file': 'FILE_UPLOAD',
 'files': 'FILE_UPLOAD',
 'upload': 'FILE_UPLOAD',
 'fileupload': 'FILE_UPLOAD',
 'attachment': 'FILE_UPLOAD',
 'image': 'FILE_UPLOAD',
 'photo': 'FILE_UPLOAD',
 }
 return typeMap[fieldType.toLowerCase()] || 'SHORT_TEXT'
}

// Validate imported JSON structure
export function validateSectionedFormJSON(data: any): { valid: boolean; errors: string[] } {
 const errors: string[] = []

 if (!data.title || typeof data.title !== 'string') {
 errors.push('Form title is required')
 }

 if (!Array.isArray(data.sections)) {
 errors.push('Sections must be an array')
 return { valid: false, errors }
 }

 if (data.sections.length === 0) {
 errors.push('At least one section is required')
 }

 data.sections.forEach((section: any, sIdx: number) => {
 if (!section.id || typeof section.id !== 'string') {
 errors.push(`Section ${sIdx + 1}: id is required`)
 }
 if (!section.title || typeof section.title !== 'string') {
 errors.push(`Section ${sIdx + 1}: title is required`)
 }
 if (!Array.isArray(section.fields)) {
 errors.push(`Section ${sIdx + 1}: fields must be an array`)
 } else {
 section.fields.forEach((field: any, fIdx: number) => {
 if (!field.name || typeof field.name !== 'string') {
 errors.push(`Section ${sIdx + 1}, Field ${fIdx + 1}: name is required`)
 }
 if (!field.label || typeof field.label !== 'string') {
 errors.push(`Section ${sIdx + 1}, Field ${fIdx + 1}: label is required`)
 }
 if (!field.type || typeof field.type !== 'string') {
 errors.push(`Section ${sIdx + 1}, Field ${fIdx + 1}: type is required`)
 }
 })
 }
 })

 return {
 valid: errors.length === 0,
 errors
 }
}
