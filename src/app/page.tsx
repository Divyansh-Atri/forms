import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3, Shield, Users, FileText, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">Forms</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            The modern form builder you deserve
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Create forms that
            <span className="gradient-text"> convert</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Build beautiful surveys, quizzes, and forms with our drag-and-drop builder.
            Get insights with powerful analytics and conditional logic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/signup">
              <Button size="xl" className="shadow-lg shadow-primary/25">
                Start for free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="xl" variant="outline">
                See demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free forever plan
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to collect data
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that help you create engaging forms and get actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "20+ Question Types",
                description: "From simple text to advanced matrix, ranking, and signature capture.",
                color: "from-yellow-400 to-orange-500",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Track responses, completion rates, and drop-off with beautiful charts.",
                color: "from-green-400 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Conditional Logic",
                description: "Show or hide questions based on previous answers. Create smart forms.",
                color: "from-blue-400 to-indigo-500",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Invite team members with different roles. Edit forms together.",
                color: "from-purple-400 to-pink-500",
              },
              {
                icon: FileText,
                title: "Quiz Mode",
                description: "Create quizzes with scoring, feedback, and leaderboards.",
                color: "from-red-400 to-rose-500",
              },
              {
                icon: Sparkles,
                title: "Beautiful Themes",
                description: "Customize colors, fonts, and backgrounds. Make it your brand.",
                color: "from-cyan-400 to-teal-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to create your first form?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of users who trust Forms for their data collection needs.
            </p>
            <Link href="/signup">
              <Button size="xl" variant="secondary" className="shadow-lg">
                Get started for free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold">Forms</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Forms. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
