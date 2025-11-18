"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Users, Trophy, Shield, CheckCircle2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows, getAccurateCount } from "@/lib/supabase-helpers";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FacebookLoginModal } from "@/components/auth/facebook-login-modal";
import { ContinueWithoutFacebookModal } from "@/components/auth/continue-without-facebook-modal";
import { useAuth } from "@/contexts/auth-context";

// Gradient configurations for prize cards
const gradientConfigs = [
  { borderColor: "border-primary/20", hoverShadow: "hover:shadow-primary/20", hoverBorder: "hover:border-primary/40", gradient: "from-blue-500/20 to-cyan-500/20", gradientOverlay: "from-blue-500/10 to-transparent" },
  { borderColor: "border-purple-500/20", hoverShadow: "hover:shadow-purple-500/20", hoverBorder: "hover:border-purple-500/40", gradient: "from-purple-500/20 to-pink-500/20", gradientOverlay: "from-purple-500/10 to-transparent" },
  { borderColor: "border-orange-500/20", hoverShadow: "hover:shadow-orange-500/20", hoverBorder: "hover:border-orange-500/40", gradient: "from-yellow-500/20 to-orange-500/20", gradientOverlay: "from-orange-500/10 to-transparent" },
  { borderColor: "border-green-500/20", hoverShadow: "hover:shadow-green-500/20", hoverBorder: "hover:border-green-500/40", gradient: "from-green-500/20 to-emerald-500/20", gradientOverlay: "from-green-500/10 to-transparent" },
  { borderColor: "border-indigo-500/20", hoverShadow: "hover:shadow-indigo-500/20", hoverBorder: "hover:border-indigo-500/40", gradient: "from-indigo-500/20 to-blue-500/20", gradientOverlay: "from-indigo-500/10 to-transparent" },
  { borderColor: "border-rose-500/20", hoverShadow: "hover:shadow-rose-500/20", hoverBorder: "hover:border-rose-500/40", gradient: "from-rose-500/20 to-pink-500/20", gradientOverlay: "from-rose-500/10 to-transparent" },
];

type EventCard = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  borderColor: string;
  hoverShadow: string;
  hoverBorder: string;
  gradient: string;
  gradientOverlay: string;
  prize_count?: number;
  participant_count?: number;
};

