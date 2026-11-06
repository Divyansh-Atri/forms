"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, ImagePlus, Paperclip, UploadCloud, X } from "lucide-react"
import {
 asFileList,
 fileRules,
 formatBytes,
 isImageType,
 type StoredFile,
} from "@/lib/attachments"
import { cn } from "@/lib/utils"

// ---- Uploads in flight, so a submit can wait for them --------------------

let inFlight = 0

/** True while any file input on the page is still uploading. */
export function uploadsInFlight() {
 return inFlight > 0
}

// Local previews of uploaded images by attachment id. Respondents can't
// read files back from the server, so thumbnails come from their own copy.
const previews = new Map<string, string>()

// ---- Helpers ---------------------------------------------------------------

const MAX_SIDE = 2048

/**
 * Phone photos are often 3-8 MB. Re-encode big images as JPEG with the
 * longest side at most 2048px: usually 300-600 KB, still sharp, and it drops
 * EXIF data such as GPS location. Anything that can't be decoded is sent as is.
 */
async function shrinkImage(file: File): Promise<File> {
 if (!/^image\/(jpeg|png|webp|heic|heif|bmp)$/i.test(file.type) || file.size < 600 * 1024) return file
 try {
 const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
 const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
 const width = Math.round(bitmap.width * scale)
 const height = Math.round(bitmap.height * scale)
 const canvas = document.createElement("canvas")
 canvas.width = width
 canvas.height = height
 const ctx = canvas.getContext("2d")
 if (!ctx) return file
 ctx.fillStyle = "#ffffff" // transparent PNGs get a white background
 ctx.fillRect(0, 0, width, height)
 ctx.drawImage(bitmap, 0, 0, width, height)
 bitmap.close()
 const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
 if (!blob || blob.size >= file.size) return file
 const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
 return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() })
 } catch {
 return file
 }
}

function send(
 file: File,
 formId: string,
 questionId: string,
 onProgress: (fraction: number) => void
): Promise<StoredFile> {
 return new Promise((resolve, reject) => {
 const xhr = new XMLHttpRequest()
 xhr.open("POST", "/api/upload")
 xhr.upload.onprogress = (e) => {
 if (e.lengthComputable) onProgress(e.loaded / e.total)
 }
 xhr.onload = () => {
 let body: { success?: boolean; data?: StoredFile; error?: string } | null = null
 try {
 body = JSON.parse(xhr.responseText)
 } catch {
 // Vercel answers an oversized body with a non-JSON 413
 }
 if (xhr.status < 300 && body?.success && body.data) resolve(body.data)
 else reject(new Error(body?.error || (xhr.status === 413 ? "That file is too big" : "Upload failed. Please try again")))
 }
 xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again"))
 const data = new FormData()
 data.append("formId", formId)
 data.append("questionId", questionId)
 data.append("file", file)
 xhr.send(data)
 })
}

function describeAccept(accept: string) {
 if (!accept) return "Any file"
 const parts = accept.split(",")
 const labels = new Set<string>()
 for (const p of parts) {
 if (p === "image/*") labels.add("Photos")
 else if (p === "video/*") labels.add("Videos")
 else if (p === "audio/*") labels.add("Audio")
 else if (p.startsWith(".")) labels.add(p.slice(1).toUpperCase())
 else if (p === "application/pdf") labels.add("PDF")
 }
 return [...labels].join(", ") || "Selected types"
}

// ---- Component -------------------------------------------------------------

export interface FileQuestion {
 id: string
 maxFileSize?: number
 max?: number
 maxFiles?: number
 allowedTypes?: unknown
}

interface Pending {
 key: string
 name: string
 progress: number
}

