"use client"

import { useEffect, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import Link from "next/link"
import {
 AnimatePresence,
 motion,
 useMotionValue,
 useReducedMotion,
 useSpring,
 useTransform,
} from "framer-motion"
import { Button } from "@/components/ui/button"
import { Aurora, Eyebrow, RevealText, burstConfetti, trackSpotlight } from "@/components/fx"
import {
 ArrowRight, Zap, BarChart3, Shield, Users, FileText, Sparkles, Check, GitBranch, MousePointer2,
 UserPlus, PenLine, Send,
} from "lucide-react"

const QUESTION_TYPES = [
 "Short text", "Paragraph", "Multiple choice", "Checkboxes", "Dropdown", "Linear scale",
 "Star rating", "NPS", "Matrix", "Ranking", "Date", "Time", "File upload", "Image choice",
 "Signature", "Address", "Consent",
]

const FEATURES = [
 { icon: Zap, title: "20+ Question Types", description: "From simple text to advanced matrix, ranking, and signature capture.", tint: "from-violet to-pink", wide: true },
 { icon: BarChart3, title: "Real-time Analytics", description: "Track responses, completion rates, and drop-off with beautiful charts.", tint: "from-cyan to-violet" },
 { icon: Shield, title: "Conditional Logic", description: "Show or hide questions based on previous answers. Create smart forms.", tint: "from-pink to-orange" },
 { icon: Users, title: "Team Collaboration", description: "Invite team members with different roles. Edit forms together.", tint: "from-violet to-cyan", wide: true },
 { icon: FileText, title: "Quiz Mode", description: "Create quizzes with scoring, feedback, and leaderboards.", tint: "from-orange to-pink" },
 { icon: Sparkles, title: "Beautiful Themes", description: "Customize colors, fonts, and backgrounds. Make it your brand.", tint: "from-pink to-violet", wide: true },
]

const STEPS = [
 { icon: UserPlus, title: "Sign up for free", description: "Start by creating your account in your existing project." },
 { icon: PenLine, title: "Create your form", description: "Import and use the form builder component into your app's layout or page." },
 { icon: Send, title: "Deploy & Share", description: "Deploy your form and start collecting responses from your users." },
]

const ease = [0.16, 1, 0.3, 1] as const

function Logo({ small = false }: { small?: boolean }) {
 return (
 <div className="flex items-center gap-2.5">
 <div className={`${small ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl"} relative flex items-center justify-center bg-foreground shadow-[0_8px_20px_-8px_rgba(124,58,237,0.7)]`}>
 <FileText className={`${small ? "h-3.5 w-3.5" : "h-4 w-4"} text-white`} />
 <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-white" />
 </div>
 <span className={`${small ? "text-base" : "text-lg"} font-semibold tracking-tight`}>Sanjeev Atri</span>
 </div>
 )
}

function SectionHeading({ eyebrow, children, sub }: { eyebrow: string; children: ReactNode; sub?: string }) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-80px" }}
 transition={{ duration: 0.8, ease }}
 className="mx-auto mb-14 max-w-3xl text-center"
 >
 <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-violet">{eyebrow}</p>
 <h2 className="text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{children}</h2>
 {sub && <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{sub}</p>}
 </motion.div>
 )
}

/* ------------------------------------------------------------------ */
/* Hero demo: a tiny form that fills itself in, on a loop              */
/* ------------------------------------------------------------------ */

const ROLES = ["Designer", "Developer", "Researcher"]
// step 0: Q1 idle -> 1: Q1 answered -> 2: Q2 idle -> 3: Q2 answered -> 4: done
const STEP_MS = [1400, 1300, 1300, 1300, 2800]

function Cursor({ id }: { id: string }) {
 return (
 <motion.div
 layoutId={id}
 transition={{ type: "spring", stiffness: 120, damping: 18 }}
 className="pointer-events-none absolute z-20"
 >
 <MousePointer2 className="h-5 w-5 fill-foreground text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />
 </motion.div>
 )
}

