"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Question, QuestionType, Choice } from "@/types"
import { X, Plus, Trash2, GripVertical } from "lucide-react"

interface QuestionEditorProps {
 question: Question
 onUpdate: (updates: Partial<Question>) => void
 onClose: () => void
}

export function QuestionEditor({ question, onUpdate, onClose }: QuestionEditorProps) {
 return (
 <div className="w-80 bg-white border-l overflow-y-auto shrink-0">
 <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
 <h3 className="font-semibold">Question Settings</h3>
 <button
 onClick={onClose}
 className="p-1.5 hover:bg-gray-100 rounded"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="p-4 space-y-6">
 {/* Basic Settings */}
 <div className="space-y-4">
 <div>
 <Label>Question Title</Label>
 <Input
 value={question.title}
 onChange={(e) => onUpdate({ title: e.target.value })}
 className="mt-1.5"
 />
 </div>

 <div>
 <Label>Description (optional)</Label>
 <Textarea
 value={question.description || ""}
 onChange={(e) => onUpdate({ description: e.target.value })}
 className="mt-1.5"
 rows={2}
 placeholder="Add a description..."
 />
 </div>

 <div className="flex items-center gap-2">
 <Checkbox
 id="required"
 checked={question.required}
 onCheckedChange={(checked) => onUpdate({ required: !!checked })}
 />
 <Label htmlFor="required" className="cursor-pointer">
 Required
 </Label>
 </div>
 </div>

 {/* Type-specific settings */}
 <TypeSpecificSettings question={question} onUpdate={onUpdate} />

 {/* Validation (for text types) */}
 {isTextQuestion(question.type) && (
 <div className="space-y-4">
 <h4 className="font-medium text-sm">Validation</h4>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label className="text-xs">Min Length</Label>
 <Input
 type="number"
 value={question.validation?.minLength || ""}
 onChange={(e) =>
 onUpdate({
 validation: {
 ...question.validation,
 minLength: e.target.value ? parseInt(e.target.value) : undefined,
 },
 })
 }
 className="mt-1"
 placeholder="0"
 />
 </div>
 <div>
 <Label className="text-xs">Max Length</Label>
 <Input
 type="number"
 value={question.validation?.maxLength || ""}
 onChange={(e) =>
 onUpdate({
 validation: {
 ...question.validation,
 maxLength: e.target.value ? parseInt(e.target.value) : undefined,
 },
 })
 }
 className="mt-1"
 placeholder="500"
 />
 </div>
 </div>
 </div>
 )}

 {/* Quiz Settings */}
 <div className="space-y-4">
 <h4 className="font-medium text-sm">Quiz Mode (optional)</h4>
 <div>
 <Label className="text-xs">Points</Label>
 <Input
 type="number"
 value={question.points || ""}
 onChange={(e) =>
 onUpdate({ points: e.target.value ? parseInt(e.target.value) : undefined })
 }
 className="mt-1"
 placeholder="0"
 />
 </div>
 </div>
 </div>
 </div>
 )
}

function TypeSpecificSettings({
 question,
 onUpdate,
}: {
 question: Question
 onUpdate: (updates: Partial<Question>) => void
}) {
 switch (question.type) {
 case QuestionType.SINGLE_CHOICE:
 case QuestionType.MULTIPLE_CHOICE:
 case QuestionType.DROPDOWN:
 return <ChoiceSettings question={question} onUpdate={onUpdate} />

 case QuestionType.LINEAR_SCALE:
 case QuestionType.STAR_RATING:
 case QuestionType.SLIDER:
 return <ScaleSettings question={question} onUpdate={onUpdate} />

 case QuestionType.NPS:
 return (
 <div className="space-y-4">
 <h4 className="font-medium text-sm">NPS Settings</h4>
 <p className="text-sm text-muted-foreground">
 NPS uses a fixed 0-10 scale
 </p>
 </div>
 )

 case QuestionType.FILE_UPLOAD:
 return <FileUploadSettings question={question} onUpdate={onUpdate} />

 default:
 return null
 }
}

