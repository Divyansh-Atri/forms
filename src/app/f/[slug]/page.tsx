"use client"

import { useCallback, useEffect, useRef, useState, use } from "react"
import type { InputHTMLAttributes } from "react"
import { AnimatePresence, MotionConfig, motion, useAnimationControls, type Variants } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, Loader2, Lock, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionStepper } from "@/components/forms/section-stepper"
import { TableForm } from "@/components/forms/table-form"
import { ErrorToast, MadeWith, ProgressRail, SuccessScreen, type SectionQuestion } from "@/components/forms/respondent-kit"
import { Aurora, Eyebrow, RevealText, trackSpotlight } from "@/components/fx"
import { cn } from "@/lib/utils"

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

interface PublicForm {
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
 questions: SectionQuestion[]
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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
// Picking one of these moves straight on to the next question
const AUTO_ADVANCE_TYPES = new Set(["singleChoice", "linearScale", "nps"])

function isAnswered(value: unknown) {
 if (value === undefined || value === null || value === "") return false
 if (Array.isArray(value)) return value.length > 0
 return true
}

function scaleRange(question: FormQuestion) {
 if (question.type === "nps") return { min: 0, max: 10 }
 return { min: question.min || 1, max: question.max || 5 }
}

const slide: Variants = {
 enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 56 : -56, scale: 0.98, filter: "blur(8px)" }),
 center: {
 opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
 transition: { type: "spring", stiffness: 150, damping: 21 },
 },
 exit: (dir: number) => ({
 opacity: 0, y: dir > 0 ? -56 : 56, scale: 0.98, filter: "blur(8px)",
 transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
 }),
}

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
 const resolvedParams = use(params)
 const [form, setForm] = useState<PublicForm | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [currentStep, setCurrentStep] = useState(0) // 0 = welcome, 1+ = questions, -1 = thank you
 const [direction, setDirection] = useState(1)
 const [answers, setAnswers] = useState<Record<string, unknown>>({})
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [submitError, setSubmitError] = useState<string | null>(null)
 const [nudge, setNudge] = useState(0) // bumps when someone tries to skip a required question

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
 const currentQuestion = form && currentStep > 0 ? form.questions[currentStep - 1] ?? null : null

 const updateAnswer = (questionId: string, value: unknown) => {
 setAnswers((prev) => ({ ...prev, [questionId]: value }))
 }

 const canProceed = () => {
 if (currentStep === 0) return true
 if (!currentQuestion) return true
 if (!currentQuestion.required) return true
 return isAnswered(answers[currentQuestion.id])
 }

 const goTo = (step: number, dir: number) => {
 setDirection(dir)
 setCurrentStep(step)
 }

 // Returns whether the response was saved
 const handleSubmit = async (): Promise<boolean> => {
 if (!form) return false

 setIsSubmitting(true)
 setSubmitError(null)
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
 if (result.success) return true
 setSubmitError(result.error || 'Failed to submit response')
 return false
 } catch {
 setSubmitError('Failed to submit response. Check your connection and try again.')
 return false
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleNext = async () => {
 if (isSubmitting) return
 if (currentStep === 0) {
 goTo(1, 1)
 return
 }
 if (!canProceed()) {
 setNudge((n) => n + 1)
 return
 }
 if (currentStep === totalQuestions) {
 if (await handleSubmit()) goTo(-1, 1)
 } else if (currentStep > 0 && currentStep < totalQuestions) {
 goTo(currentStep + 1, 1)
 }
 }

 const handlePrev = () => {
 if (currentStep > 1) goTo(currentStep - 1, -1)
 }

 const resetForm = () => {
 setAnswers({})
 goTo(0, -1)
 }

 // Keyboard: Enter continues, letters pick choices, digits pick scale values
 const nextRef = useRef(handleNext)
 const shortcutRef = useRef<(key: string) => void>(() => {})
 const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

 const scheduleAdvance = () => {
 if (currentStep >= totalQuestions) return // never auto-submit
 if (advanceTimer.current) clearTimeout(advanceTimer.current)
 advanceTimer.current = setTimeout(() => nextRef.current(), 420)
 }

 const pick = (question: FormQuestion, value: unknown) => {
 if (question.type === "multipleChoice") {
 const selected = (answers[question.id] as string[]) || []
 const label = value as string
 updateAnswer(question.id, selected.includes(label) ? selected.filter((v) => v !== label) : [...selected, label])
 return
 }
 updateAnswer(question.id, value)
 if (AUTO_ADVANCE_TYPES.has(question.type)) scheduleAdvance()
 }

 useEffect(() => {
 nextRef.current = handleNext
 shortcutRef.current = (key: string) => {
 const q = currentQuestion
 if (!q) return
 if (q.type === "singleChoice" || q.type === "multipleChoice") {
 const idx = key.length === 1 ? LETTERS.indexOf(key.toUpperCase()) : -1
 const choice = idx >= 0 ? q.choices?.[idx] : undefined
 if (choice) pick(q, choice.label)
 } else if (q.type === "linearScale" || q.type === "nps") {
 if (!/^[0-9]$/.test(key)) return
 const n = Number(key)
 const { min, max } = scaleRange(q)
 if (n >= min && n <= max) pick(q, n)
 }
 }
 })

 useEffect(() => {
 const onKey = (e: KeyboardEvent) => {
 if (e.defaultPrevented || e.altKey) return
 const target = e.target as HTMLElement | null
 const tag = target?.tagName
 if (e.key === "Enter") {
 if (tag === "TEXTAREA" && !(e.metaKey || e.ctrlKey)) return
 // Real buttons keep their own Enter; choice tiles continue instead
 if ((tag === "BUTTON" || tag === "A") && !target?.dataset.choice) return
 e.preventDefault()
 nextRef.current()
 return
 }
 const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable
 if (typing || e.metaKey || e.ctrlKey) return
 shortcutRef.current(e.key)
 }
 window.addEventListener("keydown", onKey)
 return () => {
 window.removeEventListener("keydown", onKey)
 if (advanceTimer.current) clearTimeout(advanceTimer.current)
 }
 }, [])

 const clearSubmitError = useCallback(() => setSubmitError(null), [])

 if (isLoading) {
 return (
 <div className="relative grid min-h-[100svh] place-items-center">
 <Aurora />
 <div className="relative z-10 flex flex-col items-center gap-5">
 <div className="relative h-14 w-14">
 <div className="absolute inset-0 animate-pulse rounded-2xl bg-brand opacity-60 blur-xl" />
 <div className="relative grid h-full w-full place-items-center rounded-2xl bg-primary">
 <Loader2 className="h-6 w-6 animate-spin text-white" />
 </div>
 </div>
 <p className="text-sm text-muted-foreground">Loading form…</p>
 </div>
 </div>
 )
 }

 if (error || !form) {
 return (
 <div className="relative grid min-h-[100svh] place-items-center px-4">
 <Aurora />
 <motion.div
 initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 className="relative z-10 max-w-md text-center"
 >
 <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-premium-lg">
 <Lock className="h-7 w-7 text-foreground" />
 </div>
 <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">This form isn&apos;t available</h1>
 <p className="mt-3 text-muted-foreground">{error || 'This form does not exist or is no longer accepting responses.'}</p>
 <Button variant="outline" size="lg" className="mt-8" onClick={() => window.location.href = '/'}>
 <ArrowLeft className="h-4 w-4" /> Back to home
 </Button>
 </motion.div>
 </div>
 )
 }

 const hasSections = !!form.formSections && form.formSections.length > 0

 return (
 <MotionConfig reducedMotion="user">
 <div className="relative min-h-[100svh] overflow-x-hidden">
 <Aurora />
 <ErrorToast message={submitError} onClose={clearSubmitError} />

 <div className="relative z-10">
 {form.layoutType === 'table' && hasSections ? (
 <TableForm
 sections={form.formSections!}
 formTitle={form.title}
 formDescription={form.description}
 responseData={answers}
 onDataChange={setAnswers}
 onSubmit={handleSubmit}
 isSubmitting={isSubmitting}
 />
 ) : hasSections ? (
 <SectionStepper
 sections={form.formSections!}
 formTitle={form.title}
 formDescription={form.description}
 responseData={answers}
 onDataChange={setAnswers}
 onSubmit={handleSubmit}
 isSubmitting={isSubmitting}
 />
 ) : (
 <div className="flex min-h-[100svh] flex-col">
 {currentStep > 0 && <ProgressRail value={currentStep / totalQuestions} />}

 <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
 <div className="flex min-w-0 items-center gap-2.5">
 <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary shadow-premium">
 <FileText className="h-4 w-4 text-white" />
 </span>
 <AnimatePresence>
 {currentStep !== 0 && (
 <motion.span
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -8 }}
 className="truncate text-sm font-medium text-foreground/80"
 >
 {form.title}
 </motion.span>
 )}
 </AnimatePresence>
 </div>
 {currentStep > 0 && <StepCounter current={currentStep} total={totalQuestions} />}
 </header>

 <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-24 sm:px-6">
 <AnimatePresence mode="wait" custom={direction} initial={false}>
 {currentStep === 0 && (
 <motion.section key="welcome" custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
 <WelcomeScreen form={form} total={totalQuestions} onStart={handleNext} />
 </motion.section>
 )}

 {currentQuestion && (
 <motion.section key={currentQuestion.id} custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
 <QuestionCard
 question={currentQuestion}
 index={currentStep}
 total={totalQuestions}
 value={answers[currentQuestion.id]}
 onChange={(value) => updateAnswer(currentQuestion.id, value)}
 onPick={(value) => pick(currentQuestion, value)}
 onNext={handleNext}
 onPrev={handlePrev}
 canProceed={canProceed()}
 isSubmitting={isSubmitting}
 nudge={nudge}
 />
 </motion.section>
 )}

 {currentStep === -1 && (
 <motion.section key="done" custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
 <SuccessScreen onReset={resetForm} />
 </motion.section>
 )}
 </AnimatePresence>
 </main>

 <footer className="flex items-center justify-between gap-4 px-4 pb-6 sm:px-8">
 <MadeWith />
 {currentStep > 0 && (
 <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:inline-flex">
 <span className="kbd">↵</span> to continue
 <span className="mx-1 text-border">|</span>
 <span className="kbd">A</span> – <span className="kbd">Z</span> to choose
 </span>
 )}
 </footer>
 </div>
 )}
 </div>
 </div>
 </MotionConfig>
 )
}

