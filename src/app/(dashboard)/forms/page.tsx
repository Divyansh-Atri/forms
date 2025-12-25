"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { JsonImportDialog } from "@/components/forms/json-import-dialog"
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
    Loader2,
    FileJson
} from "lucide-react"

interface Form {
    id: string
    title: string
    description: string
    status: string
    responses?: number
    createdAt: string
    updatedAt: string
}

const statusConfig = {
    DRAFT: { label: "Draft", icon: Edit3, color: "secondary" },
    PUBLISHED: { label: "Published", icon: CheckCircle, color: "success" },
    CLOSED: { label: "Closed", icon: Pause, color: "warning" },
    ARCHIVED: { label: "Archived", icon: Archive, color: "secondary" },
}

export default function FormsPage() {
    const [forms, setForms] = useState<Form[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [showImportDialog, setShowImportDialog] = useState(false)

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
            } catch (err) {
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

    const handleDelete = async (formId: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return

        try {
            const response = await fetch(`/api/forms/${formId}`, {
                method: 'DELETE',
            })
            const result = await response.json()
            if (result.success) {
                setForms(forms.filter(f => f.id !== formId))
                alert('Form deleted')
            }
        } catch {
            alert('Failed to delete form')
        }
        setOpenMenu(null)
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <Card className="p-12 text-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forms</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create and manage your forms</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                        <FileJson className="w-4 h-4 mr-2" />
                        Import JSON
                    </Button>
                    <Link href="/forms/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Form
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search forms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    {["ALL", "PUBLISHED", "DRAFT", "CLOSED"].map((status) => (
                        <Button
                            key={status}
                            variant={selectedStatus === (status === "ALL" ? null : status) || (status === "ALL" && !selectedStatus) ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedStatus(status === "ALL" ? null : status)}
                        >
                            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Forms Grid */}
            {filteredForms.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <FileText className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">No forms found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {searchQuery ? "Try adjusting your search" : "Create your first form to get started"}
                    </p>
                    <Link href="/forms/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Form
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredForms.map((form) => {
                        const status = statusConfig[form.status as keyof typeof statusConfig] || statusConfig.DRAFT
                        return (
                            <Card key={form.id} hover className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/forms/${form.id}`}>
                                                <h3 className="font-semibold truncate text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                    {form.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                                {form.description}
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <button
                                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenMenu(openMenu === form.id ? null : form.id)
                                                }}
                                            >
                                                <MoreVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            </button>
                                            {openMenu === form.id && (
                                                <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10">
                                                    <Link
                                                        href={`/forms/${form.id}`}
                                                        className="block px-3 py-2 text-sm text-white hover:bg-slate-700 rounded-t-lg"
                                                        onClick={() => setOpenMenu(null)}
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700"
                                                        onClick={() => handleDuplicate(form)}
                                                    >
                                                        Duplicate
                                                    </button>
                                                    <button
                                                        className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700"
                                                        onClick={() => handleTogglePublish(form)}
                                                    >
                                                        {form.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                                    </button>
                                                    <button
                                                        className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-b-lg"
                                                        onClick={() => handleDelete(form.id, form.title)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge variant={status.color as "default" | "secondary" | "success" | "warning" | "danger" | "outline"}>
                                            <status.icon className="w-3 h-3 mr-1" />
                                            {status.label}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <BarChart3 className="w-4 h-4" />
                                            <span>{(form as any)._count?.responses || 0} responses</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex border-t border-slate-200 dark:border-slate-600 divide-x divide-slate-200 dark:divide-slate-600">
                                    <Link href={`/forms/${form.id}`} className="flex-1">
                                        <button className="w-full py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5">
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    </Link>
                                    <Link href={`/forms/${form.id}/responses`} className="flex-1">
                                        <button className="w-full py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5">
                                            <BarChart3 className="w-4 h-4" />
                                            Responses
                                        </button>
                                    </Link>
                                    <button
                                        className="flex-1 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                            const url = `${window.location.origin}/f/${form.id}`
                                            navigator.clipboard.writeText(url)
                                            alert(`Form URL copied: ${url}`)
                                        }}
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* JSON Import Dialog */}
            {showImportDialog && (
                <JsonImportDialog onClose={() => setShowImportDialog(false)} />
            )}
        </div>
    )
}