export function FileUploadInput({
 formId,
 question,
 value,
 onChange,
 compact = false,
}: {
 formId: string
 question: FileQuestion
 value: unknown
 onChange: (files: StoredFile[] | null) => void
 compact?: boolean
}) {
 const rules = fileRules(question)
 const files = (asFileList(value) ?? []).filter((f): f is StoredFile => !!f.id) as StoredFile[]

 const [pending, setPending] = useState<Pending[]>([])
 const [error, setError] = useState<string | null>(null)
 const [isDragging, setIsDragging] = useState(false)
 const inputRef = useRef<HTMLInputElement>(null)

 // Uploads finish after later renders, so always build on the newest list
 // and call the newest onChange (the parent's closure may be stale)
 const latest = useRef(files)
 const onChangeRef = useRef(onChange)
 useEffect(() => {
 onChangeRef.current = onChange
 })
 useEffect(() => {
 latest.current = (asFileList(value) ?? []).filter((f): f is StoredFile => !!f.id) as StoredFile[]
 }, [value])

 const busy = pending.length > 0
 const room = rules.maxFiles - files.length

 const handleFiles = async (picked: File[]) => {
 if (busy || picked.length === 0) return
 setError(null)
 const space = rules.maxFiles - latest.current.length
 if (space <= 0) {
 setError(rules.maxFiles === 1 ? "Remove the current file to choose another" : `You can attach up to ${rules.maxFiles} files`)
 return
 }
 if (picked.length > space) {
 setError(`Only ${space} more file${space === 1 ? "" : "s"} allowed. The rest were skipped`)
 }

 const batch = picked.slice(0, space).map((file, i) => ({ file, key: `${Date.now()}-${i}` }))
 setPending(batch.map(({ file, key }) => ({ key, name: file.name, progress: 0 })))
 inFlight++
 try {
 // One at a time keeps the order and keeps each request small
 for (const { file: original, key } of batch) {
 try {
 if (!rules.allows(original.name, original.type)) {
 throw new Error(`"${original.name}" isn't an allowed file type`)
 }
 const file = await shrinkImage(original)
 if (file.size > rules.maxBytes) {
 throw new Error(`"${original.name}" is over ${rules.maxMB} MB`)
 }
 const stored = await send(file, formId, question.id, (p) =>
 setPending((list) => list.map((item) => (item.key === key ? { ...item, progress: p } : item)))
 )
 if (isImageType(file.type)) previews.set(stored.id, URL.createObjectURL(file))
 const next = [...latest.current, stored]
 latest.current = next
 onChangeRef.current(next)
 } catch (err) {
 setError(err instanceof Error ? err.message : "Upload failed")
 } finally {
 setPending((list) => list.filter((item) => item.key !== key))
 }
 }
 } finally {
 inFlight--
 }
 }

 const remove = (id: string) => {
 const next = latest.current.filter((f) => f.id !== id)
 latest.current = next
 onChangeRef.current(next.length > 0 ? next : null)
 setError(null)
 }

 const openPicker = () => {
 if (!busy) inputRef.current?.click()
 }

 const hint = [
 describeAccept(rules.accept),
 `up to ${rules.maxMB} MB${rules.maxFiles > 1 ? " each" : ""}`,
 rules.maxFiles > 1 ? `${rules.maxFiles} files max` : null,
 ].filter(Boolean).join(" · ")

 return (
 <div className="space-y-3">
 <input
 ref={inputRef}
 type="file"
 className="hidden"
 accept={rules.accept || undefined}
 multiple={rules.maxFiles > 1}
 onChange={(e) => {
 const list = Array.from(e.target.files ?? [])
 e.target.value = ""
 handleFiles(list)
 }}
 />

 <AnimatePresence>
 {error && (
 <motion.div
 role="alert"
 initial={{ opacity: 0, y: -6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="animate-shake rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
 >
 {error}
 </motion.div>
 )}
 </AnimatePresence>

 {/* Uploaded + uploading files */}
 {(files.length > 0 || pending.length > 0) && (
 <ul className={cn("grid gap-2.5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
 <AnimatePresence initial={false}>
 {files.map((f) => {
 const preview = previews.get(f.id)
 return (
 <motion.li
 key={f.id}
 layout
 initial={{ opacity: 0, scale: 0.94 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
 className="flex items-center gap-3 rounded-2xl border border-border bg-white p-2.5 pr-3 shadow-premium"
 >
 <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand">
 {preview ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={preview} alt="" className="h-full w-full object-cover" />
 ) : (
 <FileText className="h-5 w-5 text-white" />
 )}
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold">{f.name}</p>
 <p className="text-xs text-muted-foreground">{formatBytes(f.size)} · attached</p>
 </div>
 <button
 type="button"
 onClick={() => remove(f.id)}
 aria-label={`Remove ${f.name}`}
 className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
 >
 <X className="h-4 w-4" />
 </button>
 </motion.li>
 )
 })}
 {pending.map((p) => (
 <motion.li
 key={p.key}
 layout
 initial={{ opacity: 0, scale: 0.94 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, transition: { duration: 0.1 } }}
 className="flex items-center gap-3 rounded-2xl border border-dashed border-violet/30 bg-violet/[0.03] p-2.5 pr-3"
 >
 <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white">
 <UploadCloud className="h-5 w-5 animate-pulse text-violet" />
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold">{p.name}</p>
 <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
 <motion.div
 className="h-full rounded-full bg-brand"
 animate={{ width: `${Math.max(6, Math.round(p.progress * 100))}%` }}
 transition={{ ease: "easeOut", duration: 0.3 }}
 />
 </div>
 </div>
 <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
 {Math.round(p.progress * 100)}%
 </span>
 </motion.li>
 ))}
 </AnimatePresence>
 </ul>
 )}

 {/* Drop zone: big when empty, a slim "add more" row after that */}
 {room > 0 && (
 <div
 role="button"
 tabIndex={0}
 aria-label={files.length ? "Attach another file" : "Attach a file or photo"}
 aria-disabled={busy}
 onClick={openPicker}
 onKeyDown={(e) => {
 if (e.key === " ") {
 e.preventDefault()
 openPicker()
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
 handleFiles(Array.from(e.dataTransfer.files ?? []))
 }}
 className={cn(
 "group relative cursor-pointer overflow-hidden border-2 border-dashed text-center transition-all duration-300",
 files.length > 0 || pending.length > 0
 ? "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
 : compact ? "rounded-2xl px-5 py-6" : "rounded-3xl px-6 py-10 sm:py-12",
 isDragging
 ? "scale-[1.01] border-violet/60 bg-violet/5"
 : "border-[#e2e2ea] bg-white/70 hover:border-foreground/25 hover:bg-white",
 busy && "pointer-events-none opacity-60"
 )}
 >
 {files.length > 0 || pending.length > 0 ? (
 <>
 <Paperclip className="h-4 w-4 text-violet" />
 {busy ? "Uploading…" : `Add another (${room} left)`}
 </>
 ) : (
 <>
 <motion.div
 animate={isDragging ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
 className={cn(
 "mx-auto grid place-items-center rounded-2xl bg-primary shadow-[0_16px_34px_-14px_rgba(124,58,237,0.7)] transition-transform duration-500 group-hover:-rotate-6",
 compact ? "mb-3 h-11 w-11" : "mb-5 h-16 w-16"
 )}
 >
 {rules.accept === "image/*"
 ? <ImagePlus className={cn("text-white", compact ? "h-5 w-5" : "h-7 w-7")} />
 : <UploadCloud className={cn("text-white", compact ? "h-5 w-5" : "h-7 w-7")} />}
 </motion.div>
 <p className={cn("font-semibold", compact ? "text-base" : "text-lg")}>
 {isDragging ? "Drop it!" : (
 <>Drop {rules.accept === "image/*" ? "a photo" : "a file"} here or <span className="underline decoration-violet/40 underline-offset-4">browse</span></>
 )}
 </p>
 <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
 </>
 )}
 </div>
 )}
 </div>
 )
}
