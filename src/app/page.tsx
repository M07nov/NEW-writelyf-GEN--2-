import Link from "next/link";
import { Heart, Upload, Brain, Users, Clock, FileText, QrCode, Shield, ChevronRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900">Writelyf</span>
              <span className="text-xs text-gray-400 block leading-none">HealthOS</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="#features" className="hover:text-brand-red transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-brand-red transition-colors">Pricing</Link>
            <Link href="#safety" className="hover:text-brand-red transition-colors">Safety</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-brand-red font-medium">Sign in</Link>
            <Link href="/signup" className="btn-primary py-2 px-4 text-sm">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-red-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-100 text-brand-red px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Heart size={14} />
            Your family&apos;s health memory, organized by AI
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Your family&apos;s health
            <span className="text-brand-red"> memory</span>,
            <br />organized by AI.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload reports, prescriptions, and medical files. Writelyf organizes them, explains key values, builds a health timeline, and creates doctor-ready summaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              Start Free — No Credit Card <ChevronRight size={18} />
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-4">
              See How It Works
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">Free forever for 1 family profile · 5 records</p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Your family&apos;s health records are scattered across WhatsApp, dusty files, old emails, and hospital drawers. When you need them most — at a doctor&apos;s office or in an emergency — you can never find them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { emoji: "📁", title: "Scattered Files", desc: "Reports in different apps, folders, and devices" },
              { emoji: "😕", title: "Confusing Values", desc: "Lab results with numbers you don't understand" },
              { emoji: "🏥", title: "Unprepared Visits", desc: "Going to the doctor without proper medical history" },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything your family needs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">One organized, intelligent health hub for your entire family.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Upload className="w-6 h-6" />,
                color: "bg-blue-100 text-blue-600",
                title: "Health Vault",
                desc: "Upload and organize lab reports, prescriptions, discharge summaries, and more. Search and filter instantly.",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                color: "bg-purple-100 text-purple-600",
                title: "AI Report Reader",
                desc: "AI explains your lab values in plain language, highlights what needs attention, and suggests questions for your doctor.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                color: "bg-green-100 text-green-600",
                title: "Family Profiles",
                desc: "Separate health profiles for parents, grandparents, children, and spouse. One account, whole family covered.",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                color: "bg-orange-100 text-orange-600",
                title: "Health Timeline",
                desc: "Every upload and AI finding appears in a chronological timeline. See your family's health story at a glance.",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                color: "bg-red-100 text-red-600",
                title: "Doctor Summary",
                desc: "Generate a structured summary before every visit. Share complaints, history, and questions — organized and ready.",
              },
              {
                icon: <QrCode className="w-6 h-6" />,
                color: "bg-teal-100 text-teal-600",
                title: "Emergency QR Card",
                desc: "One QR code. Scan in emergency to see blood group, allergies, medications, and emergency contact. No app needed.",
              },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="py-16 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield size={14} />
            Built with safety first
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI is a tool, not a doctor</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Writelyf AI explains and organizes — it does not diagnose, prescribe, or replace medical advice. Every AI output includes a clear disclaimer. We always recommend consulting a registered medical practitioner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "✅", text: "Explains lab values in plain language" },
              { icon: "✅", text: "Highlights values outside reference range" },
              { icon: "✅", text: "Suggests questions to ask your doctor" },
              { icon: "❌", text: "Never diagnoses conditions" },
              { icon: "❌", text: "Never prescribes medications" },
              { icon: "❌", text: "Never replaces a real doctor" },
            ].map(({ icon, text }) => (
              <div key={text} className="bg-white rounded-xl p-4 flex items-center gap-3 text-sm">
                <span className="text-lg">{icon}</span>
                <span className="text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, honest pricing</h2>
          <p className="text-gray-500 mb-10">Start free. Upgrade when you&apos;re ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Free", price: "₹0", sub: "forever",
                features: ["1 family profile", "5 record uploads", "Emergency QR card", "Basic health vault"],
                cta: "Start Free", ctaStyle: "btn-secondary w-full justify-center",
              },
              {
                name: "Plus", price: "₹999", sub: "/year · launch price",
                features: ["Unlimited uploads", "AI report summaries", "Health timeline", "Doctor summary PDF", "Emergency QR card"],
                cta: "Get Plus", ctaStyle: "btn-primary w-full justify-center", popular: true,
              },
              {
                name: "Family", price: "₹2,999", sub: "/year",
                features: ["5 family profiles", "All Plus features", "Advanced timeline", "Multiple emergency cards"],
                cta: "Get Family", ctaStyle: "btn-secondary w-full justify-center",
              },
            ].map(({ name, price, sub, features, cta, ctaStyle, popular }) => (
              <div key={name} className={`rounded-2xl border p-6 ${popular ? "border-brand-red shadow-lg relative" : "border-gray-200"}`}>
                {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-red text-white text-xs px-3 py-1 rounded-full">Most Popular</div>}
                <p className="font-bold text-gray-900 mb-1">{name}</p>
                <div className="mb-4">
                  <span className="text-3xl font-black text-gray-900">{price}</span>
                  <span className="text-gray-400 text-sm"> {sub}</span>
                </div>
                <ul className="space-y-2 mb-6 text-left">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={ctaStyle}>{cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-brand-red to-brand-red-dark text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start organizing your family&apos;s health today</h2>
          <p className="text-red-200 mb-8">Free forever. No credit card. 2 minutes to set up.</p>
          <Link href="/signup" className="bg-white text-brand-red px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors inline-flex items-center gap-2">
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-red rounded flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-semibold">Writelyf HealthOS</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/legal/medical-disclaimer" className="hover:text-white transition-colors">Medical Disclaimer</Link>
          </div>
          <p className="text-xs">© 2026 Writelyf. Made with ❤️ for Indian families.</p>
        </div>
      </footer>
    </div>
  );
}
