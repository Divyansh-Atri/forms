import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
 extends React.InputHTMLAttributes<HTMLInputElement> {
 error?: string
 label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
 ({ className, type, error, label, id, ...props }, ref) => {
 const inputId = id || React.useId()

 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={inputId}
 className="block text-sm font-semibold text-foreground mb-2"
 >
 {label}
 </label>
 )}
 <input
 type={type}
 id={inputId}
 className={cn(
 "flex h-12 w-full rounded-lg border-[1.5px] bg-white px-4 py-3 text-[0.9375rem] transition-all duration-200",
 "placeholder:text-muted-foreground placeholder:opacity-70",
 "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:-translate-y-0.5",
 "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
 error
 ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10"
 : "border-border hover:border-gray-400",
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
Input.displayName = "Input"

export { Input }