function LiveFormDemo({ step }: { step: number }) {
 const phase = step <= 1 ? "q1" : step <= 3 ? "q2" : "done"
 const progress = phase === "q1" ? 33 : phase === "q2" ? 66 : 100

 return (
 <div className="border-glow relative rounded-[28px] bg-white/90 p-5 text-left shadow-premium-lg backdrop-blur-xl sm:p-7">
 {/* window chrome */}
 <div className="mb-5 flex items-center justify-between gap-3">
 <div className="flex items-center gap-1.5">
 <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
 <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
 <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
 </div>
 <div className="truncate rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
 /f/feedback-survey
 </div>
 <span className="font-mono text-[11px] text-muted-foreground">{phase === "q1" ? "1/2" : "2/2"}</span>
 </div>
 <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
 <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease }} />
 </div>

 <div className="relative min-h-[236px]">
 <AnimatePresence mode="wait">
 {phase === "q1" && (
 <motion.div
 key="q1"
 initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
 transition={{ duration: 0.5, ease }}
 className="relative"
 >
 <p className="mb-1.5 text-xs font-semibold text-violet">01 →</p>
 <p className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">Which role fits you best?</p>
 <div className="grid gap-2.5">
 {ROLES.map((role, i) => {
 const selected = step === 1 && i === 1
 return (
 <div
 key={role}
 className={`relative flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all delay-300 duration-300 ${selected ? "scale-[1.02] border-violet/50 bg-violet/[0.06] shadow-[0_10px_24px_-14px_rgba(124,58,237,0.6)]" : "border-border bg-white"}`}
 >
 <span className={`kbd transition-colors delay-300 ${selected ? "!border-violet/40 !bg-violet !text-white !shadow-none" : ""}`}>
 {String.fromCharCode(65 + i)}
 </span>
 {role}
 {selected && <Check className="ml-auto h-4 w-4 text-violet" />}
 {i === 1 && step === 1 && (
 <span className="absolute right-10 top-1/2 -translate-y-1/2"><Cursor id="cursor-q1" /></span>
 )}
 </div>
 )
 })}
 </div>
 {step === 0 && <span className="absolute -bottom-2 right-4"><Cursor id="cursor-q1" /></span>}
 </motion.div>
 )}

 {phase === "q2" && (
 <motion.div
 key="q2"
 initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
 transition={{ duration: 0.5, ease }}
 className="relative"
 >
 <p className="mb-1.5 text-xs font-semibold text-violet">02 →</p>
 <p className="mb-5 text-xl font-semibold tracking-tight sm:text-2xl">How likely are you to recommend us?</p>
 <div className="grid grid-cols-11 gap-1">
 {Array.from({ length: 11 }, (_, n) => {
 const selected = step === 3 && n === 9
 return (
 <div
 key={n}
 className={`relative flex aspect-square items-center justify-center rounded-lg border text-[11px] font-semibold transition-all delay-300 duration-300 sm:text-xs ${selected ? "-translate-y-1 scale-110 border-foreground bg-foreground text-white shadow-[0_10px_20px_-8px_rgba(236,72,153,0.7)]" : "border-border bg-white text-muted-foreground"}`}
 >
 {n}
 {n === 9 && step === 3 && <span className="absolute left-1/2 top-1/2"><Cursor id="cursor-q2" /></span>}
 </div>
 )
 })}
 </div>
 <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
 <span>Not likely</span><span>Extremely likely</span>
 </div>
 {step === 2 && <span className="absolute -bottom-10 right-4"><Cursor id="cursor-q2" /></span>}
 </motion.div>
 )}

 {phase === "done" && (
 <motion.div
 key="done"
 initial={{ opacity: 0, scale: 0.92 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.96 }}
 transition={{ type: "spring", stiffness: 160, damping: 18 }}
 className="flex min-h-[236px] flex-col items-center justify-center text-center"
 >
 <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-[0_16px_36px_-12px_rgba(236,72,153,0.7)]">
 <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
 <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.15, ease }} />
 </svg>
 </div>
 <p className="text-2xl font-semibold tracking-tight">Response recorded</p>
 <p className="mt-1 text-sm text-muted-foreground">Thanks for filling this in.</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 )
}

