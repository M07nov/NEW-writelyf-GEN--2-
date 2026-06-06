import Link from "next/link";
import { Heart } from "lucide-react";

export default function TermsPage() {
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
        <h1>Terms of Use</h1>
        <p><em>Last updated: June 2026</em></p>
        <h2>1. Acceptance</h2>
        <p>By using Writelyf HealthOS, you agree to these Terms. If you do not agree, do not use the service.</p>
        <h2>2. Service Description</h2>
        <p>Writelyf HealthOS is a personal health record management application. It allows users to store, organize, and get AI-assisted explanations of health documents.</p>
        <h2>3. Not Medical Advice</h2>
        <p>Writelyf HealthOS is NOT a medical service. AI-generated summaries are for educational and organizational purposes only and do not constitute medical advice, diagnosis, or treatment recommendations. Always consult a registered medical practitioner for medical decisions.</p>
        <h2>4. User Responsibilities</h2>
        <p>You are responsible for the accuracy of information you upload. You must not upload documents belonging to others without their explicit consent. You must be 18 years or older to use this service.</p>
        <h2>5. Account Security</h2>
        <p>You are responsible for maintaining the security of your account credentials. Report any unauthorized access immediately.</p>
        <h2>6. Intellectual Property</h2>
        <p>Your health records remain your property. You grant us a limited license to process and store them solely for the purpose of providing the service.</p>
        <h2>7. Termination</h2>
        <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time.</p>
        <h2>8. Limitation of Liability</h2>
        <p>Writelyf HealthOS is provided &quot;as is.&quot; We are not liable for medical outcomes, data loss, or any damages arising from use of the service.</p>
        <h2>9. Contact</h2>
        <p>For questions: legal@writelyf.com</p>
      </div>
    </div>
  );
}
