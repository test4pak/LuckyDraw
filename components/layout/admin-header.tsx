"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import Link from "next/link";

export function AdminHeader() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        // Admin panel uses admin table, not users table
        // Just use auth user info
        setUser({
          email: authUser.email || "Admin",
          name: authUser.user_metadata?.name || authUser.email || "Admin",
        });
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-sm text-slate-400">Event & Prize Management System</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            )}
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

