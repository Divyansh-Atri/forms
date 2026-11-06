"use client"

import { useState, type Dispatch, type SetStateAction } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Eyebrow, RevealText, trackSpotlight } from "@/components/fx"
import { MadeWith, ProgressRail, SectionField, SuccessScreen, type SectionQuestion } from "@/components/forms/respondent-kit"
import { cn } from "@/lib/utils"

interface Section {
 id: string
 title: string
 description?: string
 order: number
 questions: SectionQuestion[]
}

interface SectionStepperProps {
 sections: Section[]
 formId: string
 formTitle: string
 formDescription?: string
 responseData: Record<string, unknown>
 // Takes an updater too, so a file that finishes uploading later can't
 // overwrite answers typed in the meantime
 onDataChange: Dispatch<SetStateAction<Record<string, unknown>>>
 // Resolves to true once the response is saved
 onSubmit: () => Promise<boolean>
 isSubmitting: boolean
}

export function SectionStepper({
 formId,
 sections,
 formTitle,
 formDescription,
 responseData,
 onDataChange,
 onSubmit,
 isSubmitting
}: SectionStepperProps) {
 const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
 const [direction, setDirection] = useState(1)
 const [isComplete, setIsComplete] = useState(false)

 if (sections.length === 0) {
 return null
 }

 const currentSection = sections[currentSectionIndex]
 const totalSections = sections.length
 const isFirstSection = currentSectionIndex === 0
 const isLastSection = currentSectionIndex === totalSections - 1

 const goTo = (index: number) => {
 setDirection(index > currentSectionIndex ? 1 : -1)
 setCurrentSectionIndex(index)
 window.scrollTo({ top: 0, behavior: 'smooth' })
 }

 const handlePrevious = () => {
 if (!isFirstSection) goTo(currentSectionIndex - 1)
 }

 const handleNext = () => {
 if (!isLastSection) goTo(currentSectionIndex + 1)
 }

 const handleFinish = async () => {
 if (await onSubmit()) setIsComplete(true)
 }

 const handleFieldChange = (questionId: string, value: unknown) => {
 onDataChange((prev) => ({ ...prev, [questionId]: value }))
 }

 if (isComplete) {
 return (
 <div className="flex min-h-[100svh] flex-col items-center justify-center px-4 py-16">
 <SuccessScreen
 onReset={() => {
 onDataChange({})
 setCurrentSectionIndex(0)
 setIsComplete(false)
 }}
 />
 </div>
 )
 }

 return (
 <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
 <ProgressRail value={(currentSectionIndex + 1) / totalSections} />

 {/* Form header */}
 <header className="mb-10">
 <Eyebrow>
 Section {currentSectionIndex + 1} of {totalSections}
 </Eyebrow>
 <RevealText
 as="h1"
 text={formTitle}
 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl"
 />
 {formDescription && (
 <motion.p
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground"
 >
 {formDescription}
 </motion.p>
 )}
 </header>

 {/* Section tabs with a sliding highlight */}
 <nav className="-mx-4 mb-8 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Sections">
 <div className="flex w-max gap-1.5 rounded-full border border-border bg-white/70 p-1.5 backdrop-blur">
 {sections.map((section, index) => {
 const active = index === currentSectionIndex
 const done = index < currentSectionIndex
 return (
 <button
 key={section.id}
 type="button"
 onClick={() => goTo(index)}
 disabled={isSubmitting}
 className={cn(
 "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
 active ? "text-white" : "text-muted-foreground hover:text-foreground"
 )}
 >
 {active && (
 <motion.span
 layoutId="section-pill"
 className="absolute inset-0 rounded-full bg-primary shadow-[0_10px_24px_-10px_rgba(124,58,237,0.7)]"
 transition={{ type: "spring", stiffness: 380, damping: 30 }}
 />
 )}
 <span
 className={cn(
 "relative grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold",
 active ? "bg-white/15" : done ? "bg-brand text-white" : "bg-muted"
 )}
 >
 {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
 </span>
 <span className="relative max-w-[10rem] truncate">{section.title}</span>
 </button>
 )
 })}
 </div>
 </nav>

 {/* Current section */}
 <AnimatePresence mode="wait" custom={direction} initial={false}>
 <motion.section
 key={currentSection.id}
 custom={direction}
 initial={{ opacity: 0, x: direction * 40, filter: "blur(6px)" }}
 animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, x: direction * -40, filter: "blur(6px)" }}
 transition={{ type: "spring", stiffness: 160, damping: 22 }}
 onPointerMove={trackSpotlight}
 className="glass spotlight rounded-[2rem] p-6 shadow-premium-lg sm:p-10"
 >
 <div className="mb-9">
 <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet">
 Part {String(currentSectionIndex + 1).padStart(2, "0")}
 </span>
 <h2 className="mt-2 text-balance text-3xl font-semibold tracking-[-0.035em]">
 {currentSection.title}
 </h2>
 {currentSection.description && (
 <p className="mt-2 text-pretty text-muted-foreground">{currentSection.description}</p>
 )}
 </div>

 <div className="space-y-7">
 {currentSection.questions.map((question, index) => (
 <motion.div
 key={question.id || index}
 initial={{ opacity: 0, y: 14 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 + index * 0.06, type: "spring", stiffness: 200, damping: 22 }}
 >
 <label htmlFor={question.id} className="mb-2.5 block text-lg font-medium">
 {question.title || question.label}
 {question.required && <span className="ml-1 text-pink">*</span>}
 </label>
 <SectionField
 formId={formId}
 question={question}
 value={responseData[question.id]}
 onChange={(value) => handleFieldChange(question.id, value)}
 />
 </motion.div>
 ))}
 </div>
 </motion.section>
 </AnimatePresence>

 {/* Navigation */}
 <div className="mt-8 flex items-center justify-between gap-4">
 <Button
 variant="outline"
 size="lg"
 onClick={handlePrevious}
 disabled={isFirstSection || isSubmitting}
 >
 <ArrowLeft className="h-4 w-4" /> Back
 </Button>

 {isLastSection ? (
 <Button size="lg" onClick={handleFinish} loading={isSubmitting} className="group min-w-[9rem]">
 Submit <Check className="h-4 w-4 transition-transform group-hover:scale-125" strokeWidth={2.5} />
 </Button>
 ) : (
 <Button size="lg" onClick={handleNext} className="group">
 Next section
 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
 </Button>
 )}
 </div>

 <div className="mt-16 flex justify-center">
 <MadeWith />
 </div>
 </div>
 )
}
