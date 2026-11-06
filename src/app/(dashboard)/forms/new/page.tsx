"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Eyebrow, trackSpotlight } from "@/components/fx"
import { cn } from "@/lib/utils"
import {
 ArrowLeft,
 ArrowRight,
 Check,
 FileText,
 Type,
 AlignLeft,
 List,
 CheckSquare,
 ChevronDown,
 Star,
 Hash,
 Sliders,
 Grid3X3,
 ArrowUpDown,
 Calendar,
 Clock,
 Upload,
 Image,
 PenTool,
 MapPin,
 MessageSquare,
 Sparkles
} from "lucide-react"

const questionTypes = [
 { type: "shortText", label: "Short Text", icon: Type, category: "Text" },
 { type: "longText", label: "Paragraph", icon: AlignLeft, category: "Text" },
 { type: "singleChoice", label: "Multiple Choice", icon: List, category: "Choice" },
 { type: "multipleChoice", label: "Checkboxes", icon: CheckSquare, category: "Choice" },
 { type: "dropdown", label: "Dropdown", icon: ChevronDown, category: "Choice" },
 { type: "linearScale", label: "Linear Scale", icon: Sliders, category: "Scale" },
 { type: "starRating", label: "Star Rating", icon: Star, category: "Scale" },
 { type: "nps", label: "NPS", icon: Hash, category: "Scale" },
 { type: "matrixSingle", label: "Matrix", icon: Grid3X3, category: "Grid" },
 { type: "ranking", label: "Ranking", icon: ArrowUpDown, category: "Grid" },
 { type: "date", label: "Date", icon: Calendar, category: "Date & Time" },
 { type: "time", label: "Time", icon: Clock, category: "Date & Time" },
 { type: "fileUpload", label: "File Upload", icon: Upload, category: "Media" },
 { type: "imageChoice", label: "Image Choice", icon: Image, category: "Media" },
 { type: "signature", label: "Signature", icon: PenTool, category: "Special" },
 { type: "address", label: "Address", icon: MapPin, category: "Special" },
 { type: "consent", label: "Consent", icon: MessageSquare, category: "Special" },
]

const templates = [
 { id: "blank", title: "Blank Form", description: "Start from scratch", icon: FileText },
 { id: "feedback", title: "Customer Feedback", description: "Gather customer opinions", icon: Star },
 { id: "registration", title: "Event Registration", description: "Register attendees", icon: Calendar },
 { id: "quiz", title: "Quiz", description: "Test knowledge with scoring", icon: Sparkles },
]

// Icon tile gradient per template, in template order
const templateTints = [
 "from-[#0b0b0f] to-[#3b3b48]",
 "from-violet to-pink",
 "from-pink to-orange",
 "from-cyan to-violet",
]

// Chip icon colour per question category
const categoryTint: Record<string, string> = {
 "Text": "bg-violet/10 text-violet",
 "Choice": "bg-pink/10 text-pink",
 "Scale": "bg-orange/10 text-orange",
 "Grid": "bg-cyan/10 text-cyan",
 "Date & Time": "bg-violet/10 text-violet",
 "Media": "bg-pink/10 text-pink",
 "Special": "bg-orange/10 text-orange",
}

const ease = [0.16, 1, 0.3, 1] as const

