import Link from "next/link";
import { Heart } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Writelyf HealthOS</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 prose prose-gray">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: June 2026</em></p>
        <h2>1. What We Collect</h2>
        <p>We collect information you provide directly to us, including your name, email address, and the health records and information you upload. We also collect usage data such as pages visited and features used.</p>
        <h2>2. How We Use Your Information</h2>
        <p>We use your information to provide and improve the Writelyf HealthOS service, including AI summarization of medical documents, family health profile management, and health timeline generation.</p>
        <h2>3. Data Storage</h2>
        <p>Your health records and data are stored on Supabase infrastructure with industry-standard encryption at rest and in transit. Files are stored in private, authenticated storage buckets and are only accessible by you.</p>
        <h2>4. AI Processing</h2>
        <p>When you enable AI summarization, your document content is sent to OpenAI for processing. We do not store your data with OpenAI and their data retention policies apply to API usage.</p>
        <h2>5. Emergency Card</h2>
        <p>If you create an Emergency Card, selected health information is accessible via a public URL. You control what fields are visible and can disable the card at any time.</p>
        <h2>6. Data Sharing</h2>
        <p>We do not sell, rent, or share your personal or health data with any third parties for marketing or advertising purposes.</p>
        <h2>7. Your Rights</h2>
        <p>You have the right to access, correct, export, or delete your data at any time. Contact us at privacy@writelyf.com for data requests.</p>
        <h2>8. Contact</h2>
        <p>For privacy concerns, email: privacy@writelyf.com</p>
      </div>
    </div>
  );
}
