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

export default function ResponsesPage() {
    const params = useParams()
    const formId = params.id as string

    const [responses, setResponses] = useState<Response[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedResponses, setSelectedResponses] = useState<string[]>([])

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const response = await fetch(`/api/responses?formId=${formId}`)
                const result = await response.json()

                if (result.success) {
                    setResponses(result.data)
                }
            } catch (error) {
                console.error('Failed to fetch responses:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (formId) {
            fetchResponses()
        }
    }, [formId])

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
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
    )
}
