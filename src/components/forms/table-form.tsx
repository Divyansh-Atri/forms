"use client"

import { useState, type Dispatch, type SetStateAction } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Eyebrow, RevealText, trackSpotlight } from "@/components/fx"
import { MadeWith, SectionField, SuccessScreen, type SectionQuestion } from "@/components/forms/respondent-kit"

interface TableFormProps {
 sections: Array<{
 id: string
 title: string
 description?: string
 order: number
 questions: SectionQuestion[]
 }>
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

export function TableForm({
 formId,
 sections,
 formTitle,
 formDescription,
 responseData,
 onDataChange,
 onSubmit,
 isSubmitting
}: TableFormProps) {
 const [isComplete, setIsComplete] = useState(false)

 const handleInputChange = (fieldId: string, value: unknown) => {
 onDataChange((prev) => ({ ...prev, [fieldId]: value }))
 }

 const handleSubmit = async () => {
 // Only show the success screen if the response was actually saved
 if (await onSubmit()) setIsComplete(true)
 }

 if (isComplete) {
 return (
 <div className="flex min-h-[100svh] flex-col items-center justify-center px-4 py-16">
 <SuccessScreen
 onReset={() => {
 setIsComplete(false)
 onDataChange({})
 }}
 />
 </div>
 )
 }

 const totalFields = sections.reduce((n, s) => n + s.questions.length, 0)

 return (
 <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-10 pt-14 sm:px-8 sm:pt-20">
 {/* Form header */}
 <header className="max-w-3xl">
 <Eyebrow>
 {sections.length} section{sections.length === 1 ? "" : "s"} · {totalFields} field{totalFields === 1 ? "" : "s"}
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
 className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground"
 >
 {formDescription}
 </motion.p>
 )}
 </header>

 {/* One card per section; fields sit in a label | input grid */}
 {sections.map((section, sectionIdx) => (
 <motion.section
 key={section.id}
 initial={{ opacity: 0, y: 28 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-60px" }}
 transition={{ delay: sectionIdx * 0.05, type: "spring", stiffness: 140, damping: 20 }}
 onPointerMove={trackSpotlight}
 className="glass spotlight overflow-hidden rounded-[2rem] shadow-premium-lg"
 >
 <div className="border-b border-border/70 px-6 py-6 sm:px-8">
 <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet">
 Section {String(sectionIdx + 1).padStart(2, "0")}
 </span>
 <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em]">{section.title}</h2>
 {section.description && (
 <p className="mt-1 text-pretty text-muted-foreground">{section.description}</p>
 )}
 </div>

 <div className="divide-y divide-border/70">
 {section.questions.map((question) => (
 <div
 key={question.id}
 className="grid gap-3 px-6 py-5 transition-colors duration-300 hover:bg-white/60 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:gap-8 sm:px-8"
 >
 <div>
 <label htmlFor={question.id} className="font-medium">
 {question.title}
 {question.required && <span className="ml-1 text-pink">*</span>}
 </label>
 {question.description && (
 <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
 )}
 </div>
 <SectionField
 formId={formId}
 compact
 question={question}
 value={responseData[question.id]}
 onChange={(value) => handleInputChange(question.id, value)}
 />
 </div>
 ))}
 </div>
 </motion.section>
 ))}

 {/* Submit */}
 <div className="flex flex-col items-center gap-10 pt-6">
 <Button size="xl" onClick={handleSubmit} loading={isSubmitting} className="group px-12">
 Submit form
 <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
 </Button>
 <MadeWith />
 </div>
 </div>
 )
}
