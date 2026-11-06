import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/15 disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed",
 {
 variants: {
 variant: {
 default:
 "btn-ink [&>svg]:text-white",
 destructive:
 "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0 [&>svg]:text-white",
 outline:
 "border border-border bg-white text-foreground shadow-[0_1px_2px_rgba(16,16,32,0.04)] hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-premium active:translate-y-0",
 secondary:
 "bg-secondary text-secondary-foreground hover:bg-[#ebebf0]",
 ghost:
 "text-foreground hover:bg-muted",
 link:
 "text-foreground underline-offset-4 hover:underline decoration-violet/50",
 success:
 "bg-success text-success-foreground shadow-sm hover:bg-success/90 hover:-translate-y-0.5 active:translate-y-0 [&>svg]:text-white",
 },

 size: {
 default: "h-10 px-5",
 sm: "h-9 px-3.5 text-xs",
 lg: "h-12 px-7 text-[0.95rem]",
 xl: "h-14 px-9 text-base",
 icon: "h-10 w-10",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 },
 }
)

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean
 loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
 const Comp = asChild ? Slot : "button"
 return (
 <Comp
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 disabled={disabled || loading}
 {...props}
 >
 {loading ? (
 <span className="flex items-center gap-2">
 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
 <circle
 className="opacity-25"
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="4"
 fill="none"
 />
 <path
 className="opacity-75"
 fill="currentColor"
 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
 />
 </svg>
 Loading...
 </span>
 ) : (
 children
 )}
 </Comp>
 )
 }
)
Button.displayName = "Button"

export { Button, buttonVariants }
