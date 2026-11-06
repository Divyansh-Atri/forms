import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
 extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
 error?: string
 label?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, error, label, id, ...props }, ref) => {
 const generatedId = React.useId()
 const textareaId = id || generatedId

 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={textareaId}
 className="block text-sm font-semibold text-foreground mb-2"
 >
 {label}
 </label>
 )}
 <textarea
 id={textareaId}
 className={cn(
 "flex min-h-[120px] w-full rounded-xl border-[1.5px] bg-white/90 px-4 py-3 text-[0.9375rem] transition-all duration-200",
 "placeholder:text-muted-foreground placeholder:opacity-70",
 "focus-visible:outline-none focus-visible:border-violet/60 focus-visible:ring-4 focus-visible:ring-violet/10 focus-visible:shadow-[0_10px_30px_-14px_rgba(124,58,237,0.45)]",
 "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
 "resize-y",
 error
 ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10"
 : "border-border hover:border-[#d4d4dc]",
 className
 )}
 ref={ref}
 {...props}
 />
 {error && (
 <p className="mt-2 text-sm text-destructive font-medium">{error}</p>
 )}
 </div>
 )
 }
)
Textarea.displayName = "Textarea"

export { Textarea }
