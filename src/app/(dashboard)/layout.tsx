"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, MotionConfig } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Aurora } from "@/components/fx"
import {
 FileText,
 Plus,
 LogOut,
 ChevronDown,
 Bell,
 Search,
 Menu,
 X
} from "lucide-react"

interface DashboardLayoutProps {
 children: React.ReactNode
}

const navItems = [
	{ href: "/forms", label: "Forms", icon: FileText },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
 const pathname = usePathname()
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

 return (
 <MotionConfig reducedMotion="user">
 <div className="min-h-screen">
 {/* Soft moving colour behind everything (uses .aurora, not .fixed.inset-0,
     so the forms page's "is a modal open?" check isn't fooled) */}
 <Aurora className="opacity-70 -z-10" />

 {/* Top Navigation */}
 <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.06]">
 <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6">
 {/* Left side */}
 <div className="flex items-center gap-2 sm:gap-4 min-w-0">
 {/* Mobile menu button */}
 <button
 className="lg:hidden p-2 rounded-full hover:bg-black/[0.05] transition-colors"
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
 >
 {mobileMenuOpen ? (
 <X className="w-5 h-5 text-foreground" />
 ) : (
 <Menu className="w-5 h-5 text-foreground" />
 )}
 </button>

 {/* Logo */}
		<Link href="/forms" className="group flex items-center gap-2.5">
 <div className="relative w-9 h-9">
 <div className="absolute inset-0 rounded-xl bg-brand blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
 <div className="relative w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(124,58,237,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[-8deg] group-hover:scale-105">
 <FileText className="w-[18px] h-[18px] text-white" />
 </div>
 </div>
			<span className="font-semibold text-[17px] tracking-tight hidden sm:block text-foreground">sanjeevatri</span>
 </Link>

 {/* Workspace selector */}
 <button className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-transparent hover:border-border hover:bg-white transition-all">
 <span className="w-5 h-5 rounded-md bg-gradient-to-br from-violet via-pink to-orange" />
 <span className="text-sm font-medium text-foreground">My Workspace</span>
 <ChevronDown className="w-4 h-4 text-muted-foreground" />
 </button>
 </div>

 {/* Search */}
 <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
 <div className="relative w-full group">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-violet" />
 <input
 type="search"
 placeholder="Search forms..."
 className="w-full h-10 pl-10 pr-4 rounded-full border border-black/[0.07] bg-white/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-white focus:border-violet/40 focus:ring-4 focus:ring-violet/10 transition-all"
 />
 </div>
 </div>

 {/* Right side */}
 <div className="flex items-center gap-1.5 sm:gap-2">
 <Link href="/forms/new" className="hidden sm:block">
 <Button size="sm">
 <Plus className="w-4 h-4" />
 New Form
 </Button>
 </Link>

 {/* Mobile add button */}
 <Link href="/forms/new" className="sm:hidden" aria-label="New form">
 <span className="btn-ink flex items-center justify-center w-9 h-9 rounded-full">
 <Plus className="w-5 h-5" />
 </span>
 </Link>

 <button className="relative p-2 rounded-full hover:bg-black/[0.05] transition-colors" aria-label="Notifications">
 <Bell className="w-5 h-5 text-muted-foreground" />
 <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
 <span className="absolute inline-flex h-full w-full rounded-full bg-pink opacity-60 animate-ping" />
 <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
 </span>
 </button>

 <button className="flex items-center p-1 rounded-full hover:bg-black/[0.05] transition-colors" aria-label="Account">
 <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-br from-violet via-pink to-orange">
 <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
 SA
 </div>
 </div>
 </button>
 </div>
 </div>
 {/* Gradient hairline */}
 <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-violet/40 to-transparent" />
 </header>

 {/* Mobile Menu Overlay */}
 {mobileMenuOpen && (
 <div
 className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
 onClick={() => setMobileMenuOpen(false)}
 />
 )}

 {/* Sidebar - Desktop & Mobile */}
 <aside className={cn(
	"fixed top-16 left-0 bottom-0 w-64 z-40 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
	"bg-white/80 backdrop-blur-xl border-r border-black/[0.06]",
	"shadow-[12px_0_40px_-24px_rgba(16,16,32,0.25)] lg:shadow-none",
	"rounded-r-3xl lg:rounded-none",
	mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
 )}>
 <div className="px-4 pt-5 pb-2">
 <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Workspace</p>
 </div>
 <nav className="px-4 space-y-1">
 {navItems.map((item) => {
 const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileMenuOpen(false)}
 className={cn(
 "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
 isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04]"
 )}
 >
 {isActive && (
 <motion.span
 layoutId="nav-active"
 className="absolute inset-0 rounded-xl bg-primary shadow-[0_10px_24px_-12px_rgba(124,58,237,0.7)]"
 transition={{ type: "spring", stiffness: 380, damping: 32 }}
 />
 )}
 <item.icon className="relative w-[18px] h-[18px]" />
 <span className="relative">{item.label}</span>
 {isActive && (
 <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-br from-violet via-pink to-orange" />
 )}
 </Link>
 )
 })}
 </nav>

 {/* Decorative card */}
 <div className="absolute left-4 right-4 bottom-20 hidden lg:block">
 <div className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4">
 <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-brand opacity-20 blur-2xl animate-float" />
 <p className="relative font-display italic text-xl leading-none text-foreground">Make it beautiful.</p>
 <p className="relative mt-1.5 text-xs text-muted-foreground leading-relaxed">Every form you publish gets the animated respondent experience.</p>
 </div>
 </div>

 {/* Bottom section */}
 <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/[0.06]">
 <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/[0.04] hover:text-foreground transition-colors">
 <LogOut className="w-[18px] h-[18px]" />
 Log out
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <main className="lg:ml-64 pt-16 min-h-screen">
 <div className="p-4 sm:p-6 lg:p-10">
 {children}
 </div>
 </main>
 </div>
 </MotionConfig>
 )
}
