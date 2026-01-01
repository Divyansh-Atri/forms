"use client"

import { useState, useCallback, useEffect, use } from "react"
import { useParams } from "next/navigation"
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
                <p className="font-medium text-sm text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => setChecked(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-slate-200"
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
    const params = useParams()
    const formId = params.id as string

    const [form, setForm] = useState(initialForm)
    const [activeTab, setActiveTab] = useState<"build" | "preview" | "settings">("build")
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
    const [showShareModal, setShowShareModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Fetch form data on mount
    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await fetch(`/api/forms/${formId}`)
                const result = await response.json()

                if (result.success) {
                    const formData = result.data

                    // If form has sections, merge all section questions into questions array
                    if (formData.formSections && formData.formSections.length > 0) {
                        const allQuestions: Question[] = []
                        formData.formSections.forEach((section: any) => {
                            if (section.questions && Array.isArray(section.questions)) {
                                section.questions.forEach((q: any) => {
                                    allQuestions.push({
                                        ...q,
                                        sectionId: section.id,
                                        sectionTitle: section.title
                                    })
                                })
                            }
                        })
                        formData.questions = allQuestions.length > 0 ? allQuestions : formData.questions
                    }

                    setForm(formData)
                } else {
                    console.error('Failed to load form:', result.error)
                }
            } catch (error) {
                console.error('Error loading form:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (formId) {
            fetchForm()
        }
    }, [formId])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/forms/${form.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    slug: form.slug,
                    status: form.status,
                    questions: form.questions,
                }),
            })

            const result = await response.json()

            if (result.success) {
                alert('Form saved successfully!')
            } else {
                alert(`Failed to save: ${result.error}`)
            }
        } catch (error) {
            console.error('Save error:', error)
            alert('Failed to save form. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

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

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading form...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 -m-4 lg:-m-8">
            {/* Top Bar */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/forms">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                    </Link>
                    <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="font-semibold border-0 bg-transparent focus-visible:ring-0 text-lg w-64 text-slate-900 placeholder-slate-400 p-0 h-auto"
                        placeholder="Form title"
                    />
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">{form.status}</Badge>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100/50 p-1 rounded-lg border border-slate-200">
                        {[
                            { id: "build", label: "Build" },
                            { id: "preview", label: "Preview" },
                            { id: "settings", label: "Settings" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-1" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShareModal(true)}
                        className="bg-white hover:bg-slate-50"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    {form.status === 'DRAFT' ? (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={async () => {
                                setForm({ ...form, status: 'PUBLISHED' })
                                await handleSave()
                            }}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                            Publish
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                setForm({ ...form, status: 'DRAFT' })
                                await handleSave()
                            }}
                            disabled={isSaving}
                        >
                            Unpublish
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={handleSave}
                        loading={isSaving}
                        disabled={isSaving}
                        variant="ghost"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === "build" && (
                    <>
                        {/* Question Palette */}
                        <div className="border-r border-gray-200 bg-white">
                            <QuestionPalette onAddQuestion={addQuestion} />
                        </div>

                        {/* Form Canvas */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                            <div className="max-w-3xl mx-auto pb-20">
                                {/* Welcome Card */}
                                <Card className="p-8 mb-6 bg-white border-primary/20 shadow-premium">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500 rounded-t-lg" />
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="text-3xl font-bold bg-transparent border-0 w-full focus:outline-none placeholder-slate-300 text-slate-900 border-b border-transparent focus:border-slate-200 pb-2 transition-colors"
                                            placeholder="Form Title"
                                        />
                                        <input
                                            type="text"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="bg-transparent border-0 w-full focus:outline-none placeholder-slate-400 text-slate-600 text-lg"
                                            placeholder="Form description..."
                                        />
                                    </div>
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
                                        <div className="space-y-4">
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
                                    <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-transparent shadow-none hover:border-slate-300 transition-colors cursor-pointer"
                                        onClick={() => addQuestion(QuestionType.SHORT_TEXT)}>
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Plus className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 text-slate-900">Start building your form</h3>
                                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                            Select a question type from the palette on the left or click below to add your first question
                                        </p>
                                        <Button onClick={(e) => {
                                            e.stopPropagation();
                                            addQuestion(QuestionType.SHORT_TEXT);
                                        }}>
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
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900">Form Settings</h2>

                            {/* General Settings */}
                            <Card className="p-6 bg-white border-slate-200 shadow-sm">
                                <h3 className="font-medium mb-4 text-slate-900 border-b pb-2">General</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Form Title</label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Description</label>
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
                            <Card className="p-6 bg-white border-slate-200 shadow-sm">
                                <h3 className="font-medium mb-4 text-slate-900 border-b pb-2">Access Control</h3>
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
                            <Card className="p-6 bg-white border-slate-200 shadow-sm">
                                <h3 className="font-medium mb-4 text-slate-900 border-b pb-2">Quiz Mode</h3>
                                <div className="space-y-3">
                                    <SettingsToggle
                                        label="Enable quiz mode"
                                        description="Score responses and show correct answers"
                                        defaultChecked={false}
                                    />
                                </div>
                            </Card>

                            {/* Actions */}
                            <Card className="p-6 border-red-200 bg-red-50/30">
                                <h3 className="font-medium mb-4 text-red-700 border-b border-red-100 pb-2">Danger Zone</h3>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
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
