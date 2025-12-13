// ================== QUESTION TYPES ==================

export enum QuestionType {
    // Text
    SHORT_TEXT = 'shortText',
    LONG_TEXT = 'longText',
    EMAIL = 'email',
    URL = 'url',
    PHONE = 'phone',
    NUMBER = 'number',

    // Choice
    SINGLE_CHOICE = 'singleChoice',
    MULTIPLE_CHOICE = 'multipleChoice',
    DROPDOWN = 'dropdown',

    // Scale
    LINEAR_SCALE = 'linearScale',
    STAR_RATING = 'starRating',
    NPS = 'nps',
    SLIDER = 'slider',

    // Grid
    MATRIX_SINGLE = 'matrixSingle',
    MATRIX_MULTIPLE = 'matrixMultiple',
    RANKING = 'ranking',

    // Media & Files
    FILE_UPLOAD = 'fileUpload',
    IMAGE_CHOICE = 'imageChoice',
    SIGNATURE = 'signature',

    // Date & Time
    DATE = 'date',
    TIME = 'time',
    DATETIME = 'datetime',

    // Special
    CONSENT = 'consent',
    ADDRESS = 'address',
    STATEMENT = 'statement', // Display text only
}

// Base question interface
export interface BaseQuestion {
    id: string
    type: QuestionType
    title: string
    description?: string
    required: boolean
    imageUrl?: string
    videoUrl?: string

    // Quiz mode
    points?: number
    correctAnswer?: string | string[]
    feedback?: {
        correct?: string
        incorrect?: string
    }

    // Validation
    validation?: QuestionValidation
}

export interface QuestionValidation {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    customError?: string
}

// Choice option
export interface Choice {
    id: string
    label: string
    imageUrl?: string
    isOther?: boolean
}

// Specific question types
export interface TextQuestion extends BaseQuestion {
    type: QuestionType.SHORT_TEXT | QuestionType.LONG_TEXT | QuestionType.EMAIL | QuestionType.URL | QuestionType.PHONE | QuestionType.NUMBER
    placeholder?: string
}

export interface ChoiceQuestion extends BaseQuestion {
    type: QuestionType.SINGLE_CHOICE | QuestionType.MULTIPLE_CHOICE | QuestionType.DROPDOWN
    choices: Choice[]
    hasOther?: boolean
    shuffleChoices?: boolean
}

export interface ScaleQuestion extends BaseQuestion {
    type: QuestionType.LINEAR_SCALE | QuestionType.STAR_RATING | QuestionType.NPS | QuestionType.SLIDER
    min: number
    max: number
    minLabel?: string
    maxLabel?: string
    step?: number
}

export interface MatrixQuestion extends BaseQuestion {
    type: QuestionType.MATRIX_SINGLE | QuestionType.MATRIX_MULTIPLE
    rows: Choice[]
    columns: Choice[]
}

export interface RankingQuestion extends BaseQuestion {
    type: QuestionType.RANKING
    choices: Choice[]
}

export interface FileUploadQuestion extends BaseQuestion {
    type: QuestionType.FILE_UPLOAD
    allowedTypes?: string[]
    maxFileSize?: number // in MB
    maxFiles?: number
}

export interface DateTimeQuestion extends BaseQuestion {
    type: QuestionType.DATE | QuestionType.TIME | QuestionType.DATETIME
    format?: string
}

export interface AddressQuestion extends BaseQuestion {
    type: QuestionType.ADDRESS
    fields: {
        street: boolean
        city: boolean
        state: boolean
        zip: boolean
        country: boolean
    }
}

export interface ConsentQuestion extends BaseQuestion {
    type: QuestionType.CONSENT
    label: string
}

export interface StatementQuestion extends BaseQuestion {
    type: QuestionType.STATEMENT
    buttonLabel?: string
}

export interface SignatureQuestion extends BaseQuestion {
    type: QuestionType.SIGNATURE
}

export interface ImageChoiceQuestion extends BaseQuestion {
    type: QuestionType.IMAGE_CHOICE
    choices: Choice[]
    allowMultiple?: boolean
}

// Union type of all questions
export type Question =
    | TextQuestion
    | ChoiceQuestion
    | ScaleQuestion
    | MatrixQuestion
    | RankingQuestion
    | FileUploadQuestion
    | DateTimeQuestion
    | AddressQuestion
    | ConsentQuestion
    | StatementQuestion
    | SignatureQuestion
    | ImageChoiceQuestion

// ================== FORM TYPES ==================

export interface FormSection {
    id: string
    title?: string
    description?: string
    questions: string[] // Question IDs
}

export interface WelcomeScreen {
    enabled: boolean
    title?: string
    description?: string
    imageUrl?: string
    buttonLabel?: string
}

export interface ThankYouScreen {
    enabled: boolean
    title?: string
    description?: string
    imageUrl?: string
    showScore?: boolean
    redirectUrl?: string
    redirectDelay?: number
}

export interface FormTheme {
    primaryColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
    borderRadius: 'none' | 'small' | 'medium' | 'large'
    backgroundType: 'solid' | 'gradient' | 'image'
    backgroundValue?: string
    logo?: string
    headerImage?: string
}

export interface QuizSettings {
    showCorrectAnswers: 'immediately' | 'afterSubmit' | 'afterReview' | 'never'
    passingScore?: number
    timeLimit?: number // in minutes
    shuffleQuestions?: boolean
    randomizeChoices?: boolean
}

// ================== CONDITIONAL LOGIC ==================

export type LogicOperator = 'AND' | 'OR'

export type ConditionOperator =
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'notContains'
    | 'greaterThan'
    | 'lessThan'
    | 'isEmpty'
    | 'isNotEmpty'
    | 'startsWith'
    | 'endsWith'

export interface Condition {
    id: string
    field: string // question ID or variable
    operator: ConditionOperator
    value: string | number | string[]
}

export interface ConditionGroup {
    id: string
    operator: LogicOperator
    conditions: (Condition | ConditionGroup)[]
}

export type ActionType = 'show' | 'hide' | 'jump' | 'calculate' | 'require'

export interface LogicAction {
    id: string
    type: ActionType
    target: string // question ID, section ID, or variable
    value?: string | number
}

export interface LogicRule {
    id: string
    conditions: ConditionGroup
    actions: LogicAction[]
}

// ================== RESPONSE TYPES ==================

export interface ResponseData {
    [questionId: string]: string | number | string[] | Record<string, string> | null
}

export interface ResponseMetadata {
    userAgent?: string
    browser?: string
    device?: string
    os?: string
    ipAddress?: string
    country?: string
    city?: string
    referrer?: string
}

// ================== API TYPES ==================

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface FormAnalytics {
    totalResponses: number
    completionRate: number
    avgTimeSpent: number
    responsesByDay: { date: string; count: number }[]
    deviceBreakdown: { device: string; count: number }[]
    questionStats: {
        questionId: string
        responses: number
        optionCounts?: Record<string, number>
        avgValue?: number
    }[]
}
