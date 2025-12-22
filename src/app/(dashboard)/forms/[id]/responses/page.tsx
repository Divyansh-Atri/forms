"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

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

const renderResponseValue = (value: unknown) => {
    // File Upload
    const isFile = value && typeof value === 'object' && 'url' in value && 'name' in value
    if (isFile) {
        return (
            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{(value as any).name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {((value as any).size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
                <a
                    href={(value as any).url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    Download
                </a>
            </div>
        )
    }

    // Array (Multiple Choice, Ranking)
    if (Array.isArray(value)) {
        return (
            <ul className="list-disc list-inside space-y-1">
                {value.map((item: any, i: number) => (
                    <li key={i} className="text-slate-800 dark:text-slate-100">{String(item)}</li>
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
        return <img src={value} alt="Response" className="max-w-md rounded-lg border border-slate-200 dark:border-slate-600" />
    }

    // Object (Address, Matrix)
    if (value && typeof value === 'object') {
        return (
            <div className="space-y-2 pl-4 border-l-2 border-blue-500">
                {Object.entries(value as object).map(([k, v]) => (
                    <div key={k}>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{k}: </span>
                        <span className="text-slate-800 dark:text-slate-100">{String(v)}</span>
                    </div>
                ))}
            </div>
        )
    }

    // Simple Text/Number/Date
    return <p className="text-slate-800 dark:text-slate-100">{String(value)}</p>
}

export default function ResponsesPage() {
    const params = useParams()
    const formId = params.id as string

    const [form, setForm] = useState<Form | null>(null)
    const [responses, setResponses] = useState<Response[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedResponses, setSelectedResponses] = useState<string[]>([])
    const [viewingResponse, setViewingResponse] = useState<Response | null>(null)

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
                    setForm(formResult.data)
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

    const handleDeleteResponse = async (responseId: string) => {
        if (!confirm("Are you sure you want to delete this response?")) return

        try {
            const response = await fetch(`/api/responses/${responseId}`, {
                method: 'DELETE',
            })
            const result = await response.json()

            if (result.success) {
                setResponses(responses.filter(r => r.id !== responseId))
            } else {
                alert(`Failed to delete response: ${result.error}`)
            }
        } catch (error) {
            console.error('Delete response error:', error)
            alert("Failed to delete response")
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
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/forms/${formId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Responses</h1>
                    <p className="text-slate-500 dark:text-slate-400">
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
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Responses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.complete}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgTime}m</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Time</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0}%
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search responses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
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
            </div>

            {/* Responses Table */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-600"
                                        checked={selectedResponses.length === filteredResponses.length && filteredResponses.length > 0}
                                        onChange={(e) =>
                                            setSelectedResponses(
                                                e.target.checked ? filteredResponses.map((r) => r.id) : []
                                            )
                                        }
                                    />
                                </th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-200">
                                    Response Preview
                                </th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-200">
                                    Submitted
                                </th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-200 w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResponses.map((response) => {
                                const preview = getResponsePreview(response)
                                return (
                                    <tr key={response.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 dark:border-slate-600"
                                                checked={selectedResponses.includes(response.id)}
                                                onChange={(e) =>
                                                    setSelectedResponses(
                                                        e.target.checked
                                                            ? [...selectedResponses, response.id]
                                                            : selectedResponses.filter((id) => id !== response.id)
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                {preview.length > 0 ? (
                                                    preview.map((item, i) => (
                                                        <div key={i}>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">{item.title}: </span>
                                                            <span className="text-slate-900 dark:text-white font-medium">
                                                                {Array.isArray(item.value)
                                                                    ? item.value.join(', ')
                                                                    : String(item.value).slice(0, 50)}
                                                                {String(item.value).length > 50 && '...'}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500">No data</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {new Date(response.createdAt).toLocaleDateString()} at {new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                                                    onClick={() => setViewingResponse(response)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDeleteResponse(response.id)}
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
                    <div className="p-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400">No responses found</p>
                    </div>
                )}
            </Card>

            {/* Response Detail Modal */}
            {viewingResponse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingResponse(null)}>
                    <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-900 dark:text-white">Response Details</CardTitle>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Submitted {new Date(viewingResponse.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setViewingResponse(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {questionOrder.map((questionId) => {
                                const value = viewingResponse.data[questionId]
                                if (value === undefined) return null

                                return (
                                    <div key={questionId} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0">
                                        <p className="font-semibold text-slate-900 dark:text-white mb-2">
                                            {questionMap.get(questionId) || questionId}
                                        </p>
                                        {renderResponseValue(value)}
                                    </div>
                                )
                            })}
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setViewingResponse(null)}>Close</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
