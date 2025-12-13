"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Question, QuestionType } from "@/types"
import {
    GripVertical,
    Trash2,
    Copy,
    MoreVertical,
    Type,
    AlignLeft,
    List,
    CheckSquare,
    ChevronDown,
    Star,
    Hash,
    Sliders,
    Grid3X3,
    Calendar,
    Upload,
    PenTool,
    MapPin,
} from "lucide-react"

interface QuestionCardProps {
    question: Question
    index: number
    isSelected: boolean
    onSelect: () => void
    onDelete: () => void
    onDuplicate: () => void
    onUpdate: (updates: Partial<Question>) => void
}

const questionTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    [QuestionType.SHORT_TEXT]: Type,
    [QuestionType.LONG_TEXT]: AlignLeft,
    [QuestionType.EMAIL]: Type,
    [QuestionType.URL]: Type,
    [QuestionType.PHONE]: Type,
    [QuestionType.NUMBER]: Hash,
    [QuestionType.SINGLE_CHOICE]: List,
    [QuestionType.MULTIPLE_CHOICE]: CheckSquare,
    [QuestionType.DROPDOWN]: ChevronDown,
    [QuestionType.LINEAR_SCALE]: Sliders,
    [QuestionType.STAR_RATING]: Star,
    [QuestionType.NPS]: Hash,
    [QuestionType.SLIDER]: Sliders,
    [QuestionType.MATRIX_SINGLE]: Grid3X3,
    [QuestionType.MATRIX_MULTIPLE]: Grid3X3,
    [QuestionType.RANKING]: Grid3X3,
    [QuestionType.DATE]: Calendar,
    [QuestionType.TIME]: Calendar,
    [QuestionType.DATETIME]: Calendar,
    [QuestionType.FILE_UPLOAD]: Upload,
    [QuestionType.SIGNATURE]: PenTool,
    [QuestionType.ADDRESS]: MapPin,
    [QuestionType.CONSENT]: CheckSquare,
}

const questionTypeLabels: Record<string, string> = {
    [QuestionType.SHORT_TEXT]: "Short Text",
    [QuestionType.LONG_TEXT]: "Paragraph",
    [QuestionType.EMAIL]: "Email",
    [QuestionType.URL]: "URL",
    [QuestionType.PHONE]: "Phone",
    [QuestionType.NUMBER]: "Number",
    [QuestionType.SINGLE_CHOICE]: "Multiple Choice",
    [QuestionType.MULTIPLE_CHOICE]: "Checkboxes",
    [QuestionType.DROPDOWN]: "Dropdown",
    [QuestionType.LINEAR_SCALE]: "Linear Scale",
    [QuestionType.STAR_RATING]: "Star Rating",
    [QuestionType.NPS]: "NPS",
    [QuestionType.SLIDER]: "Slider",
    [QuestionType.MATRIX_SINGLE]: "Matrix (Single)",
    [QuestionType.MATRIX_MULTIPLE]: "Matrix (Multi)",
    [QuestionType.RANKING]: "Ranking",
    [QuestionType.DATE]: "Date",
    [QuestionType.TIME]: "Time",
    [QuestionType.DATETIME]: "Date & Time",
    [QuestionType.FILE_UPLOAD]: "File Upload",
    [QuestionType.SIGNATURE]: "Signature",
    [QuestionType.ADDRESS]: "Address",
    [QuestionType.CONSENT]: "Consent",
}

export function QuestionCard({
    question,
    index,
    isSelected,
    onSelect,
    onDelete,
    onDuplicate,
    onUpdate,
}: QuestionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const Icon = questionTypeIcons[question.type] || Type

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`relative transition-all ${isDragging ? "opacity-50 shadow-lg" : ""
                } ${isSelected ? "ring-2 ring-primary" : ""}`}
            onClick={onSelect}
        >
            <div className="flex items-start p-4">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 mr-3 cursor-grab hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Question Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Q{index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {questionTypeLabels[question.type]}
                        </Badge>
                        {question.required && (
                            <Badge variant="danger" className="text-xs">Required</Badge>
                        )}
                    </div>

                    <Input
                        value={question.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        className="font-medium text-base border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                        placeholder="Enter your question"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {question.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {question.description}
                        </p>
                    )}

                    {/* Preview of question type */}
                    <div className="mt-4">
                        <QuestionPreview question={question} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDuplicate()
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        title="Duplicate"
                    >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>
        </Card>
    )
}

// Question preview component
function QuestionPreview({ question }: { question: Question }) {
    switch (question.type) {
        case QuestionType.SHORT_TEXT:
        case QuestionType.EMAIL:
        case QuestionType.URL:
        case QuestionType.PHONE:
        case QuestionType.NUMBER:
            return (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-muted-foreground text-sm">Short answer text</span>
                </div>
            )

        case QuestionType.LONG_TEXT:
            return (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 h-20">
                    <span className="text-muted-foreground text-sm">Long answer text</span>
                </div>
            )

        case QuestionType.SINGLE_CHOICE:
        case QuestionType.MULTIPLE_CHOICE:
            const choices = (question as any).choices || []
            return (
                <div className="space-y-2">
                    {choices.map((choice: any) => (
                        <div key={choice.id} className="flex items-center gap-2">
                            {question.type === QuestionType.SINGLE_CHOICE ? (
                                <div className="w-4 h-4 rounded-full border-2" />
                            ) : (
                                <div className="w-4 h-4 rounded border-2" />
                            )}
                            <span className="text-sm">{choice.label}</span>
                        </div>
                    ))}
                </div>
            )

        case QuestionType.DROPDOWN:
            return (
                <div className="border rounded-lg p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-muted-foreground text-sm">Select an option</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            )

        case QuestionType.LINEAR_SCALE:
        case QuestionType.STAR_RATING:
            const min = (question as any).min || 1
            const max = (question as any).max || 5
            return (
                <div className="flex items-center gap-2">
                    {Array.from({ length: max - min + 1 }, (_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${question.type === QuestionType.STAR_RATING
                                    ? "text-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {question.type === QuestionType.STAR_RATING ? "★" : min + i}
                        </div>
                    ))}
                </div>
            )

        case QuestionType.NPS:
            return (
                <div className="flex items-center gap-1">
                    {Array.from({ length: 11 }, (_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs ${i <= 6 ? "border-red-200 text-red-500" : i <= 8 ? "border-yellow-200 text-yellow-600" : "border-green-200 text-green-500"
                                }`}
                        >
                            {i}
                        </div>
                    ))}
                </div>
            )

        case QuestionType.DATE:
            return (
                <div className="border rounded-lg p-3 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Pick a date</span>
                </div>
            )

        case QuestionType.FILE_UPLOAD:
            return (
                <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-800/50">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                </div>
            )

        default:
            return (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-muted-foreground text-sm">Preview not available</span>
                </div>
            )
    }
}
