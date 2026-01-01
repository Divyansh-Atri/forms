"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
 const router = useRouter()
 const [isLoading, setIsLoading] = useState(false)
 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [showPassword, setShowPassword] = useState(false)
 const [error, setError] = useState("")

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setIsLoading(true)
 setError("")

 try {
 const response = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password }),
 })

 const result = await response.json()

 if (result.success) {
 router.push("/forms")
 } else {
 setError(result.error || "Login failed")
 }
 } catch {
 setError("Failed to connect to server")
 } finally {
 setIsLoading(false)
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
 {/* Background Decorations */}
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
 </div>

 <div className="w-full max-w-md animate-scale-in">
 {/* Logo */}
 <div className="flex items-center justify-center gap-2 mb-8">
 <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
 <FileText className="w-6 h-6 text-primary-foreground" />
 </div>
 <span className="font-bold text-2xl tracking-tight text-foreground">Sanjeev Atri</span>
 </div>

 <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
 <CardHeader className="text-center pb-2">
 <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
 <CardDescription>
 Sign in to your account to continue
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <form onSubmit={handleSubmit} className="space-y-4">
 {error && (
 <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
 {error}
 </div>
 )}
 <div className="space-y-4">
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
 <Input
 type="email"
 placeholder="Email address"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="pl-10 h-11 bg-background/50"
 required
 />
 </div>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
 <Input
 type={showPassword ? "text" : "password"}
 placeholder="Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="pl-10 pr-10 h-11 bg-background/50"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
 >
 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </div>
 </div>

 <div className="flex items-center justify-between text-sm">
 <label className="flex items-center gap-2 cursor-pointer group">
 <input type="checkbox" className="rounded border-input text-primary focus:ring-primary w-4 h-4" />
 <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
 </label>
 <Link href="/forgot-password" className="text-primary hover:underline font-medium">
 Forgot password?
 </Link>
 </div>

 <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" size="lg" loading={isLoading}>
 Sign in <ArrowRight className="w-4 h-4 ml-2" />
 </Button>
 </form>

 <p className="text-center text-sm text-muted-foreground mt-6">
 Contact admin for account access
 </p>
 </CardContent>
 </Card>
 </div>
 </div>
 )
}
