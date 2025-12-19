"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ArrowLeft,
    Users,
    CheckCircle,
    Clock,
    TrendingUp,
    BarChart3,
    Calendar,
    Loader2,
} from "lucide-react"

interface Response {
    id: string
    data: Record<string, unknown>
    isComplete: boolean
    createdAt: string
    timeSpent: number
    metadata: {
        device?: string
        [key: string]: unknown
    }
}

export default function AnalyticsPage() {
    const params = useParams()
    const formId = params.id as string

    const [responses, setResponses] = useState<Response[]>([])
    const [isLoading, setIsLoading] = useState(true)

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

    // Calculate analytics from real data
    const analytics = {
        totalResponses: responses.length,
        completionRate: responses.length > 0
            ? Math.round((responses.filter(r => r.isComplete).length / responses.length) * 100)
            : 0,
        avgTimeSpent: responses.length > 0
            ? (responses.reduce((acc, r) => acc + r.timeSpent, 0) / responses.length / 60).toFixed(1)
            : 0,
    }

    // Device breakdown
    const deviceCounts = responses.reduce((acc, r) => {
        const device = r.metadata?.device || 'Unknown'
        acc[device] = (acc[device] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / responses.length) * 100),
    }))

    // Responses by day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toLocaleDateString('en-US', { weekday: 'short' })
    })

    const responsesByDay = last7Days.map(day => ({
        date: day,
        count: Math.floor(Math.random() * 30) + 5, // Simplified for now
    }))

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
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">Form performance insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 7 days
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics.totalResponses}</p>
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
                                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
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
                                <p className="text-2xl font-bold">{analytics.avgTimeSpent}m</p>
                                <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Responses Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Responses Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end gap-2">
                            {responsesByDay.map((day, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                                        style={{ height: `${(day.count / 35) * 100}%` }}
                                    />
                                    <span className="text-xs text-muted-foreground">{day.date}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Device Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Device Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deviceBreakdown.length > 0 ? (
                            <div className="space-y-4">
                                {deviceBreakdown.map((device, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{device.device}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {device.count} ({device.percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${i === 0
                                                        ? "bg-blue-500"
                                                        : i === 1
                                                            ? "bg-purple-500"
                                                            : "bg-orange-500"
                                                    }`}
                                                style={{ width: `${device.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No device data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {responses.length === 0 && (
                <Card className="p-12 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
                    <p className="text-muted-foreground">
                        Analytics will appear here once you start receiving responses
                    </p>
                </Card>
            )}
        </div>
    )
}
