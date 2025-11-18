"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { fetchAllRows, getAccurateCount } from "@/lib/supabase-helpers";
import { fetchWithCache, CacheKeys, CacheTTL } from "@/lib/cached-fetch";
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
        // Fetch events with caching
        const eventsData = await fetchWithCache(
          CacheKeys.events(),
          async () => {
            return await fetchAllRows(
              supabase
                .from("events")
                .select("*, image_url")
                .order("created_at", { ascending: false })
            );
          },
          CacheTTL.MEDIUM
        );

        // Get participant and prize counts for each event (cached per event)
        const eventsWithDetails = await Promise.all(
          (eventsData || []).map(async (event) => {
            try {
              const [participantCount, prizeCount] = await Promise.all([
                fetchWithCache(
                  `event_${event.id}_participants`,
                  async () => {
                    const result = await supabase
                      .from("participants")
                      .select("id", { count: "exact", head: true })
                      .eq("event_id", event.id);
                    if (result.error || result.count === null) {
                      const all = await fetchAllRows(
                        supabase.from("participants").select("id").eq("event_id", event.id)
                      );
                      return all.length;
                    }
                    return result.count ?? 0;
                  },
                  CacheTTL.SHORT
                ),
                fetchWithCache(
                  `event_${event.id}_prizes`,
                  async () => {
                    const result = await supabase
                      .from("prizes")
                      .select("id", { count: "exact", head: true })
                      .eq("event_id", event.id);
                    if (result.error || result.count === null) {
                      const all = await fetchAllRows(
                        supabase.from("prizes").select("id").eq("event_id", event.id)
                      );
                      return all.length;
                    }
                    return result.count ?? 0;
                  },
                  CacheTTL.SHORT
                ),
              ]);

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
    <div className="h-full flex">
      <Card className="group h-full flex flex-col overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card/95 via-card/85 to-card/70 backdrop-blur-2xl glass-dark">
        {event.image_url && (
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-muted flex-shrink-0">
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
        <CardHeader className="p-4 sm:p-6 flex-shrink-0">
          <CardTitle className="line-clamp-2 text-base sm:text-lg">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        </CardHeader>
        <div className="flex-grow flex flex-col justify-end">
          <CardContent className="p-4 sm:p-6 pt-0 flex-shrink-0">
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium">Ends</span>
                  <span className="text-sm sm:text-base font-semibold text-foreground">{formatDate(event.end_date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{event.participant_count || 0} participants</span>
              </div>
            </div>
          </CardContent>
        </div>
        <CardFooter className="p-4 sm:p-6 pt-0 flex-shrink-0">
          <Button asChild className="w-full group/btn text-sm sm:text-base">
            <Link href={`/events/${event.id}`}>
              View Details
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  return (
    <section id="events" className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      <div className="mb-12 text-center relative z-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
          Lucky Draw Events
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg px-4">
          Join our exciting events and win amazing prizes
        </p>
      </div>

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

