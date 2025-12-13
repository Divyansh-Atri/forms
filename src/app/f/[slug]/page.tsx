"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle, Loader2 } from "lucide-react"

interface FormQuestion {
    id: string
    type: string
    title: string
    required: boolean
    description?: string
    choices?: Array<{ id: string; label: string }>
    min?: number
    max?: number
}

interface FormData {
    id: string
    title: string
    description: string
    slug: string
    questions: FormQuestion[]
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
        case "SHORT_TEXT":
        case "EMAIL":
        case "NUMBER":
            return (
                <Input
                    type={question.type === "NUMBER" ? "number" : "text"}
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="text-lg py-6"
                    autoFocus
                />
            )

        case "LONG_TEXT":
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

        case "SINGLE_CHOICE":
            return (
                <RadioGroup
                    value={(value as string) || ""}
                    onValueChange={onChange}
                    className="space-y-3"
                >
                    {question.choices?.map((choice) => (
                        <div
                            key={choice.id}
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${value === choice.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => onChange(choice.id)}
                        >
                            <RadioGroupItem value={choice.id} id={choice.id} />
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

        case "STAR_RATING":
            const max = question.max || 5
            return (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: max }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => onChange(i + 1)}
                            className={`text-5xl transition-all transform hover:scale-110 ${((value as number) || 0) > i
                                ? "text-yellow-400 drop-shadow-lg"
                                : "text-gray-300 hover:text-yellow-300"
                                }`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            )

        case "DATE":
            return (
                <Input
                    type="date"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-lg py-6"
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