export default function NewFormPage() {
 const router = useRouter()
 const [step, setStep] = useState<"template" | "details">("template")
 const [selectedTemplate, setSelectedTemplate] = useState<string>("blank")
 const [formData, setFormData] = useState({
 title: "",
 description: "",
 })
 const [isCreating, setIsCreating] = useState(false)

 const handleCreateForm = async () => {
 if (!formData.title.trim()) return

 setIsCreating(true)
 try {
 const response = await fetch('/api/forms', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 title: formData.title,
 description: formData.description,
 slug: formData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
 }),
 })

 const result = await response.json()

 if (result.success) {
 router.push(`/forms/${result.data.id}`)
 } else {
 alert(`Failed to create form: ${result.error}`)
 }
 } catch (error) {
 console.error('Create form error:', error)
 alert('Failed to create form. Please try again.')
 } finally {
 setIsCreating(false)
 }
 }

 const stepIndex = step === "template" ? 0 : 1

 return (
 <div className="max-w-5xl mx-auto">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
 <div className="flex items-start gap-3 sm:gap-4">
 <Link href="/forms" className="mt-1">
 <Button variant="outline" size="icon" aria-label="Back to forms">
 <ArrowLeft className="w-4 h-4" />
 </Button>
 </Link>
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease }}
 >
 <Eyebrow className="mb-3">New form</Eyebrow>
 <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-foreground">
 Create a <span className="font-display italic font-normal tracking-normal gradient-text pr-1">new form</span>
 </h1>
 <p className="mt-2 text-muted-foreground">
 {step === "template" ? "Choose a template or start from scratch" : "Enter form details"}
 </p>
 </motion.div>
 </div>

 {/* Step indicator */}
 <div className="flex items-center gap-3 self-start sm:self-auto pl-12 sm:pl-0" aria-label={`Step ${stepIndex + 1} of 2`}>
 {["Template", "Details"].map((label, i) => (
 <div key={label} className="flex items-center gap-3">
 {i > 0 && (
 <div className="relative w-10 h-px bg-black/10 overflow-hidden">
 <motion.div
 className="absolute inset-0 bg-brand origin-left"
 initial={false}
 animate={{ scaleX: stepIndex >= i ? 1 : 0 }}
 transition={{ duration: 0.6, ease }}
 />
 </div>
 )}
 <div className="flex items-center gap-2">
 <motion.span
 initial={false}
 animate={{ scale: stepIndex === i ? 1.08 : 1 }}
 className={cn(
 "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors duration-300",
 stepIndex > i ? "bg-brand text-white" : stepIndex === i ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground"
 )}
 >
 {stepIndex > i ? <Check className="w-3.5 h-3.5" /> : i + 1}
 </motion.span>
 <span className={cn("text-sm font-medium", stepIndex === i ? "text-foreground" : "text-muted-foreground")}>{label}</span>
 </div>
 </div>
 ))}
 </div>
 </div>

 <AnimatePresence mode="wait" initial={false}>
 {step === "template" ? (
 <motion.div
 key="template"
 initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
 animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, x: -24, filter: "blur(6px)" }}
 transition={{ duration: 0.45, ease }}
 >
 {/* Templates */}
 <div className="mb-10">
 <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">Templates</h2>
 <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
 {templates.map((template, i) => {
 const selected = selectedTemplate === template.id
 return (
 <motion.button
 type="button"
 key={template.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.05 + i * 0.07, ease }}
 whileTap={{ scale: 0.98 }}
 onPointerMove={trackSpotlight}
 onClick={() => setSelectedTemplate(template.id)}
 aria-pressed={selected}
 className={cn(
 "spotlight group relative text-left rounded-2xl bg-white/90 backdrop-blur p-4 sm:p-6 transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
 selected
 ? "border-glow shadow-[0_24px_48px_-24px_rgba(124,58,237,0.45)]"
 : "border border-black/[0.06] hover:-translate-y-1 hover:border-violet/20 hover:shadow-[0_24px_48px_-28px_rgba(124,58,237,0.3)]"
 )}
 >
 <AnimatePresence>
 {selected && (
 <motion.span
 initial={{ scale: 0, rotate: -45 }}
 animate={{ scale: 1, rotate: 0 }}
 exit={{ scale: 0 }}
 transition={{ type: "spring", stiffness: 500, damping: 22 }}
 className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white shadow-md"
 >
 <Check className="w-3.5 h-3.5" strokeWidth={3} />
 </motion.span>
 )}
 </AnimatePresence>
 <div className={cn(
 "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 sm:mb-5 shadow-[0_10px_24px_-10px_rgba(124,58,237,0.6)]",
 "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110",
 templateTints[i]
 )}>
 <template.icon className="w-5 h-5 sm:w-6 sm:h-6" />
 </div>
 <h3 className="font-semibold text-foreground text-[0.95rem] sm:text-base leading-snug">{template.title}</h3>
 <p className="text-xs sm:text-sm text-muted-foreground mt-1">{template.description}</p>
 </motion.button>
 )
 })}
 </div>
 </div>

 {/* Question Types Preview */}
 <div className="mb-10">
 <div className="flex items-baseline justify-between gap-4 mb-4">
 <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Available Question Types</h2>
 <span className="text-xs text-muted-foreground/80 tabular-nums">{questionTypes.length} types</span>
 </div>
 <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
 {questionTypes.map((qt, i) => (
 <motion.div
 key={qt.type}
 initial={{ opacity: 0, y: 12, scale: 0.97 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ duration: 0.5, delay: 0.25 + i * 0.025, ease }}
 className="group flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 pr-3 rounded-xl min-w-0 border border-black/[0.06] bg-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:bg-white hover:shadow-[0_12px_24px_-16px_rgba(16,16,32,0.25)]"
 >
 <div className={cn(
 "w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
 categoryTint[qt.category] || "bg-violet/10 text-violet"
 )}>
 <qt.icon className="w-4 h-4" />
 </div>
 <span className="text-sm font-medium text-foreground/85 truncate">{qt.label}</span>
 <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 hidden sm:inline">{qt.category}</span>
 </motion.div>
 ))}
 </div>
 </div>

 <div className="flex justify-end">
 <Button size="lg" onClick={() => setStep("details")} className="group">
 Continue
 <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
 </Button>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="details"
 initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
 animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
 transition={{ duration: 0.45, ease }}
 className="grid gap-6 lg:grid-cols-[1fr_340px]"
 >
 <div className="rounded-3xl border border-black/[0.06] bg-white/90 backdrop-blur p-6 sm:p-8 shadow-[0_24px_64px_-32px_rgba(40,20,80,0.25)]">
 <h2 className="text-xl font-semibold text-foreground">Form Details</h2>
 <p className="text-sm text-muted-foreground mt-1 mb-6">
 Give your form a title and description
 </p>
 <div className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">Form Title</label>
 <Input
 placeholder="e.g., Customer Feedback Survey"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="h-12 text-base"
 autoFocus
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">Description (optional)</label>
 <Textarea
 placeholder="Describe what this form is about..."
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 rows={4}
 />
 </div>
 <div className="flex justify-between pt-2">
 <Button variant="outline" onClick={() => setStep("template")} disabled={isCreating}>
 <ArrowLeft className="w-4 h-4" />
 Back
 </Button>
 <Button onClick={handleCreateForm} disabled={!formData.title.trim() || isCreating} loading={isCreating}>
 {isCreating ? 'Creating...' : 'Create Form'}
 </Button>
 </div>
 </div>
 </div>

 {/* Live preview of the respondent welcome screen */}
 <div className="relative">
 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">Live preview</p>
 <div className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-6 min-h-[260px] shadow-[0_24px_64px_-32px_rgba(124,58,237,0.35)]">
 <div className="absolute -top-16 -left-10 w-48 h-48 rounded-full bg-violet opacity-20 blur-3xl" />
 <div className="absolute -bottom-20 -right-10 w-52 h-52 rounded-full bg-pink opacity-20 blur-3xl" />
 <div className="absolute inset-0 [background-image:radial-gradient(rgba(20,20,40,0.08)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_50%_30%,#000_20%,transparent_75%)]" />
 <div className="relative">
 <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-[0_8px_20px_-8px_rgba(124,58,237,0.6)]">
 <FileText className="w-5 h-5 text-white" />
 </div>
 <motion.h3
 key={formData.title ? "has-title" : "empty"}
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 className={cn(
 "text-2xl font-semibold tracking-[-0.03em] leading-tight break-words",
 formData.title ? "text-foreground" : "text-muted-foreground/50"
 )}
 >
 {formData.title || "Your form title"}
 </motion.h3>
 <p className={cn(
 "mt-2 text-sm leading-relaxed break-words line-clamp-4",
 formData.description ? "text-muted-foreground" : "text-muted-foreground/40"
 )}>
 {formData.description || "A short description appears here."}
 </p>
 <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 h-9 text-sm font-medium text-white">
 Start <ArrowRight className="w-3.5 h-3.5" />
 </span>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
