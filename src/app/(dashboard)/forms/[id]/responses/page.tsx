"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteDialog } from "@/components/forms/delete-forms-dialog"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
 ArrowLeft,
 Download,
 Search,
 Eye,
 Trash2,
 CheckCircle,
 Clock,
 Filter,
 Calendar,
 Users,
 TrendingUp,
 Loader2,
 X,
 Paperclip,
 Check,
 ChevronsUpDown,
} from "lucide-react"
import { asFileList, formatBytes, isImageType } from "@/lib/attachments"

interface Question {
 id: string
 title: string
 type: string
}

interface Form {
 id: string
 title: string
 questions: Question[]
}

interface Response {
 id: string
 data: Record<string, unknown>
 isComplete: boolean
 createdAt: string
 completedAt: string | null
 timeSpent: number
 metadata: {
 device?: string
 browser?: string
 [key: string]: unknown
 }
}

// Short text for list previews and search
const valueText = (value: unknown): string => {
 const files = asFileList(value)
 if (files) return files.map((f) => f.name).join(', ')
 if (Array.isArray(value)) return value.join(', ')
 return String(value)
}

const renderResponseValue = (value: unknown) => {
 // File Upload (stored in the database; old answers may hold a Blob URL)
 const files = asFileList(value)
 if (files) {
 return (
 <div className="grid gap-3 sm:grid-cols-2">
 {files.map((f, i) => (
 <div key={f.id || i} className="overflow-hidden rounded-xl border border-border bg-white">
 {isImageType(f.type) && (
 <a href={f.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden bg-muted">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={f.url}
 alt={f.name}
 loading="lazy"
 className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105"
 />
 </a>
 )}
 <div className="flex items-center gap-3 p-3">
 <Paperclip className="h-4 w-4 shrink-0 text-violet" />
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-medium text-slate-900">{f.name}</p>
 {f.size !== undefined && <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>}
 </div>
 <a
 href={f.url.startsWith('/api/files/') ? `${f.url}?download=1` : f.url}
 target="_blank"
 rel="noopener noreferrer"
 className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
 >
 Download
 </a>
 </div>
 </div>
 ))}
 </div>
 )
 }

 // Array (Multiple Choice, Ranking)
 if (Array.isArray(value)) {
 return (
 <ul className="list-disc list-inside space-y-1">
 {value.map((item: any, i: number) => (
 <li key={i} className="text-slate-800">{String(item)}</li>
 ))}
 </ul>
 )
 }

 // Image (Signature, Image Choice)
 const isImage = typeof value === 'string' && (
 value.startsWith('data:image') ||
 (value.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)$/i.test(value))
 )
 if (isImage) {
 return <img src={value} alt="Response" className="max-w-md rounded-lg border border-slate-200" />
 }

 // Object (Address, Matrix)
 if (value && typeof value === 'object') {
 return (
 <div className="space-y-2 pl-4 border-l-2 border-primary">
 {Object.entries(value as object).map(([k, v]) => (
 <div key={k}>
 <span className="text-sm text-slate-500">{k}: </span>
 <span className="text-slate-800">{String(v)}</span>
 </div>
 ))}
 </div>
 )
 }

 // Simple Text/Number/Date
 return <p className="text-slate-800">{String(value)}</p>
}

