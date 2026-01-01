import { z } from 'zod'

// ================== AUTH SCHEMAS ==================

export const loginSchema = z.object({
 email: z.string().email('Invalid email address'),
 password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 email: z.string().email('Invalid email address'),
 password: z.string().min(8, 'Password must be at least 8 characters'),
 confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
 message: "Passwords don't match",
 path: ['confirmPassword'],
})

// ================== FORM SCHEMAS ==================

export const createFormSchema = z.object({
 title: z.string().min(1, 'Title is required').max(200),
 description: z.string().max(1000).optional(),
 workspaceId: z.string().cuid(),
})

export const updateFormSchema = z.object({
 title: z.string().min(1).max(200).optional(),
 description: z.string().max(1000).optional(),
 status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
 settings: z.record(z.string(), z.unknown()).optional(),
 theme: z.record(z.string(), z.unknown()).optional(),
 questions: z.array(z.record(z.string(), z.unknown())).optional(),
 logic: z.array(z.record(z.string(), z.unknown())).optional(),
 welcomeScreen: z.record(z.string(), z.unknown()).optional(),
 thankYouScreen: z.record(z.string(), z.unknown()).optional(),
})

// ================== QUESTION SCHEMAS ==================

export const choiceSchema = z.object({
 id: z.string(),
 label: z.string().min(1),
 imageUrl: z.string().url().optional(),
 isOther: z.boolean().optional(),
})

export const questionValidationSchema = z.object({
 minLength: z.number().min(0).optional(),
 maxLength: z.number().min(1).optional(),
 min: z.number().optional(),
 max: z.number().optional(),
 pattern: z.string().optional(),
 customError: z.string().optional(),
})

export const baseQuestionSchema = z.object({
 id: z.string(),
 type: z.string(),
 title: z.string().min(1, 'Question title is required'),
 description: z.string().optional(),
 required: z.boolean().default(false),
 imageUrl: z.string().url().optional(),
 videoUrl: z.string().url().optional(),
 points: z.number().min(0).optional(),
 validation: questionValidationSchema.optional(),
})

// ================== RESPONSE SCHEMAS ==================

export const submitResponseSchema = z.object({
 formId: z.string().cuid(),
 data: z.record(z.string(), z.unknown()),
 metadata: z.object({
 userAgent: z.string().optional(),
 referrer: z.string().optional(),
 }).optional(),
})

// ================== WORKSPACE SCHEMAS ==================

export const createWorkspaceSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters').max(50),
})

export const inviteMemberSchema = z.object({
 email: z.string().email('Invalid email address'),
 role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
})

// ================== WEBHOOK SCHEMAS ==================

export const createWebhookSchema = z.object({
 name: z.string().min(1).max(100),
 url: z.string().url('Invalid webhook URL'),
 events: z.array(z.string()).min(1, 'Select at least one event'),
 formId: z.string().cuid().optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CreateFormInput = z.infer<typeof createFormSchema>
export type UpdateFormInput = z.infer<typeof updateFormSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>
