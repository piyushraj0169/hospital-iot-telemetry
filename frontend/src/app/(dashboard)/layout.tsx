"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Users, Bell } from "lucide-react";
import { AlertNotifier } from "@/components/AlertNotifier";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" theme="dark" />
      <AlertNotifier />
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-800/50 p-6">
        <div className="mb-10 text-xl font-bold">Hospital IoT</div>
        <nav className="space-y-4">
          <Link href="/dashboard" className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-700">
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          <Link href="/patients" className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-700">
            <Users size={20} /> <span>Patients</span>
          </Link>
          <Link href="/alerts" className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-700">
            <Bell size={20} /> <span>Alert Center</span>
          </Link>
        </nav>
        <button 
          onClick={() => signOut(auth)}
          className="mt-20 flex items-center space-x-3 text-red-400 hover:text-red-300"
        >
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
