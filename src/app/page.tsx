import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3, Shield, Users, FileText, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">Sanjeev Atri</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/5 hover:text-primary">Log in</Button>
              </Link>
              <Link href="/login">
                <Button className="shadow-lg shadow-primary/20">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 animate-fade-in border border-primary/20">
            <Sparkles className="w-4 h-4" />
            The modern form builder you deserve
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up leading-tight">
            Create forms that
            <span className="gradient-text"> convert</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Build beautiful surveys, quizzes, and forms with our drag-and-drop builder.
            Get insights with powerful analytics and conditional logic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/login">
              <Button size="xl" className="h-14 px-8 text-lg shadow-xl shadow-primary/25 rounded-2xl">
                Start for free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="xl" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-2 hover:bg-secondary/50">
                See demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8 font-medium">
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
              Join thousands of users who trust Sanjeev Atri for their data collection needs.
            </p>
            <Link href="/login">
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
            <span className="font-semibold">Sanjeev Atri</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sanjeev Atri. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
