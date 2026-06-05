"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-gray-800 p-10 shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="flex justify-center mb-4 text-blue-500">
            <Activity size={48} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Reset Password</h2>
          <p className="mt-2 text-gray-400">We'll send you a link to your email</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleReset}>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block tracking-wider">Email Address</label>
            <input
              type="email"
              required
              className="block w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/login" className="inline-flex items-center gap-2 font-bold text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
