"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      alert("Signup failed: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/dashboard");
    } catch (error: any) {
      alert("Google login failed: " + error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-gray-800 p-10 shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="flex justify-center mb-4 text-blue-500">
            <Activity size={48} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="mt-2 text-gray-400">Join the IoT Telemetry Network</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSignup}>
          <div className="space-y-4">
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
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block tracking-wider">Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block tracking-wider">Confirm Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none transition-all"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">Or continue with</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-4 py-4 text-sm font-bold text-white hover:bg-gray-800 transition-all"
        >
          Sign in with Google
        </button>

        <p className="text-center text-sm text-gray-400 mt-8">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-500 hover:text-blue-400">Log In</Link>
        </p>
      </div>
    </div>
  );
}
