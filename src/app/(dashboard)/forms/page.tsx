"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { JsonImportDialog } from "@/components/forms/json-import-dialog"
import { DeleteFormsDialog } from "@/components/forms/delete-forms-dialog"
import { Eyebrow, trackSpotlight } from "@/components/fx"
import { cn } from "@/lib/utils"
import {
 Plus,
 Search,
 MoreVertical,
 Edit3,
 Copy,
 BarChart3,
 FileText,
 Clock,
 CheckCircle,
 Pause,
 Archive,
 FileJson,
 Layers,
 Send,
 Sparkles,
 ListChecks,
 Trash2,
 Check,
 X
} from "lucide-react"

interface Form {
 id: string
 slug?: string
 title: string
 description: string
 status: string
 responses?: number
 createdAt: string
 updatedAt: string
 _count?: { responses?: number }
}

const statusConfig = {
 DRAFT: { label: "Draft", icon: Edit3, color: "secondary" },
 PUBLISHED: { label: "Published", icon: CheckCircle, color: "success" },
 CLOSED: { label: "Closed", icon: Pause, color: "warning" },
 ARCHIVED: { label: "Archived", icon: Archive, color: "secondary" },
}

// Each form gets its own cover colours, picked from its id so they stay stable
const COVERS = [
 ["#7c3aed", "#ec4899"],
 ["#ec4899", "#f97316"],
 ["#06b6d4", "#7c3aed"],
 ["#f97316", "#facc15"],
 ["#7c3aed", "#06b6d4"],
 ["#ec4899", "#7c3aed"],
]

function coverFor(id: string) {
 let hash = 0
 for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
 return COVERS[hash % COVERS.length]
}

function CountUp({ value }: { value: number }) {
 const reduce = useReducedMotion()
 const count = useMotionValue(0)
 const rounded = useTransform(count, (v) => Math.round(v))

 useEffect(() => {
 if (reduce) { count.set(value); return }
 const controls = animate(count, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })
 return () => controls.stop()
 }, [count, value, reduce])

 return <motion.span>{rounded}</motion.span>
}

