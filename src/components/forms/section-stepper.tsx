"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check, ArrowRight, Loader2 } from "lucide-react"

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
 <div className="max-w-3xl mx-auto px-4">
 {/* Progress Header */}
 <div className="mb-10 text-center sm:text-left">
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
 <div className="flex-1">
 <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent transform transition-all duration-300">
 {formTitle}
 </h1>
 {formDescription && (
 <p className="text-lg text-muted-foreground mt-2 font-medium max-w-xl">
 {formDescription}
 </p>
 )}
 </div>
 <div className="text-sm font-black text-primary bg-primary/10 px-4 py-2 rounded-xl whitespace-nowrap self-center sm:self-auto">
 SECTION {currentSectionIndex + 1} / {totalSections}
 </div>
 </div>

 {/* Refined Progress Bar */}
 <div className="relative h-2.5 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
 <div
 className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(59,130,246,0.5)]"
 style={{ width: `${progressPercentage}%` }}
 />
 </div>
 </div>

 {/* Current Section */}
 <Card className="p-8 sm:p-12 border-none shadow-premium-lg bg-white/80 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] relative overflow-hidden mb-10 group">
 <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-500" />

 {/* Section Header */}
 <div className="mb-10">
 <div className="flex items-center gap-3 mb-4">
 <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20">
 {currentSectionIndex + 1}
 </span>
 <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
 </div>
 <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">
 {currentSection.title}
 </h2>
 {currentSection.description && (
 <p className="text-lg text-muted-foreground font-medium leading-relaxed">
 {currentSection.description}
 </p>
 )}
 </div>

 {/* Section Fields */}
 <div className="space-y-10">
 {currentSection.questions.map((question: any, index: number) => (
 <div key={question.id || index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
 <label className="block text-xl font-bold text-foreground mb-4 flex items-center gap-2">
 {question.title || question.label}
 {question.required && <span className="text-primary scale-125">*</span>}
 </label>

 {/* Render field based on type - Specialized Large Inputs */}
 {(question.type === 'SHORT_TEXT' || question.type === 'text') && (
 <input
 type="text"
 value={responseData[question.id] || ''}
 onChange={(e) => handleFieldChange(question.id, e.target.value)}
 required={question.required}
 placeholder={question.description || question.placeholder || "Type your answer..."}
 className="w-full text-xl px-6 py-5 border-2 border-gray-100 rounded-2xl bg-white/50 text-foreground selection:bg-primary/20 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none placeholder:text-muted-foreground/40 font-medium"
 />
 )}

 {(question.type === 'NUMBER' || question.type === 'number') && (
 <input
 type="number"
 value={responseData[question.id] || ''}
 onChange={(e) => handleFieldChange(question.id, e.target.value)}
 required={question.required}
 placeholder={question.description || question.placeholder || "0"}
 className="w-full text-xl px-6 py-5 border-2 border-gray-100 rounded-2xl bg-white/50 text-foreground selection:bg-primary/20 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none font-medium"
 />
 )}

 {(question.type === 'DATE' || question.type === 'date') && (
 <input
 type="date"
 value={responseData[question.id] || ''}
 onChange={(e) => handleFieldChange(question.id, e.target.value)}
 required={question.required}
 className="w-full text-xl px-6 py-5 border-2 border-gray-100 rounded-2xl bg-white/50 text-foreground focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none font-medium"
 />
 )}

 {(question.type === 'LONG_TEXT' || question.type === 'textarea') && (
 <textarea
 value={responseData[question.id] || ''}
 onChange={(e) => handleFieldChange(question.id, e.target.value)}
 required={question.required}
 placeholder={question.description || question.placeholder || "Tell us more..."}
 rows={5}
 className="w-full text-xl px-6 py-5 border-2 border-gray-100 rounded-2xl bg-white/50 text-foreground selection:bg-primary/20 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-muted-foreground/40 font-medium"
 />
 )}
 </div>
 ))}
 </div>
 </Card>

 {/* Navigation Buttons */}
 <div className="flex items-center justify-between gap-4 mb-16">
 <Button
 variant="ghost"
 onClick={handlePrevious}
 disabled={isFirstSection || isSubmitting}
 className="h-16 px-10 text-lg font-bold rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/50 transition-all border border-gray-100 shadow-sm"
 >
 <ChevronLeft className="w-6 h-6 mr-2" />
 Back
 </Button>

 {isLastSection ? (
 <Button
 onClick={onSubmit}
 disabled={isSubmitting}
 size="xl"
 className="h-16 px-12 text-xl font-black rounded-2xl shadow-premium hover:shadow-premium-lg group"
 >
 {isSubmitting ? (
 <Loader2 className="w-6 h-6 animate-spin" />
 ) : (
 <>
 Finish Form <Check className="w-6 h-6 ml-3 group-hover:scale-125 transition-transform" />
 </>
 )}
 </Button>
 ) : (
 <Button
 onClick={handleNext}
 size="xl"
 className="h-16 px-12 text-xl font-black rounded-2xl shadow-premium hover:shadow-premium-lg group"
 >
 Next Section
 <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1.5 transition-transform" />
 </Button>
 )}
 </div>

 {/* Refined Section Indicator */}
 <div className="pt-10 border-t border-gray-100/30">
 <div className="flex flex-wrap justify-center gap-3">
 {sections.map((section, index) => (
 <button
 key={section.id}
 onClick={() => {
 if (index <= currentSectionIndex || responseData) { // Allow navigation if data exists
 setCurrentSectionIndex(index)
 window.scrollTo({ top: 0, behavior: 'smooth' })
 }
 }}
 className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm border-2 ${index === currentSectionIndex
 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
 : index < currentSectionIndex
 ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
 : 'bg-white/50 border-gray-100 text-muted-foreground hover:border-primary/20 hover:text-primary'
 }`}
 disabled={isSubmitting}
 >
 <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-black/10 text-[10px]">
 {index + 1}
 </span>
 <span className="hidden sm:inline opacity-80 group-hover:opacity-100">{section.title}</span>
 </button>
 ))}
 </div>
 </div>
 </div>
 )
}
