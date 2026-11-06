"use client"

// Building blocks shared by the three respondent layouts
// (one-question stepper, section stepper, table form).

import { useEffect } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { AlertCircle, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { burstConfetti } from "@/components/fx"
import { cn } from "@/lib/utils"
import { isFileQuestionType } from "@/lib/attachments"
import { FileUploadInput } from "@/components/forms/file-upload-input"

/** Gradient progress line pinned to the top of the viewport. */
export function ProgressRail({ value }: { value: number }) {
 return (
 <div className="fixed inset-x-0 top-0 z-50 h-1 bg-black/[0.04]" aria-hidden>
 <motion.div
 className="relative h-full origin-left bg-brand"
 initial={false}
 animate={{ scaleX: Math.max(0, Math.min(1, value)) }}
 transition={{ type: "spring", stiffness: 120, damping: 22 }}
 >
 <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange blur-[6px]" />
 </motion.div>
 </div>
 )
}

/** Small "made with" pill shown at the bottom of public forms. */
export function MadeWith() {
 return (
 <Link
 href="/"
 className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:text-foreground hover:shadow-premium"
 >
 <span className="h-2 w-2 rounded-full bg-brand transition-transform duration-500 group-hover:scale-150" />
 Made with <span className="font-semibold text-foreground">sanjeevatri</span>
 </Link>
 )
}

/** Floating error message (replaces browser alert dialogs). */
export function ErrorToast({ message, onClose }: { message: string | null; onClose: () => void }) {
 useEffect(() => {
 if (!message) return
 const t = setTimeout(onClose, 6000)
 return () => clearTimeout(t)
 }, [message, onClose])

 return (
 <AnimatePresence>
 {message && (
 <motion.div
 role="alert"
 initial={{ opacity: 0, y: 24, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 16, scale: 0.98 }}
 transition={{ type: "spring", stiffness: 260, damping: 24 }}
 className="fixed inset-x-4 bottom-6 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-destructive/15 bg-white p-4 shadow-premium-lg"
 >
 <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
 <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
 <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="Dismiss">
 <X className="h-4 w-4" />
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 )
}

/** Gradient ring + tick that draw themselves in. */
export function AnimatedCheck({ className }: { className?: string }) {
 const reduce = useReducedMotion()
 const draw = (delay: number) => ({
 initial: reduce ? false : { pathLength: 0, opacity: 0 },
 animate: { pathLength: 1, opacity: 1 },
 transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
 })
 return (
 <svg viewBox="0 0 120 120" className={className} aria-hidden>
 <defs>
 <linearGradient id="check-grad" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stopColor="#7c3aed" />
 <stop offset="55%" stopColor="#ec4899" />
 <stop offset="100%" stopColor="#f97316" />
 </linearGradient>
 </defs>
 <motion.circle cx="60" cy="60" r="52" fill="none" stroke="url(#check-grad)" strokeWidth="6" strokeLinecap="round" {...draw(0.1)} />
 <motion.path d="M38 62 L53 77 L84 45" fill="none" stroke="#0b0b0f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" {...draw(0.6)} />
 </svg>
 )
}

/** Shown after a successful submission, with a confetti burst. */
export function SuccessScreen({ onReset, className }: { onReset: () => void; className?: string }) {
 useEffect(() => {
 const t = setTimeout(() => burstConfetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.38 }), 450)
 return () => clearTimeout(t)
 }, [])

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
 animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
 transition={{ type: "spring", stiffness: 140, damping: 20 }}
 className={cn("mx-auto w-full max-w-xl text-center", className)}
 >
 <div className="relative mx-auto mb-10 h-32 w-32">
 <div className="absolute inset-0 rounded-full bg-brand opacity-30 blur-2xl animate-pulse" />
 <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-premium-lg">
 <AnimatedCheck className="h-24 w-24" />
 </div>
 </div>
 <motion.h1
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.5, type: "spring", stiffness: 160, damping: 20 }}
 className="text-5xl font-semibold tracking-[-0.045em] sm:text-6xl"
 >
 Thank <span className="font-display italic font-normal gradient-text pr-1">you!</span>
 </motion.h1>
 <motion.p
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.65, duration: 0.6 }}
 className="mx-auto mt-5 max-w-sm text-lg text-muted-foreground"
 >
 Your response is in. That&apos;s all we needed.
 </motion.p>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.85 }}
 className="mt-10"
 >
 <Button variant="outline" size="lg" onClick={onReset} className="group">
 <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
 Submit another response
 </Button>
 </motion.div>
 </motion.div>
 )
}

/** A question inside a form section (imported JSON forms, table layout). */
export interface SectionQuestion {
 id: string
 type?: string
 title?: string
 label?: string
 description?: string
 placeholder?: string
 required?: boolean
 // File upload settings
 maxFileSize?: number
 maxFiles?: number
 allowedTypes?: unknown
}

// Keys are lowercased types: imported forms use SHORT_TEXT, the editor saves shortText
const SECTION_INPUT_TYPES: Record<string, string> = {
 short_text: "text", shorttext: "text", text: "text", email: "email", phone: "tel", tel: "tel",
 url: "url", number: "number", date: "date",
}

/**
 * Input for section/table questions. Imported JSON forms use the types
 * SHORT_TEXT, LONG_TEXT, NUMBER, DATE, EMAIL, PHONE, URL and FILE_UPLOAD.
 */
export function SectionField({
 formId,
 question,
 value,
 onChange,
 compact = false,
}: {
 formId: string
 question: SectionQuestion
 value: unknown
 onChange: (value: unknown) => void
 compact?: boolean
}) {
 if (isFileQuestionType(question.type)) {
 return <FileUploadInput formId={formId} question={question} value={value} onChange={onChange} compact={compact} />
 }

 const type = (question.type || "short_text").toLowerCase()
 const base = cn(
 "w-full rounded-2xl border-[1.5px] border-border bg-white/90 px-5 text-foreground placeholder:text-muted-foreground/50",
 "transition-all duration-300 hover:border-[#d4d4dc] focus:border-violet/50 focus:bg-white",
 compact ? "py-3 text-base" : "py-4 text-lg"
 )
 const placeholder = question.placeholder || (compact ? "" : question.description) || "Type your answer…"

 if (type === "long_text" || type === "longtext" || type === "textarea") {
 return (
 <textarea
 id={question.id}
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 required={question.required}
 placeholder={placeholder}
 rows={compact ? 3 : 4}
 className={cn(base, "resize-none")}
 />
 )
 }

 const inputType = SECTION_INPUT_TYPES[type] || "text"
 return (
 <input
 id={question.id}
 type={inputType}
 value={(value as string) || ""}
 onChange={(e) => onChange(e.target.value)}
 required={question.required}
 placeholder={inputType === "date" ? undefined : inputType === "number" ? "0" : placeholder}
 className={cn(base, inputType === "number" && "max-w-[12rem]", inputType === "date" && "max-w-[16rem]")}
 />
 )
}
