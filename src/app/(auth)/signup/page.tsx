"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Mail, Lock, User, ArrowRight, Chrome, Check } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const result = await response.json()

            if (result.success) {
                router.push("/forms")
            } else {
                setError(result.error || "Signup failed")
            }
        } catch {
            setError("Failed to connect to server")
        } finally {
            setIsLoading(false)
        }
    }

    const features = [
        "Unlimited forms",
        "20+ question types",
        "Conditional logic",
        "Analytics dashboard",
    ]

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left side - Features */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-md mx-auto relative z-10">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-3xl tracking-tight">Sanjeev Atri</span>
                    </div>

                    <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                        Start building amazing forms today
                    </h2>

                    <p className="text-lg text-primary-foreground/80 mb-10 leading-relaxed font-medium">
                        Join thousands of users who create beautiful, powerful forms with our intuitive builder.
                    </p>

                    <ul className="space-y-6">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                    <Check className="w-4 h-4 text-white font-bold" />
                                </div>
                                <span className="text-lg font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative overflow-hidden">
                {/* Mobile Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 lg:hidden"></div>

                <div className="w-full max-w-md animate-scale-in">
                    {/* Mobile Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <FileText className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight">Sanjeev Atri</span>
                    </div>

                    <Card className="shadow-2xl shadow-primary/5 border-border/50 backdrop-blur-sm bg-card/80">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                            <CardDescription>
                                Get started with a free account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                                        {error}
                                    </div>
                                )}
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-10 h-11 bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10 h-11 bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="pl-10 h-11 bg-background/50"
                                        required
                                        minLength={8}
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="pl-10 h-11 bg-background/50"
                                        required
                                    />
                                </div>

                                <p className="text-xs text-muted-foreground text-center px-4">
                                    By signing up, you agree to our{" "}
                                    <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                                </p>

                                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" size="lg" loading={isLoading}>
                                    Create account <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full h-11 text-base hover:bg-secondary/50" size="lg">
                                <Chrome className="w-5 h-5 mr-2" />
                                Google
                            </Button>

                            <p className="text-center text-sm text-muted-foreground mt-8">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-bold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
