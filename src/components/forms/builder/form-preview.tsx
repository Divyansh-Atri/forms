"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Question, QuestionType } from "@/types"
import { Star, ChevronDown, Calendar, Upload, FileText } from "lucide-react"

interface FormPreviewProps {
 form: {
 title: string
 description: string
 questions: Question[]
 }
}

export function FormPreview({ form }: FormPreviewProps) {
 const [answers, setAnswers] = useState<Record<string, any>>({})

 const updateAnswer = (questionId: string, value: any) => {
 setAnswers((prev) => ({ ...prev, [questionId]: value }))
 }

 return (
 <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50 ">
 <div className="max-w-2xl mx-auto py-8 px-4">
 {/* Header Card */}
 <Card className="overflow-hidden mb-6">
 <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600" />
 <div className="p-8">
 <h1 className="text-3xl font-bold mb-2">{form.title || "Untitled Form"}</h1>
 {form.description && (
 <p className="text-muted-foreground">{form.description}</p>
 )}
 </div>
 </Card>

 {/* Questions */}
 {form.questions.map((question, index) => (
 <Card key={question.id} className="p-6 mb-4">
 <div className="flex items-start gap-2 mb-4">
 <h3 className="font-medium">
 {question.title}
 {question.required && <span className="text-red-500 ml-1">*</span>}
 </h3>
 </div>
 {question.description && (
 <p className="text-sm text-muted-foreground mb-4">{question.description}</p>
 )}
 <QuestionInput
 question={question}
 value={answers[question.id]}
 onChange={(value) => updateAnswer(question.id, value)}
 />
 </Card>
 ))}

 {/* Submit Button */}
 {form.questions.length > 0 && (
 <Button size="lg" className="w-full mt-4">
 Submit
 </Button>
 )}

 {/* Empty State */}
 {form.questions.length === 0 && (
 <Card className="p-12 text-center">
 <p className="text-muted-foreground">
 No questions added yet. Add questions from the build tab.
 </p>
 </Card>
 )}
 </div>
 </div>
 )
}