export function Hero() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const { hasLoginDataSaved, setHasLoginDataSaved } = useAuth();
  const [eventCards, setEventCards] = useState<EventCard[]>([]);
  const [stats, setStats] = useState({
    activeEvents: 0,
    totalPrizes: 0,
    participants: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch events and stats from database
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch in browser environment
      if (typeof window === 'undefined') return;
      
      const supabase = createClient();
      try {
        // Fetch running events with images
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, title, description, image_url, status")
          .eq("status", "running")
          .not("image_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(6);

        if (eventsError) throw eventsError;

        // Transform events to event cards with counts
        if (eventsData && eventsData.length > 0) {
          const cardsWithCounts = await Promise.all(
            eventsData.map(async (event, index) => {
              const config = gradientConfigs[index % gradientConfigs.length];
              
              // Get participant and prize counts for this event
              const [participantsResult, prizesResult] = await Promise.all([
                supabase
                  .from("participants")
                  .select("id", { count: "exact", head: true })
                  .eq("event_id", event.id),
                supabase
                  .from("prizes")
                  .select("id", { count: "exact", head: true })
                  .eq("event_id", event.id),
              ]);

              // If count is null or there's an error, fetch all rows and count
              let participantCount = participantsResult.count ?? 0;
              let prizeCount = prizesResult.count ?? 0;

              // Fallback to fetching all rows if count query fails
              if (participantsResult.error || participantsResult.count === null) {
                const allParticipants = await fetchAllRows(
                  supabase.from("participants").select("id").eq("event_id", event.id)
                );
                participantCount = allParticipants.length;
              }

              if (prizesResult.error || prizesResult.count === null) {
                const allPrizes = await fetchAllRows(
                  supabase.from("prizes").select("id").eq("event_id", event.id)
                );
                prizeCount = allPrizes.length;
              }

              return {
                id: event.id,
                title: event.title,
                subtitle: event.description || "Join Now",
                image: event.image_url || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
                prize_count: prizeCount,
                participant_count: participantCount,
                ...config,
              };
            })
          );

          setEventCards(cardsWithCounts);
        }

        // Fetch stats
        const [activeEventsResult, participantsResult] = await Promise.all([
          supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "running"),
          supabase.from("participants").select("id", { count: "exact", head: true }),
        ]);

        // Get running event IDs first
        const runningEvents = await fetchAllRows(
          supabase
            .from("events")
            .select("id")
            .eq("status", "running")
        );

        const runningEventIds = runningEvents?.map(e => e.id) || [];

        // Count prizes only from running events
        let totalPrizesCount = 0;
        if (runningEventIds.length > 0) {
          const { count: prizesCount } = await supabase
            .from("prizes")
            .select("id", { count: "exact", head: true })
            .in("event_id", runningEventIds);
          
          totalPrizesCount = prizesCount ?? 0;
        }

        // Ensure counts are properly extracted
        const activeEventsCount = activeEventsResult.count ?? 0;
        const participantsCount = participantsResult.count ?? 0;

        setStats({
          activeEvents: activeEventsCount,
          totalPrizes: totalPrizesCount,
          participants: participantsCount,
        });
      } catch (error) {
        // Error fetching hero data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (eventCards.length === 0) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % eventCards.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [eventCards.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8,
      zIndex: 0,
    }),
    center: {
      zIndex: 10,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    if (eventCards.length === 0) return;
    setDirection(newDirection);
    if (newDirection === 1) {
      setCurrentIndex((prev) => (prev + 1) % eventCards.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + eventCards.length) % eventCards.length);
    }
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

  const floatingIcons = [
    { icon: Gift, delay: 0, x: "8%", y: "15%" },
    { icon: Trophy, delay: 0.15, x: "25%", y: "25%" },
    { icon: Star, delay: 0.3, x: "45%", y: "10%" },
    { icon: Gift, delay: 0.45, x: "65%", y: "20%" },
    { icon: Trophy, delay: 0.6, x: "85%", y: "30%" },
    { icon: Star, delay: 0.75, x: "92%", y: "50%" },
    { icon: Gift, delay: 0.9, x: "5%", y: "40%" },
    { icon: Trophy, delay: 1.05, x: "15%", y: "60%" },
    { icon: Star, delay: 1.2, x: "35%", y: "70%" },
    { icon: Gift, delay: 1.35, x: "55%", y: "80%" },
    { icon: Trophy, delay: 1.5, x: "75%", y: "75%" },
    { icon: Star, delay: 1.65, x: "90%", y: "85%" },
    { icon: Gift, delay: 1.8, x: "12%", y: "85%" },
    { icon: Trophy, delay: 1.95, x: "30%", y: "50%" },
    { icon: Star, delay: 2.1, x: "50%", y: "35%" },
    { icon: Gift, delay: 2.25, x: "70%", y: "45%" },
    { icon: Trophy, delay: 2.4, x: "88%", y: "65%" },
    { icon: Star, delay: 2.55, x: "18%", y: "35%" },
    { icon: Gift, delay: 2.7, x: "40%", y: "55%" },
    { icon: Trophy, delay: 2.85, x: "60%", y: "65%" },
  ];

  return (
    <React.Fragment>
      <section className="relative overflow-hidden gradient-mesh min-h-screen flex items-center">
      {/* Enhanced animated background shapes with 3D depth */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 360, 0],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/30 via-blue-500/20 to-transparent blur-3xl"
          style={{ transformStyle: "preserve-3d" }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 0, 360],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent blur-3xl"
          style={{ transformStyle: "preserve-3d" }}
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, -360, 0],
            opacity: [0.2, 0.5, 0.2],
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-purple-500/20 blur-3xl"
          style={{ transformStyle: "preserve-3d" }}
        />
        {/* Additional depth layers */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-500/10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-500/15 to-purple-500/10 blur-3xl"
        />
      </div>

      {/* Floating decorative icons - only on left side */}
      <div>
        {floatingIcons
          .filter((item) => {
            // Only show icons on the left side (x position less than 50%)
            const xPercent = parseFloat(item.x);
            return xPercent < 50;
          })
          .map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: [0, 0.5, 0.8, 0.5, 0],
                  y: [0, -30, -20, -10, 0],
                  rotate: [0, 15, -15, 10, 0],
                  scale: [0.8, 1, 1.1, 1, 0.8],
                }}
                transition={{
                  duration: 6 + index * 0.5,
                  repeat: Infinity,
                  delay: item.delay,
                  ease: "easeInOut",
                }}
                className="absolute hidden lg:block"
                style={{ left: item.x, top: item.y }}
              >
                <motion.div 
                  className="rounded-full glass-effect border border-primary/30 p-2.5 shadow-2xl backdrop-blur-xl hover:shadow-primary/40 hover:glow-primary transition-all duration-500"
                >
                  <Icon className="h-5 w-5 text-primary drop-shadow-lg" />
                </motion.div>
              </motion.div>
            );
          })}
      </div>

      <div className="w-full relative px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-[1920px] mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            {/* Right Column - Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-2 flex justify-center lg:justify-end items-start w-full"
            >
              <div className="relative w-full group flex flex-col items-center lg:items-end">
                {/* Carousel Container */}
                <div className="relative flex justify-center lg:justify-end w-full" style={{ height: '300px', width: '100%' }}>
                  {loading ? (
                    <div className="flex items-center justify-center w-full max-w-[400px] lg:w-[400px] h-[300px]">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : eventCards.length > 0 ? (
                    <div className="relative overflow-hidden rounded-2xl w-full max-w-[400px] lg:w-[400px]" style={{ height: '300px' }}>
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                          key={currentIndex}
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.3 },
                          }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={1}
                          onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                              paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                              paginate(-1);
                            }
                          }}
                          className="absolute inset-0 z-10 cursor-pointer"
                          onClick={() => router.push(`/events/${eventCards[currentIndex].id}`)}
                        >
                          <Card className={`overflow-hidden border-2 ${eventCards[currentIndex].borderColor} shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-card/95 via-card/80 to-card/70 transition-all duration-500 ${eventCards[currentIndex].hoverShadow} ${eventCards[currentIndex].hoverBorder} h-full perspective-2000`} style={{ transformStyle: "preserve-3d" }}>
                            <div className={`relative h-full bg-gradient-to-br ${eventCards[currentIndex].gradient}`}>
                              <Image
                                src={eventCards[currentIndex].image}
                                alt={eventCards[currentIndex].title}
                                fill
                                className="object-cover object-right transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                              <div className={`absolute inset-0 bg-gradient-to-br ${eventCards[currentIndex].gradientOverlay} to-transparent`} />
                              <div className="absolute bottom-0 left-0 right-0 p-6 text-white backdrop-blur-sm bg-gradient-to-t from-black/40 to-transparent">
                                <h3 className="text-xl font-bold drop-shadow-lg mb-1">{eventCards[currentIndex].title}</h3>
                                <p className="text-sm opacity-90 drop-shadow-md line-clamp-2 mb-3">{eventCards[currentIndex].subtitle}</p>
                                
                                {/* Prize and Participant Counts */}
                                <div className="flex items-center gap-4 text-xs sm:text-sm">
                                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                    <Gift className="h-3.5 w-3.5" />
                                    <span className="font-semibold">
                                      {eventCards[currentIndex].prize_count || 0} {eventCards[currentIndex].prize_count === 1 ? "Prize" : "Prizes"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                    <Users className="h-3.5 w-3.5" />
                                    <span className="font-semibold">{eventCards[currentIndex].participant_count || 0} Joined</span>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute inset-0 ring-1 ring-white/10 rounded-lg" />
                            </div>
                          </Card>
                        </motion.div>
                      </AnimatePresence>

                      {/* Navigation Arrows */}
                      {eventCards.length > 1 && (
                        <>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              paginate(-1);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full glass-effect border border-primary/30 p-3 shadow-2xl hover:glow-primary transition-all duration-500 opacity-0 group-hover:opacity-100"
                            aria-label="Previous"
                          >
                            <ChevronLeft className="h-6 w-6 text-primary drop-shadow-lg" />
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              paginate(1);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full glass-effect border border-primary/30 p-3 shadow-2xl hover:glow-primary transition-all duration-500 opacity-0 group-hover:opacity-100"
                            aria-label="Next"
                          >
                            <ChevronRight className="h-6 w-6 text-primary drop-shadow-lg" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full max-w-[400px] lg:w-[400px] h-[300px] text-muted-foreground">
                      <p>No events available</p>
                    </div>
                  )}
                </div>

                {/* Carousel Indicators */}
                {eventCards.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4 w-full max-w-[400px] lg:w-[400px]">
                    {eventCards.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setDirection(index > currentIndex ? 1 : -1);
                          setCurrentIndex(index);
                        }}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === currentIndex
                            ? "w-8 bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/60 glow-primary"
                            : "w-2 bg-muted-foreground/30 hover:bg-primary/50 hover:w-4"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Left Column - Content */}
            <div className="text-center lg:text-left order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <motion.div 
                  className="inline-flex items-center gap-2 rounded-full glass-effect px-4 py-2 text-xs font-medium text-primary border border-primary/20 shadow-lg shadow-primary/20"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 30px rgba(59, 130, 246, 0.5)",
                      "0 0 20px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span className="text-glow">Win Amazing Prizes</span>
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
              >
                Join{" "}
                <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-600 bg-clip-text text-transparent text-glow animate-pulse-slow">
                  LuckyDraw.pk
                </span>
                <br />
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                  Win Exciting Prizes
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6 text-sm text-muted-foreground sm:text-base md:text-lg"
              >
                Participate in exciting lucky draw events and stand a chance to win
                amazing prizes. Join thousands of participants across Pakistan!
              </motion.p>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                <motion.div 
                  className="flex items-center gap-1.5 rounded-lg glass-effect border border-border/50 px-3 py-2 text-xs backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:glow-primary transition-all duration-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="font-medium">100% Secure</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1.5 rounded-lg glass-effect border border-border/50 px-3 py-2 text-xs backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:glow-primary transition-all duration-500"
                >
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">10K+ Users</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1.5 rounded-lg glass-effect border border-border/50 px-3 py-2 text-xs backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:glow-primary transition-all duration-500"
                >
                  <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="font-medium">500+ Winners</span>
                </motion.div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-row items-center justify-center gap-2 sm:gap-3 lg:justify-start"
              >
                <Button
                  onClick={handleFacebookLogin}
                  size="lg"
                  className="group gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 flex-1 sm:flex-initial shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:glow-primary transition-all duration-500 bg-gradient-to-r from-primary via-blue-500 to-purple-600 hover:from-primary/95 hover:via-blue-500/95 hover:to-purple-600/95 border-2 border-primary/30 backdrop-blur-sm"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {!hasLoginDataSaved && (
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0"
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
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 flex-1 sm:flex-initial border-2 backdrop-blur-xl glass-effect hover:glass-dark transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/60 hover:glow-primary"
                  style={{ transformStyle: "preserve-3d" }}
                  onClick={() => {
                    document
                      .getElementById("events")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Gift className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">View Events</span>
                  <span className="sm:hidden">Events</span>
                </Button>
              </motion.div>
            </div>

          </div>

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"
          >
            {[
              { label: "Active Events", value: stats.activeEvents.toString(), icon: Gift },
              { label: "Total Prizes", value: stats.totalPrizes > 0 ? stats.totalPrizes.toString() : "0", icon: Trophy },
              { label: "Participants", value: stats.participants > 0 ? (stats.participants >= 1000 ? `${Math.floor(stats.participants / 1000)}K+` : `${stats.participants}+`) : "0", icon: Users },
              { label: "Reliable", value: "100%", icon: CheckCircle2 },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="border-2 bg-card/90 p-2 sm:p-3 text-center backdrop-blur-2xl glass-dark transition-all duration-500 hover:shadow-2xl hover:shadow-primary/50 hover:border-primary/60 hover:glow-primary perspective-1000" style={{ transformStyle: "preserve-3d" }}>
                    <Icon className="mx-auto mb-1 sm:mb-1.5 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
    
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
    </React.Fragment>
  );
}

