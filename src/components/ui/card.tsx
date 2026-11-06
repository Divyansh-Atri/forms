import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
 hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
 ({ className, hover = false, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(
 "rounded-2xl border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgba(16,16,32,0.04)]",
 hover && "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-violet/20 hover:shadow-[0_24px_48px_-24px_rgba(124,58,237,0.28)]",
 className
 )}
 {...props}
 />
 )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex flex-col space-y-1.5 p-6", className)}
 {...props}
 />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
 <h3
 ref={ref}
 className={cn(
 "text-xl font-semibold leading-none tracking-tight",
 className
 )}
 {...props}
 />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
 <p
 ref={ref}
 className={cn("text-sm text-muted-foreground", className)}
 {...props}
 />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex items-center p-6 pt-0", className)}
 {...props}
 />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
