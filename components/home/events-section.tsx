"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { fetchAllRows, getAccurateCount } from "@/lib/supabase-helpers";
import { Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Event = {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  image_url?: string | null;
  participant_count?: number;
  prizes_count?: number;
  prizes?: Array<{ image_url: string | null }>;
};

export function EventsSection() {
  const [events, setEvents] = useState<{
    running: Event[];
    upcoming: Event[];
    completed: Event[];
  }>({
    running: [],
    upcoming: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await fetchAllRows(
          supabase
            .from("events")
            .select("*, image_url")
            .order("created_at", { ascending: false })
        );

        // Get participant and prize counts for each event
        const eventsWithDetails = await Promise.all(
          (eventsData || []).map(async (event) => {
            try {
              // Get counts using count queries
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

              // Fallback to fetching all rows if count is 0 but might be inaccurate
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
                ...event,
                participant_count: participantCount,
                prizes_count: prizeCount,
              };
            } catch (error) {
              return {
                ...event,
                participant_count: 0,
                prizes_count: 0,
              };
            }
          })
        );

        const running = eventsWithDetails.filter((e) => e.status === "running");
        const upcoming = eventsWithDetails.filter((e) => e.status === "upcoming");
        const completed = eventsWithDetails.filter((e) => e.status === "completed");

        setEvents({ running, upcoming, completed });
      } catch (error) {
        // Error fetching events
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [supabase]);

  const EventCard = ({ event }: { event: Event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/40 hover:glow-primary border-2 border-border/50 bg-gradient-to-br from-card/95 via-card/85 to-card/70 backdrop-blur-2xl glass-dark perspective-1000" style={{ transformStyle: "preserve-3d" }}>
        {event.image_url && (
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-muted">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
            {/* Status Badge - Top Left */}
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant={
                  event.status === "running"
                    ? "success"
                    : event.status === "upcoming"
                    ? "default"
                    : "secondary"
                }
                className="shadow-lg"
              >
                {event.status}
              </Badge>
            </div>
            {/* Prize Count Badge - Top Right */}
            {(event.prizes_count || 0) > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <Badge
                  variant="outline"
                  className="bg-background/90 backdrop-blur-sm border-primary/50 text-primary font-semibold shadow-lg"
                >
                  x{event.prizes_count}
                </Badge>
              </div>
            )}
          </div>
        )}
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="line-clamp-2 text-base sm:text-lg">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Ends: {formatDate(event.end_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{event.participant_count || 0} participants</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-6 pt-0">
          <Button asChild className="w-full group/btn text-sm sm:text-base">
            <Link href={`/events/${event.id}`}>
              View Details
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <section id="events" className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center relative z-10"
      >
        <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
          Lucky Draw Events
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg px-4">
          Join our exciting events and win amazing prizes
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs defaultValue="running" className="w-full relative z-10">
          <TabsList className="mb-8 grid w-full grid-cols-3">
            <TabsTrigger value="running">Running</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="running" className="mt-6">
            {events.running.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.running.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No running events at the moment. Check back soon!
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {events.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No upcoming events scheduled yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {events.completed.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.completed.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No completed events yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}

