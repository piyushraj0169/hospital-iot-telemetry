import Link from "next/link";
import { Activity, Heart, Shield, Cpu, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Activity className="text-blue-500" size={32} />
          <span className="text-2xl font-bold tracking-tight">Hospital IoT</span>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 hover:text-blue-400 transition-colors">Login</Link>
          <Link href="/signup" className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors font-medium">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Real-time Telemetry for <span className="text-blue-500">Modern Healthcare</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Monitor patient vitals with millisecond precision. Integrated AI anomaly detection and clinical decision support for enterprise hospitals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup" className="px-8 py-4 bg-blue-600 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            Register Institution <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-gray-800 rounded-xl text-lg font-bold hover:bg-gray-700 transition-all">
            View Demo Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-800">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="p-8 bg-gray-800/50 rounded-3xl border border-gray-700 hover:border-blue-500/50 transition-colors">
            <Heart className="text-red-500 mb-6" size={40} />
            <h3 className="text-2xl font-bold mb-4">Live Vitals</h3>
            <p className="text-gray-400 leading-relaxed">
              Proprietary real-time stream for HR, SpO2, BP, and Temperature. Sub-second latency across all connected medical devices.
            </p>
          </div>
          <div className="p-8 bg-gray-800/50 rounded-3xl border border-gray-700 hover:border-blue-500/50 transition-colors">
            <Cpu className="text-purple-500 mb-6" size={40} />
            <h3 className="text-2xl font-bold mb-4">AI Explainer</h3>
            <p className="text-gray-400 leading-relaxed">
              LLM-powered clinical analysis. Automatically explains anomalies and provides immediate nursing recommendations.
            </p>
          </div>
          <div className="p-8 bg-gray-800/50 rounded-3xl border border-gray-700 hover:border-blue-500/50 transition-colors">
            <Shield className="text-green-500 mb-6" size={40} />
            <h3 className="text-2xl font-bold mb-4">Enterprise Security</h3>
            <p className="text-gray-400 leading-relaxed">
              HIPAA-compliant data encryption. Role-based access control for doctors, nurses, and hospital administration.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© 2026 Hospital IoT Telemetry System. Built for Capgemini Healthcare Solutions.</p>
      </footer>
    </div>
  );
}
