"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { SectionStepper } from "@/components/forms/section-stepper"
import { FileText, CheckCircle, Loader2, Upload } from "lucide-react"

interface FormQuestion {
    id: string
    type: string
    title: string
    description?: string
    required?: boolean
    choices?: Array<{ id: string; label: string; imageUrl?: string }>
    max?: number
    min?: number
    minLabel?: string
    maxLabel?: string
    consentText?: string
    rows?: string[]
    columns?: string[]
}

interface FormData {
    id: string
    title: string
    description: string
    slug: string
    questions: FormQuestion[]
    formSections?: Array<{
        id: string
        title: string
        description?: string
        order: number
        questions: any[]
    }>
    theme?: {
        primaryColor?: string
        backgroundColor?: string
    }
    settings?: {
        showProgressBar?: boolean
        acceptingResponses?: boolean
    }
}

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params)
    const [form, setForm] = useState<FormData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentStep, setCurrentStep] = useState(0) // 0 = welcome, 1+ = questions, -1 = thank you
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch form from API
    useEffect(() => {
        async function fetchForm() {
            try {
                setIsLoading(true)
                const response = await fetch(`/api/forms/public/${resolvedParams.slug}`)
                const result = await response.json()

                if (result.success) {
                    setForm(result.data)
                } else {
                    setError(result.error || 'Form not found')
                }
            } catch {
                setError('Failed to load form')
            } finally {
                setIsLoading(false)
            }
        }

        fetchForm()
    }, [resolvedParams.slug])

    const totalQuestions = form?.questions.length || 0

    const updateAnswer = (questionId: string, value: unknown) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }

    const currentQuestion = form && currentStep > 0 ? form.questions[currentStep - 1] : null

    const canProceed = () => {
        if (currentStep === 0) return true
        if (!currentQuestion) return true
        if (!currentQuestion.required) return true
        const answer = answers[currentQuestion.id]
        return answer !== undefined && answer !== "" && answer !== null
    }

    const handleNext = () => {
        if (currentStep === 0) {
            setCurrentStep(1)
        } else if (currentStep <= totalQuestions) {
            if (currentStep === totalQuestions) {
                handleSubmit()
            } else {
                setCurrentStep(currentStep + 1)
            }
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        if (!form) return

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: form.id,
                    data: answers,
                    metadata: {
                        userAgent: navigator.userAgent,
                        referrer: document.referrer,
                    },
                }),
            })

            const result = await response.json()
            if (result.success) {
                setCurrentStep(-1)
            } else {
                alert('Failed to submit response')
            }
        } catch {
            alert('Failed to submit response')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Card className="p-8 text-center max-w-md">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
                    <p className="text-muted-foreground">{error || 'This form does not exist or is no longer accepting responses.'}</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-2xl mx-auto min-h-screen flex flex-col py-8 px-4">
                {/* Check if form has sections */}
                {form.formSections && form.formSections.length > 0 ? (
                    // Sectioned Form - Use Stepper
                    <SectionStepper
                        sections={form.formSections}
                        formTitle={form.title}
                        formDescription={form.description}
                        responseData={answers}
                        onDataChange={setAnswers}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                ) : (
                    // Regular Form - Use Original Flow
                    <>
                        {/* Progress Bar */}
                        {currentStep > 0 && currentStep <= totalQuestions && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                    <span>Question {currentStep} of {totalQuestions}</span>
                                    <span>{Math.round((currentStep / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                        style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-center">
                            {/* Welcome Screen */}
                            {currentStep === 0 && (
                                <Card className="w-full p-8 animate-fade-in">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold mb-4">{form.title}</h1>
                                        <p className="text-lg text-muted-foreground mb-8">{form.description}</p>
                                        <Button size="lg" onClick={handleNext}>
                                            Start Survey
                                        </Button>
                                        <p className="text-sm text-muted-foreground mt-4">
                                            Takes about 2 minutes
                                        </p>
                                    </div>
                                </Card>
                            )}

                            {/* Question */}
                            {currentStep > 0 && currentStep <= totalQuestions && currentQuestion && (
                                <Card className="w-full p-8 animate-slide-up">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold mb-2">
                                            {currentQuestion.title}
                                            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                                        </h2>
                                        {currentQuestion.description && (
                                            <p className="text-muted-foreground">{currentQuestion.description}</p>
                                        )}
                                    </div>

                                    <div className="mb-8">
                                        <QuestionInput
                                            question={currentQuestion}
                                            value={answers[currentQuestion.id]}
                                            onChange={(value) => updateAnswer(currentQuestion.id, value)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 1}>
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!canProceed()}
                                            loading={isSubmitting}
                                        >
                                            {currentStep === totalQuestions ? "Submit" : "Next"}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Thank You Screen */}
                            {currentStep === -1 && (
                                <Card className="w-full p-8 text-center animate-scale-in">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
                                    <p className="text-lg text-muted-foreground mb-8">
                                        Your response has been successfully submitted.
                                    </p>
                                    <Button variant="outline" onClick={() => {
                                        setCurrentStep(0)
                                        setAnswers({})
                                    }}>
                                        Submit Another Response
                                    </Button>
                                </Card>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                                Powered by <span className="font-semibold">Forms</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// Question input component
function QuestionInput({
    question,
    value,
    onChange,
}: {
    question: FormQuestion
    value: unknown
    onChange: (value: unknown) => void
}) {
    switch (question.type) {
        case "shortText":
        case "email":
        case "number":
            return (
                <Input
                    type={question.type === "number" ? "number" : "text"}
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="text-lg py-6"
                    autoFocus
                />
            )

        case "longText":
            return (
                <Textarea
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="text-lg"
                    autoFocus
                />
            )

        case "singleChoice":
            return (
                <RadioGroup
                    value={(value as string) || ""}
                    onValueChange={onChange}
                    className="space-y-3"
                >
                    {question.choices?.map((choice) => (
                        <div
                            key={choice.id}
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${value === choice.label
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => onChange(choice.label)}
                        >
                            <RadioGroupItem value={choice.label} id={choice.id} />
                            <Label
                                htmlFor={choice.id}
                                className="flex-1 cursor-pointer ml-3 text-base"
                            >
                                {choice.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            )

        case "multipleChoice":
            const selectedValues = (value as string[]) || []
            return (
                <div className="space-y-3">
                    {question.choices?.map((choice) => (
                        <div
                            key={choice.id}
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedValues.includes(choice.label)
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => {
                                const newValues = selectedValues.includes(choice.label)
                                    ? selectedValues.filter(v => v !== choice.label)
                                    : [...selectedValues, choice.label]
                                onChange(newValues)
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(choice.label)}
                                onChange={() => { }}
                                className="w-5 h-5 rounded"
                            />
                            <Label className="flex-1 cursor-pointer ml-3 text-base">
                                {choice.label}
                            </Label>
                        </div>
                    ))}
                </div>
            )

        case "dropdown":
            return (
                <select
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-4 text-lg rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                >
                    <option value="">Select an option...</option>
                    {question.choices?.map((choice) => (
                        <option key={choice.id} value={choice.label}>
                            {choice.label}
                        </option>
                    ))}
                </select>
            )

        case "linearScale":
            const min = question.min || 1
            const scaleMax = question.max || 10
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        {Array.from({ length: scaleMax - min + 1 }, (_, i) => {
                            const num = min + i
                            return (
                                <button
                                    key={num}
                                    onClick={() => onChange(num)}
                                    className={`flex-1 py-4 px-2 rounded-lg border-2 font-semibold transition-all ${value === num
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    {num}
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{question.minLabel || "Low"}</span>
                        <span>{question.maxLabel || "High"}</span>
                    </div>
                </div>
            )

        case "nps":
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-1">
                        {Array.from({ length: 11 }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => onChange(i)}
                                className={`flex-1 py-3 px-1 rounded-lg border-2 font-semibold transition-all text-sm ${value === i
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Not likely</span>
                        <span>Very likely</span>
                    </div>
                </div>
            )

        case "ranking":
            const rankItems = (value as string[]) || question.choices?.map(c => c.label) || []
            return (
                <div className="space-y-2">
                    {rankItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="font-bold text-lg w-8">{index + 1}</span>
                            <span className="flex-1">{item}</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        if (index > 0) {
                                            const newItems = [...rankItems]
                                                ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
                                            onChange(newItems)
                                        }
                                    }}
                                    disabled={index === 0}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => {
                                        if (index < rankItems.length - 1) {
                                            const newItems = [...rankItems]
                                                ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
                                            onChange(newItems)
                                        }
                                    }}
                                    disabled={index === rankItems.length - 1}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                >
                                    ↓
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )
        case "date":
            return (
                <Input
                    type="date"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-lg py-6"
                    autoFocus
                />
            )


        case "time":
            return (
                <Input
                    type="time"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-lg py-6"
                />
            )

        case "consent":
            return (
                <div className="flex items-start gap-3 p-4 border-2 rounded-lg">
                    <input
                        type="checkbox"
                        checked={(value as boolean) || false}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-5 h-5 mt-1 rounded"
                    />
                    <Label className="flex-1 cursor-pointer text-base">
                        {question.consentText || "I agree to the terms and conditions"}
                    </Label>
                </div>
            )

        case "address":
            const addressValue = (value as Record<string, string>) || {}
            return (
                <div className="space-y-3">
                    <Input
                        placeholder="Street Address"
                        value={addressValue.street || ""}
                        onChange={(e) => onChange({ ...addressValue, street: e.target.value })}
                        className="text-lg"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="City"
                            value={addressValue.city || ""}
                            onChange={(e) => onChange({ ...addressValue, city: e.target.value })}
                            className="text-lg"
                        />
                        <Input
                            placeholder="State"
                            value={addressValue.state || ""}
                            onChange={(e) => onChange({ ...addressValue, state: e.target.value })}
                            className="text-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="ZIP Code"
                            value={addressValue.zip || ""}
                            onChange={(e) => onChange({ ...addressValue, zip: e.target.value })}
                            className="text-lg"
                        />
                        <Input
                            placeholder="Country"
                            value={addressValue.country || ""}
                            onChange={(e) => onChange({ ...addressValue, country: e.target.value })}
                            className="text-lg"
                        />
                    </div>
                </div>
            )

        case "signature":
            return (
                <div className="space-y-3">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <p className="text-muted-foreground mb-4">Signature feature requires canvas implementation</p>
                        <Input
                            placeholder="Type your full name as signature"
                            value={(value as string) || ""}
                            onChange={(e) => onChange(e.target.value)}
                            className="text-lg text-center font-signature"
                        />
                    </div>
                </div>
            )

        case "imageChoice":
            return (
                <div className="grid grid-cols-2 gap-4">
                    {question.choices?.map((choice) => (
                        <div
                            key={choice.id}
                            className={`cursor-pointer rounded-lg border-4 overflow-hidden transition-all ${value === choice.label
                                ? "border-primary shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => onChange(choice.label)}
                        >
                            {choice.imageUrl && (
                                <img src={choice.imageUrl} alt={choice.label} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-3 text-center font-medium">{choice.label}</div>
                        </div>
                    ))}
                </div>
            )

        case "matrixSingle":
            const matrixValue = (value as Record<string, string>) || {}
            return (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2"></th>
                                {question.columns?.map((col) => (
                                    <th key={col} className="border p-2 text-sm">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {question.rows?.map((row) => (
                                <tr key={row}>
                                    <td className="border p-2 font-medium">{row}</td>
                                    {question.columns?.map((col) => (
                                        <td key={col} className="border p-2 text-center">
                                            <input
                                                type="radio"
                                                name={row}
                                                checked={matrixValue[row] === col}
                                                onChange={() => onChange({ ...matrixValue, [row]: col })}
                                                className="w-5 h-5"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )

        case "fileUpload":
        case "fileUpload":
            return (
                <FileUploadInput
                    question={question}
                    value={value as { name: string; size: number; url?: string } | null}
                    onChange={onChange}
                />
            )

        default:
            return (
                <Input
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="text-lg py-6"
                />
            )
    }
}

// File Upload Input Component (separate to use hooks properly)
function FileUploadInput({
    question,
    value,
    onChange,
}: {
    question: FormQuestion
    value: { name: string; size: number; url?: string } | null
    onChange: (value: unknown) => void
}) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const handleFileUpload = async (file: File) => {
        const maxSizeMB = question.max || 5
        const maxSize = maxSizeMB * 1024 * 1024

        if (file.size > maxSize) {
            setUploadError(`File size exceeds ${maxSizeMB}MB limit`)
            return
        }

        setIsUploading(true)
        setUploadError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('maxSize', String(maxSizeMB))

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                onChange({
                    name: result.data.name,
                    size: result.data.size,
                    type: result.data.type,
                    url: result.data.url,
                })
            } else {
                setUploadError(result.error || 'Upload failed')
            }
        } catch {
            setUploadError('Failed to upload file')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            {uploadError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {uploadError}
                </div>
            )}
            {!value ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer bg-white dark:bg-gray-800 ${isUploading
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary hover:bg-primary/5'
                        }`}
                    onClick={() => !isUploading && document.getElementById(`file-${question.id}`)?.click()}
                >
                    <input
                        id={`file-${question.id}`}
                        type="file"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file)
                        }}
                    />
                    {isUploading ? (
                        <>
                            <Loader2 className="w-12 h-12 mx-auto text-primary mb-4 animate-spin" />
                            <p className="text-lg text-primary font-medium mb-2">
                                Uploading...
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg text-muted-foreground font-medium mb-2">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Max {question.max || 5}MB
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px]">
                                {value.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {(value.size / 1024 / 1024).toFixed(2)} MB • Uploaded
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange(null)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4"
                    >
                        Remove
                    </Button>
                </div>
            )}
        </div>
    )
}
