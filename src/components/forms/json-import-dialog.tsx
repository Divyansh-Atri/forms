"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileJson, CheckCircle, AlertCircle, Loader2, X, FileSpreadsheet } from "lucide-react"
import { useRouter } from "next/navigation"

type ImportFormat = 'json' | 'csv'

interface ImportResult {
    success: boolean
    data?: {
        id: string
        title: string
        slug: string
        sectionsCount?: number
        fieldsCount?: number
        responsesCreated?: number
    }
    error?: string
    details?: string[] | string
}

type FormLayoutType = 'stepper' | 'table'

export function JsonImportDialog({ onClose }: { onClose: () => void }) {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importFormat, setImportFormat] = useState<ImportFormat>('json')
    const [csvTitle, setCsvTitle] = useState('')
    const [layoutType, setLayoutType] = useState<FormLayoutType>('stepper')

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const isJson = file.type === "application/json" || file.name.endsWith('.json')
        const isCsv = file.type === "text/csv" || file.name.endsWith('.csv')

        if (isJson) {
            setImportFormat('json')
            setSelectedFile(file)
            setResult(null)
        } else if (isCsv) {
            setImportFormat('csv')
            setSelectedFile(file)
            setResult(null)
        } else {
            alert("Please select a valid JSON or CSV file")
        }
    }

    const handleImport = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setResult(null)

        try {
            let response: Response

            if (importFormat === 'json') {
                // JSON import
                const fileContent = await selectedFile.text()
                const jsonData = JSON.parse(fileContent)

                // Add layout type to the data
                jsonData.layoutType = layoutType

                response = await fetch('/api/forms/import-json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonData)
                })
            } else {
                // CSV import
                const formData = new FormData()
                formData.append('file', selectedFile)
                formData.append('title', csvTitle || selectedFile.name.replace('.csv', ''))
                formData.append('layoutType', layoutType)

                response = await fetch('/api/forms/import-csv', {
                    method: 'POST',
                    body: formData
                })
            }

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
                error: `Failed to parse or import ${importFormat.toUpperCase()} file`,
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
                            <CardTitle className="text-slate-900 dark:text-white">Import Form</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                                Upload a JSON or CSV file to create a form
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
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-slate-50 dark:bg-slate-900"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {selectedFile ? (
                                        <>
                                            {importFormat === 'json' ? (
                                                <FileJson className="w-10 h-10 mb-2 text-blue-600 dark:text-blue-400" />
                                            ) : (
                                                <FileSpreadsheet className="w-10 h-10 mb-2 text-green-600 dark:text-green-400" />
                                            )}
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {(selectedFile.size / 1024).toFixed(2)} KB • {importFormat.toUpperCase()}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 mb-2 text-slate-400" />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                JSON or CSV files
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="application/json,.json,text/csv,.csv"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                            </label>

                            {/* CSV Title Input */}
                            {importFormat === 'csv' && selectedFile && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                                        Form Title
                                    </label>
                                    <input
                                        type="text"
                                        value={csvTitle}
                                        onChange={(e) => setCsvTitle(e.target.value)}
                                        placeholder={selectedFile.name.replace('.csv', '')}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            )}

                            {/* Layout Type Selector */}
                            {selectedFile && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Form Display Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setLayoutType('stepper')}
                                            className={`p-4 border-2 rounded-lg text-left transition-all ${layoutType === 'stepper'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                                }`}
                                        >
                                            <div className="font-medium text-slate-900 dark:text-white">📋 Stepper</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                One question at a time, wizard-style
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLayoutType('table')}
                                            className={`p-4 border-2 rounded-lg text-left transition-all ${layoutType === 'table'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                                }`}
                                        >
                                            <div className="font-medium text-slate-900 dark:text-white">📊 Table</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Spreadsheet-style, all fields visible
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

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
                                            "{result.data?.title}"
                                            {result.data?.sectionsCount && ` with ${result.data.sectionsCount} sections`}
                                            {result.data?.fieldsCount && ` with ${result.data.fieldsCount} fields`}
                                            {result.data?.responsesCreated ? ` (${result.data.responsesCreated} responses imported)` : ''}
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
