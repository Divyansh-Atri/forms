"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
    ArrowLeft,
    Save,
    Share2,
    Plus,
    Trash2,
} from "lucide-react"
import { QuestionType, Question } from "@/types"
import { QuestionCard } from "@/components/forms/builder/question-card"
import { QuestionPalette } from "@/components/forms/builder/question-palette"
import { QuestionEditor } from "@/components/forms/builder/question-editor"
import { FormPreview } from "@/components/forms/builder/form-preview"
import { ShareModal } from "@/components/forms/share-modal"

// Settings toggle component for inline settings
function SettingsToggle({
    label,
    description,
    defaultChecked = false
}: {
    label: string
    description: string
    defaultChecked?: boolean
}) {
    const [checked, setChecked] = useState(defaultChecked)

    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => setChecked(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    )
}

// Initial mock form data
const initialForm = {
    id: "1",
    title: "Untitled Form",
    description: "",
    slug: "untitled-form",
    questions: [] as Question[],
    status: "DRAFT",
}

export default function FormEditorPage() {
    const [form, setForm] = useState(initialForm)
    const [activeTab, setActiveTab] = useState<"build" | "preview" | "settings">("build")
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
    const [showShareModal, setShowShareModal] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (_event: DragStartEvent) => {
        // Drag tracking handled by dnd-kit
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setForm((prev) => {
                const oldIndex = prev.questions.findIndex((q) => q.id === active.id)
                const newIndex = prev.questions.findIndex((q) => q.id === over.id)

                return {
                    ...prev,
                    questions: arrayMove(prev.questions, oldIndex, newIndex),
                }
            })
        }
    }

    const addQuestion = useCallback((type: QuestionType) => {
        const newQuestion: Question = {
            id: `q_${Date.now()}`,
            type,
            title: "Untitled Question",
            required: false,
        } as Question

        // Add type-specific defaults
        if (type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.DROPDOWN) {
            (newQuestion as any).choices = [
                { id: "opt_1", label: "Option 1" },
                { id: "opt_2", label: "Option 2" },
            ]
        } else if (type === QuestionType.LINEAR_SCALE) {
            (newQuestion as any).min = 1;
            (newQuestion as any).max = 5;
        } else if (type === QuestionType.STAR_RATING) {
            (newQuestion as any).min = 1;
            (newQuestion as any).max = 5;
        } else if (type === QuestionType.NPS) {
            (newQuestion as any).min = 0;
            (newQuestion as any).max = 10;
        }

        setForm((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }))
        setSelectedQuestion(newQuestion.id)
    }, [])

    const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === id ? { ...q, ...updates } as Question : q
            ),
        }))
    }, [])

    const deleteQuestion = useCallback((id: string) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== id),
        }))
        if (selectedQuestion === id) {
            setSelectedQuestion(null)
        }
    }, [selectedQuestion])

    const duplicateQuestion = useCallback((id: string) => {
        setForm((prev) => {
            const questionIndex = prev.questions.findIndex((q) => q.id === id)
            if (questionIndex === -1) return prev

            const question = prev.questions[questionIndex]
            const newQuestion = {
                ...question,
                id: `q_${Date.now()}`,
                title: `${question.title} (copy)`,
            }

            const newQuestions = [...prev.questions]
            newQuestions.splice(questionIndex + 1, 0, newQuestion)

            return { ...prev, questions: newQuestions }
        })
    }, [])

    const selectedQuestionData = form.questions.find((q) => q.id === selectedQuestion)

    return (
        <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 -m-4 lg:-m-8">
            {/* Top Bar */}
            <header className="h-14 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/forms">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="font-semibold border-0 bg-transparent focus-visible:ring-0 text-lg w-64"
                        placeholder="Form title"
                    />
                    <Badge variant="secondary">{form.status}</Badge>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                        {[
                            { id: "build", label: "Build" },
                            { id: "preview", label: "Preview" },
                            { id: "settings", label: "Settings" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? "bg-primary text-white"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShareModal(true)}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            // Simulate save
                            alert("Form saved successfully!")
                        }}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === "build" && (
                    <>
                        {/* Question Palette */}
                        <QuestionPalette onAddQuestion={addQuestion} />

                        {/* Form Canvas */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl mx-auto">
                                {/* Welcome Card */}
                                <Card className="p-6 mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="text-2xl font-bold bg-transparent border-0 w-full focus:outline-none placeholder-white/70"
                                        placeholder="Form Title"
                                    />
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="mt-2 bg-transparent border-0 w-full focus:outline-none placeholder-white/70"
                                        placeholder="Form description..."
                                    />
                                </Card>

                                {/* Questions */}
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={form.questions.map((q) => q.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {form.questions.map((question, index) => (
                                                <QuestionCard
                                                    key={question.id}
                                                    question={question}
                                                    index={index}
                                                    isSelected={selectedQuestion === question.id}
                                                    onSelect={() => setSelectedQuestion(question.id)}
                                                    onDelete={() => deleteQuestion(question.id)}
                                                    onDuplicate={() => duplicateQuestion(question.id)}
                                                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>

                                {/* Empty State */}
                                {form.questions.length === 0 && (
                                    <Card className="p-12 text-center border-dashed">
                                        <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Add questions from the palette on the left
                                        </p>
                                        <Button onClick={() => addQuestion(QuestionType.SHORT_TEXT)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Question
                                        </Button>
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Question Settings Panel */}
                        {selectedQuestionData && (
                            <QuestionEditor
                                question={selectedQuestionData}
                                onUpdate={(updates) => updateQuestion(selectedQuestionData.id, updates)}
                                onClose={() => setSelectedQuestion(null)}
                            />
                        )}
                    </>
                )}

                {activeTab === "preview" && (
                    <FormPreview form={form} />
                )}

                {activeTab === "settings" && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h2 className="text-xl font-semibold">Form Settings</h2>

                            {/* General Settings */}
                            <Card className="p-6">
                                <h3 className="font-medium mb-4">General</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Form Title</label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Input
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="mt-1"
                                            placeholder="Add a description..."
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Access Settings */}
                            <Card className="p-6">
                                <h3 className="font-medium mb-4">Access Control</h3>
                                <div className="space-y-3">
                                    <SettingsToggle
                                        label="Accept responses"
                                        description="Allow new submissions to this form"
                                        defaultChecked={true}
                                    />
                                    <SettingsToggle
                                        label="Show progress bar"
                                        description="Display completion percentage to respondents"
                                        defaultChecked={true}
                                    />
                                    <SettingsToggle
                                        label="Shuffle questions"
                                        description="Randomize question order for each response"
                                        defaultChecked={false}
                                    />
                                    <SettingsToggle
                                        label="One response per person"
                                        description="Limit respondents to a single submission"
                                        defaultChecked={false}
                                    />
                                </div>
                            </Card>

                            {/* Quiz Mode */}
                            <Card className="p-6">
                                <h3 className="font-medium mb-4">Quiz Mode</h3>
                                <div className="space-y-3">
                                    <SettingsToggle
                                        label="Enable quiz mode"
                                        description="Score responses and show correct answers"
                                        defaultChecked={false}
                                    />
                                </div>
                            </Card>

                            {/* Actions */}
                            <Card className="p-6 border-red-200 dark:border-red-900">
                                <h3 className="font-medium mb-4 text-red-600">Danger Zone</h3>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => {
                                            if (confirm("Delete all responses?")) {
                                                alert("Responses deleted")
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Responses
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            if (confirm("Delete this form?")) {
                                                window.location.href = "/forms"
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Form
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                formTitle={form.title}
                formSlug={form.slug}
                onSlugChange={(slug) => setForm({ ...form, slug })}
            />
        </div>
    )
}
