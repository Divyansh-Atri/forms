import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
 ({ className, variant = "default", ...props }, ref) => {
 const variants = {
 default: "bg-primary text-primary-foreground shadow-sm",
 secondary: "bg-secondary text-secondary-foreground",
 success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
 warning: "bg-amber-50 text-amber-700 border border-amber-200",
 danger: "bg-red-50 text-red-700 border border-red-200",
 outline: "border border-border bg-transparent text-foreground",
 }

 return (
 <div
 ref={ref}
 className={cn(
 "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
 variants[variant],
 className
 )}
 {...props}
 />
 )
 }
)
Badge.displayName = "Badge"

export { Badge }
