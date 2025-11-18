"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { FacebookLoginModal } from "@/components/auth/facebook-login-modal";
import { ContinueWithoutFacebookModal } from "@/components/auth/continue-without-facebook-modal";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const { hasLoginDataSaved, setHasLoginDataSaved } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch user profile from facebook_logins
        const { data: profile } = await supabase
          .from("facebook_logins")
          .select("id, first_name, last_name, email")
          .or(`email.eq.${user.email},fb_username.eq.${user.email}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (profile) {
          setUser({
            ...user,
            name: profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}` 
              : profile.first_name || profile.email || user.email,
            email: profile.email || user.email,
          });
        } else {
          setUser(user);
        }
        setIsAdmin(false); // Admin check is handled separately via admin table
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUser();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleFacebookLogin = async () => {
    // If login data was already saved, show continue without Facebook modal
    if (hasLoginDataSaved) {
      setIsContinueModalOpen(true);
      return;
    }
    
    // Open Facebook login modal for testing
    setIsFacebookModalOpen(true);
    
    // Uncomment below for actual Facebook OAuth:
    // if (typeof window !== "undefined") {
    //   await supabase.auth.signInWithOAuth({
    //     provider: "facebook",
    //     options: {
    //       redirectTo: `${window.location.origin}/auth/callback`,
    //     },
    //   });
    // }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 glass-dark shadow-2xl shadow-black/10"
    >
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <Link href="/" className="flex items-center space-x-2">
          <Gift className="h-6 w-6 text-primary" />
          <motion.span 
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-blue-400 to-purple-600 bg-clip-text text-transparent"
          >
            <span className="hidden sm:inline">LuckyDraw.pk</span>
            <span className="sm:hidden">LuckyDraw</span>
          </motion.span>
        </Link>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
                  <Avatar>
                    <AvatarImage src={user.profile_pic} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Gift className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div>
              <Button onClick={handleFacebookLogin} className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border border-primary/30 shadow-lg shadow-primary/20 hover:glow-primary">
                {!hasLoginDataSaved && (
                  <svg
                    className="h-3 w-3 sm:h-4 sm:w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="hidden sm:inline">{hasLoginDataSaved ? "Continue without Facebook" : "Login with Facebook"}</span>
                <span className="sm:hidden">{hasLoginDataSaved ? "Continue" : "Login"}</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Facebook Login Modal */}
      <FacebookLoginModal 
        isOpen={isFacebookModalOpen} 
        onClose={() => setIsFacebookModalOpen(false)}
        onDataSaved={() => {
          setHasLoginDataSaved(true);
        }}
      />
      
      {/* Continue Without Facebook Modal */}
      <ContinueWithoutFacebookModal
        isOpen={isContinueModalOpen}
        onClose={() => setIsContinueModalOpen(false)}
      />
    </motion.nav>
  );
}