function Hero() {
 const reduce = useReducedMotion()
 const [step, setStep] = useState(1)

 useEffect(() => {
 if (reduce) return
 const id = setTimeout(() => setStep((s) => (s + 1) % STEP_MS.length), STEP_MS[step])
 return () => clearTimeout(id)
 }, [step, reduce])

 // 3D tilt that follows the pointer
 const mx = useMotionValue(0)
 const my = useMotionValue(0)
 const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 })
 const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 })
 const onMove = (e: ReactPointerEvent<HTMLElement>) => {
 if (reduce || e.pointerType !== "mouse") return
 const r = e.currentTarget.getBoundingClientRect()
 mx.set((e.clientX - r.left) / r.width - 0.5)
 my.set((e.clientY - r.top) / r.height - 0.5)
 }
 const onLeave = () => { mx.set(0); my.set(0) }

 return (
 <section onPointerMove={onMove} onPointerLeave={onLeave} className="relative px-4 pb-24 pt-28 sm:px-6 sm:pt-36 lg:px-8">
 <div className="relative mx-auto max-w-6xl text-center">
 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
 <Eyebrow>The modern form builder you deserve</Eyebrow>
 </motion.div>

 <h1 className="mx-auto mt-8 max-w-5xl text-[clamp(2.9rem,9vw,7.25rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
 <RevealText text="Create forms" delay={0.1} />
 <br />
 <RevealText text="that" delay={0.3} />{" "}
 <motion.span
 initial={reduce ? false : { opacity: 0, filter: "blur(16px)", scale: 0.9 }}
 animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
 transition={{ delay: 0.5, duration: 1, ease }}
 className="gradient-text inline-block pr-[0.12em] font-display font-normal italic tracking-[-0.02em]"
 >
 convert.
 </motion.span>
 </h1>

 <motion.p
 initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 transition={{ delay: 0.7, duration: 0.9, ease }}
 className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
 >
 Build beautiful surveys, quizzes, and forms with our drag-and-drop builder.
 Get insights with powerful analytics and conditional logic.
 </motion.p>

 <motion.div
 initial={reduce ? false : { opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.85, duration: 0.8, ease }}
 className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
 >
 <Link href="/login">
 <Button size="xl" className="group h-14 px-8 text-base">
 Start for free <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
 </Button>
 </Link>
 <Link href="#demo">
 <Button size="xl" variant="outline" className="h-14 bg-white/70 px-8 text-base backdrop-blur">
 See demo
 </Button>
 </Link>
 </motion.div>

 <motion.p
 initial={reduce ? false : { opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 1.1, duration: 0.8 }}
 className="mt-6 text-sm text-muted-foreground"
 >
 No credit card required <span className="mx-1.5 text-border">●</span> Free forever plan
 </motion.p>

 {/* Live demo */}
 <motion.div
 id="demo"
 initial={reduce ? false : { opacity: 0, y: 60, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ delay: 0.9, duration: 1.2, ease }}
 className="relative mx-auto mt-14 max-w-[600px] scroll-mt-28 [perspective:1400px]"
 >
 {/* glow under the card */}
 <div aria-hidden className="absolute inset-x-8 -bottom-6 top-10 -z-10 rounded-[40px] bg-brand opacity-25 blur-3xl" />

 <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
 <LiveFormDemo step={step} />
 </motion.div>

 {/* Floating cards (desktop only) */}
 <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
 <div className="absolute -left-60 top-10 w-52 animate-float">
 <div className="glass rounded-2xl p-4 text-left">
 <div className="mb-3 flex items-center justify-between">
 <span className="text-xs font-semibold">Responses</span>
 <BarChart3 className="h-3.5 w-3.5 text-violet" />
 </div>
 <svg viewBox="0 0 160 56" className="h-14 w-full overflow-visible">
 <defs>
 <linearGradient id="spark" x1="0" x2="1">
 <stop offset="0%" stopColor="#7c3aed" /><stop offset="60%" stopColor="#ec4899" /><stop offset="100%" stopColor="#f97316" />
 </linearGradient>
 <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
 <stop offset="0%" stopColor="#ec4899" stopOpacity="0.22" /><stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
 </linearGradient>
 </defs>
 <path d="M0 46 C20 42 28 30 44 33 S70 44 84 28 S112 14 126 20 S148 8 160 4 L160 56 L0 56 Z" fill="url(#sparkFill)" />
 <motion.path
 d="M0 46 C20 42 28 30 44 33 S70 44 84 28 S112 14 126 20 S148 8 160 4"
 fill="none" stroke="url(#spark)" strokeWidth={2.5} strokeLinecap="round"
 initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 1.6, ease }}
 />
 <circle cx="160" cy="4" r="3.5" fill="#f97316" className={step === 4 ? "animate-ping" : ""} style={{ transformOrigin: "160px 4px" }} />
 </svg>
 <div className="mt-2 flex gap-1">
 {[40, 65, 50, 80, 60, 95, 75].map((h, i) => (
 <motion.span
 key={i}
 className="flex-1 rounded-sm bg-violet/15"
 initial={{ height: 0 }}
 animate={{ height: h * 0.28 }}
 transition={{ delay: 1.6 + i * 0.06, type: "spring", stiffness: 140, damping: 16 }}
 />
 ))}
 </div>
 </div>
 </div>

 <AnimatePresence>
 {step === 4 && (
 <motion.div
 initial={{ opacity: 0, x: 40, scale: 0.9 }}
 animate={{ opacity: 1, x: 0, scale: 1 }}
 exit={{ opacity: 0, x: 20, scale: 0.95 }}
 transition={{ type: "spring", stiffness: 180, damping: 18 }}
 className="absolute -right-56 top-4 w-56"
 >
 <div className="glass flex items-center gap-3 rounded-2xl p-3 text-left">
 <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">AK</span>
 <div>
 <p className="text-xs font-semibold">New response</p>
 <p className="text-[11px] text-muted-foreground">Feedback Survey · just now</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="absolute -right-64 bottom-6 w-60 animate-float [animation-delay:-3s]">
 <div className="glass rounded-2xl p-4 text-left">
 <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
 <GitBranch className="h-3.5 w-3.5 text-pink" /> Conditional logic
 </div>
 <p className="text-[11px] leading-relaxed text-muted-foreground">
 If <span className="rounded bg-violet/10 px-1 py-0.5 font-medium text-violet">role = Developer</span>
 <br />→ ask about their stack
 </p>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 </section>
 )
}

