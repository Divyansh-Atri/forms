"use client"

import { Button } from "@/components/ui/button"
import { QuestionType } from "@/types"
import {
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
 PenTool,
 MapPin,
 MessageSquare,
 Image,
 Mail,
 Link,
 Phone,
 CircleDot,
} from "lucide-react"

interface QuestionPaletteProps {
 onAddQuestion: (type: QuestionType) => void
}

const questionCategories = [
 {
 name: "Text",
 questions: [
 { type: QuestionType.SHORT_TEXT, label: "Short Text", icon: Type },
 { type: QuestionType.LONG_TEXT, label: "Paragraph", icon: AlignLeft },
 { type: QuestionType.EMAIL, label: "Email", icon: Mail },
 { type: QuestionType.URL, label: "URL", icon: Link },
 { type: QuestionType.PHONE, label: "Phone", icon: Phone },
 { type: QuestionType.NUMBER, label: "Number", icon: Hash },
 ],
 },
 {
 name: "Choice",
 questions: [
 { type: QuestionType.SINGLE_CHOICE, label: "Multiple Choice", icon: CircleDot },
 { type: QuestionType.MULTIPLE_CHOICE, label: "Checkboxes", icon: CheckSquare },
 { type: QuestionType.DROPDOWN, label: "Dropdown", icon: ChevronDown },
 { type: QuestionType.IMAGE_CHOICE, label: "Image Choice", icon: Image },
 ],
 },
 {
 name: "Scale",
 questions: [
 { type: QuestionType.LINEAR_SCALE, label: "Linear Scale", icon: Sliders },
 { type: QuestionType.STAR_RATING, label: "Star Rating", icon: Star },
 { type: QuestionType.NPS, label: "NPS", icon: Hash },
 { type: QuestionType.SLIDER, label: "Slider", icon: Sliders },
 ],
 },
 {
 name: "Grid",
 questions: [
 { type: QuestionType.MATRIX_SINGLE, label: "Matrix (Single)", icon: Grid3X3 },
 { type: QuestionType.MATRIX_MULTIPLE, label: "Matrix (Multi)", icon: Grid3X3 },
 { type: QuestionType.RANKING, label: "Ranking", icon: ArrowUpDown },
 ],
 },
 {
 name: "Date & Time",
 questions: [
 { type: QuestionType.DATE, label: "Date", icon: Calendar },
 { type: QuestionType.TIME, label: "Time", icon: Clock },
 { type: QuestionType.DATETIME, label: "Date & Time", icon: Calendar },
 ],
 },
 {
 name: "Special",
 questions: [
 { type: QuestionType.FILE_UPLOAD, label: "File Upload", icon: Upload },
 { type: QuestionType.SIGNATURE, label: "Signature", icon: PenTool },
 { type: QuestionType.ADDRESS, label: "Address", icon: MapPin },
 { type: QuestionType.CONSENT, label: "Consent", icon: MessageSquare },
 ],
 },
]

export function QuestionPalette({ onAddQuestion }: QuestionPaletteProps) {
 return (
 <div className="hidden md:block w-64 bg-white border-r border-slate-200 overflow-y-auto p-4 shrink-0">
 <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">
 Question Types
 </h3>

 <div className="space-y-6">
 {questionCategories.map((category) => (
 <div key={category.name}>
 <h4 className="text-xs font-medium text-slate-400 mb-2">
 {category.name}
 </h4>
 <div className="space-y-1">
 {category.questions.map((question) => (
 <button
 key={question.type}
 onClick={() => onAddQuestion(question.type)}
 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors text-left text-slate-700 "
 >
 <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
 <question.icon className="w-4 h-4 text-blue-600 "/>
 </div>
 <span className="font-medium">{question.label}</span>
 </button>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 )
}
