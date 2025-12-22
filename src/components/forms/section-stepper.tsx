"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

interface Section {
    id: string
    title: string
    description?: string
    order: number
    questions: any[]
}

interface SectionStepperProps {
    sections: Section[]
    formTitle: string
    formDescription?: string
    responseData: Record<string, any>
    onDataChange: (data: Record<string, any>) => void
    onSubmit: () => void
    isSubmitting: boolean
}

export function SectionStepper({
    sections,
    formTitle,
    formDescription,
    responseData,
    onDataChange,
    onSubmit,
    isSubmitting
}: SectionStepperProps) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

    if (sections.length === 0) {
        return null
    }

    const currentSection = sections[currentSectionIndex]
    const totalSections = sections.length
    const progressPercentage = ((currentSectionIndex + 1) / totalSections) * 100
    const isFirstSection = currentSectionIndex === 0
    const isLastSection = currentSectionIndex === totalSections - 1

    const handlePrevious = () => {
        if (!isFirstSection) {
            setCurrentSectionIndex(currentSectionIndex - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleNext = () => {
        if (!isLastSection) {
            setCurrentSectionIndex(currentSectionIndex + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleFieldChange = (questionId: string, value: any) => {
        onDataChange({
            ...responseData,
            [questionId]: value
        })
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formTitle}
                        </h1>
                        {formDescription && (
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                {formDescription}
                            </p>
                        )}
                    </div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Section {currentSectionIndex + 1} of {totalSections}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Current Section */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-6">
                {/* Section Header */}
                <div className="border-l-4 border-blue-600 pl-4 mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {currentSection.title}
                    </h2>
                    {currentSection.description && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {currentSection.description}
                        </p>
                    )}
                </div>

                {/* Section Fields */}
                <div className="space-y-6">
                    {currentSection.questions.map((question: any, index: number) => (
                        <div key={question.id || index}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                {question.title || question.label}
                                {question.required && <span className="text-blue-600 ml-1">*</span>}
                            </label>

                            {/* Render field based on type */}
                            {(question.type === 'SHORT_TEXT' || question.type === 'text') && (
                                <input
                                    type="text"
                                    value={responseData[question.id] || ''}
                                    onChange={(e) => handleFieldChange(question.id, e.target.value)}
                                    required={question.required}
                                    placeholder={question.description || question.placeholder}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            )}

                            {(question.type === 'NUMBER' || question.type === 'number') && (
                                <input
                                    type="number"
                                    value={responseData[question.id] || ''}
                                    onChange={(e) => handleFieldChange(question.id, e.target.value)}
                                    required={question.required}
                                    placeholder={question.description || question.placeholder}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            )}

                            {(question.type === 'DATE' || question.type === 'date') && (
                                <input
                                    type="date"
                                    value={responseData[question.id] || ''}
                                    onChange={(e) => handleFieldChange(question.id, e.target.value)}
                                    required={question.required}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            )}

                            {(question.type === 'LONG_TEXT' || question.type === 'textarea') && (
                                <textarea
                                    value={responseData[question.id] || ''}
                                    onChange={(e) => handleFieldChange(question.id, e.target.value)}
                                    required={question.required}
                                    placeholder={question.description || question.placeholder}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isFirstSection || isSubmitting}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                {isLastSection ? (
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Submit Form
                            </>
                        )}
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Next Section
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>

            {/* Section Navigation (Optional - shows all sections) */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-2">
                    {sections.map((section, index) => (
                        <button
                            key={section.id}
                            onClick={() => {
                                setCurrentSectionIndex(index)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${index === currentSectionIndex
                                    ? 'bg-blue-600 text-white'
                                    : index < currentSectionIndex
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                            disabled={isSubmitting}
                        >
                            {index + 1}. {section.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
