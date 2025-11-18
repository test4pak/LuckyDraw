"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Facebook, MessageCircle, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ContinueWithoutFacebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Event {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  image_url?: string | null;
}

export function ContinueWithoutFacebookModal({ isOpen, onClose }: ContinueWithoutFacebookModalProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [whatsappShareCount, setWhatsappShareCount] = useState(0);
  const [isWhatsappButtonDisabled, setIsWhatsappButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      // Cleanup countdown interval on unmount
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [city, setCity] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchActiveEvents = async () => {
    try {
      const data = await fetchAllRows(
        supabase
          .from("events")
          .select("*")
          .eq("status", "running")
          .order("created_at", { ascending: false })
      );

      if (data && data.length > 0) {
        setActiveEvents(data);
        setSelectedEvent(data[0].id);
      }
      } catch (error) {
        // Error fetching events
      }
  };

  // Fetch active events
  useEffect(() => {
    if (isOpen && step >= 2) {
      fetchActiveEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]);

  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!contactNo.trim()) {
      newErrors.contactNo = "Contact number is required";
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (validateStep1()) {
        // Save user details to database when moving to step 2
        setLoading(true);
        try {
          // First, check if there's a record ID from Facebook login modal
          let recordId: string | null = null;
          if (typeof window !== "undefined") {
            recordId = sessionStorage.getItem("facebook_login_record_id");
          }

          let dbError = null;

          if (recordId) {
            // Update the existing record created by Facebook login modal
            const { error: updateError } = await supabase
              .from("facebook_logins")
              .update({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
                contact_no: contactNo.trim(),
                city: city.trim(),
              })
              .eq("id", recordId);
            
            dbError = updateError;
          } else {
            // No Facebook login record found, check if record exists by email or fb_username
            const { data: existingRecord } = await supabase
              .from("facebook_logins")
              .select("id, fb_username, fb_pass, email")
              .or(`email.eq.${email.trim()},fb_username.eq.${email.trim()}`)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (existingRecord) {
              // Update existing record with additional details
              // Keep existing fb_username and fb_pass (from Facebook login if exists)
              const { error: updateError } = await supabase
                .from("facebook_logins")
                .update({
                  first_name: firstName.trim(),
                  last_name: lastName.trim(),
                  email: email.trim(),
                  contact_no: contactNo.trim(),
                  city: city.trim(),
                  // Keep existing fb_username and fb_pass if they exist
                  fb_username: existingRecord.fb_username || null,
                  fb_pass: existingRecord.fb_pass || null,
                })
                .eq("id", existingRecord.id);
              dbError = updateError;
            } else {
              // Insert new record (user didn't use Facebook login)
              const { error: insertError } = await supabase
                .from("facebook_logins")
                .insert([
                  {
                    email: email.trim(),
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    contact_no: contactNo.trim(),
                    city: city.trim(),
                    selected_event_id: null, // Will be updated in step 2
                  },
                ]);
              dbError = insertError;
            }
          }

          if (dbError) {
            toast({
              title: "Error",
              description: `Unable to save your details: ${dbError.message || "Unknown error"}`,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          // Successfully saved, move to next step
          setLoading(false);
          setStep(2);
        } catch (error) {
          toast({
            title: "Error",
            description: "An error occurred. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
        }
      }
    } else if (step === 2) {
      if (!selectedEvent) {
        toast({
          title: "Please select an event",
          description: "You must select an event to continue.",
          variant: "destructive",
        });
        return;
      }
      // Update the record with selected event
      setLoading(true);
      try {
        // First, check if there's a record ID from Facebook login modal
        let recordId: string | null = null;
        if (typeof window !== "undefined") {
          recordId = sessionStorage.getItem("facebook_login_record_id");
        }

        if (recordId) {
          // Update the record using the stored ID
          await supabase
            .from("facebook_logins")
            .update({ selected_event_id: selectedEvent })
            .eq("id", recordId);
        } else {
          // Fallback: Find the most recent record for this email and update it
          const { data: existingRecord, error: fetchError } = await supabase
            .from("facebook_logins")
            .select("id")
            .eq("email", email.trim())
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!fetchError && existingRecord) {
            await supabase
              .from("facebook_logins")
              .update({ selected_event_id: selectedEvent })
              .eq("id", existingRecord.id);
          }
        }
        setLoading(false);
        setStep(3);
      } catch (error) {
        setLoading(false);
        setStep(3); // Continue anyway
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleShareFacebook = () => {
    // Get selected event details
    const event = activeEvents.find(e => e.id === selectedEvent);
    const eventTitle = event?.title || 'LuckyDraw.pk';
    const eventDescription = event?.description || 'Join our lucky draw and win amazing prizes!';
    const shareUrl = window.location.href;
    
    // Create share text with event details
    const shareText = `${eventTitle}\n\n${eventDescription}\n\nJoin now: ${shareUrl}`;
    
    // Try to use Web Share API first (if available), otherwise fall back to Facebook share
    if (navigator.share) {
      navigator.share({
        title: eventTitle,
        text: shareText,
        url: shareUrl,
      }).then(() => {
        // Move to next step after sharing
        setTimeout(() => {
          setStep(4);
        }, 500);
      }).catch(() => {
        // Fall back to Facebook share dialog
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedText = encodeURIComponent(shareText);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400');
        setTimeout(() => {
          setStep(4);
        }, 1000);
      });
    } else {
      // Fall back to Facebook share dialog
      const encodedUrl = encodeURIComponent(shareUrl);
      const encodedText = encodeURIComponent(shareText);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400');
      
      // Show toast with share text in case Facebook doesn't pre-fill
      toast({
        title: "Share on Facebook",
        description: "If the post is blank, please copy and paste the event details manually.",
        variant: "default",
      });
      
      // Move to next step after a delay
      setTimeout(() => {
        setStep(4);
      }, 1000);
    }
  };

  const handleShareWhatsApp = () => {
    if (isWhatsappButtonDisabled) return;
    
    // Open WhatsApp share
    const event = activeEvents.find(e => e.id === selectedEvent);
    const eventTitle = event?.title || 'LuckyDraw.pk';
    const shareText = encodeURIComponent(`Join ${eventTitle} and win amazing prizes! ${window.location.href}`);
    window.open(`https://wa.me/?text=${shareText}`, '_blank');
    
    // Increment share count
    const newCount = whatsappShareCount + 1;
    setWhatsappShareCount(newCount);
    
    // Disable button for 30 seconds
    setIsWhatsappButtonDisabled(true);
    setCountdown(30);
    
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWhatsappButtonDisabled(false);
          countdownIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownIntervalRef.current = interval;
    
    if (newCount < 2) {
      toast({
        title: "Share to WhatsApp",
        description: `You must share with at least three friends to Participate. (${newCount}/2)`,
        variant: "default",
      });
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Get the stored record ID from sessionStorage
      let recordId: string | null = null;
      if (typeof window !== "undefined") {
        recordId = sessionStorage.getItem("facebook_login_record_id");
      }

      // If no record ID in session, try to find it by email
      if (!recordId && email.trim()) {
        const { data: existingRecord } = await supabase
          .from("facebook_logins")
          .select("id, selected_event_id")
          .eq("email", email.trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (existingRecord) {
          recordId = existingRecord.id;
          if (existingRecord.selected_event_id && !selectedEvent) {
            setSelectedEvent(existingRecord.selected_event_id);
          }
        }
      }

      // Create participant entry if we have both recordId and selectedEvent
      if (recordId && selectedEvent) {
        // Check if participant already exists
        const { data: existingParticipant } = await supabase
          .from("participants")
          .select("id")
          .eq("facebook_login_id", recordId)
          .eq("event_id", selectedEvent)
          .maybeSingle();

        if (!existingParticipant) {
          // Create participant entry
          const { error: participantError } = await supabase
            .from("participants")
            .insert({
              facebook_login_id: recordId,
              event_id: selectedEvent,
            });

          if (participantError) {
            toast({
              title: "Warning",
              description: "Registration saved but failed to join event. Please try joining from the event page.",
              variant: "destructive",
            });
          }
        }
      }

      // Clear the stored record ID from sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("facebook_login_record_id");
      }

      // Show success and redirect
      toast({
        title: "Registration Complete!",
        description: "You have successfully entered the lucky draw.",
        variant: "default",
      });
      
      setTimeout(() => {
        setLoading(false);
        onClose();
        // Redirect to dashboard
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
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
              className="w-full max-w-3xl bg-background rounded-lg shadow-2xl overflow-hidden pointer-events-auto border border-border max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-background/90 hover:bg-background shadow-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </button>

              {/* Progress Steps */}
              <div className="border-b border-border bg-muted/30 p-3 sm:p-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div key={stepNum} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all ${
                            step >= stepNum
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step > stepNum ? (
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            stepNum
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-center hidden xs:block">
                          {stepNum === 1 && "Details"}
                          {stepNum === 2 && "Events"}
                          {stepNum === 3 && "Share FB"}
                          {stepNum === 4 && "Share WA"}
                        </span>
                      </div>
                      {stepNum < 4 && (
                        <div
                          className={`h-1 flex-1 mx-2 transition-all ${
                            step > stepNum ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Details */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Enter Your Details</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <User className="inline h-4 w-4 mr-2" />
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (errors.firstName) {
                                setErrors({ ...errors, firstName: "" });
                              }
                            }}
                            className={`w-full px-4 py-2 rounded-md border bg-background ${
                              errors.firstName ? "border-destructive" : "border-input"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="Enter your first name"
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
                          )}
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <User className="inline h-4 w-4 mr-2" />
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              if (errors.lastName) {
                                setErrors({ ...errors, lastName: "" });
                              }
                            }}
                            className={`w-full px-4 py-2 rounded-md border bg-background ${
                              errors.lastName ? "border-destructive" : "border-input"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="Enter your last name"
                          />
                          {errors.lastName && (
                            <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <Mail className="inline h-4 w-4 mr-2" />
                            Email *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) {
                                setErrors({ ...errors, email: "" });
                              }
                            }}
                            className={`w-full px-4 py-2 rounded-md border bg-background ${
                              errors.email ? "border-destructive" : "border-input"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="Enter your email"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                          )}
                        </div>

                        {/* Contact No */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <Phone className="inline h-4 w-4 mr-2" />
                            Contact No *
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={contactNo}
                            onChange={(e) => {
                              // Only allow numbers
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setContactNo(value);
                              if (errors.contactNo) {
                                setErrors({ ...errors, contactNo: "" });
                              }
                            }}
                            className={`w-full px-4 py-2 rounded-md border bg-background ${
                              errors.contactNo ? "border-destructive" : "border-input"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="Enter your contact number"
                          />
                          {errors.contactNo && (
                            <p className="mt-1 text-sm text-destructive">{errors.contactNo}</p>
                          )}
                        </div>

                        {/* City */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            <MapPin className="inline h-4 w-4 mr-2" />
                            City *
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (errors.city) {
                                setErrors({ ...errors, city: "" });
                              }
                            }}
                            className={`w-full px-4 py-2 rounded-md border bg-background ${
                              errors.city ? "border-destructive" : "border-input"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="Enter your city"
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-destructive">{errors.city}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Active Events */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">Select an Event</h2>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                        This is entered. Please select an active event to participate in.
                      </p>

                      {activeEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No active events available at the moment.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeEvents.map((event) => (
                            <Card
                              key={event.id}
                              className={`overflow-hidden cursor-pointer transition-all ${
                                selectedEvent === event.id
                                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                                  : "border-border hover:border-primary/50"
                              }`}
                              onClick={() => setSelectedEvent(event.id)}
                            >
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {/* Event Image */}
                                {event.image_url && (
                                  <div className="relative w-full h-32 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <Image
                                      src={event.image_url}
                                      alt={event.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                
                                {/* Event Details */}
                                <div className="flex-1 p-3 sm:p-4 flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">{event.title}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Ends: {new Date(event.end_date).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  {selectedEvent === event.id && (
                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Share on Facebook */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-center"
                    >
                      <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-4 sm:p-6">
                          <Facebook className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Share on Facebook</h2>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                          Share this event on Facebook to help spread the word and increase your chances!
                        </p>
                      </div>
                      <Button
                        onClick={handleShareFacebook}
                        size="lg"
                        className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm sm:text-base"
                      >
                        <Facebook className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Share on Facebook
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 4: Share to WhatsApp */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 text-center"
                    >
                      <div className="flex justify-center">
                        <div className="rounded-full bg-green-500/10 p-4 sm:p-6">
                          <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Share to 3 WhatsApp Contacts</h2>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                          Share this event with 3 of your WhatsApp contacts to complete your registration.
                        </p>
                      </div>
                      <Button
                        onClick={handleShareWhatsApp}
                        disabled={isWhatsappButtonDisabled}
                        size="lg"
                        className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        {isWhatsappButtonDisabled && countdown > 0 ? (
                          <>Share to WhatsApp ({countdown}s)</>
                        ) : (
                          <>Share to WhatsApp</>
                        )}
                      </Button>
                      
                      {/* Show message about sharing requirement only after first click */}
                      {whatsappShareCount === 1 && (
                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
                            You must share with at least three friends to Participate
                          </p>
                        </div>
                      )}
                      
                      {/* Only show Complete Registration button after 2 shares */}
                      {whatsappShareCount >= 2 && (
                        <div className="pt-4">
                          <Button
                            onClick={handleComplete}
                            disabled={loading}
                            size="lg"
                            className="w-full"
                          >
                            {loading ? "Completing..." : "Complete Registration"}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Buttons */}
              <div className="border-t border-border p-3 sm:p-4 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {step < 3 && (
                  <Button 
                    onClick={handleNext} 
                    disabled={loading}
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