export default function FormsPage() {
 const [forms, setForms] = useState<Form[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [searchQuery, setSearchQuery] = useState("")
 const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
 const [openMenu, setOpenMenu] = useState<string | null>(null)
 const [showImportDialog, setShowImportDialog] = useState(false)

 // Bulk select + delete
 const [selecting, setSelecting] = useState(false)
 const [selected, setSelected] = useState<Set<string>>(new Set())
 const [pendingDelete, setPendingDelete] = useState<Form[] | null>(null)
 const [deleting, setDeleting] = useState(false)
 const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null)

 useEffect(() => {
 if (!notice) return
 const t = setTimeout(() => setNotice(null), 4500)
 return () => clearTimeout(t)
 }, [notice])

 // Fetch forms from API
 useEffect(() => {
 async function fetchForms() {
 try {
 setIsLoading(true)
 const response = await fetch('/api/forms')
 const result = await response.json()

 if (result.success) {
 setForms(result.data)
 } else {
 setError(result.error || 'Failed to fetch forms')
 }
 } catch {
 setError('Failed to connect to server')
 } finally {
 setIsLoading(false)
 }
 }

 fetchForms()

 // Refresh when window regains focus (user navigates back)
 // But don't refresh if dialog is open (would cause file selection to reset)
 const handleFocus = () => {
 // Check if dialog is open by checking for any modal in the DOM
 const hasOpenModal = document.querySelector('[role="dialog"]') ||
 document.querySelector('.fixed.inset-0')
 if (!hasOpenModal) {
 fetchForms()
 }
 }

 window.addEventListener('focus', handleFocus)
 return () => window.removeEventListener('focus', handleFocus)
 }, [])

 const filteredForms = forms.filter((form) => {
 const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase())
 const matchesStatus = !selectedStatus || form.status === selectedStatus
 return matchesSearch && matchesStatus
 })

 const handleDuplicate = async (form: Form) => {
 try {
 const response = await fetch(`/api/forms/${form.id}/duplicate`, {
 method: 'POST',
 })
 const result = await response.json()
 if (result.success) {
 setForms([result.data, ...forms])
 alert('Form duplicated successfully!')
 } else {
 alert(result.error || 'Failed to duplicate form')
 }
 } catch {
 alert('Failed to duplicate form')
 }
 setOpenMenu(null)
 }

 // Selection only counts forms that are visible under the current filters,
 // so a search can never hide something that is about to be deleted
 const selectedForms = filteredForms.filter((f) => selected.has(f.id))
 const allVisibleSelected = filteredForms.length > 0 && selectedForms.length === filteredForms.length

 const exitSelecting = useCallback(() => {
 setSelecting(false)
 setSelected(new Set())
 }, [])

 const toggleSelected = (id: string) => {
 setSelected((prev) => {
 const next = new Set(prev)
 if (next.has(id)) next.delete(id)
 else next.add(id)
 return next
 })
 }

 const toggleSelectAll = () => {
 setSelected(allVisibleSelected ? new Set() : new Set(filteredForms.map((f) => f.id)))
 }

 // Esc leaves selection mode (the delete dialog handles its own Esc)
 useEffect(() => {
 if (!selecting) return
 const onKey = (e: KeyboardEvent) => {
 if (e.key === "Escape" && !pendingDelete) exitSelecting()
 }
 window.addEventListener("keydown", onKey)
 return () => window.removeEventListener("keydown", onKey)
 }, [selecting, pendingDelete, exitSelecting])

 const handleDelete = (form: Form) => {
 setOpenMenu(null)
 setPendingDelete([form])
 }

 const confirmDelete = async () => {
 if (!pendingDelete) return
 const ids = pendingDelete.map((f) => f.id)
 setDeleting(true)
 try {
 const response = await fetch('/api/forms/bulk-delete', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ ids }),
 })
 const result = await response.json()
 if (!response.ok || !result.success) throw new Error(result.error || 'Failed to delete')

 const gone = new Set(ids)
 setForms((prev) => prev.filter((f) => !gone.has(f.id)))
 setPendingDelete(null)
 const n = result.data.forms as number
 setNotice({ text: n === 1 ? 'Form deleted' : `${n} forms deleted` })
 exitSelecting()
 } catch (err) {
 setNotice({ text: err instanceof Error ? err.message : 'Failed to delete', error: true })
 } finally {
 setDeleting(false)
 }
 }

 const handleTogglePublish = async (form: Form) => {
 const newStatus = form.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
 try {
 const response = await fetch(`/api/forms/${form.id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: newStatus }),
 })
 const result = await response.json()
 if (result.success) {
 setForms(forms.map(f => f.id === form.id ? { ...f, status: newStatus } : f))
 }
 } catch {
 alert('Failed to update form')
 }
 setOpenMenu(null)
 }

 if (isLoading) {
 return (
 <div className="space-y-8" aria-busy="true" aria-label="Loading forms">
 <div className="space-y-3">
 <div className="skeleton h-6 w-28 rounded-full" />
 <div className="skeleton h-12 w-64" />
 </div>
 <div className="grid gap-4 sm:grid-cols-3">
 {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
 </div>
 <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
 {[0, 1, 2].map((i) => (
 <div key={i} className="rounded-2xl border border-border bg-white/80 overflow-hidden">
 <div className="skeleton h-24 rounded-none" />
 <div className="p-5 space-y-3">
 <div className="skeleton h-5 w-2/3" />
 <div className="skeleton h-4 w-full" />
 <div className="skeleton h-4 w-1/2" />
 </div>
 </div>
 ))}
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <Card className="p-12 text-center bg-white/90 border-border">
 <p className="text-destructive mb-4">{error}</p>
 <Button onClick={() => window.location.reload()}>Retry</Button>
 </Card>
 )
 }

 const totalResponses = forms.reduce((sum, f) => sum + (f._count?.responses || 0), 0)
 const publishedCount = forms.filter((f) => f.status === "PUBLISHED").length
 const stats = [
 { label: "Forms", value: forms.length, icon: Layers, tint: "from-violet/15 to-violet/0", iconColor: "text-violet" },
 { label: "Live now", value: publishedCount, icon: Send, tint: "from-pink/15 to-pink/0", iconColor: "text-pink" },
 { label: "Responses", value: totalResponses, icon: BarChart3, tint: "from-orange/15 to-orange/0", iconColor: "text-orange" },
 ]

 return (
 <div className={cn("space-y-8", selecting && "pb-24")}>
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
 >
 <Eyebrow className="mb-4">Workspace</Eyebrow>
 <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-foreground">
 Your <span className="font-display italic font-normal tracking-normal gradient-text pr-1">forms</span>
 </h1>
 <p className="mt-2 text-muted-foreground">Create and manage your forms</p>
 </motion.div>
 <motion.div
 className="flex gap-2"
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
 >
 <Button variant="outline" onClick={() => setShowImportDialog(true)}>
 <FileJson className="w-4 h-4" />
 Import JSON
 </Button>
 <Link href="/forms/new">
 <Button>
 <Plus className="w-4 h-4" />
 Create Form
 </Button>
 </Link>
 </motion.div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-3 gap-3 sm:gap-4">
 {stats.map((stat, i) => (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 transition={{ duration: 0.7, delay: 0.12 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
 onPointerMove={trackSpotlight}
 className="spotlight relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 backdrop-blur p-3 sm:p-5"
 >
 <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br blur-xl", stat.tint)} />
 <div className="relative flex items-center gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.06em] sm:tracking-[0.12em] text-muted-foreground">
 <stat.icon className={cn("hidden sm:block w-3.5 h-3.5 shrink-0", stat.iconColor)} />
 <span className="truncate">{stat.label}</span>
 </div>
 <p className="relative mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-semibold tracking-[-0.04em] tabular-nums text-foreground">
 <CountUp value={stat.value} />
 </p>
 </motion.div>
 ))}
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
 <div className="relative flex-1 max-w-md group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 transition-colors group-focus-within:text-violet" />
 <Input
 placeholder="Search forms..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10 rounded-full h-11 bg-white/90"
 />
 </div>
 <div className="inline-flex self-start sm:self-auto items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/80 backdrop-blur p-1 shadow-[0_1px_2px_rgba(16,16,32,0.04)]">
 {["ALL", "PUBLISHED", "DRAFT", "CLOSED"].map((status) => {
 const active = selectedStatus === (status === "ALL" ? null : status) || (status === "ALL" && !selectedStatus)
 return (
 <button
 key={status}
 onClick={() => setSelectedStatus(status === "ALL" ? null : status)}
 className={cn(
 "relative h-9 px-3.5 sm:px-4 rounded-full text-sm font-medium transition-colors",
 active ? "text-white" : "text-muted-foreground hover:text-foreground"
 )}
 >
 {active && (
 <motion.span
 layoutId="status-pill"
 className="absolute inset-0 rounded-full bg-primary shadow-[0_8px_20px_-10px_rgba(124,58,237,0.8)]"
 transition={{ type: "spring", stiffness: 420, damping: 34 }}
 />
 )}
 <span className="relative">
 {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
 </span>
 </button>
 )
 })}
 </div>
 {forms.length > 0 && (
 <button
 onClick={() => {
 if (selecting) return exitSelecting()
 setOpenMenu(null)
 setSelecting(true)
 }}
 aria-pressed={selecting}
 className={cn(
 "sm:ml-auto self-start sm:self-auto inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-300",
 selecting
 ? "border-violet/30 bg-violet/10 text-violet"
 : "border-black/[0.06] bg-white/80 backdrop-blur text-muted-foreground hover:text-foreground hover:border-black/[0.12]"
 )}
 >
 {selecting ? <X className="w-4 h-4" /> : <ListChecks className="w-4 h-4" />}
 {selecting ? "Cancel" : "Select"}
 </button>
 )}
 </div>

 {/* Forms Grid */}
 {filteredForms.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.97 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 className="relative overflow-hidden rounded-3xl border border-dashed border-black/[0.12] bg-white/70 backdrop-blur px-6 py-16 text-center"
 >
 <div className="absolute left-1/2 top-6 -translate-x-1/2 w-56 h-56 rounded-full bg-brand opacity-[0.12] blur-3xl" />
 <div className="relative mx-auto mb-6 w-16 h-16 animate-float">
 <div className="absolute inset-0 rounded-2xl bg-brand blur-lg opacity-50" />
 <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
 <FileText className="w-7 h-7 text-white" />
 </div>
 </div>
 <h3 className="relative text-2xl font-semibold mb-2 text-foreground">
 No forms <span className="font-display italic font-normal">found</span>
 </h3>
 <p className="relative text-muted-foreground mb-6">
 {searchQuery ? "Try adjusting your search" : "Create your first form to get started"}
 </p>
 <Link href="/forms/new" className="relative inline-block">
 <Button size="lg">
 <Plus className="w-4 h-4" />
 Create Form
 </Button>
 </Link>
 </motion.div>
 ) : (
 <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
 <AnimatePresence mode="popLayout">
 {filteredForms.map((form, index) => {
 const status = statusConfig[form.status as keyof typeof statusConfig] || statusConfig.DRAFT
 const [c1, c2] = coverFor(form.id)
 const responseCount = form._count?.responses || 0
 const isSelected = selecting && selected.has(form.id)
 return (
 <motion.div
 key={form.id}
 layout
 initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)", transition: { duration: 0.2, ease: "easeOut" } }}
 transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.06, ease: [0.16, 1, 0.3, 1] }}
 onPointerMove={trackSpotlight}
 className={cn(
 "spotlight group relative rounded-2xl border border-black/[0.06] bg-white/90 backdrop-blur",
 "shadow-[0_1px_2px_rgba(16,16,32,0.04)] transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
 "hover:-translate-y-1 hover:border-violet/20 hover:shadow-[0_28px_56px_-28px_rgba(124,58,237,0.35)]",
 openMenu === form.id && "z-20",
 isSelected && "border-violet/50 shadow-[0_0_0_3px_rgba(124,58,237,0.18),0_28px_56px_-28px_rgba(124,58,237,0.45)] hover:border-violet/50"
 )}
 >
 {/* In selection mode the whole card is one toggle, covering its links */}
 {selecting && (
 <button
 type="button"
 onClick={() => toggleSelected(form.id)}
 aria-pressed={isSelected}
 aria-label={`${isSelected ? "Deselect" : "Select"} ${form.title}`}
 className="absolute inset-0 z-30 rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25"
 >
 <motion.span
 initial={{ scale: 0.4, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ type: "spring", stiffness: 520, damping: 26 }}
 className={cn(
 "absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors duration-200",
 isSelected
 ? "border-violet bg-violet shadow-[0_6px_16px_-6px_rgba(124,58,237,0.9)]"
 : "border-black/20 bg-white/90 backdrop-blur"
 )}
 >
 <AnimatePresence>
 {isSelected && (
 <motion.span
 initial={{ scale: 0, rotate: -45 }}
 animate={{ scale: 1, rotate: 0 }}
 exit={{ scale: 0 }}
 transition={{ type: "spring", stiffness: 600, damping: 20 }}
 >
 <Check className="h-4 w-4 text-white" strokeWidth={3} />
 </motion.span>
 )}
 </AnimatePresence>
 </motion.span>
 </button>
 )}

 {/* Cover */}
 <Link href={`/forms/${form.id}`} className="block relative h-24 overflow-hidden rounded-t-2xl" aria-label={`Edit ${form.title}`}>
 <div className="absolute inset-0 bg-[#fbfbfd]" />
 <div
 className="absolute -left-6 -top-10 w-40 h-40 rounded-full blur-2xl opacity-45 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-6 group-hover:scale-110"
 style={{ background: c1 }}
 />
 <div
 className="absolute -right-8 -bottom-16 w-44 h-44 rounded-full blur-2xl opacity-40 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-6 group-hover:scale-110"
 style={{ background: c2 }}
 />
 <div className="absolute inset-0 [background-image:radial-gradient(rgba(20,20,40,0.12)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
 <span className="absolute left-5 bottom-1 font-display italic text-6xl leading-none text-foreground/80 select-none transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1 group-hover:-rotate-3">
 {form.title.trim().charAt(0).toUpperCase() || "F"}
 </span>
 <div className="absolute right-3 top-3">
 <Badge variant={status.color as "default" | "secondary" | "success" | "warning" | "danger" | "outline"} className="shadow-sm">
 {form.status === "PUBLISHED" ? (
 <span className="relative mr-1.5 flex h-1.5 w-1.5">
 <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
 <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
 </span>
 ) : (
 <status.icon className="w-3 h-3 mr-1" />
 )}
 {status.label}
 </Badge>
 </div>
 </Link>

 <div className="p-5 pt-4">
 <div className="flex items-start justify-between gap-2 mb-4">
 <div className="flex-1 min-w-0">
 <Link href={`/forms/${form.id}`}>
 <h3 className="font-semibold text-[1.05rem] truncate text-foreground transition-colors group-hover:text-violet">
 {form.title}
 </h3>
 </Link>
 <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[1.25rem]">
 {form.description}
 </p>
 </div>
 <div className="relative">
 <button
 className={cn(
 "p-1.5 rounded-full transition-colors",
 openMenu === form.id ? "bg-black/[0.06]" : "hover:bg-black/[0.05]"
 )}
 aria-label="Form actions"
 onClick={(e) => {
 e.stopPropagation()
 setOpenMenu(openMenu === form.id ? null : form.id)
 }}
 >
 <MoreVertical className="w-4 h-4 text-muted-foreground" />
 </button>
 <AnimatePresence>
 {openMenu === form.id && (
 <motion.div
 initial={{ opacity: 0, scale: 0.92, y: -6 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12, ease: "easeOut" } }}
 transition={{ type: "spring", stiffness: 500, damping: 32 }}
 style={{ transformOrigin: "top right" }}
 className="absolute right-0 top-full mt-1.5 w-40 p-1.5 bg-white/95 backdrop-blur-xl border border-black/[0.07] rounded-xl shadow-[0_20px_40px_-16px_rgba(16,16,32,0.3)] z-10"
 >
 <Link
 href={`/forms/${form.id}`}
 className="block px-3 py-2 text-sm text-foreground rounded-lg hover:bg-black/[0.05]"
 onClick={() => setOpenMenu(null)}
 >
 Edit
 </Link>
 <button
 className="block w-full text-left px-3 py-2 text-sm text-foreground rounded-lg hover:bg-black/[0.05]"
 onClick={() => handleDuplicate(form)}
 >
 Duplicate
 </button>
 <button
 className="block w-full text-left px-3 py-2 text-sm text-foreground rounded-lg hover:bg-black/[0.05]"
 onClick={() => handleTogglePublish(form)}
 >
 {form.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
 </button>
 <div className="my-1 h-px bg-black/[0.06]" />
 <button
 className="block w-full text-left px-3 py-2 text-sm text-destructive rounded-lg hover:bg-destructive/10"
 onClick={() => handleDelete(form)}
 >
 Delete
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <div className="flex items-center gap-1.5">
 <BarChart3 className="w-4 h-4" />
 <span>
 <span className="font-semibold text-foreground tabular-nums">{responseCount}</span> responses
 </span>
 </div>
 <div className="flex items-center gap-1.5">
 <Clock className="w-4 h-4" />
 <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex border-t border-black/[0.06] divide-x divide-black/[0.06]">
 <Link href={`/forms/${form.id}`} className="flex-1">
 <button className="group/btn w-full py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-1.5 rounded-bl-2xl">
 <Edit3 className="w-4 h-4 transition-transform duration-300 group-hover/btn:-rotate-12 group-hover/btn:text-violet" />
 Edit
 </button>
 </Link>
 <Link href={`/forms/${form.id}/responses`} className="flex-1">
 <button className="group/btn w-full py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-1.5">
 <BarChart3 className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:text-pink" />
 Responses
 </button>
 </Link>
 <button
 className="group/btn flex-1 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-1.5 rounded-br-2xl"
 onClick={() => {
 // Public forms are served at /f/<slug>
 const url = `${window.location.origin}/f/${form.slug || form.id}`
 navigator.clipboard.writeText(url)
 alert(`Form URL copied: ${url}`)
 }}
 >
 <Copy className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:text-orange" />
 Copy
 </button>
 </div>
 </motion.div>
 )
 })}
 </AnimatePresence>
 </motion.div>
 )}

 {/* Tiny footer flourish */}
 {forms.length > 0 && (
 <p className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground/70">
 <Sparkles className="w-3.5 h-3.5 text-violet/60" />
 Tip: click a card&apos;s cover to jump straight into the editor
 </p>
 )}

 {/* Bulk action bar (sits over the content area, clear of the sidebar) */}
 <AnimatePresence>
 {selecting && (
 <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 lg:left-64">
 <motion.div
 initial={{ opacity: 0, y: 40, scale: 0.94 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.18 } }}
 transition={{ type: "spring", stiffness: 380, damping: 30 }}
 role="toolbar"
 aria-label="Bulk actions"
 className="pointer-events-auto flex w-full max-w-xl items-center gap-1.5 sm:gap-2 rounded-full bg-[#0b0b0f] p-1.5 pl-4 sm:pl-5 text-white shadow-[0_24px_60px_-20px_rgba(16,16,32,0.7),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
 >
 <span className="flex-1 min-w-0 truncate text-sm">
 <span className="font-semibold tabular-nums">{selectedForms.length}</span>
 <span className="text-white/60"> selected</span>
 </span>
 <button
 onClick={toggleSelectAll}
 disabled={filteredForms.length === 0}
 className="h-9 shrink-0 rounded-full px-3 sm:px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
 >
 {allVisibleSelected ? "Clear" : `Select all${filteredForms.length ? ` (${filteredForms.length})` : ""}`}
 </button>
 <button
 onClick={() => setPendingDelete(selectedForms)}
 disabled={selectedForms.length === 0}
 className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-destructive px-3.5 sm:px-4 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.96] disabled:opacity-35 disabled:pointer-events-none"
 >
 <Trash2 className="h-4 w-4" />
 Delete
 </button>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <DeleteFormsDialog
 forms={pendingDelete}
 deleting={deleting}
 onCancel={() => setPendingDelete(null)}
 onConfirm={confirmDelete}
 />

 {/* Result toast */}
 <AnimatePresence>
 {notice && (
 <motion.div
 role="status"
 initial={{ opacity: 0, y: -16, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
 transition={{ type: "spring", stiffness: 380, damping: 28 }}
 className={cn(
 "fixed left-1/2 top-20 z-[80] -translate-x-1/2 flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-sm font-medium shadow-[0_16px_40px_-16px_rgba(16,16,32,0.35)]",
 notice.error ? "border-destructive/20 text-destructive" : "border-black/[0.06] text-foreground"
 )}
 >
 {notice.error ? <X className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-500" />}
 {notice.text}
 </motion.div>
 )}
 </AnimatePresence>

 {/* JSON Import Dialog */}
 {showImportDialog && (
 <JsonImportDialog onClose={() => setShowImportDialog(false)} />
 )}
 </div>
 )
}