function StepCounter({ current, total }: { current: number; total: number }) {
 return (
 <div className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border bg-white/80 px-3 py-1 font-mono text-xs font-medium tabular-nums backdrop-blur">
 <AnimatePresence mode="popLayout" initial={false}>
 <motion.span
 key={current}
 initial={{ y: 12, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 exit={{ y: -12, opacity: 0 }}
 transition={{ type: "spring", stiffness: 300, damping: 24 }}
 >
 {String(current).padStart(2, "0")}
 </motion.span>
 </AnimatePresence>
 <span className="text-muted-foreground">/ {String(total).padStart(2, "0")}</span>
 </div>
 )
}

function WelcomeScreen({ form, total, onStart }: { form: PublicForm; total: number; onStart: () => void }) {
 return (
 <div className="relative text-center">
 {/* Slowly turning colour halo behind the title */}
 <div
 aria-hidden
 className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-3xl sm:h-[38rem] sm:w-[38rem]"
 style={{
 background: "conic-gradient(from 0deg, #7c3aed, #ec4899, #f97316, #06b6d4, #7c3aed)",
 animation: "spin 18s linear infinite",
 }}
 />
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
 <Eyebrow>
 {total} question{total === 1 ? "" : "s"} · Anonymous
 </Eyebrow>
 </motion.div>
 <RevealText
 as="h1"
 text={form.title}
 delay={0.15}
 className="mt-8 text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-7xl"
 />
 {form.description && (
 <motion.p
 initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 transition={{ delay: 0.45, duration: 0.7 }}
 className="mx-auto mt-6 max-w-lg text-pretty text-lg text-muted-foreground sm:text-xl"
 >
 {form.description}
 </motion.p>
 )}
 <motion.div
 initial={{ opacity: 0, y: 14 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.65, type: "spring", stiffness: 160, damping: 20 }}
 className="mt-11 flex flex-col items-center gap-4"
 >
 <Button size="xl" onClick={onStart} className="group px-10">
 Let&apos;s begin
 <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
 </Button>
 <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:inline-flex">
 or press <span className="kbd">Enter ↵</span>
 </span>
 </motion.div>
 </div>
 )
}

function QuestionCard({
 question,
 index,
 total,
 value,
 onChange,
 onPick,
 onNext,
 onPrev,
 canProceed,
 isSubmitting,
 nudge,
}: {
 question: FormQuestion
 index: number
 total: number
 value: unknown
 onChange: (value: unknown) => void
 onPick: (value: unknown) => void
 onNext: () => void
 onPrev: () => void
 canProceed: boolean
 isSubmitting: boolean
 nudge: number
}) {
 const controls = useAnimationControls()
 const cardRef = useRef<HTMLDivElement>(null)
 // Only react to skip attempts made while this question is on screen
 const [nudgeAtMount] = useState(nudge)
 const nudged = nudge > nudgeAtMount
 const isLast = index === total

 useEffect(() => {
 if (nudge > nudgeAtMount) {
 controls.start({ x: [0, -12, 11, -7, 6, -2, 0], transition: { duration: 0.45 } })
 // Put the cursor back in the answer field so they can just type
 cardRef.current?.querySelector<HTMLElement>("input:not([type=file]), textarea, select")?.focus()
 }
 }, [nudge, nudgeAtMount, controls])

 return (
 <motion.div animate={controls}>
 <div
 ref={cardRef}
 onPointerMove={trackSpotlight}
 className="glass spotlight rounded-[2rem] p-6 shadow-premium-lg sm:p-10"
 >
 <div className="mb-6 flex items-center gap-3">
 <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-mono text-xs font-semibold text-white">
 {String(index).padStart(2, "0")}
 <ArrowRight className="h-3 w-3" />
 </span>
 <span className="text-sm text-muted-foreground">
 Question {index} of {total}
 </span>
 </div>

 <h2 className="text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.035em] sm:text-[2.3rem]">
 {question.title}
 {question.required && <span className="ml-1.5 text-pink">*</span>}
 </h2>
 {question.description && (
 <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">{question.description}</p>
 )}

 <div className="mt-8">
 <QuestionInput question={question} value={value} onChange={onChange} onPick={onPick} />
 </div>

 <AnimatePresence>
 {nudged && !canProceed && (
 <motion.p
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden text-sm font-medium text-pink"
 >
 <span className="block pt-4">This one&apos;s required. Answer it to continue.</span>
 </motion.p>
 )}
 </AnimatePresence>

 <div className="mt-10 flex items-center justify-between gap-3">
 {index > 1 ? (
 <Button variant="ghost" onClick={onPrev} className="-ml-3 text-muted-foreground hover:text-foreground">
 <ArrowLeft className="h-4 w-4" /> Back
 </Button>
 ) : (
 <span />
 )}
 <div className="flex items-center gap-3">
 <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
 press <span className="kbd">{question.type === "longText" ? "Ctrl ↵" : "Enter ↵"}</span>
 </span>
 <Button size="lg" onClick={onNext} loading={isSubmitting} className="group min-w-[8.5rem]">
 {isLast ? (
 <>
 Submit <Check className="h-4 w-4" strokeWidth={2.5} />
 </>
 ) : (
 <>
 OK <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
 </>
 )}
 </Button>
 </div>
 </div>
 </div>
 </motion.div>
 )
}

// Big, borderless input with a gradient line that sweeps in on focus
function LineInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
 return (
 <div className="relative">
 <input
 {...props}
 className={cn(
 "peer w-full rounded-none border-0 border-b-2 border-[#e6e6ec] bg-transparent px-0 pb-3 pt-1 text-2xl font-medium tracking-tight text-foreground placeholder:text-muted-foreground/40",
 "hover:border-[#d4d4dc] focus:border-[#e6e6ec] focus:shadow-none focus-visible:outline-none sm:text-[1.75rem]",
 className
 )}
 />
 <span
 aria-hidden
 className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus:scale-x-100"
 />
 </div>
 )
}

// Question input component
function QuestionInput({
 question,
 value,
 onChange,
 onPick,
}: {
 question: FormQuestion
 value: unknown
 onChange: (value: unknown) => void
 onPick: (value: unknown) => void
}) {
 switch (question.type) {
 case "shortText":
 case "email":
 case "number":
 return (
 <LineInput
 type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder={question.type === "email" ? "name@example.com" : "Type your answer here…"}
 autoFocus
 />
 )

 case "longText":
 return (
 <div className="relative">
 <textarea
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder="Type your answer here…"
 rows={4}
 autoFocus
 className="peer w-full resize-none rounded-none border-0 border-b-2 border-[#e6e6ec] bg-transparent px-0 pb-3 pt-1 text-xl font-medium leading-relaxed tracking-tight placeholder:text-muted-foreground/40 hover:border-[#d4d4dc] focus:border-[#e6e6ec] focus:shadow-none focus-visible:outline-none sm:text-2xl"
 />
 <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[7px] h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus:scale-x-100" />
 <p className="mt-3 text-xs text-muted-foreground">
 <span className="kbd">Shift ↵</span> for a new line
 </p>
 </div>
 )

 case "singleChoice":
 case "multipleChoice": {
 const multiple = question.type === "multipleChoice"
 const selected = multiple ? ((value as string[]) || []) : value ? [value as string] : []
 return (
 <div>
 {multiple && <p className="mb-3 text-sm text-muted-foreground">Choose as many as you like</p>}
 <div role={multiple ? "group" : "radiogroup"} className="grid gap-2.5">
 {question.choices?.map((choice, i) => {
 const on = selected.includes(choice.label)
 return (
 <motion.button
 key={choice.id}
 type="button"
 data-choice="true"
 role={multiple ? "checkbox" : "radio"}
 aria-checked={on}
 onClick={() => onPick(choice.label)}
 initial={{ opacity: 0, x: -14 }}
 animate={{ opacity: 1, x: 0, scale: on ? 1.015 : 1 }}
 transition={{ delay: 0.08 + i * 0.045, type: "spring", stiffness: 260, damping: 22, scale: { type: "spring", stiffness: 420, damping: 20, delay: 0 } }}
 whileTap={{ scale: 0.98 }}
 className={cn(
 "flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-base transition-colors duration-200 sm:text-lg",
 on
 ? "border-transparent bg-primary text-white shadow-[0_16px_36px_-14px_rgba(124,58,237,0.7)]"
 : "border-border bg-white/85 hover:border-foreground/20 hover:bg-white"
 )}
 >
 <span className={cn("kbd shrink-0 transition-colors", on && "border-white/20 bg-white/10 text-white shadow-none")}>
 {LETTERS[i]}
 </span>
 <span className="flex-1 font-medium">{choice.label}</span>
 <AnimatePresence>
 {on && (
 <motion.span
 initial={{ scale: 0, rotate: -60 }}
 animate={{ scale: 1, rotate: 0 }}
 exit={{ scale: 0 }}
 transition={{ type: "spring", stiffness: 500, damping: 22 }}
 className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand"
 >
 <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
 </motion.span>
 )}
 </AnimatePresence>
 </motion.button>
 )
 })}
 </div>
 </div>
 )
 }

 case "dropdown":
 return (
 <div className="relative">
 <select
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 className="w-full cursor-pointer appearance-none rounded-2xl border-[1.5px] border-border bg-white/90 px-5 py-4 pr-12 text-lg font-medium focus-visible:outline-none"
 >
 <option value="" disabled>Pick one…</option>
 {question.choices?.map((choice) => (
 <option key={choice.id} value={choice.label}>
 {choice.label}
 </option>
 ))}
 </select>
 <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
 </div>
 )

 case "linearScale":
 case "nps": {
 const { min, max } = scaleRange(question)
 const values = Array.from({ length: max - min + 1 }, (_, i) => min + i)
 const many = values.length > 7
 const lowLabel = question.type === "nps" ? "Not likely at all" : question.minLabel || "Low"
 const highLabel = question.type === "nps" ? "Extremely likely" : question.maxLabel || "High"
 return (
 <div>
 <div role="radiogroup" className={cn("gap-2", many ? "grid grid-cols-6 sm:grid-cols-11" : "flex")}>
 {values.map((n, i) => {
 const on = value === n
 return (
 <motion.button
 key={n}
 type="button"
 data-choice="true"
 role="radio"
 aria-checked={on}
 aria-label={String(n)}
 onClick={() => onPick(n)}
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: on ? -5 : 0 }}
 transition={{ delay: 0.08 + i * 0.03, type: "spring", stiffness: 300, damping: 20, y: { type: "spring", stiffness: 420, damping: 18, delay: 0 } }}
 whileHover={{ y: -3 }}
 whileTap={{ scale: 0.92 }}
 className={cn(
 "relative h-14 flex-1 rounded-2xl border text-lg font-semibold tabular-nums transition-colors sm:h-16",
 on
 ? "border-transparent bg-primary text-white shadow-[0_18px_32px_-12px_rgba(236,72,153,0.65)]"
 : "border-border bg-white/85 text-foreground/70 hover:border-foreground/20 hover:text-foreground"
 )}
 >
 {n}
 {on && (
 <motion.span
 layoutId={`scale-mark-${question.id}`}
 className="absolute -bottom-2 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-brand"
 />
 )}
 </motion.button>
 )
 })}
 </div>
 <div className="mt-4 flex justify-between gap-4 text-xs text-muted-foreground sm:text-sm">
 <span>{lowLabel}</span>
 <span className="text-right">{highLabel}</span>
 </div>
 </div>
 )
 }

 case "date":
 return (
 <LineInput
 type="date"
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 autoFocus
 className="max-w-xs"
 />
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
 <LineInput
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 placeholder="Type your answer here…"
 />
 )
 }
}

