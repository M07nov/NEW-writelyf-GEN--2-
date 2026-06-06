import Link from "next/link";
import { CheckCircle, Heart } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Writelyf HealthOS</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-brand-red font-medium">Sign in</Link>
            <Link href="/signup" className="btn-primary py-2 px-4 text-sm">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-gray-500 text-lg">Start free. No credit card. Upgrade when your family grows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              name: "Free",
              price: "₹0",
              sub: "forever",
              desc: "For individuals just getting started",
              features: [
                "1 family profile",
                "5 record uploads",
                "Emergency QR card",
                "Basic health vault",
                "Health readiness score",
              ],
              notIncluded: ["AI report summaries", "Health timeline", "Doctor summary", "Multiple profiles"],
              cta: "Start Free",
              href: "/signup",
              style: "border-gray-200",
            },
            {
              name: "Plus",
              price: "₹999",
              sub: "/year · launch price",
              desc: "For individuals managing their own health",
              features: [
                "1 family profile",
                "Unlimited record uploads",
                "AI report summaries",
                "Health timeline",
                "Doctor summary PDF",
                "Emergency QR card",
                "Health readiness score",
              ],
              notIncluded: ["Multiple family profiles"],
              cta: "Coming Soon",
              href: "#",
              style: "border-brand-red shadow-xl",
              popular: true,
            },
            {
              name: "Family",
              price: "₹2,999",
              sub: "/year",
              desc: "For the whole family",
              features: [
                "5 family profiles",
                "Unlimited record uploads",
                "AI report summaries",
                "Health timeline",
                "Doctor summary PDF",
                "Multiple emergency cards",
                "Advanced timeline",
                "Health readiness score",
              ],
              notIncluded: [],
              cta: "Coming Soon",
              href: "#",
              style: "border-gray-200",
            },
          ].map(({ name, price, sub, desc, features, notIncluded, cta, href, style, popular }) => (
            <div key={name} className={`rounded-2xl border ${style} p-7 relative`}>
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-red text-white text-xs px-4 py-1.5 rounded-full font-semibold">
                  Most Popular
                </div>
              )}
              <p className="font-bold text-gray-900 text-lg mb-1">{name}</p>
              <div className="mb-2">
                <span className="text-4xl font-black text-gray-900">{price}</span>
                <span className="text-gray-400 text-sm"> {sub}</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">{desc}</p>
              <ul className="space-y-2.5 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {notIncluded.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400 line-through">
                    <span className="w-3.5 h-3.5 flex-shrink-0">✗</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={popular ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment coming soon</h2>
          <p className="text-gray-500">We&apos;re integrating Razorpay for seamless INR payments. For now, start free and we&apos;ll notify you when paid plans launch.</p>
        </div>
      </div>
    </div>
  );
}
