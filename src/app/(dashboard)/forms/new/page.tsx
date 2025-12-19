"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft,
    FileText,
    Type,
    AlignLeft,
    List,
    CheckSquare,
    ChevronDown,
    Star,
    Hash,
    Sliders,
    Grid3X3,
    ArrowUpDown,
    Calendar,
    Clock,
    Upload,
    Image,
    PenTool,
    MapPin,
    MessageSquare,
    Sparkles
} from "lucide-react"

const questionTypes = [
    { type: "shortText", label: "Short Text", icon: Type, category: "Text" },
    { type: "longText", label: "Paragraph", icon: AlignLeft, category: "Text" },
    { type: "singleChoice", label: "Multiple Choice", icon: List, category: "Choice" },
    { type: "multipleChoice", label: "Checkboxes", icon: CheckSquare, category: "Choice" },
    { type: "dropdown", label: "Dropdown", icon: ChevronDown, category: "Choice" },
    { type: "linearScale", label: "Linear Scale", icon: Sliders, category: "Scale" },
    { type: "starRating", label: "Star Rating", icon: Star, category: "Scale" },
    { type: "nps", label: "NPS", icon: Hash, category: "Scale" },
    { type: "matrixSingle", label: "Matrix", icon: Grid3X3, category: "Grid" },
    { type: "ranking", label: "Ranking", icon: ArrowUpDown, category: "Grid" },
    { type: "date", label: "Date", icon: Calendar, category: "Date & Time" },
    { type: "time", label: "Time", icon: Clock, category: "Date & Time" },
    { type: "fileUpload", label: "File Upload", icon: Upload, category: "Media" },
    { type: "imageChoice", label: "Image Choice", icon: Image, category: "Media" },
    { type: "signature", label: "Signature", icon: PenTool, category: "Special" },
    { type: "address", label: "Address", icon: MapPin, category: "Special" },
    { type: "consent", label: "Consent", icon: MessageSquare, category: "Special" },
]

const templates = [
    { id: "blank", title: "Blank Form", description: "Start from scratch", icon: FileText },
    { id: "feedback", title: "Customer Feedback", description: "Gather customer opinions", icon: Star },
    { id: "registration", title: "Event Registration", description: "Register attendees", icon: Calendar },
    { id: "quiz", title: "Quiz", description: "Test knowledge with scoring", icon: Sparkles },
]

export default function NewFormPage() {
    const router = useRouter()
    const [step, setStep] = useState<"template" | "details">("template")
    const [selectedTemplate, setSelectedTemplate] = useState<string>("blank")
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    })
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateForm = async () => {
        if (!formData.title.trim()) return

        setIsCreating(true)
        try {
            const response = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    slug: formData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                }),
            })

            const result = await response.json()

            if (result.success) {
                router.push(`/forms/${result.data.id}`)
            } else {
                alert(`Failed to create form: ${result.error}`)
            }
        } catch (error) {
            console.error('Create form error:', error)
            alert('Failed to create form. Please try again.')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/forms">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Create New Form</h1>
                    <p className="text-muted-foreground">
                        {step === "template" ? "Choose a template or start from scratch" : "Enter form details"}
                    </p>
                </div>
            </div>

            {step === "template" ? (
                <>
                    {/* Templates */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Templates</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {templates.map((template) => (
                                <Card
                                    key={template.id}
                                    className={`cursor-pointer transition-all ${selectedTemplate === template.id
                                        ? "ring-2 ring-primary border-primary"
                                        : "hover:border-gray-300"
                                        }`}
                                    onClick={() => setSelectedTemplate(template.id)}
                                >
                                    <CardContent className="pt-6 text-center">
                                        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-4">
                                            <template.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-semibold">{template.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Question Types Preview */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Available Question Types</h2>
                        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                            {questionTypes.map((qt) => (
                                <div
                                    key={qt.type}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <qt.icon className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm font-medium">{qt.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => setStep("details")}>
                            Continue
                        </Button>
                    </div>
                </>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Form Details</CardTitle>
                        <CardDescription>
                            Give your form a title and description
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Form Title"
                            placeholder="e.g., Customer Feedback Survey"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <Textarea
                            label="Description (optional)"
                            placeholder="Describe what this form is about..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep("template")} disabled={isCreating}>
                                Back
                            </Button>
                            <Button onClick={handleCreateForm} disabled={!formData.title.trim() || isCreating} loading={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Form'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
