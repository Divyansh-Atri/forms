"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Aurora, RevealText } from "@/components/fx"
import { FileText, Mail, Lock, ArrowRight, Eye, EyeOff, Check, Star, BarChart3 } from "lucide-react"

const ease = [0.16, 1, 0.3, 1] as const

export default function LoginPage() {
 const router = useRouter()
 const reduce = useReducedMotion()
 const [isLoading, setIsLoading] = useState(false)
 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [showPassword, setShowPassword] = useState(false)
 const [error, setError] = useState("")
 const [errorKey, setErrorKey] = useState(0)

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
 setErrorKey((k) => k + 1)
 }
 } catch {
 setError("Failed to connect to server")
 setErrorKey((k) => k + 1)
 } finally {
 setIsLoading(false)
 }
 }

 const rise = (delay: number) => ({
 initial: reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" },
 animate: { opacity: 1, y: 0, filter: "blur(0px)" },
 transition: { delay, duration: 0.8, ease },
 })

 return (
 <div className="relative min-h-screen overflow-hidden">
 <Aurora />

 <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
 {/* ---------- Form ---------- */}
 <div className="mx-auto w-full max-w-md">
 <motion.div {...rise(0)}>
 <Link href="/" className="mb-12 inline-flex items-center gap-2.5">
 <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-foreground shadow-[0_8px_20px_-8px_rgba(124,58,237,0.7)]">
 <FileText className="h-5 w-5 text-white" />
 <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-white" />
 </span>
 <span className="text-xl font-semibold tracking-tight text-foreground">Sanjeev Atri</span>
 </Link>
 </motion.div>

 <h1 className="text-[clamp(2.6rem,6vw,3.6rem)] font-semibold leading-[1] tracking-[-0.045em]">
 <RevealText text="Welcome" delay={0.1} />{" "}
 <motion.span
 initial={reduce ? false : { opacity: 0, filter: "blur(12px)" }}
 animate={{ opacity: 1, filter: "blur(0px)" }}
 transition={{ delay: 0.3, duration: 0.9, ease }}
 className="gradient-text inline-block pr-[0.1em] font-display font-normal italic tracking-[-0.02em]"
 >
 back
 </motion.span>
 </h1>
 <motion.p {...rise(0.25)} className="mt-3 text-lg text-muted-foreground">
 Sign in to your account to continue
 </motion.p>

 <motion.form {...rise(0.35)} onSubmit={handleSubmit} className="mt-10 space-y-4">
 {error && (
 <div key={errorKey} className="animate-shake rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm font-medium text-destructive">
 {error}
 </div>
 )}

 <div className="group relative">
 <Mail className="pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-violet" />
 <Input
 type="email"
 placeholder="Email address"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="h-14 rounded-2xl pl-11 text-base"
 required
 />
 </div>
 <div className="group relative">
 <Lock className="pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-violet" />
 <Input
 type={showPassword ? "text" : "password"}
 placeholder="Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="h-14 rounded-2xl pl-11 pr-12 text-base"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 aria-label={showPassword ? "Hide password" : "Show password"}
 className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
 >
 {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
 </button>
 </div>

 <div className="flex items-center justify-between pt-1 text-sm">
 <label className="group flex cursor-pointer items-center gap-2.5">
 <input type="checkbox" className="h-4 w-4 rounded border-input accent-foreground" />
 <span className="text-muted-foreground transition-colors group-hover:text-foreground">Remember me</span>
 </label>
 <Link href="/forgot-password" className="font-medium text-foreground underline decoration-violet/30 underline-offset-4 transition-colors hover:decoration-violet">
 Forgot password?
 </Link>
 </div>

 <Button type="submit" className="group mt-2 h-14 w-full text-base" size="lg" loading={isLoading}>
 Sign in <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
 </Button>
 </motion.form>

 <motion.p {...rise(0.5)} className="mt-8 text-center text-sm text-muted-foreground">
 Contact admin for account access
 </motion.p>
 </div>

 {/* ---------- Showcase (desktop) ---------- */}
 <motion.div
 aria-hidden
 initial={reduce ? false : { opacity: 0, scale: 0.95, x: 30 }}
 animate={{ opacity: 1, scale: 1, x: 0 }}
 transition={{ delay: 0.2, duration: 1.1, ease }}
 className="border-glow relative hidden h-[min(720px,calc(100vh-5rem))] overflow-hidden rounded-[36px] bg-white lg:block"
 >
 {/* colour field */}
 <div className="absolute inset-0">
 <div className="absolute -left-24 -top-24 h-96 w-96 animate-[drift-1_18s_ease-in-out_infinite_alternate] rounded-full bg-violet/30 blur-3xl" />
 <div className="absolute -right-20 top-1/3 h-96 w-96 animate-[drift-2_22s_ease-in-out_infinite_alternate] rounded-full bg-pink/25 blur-3xl" />
 <div className="absolute -bottom-32 left-1/4 h-96 w-96 animate-[drift-3_26s_ease-in-out_infinite_alternate] rounded-full bg-orange/25 blur-3xl" />
 <div className="absolute inset-0 bg-[radial-gradient(rgba(20,20,40,0.08)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
 </div>

 <div className="relative flex h-full flex-col justify-between p-10">
 <p className="max-w-sm text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.045em]">
 Ask better <span className="font-display font-normal italic tracking-[-0.02em]">questions,</span>
 <br />get better <span className="gradient-text inline-block pr-[0.1em] font-display font-normal italic tracking-[-0.02em]">answers.</span>
 </p>

 {/* floating UI pieces */}
 <div className="relative h-80">
 <motion.div
 initial={reduce ? false : { opacity: 0, y: 30, rotate: -6 }}
 animate={{ opacity: 1, y: 0, rotate: -4 }}
 transition={{ delay: 0.6, type: "spring", stiffness: 90, damping: 14 }}
 className="absolute left-0 top-2 w-72"
 >
 <div className="glass animate-float rounded-2xl p-5">
 <p className="mb-3 text-sm font-semibold">Which role fits you best?</p>
 {["Designer", "Developer", "Researcher"].map((r, i) => (
 <div key={r} className={`mb-2 flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-medium ${i === 1 ? "border-violet/40 bg-violet/[0.06]" : "border-border bg-white/80"}`}>
 <span className={`kbd !h-5 !min-w-5 !text-[10px] ${i === 1 ? "!border-violet/40 !bg-violet !text-white !shadow-none" : ""}`}>{String.fromCharCode(65 + i)}</span>
 {r}
 {i === 1 && <Check className="ml-auto h-3.5 w-3.5 text-violet" />}
 </div>
 ))}
 </div>
 </motion.div>

 <motion.div
 initial={reduce ? false : { opacity: 0, y: 30, rotate: 8 }}
 animate={{ opacity: 1, y: 0, rotate: 5 }}
 transition={{ delay: 0.8, type: "spring", stiffness: 90, damping: 14 }}
 className="absolute right-0 top-0 w-60"
 >
 <div className="glass animate-float rounded-2xl p-5 [animation-delay:-2s]">
 <p className="mb-3 text-sm font-semibold">Rate the experience</p>
 <div className="flex gap-1">
 {[0, 1, 2, 3, 4].map((i) => (
 <motion.span
 key={i}
 initial={reduce ? false : { scale: 0, rotate: -40 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ delay: 1.1 + i * 0.1, type: "spring", stiffness: 260, damping: 12 }}
 >
 <Star className={`h-6 w-6 ${i < 4 ? "fill-orange text-orange" : "text-border"}`} />
 </motion.span>
 ))}
 </div>
 </div>
 </motion.div>

 <motion.div
 initial={reduce ? false : { opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 1, type: "spring", stiffness: 90, damping: 14 }}
 className="absolute bottom-0 right-10 w-64"
 >
 <div className="glass animate-float rounded-2xl p-5 [animation-delay:-4s]">
 <div className="mb-3 flex items-center justify-between text-sm font-semibold">
 Responses <BarChart3 className="h-4 w-4 text-violet" />
 </div>
 <div className="flex h-16 items-end gap-1.5">
 {[35, 55, 42, 70, 58, 88, 74].map((h, i) => (
 <motion.span
 key={i}
 className="flex-1 rounded-md bg-gradient-to-t from-violet to-pink"
 initial={reduce ? false : { height: 0 }}
 animate={{ height: `${h}%` }}
 transition={{ delay: 1.3 + i * 0.07, type: "spring", stiffness: 120, damping: 14 }}
 />
 ))}
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 )
}
