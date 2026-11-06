"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DeletableForm {
 id: string
 title: string
 _count?: { responses?: number }
}

interface DeleteFormsDialogProps {
 forms: DeletableForm[] | null
 deleting: boolean
 onCancel: () => void
 onConfirm: () => void
}

// Forms can be rebuilt; collected responses can't. So deleting anything that
// has responses asks the user to type this word first.
const CONFIRM_WORD = "delete"
const LISTED = 5

export function DeleteFormsDialog({ forms, deleting, onCancel, onConfirm }: DeleteFormsDialogProps) {
 return (
 <AnimatePresence>
 {forms && forms.length > 0 && (
 <DialogBody forms={forms} deleting={deleting} onCancel={onCancel} onConfirm={onConfirm} />
 )}
 </AnimatePresence>
 )
}

function DialogBody({ forms, deleting, onCancel, onConfirm }: DeleteFormsDialogProps & { forms: DeletableForm[] }) {
 const [typed, setTyped] = useState("")
 const inputRef = useRef<HTMLInputElement>(null)
 const cancelRef = useRef<HTMLButtonElement>(null)

 const responseCount = forms.reduce((sum, f) => sum + (f._count?.responses || 0), 0)
 const needsTyping = responseCount > 0
 const canDelete = !deleting && (!needsTyping || typed.trim().toLowerCase() === CONFIRM_WORD)
 const many = forms.length > 1

 useEffect(() => {
 // Focus the safe choice, or the confirm box when typing is required
 if (needsTyping) inputRef.current?.focus()
 else cancelRef.current?.focus()
 }, [needsTyping])

 useEffect(() => {
 const onKey = (e: KeyboardEvent) => {
 if (e.key === "Escape" && !deleting) onCancel()
 }
 window.addEventListener("keydown", onKey)
 return () => window.removeEventListener("keydown", onKey)
 }, [deleting, onCancel])

 return (
 <motion.div
 className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0, transition: { duration: 0.15 } }}
 >
 <div
 className="absolute inset-0 bg-[#0b0b0f]/30 backdrop-blur-sm"
 onClick={() => !deleting && onCancel()}
 aria-hidden="true"
 />
 <motion.div
 role="dialog"
 aria-modal="true"
 aria-labelledby="delete-forms-title"
 aria-describedby="delete-forms-desc"
 initial={{ opacity: 0, y: 24, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.15 } }}
 transition={{ type: "spring", stiffness: 380, damping: 30 }}
 className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/[0.07] bg-white p-6 shadow-[0_40px_80px_-32px_rgba(16,16,32,0.45)]"
 >
 <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-destructive/15 blur-3xl" aria-hidden="true" />

 <div className="relative flex items-start gap-4">
 <motion.div
 initial={{ rotate: -12, scale: 0.6 }}
 animate={{ rotate: 0, scale: 1 }}
 transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.05 }}
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10"
 >
 <Trash2 className="h-5 w-5 text-destructive" />
 </motion.div>
 <div className="min-w-0 flex-1">
 <h2 id="delete-forms-title" className="text-lg font-semibold tracking-[-0.02em] text-foreground">
 {many ? `Delete ${forms.length} forms?` : `Delete "${forms[0].title}"?`}
 </h2>
 <p id="delete-forms-desc" className="mt-1 text-sm text-muted-foreground">
 {responseCount > 0 ? (
 <>
 This also deletes{" "}
 <span className="font-semibold text-foreground tabular-nums">{responseCount}</span>{" "}
 {responseCount === 1 ? "response" : "responses"}. This can&apos;t be undone.
 </>
 ) : (
 <>{many ? "None of them have" : "It has no"} responses. This can&apos;t be undone.</>
 )}
 </p>
 </div>
 </div>

 {many && (
 <ul className="relative mt-5 max-h-44 space-y-1 overflow-y-auto rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-2">
 {forms.slice(0, LISTED).map((f) => (
 <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-sm">
 <span className="truncate text-foreground">{f.title}</span>
 <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
 {f._count?.responses || 0} resp.
 </span>
 </li>
 ))}
 {forms.length > LISTED && (
 <li className="px-3 py-1.5 text-xs text-muted-foreground">and {forms.length - LISTED} more</li>
 )}
 </ul>
 )}

 {needsTyping && (
 <div className="relative mt-5">
 <label htmlFor="delete-confirm" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
 <AlertTriangle className="h-3.5 w-3.5 text-orange" />
 Type <span className="kbd">{CONFIRM_WORD}</span> to confirm
 </label>
 <input
 id="delete-confirm"
 ref={inputRef}
 value={typed}
 onChange={(e) => setTyped(e.target.value)}
 onKeyDown={(e) => { if (e.key === "Enter" && canDelete) onConfirm() }}
 autoComplete="off"
 spellCheck={false}
 disabled={deleting}
 className="mt-2 h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-destructive/50 focus:shadow-[0_0_0_4px_rgba(225,29,72,0.12)]"
 placeholder={CONFIRM_WORD}
 />
 </div>
 )}

 <div className="relative mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
 <Button ref={cancelRef} variant="outline" onClick={onCancel} disabled={deleting}>
 Cancel
 </Button>
 <button
 onClick={onConfirm}
 disabled={!canDelete}
 className={cn(
 "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-white transition-all",
 "bg-destructive shadow-[0_10px_24px_-12px_rgba(225,29,72,0.9)] hover:brightness-110 active:scale-[0.97]",
 "disabled:pointer-events-none disabled:opacity-40"
 )}
 >
 {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
 {deleting ? "Deleting…" : many ? `Delete ${forms.length} forms` : "Delete form"}
 </button>
 </div>
 </motion.div>
 </motion.div>
 )
}
