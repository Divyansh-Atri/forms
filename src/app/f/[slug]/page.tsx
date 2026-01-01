"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { SectionStepper } from "@/components/forms/section-stepper"
import { TableForm } from "@/components/forms/table-form"
import { FileText, CheckCircle, Loader2, Upload, ArrowRight, Clock, Users, ArrowLeft } from "lucide-react"

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
 layoutType?: 'stepper' | 'table'
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
 <div className="min-h-screen flex items-center justify-center bg-background">
 <div className="flex flex-col items-center gap-4">
 <Loader2 className="w-10 h-10 animate-spin text-primary" />
 <p className="text-muted-foreground font-medium animate-pulse">Loading amazing form...</p>
 </div>
 </div>
 )
 }

 if (error || !form) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background p-6">
 <Card className="p-10 text-center max-w-md shadow-premium border-none">
 <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
 <FileText className="w-8 h-8 text-destructive" />
 </div>
 <h2 className="text-2xl font-bold mb-3 text-foreground">Form Not Found</h2>
 <p className="text-muted-foreground leading-relaxed">{error || 'This form does not exist or is no longer accepting responses.'}</p>
 <Button className="mt-8 shadow-sm" onClick={() => window.location.href = '/'}>
 Back to Home
 </Button>
 </Card>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-background selection:bg-primary/10 transition-colors duration-500">
 {/* Background Decor */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/5 rounded-full blur-[120px] animate-pulse" />
 </div>

 <div className="relative z-10 flex flex-col min-h-screen">
 {/* Check if form uses table layout */}
 {form.layoutType === 'table' && form.formSections && form.formSections.length > 0 ? (
 <TableForm
 sections={form.formSections}
 formTitle={form.title}
 formDescription={form.description}
 responseData={answers}
 onDataChange={setAnswers}
 onSubmit={handleSubmit}
 isSubmitting={isSubmitting}
 />
 ) : form.formSections && form.formSections.length > 0 ? (
 <div className="max-w-2xl mx-auto flex-1 flex flex-col py-12 px-4 w-full">
 <SectionStepper
 sections={form.formSections}
 formTitle={form.title}
 formDescription={form.description}
 responseData={answers}
 onDataChange={setAnswers}
 onSubmit={handleSubmit}
 isSubmitting={isSubmitting}
 />
 </div>
 ) : (
 <div className="max-w-2xl mx-auto flex-1 flex flex-col py-12 px-4 w-full">
 <div className="flex-1 flex flex-col">
 {/* Progress Bar */}
 {currentStep > 0 && currentStep <= totalQuestions && (
 <div className="mb-10 w-full animate-fade-in">
 <div className="flex items-center justify-between text-sm font-bold mb-3">
 <span className="text-muted-foreground flex items-center gap-2">
 Question <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{currentStep}</span> <span className="opacity-30">/</span> {totalQuestions}
 </span>
 <span className="text-primary">{Math.round((currentStep / totalQuestions) * 100)}%</span>
 </div>
 <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
 <div
 className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_10px_rgba(59,130,246,0.5)]"
 style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
 />
 </div>
 </div>
 )}

 {/* Content Area */}
 <div className="flex-1 flex items-center justify-center">
 {/* Welcome Screen */}
 {currentStep === 0 && (
 <Card className="w-full p-10 animate-scale-in border-none shadow-premium-lg bg-white/80 backdrop-blur-2xl ring-1 ring-black/5 overflow-hidden relative">
 <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
 <div className="text-center">
 <div className="w-24 h-24 mx-auto mb-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-xl shadow-primary/20 transform hover:rotate-6 transition-transform duration-500">
 <FileText className="w-12 h-12 text-white" />
 </div>
 <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight text-foreground bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">{form.title}</h1>
 {form.description && (
 <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-medium max-w-lg mx-auto">{form.description}</p>
 )}
 <div className="flex flex-col items-center gap-6">
 <Button size="xl" onClick={handleNext} className="h-16 px-12 text-xl shadow-premium hover:shadow-premium-lg group rounded-2xl">
 Start Adventure <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
 </Button>
 <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground font-bold uppercase tracking-widest">
 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4 text-primary" /> 2 MINS
 </div>
 <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-primary" /> ANONYMOUS
 </div>
 </div>
 </div>
 </div>
 </Card>
 )}

 {/* Question Step */}
 {currentStep > 0 && currentStep <= totalQuestions && currentQuestion && (
 <Card className="w-full p-10 animate-slide-up border-none shadow-premium-lg bg-white/80 backdrop-blur-2xl ring-1 ring-black/5 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
 <div
 className="h-full bg-primary transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)"
 style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
 />
 </div>
 <div className="mb-10 pt-4">
 <div className="flex items-center gap-3 mb-4">
 <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-black">
 {currentStep}
 </span>
 <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
 </div>
 <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight text-foreground leading-tight">
 {currentQuestion.title}
 {currentQuestion.required && <span className="text-primary ml-2 animate-pulse">*</span>}
 </h2>
 {currentQuestion.description && (
 <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">{currentQuestion.description}</p>
 )}
 </div>

 <div className="mb-12">
 <QuestionInput
 question={currentQuestion}
 value={answers[currentQuestion.id]}
 onChange={(value) => updateAnswer(currentQuestion.id, value)}
 />
 </div>

 <div className="flex items-center justify-between pt-8 border-t border-gray-100/50">
 <Button
 variant="ghost"
 onClick={handlePrev}
 disabled={currentStep === 1}
 className="h-14 px-8 font-bold text-muted-foreground hover:text-foreground hover:bg-gray-100/50 rounded-xl"
 >
 <ArrowLeft className="w-5 h-5 mr-2" /> Previous
 </Button>
 <Button
 onClick={handleNext}
 disabled={!canProceed()}
 loading={isSubmitting}
 size="xl"
 className="h-14 px-10 font-bold shadow-premium hover:shadow-premium-lg rounded-xl group"
 >
 {currentStep === totalQuestions ? "Submit Response" : "Next Step"}
 {currentStep !== totalQuestions && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
 </Button>
 </div>
 </Card>
 )}

 {/* Thank You Screen */}
 {currentStep === -1 && (
 <Card className="w-full p-12 text-center animate-scale-in border-none shadow-premium-lg bg-white/80 backdrop-blur-2xl ring-1 ring-black/5 overflow-hidden">
 <div className="w-28 h-28 mx-auto mb-10 rounded-[3rem] bg-emerald-50 flex items-center justify-center shadow-inner group overflow-hidden">
 <CheckCircle className="w-14 h-14 text-emerald-500 group-hover:scale-125 transition-transform duration-500" />
 </div>
 <h1 className="text-5xl font-black mb-6 tracking-tight text-foreground">Done & Dusted!</h1>
 <p className="text-2xl text-muted-foreground mb-12 font-medium leading-relaxed max-w-md mx-auto">
 Your response has been flying safely to our servers. Thank you for your time!
 </p>
 <div className="flex flex-col items-center gap-4">
 <Button size="xl" className="h-14 px-12 font-bold shadow-premium hover:shadow-premium-lg rounded-2xl group" onClick={() => {
 setCurrentStep(0)
 setAnswers({})
 }}>
 Submit Another <ArrowRight className="w-5 h-5 ml-2 group-hover:rotate-[-45deg] transition-transform" />
 </Button>
 </div>
 </Card>
 )}
 </div>

 {/* Refined Footer */}
 <div className="mt-16 py-8 text-center animate-fade-in border-t border-gray-100/30">
 <Link href="/" className="inline-flex items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity">
 <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors tracking-tight uppercase">Created with</span>
 <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-premium border border-border/5 group-hover:border-primary/20 transition-all group-hover:shadow-premium-lg group-hover:-translate-y-1">
 <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
 <FileText className="w-3.5 h-3.5 text-white" />
 </div>
 <span className="text-sm font-black text-foreground tracking-tighter">SanjeevForms</span>
 </div>
 </Link>
 <p className="mt-6 text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.2em]">Secure • Anonymous • Powered by SanjeevForms</p>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )
}

// Question input component with premium styling
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
 <div className="group relative">
 <Input
 type={question.type === "number" ? "number" : "text"}
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder="Type your brilliant answer..."
 className="text-2xl h-20 px-8 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all shadow-sm group-hover:shadow-md"
 autoFocus
 />
 <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors">
 <ArrowRight className="w-6 h-6" />
 </div>
 </div>
 )

 case "longText":
 return (
 <Textarea
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder="Tell us everything..."
 rows={6}
 className="text-xl p-8 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all shadow-sm hover:shadow-md resize-none"
 autoFocus
 />
 )

 case "singleChoice":
 return (
 <RadioGroup
 value={(value as string) || ""}
 onValueChange={onChange}
 className="grid gap-4"
 >
 {question.choices?.map((choice) => (
 <div
 key={choice.id}
 className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${value === choice.label
 ? "border-primary bg-primary/5 shadow-md shadow-primary/5 -translate-y-1 scale-[1.02]"
 : "border-gray-100 bg-white/50 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5"
 }`}
 onClick={() => onChange(choice.label)}
 >
 <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${value === choice.label ? "border-primary bg-primary" : "border-gray-300"}`}>
 {value === choice.label && <div className="w-2 h-2 rounded-full bg-white" />}
 </div>
 <Label
 htmlFor={choice.id}
 className="flex-1 cursor-pointer text-xl font-bold text-foreground/80 group-hover:text-foreground"
 >
 {choice.label}
 </Label>
 <RadioGroupItem value={choice.label} id={choice.id} className="sr-only" />
 </div>
 ))}
 </RadioGroup>
 )

 case "multipleChoice":
 const selectedValues = (value as string[]) || []
 return (
 <div className="grid gap-4">
 {question.choices?.map((choice) => (
 <div
 key={choice.id}
 className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedValues.includes(choice.label)
 ? "border-primary bg-primary/5 shadow-md shadow-primary/5 -translate-y-1 scale-[1.02]"
 : "border-gray-100 bg-white/50 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5"
 }`}
 onClick={() => {
 const newValues = selectedValues.includes(choice.label)
 ? selectedValues.filter(v => v !== choice.label)
 : [...selectedValues, choice.label]
 onChange(newValues)
 }}
 >
 <div className={`w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center transition-colors ${selectedValues.includes(choice.label) ? "border-primary bg-primary" : "border-gray-300"}`}>
 {selectedValues.includes(choice.label) && <CheckCircle className="w-4 h-4 text-white" />}
 </div>
 <Label className="flex-1 cursor-pointer text-xl font-bold text-foreground/80">
 {choice.label}
 </Label>
 <input
 type="checkbox"
 checked={selectedValues.includes(choice.label)}
 onChange={() => { }}
 className="sr-only"
 />
 </div>
 ))}
 </div>
 )

 case "dropdown":
 return (
 <div className="relative group">
 <select
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 className="w-full h-20 px-8 text-2xl appearance-none rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all shadow-sm group-hover:shadow-md cursor-pointer outline-none"
 >
 <option value="" disabled className="text-gray-400">Pick one...</option>
 {question.choices?.map((choice) => (
 <option key={choice.id} value={choice.label}>
 {choice.label}
 </option>
 ))}
 </select>
 <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
 <ArrowRight className="w-6 h-6 rotate-90" />
 </div>
 </div>
 )

 case "linearScale":
 const min = question.min || 1
 const scaleMax = question.max || 5
 return (
 <div className="space-y-8">
 <div className="flex items-center justify-between gap-3">
 {Array.from({ length: scaleMax - min + 1 }, (_, i) => {
 const num = min + i
 return (
 <button
 key={num}
 onClick={() => onChange(num)}
 className={`flex-1 aspect-square sm:aspect-auto sm:h-20 rounded-2xl border-2 font-black text-2xl transition-all duration-300 ${value === num
 ? "border-primary bg-primary text-white shadow-lg shadow-primary/20 -translate-y-2 scale-110"
 : "border-gray-100 bg-white/50 text-foreground/40 hover:border-gray-200 hover:text-foreground/80 hover:-translate-y-1"
 }`}
 >
 {num}
 </button>
 )
 })}
 </div>
 <div className="flex justify-between px-2">
 <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">{question.minLabel || "Low"}</span>
 <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">{question.maxLabel || "High"}</span>
 </div>
 </div>
 )

 case "nps":
 return (
 <div className="space-y-8">
 <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-4 sm:pb-0">
 {Array.from({ length: 11 }, (_, i) => (
 <button
 key={i}
 onClick={() => onChange(i)}
 className={`flex-1 min-w-[40px] h-16 sm:h-20 rounded-xl border-2 font-black text-xl transition-all duration-300 ${value === i
 ? "border-primary bg-primary text-white shadow-lg shadow-primary/20 -translate-y-2 scale-110"
 : "border-gray-100 bg-white/50 text-foreground/40 hover:border-gray-200 hover:text-foreground/80 hover:-translate-y-1"
 }`}
 >
 {i}
 </button>
 ))}
 </div>
 <div className="flex justify-between px-2 font-black uppercase tracking-widest text-xs text-muted-foreground">
 <span>Not likely at all</span>
 <span>Extremely likely</span>
 </div>
 </div>
 )

 case "date":
 return (
 <div className="group relative">
 <Input
 type="date"
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 className="text-2xl h-20 px-8 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all shadow-sm group-hover:shadow-md"
 autoFocus
 />
 </div>
 )

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
 className="text-2xl h-20 px-8 rounded-2xl border-2 border-gray-100 bg-white/50 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all"
 />
 )
 }
}

// File Upload Input Component - Premium Version
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
 setUploadError(`File too big! Keep it under ${maxSizeMB}MB`)
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
 setUploadError('Something went wrong. Try again!')
 } finally {
 setIsUploading(false)
 }
 }

 return (
 <div className="space-y-4">
 {uploadError && (
 <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm animate-shake">
 {uploadError}
 </div>
 )}
 {!value ? (
 <div
 className={`border-3 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer group relative overflow-hidden ${isUploading
 ? 'border-primary bg-primary/5'
 : 'border-gray-200 bg-white/30 hover:border-primary hover:bg-primary/5'
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
 <div className="relative w-20 h-20 mx-auto mb-6">
 <Loader2 className="w-20 h-20 text-primary animate-spin" />
 <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-primary">
 UP...
 </div>
 </div>
 <p className="text-2xl font-black text-primary animate-pulse">
 Uploading Magic...
 </p>
 </>
 ) : (
 <>
 <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gray-100 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex items-center justify-center">
 <Upload className="w-10 h-10 text-muted-foreground group-hover:text-white transition-colors" />
 </div>
 <p className="text-2xl text-foreground font-black mb-2">
 Drop your masterpiece here
 </p>
 <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
 Max {question.max || 5}MB • PDF, JPG, PNG
 </p>
 </>
 )}
 </div>
 ) : (
 <div className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-emerald-100 bg-emerald-50/50 shadow-sm animate-scale-in">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
 <CheckCircle className="w-8 h-8 text-white" />
 </div>
 <div className="flex flex-col">
 <span className="text-xl font-bold truncate max-w-[250px] text-foreground">
 {value.name}
 </span>
 <span className="text-sm font-bold text-emerald-600/70 uppercase tracking-tighter">
 {(value.size / 1024 / 1024).toFixed(2)} MB • SECURELY UPLOADED
 </span>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation()
 onChange(null)
 }}
 className="text-destructive hover:bg-destructive/10 rounded-xl font-bold"
 >
 Remove
 </Button>
 </div>
 )}
 </div>
 )
}