export default function ResponsesPage() {
 const params = useParams()
 const formId = params.id as string

 const [form, setForm] = useState<Form | null>(null)
 const [responses, setResponses] = useState<Response[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState("")
 const [viewingResponse, setViewingResponse] = useState<Response | null>(null)

 // Selection. Shift+click (or "Select range": tap the first row, then the
 // last) selects every response in between.
 const [selected, setSelected] = useState<Set<string>>(new Set())
 const [rangeStep, setRangeStep] = useState<'off' | 'first' | 'last'>('off')
 const anchorRef = useRef<string | null>(null)
 const headerBoxRef = useRef<HTMLInputElement>(null)

 // Responses waiting for the delete confirmation
 const [pendingDelete, setPendingDelete] = useState<string[] | null>(null)
 const [deleting, setDeleting] = useState(false)
 const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null)

 // Create question ID to title map
 const questionMap = new Map<string, string>()
 if (form?.questions) {
 form.questions.forEach((q, index) => {
 questionMap.set(q.id, q.title || `Question ${index + 1}`)
 })
 }

 // Get question order from form
 const questionOrder = form?.questions?.map(q => q.id) || []

 useEffect(() => {
 let isMounted = true

 const fetchData = async () => {
 try {
 // Fetch form details first
 const formResponse = await fetch(`/api/forms/${formId}`)
 const formResult = await formResponse.json()

 if (formResult.success && isMounted) {
 // Imported forms keep their questions in sections
 const data = formResult.data
 const sectionQuestions = (data.formSections || []).flatMap(
 (section: { questions?: Question[] }) => (Array.isArray(section.questions) ? section.questions : [])
 )
 setForm(sectionQuestions.length > 0 ? { ...data, questions: sectionQuestions } : data)
 }

 // Fetch responses
 const responsesResponse = await fetch(`/api/responses?formId=${formId}`)
 const responsesResult = await responsesResponse.json()

 if (responsesResult.success && isMounted) {
 // Sort responses by createdAt (newest first) for consistent order
 const sortedResponses = responsesResult.data.sort(
 (a: Response, b: Response) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
 )
 setResponses(sortedResponses)
 }
 } catch (error) {
 console.error('Failed to fetch data:', error)
 } finally {
 if (isMounted) {
 setIsLoading(false)
 }
 }
 }

 if (formId) {
 fetchData()
 }

 return () => {
 isMounted = false
 }
 }, [formId])

 // Deletes in rounds of this many (the server's limit per request)
 const DELETE_BATCH = 500

 const confirmDelete = async () => {
 if (!pendingDelete) return
 const ids = pendingDelete
 const gone = new Set<string>()
 setDeleting(true)
 try {
 for (let i = 0; i < ids.length; i += DELETE_BATCH) {
 const batch = ids.slice(i, i + DELETE_BATCH)
 const res = await fetch('/api/responses/bulk-delete', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ formId, ids: batch }),
 })
 const result = await res.json().catch(() => ({}))
 if (!res.ok || !result.success) throw new Error(result.error || 'Failed to delete')
 batch.forEach((id) => gone.add(id))
 }
 setPendingDelete(null)
 setNotice({ text: ids.length === 1 ? 'Response deleted' : `${ids.length} responses deleted` })
 } catch (err) {
 const reason = err instanceof Error ? err.message : 'Failed to delete'
 // Keep the dialog open with whatever is left, so it can be retried
 setPendingDelete(ids.filter((id) => !gone.has(id)))
 setNotice({ text: gone.size > 0 ? `Deleted ${gone.size}, then: ${reason}` : reason, error: true })
 } finally {
 if (gone.size > 0) {
 setResponses((prev) => prev.filter((r) => !gone.has(r.id)))
 setSelected((prev) => new Set([...prev].filter((id) => !gone.has(id))))
 setViewingResponse((v) => (v && gone.has(v.id) ? null : v))
 }
 setDeleting(false)
 }
 }

 const handleExportCSV = async () => {
 if (responses.length === 0 || !form) {
 alert('No responses to export')
 return
 }

 try {
 // Use the same order as the form questions
 const orderedKeys = questionOrder

 // Create headers using question titles
 const headers = [
 'Submitted At',
 ...orderedKeys.map(key => questionMap.get(key) || key)
 ]

 // Sort responses the same way as displayed (newest first)
 const sortedResponses = [...responses].sort(
 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
 )

 // Convert responses to CSV rows in the same order
 const rows = sortedResponses.map(response => {
 const formatValue = (value: unknown): string => {
 if (value === null || value === undefined) return ''
 const files = asFileList(value)
 if (files) {
 return files.map((f) => `${f.name} (${new URL(f.url, window.location.origin).href})`).join('; ')
 }
 if (Array.isArray(value)) return value.join('; ')
 if (typeof value === 'object') {
 if ('url' in value && 'name' in value) return (value as any).name
 return Object.entries(value)
 .map(([k, v]) => `${k}: ${v}`)
 .join(', ')
 }
 return String(value)
 }

 return [
 new Date(response.createdAt).toLocaleString(),
 ...orderedKeys.map(key => formatValue(response.data[key]))
 ]
 })

 // Create CSV content
 const csvContent = [
 headers.map(h => `"${h}"`).join(','),
 ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
 ].join('\n')

 // Download CSV
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
 const link = document.createElement('a')
 link.href = URL.createObjectURL(blob)
 link.download = `${form.title}-responses-${new Date().toISOString().split('T')[0]}.csv`
 link.click()
 URL.revokeObjectURL(link.href)
 } catch (error) {
 console.error('Export error:', error)
 alert('Failed to export CSV')
 }
 }

 const filteredResponses = responses.filter((response) =>
 Object.values(response.data).some((value) =>
 valueText(value).toLowerCase().includes(searchQuery.toLowerCase())
 )
 )

 // Get preview data from first two questions for table display
 const getResponsePreview = (response: Response) => {
 const entries = questionOrder
 .filter(key => response.data[key] !== undefined)
 .slice(0, 2)
 .map(key => ({
 title: questionMap.get(key) || key,
 value: response.data[key]
 }))

 return entries
 }

 const stats = {
 total: responses.length,
 complete: responses.filter((r) => r.isComplete).length,
 avgTime: responses.length > 0
 ? Math.round(responses.reduce((acc, r) => acc + r.timeSpent, 0) / responses.length / 60)
 : 0,
 }

 // Only rows visible under the current search count as selected, so a
 // search never hides something that is about to be deleted
 const visibleIds = filteredResponses.map((r) => r.id)
 const selectedIds = visibleIds.filter((id) => selected.has(id))
 const allSelected = visibleIds.length > 0 && selectedIds.length === visibleIds.length
 const barOpen = selectedIds.length > 0 || rangeStep !== 'off'

 const setRange = (fromId: string, toId: string, value: boolean) => {
 const a = visibleIds.indexOf(fromId)
 const b = visibleIds.indexOf(toId)
 if (a < 0 || b < 0) return false
 const span = visibleIds.slice(Math.min(a, b), Math.max(a, b) + 1)
 setSelected((prev) => {
 const next = new Set(prev)
 span.forEach((id) => (value ? next.add(id) : next.delete(id)))
 return next
 })
 return true
 }

 const handleRowSelect = (id: string, shift: boolean) => {
 const anchor = anchorRef.current
 if (rangeStep === 'first') {
 anchorRef.current = id
 setSelected((prev) => new Set(prev).add(id))
 setRangeStep('last')
 return
 }
 if (rangeStep === 'last' && anchor) {
 setRange(anchor, id, true)
 anchorRef.current = id
 setRangeStep('off')
 return
 }
 // Shift+click gives the whole span the state the clicked row is moving to
 if (shift && anchor && anchor !== id && setRange(anchor, id, !selected.has(id))) {
 anchorRef.current = id
 return
 }
 setSelected((prev) => {
 const next = new Set(prev)
 if (next.has(id)) next.delete(id)
 else next.add(id)
 return next
 })
 anchorRef.current = id
 }

 const toggleAll = () => {
 setSelected((prev) => {
 const next = new Set(prev)
 visibleIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
 return next
 })
 }

 const clearSelection = useCallback(() => {
 setSelected(new Set())
 setRangeStep('off')
 anchorRef.current = null
 }, [])

 const startRange = () => {
 if (rangeStep !== 'off') return setRangeStep('off')
 setRangeStep('first')
 }

 // Esc closes the detail view, then leaves range mode / clears the selection
 // (the delete dialog handles its own Esc)
 useEffect(() => {
 const onKey = (e: KeyboardEvent) => {
 if (e.key !== 'Escape' || pendingDelete) return
 if (viewingResponse) setViewingResponse(null)
 else clearSelection()
 }
 window.addEventListener('keydown', onKey)
 return () => window.removeEventListener('keydown', onKey)
 }, [pendingDelete, viewingResponse, clearSelection])

 useEffect(() => {
 if (headerBoxRef.current) headerBoxRef.current.indeterminate = selectedIds.length > 0 && !allSelected
 })

 useEffect(() => {
 if (!notice) return
 const timer = setTimeout(() => setNotice(null), notice.error ? 6000 : 3000)
 return () => clearTimeout(timer)
 }, [notice])

 // What the delete dialog says about the responses it is about to remove
 const pendingSet = new Set(pendingDelete ?? [])
 const pendingRows = responses.filter((r) => pendingSet.has(r.id))
 const pendingFiles = pendingRows.reduce(
 (n, r) => n + Object.values(r.data).reduce<number>((m, v) => m + (asFileList(v)?.length ?? 0), 0),
 0
 )
 const pendingSpan = pendingRows.length > 1
 ? (() => {
 const times = pendingRows.map((r) => new Date(r.createdAt).getTime())
 const fmt = (t: number) => new Date(t).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
 return { from: fmt(Math.min(...times)), to: fmt(Math.max(...times)) }
 })()
 : null

 if (isLoading) {
 return (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="w-8 h-8 animate-spin text-violet" />
 </div>
 )
 }

 return (
 <div className={cn("space-y-6", barOpen && "pb-24")}>
 {/* Header */}
 <div className="flex items-center gap-4">
 <Link href={`/forms/${formId}`}>
 <Button variant="ghost" size="icon">
 <ArrowLeft className="w-5 h-5" />
 </Button>
 </Link>
 <div className="flex-1">
 <h1 className="text-2xl font-bold text-slate-900">Responses</h1>
 <p className="text-slate-500">
 {form?.title ? `Responses for "${form.title}"` : 'View and manage form responses'}
 </p>
 </div>
 <Button onClick={handleExportCSV}>
 <Download className="w-4 h-4 mr-2" />
 Export CSV
 </Button>
 </div>

 {/* Stats Cards */}
 <div className="grid gap-4 md:grid-cols-4">
 <Card className="bg-white border-slate-200 shadow-sm">
 <CardContent className="pt-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center">
 <Users className="w-6 h-6 text-violet" />
 </div>
 <div>
 <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
 <p className="text-sm text-slate-500">Total Responses</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-white border-slate-200 shadow-sm">
 <CardContent className="pt-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
 <CheckCircle className="w-6 h-6 text-green-600" />
 </div>
 <div>
 <p className="text-2xl font-bold text-slate-900">{stats.complete}</p>
 <p className="text-sm text-slate-500">Completed</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-white border-slate-200 shadow-sm">
 <CardContent className="pt-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
 <Clock className="w-6 h-6 text-purple-600" />
 </div>
 <div>
 <p className="text-2xl font-bold text-slate-900">{stats.avgTime}m</p>
 <p className="text-sm text-slate-500">Avg. Time</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-white border-slate-200 shadow-sm">
 <CardContent className="pt-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
 <TrendingUp className="w-6 h-6 text-orange-600" />
 </div>
 <div>
 <p className="text-2xl font-bold text-slate-900">
 {stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0}%
 </p>
 <p className="text-sm text-slate-500">Completion Rate</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Filters & Search */}
 <div className="flex flex-wrap items-center gap-3 sm:gap-4">
 <div className="relative flex-1 min-w-[12rem] max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <Input
 placeholder="Search responses..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9 bg-white border-slate-200 text-slate-900 focus:ring-primary/10"
 />
 </div>
 <Button variant="outline" size="sm">
 <Filter className="w-4 h-4 mr-2" />
 Filters
 </Button>
 <Button variant="outline" size="sm">
 <Calendar className="w-4 h-4 mr-2" />
 Date Range
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={startRange}
 disabled={filteredResponses.length === 0}
 aria-pressed={rangeStep !== 'off'}
 className={cn(rangeStep !== 'off' && "border-violet/50 bg-violet/10 text-violet")}
 >
 <ChevronsUpDown className="w-4 h-4 mr-2" />
 Select range
 </Button>
 </div>
 {filteredResponses.length > 1 && (
 <p className="hidden sm:block -mt-3 text-xs text-slate-400">
 Tip: click a row to select it, then <span className="kbd">Shift</span>+click another to select everything in between.
 </p>
 )}

 {/* Responses Table */}
 <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-slate-100 bg-slate-50/50">
 <th className="text-left p-4 w-12">
 <input
 ref={headerBoxRef}
 type="checkbox"
 aria-label={allSelected ? "Deselect all responses" : "Select all responses"}
 className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-violet"
 checked={allSelected}
 disabled={visibleIds.length === 0}
 onChange={toggleAll}
 />
 </th>
 <th className="text-left p-4 font-bold text-xs uppercase tracking-wider text-slate-500">
 Response Preview
 </th>
 <th className="text-left p-4 font-bold text-xs uppercase tracking-wider text-slate-500">
 Submitted
 </th>
 <th className="text-left p-4 font-bold text-xs uppercase tracking-wider text-slate-500 w-24">
 Actions
 </th>
 </tr>
 </thead>
 <tbody>
 {filteredResponses.map((response) => {
 const preview = getResponsePreview(response)
 const isSelected = selected.has(response.id)
 const isAnchor = rangeStep === 'last' && anchorRef.current === response.id
 return (
 <tr
 key={response.id}
 data-response-row
 // The whole row selects; the buttons on the right stop the click
 onClick={(e) => handleRowSelect(response.id, e.shiftKey)}
 // Stop Shift+click from highlighting text
 onMouseDown={(e) => { if (e.shiftKey) e.preventDefault() }}
 className={cn(
 "border-b border-slate-50 last:border-0 cursor-pointer select-none transition-colors",
 isSelected ? "bg-violet/[0.06] hover:bg-violet/10" : "hover:bg-slate-50/50",
 isAnchor && "outline outline-2 -outline-offset-2 outline-violet/60",
 rangeStep !== 'off' && !isSelected && "hover:bg-violet/[0.04]"
 )}
 >
 <td className="p-4">
 <input
 type="checkbox"
 aria-label="Select response"
 className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-violet"
 checked={isSelected}
 // The row's click handler does the toggling (it sees Shift)
 onChange={() => {}}
 />
 </td>
 <td className="p-4">
 <div className="space-y-1">
 {preview.length > 0 ? (
 preview.map((item, i) => (
 <div key={i}>
 <span className="text-xs text-slate-500">{item.title}: </span>
 <span className="text-slate-900 font-medium">
 {valueText(item.value).slice(0, 50)}
 {valueText(item.value).length > 50 && '...'}
 </span>
 </div>
 ))
 ) : (
 <span className="text-slate-400">No data</span>
 )}
 </div>
 </td>
 <td className="p-4 text-slate-600 text-sm">
 {new Date(response.createdAt).toLocaleDateString()} at {new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </td>
 <td className="p-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-1">
 <Button
 variant="ghost"
 size="icon"
 aria-label="View response"
 className="h-8 w-8 text-slate-600 hover:text-violet hover:bg-violet/10"
 onClick={() => setViewingResponse(response)}
 >
 <Eye className="w-4 h-4" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 aria-label="Delete response"
 className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
 onClick={() => setPendingDelete([response.id])}
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>

 {filteredResponses.length === 0 && (
 <div className="p-12 text-center text-slate-500 underline-offset-4">
 <p>No responses found</p>
 </div>
 )}
 </Card>

 {/* Response Detail Modal */}
 {viewingResponse && (
 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingResponse(null)}>
 <Card className="max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col bg-white border-none shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
 <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
 <div>
 <CardTitle className="text-slate-900">Response Details</CardTitle>
 <p className="text-sm text-slate-500 mt-1">
 Submitted {new Date(viewingResponse.createdAt).toLocaleString()}
 </p>
 </div>
 <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setViewingResponse(null)}>
 <X className="w-5 h-5" />
 </Button>
 </CardHeader>
 <CardContent className="flex-1 overflow-y-auto p-8 space-y-8">
 {questionOrder.map((questionId) => {
 const value = viewingResponse.data[questionId]
 if (value === undefined) return null

 return (
 <div key={questionId} className="group">
 <p className="font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
 {questionMap.get(questionId) || questionId}
 </p>
 <div className="pl-4 border-l-2 border-slate-100 group-hover:border-primary/30 transition-colors">
 {renderResponseValue(value)}
 </div>
 </div>
 )
 })}
 </CardContent>
 <div className="p-6 border-t bg-slate-50/50 flex justify-end">
 <Button onClick={() => setViewingResponse(null)} className="px-8">Close Details</Button>
 </div>
 </Card>
 </div>
 )}

 {/* Bulk action bar (sits over the content area, clear of the sidebar) */}
 <AnimatePresence>
 {barOpen && (
 <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 lg:left-64">
 <motion.div
 initial={{ opacity: 0, y: 40, scale: 0.94 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.18 } }}
 transition={{ type: "spring", stiffness: 380, damping: 30 }}
 role="toolbar"
 aria-label="Selected responses"
 className="pointer-events-auto flex w-full max-w-2xl items-center gap-1 sm:gap-2 rounded-full bg-[#0b0b0f] p-1.5 text-white shadow-[0_24px_60px_-20px_rgba(16,16,32,0.7),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
 >
 <button
 onClick={clearSelection}
 aria-label="Clear selection"
 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
 >
 <X className="h-4 w-4" />
 </button>
 <span className="flex-1 min-w-0 truncate text-sm" aria-live="polite">
 {rangeStep === 'first' ? (
 <span className="text-white/80">Tap the <b className="text-white">first</b> response</span>
 ) : rangeStep === 'last' ? (
 <span className="text-white/80">Now tap the <b className="text-white">last</b> one</span>
 ) : (
 <>
 <span className="font-semibold tabular-nums">{selectedIds.length}</span>
 <span className="text-white/60"> selected</span>
 </>
 )}
 </span>
 <button
 onClick={startRange}
 aria-pressed={rangeStep !== 'off'}
 className={cn(
 "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 text-sm font-medium transition-colors",
 rangeStep !== 'off' ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
 )}
 >
 <ChevronsUpDown className="h-4 w-4" />
 <span className="hidden sm:inline">{rangeStep !== 'off' ? "Cancel range" : "Range"}</span>
 </button>
 <button
 onClick={toggleAll}
 className="h-9 shrink-0 rounded-full px-2.5 sm:px-3.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
 >
 {allSelected ? "None" : (
 <>
 <span className="sm:hidden">All</span>
 <span className="hidden sm:inline">Select all ({visibleIds.length})</span>
 </>
 )}
 </button>
 <button
 onClick={() => setPendingDelete(selectedIds)}
 disabled={selectedIds.length === 0}
 className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-destructive px-3.5 sm:px-4 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.96] disabled:opacity-35 disabled:pointer-events-none"
 >
 <Trash2 className="h-4 w-4" />
 Delete
 </button>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <ConfirmDeleteDialog
 open={pendingRows.length > 0}
 title={pendingRows.length === 1 ? "Delete this response?" : `Delete ${pendingRows.length} responses?`}
 description={
 <>
 This can&apos;t be undone.
 {pendingFiles > 0 && (
 <> {pendingFiles === 1 ? "1 uploaded file goes" : `${pendingFiles} uploaded files go`} with {pendingRows.length === 1 ? "it" : "them"}.</>
 )}
 </>
 }
 list={pendingSpan && (
 <div className="relative mt-5 rounded-2xl border border-black/[0.06] bg-[#fbfbfd] px-4 py-3 text-sm">
 <p className="text-xs text-muted-foreground">Submitted between</p>
 <p className="mt-0.5 font-medium text-foreground tabular-nums">
 {pendingSpan.from} <span className="text-muted-foreground">and</span> {pendingSpan.to}
 </p>
 {pendingRows.length === responses.length && (
 <p className="mt-2 text-xs font-medium text-destructive">This is every response to this form.</p>
 )}
 </div>
 )}
 requireWord={pendingRows.length > 1}
 confirmLabel={pendingRows.length === 1 ? "Delete response" : `Delete ${pendingRows.length} responses`}
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
 </div>
 )
}
