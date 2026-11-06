"use client"

// Shared visual effects for the white "aurora" theme.
// All of them are decorative: they ignore pointer events and back off
// when the visitor prefers reduced motion.

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/** Slow-moving coloured blobs, washed out to near-white, plus a dot grid and grain. */
export function Aurora({ className }: { className?: string }) {
 return (
 <div aria-hidden className={cn("aurora", className)}>
 <div className="aurora__blob aurora__blob--1" />
 <div className="aurora__blob aurora__blob--2" />
 <div className="aurora__blob aurora__blob--3" />
 <div className="aurora__blob aurora__blob--4" />
 <div className="aurora__veil" />
 <div className="aurora__grid" />
 <div className="aurora__grain" />
 </div>
 )
}

/** Feeds the cursor position to a `.spotlight` element's CSS. */
export function trackSpotlight(e: ReactPointerEvent<HTMLElement>) {
 const el = e.currentTarget
 const rect = el.getBoundingClientRect()
 el.style.setProperty("--mx", `${e.clientX - rect.left}px`)
 el.style.setProperty("--my", `${e.clientY - rect.top}px`)
}

/** Reveals text word by word with a blur-to-sharp spring. */
export function RevealText({
 text,
 className,
 delay = 0,
 stagger = 0.06,
 as = "span",
}: {
 text: string
 className?: string
 delay?: number
 stagger?: number
 as?: "span" | "h1" | "h2" | "p"
}) {
 const reduce = useReducedMotion()
 const Tag = motion[as]
 const words = text.split(/(\s+)/)

 return (
 <Tag className={className} aria-label={text}>
 {words.map((word, i) =>
 /\s+/.test(word) ? (
 word
 ) : (
 <motion.span
 key={i}
 aria-hidden
 className="inline-block will-change-transform"
 initial={reduce ? false : { opacity: 0, y: "0.45em", filter: "blur(10px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 transition={{ delay: delay + (i / 2) * stagger, type: "spring", stiffness: 170, damping: 20 }}
 >
 {word}
 </motion.span>
 )
 )}
 </Tag>
 )
}

/** Small uppercase label with a pulsing gradient dot. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
 return (
 <span
 className={cn(
 "inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-[0_1px_2px_rgba(16,16,32,0.04)] backdrop-blur",
 className
 )}
 >
 <span className="relative flex h-2 w-2">
 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink opacity-60" />
 <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
 </span>
 {children}
 </span>
 )
}

const CONFETTI_COLORS = ["#7c3aed", "#ec4899", "#f97316", "#06b6d4", "#facc15", "#0b0b0f"]

/** One-shot confetti burst from a point on screen (defaults to the centre). */
export function burstConfetti(origin?: { x: number; y: number }) {
 if (typeof window === "undefined") return
 if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

 const canvas = document.createElement("canvas")
 const dpr = Math.min(window.devicePixelRatio || 1, 2)
 canvas.width = window.innerWidth * dpr
 canvas.height = window.innerHeight * dpr
 Object.assign(canvas.style, {
 position: "fixed", inset: "0", width: "100vw", height: "100vh", pointerEvents: "none", zIndex: "9999",
 })
 document.body.appendChild(canvas)
 const ctx = canvas.getContext("2d")
 if (!ctx) { canvas.remove(); return }
 ctx.scale(dpr, dpr)

 const ox = origin?.x ?? window.innerWidth / 2
 const oy = origin?.y ?? window.innerHeight / 2
 const pieces = Array.from({ length: 180 }, () => {
 const angle = Math.random() * Math.PI * 2
 const speed = 6 + Math.random() * 12
 return {
 x: ox, y: oy,
 vx: Math.cos(angle) * speed,
 vy: Math.sin(angle) * speed - 8,
 w: 6 + Math.random() * 8,
 h: 4 + Math.random() * 6,
 rot: Math.random() * Math.PI,
 vr: (Math.random() - 0.5) * 0.4,
 color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
 round: Math.random() < 0.3,
 }
 })

 const start = performance.now()
 const frame = (now: number) => {
 const t = now - start
 ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
 for (const p of pieces) {
 p.vy += 0.35
 p.vx *= 0.985
 p.vy *= 0.985
 p.x += p.vx
 p.y += p.vy
 p.rot += p.vr
 ctx.save()
 ctx.globalAlpha = Math.max(0, 1 - t / 2600)
 ctx.translate(p.x, p.y)
 ctx.rotate(p.rot)
 ctx.fillStyle = p.color
 if (p.round) {
 ctx.beginPath()
 ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2)
 ctx.fill()
 } else {
 ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
 }
 ctx.restore()
 }
 if (t < 2600) requestAnimationFrame(frame)
 else canvas.remove()
 }
 requestAnimationFrame(frame)
}