/* ------------------------------------------------------------------ */

function Marquee() {
 const row = (items: string[], reverse = false) => (
 <div className="flex w-max animate-marquee gap-3" style={reverse ? { animationDirection: "reverse" } : undefined}>
 {[...items, ...items].map((t, i) => (
 <span key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-medium text-foreground/80 shadow-[0_1px_2px_rgba(16,16,32,0.04)]">
 <span className="h-1.5 w-1.5 rounded-full bg-brand" />
 {t}
 </span>
 ))}
 </div>
 )
 return (
 <section aria-label="Question types" className="relative overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
 <div className="space-y-3">
 {row(QUESTION_TYPES)}
 {row([...QUESTION_TYPES].reverse(), true)}
 </div>
 </section>
 )
}

function FeatureArt({ index }: { index: number }) {
 if (index === 0) {
 return (
 <div className="flex flex-wrap gap-2">
 {["Text", "Choice", "Scale", "NPS", "Matrix", "Ranking", "Date", "Upload", "Signature"].map((t, i) => (
 <motion.span
 key={t}
 initial={{ opacity: 0, scale: 0.6 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 200, damping: 14 }}
 className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:border-violet/25 group-hover:text-foreground"
 >
 {t}
 </motion.span>
 ))}
 </div>
 )
 }
 if (index === 3) {
 return (
 <div className="flex items-center">
 {[["SA", "from-violet to-pink"], ["RK", "from-cyan to-violet"], ["MJ", "from-orange to-pink"], ["+", "from-foreground to-foreground"]].map(([t, g], i) => (
 <span
 key={t}
 className={`-ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${g} text-xs font-semibold text-white ring-4 ring-white transition-transform duration-500 first:ml-0 group-hover:-translate-y-1`}
 style={{ transitionDelay: `${i * 60}ms` }}
 >
 {t}
 </span>
 ))}
 </div>
 )
 }
 return (
 <div className="flex gap-2">
 {["#0b0b0f", "#7c3aed", "#ec4899", "#f97316", "#06b6d4", "#facc15"].map((c, i) => (
 <span
 key={c}
 className="h-10 flex-1 rounded-xl transition-transform duration-500 group-hover:-translate-y-1.5"
 style={{ background: c, transitionDelay: `${i * 50}ms` }}
 />
 ))}
 </div>
 )
}

function Features() {
 return (
 <section id="features" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-6xl">
 <SectionHeading
 eyebrow="Features"
 sub="Powerful features that help you create engaging forms and get actionable insights."
 >
 Everything you need to <span className="font-display font-normal italic tracking-[-0.02em]">collect</span> data
 </SectionHeading>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {FEATURES.map((f, i) => (
 <motion.div
 key={f.title}
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-60px" }}
 transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
 onPointerMove={trackSpotlight}
 className={`spotlight group flex flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-border bg-white/80 p-7 backdrop-blur transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-violet/20 hover:shadow-[0_30px_60px_-30px_rgba(124,58,237,0.35)] ${f.wide ? "lg:col-span-2" : ""}`}
 >
 <div>
 <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.tint} shadow-[0_12px_24px_-10px_rgba(124,58,237,0.55)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
 <f.icon className="h-5 w-5 text-white" />
 </div>
 <h3 className="mb-2 text-xl font-semibold tracking-tight">{f.title}</h3>
 <p className="max-w-md leading-relaxed text-muted-foreground">{f.description}</p>
 </div>
 {f.wide && <FeatureArt index={i} />}
 </motion.div>
 ))}
 </div>
 </div>
 </section>
 )
}

