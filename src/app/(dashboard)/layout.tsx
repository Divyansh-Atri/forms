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
    { href: "/templates", label: "Templates", icon: LayoutDashboard },
    { href: "/team", label: "Team", icon: Users },
    { href: "/integrations", label: "Integrations", icon: Webhook },
    { href: "/settings", label: "Settings", icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-50 shadow-sm">
                <div className="flex items-center justify-between h-full px-4 lg:px-6">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-gray-700 dark:text-slate-200" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-700 dark:text-slate-200" />
                            )}
                        </button>

                        {/* Logo */}
                        <Link href="/forms" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg hidden sm:block text-gray-900 dark:text-white">SanjeevForms</span>
                        </Link>

                        {/* Workspace selector */}
                        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-200">My Workspace</span>
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search forms..."
                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <Link href="/forms/new">
                            <Button size="sm" className="hidden sm:flex">
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

                        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <Bell className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium shadow-sm">
                                SA
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop & Mobile */}
            <aside className={cn(
                "fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-40 transition-transform duration-300 shadow-sm",
                "lg:translate-x-0",
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
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700">
                    <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors">
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