// File upload: click or drag a file in; it goes to /api/upload (Vercel Blob)
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
 const [isDragging, setIsDragging] = useState(false)
 const inputRef = useRef<HTMLInputElement>(null)
 const maxSizeMB = question.max || 5

 const handleFileUpload = async (file: File) => {
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
 <div className="space-y-3">
 <AnimatePresence>
 {uploadError && (
 <motion.div
 initial={{ opacity: 0, y: -6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="animate-shake rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
 >
 {uploadError}
 </motion.div>
 )}
 </AnimatePresence>

 {!value ? (
 <div
 role="button"
 tabIndex={0}
 aria-label="Upload a file"
 onClick={() => !isUploading && inputRef.current?.click()}
 onKeyDown={(e) => {
 if (e.key === " ") {
 e.preventDefault()
 if (!isUploading) inputRef.current?.click()
 }
 }}
 onDragOver={(e) => {
 e.preventDefault()
 setIsDragging(true)
 }}
 onDragLeave={() => setIsDragging(false)}
 onDrop={(e) => {
 e.preventDefault()
 setIsDragging(false)
 const file = e.dataTransfer.files?.[0]
 if (file && !isUploading) handleFileUpload(file)
 }}
 className={cn(
 "group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 sm:py-12",
 isDragging
 ? "scale-[1.01] border-violet/60 bg-violet/5"
 : "border-[#e2e2ea] bg-white/70 hover:border-foreground/25 hover:bg-white"
 )}
 >
 <input
 ref={inputRef}
 type="file"
 className="hidden"
 disabled={isUploading}
 onChange={(e) => {
 const file = e.target.files?.[0]
 if (file) handleFileUpload(file)
 e.target.value = ""
 }}
 />
 {isUploading ? (
 <div className="flex flex-col items-center">
 <p className="text-lg font-semibold">Uploading…</p>
 <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
 <motion.div
 className="h-full w-1/2 rounded-full bg-brand"
 animate={{ x: ["-100%", "200%"] }}
 transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
 />
 </div>
 </div>
 ) : (
 <>
 <motion.div
 animate={isDragging ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
 className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary shadow-[0_16px_34px_-14px_rgba(124,58,237,0.7)] transition-transform duration-500 group-hover:-rotate-6"
 >
 <UploadCloud className="h-7 w-7 text-white" />
 </motion.div>
 <p className="text-lg font-semibold">
 {isDragging ? "Drop it!" : <>Drop a file here or <span className="underline decoration-violet/40 underline-offset-4">browse</span></>}
 </p>
 <p className="mt-1.5 text-sm text-muted-foreground">Up to {maxSizeMB} MB</p>
 </>
 )}
 </div>
 ) : (
 <motion.div
 initial={{ opacity: 0, scale: 0.96 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-premium"
 >
 <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand">
 <Check className="h-6 w-6 text-white" strokeWidth={3} />
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate font-semibold">{value.name}</p>
 <p className="text-sm text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)} MB · uploaded</p>
 </div>
 <Button
 variant="ghost"
 size="icon"
 aria-label="Remove file"
 onClick={(e) => {
 e.stopPropagation()
 onChange(null)
 }}
 className="text-muted-foreground hover:text-destructive"
 >
 <X className="h-4 w-4" />
 </Button>
 </motion.div>
 )}
 </div>
 )
}
