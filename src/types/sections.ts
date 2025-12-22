// Types for sectioned forms

export interface SectionField {
    name: string
    label: string
    type: 'text' | 'number' | 'date' | 'email' | 'tel' | 'url' | 'textarea'
    required?: boolean
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
    }
    return typeMap[fieldType] || 'SHORT_TEXT'
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
