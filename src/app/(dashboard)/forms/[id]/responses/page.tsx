"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft,
    Download,
    Search,
    Eye,
    Trash2,
    MoreVertical,
    CheckCircle,
    Clock,
    Filter,
    Calendar,
    Users,
    TrendingUp,
    BarChart3,
    Loader2,
} from "lucide-react"

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

const renderResponseValue = (key: string, value: unknown) => {
    // File Upload
    const isFile = value && typeof value === 'object' && 'url' in value && 'name' in value
    if (isFile) {
        return (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                    <p className="font-medium">{(value as any).name}</p>
                    <p className="text-sm text-muted-foreground">
                        {((value as any).size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
                <a
                    href={(value as any).url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
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
                    <li key={i} className="text-base">{String(item)}</li>
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
        return <img src={value} alt="Response" className="max-w-md rounded-lg border" />
    }

    // Object (Address, Matrix)
    if (value && typeof value === 'object') {
        return (
            <div className="space-y-2 pl-4 border-l-2">
                {Object.entries(value as object).map(([k, v]) => (
                    <div key={k}>
                        <span className="text-sm text-muted-foreground">{k}: </span>
                        <span className="text-base">{String(v)}</span>
                    </div>
                ))}
            </div>
        )
    }

    // Simple Text/Number/Date
    return <p className="text-base">{String(value)}</p>
}

export default function ResponsesPage() {
    const params = useParams()
    const formId = params.id as string

    const [responses, setResponses] = useState<Response[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedResponses, setSelectedResponses] = useState<string[]>([])
    const [viewingResponse, setViewingResponse] = useState<Response | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchResponses = async () => {
            try {
                const response = await fetch(`/api/responses?formId=${formId}`)
                const result = await response.json()

                if (result.success && isMounted) {
                    setResponses(result.data)
                }
            } catch (error) {
                console.error('Failed to fetch responses:', error)
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        if (formId) {
            fetchResponses()
        }

        return () => {
            isMounted = false
        }
    }, [formId])

    const handleExportCSV = async () => {
        if (responses.length === 0) {
            alert('No responses to export')
            return
        }

        try {
            // Fetch form to get question titles
            const formResponse = await fetch(`/api/forms/${formId}`)
            const formResult = await formResponse.json()

            if (!formResult.success) {
                alert('Failed to fetch form details')
                return
            }

            const form = formResult.data
            const questions = form.questions || []

            // Create question map: id -> title
            const questionMap = new Map<string, string>()
            questions.forEach((q: any, index: number) => {
                questionMap.set(q.id, `Q${index + 1}: ${q.title}`)
            })

            // Get all unique question keys from responses
            const allKeys = new Set<string>()
            responses.forEach(r => Object.keys(r.data).forEach(k => allKeys.add(k)))

            // Map keys to titles
            const headers = [
                'Status',
                'Submitted At',
                ...Array.from(allKeys).map(key => questionMap.get(key) || key)
            ]

            // Convert responses to CSV rows
            const rows = responses.map(response => {
                const formatValue = (value: unknown): string => {
                    if (value === null || value === undefined) return ''
                    if (Array.isArray(value)) return value.join('; ')
                    if (typeof value === 'object') {
                        if ('url' in value && 'name' in value) return (value as any).name
                        // Format address and other objects nicely
                        return Object.entries(value)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')
                    }
                    return String(value)
                }

                return [
                    response.isComplete ? 'Complete' : 'Partial',
                    new Date(response.createdAt).toLocaleString(),
                    ...Array.from(allKeys).map(key => formatValue(response.data[key]))
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                    <h1 className="text-2xl font-bold">Responses</h1>
                    <p className="text-muted-foreground">View and manage form responses</p>
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Responses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.complete}</p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.avgTime}m</p>
                                <p className="text-sm text-muted-foreground">Avg. Time</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {Math.round((stats.complete / stats.total) * 100)}%
                                </p>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search responses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
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
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={selectedResponses.length === filteredResponses.length}
                                        onChange={(e) =>
                                            setSelectedResponses(
                                                e.target.checked ? filteredResponses.map((r) => r.id) : []
                                            )
                                        }
                                    />
                                </th>
                                <th className="text-left p-4 font-medium text-muted-foreground">
                                    Respondent
                                </th>
                                <th className="text-left p-4 font-medium text-muted-foreground">
                                    Status
                                </th>
                                <th className="text-left p-4 font-medium text-muted-foreground">
                                    Device
                                </th>
                                <th className="text-left p-4 font-medium text-muted-foreground">
                                    Time Spent
                                </th>
                                <th className="text-left p-4 font-medium text-muted-foreground">
                                    Submitted
                                </th>
                                <th className="text-left p-4 font-medium text-muted-foreground w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResponses.map((response) => (
                                <tr key={response.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="rounded"
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
                                        <div>
                                            <p className="font-medium">{String(response.data.q1 || "Anonymous")}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {String(response.data.q2 || "No email")}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={response.isComplete ? "success" : "warning"}>
                                            {response.isComplete ? "Complete" : "Partial"}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {response.metadata.device}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {Math.round(response.timeSpent / 60)}m {response.timeSpent % 60}s
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(response.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setViewingResponse(response)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredResponses.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">No responses found</p>
                    </div>
                )}
            </Card>

            {/* Response Detail Modal */}
            {viewingResponse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewingResponse(null)}>
                    <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle>Response Details</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Submitted {new Date(viewingResponse.createdAt).toLocaleString()}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(viewingResponse.data).map(([key, value]) => (
                                <div key={key} className="border-b pb-4 last:border-0">
                                    <p className="font-medium text-sm text-muted-foreground mb-2">{key}</p>
                                    {renderResponseValue(key, value)}
                                </div>
                            ))}
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
