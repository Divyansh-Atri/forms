"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, ArrowRight, FileText } from "lucide-react"

interface TableFormProps {
 sections: Array<{
 id: string
 title: string
 description?: string
 order: number
 questions: any[]
 }>
 formTitle: string
 formDescription?: string
 responseData: Record<string, any>
 onDataChange: (data: Record<string, any>) => void
 onSubmit: () => void
 isSubmitting: boolean
}

export function TableForm({
 sections,
 formTitle,
 formDescription,
 responseData,
 onDataChange,
 onSubmit,
 isSubmitting
}: TableFormProps) {
 const [isComplete, setIsComplete] = useState(false)

 const handleInputChange = (fieldId: string, value: any) => {
 onDataChange({
 ...responseData,
 [fieldId]: value
 })
 }

 const handleSubmit = async () => {
 await onSubmit()
 setIsComplete(true)
 }

 if (isComplete) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background p-6">
 <Card className="max-w-2xl mx-auto my-8 p-12 text-center animate-scale-in border-none shadow-premium-lg bg-white/70 backdrop-blur-xl">
 <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-emerald-50 flex items-center justify-center">
 <CheckCircle className="w-12 h-12 text-emerald-500" />
 </div>
 <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-foreground text-center">Form Complete!</h1>
 <p className="text-xl text-muted-foreground mb-10 font-medium">Your response has been successfully recorded.</p>
 <Button
 className="h-14 px-8 font-semibold rounded-xl"
 variant="outline"
 onClick={() => {
 setIsComplete(false)
 onDataChange({})
 }}
 >
 Submit Another Response
 </Button>
 </Card>
 </div>
 )
 }

 return (
 <div className="max-w-6xl mx-auto p-6 sm:p-12 space-y-10 selection:bg-primary/10">
 {/* Form Header */}
 <Card className="border-none shadow-premium bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] relative overflow-hidden group">
 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600" />
 <CardHeader className="p-0">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
 <FileText className="w-6 h-6 text-primary" />
 </div>
 <CardTitle className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">{formTitle}</CardTitle>
 </div>
 {formDescription && (
 <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">{formDescription}</p>
 )}
 </CardHeader>
 </Card>

 {/* Sections as Tables */}
 {sections.map((section, sectionIdx) => (
 <Card key={section.id} className="border-none shadow-premium-lg bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden animate-slide-up" style={{ animationDelay: `${sectionIdx * 150}ms` }}>
 <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100">
 <div className="flex items-center gap-3 mb-2">
 <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Section {sectionIdx + 1}</span>
 </div>
 <CardTitle className="text-2xl font-bold text-foreground tracking-tight">{section.title}</CardTitle>
 {section.description && (
 <p className="text-lg text-muted-foreground font-medium mt-1">{section.description}</p>
 )}
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full border-collapse">
 <thead className="bg-gray-50/30">
 <tr>
 <th className="text-left p-6 border-b border-gray-100 font-black text-sm uppercase tracking-[0.1em] text-muted-foreground w-1/3">
 Field Information
 </th>
 <th className="text-left p-6 border-b border-gray-100 font-black text-sm uppercase tracking-[0.1em] text-muted-foreground">
 Your Input
 </th>
 </tr>
 </thead>
 <tbody>
 {section.questions.map((question: any, idx: number) => (
 <tr
 key={question.id}
 className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'} hover:bg-primary/5 transition-colors duration-200 group`}
 >
 <td className="p-6 border-b border-gray-100 align-top">
 <div className="font-bold text-lg text-foreground mb-1 flex items-center gap-2">
 {question.title}
 {question.required && (
 <span className="text-primary">*</span>
 )}
 </div>
 {question.description && (
 <div className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[250px]">
 {question.description}
 </div>
 )}
 </td>
 <td className="p-6 border-b border-gray-100">
 <div className="max-w-xl">
 {renderField(question, responseData[question.id], (value) => handleInputChange(question.id, value))}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 ))}

 {/* Submit Button */}
 <div className="flex justify-center pt-8 pb-16">
 <Button
 size="xl"
 onClick={handleSubmit}
 disabled={isSubmitting}
 className="h-16 px-16 text-xl font-black rounded-2xl shadow-premium hover:shadow-premium-lg group transition-all"
 >
 {isSubmitting ? (
 <>
 <Loader2 className="w-6 h-6 mr-3 animate-spin" />
 Sending...
 </>
 ) : (
 <>
 Submit Form <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
 </>
 )}
 </Button>
 </div>
 </div>
 )
}

// Render appropriate input based on field type with premium styling
function renderField(
 question: any,
 value: any,
 onChange: (value: any) => void
) {
 const type = question.type?.toLowerCase() || 'short_text'

 switch (type) {
 case 'short_text':
 case 'text':
 case 'email':
 case 'phone':
 case 'url':
 return (
 <Input
 type={type === 'email' ? 'email' : type === 'phone' ? 'tel' : type === 'url' ? 'url' : 'text'}
 value={value || ''}
 onChange={(e) => onChange(e.target.value)}
 placeholder={question.placeholder || `Enter secret...`}
 className="h-14 text-lg border-2 border-transparent bg-gray-100/50 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-full font-medium"
 />
 )

 case 'long_text':
 case 'textarea':
 return (
 <Textarea
 value={value || ''}
 onChange={(e) => onChange(e.target.value)}
 placeholder={question.placeholder || `Tell us everything...`}
 rows={3}
 className="text-lg p-5 border-2 border-transparent bg-gray-100/50 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-full font-medium resize-none"
 />
 )

 case 'number':
 return (
 <Input
 type="number"
 value={value || ''}
 onChange={(e) => onChange(e.target.value)}
 placeholder="0"
 className="h-14 text-lg border-2 border-transparent bg-gray-100/50 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-32 font-bold"
 />
 )

 case 'date':
 return (
 <Input
 type="date"
 value={value || ''}
 onChange={(e) => onChange(e.target.value)}
 className="h-14 text-lg border-2 border-transparent bg-gray-100/50 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-56 font-bold"
 />
 )

 default:
 return (
 <Input
 type="text"
 value={value || ''}
 onChange={(e) => onChange(e.target.value)}
 placeholder={`Enter value`}
 className="h-14 text-lg border-2 border-transparent bg-gray-100/50 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-full font-medium"
 />
 )
 }
}
