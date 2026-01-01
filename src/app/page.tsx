import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3, Shield, Users, FileText, Sparkles, Copy, Terminal, Code, Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Sanjeev Atri</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/8 hover:text-primary font-semibold">Log in</Button>
              </Link>
              <Link href="/login">
                <Button className="shadow-md hover:shadow-lg shadow-primary/15">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-br from-primary/8 to-blue-400/6 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-300/6 to-primary/5 rounded-full blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/12 rounded-full text-primary text-sm font-semibold mb-8 animate-fade-in border border-primary/25 shadow-sm">
            <Sparkles className="w-4 h-4" />
            The modern form builder you deserve
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up leading-[1.1]">
            Create forms that{" "}
            <span className="gradient-text">convert</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Build beautiful surveys, quizzes, and forms with our drag-and-drop builder.
            Get insights with powerful analytics and conditional logic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/login">
              <Button size="xl" className="h-14 px-10 text-lg shadow-lg hover:shadow-xl rounded-xl font-semibold">
                Start for free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="xl" variant="outline" className="h-14 px-10 text-lg rounded-xl border-2 font-semibold">
                See demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8 font-semibold">
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
                className="group p-7 rounded-xl bg-white border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30"
              >
                <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2.5 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Started
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              To start building your first form, follow these simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">1</span>
              </div>

              <div className="mt-12 mb-4">
                <h3 className="text-white font-bold text-lg mb-2">Sign up for free</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Start by creating your account in your existing project.
                </p>
              </div>

              <div className="relative bg-slate-950 rounded-lg p-4 border border-slate-700 group-hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-500 font-mono">bash</span>
                </div>
                <code className="text-sm font-mono text-emerald-400 block">
                  npm create forms-app
                </code>
                <button className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-slate-800 transition-colors group/copy">
                  <Copy className="w-4 h-4 text-slate-400 group-hover/copy:text-white" />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">2</span>
              </div>

              <div className="mt-12 mb-4">
                <h3 className="text-white font-bold text-lg mb-2">Create your form</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Import and use the form builder component into your app's layout or page.
                </p>
              </div>

              <div className="relative bg-slate-950 rounded-lg p-4 border border-slate-700 group-hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-500 font-mono">tsx</span>
                </div>
                <code className="text-sm font-mono block space-y-1">
                  <span className="text-purple-400">import</span>{" "}
                  <span className="text-slate-300">{'{'}</span>{" "}
                  <span className="text-blue-300">FormBuilder</span>{" "}
                  <span className="text-slate-300">{'}'}</span>{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-400">"@/components"</span>
                </code>
                <button className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-slate-800 transition-colors group/copy">
                  <Copy className="w-4 h-4 text-slate-400 group-hover/copy:text-white" />
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">3</span>
              </div>

              <div className="mt-12 mb-4">
                <h3 className="text-white font-bold text-lg mb-2">Deploy & Share</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Deploy your form and start collecting responses from your users.
                </p>
              </div>

              <div className="relative bg-slate-950 rounded-lg p-4 border border-slate-700 group-hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-500 font-mono">info</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  If you don't see responses after 30 seconds, check for blockers and navigate between pages.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              For full examples and further reference, please refer to our{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                documentation
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-br from-primary via-blue-500 to-blue-600 text-white shadow-premium-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                Ready to create your first form?
              </h2>
              <p className="text-lg text-blue-50/90 mb-8 leading-relaxed">
                Join thousands of users who trust Sanjeev Atri for their data collection needs.
              </p>
              <Link href="/login">
                <Button size="xl" variant="secondary" className="shadow-lg hover:shadow-xl bg-white hover:bg-gray-50 text-primary font-semibold">
                  Get started for free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
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
