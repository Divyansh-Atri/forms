"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
    Search
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

    return (
        <div className="min-h-screen bg-black">
            {/* Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-800 z-50">
                <div className="flex items-center justify-between h-full px-4 lg:px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <Link href="/forms" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg hidden sm:block text-white">Sanjeev Atri</span>
                        </Link>

                        {/* Workspace selector */}
                        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-sm font-medium text-white">My Workspace</span>
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
                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
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

                        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                JD
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="fixed top-16 left-0 bottom-0 w-64 bg-black border-r border-gray-800 hidden lg:block">
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
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
