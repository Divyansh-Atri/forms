"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ArrowLeft,
    Users,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Calendar,
} from "lucide-react"

// Mock analytics data
const analyticsData = {
    overview: {
        totalResponses: 147,
        completionRate: 87,
        avgTimeSpent: 4.5,
        responsesTrend: 12, // percentage increase
    },
    responsesByDay: [
        { date: "Mon", count: 18 },
        { date: "Tue", count: 25 },
        { date: "Wed", count: 22 },
        { date: "Thu", count: 30 },
        { date: "Fri", count: 28 },
        { date: "Sat", count: 12 },
        { date: "Sun", count: 12 },
    ],
    questionStats: [
        {
            id: "q1",
            title: "How satisfied are you with our service?",
            type: "starRating",
            avgRating: 4.2,
            responses: 147,
        },
        {
            id: "q2",
            title: "Would you recommend us to a friend?",
            type: "nps",
            npsScore: 45,
            responses: 142,
        },
        {
            id: "q3",
            title: "Which features do you use most?",
            type: "multipleChoice",
            options: [
                { label: "Dashboard", count: 89 },
                { label: "Reports", count: 72 },
                { label: "Integrations", count: 45 },
                { label: "API", count: 28 },
            ],
            responses: 147,
        },
    ],
    deviceBreakdown: [
        { device: "Desktop", count: 98, percentage: 67 },
        { device: "Mobile", count: 38, percentage: 26 },
        { device: "Tablet", count: 11, percentage: 7 },
    ],
}

export default function AnalyticsPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/forms/${params.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">Customer Feedback Survey</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 7 days
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analyticsData.overview.totalResponses}</p>
                                <p className="text-sm text-muted-foreground">Total Responses</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>+{analyticsData.overview.responsesTrend}% from last week</span>
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
                                <p className="text-2xl font-bold">{analyticsData.overview.completionRate}%</p>
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
                                <p className="text-2xl font-bold">{analyticsData.overview.avgTimeSpent}m</p>
                                <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">+45</p>
                                <p className="text-sm text-muted-foreground">NPS Score</p>
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
                            {analyticsData.responsesByDay.map((day, i) => (
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
                        <div className="space-y-4">
                            {analyticsData.deviceBreakdown.map((device, i) => (
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
                    </CardContent>
                </Card>
            </div>

            {/* Question Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Question Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {analyticsData.questionStats.map((question, i) => (
                        <div key={question.id}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium">{question.title}</h4>
                                <span className="text-sm text-muted-foreground">
                                    {question.responses} responses
                                </span>
                            </div>

                            {question.type === "starRating" && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`text-2xl ${star <= Math.round((question as any).avgRating)
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                    }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-2xl font-bold">{(question as any).avgRating}</span>
                                    <span className="text-muted-foreground">/ 5</span>
                                </div>
                            )}

                            {question.type === "nps" && (
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`text-3xl font-bold ${(question as any).npsScore >= 50
                                                ? "text-green-500"
                                                : (question as any).npsScore >= 0
                                                    ? "text-yellow-500"
                                                    : "text-red-500"
                                            }`}
                                    >
                                        {(question as any).npsScore >= 0 ? "+" : ""}
                                        {(question as any).npsScore}
                                    </div>
                                    <span className="text-muted-foreground">NPS Score</span>
                                </div>
                            )}

                            {question.type === "multipleChoice" && (
                                <div className="space-y-3">
                                    {(question as any).options.map((option: any, j: number) => (
                                        <div key={j}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm">{option.label}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {option.count} ({Math.round((option.count / question.responses) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{
                                                        width: `${(option.count / question.responses) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
