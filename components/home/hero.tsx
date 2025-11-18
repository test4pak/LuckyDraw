"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Users, Trophy, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
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
            eventsData.map(async (event: { id: string; title: string; description: string | null; image_url: string | null; status: string }, index: number) => {
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


  return (
    <React.Fragment>
      <section className="relative overflow-hidden gradient-mesh min-h-screen flex items-center">
      {/* Background shapes - static */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 via-blue-500/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-transparent blur-3xl" />
      </div>

      <div className="w-full relative px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-[1920px] mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            {/* Right Column - Carousel */}
            <div className="relative order-2 flex justify-center lg:justify-end items-start w-full">
              <div className="relative w-full group flex flex-col items-center lg:items-end">
                {/* Carousel Container */}
                <div className="relative flex justify-center lg:justify-end w-full" style={{ height: '300px', width: '100%' }}>
                  {loading ? (
                    <div className="flex items-center justify-center w-full max-w-[400px] lg:w-[400px] h-[300px]">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : eventCards.length > 0 ? (
                    <div className="relative overflow-hidden rounded-2xl w-full max-w-[400px] lg:w-[400px]" style={{ height: '300px' }}>
                      <div
                        key={currentIndex}
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={() => router.push(`/events/${eventCards[currentIndex].id}`)}
                      >
                          <Card className={`overflow-hidden border-2 ${eventCards[currentIndex].borderColor} shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-card/95 via-card/80 to-card/70 h-full`}>
                            <div className={`relative h-full bg-gradient-to-br ${eventCards[currentIndex].gradient}`}>
                              <Image
                                src={eventCards[currentIndex].image}
                                alt={eventCards[currentIndex].title}
                                fill
                                className="object-cover object-right"
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
                        </div>

                      {/* Navigation Arrows */}
                      {eventCards.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              paginate(-1);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full glass-effect border border-primary/30 p-3 shadow-2xl opacity-0 group-hover:opacity-100"
                            aria-label="Previous"
                          >
                            <ChevronLeft className="h-6 w-6 text-primary drop-shadow-lg" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              paginate(1);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full glass-effect border border-primary/30 p-3 shadow-2xl opacity-0 group-hover:opacity-100"
                            aria-label="Next"
                          >
                            <ChevronRight className="h-6 w-6 text-primary drop-shadow-lg" />
                          </button>
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
                        className={`h-2 rounded-full ${
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
            </div>

            {/* Left Column - Content */}
            <div className="text-center lg:text-left order-1">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 rounded-full glass-effect px-4 py-2 text-xs font-medium text-primary border border-primary/20 shadow-lg shadow-primary/20">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-glow">Win Amazing Prizes</span>
                </div>
              </div>

              <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                Join{" "}
                <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-600 bg-clip-text text-transparent text-glow">
                  LuckyDraw.pk
                </span>
                <br />
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                  Win Exciting Prizes
                </span>
              </h1>

              <p className="mb-6 text-sm text-muted-foreground sm:text-base md:text-lg">
                Participate in exciting lucky draw events and stand a chance to win
                amazing prizes. Join thousands of participants across Pakistan!
              </p>

              {/* Trust Indicators */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <div className="flex items-center gap-1.5 rounded-lg glass-effect border border-border/50 px-3 py-2 text-xs backdrop-blur-xl shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="font-medium">100% Secure</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg glass-effect border border-border/50 px-3 py-2 text-xs backdrop-blur-xl shadow-lg">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">10K+ Users</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg glass-effect border border-border/50 px-3 py-2 text-xs backdrop-blur-xl shadow-lg">
                  <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="font-medium">500+ Winners</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 lg:justify-start">
                <Button
                  onClick={handleFacebookLogin}
                  size="lg"
                  className="group gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 flex-1 sm:flex-initial shadow-2xl shadow-primary/40 bg-gradient-to-r from-primary via-blue-500 to-purple-600 hover:from-primary/95 hover:via-blue-500/95 hover:to-purple-600/95 border-2 border-primary/30 backdrop-blur-sm"
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
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 flex-1 sm:flex-initial border-2 backdrop-blur-xl glass-effect hover:glass-dark"
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
              </div>
            </div>

          </div>

          {/* Quick Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Active Events", value: stats.activeEvents.toString(), icon: Gift },
              { label: "Total Prizes", value: stats.totalPrizes > 0 ? stats.totalPrizes.toString() : "0", icon: Trophy },
              { label: "Participants", value: stats.participants > 0 ? (stats.participants >= 1000 ? `${Math.floor(stats.participants / 1000)}K+` : `${stats.participants}+`) : "0", icon: Users },
              { label: "Reliable", value: "100%", icon: CheckCircle2 },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}>
                  <Card className="border-2 bg-card/90 p-2 sm:p-3 text-center backdrop-blur-2xl glass-dark">
                    <Icon className="mx-auto mb-1 sm:mb-1.5 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                  </Card>
                </div>
              );
            })}
          </div>
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

