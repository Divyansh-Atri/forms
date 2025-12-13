"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Globe, Lock, Users, Calendar, Bell, Trash2, Check } from "lucide-react"

interface FormSettings {
    title: string
    customUrl: string
    isPublic: boolean
    singleResponse: boolean
    collectEmail: boolean
    editAfterSubmit: boolean
    password: string
    acceptingResponses: boolean
    responseLimit: string
    closeDate: string
    showProgress: boolean
    shuffleQuestions: boolean
    saveContinue: boolean
    quizMode: boolean
    showAnswers: string
    passingScore: string
    emailNotify: boolean
    notificationEmail: string
}

// Custom checkbox component - defined outside component to avoid recreation on render
function SettingsCheckbox({
    id,
    checked,
    onChange,
    label
}: {
    id: string
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
}) {
    return (
        <div className="flex items-center gap-3">
            <button
                id={id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${checked
                    ? "bg-primary border-primary"
                    : "border-gray-300 dark:border-gray-600 hover:border-primary"
                    }`}
            >
                {checked && <Check className="w-3 h-3 text-white" />}
            </button>
            <Label htmlFor={id} className="cursor-pointer" onClick={() => onChange(!checked)}>
                {label}
            </Label>
        </div>
    )
}

export default function FormSettingsPage({ params }: { params: { id: string } }) {
    const [settings, setSettings] = useState<FormSettings>({
        title: "Customer Feedback Survey",
        customUrl: "customer-feedback",
        isPublic: true,
        singleResponse: false,
        collectEmail: false,
        editAfterSubmit: false,
        password: "",
        acceptingResponses: true,
        responseLimit: "",
        closeDate: "",
        showProgress: true,
        shuffleQuestions: false,
        saveContinue: false,
        quizMode: false,
        showAnswers: "immediately",
        passingScore: "70",
        emailNotify: false,
        notificationEmail: "",
    })
    const [isSaving, setIsSaving] = useState(false)
    const [showSaved, setShowSaved] = useState(false)

    const updateSetting = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsSaving(false)
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
    }

    const handleDeleteResponses = async () => {
        if (confirm("Are you sure you want to delete all responses? This action cannot be undone.")) {
            // TODO: Implement delete responses
            alert("All responses have been deleted.")
        }
    }

    const handleDeleteForm = async () => {
        if (confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
            // TODO: Implement delete form
            window.location.href = "/forms"
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/forms/${params.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Form Settings</h1>
                    <p className="text-muted-foreground">Configure your form settings</p>
                </div>
                <Button onClick={handleSave} loading={isSaving}>
                    {showSaved ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        General
                    </CardTitle>
                    <CardDescription>Basic form settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Form Title</Label>
                        <Input
                            className="mt-1.5"
                            value={settings.title}
                            onChange={(e) => updateSetting("title", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Custom URL</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm text-muted-foreground">forms.app/f/</span>
                            <Input
                                value={settings.customUrl}
                                onChange={(e) => updateSetting("customUrl", e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Access Control */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Access Control
                    </CardTitle>
                    <CardDescription>Control who can access your form</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsCheckbox
                        id="public"
                        checked={settings.isPublic}
                        onChange={(checked) => updateSetting("isPublic", checked)}
                        label="Public - Anyone with the link can respond"
                    />
                    <SettingsCheckbox
                        id="single"
                        checked={settings.singleResponse}
                        onChange={(checked) => updateSetting("singleResponse", checked)}
                        label="Limit to one response per person"
                    />
                    <SettingsCheckbox
                        id="collect-email"
                        checked={settings.collectEmail}
                        onChange={(checked) => updateSetting("collectEmail", checked)}
                        label="Collect email addresses"
                    />
                    <SettingsCheckbox
                        id="edit-response"
                        checked={settings.editAfterSubmit}
                        onChange={(checked) => updateSetting("editAfterSubmit", checked)}
                        label="Allow respondents to edit after submission"
                    />
                    <div>
                        <Label>Password Protection (optional)</Label>
                        <Input
                            type="password"
                            className="mt-1.5"
                            placeholder="Leave empty for no password"
                            value={settings.password}
                            onChange={(e) => updateSetting("password", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Response Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Response Settings
                    </CardTitle>
                    <CardDescription>Configure response collection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsCheckbox
                        id="accepting"
                        checked={settings.acceptingResponses}
                        onChange={(checked) => updateSetting("acceptingResponses", checked)}
                        label="Accept responses"
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Response Limit (optional)</Label>
                            <Input
                                type="number"
                                className="mt-1.5"
                                placeholder="Unlimited"
                                value={settings.responseLimit}
                                onChange={(e) => updateSetting("responseLimit", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Close Date (optional)</Label>
                            <Input
                                type="date"
                                className="mt-1.5"
                                value={settings.closeDate}
                                onChange={(e) => updateSetting("closeDate", e.target.value)}
                            />
                        </div>
                    </div>
                    <SettingsCheckbox
                        id="progress"
                        checked={settings.showProgress}
                        onChange={(checked) => updateSetting("showProgress", checked)}
                        label="Show progress bar"
                    />
                    <SettingsCheckbox
                        id="shuffle"
                        checked={settings.shuffleQuestions}
                        onChange={(checked) => updateSetting("shuffleQuestions", checked)}
                        label="Shuffle question order"
                    />
                    <SettingsCheckbox
                        id="save-continue"
                        checked={settings.saveContinue}
                        onChange={(checked) => updateSetting("saveContinue", checked)}
                        label="Allow save and continue later"
                    />
                </CardContent>
            </Card>

            {/* Quiz Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Quiz Mode
                    </CardTitle>
                    <CardDescription>Enable scoring and feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsCheckbox
                        id="quiz-mode"
                        checked={settings.quizMode}
                        onChange={(checked) => updateSetting("quizMode", checked)}
                        label="Enable quiz mode"
                    />
                    <div>
                        <Label>Show correct answers</Label>
                        <select
                            className="w-full mt-1.5 h-10 px-3 rounded-lg border bg-background"
                            value={settings.showAnswers}
                            onChange={(e) => updateSetting("showAnswers", e.target.value)}
                        >
                            <option value="immediately">Immediately after submission</option>
                            <option value="review">After manual review</option>
                            <option value="never">Never</option>
                        </select>
                    </div>
                    <div>
                        <Label>Passing Score (%)</Label>
                        <Input
                            type="number"
                            className="mt-1.5"
                            placeholder="70"
                            value={settings.passingScore}
                            onChange={(e) => updateSetting("passingScore", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Get notified about new responses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsCheckbox
                        id="email-notify"
                        checked={settings.emailNotify}
                        onChange={(checked) => updateSetting("emailNotify", checked)}
                        label="Email me for each new response"
                    />
                    <div>
                        <Label>Notification Email</Label>
                        <Input
                            type="email"
                            className="mt-1.5"
                            placeholder="your@email.com"
                            value={settings.notificationEmail}
                            onChange={(e) => updateSetting("notificationEmail", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleDeleteResponses}
                    >
                        Delete All Responses
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteForm}>
                        Delete Form
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