function GetStarted() {
 return (
 <section className="px-4 py-24 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-6xl">
 <SectionHeading eyebrow="How it works" sub="To start building your first form, follow these simple steps.">
 Get <span className="font-display font-normal italic tracking-[-0.02em]">started</span>
 </SectionHeading>

 <div className="relative grid gap-4 md:grid-cols-3">
 {/* connecting line */}
 <motion.div
 aria-hidden
 initial={{ scaleX: 0 }}
 whileInView={{ scaleX: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 1.4, ease }}
 className="absolute left-[16%] right-[16%] top-[3.25rem] hidden h-px origin-left bg-gradient-to-r from-violet via-pink to-orange md:block"
 />
 {STEPS.map((s, i) => (
 <motion.div
 key={s.title}
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-60px" }}
 transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease }}
 className="group relative rounded-3xl border border-border bg-white/85 p-7 text-center backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-premium-lg"
 >
 <div className="relative mx-auto mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-border bg-white shadow-premium">
 <s.icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
 <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-display text-sm italic text-white">
 {i + 1}
 </span>
 </div>
 <h3 className="mb-2 text-xl font-semibold tracking-tight">{s.title}</h3>
 <p className="leading-relaxed text-muted-foreground">{s.description}</p>
 </motion.div>
 ))}
 </div>

 <p className="mt-10 text-center text-sm text-muted-foreground">
 For full examples and further reference, please refer to our{" "}
 <Link href="/login" className="font-semibold text-foreground underline decoration-violet/40 underline-offset-4 hover:decoration-violet">
 documentation
 </Link>
 </p>
 </div>
 </section>
 )
}

function FinalCta() {
 return (
 <section id="pricing" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
 <motion.div
 initial={{ opacity: 0, y: 40, scale: 0.97 }}
 whileInView={{ opacity: 1, y: 0, scale: 1 }}
 viewport={{ once: true, margin: "-80px" }}
 transition={{ duration: 0.9, ease }}
 className="border-glow relative mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-white px-6 py-16 text-center shadow-premium-lg sm:px-12 sm:py-20"
 >
 <div aria-hidden className="pointer-events-none absolute inset-0">
 <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
 <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-orange/20 blur-3xl" />
 <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/10 blur-3xl" />
 </div>
 <div className="relative">
 <h2 className="mx-auto max-w-3xl text-[clamp(2.2rem,5.5vw,4.2rem)] font-semibold leading-[1] tracking-[-0.045em]">
 Ready to create your <span className="gradient-text inline-block pr-[0.1em] font-display font-normal italic tracking-[-0.02em]">first form?</span>
 </h2>
 <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
 Build it, share the link and watch the responses come in. Free to start.
 </p>
 <Link
 href="/login"
 className="mt-9 inline-block"
 onClick={(e) => {
 const r = e.currentTarget.getBoundingClientRect()
 burstConfetti({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
 }}
 >
 <Button size="xl" className="group h-14 px-9 text-base">
 Get started for free <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
 </Button>
 </Link>
 </div>
 </motion.div>
 </section>
 )
}

export default function Home() {
 return (
 <div className="relative min-h-screen overflow-x-clip text-foreground">
 <Aurora />

 {/* Navigation */}
 <motion.nav
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, ease }}
 className="fixed inset-x-0 top-4 z-50 px-4"
 >
 <div className="glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full pl-4 pr-2 sm:pl-5">
 <Link href="/" aria-label="Home"><Logo /></Link>
 <div className="flex items-center gap-1 sm:gap-2">
 <Link href="#features" className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block">
 Features
 </Link>
 <Link href="#pricing" className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block">
 Pricing
 </Link>
 <Link href="/login">
 <Button variant="ghost" className="font-medium">Log in</Button>
 </Link>
 <Link href="/login" className="hidden sm:block">
 <Button className="group">
 Get Started <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
 </Button>
 </Link>
 </div>
 </div>
 </motion.nav>

 <main className="relative z-10">
 <Hero />
 <Marquee />
 <Features />
 <GetStarted />
 <FinalCta />
 </main>

 {/* Footer */}
 <footer className="relative z-10 overflow-hidden border-t border-border/70 px-4 pt-12 sm:px-6 lg:px-8">
 <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
 <Logo small />
 <p className="text-sm text-muted-foreground">
 © {new Date().getFullYear()} Sanjeev Atri. All rights reserved.
 </p>
 </div>
 <p
 aria-hidden
 className="mt-10 select-none whitespace-nowrap bg-gradient-to-b from-violet/15 via-pink/5 to-transparent bg-clip-text pb-2 text-center font-display text-[clamp(4rem,17vw,15rem)] italic leading-[0.85] tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_rgba(124,58,237,0.16)]"
 >
 Sanjeev Atri
 </p>
 </footer>
 </div>
 )
}
