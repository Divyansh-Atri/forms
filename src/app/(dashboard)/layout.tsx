"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
 FileText,
 LayoutDashboard,
 Settings,
 Users,
 Webhook,
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
 <div className="min-h-screen bg-background">
 {/* Top Navigation */}
 <header className="fixed top-0 left-0 right-0 h-16 glass border-b border-border/40 backdrop-blur-xl z-50">
 <div className="flex items-center justify-between h-full px-4 lg:px-6">
 {/* Left side */}
 <div className="flex items-center gap-4">
 {/* Mobile menu button */}
 <button
 className="lg:hidden p-2 rounded-lg hover:bg-primary/8 transition-colors"
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 >
 {mobileMenuOpen ? (
 <X className="w-5 h-5 text-foreground" />
 ) : (
 <Menu className="w-5 h-5 text-foreground" />
 )}
 </button>

 {/* Logo */}
		<Link href="/forms" className="flex items-center gap-2.5">
 <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
 <FileText className="w-4.5 h-4.5 text-white" />
 </div>
			<span className="font-bold text-lg hidden sm:block text-foreground">sanjeevatri</span>
 </Link>

 {/* Workspace selector */}
 <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
 <span className="text-sm font-semibold text-foreground">My Workspace</span>
 <ChevronDown className="w-4 h-4 text-muted-foreground" />
 </button>
 </div>

 {/* Search */}
 <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
 <div className="relative w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 type="search"
 placeholder="Search forms..."
 className="w-full h-10 pl-10 pr-4 rounded-lg border-[1.5px] border-border bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
 />
 </div>
 </div>

 {/* Right side */}
 <div className="flex items-center gap-2">
 <Link href="/forms/new">
 <Button size="sm" className="hidden sm:flex shadow-sm">
 <Plus className="w-4 h-4 mr-1" />
 New Form
 </Button>
 </Link>

 {/* Mobile add button */}
 <Link href="/forms/new" className="sm:hidden">
 <button className="p-2 rounded-lg bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors">
 <Plus className="w-5 h-5" />
 </button>
 </Link>

 <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
 <Bell className="w-5 h-5 text-muted-foreground" />
 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
 </button>

 <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors">
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
 SA
 </div>
 </button>
 </div>
 </div>
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
	"fixed top-16 left-0 bottom-0 w-64 bg-card border-r border-border z-40 transition-transform duration-300 shadow-md",
	"lg:translate-x-0",
	"rounded-r-2xl lg:rounded-none",
	mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
)}>
 <nav className="p-4 space-y-1">
 {navItems.map((item) => {
 const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileMenuOpen(false)}
 className={cn(
 "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
 isActive
 ? "bg-primary text-primary-foreground shadow-sm"
 : "text-muted-foreground hover:bg-accent hover:text-foreground"
 )}
 >
 <item.icon className="w-5 h-5" />
 {item.label}
 </Link>
 )
 })}
 </nav>

 {/* Bottom section */}
 <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
 <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
 <LogOut className="w-5 h-5" />
 Log out
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <main className="lg:ml-64 pt-16 min-h-screen">
 <div className="p-4 lg:p-8">
 {children}
 </div>
 </main>
 </div>
 )
}
