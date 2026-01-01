"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Copy, Check, Link, Mail, QrCode } from "lucide-react"

interface ShareModalProps {
 isOpen: boolean
 onClose: () => void
 formTitle: string
 formSlug: string
 onSlugChange: (slug: string) => void
}

export function ShareModal({ isOpen, onClose, formTitle, formSlug, onSlugChange }: ShareModalProps) {
 const [copied, setCopied] = useState(false)
 const [editingSlug, setEditingSlug] = useState(false)
 const [tempSlug, setTempSlug] = useState(formSlug)

 useEffect(() => {
 setTempSlug(formSlug)
 }, [formSlug])

 if (!isOpen) return null

 const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
 const fullUrl = `${baseUrl}/f/${formSlug}`

 const handleCopy = () => {
 navigator.clipboard.writeText(fullUrl)
 setCopied(true)
 setTimeout(() => setCopied(false), 2000)
 }

 const handleSaveSlug = () => {
 // Sanitize slug - lowercase, replace spaces with dashes, remove special chars
 const sanitized = tempSlug
 .toLowerCase()
 .replace(/\s+/g, '-')
 .replace(/[^a-z0-9-]/g, '')
 setTempSlug(sanitized)
 onSlugChange(sanitized)
 setEditingSlug(false)
 }

 const handleEmailShare = () => {
 const subject = encodeURIComponent(`Please fill out: ${formTitle}`)
 const body = encodeURIComponent(`Hi,\n\nPlease fill out this form:\n${fullUrl}\n\nThank you!`)
 window.open(`mailto:?subject=${subject}&body=${body}`)
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={onClose}
 />

 {/* Modal */}
 <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
 {/* Header */}
 <div className="flex items-center justify-between p-4 border-b">
 <h2 className="text-lg font-semibold">Share Form</h2>
 <button
 onClick={onClose}
 className="p-1 rounded-lg hover:bg-gray-100 "
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-4 space-y-4">
 {/* Form Title */}
 <div className="text-center pb-2">
 <p className="text-muted-foreground">Sharing</p>
 <p className="font-semibold text-lg">{formTitle}</p>
 </div>

 {/* Custom URL Slug */}
 <div>
 <Label className="mb-2 block">Custom URL</Label>
 <div className="flex items-center gap-2">
 <span className="text-sm text-muted-foreground whitespace-nowrap">
 {baseUrl}/f/
 </span>
 {editingSlug ? (
 <div className="flex-1 flex gap-2">
 <Input
 value={tempSlug}
 onChange={(e) => setTempSlug(e.target.value)}
 className="flex-1"
 placeholder="my-form"
 autoFocus
 />
 <Button size="sm" onClick={handleSaveSlug}>
 Save
 </Button>
 </div>
 ) : (
 <div className="flex-1 flex items-center gap-2">
 <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm">
 {formSlug}
 </code>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setEditingSlug(true)}
 >
 Edit
 </Button>
 </div>
 )}
 </div>
 </div>

 {/* Full URL with Copy */}
 <div>
 <Label className="mb-2 block">Shareable Link</Label>
 <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
 <Link className="w-4 h-4 text-muted-foreground flex-shrink-0" />
 <span className="flex-1 text-sm truncate">{fullUrl}</span>
 <Button
 size="sm"
 variant={copied ? "default" : "outline"}
 onClick={handleCopy}
 className="flex-shrink-0"
 >
 {copied ? (
 <>
 <Check className="w-4 h-4 mr-1" />
 Copied!
 </>
 ) : (
 <>
 <Copy className="w-4 h-4 mr-1" />
 Copy
 </>
 )}
 </Button>
 </div>
 </div>

 {/* Quick Actions */}
 <div className="flex gap-2 pt-2">
 <Button
 variant="outline"
 className="flex-1"
 onClick={handleEmailShare}
 >
 <Mail className="w-4 h-4 mr-2" />
 Email
 </Button>
 <Button
 variant="outline"
 className="flex-1"
 onClick={() => {
 alert("QR Code feature coming soon!")
 }}
 >
 <QrCode className="w-4 h-4 mr-2" />
 QR Code
 </Button>
 </div>
 </div>

 {/* Footer */}
 <div className="p-4 border-t bg-gray-50 rounded-b-xl">
 <p className="text-xs text-muted-foreground text-center">
 Anyone with this link can view and submit responses to your form
 </p>
 </div>
 </div>
 </div>
 )
}
