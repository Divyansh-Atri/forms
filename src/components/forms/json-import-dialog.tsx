"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileJson, CheckCircle, AlertCircle, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface ImportResult {
    success: boolean
    data?: {
        id: string
        title: string
        slug: string
        sectionsCount: number
    }
    error?: string
    details?: string[] | string
}

export function JsonImportDialog({ onClose }: { onClose: () => void }) {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.type === "application/json") {
            setSelectedFile(file)
            setResult(null)
        } else {
            alert("Please select a valid JSON file")
        }
    }

    const handleImport = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setResult(null)

        try {
            // Read file content
            const fileContent = await selectedFile.text()
            const jsonData = JSON.parse(fileContent)

            // Send to API
            const response = await fetch('/api/forms/import-json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            })

            const data: ImportResult = await response.json()
            setResult(data)

            // If successful, redirect to form editor after a short delay
            if (data.success && data.data) {
                setTimeout(() => {
                    router.push(`/forms/${data.data!.id}`)
                }, 2000)
            }
        } catch (error) {
            setResult({
                success: false,
                error: 'Failed to parse or import JSON file',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <Card
                className="max-w-lg w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-slate-900 dark:text-white">Import Form from JSON</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                                Upload a JSON file with sectioned form structure
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* File Upload Area */}
                    {!result && (
                        <>
                            <label
                                htmlFor="json-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-900"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {selectedFile ? (
                                        <>
                                            <FileJson className="w-10 h-10 mb-2 text-blue-600 dark:text-blue-400" />
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {(selectedFile.size / 1024).toFixed(2)} KB
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 mb-2 text-slate-400" />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                JSON files only
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="json-upload"
                                    type="file"
                                    accept="application/json,.json"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                            </label>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={onClose} disabled={isUploading}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={!selectedFile || isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Importing...
                                        </>
                                    ) : (
                                        'Import Form'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Result Display */}
                    {result && (
                        <div className="space-y-4">
                            {result.success ? (
                                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                                            Import Successful!
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                            "{result.data?.title}" with {result.data?.sectionsCount} sections
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                            Redirecting to form editor...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-red-900 dark:text-red-100">
                                                Import Failed
                                            </h4>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                {result.error}
                                            </p>
                                            {Array.isArray(result.details) && result.details.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {result.details.slice(0, 5).map((detail, idx) => (
                                                        <li key={idx} className="text-xs text-red-600 dark:text-red-400">
                                                            • {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setResult(null)}>
                                            Try Again
                                        </Button>
                                        <Button onClick={onClose}>Close</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