function QuestionInput({
 question,
 value,
 onChange,
}: {
 question: Question
 value: any
 onChange: (value: any) => void
}) {
 switch (question.type) {
 case QuestionType.SHORT_TEXT:
 case QuestionType.EMAIL:
 case QuestionType.URL:
 case QuestionType.PHONE:
 case QuestionType.NUMBER:
 return (
 <Input
 type={question.type === QuestionType.NUMBER ? "number" : "text"}
 value={value || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder={(question as any).placeholder || "Your answer"}
 />
 )

 case QuestionType.LONG_TEXT:
 return (
 <Textarea
 value={value || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder={(question as any).placeholder || "Your answer"}
 rows={4}
 />
 )

 case QuestionType.SINGLE_CHOICE:
 const singleChoices = (question as any).choices || []
 return (
 <RadioGroup value={value || ""} onValueChange={onChange}>
 {singleChoices.map((choice: any) => (
 <div key={choice.id} className="flex items-center space-x-2">
 <RadioGroupItem value={choice.id} id={choice.id} />
 <Label htmlFor={choice.id} className="cursor-pointer">
 {choice.label}
 </Label>
 </div>
 ))}
 </RadioGroup>
 )

 case QuestionType.MULTIPLE_CHOICE:
 const multiChoices = (question as any).choices || []
 const selectedValues = value || []
 return (
 <div className="space-y-2">
 {multiChoices.map((choice: any) => (
 <div key={choice.id} className="flex items-center space-x-2">
 <Checkbox
 id={choice.id}
 checked={selectedValues.includes(choice.id)}
 onCheckedChange={(checked) => {
 if (checked) {
 onChange([...selectedValues, choice.id])
 } else {
 onChange(selectedValues.filter((v: string) => v !== choice.id))
 }
 }}
 />
 <Label htmlFor={choice.id} className="cursor-pointer">
 {choice.label}
 </Label>
 </div>
 ))}
 </div>
 )

 case QuestionType.DROPDOWN:
 const dropdownChoices = (question as any).choices || []
 return (
 <select
 value={value || ""}
 onChange={(e) => onChange(e.target.value)}
 className="w-full h-11 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="">Select an option</option>
 {dropdownChoices.map((choice: any) => (
 <option key={choice.id} value={choice.id}>
 {choice.label}
 </option>
 ))}
 </select>
 )

 case QuestionType.LINEAR_SCALE:
 const scaleMin = (question as any).min || 1
 const scaleMax = (question as any).max || 5
 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <span>{(question as any).minLabel || scaleMin}</span>
 <span>{(question as any).maxLabel || scaleMax}</span>
 </div>
 <div className="flex items-center gap-2">
 {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => (
 <button
 key={i}
 onClick={() => onChange(scaleMin + i)}
 className={`flex-1 h-10 rounded-lg border font-medium transition-colors ${value === scaleMin + i
 ? "bg-primary text-white border-primary"
 : "hover:border-primary"
 }`}
 >
 {scaleMin + i}
 </button>
 ))}
 </div>
 </div>
 )

 case QuestionType.STAR_RATING:
 const starMax = (question as any).max || 5
 return (
 <div className="flex items-center gap-1">
 {Array.from({ length: starMax }, (_, i) => (
 <button
 key={i}
 onClick={() => onChange(i + 1)}
 className={`text-3xl transition-colors ${(value || 0) > i ? "text-yellow-400" : "text-gray-300"
 } hover:text-yellow-400`}
 >
 ★
 </button>
 ))}
 </div>
 )

 case QuestionType.NPS:
 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <span>Not at all likely</span>
 <span>Extremely likely</span>
 </div>
 <div className="flex items-center gap-1">
 {Array.from({ length: 11 }, (_, i) => (
 <button
 key={i}
 onClick={() => onChange(i)}
 className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${value === i
 ? "bg-primary text-white border-primary"
 : i <= 6
 ? "hover:border-red-400 hover:bg-red-50"
 : i <= 8
 ? "hover:border-yellow-400 hover:bg-yellow-50"
 : "hover:border-green-400 hover:bg-green-50"
 }`}
 >
 {i}
 </button>
 ))}
 </div>
 </div>
 )

 case QuestionType.DATE:
 return (
 <Input
 type="date"
 value={value || ""}
 onChange={(e) => onChange(e.target.value)}
 />
 )

 case QuestionType.TIME:
 return (
 <Input
 type="time"
 value={value || ""}
 onChange={(e) => onChange(e.target.value)}
 />
 )

 case QuestionType.FILE_UPLOAD:
 return (
 <div className="space-y-4">
 {!value ? (
 <div
 className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
 onClick={() => document.getElementById(`file-${question.id}`)?.click()}
 >
 <input
 id={`file-${question.id}`}
 type="file"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0]
 if (file) {
 if (file.size > ((question as any).maxFileSize || 10) * 1024 * 1024) {
 alert(`File size exceeds ${(question as any).maxFileSize || 10}MB limit`)
 return
 }
 const reader = new FileReader()
 reader.onloadend = () => {
 onChange({
 name: file.name,
 type: file.type,
 size: file.size,
 content: reader.result
 })
 }
 reader.readAsDataURL(file)
 }
 }}
 accept={(question as any).allowedTypes?.join(',')}
 />
 <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
 <p className="text-sm text-muted-foreground font-medium">
 Click to upload or drag and drop
 </p>
 <p className="text-xs text-muted-foreground mt-1">
 Max {(question as any).maxFileSize || 10}MB
 </p>
 </div>
 ) : (
 <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
 <FileText className="w-5 h-5 text-primary" />
 </div>
 <div className="flex flex-col">
 <span className="text-sm font-medium truncate max-w-[200px]">
 {value.name}
 </span>
 <span className="text-xs text-muted-foreground">
 {(value.size / 1024 / 1024).toFixed(2)} MB
 </span>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onChange(null)}
 className="text-red-500 hover:text-red-700 hover:bg-red-50"
 >
 Remove
 </Button>
 </div>
 )}
 </div>
 )

 case QuestionType.CONSENT:
 return (
 <div className="flex items-start space-x-2">
 <Checkbox
 id={question.id}
 checked={value || false}
 onCheckedChange={onChange}
 />
 <Label htmlFor={question.id} className="cursor-pointer leading-relaxed">
 {(question as any).label || "I agree to the terms and conditions"}
 </Label>
 </div>
 )

 default:
 return (
 <Input
 value={value || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder="Your answer"
 />
 )
 }
}
