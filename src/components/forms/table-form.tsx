"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle } from "lucide-react"

interface TableFormProps {
    sections: Array<{
        id: string
        title: string
        description?: string
        order: number
        questions: any[]
    }>
    formTitle: string
    formDescription?: string
    responseData: Record<string, any>
    onDataChange: (data: Record<string, any>) => void
    onSubmit: () => void
    isSubmitting: boolean
}

export function TableForm({
    sections,
    formTitle,
    formDescription,
    responseData,
    onDataChange,
    onSubmit,
    isSubmitting
}: TableFormProps) {
    const [isComplete, setIsComplete] = useState(false)

    const handleInputChange = (fieldId: string, value: any) => {
        onDataChange({
            ...responseData,
            [fieldId]: value
        })
    }

    const handleSubmit = async () => {
        await onSubmit()
        setIsComplete(true)
    }

    if (isComplete) {
        return (
            <Card className="max-w-4xl mx-auto my-8">
                <CardContent className="pt-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                    <p className="text-muted-foreground">Your response has been recorded.</p>
                    <Button
                        className="mt-6"
                        variant="outline"
                        onClick={() => {
                            setIsComplete(false)
                            onDataChange({})
                        }}
                    >
                        Submit Another Response
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            {/* Form Header */}
            <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                    <CardTitle className="text-2xl">{formTitle}</CardTitle>
                    {formDescription && (
                        <p className="text-muted-foreground">{formDescription}</p>
                    )}
                </CardHeader>
            </Card>

            {/* Sections as Tables */}
            {sections.map((section) => (
                <Card key={section.id}>
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.description && (
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="text-left p-3 border-b font-medium text-sm text-slate-600 dark:text-slate-300 w-1/3">
                                            Field
                                        </th>
                                        <th className="text-left p-3 border-b font-medium text-sm text-slate-600 dark:text-slate-300">
                                            Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section.questions.map((question: any, idx: number) => (
                                        <tr
                                            key={question.id}
                                            className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}
                                        >
                                            <td className="p-3 border-b align-top">
                                                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                                    {question.title}
                                                    {question.required && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </div>
                                                {question.description && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {question.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 border-b">
                                                {renderField(question, responseData[question.id], (value) => handleInputChange(question.id, value))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Submit Button */}
            <div className="flex justify-center pb-8">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Form'
                    )}
                </Button>
            </div>
        </div>
    )
}

// Render appropriate input based on field type
function renderField(
    question: any,
    value: any,
    onChange: (value: any) => void
) {
    const type = question.type?.toLowerCase() || 'short_text'

    switch (type) {
        case 'short_text':
        case 'text':
        case 'email':
        case 'phone':
        case 'url':
            return (
                <Input
                    type={type === 'email' ? 'email' : type === 'phone' ? 'tel' : type === 'url' ? 'url' : 'text'}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder || `Enter ${question.title.toLowerCase()}`}
                    className="max-w-md"
                />
            )

        case 'long_text':
        case 'textarea':
            return (
                <Textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={question.placeholder || `Enter ${question.title.toLowerCase()}`}
                    rows={2}
                    className="max-w-md"
                />
            )

        case 'number':
            return (
                <Input
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="0"
                    className="max-w-[150px]"
                />
            )

        case 'date':
            return (
                <Input
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="max-w-[200px]"
                />
            )

        default:
            return (
                <Input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`Enter value`}
                    className="max-w-md"
                />
            )
    }
}
