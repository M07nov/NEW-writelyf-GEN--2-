import Link from "next/link";
import { Heart, AlertTriangle } from "lucide-react";

export default function MedicalDisclaimerPage() {
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
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 mb-1">Important Medical Disclaimer</p>
            <p className="text-amber-700 text-sm">Please read this carefully before using Writelyf HealthOS.</p>
          </div>
        </div>

        <div className="prose prose-gray">
          <h1>Medical Disclaimer</h1>
          <p><em>Last updated: June 2026</em></p>

          <h2>Not a Medical Service</h2>
          <p>Writelyf HealthOS is a <strong>personal health record management and AI document summarization tool</strong>. It is not a medical service, healthcare provider, hospital, clinic, or telemedicine platform.</p>

          <h2>AI Summaries Are Educational Only</h2>
          <p>When you use the AI Report Reader feature:</p>
          <ul>
            <li>AI summaries are generated for <strong>educational and organizational purposes only</strong></li>
            <li>They are designed to help you understand and organize your documents</li>
            <li>They are <strong>NOT</strong> medical diagnoses</li>
            <li>They are <strong>NOT</strong> treatment recommendations</li>
            <li>They are <strong>NOT</strong> prescription guidance</li>
            <li>They do <strong>NOT</strong> replace consultation with a registered medical practitioner</li>
          </ul>

          <h2>Always Consult a Doctor</h2>
          <p>For any health concerns, symptoms, medication decisions, or interpretation of medical results, please consult a registered medical practitioner (doctor, specialist, or licensed healthcare professional).</p>

          <h2>Emergency Situations</h2>
          <p>In a medical emergency, call emergency services (112 in India) immediately. Do not rely on Writelyf HealthOS for emergency medical decisions.</p>

          <h2>Emergency Cards</h2>
          <p>The Emergency Card feature provides basic health information to assist first responders. However, it is not a substitute for professional medical assessment and should be used only as supplementary information.</p>

          <h2>Accuracy of Information</h2>
          <p>The accuracy of AI summaries depends on the quality and readability of uploaded documents. AI may make errors. Always verify important medical information with your doctor.</p>

          <h2>Our Commitment</h2>
          <p>We are committed to building technology that empowers patients to be better organized and informed — without ever claiming to replace the expertise and judgment of medical professionals.</p>
        </div>
      </div>
    </div>
  );
}