function ChoiceSettings({
 question,
 onUpdate,
}: {
 question: Question
 onUpdate: (updates: Partial<Question>) => void
}) {
 const choices: Choice[] = (question as any).choices || []

 const addChoice = () => {
 const newChoices = [
 ...choices,
 { id: `opt_${Date.now()}`, label: `Option ${choices.length + 1}` },
 ]
 onUpdate({ choices: newChoices } as any)
 }

 const updateChoice = (id: string, label: string) => {
 const newChoices = choices.map((c) => (c.id === id ? { ...c, label } : c))
 onUpdate({ choices: newChoices } as any)
 }

 const deleteChoice = (id: string) => {
 const newChoices = choices.filter((c) => c.id !== id)
 onUpdate({ choices: newChoices } as any)
 }

 return (
 <div className="space-y-4">
 <h4 className="font-medium text-sm">Options</h4>
 <div className="space-y-2">
 {choices.map((choice, index) => (
 <div key={choice.id} className="flex items-center gap-2">
 <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
 <Input
 value={choice.label}
 onChange={(e) => updateChoice(choice.id, e.target.value)}
 placeholder={`Option ${index + 1}`}
 className="flex-1"
 />
 <button
 onClick={() => deleteChoice(choice.id)}
 className="p-1.5 hover:bg-red-100 rounded"
 >
 <Trash2 className="w-4 h-4 text-red-500" />
 </button>
 </div>
 ))}
 </div>
 <Button variant="outline" size="sm" onClick={addChoice} className="w-full">
 <Plus className="w-4 h-4 mr-2" />
 Add Option
 </Button>

 <div className="flex items-center gap-2">
 <Checkbox
 id="shuffle"
 checked={(question as any).shuffleChoices || false}
 onCheckedChange={(checked) => onUpdate({ shuffleChoices: !!checked } as any)}
 />
 <Label htmlFor="shuffle" className="cursor-pointer text-sm">
 Shuffle options
 </Label>
 </div>
 </div>
 )
}

function ScaleSettings({
 question,
 onUpdate,
}: {
 question: Question
 onUpdate: (updates: Partial<Question>) => void
}) {
 const q = question as any

 return (
 <div className="space-y-4">
 <h4 className="font-medium text-sm">Scale Settings</h4>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label className="text-xs">Min Value</Label>
 <Input
 type="number"
 value={q.min || 1}
 onChange={(e) => onUpdate({ min: parseInt(e.target.value) } as any)}
 className="mt-1"
 />
 </div>
 <div>
 <Label className="text-xs">Max Value</Label>
 <Input
 type="number"
 value={q.max || 5}
 onChange={(e) => onUpdate({ max: parseInt(e.target.value) } as any)}
 className="mt-1"
 />
 </div>
 </div>
 <div>
 <Label className="text-xs">Min Label (optional)</Label>
 <Input
 value={q.minLabel || ""}
 onChange={(e) => onUpdate({ minLabel: e.target.value } as any)}
 className="mt-1"
 placeholder="e.g., Not satisfied"
 />
 </div>
 <div>
 <Label className="text-xs">Max Label (optional)</Label>
 <Input
 value={q.maxLabel || ""}
 onChange={(e) => onUpdate({ maxLabel: e.target.value } as any)}
 className="mt-1"
 placeholder="e.g., Very satisfied"
 />
 </div>
 </div>
 )
}

function FileUploadSettings({
 question,
 onUpdate,
}: {
 question: Question
 onUpdate: (updates: Partial<Question>) => void
}) {
 const q = question as any

 return (
 <div className="space-y-4">
 <h4 className="font-medium text-sm">File Upload Settings</h4>
 <div>
 <Label className="text-xs">Max File Size (MB)</Label>
 <Input
 type="number"
 value={q.maxFileSize || 10}
 onChange={(e) => onUpdate({ maxFileSize: parseInt(e.target.value) } as any)}
 className="mt-1"
 />
 </div>
 <div>
 <Label className="text-xs">Max Files</Label>
 <Input
 type="number"
 value={q.maxFiles || 1}
 onChange={(e) => onUpdate({ maxFiles: parseInt(e.target.value) } as any)}
 className="mt-1"
 />
 </div>
 <div>
 <Label className="text-xs">Allowed Types (comma separated)</Label>
 <Input
 value={(q.allowedTypes || []).join(", ")}
 onChange={(e) =>
 onUpdate({
 allowedTypes: e.target.value.split(",").map((t) => t.trim()),
 } as any)
 }
 className="mt-1"
 placeholder="pdf, jpg, png"
 />
 </div>
 </div>
 )
}

function isTextQuestion(type: QuestionType): boolean {
 return [
 QuestionType.SHORT_TEXT,
 QuestionType.LONG_TEXT,
 QuestionType.EMAIL,
 QuestionType.URL,
 QuestionType.PHONE,
 QuestionType.NUMBER,
 ].includes(type)
}
