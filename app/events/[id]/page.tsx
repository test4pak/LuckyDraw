"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows, getAccurateCount } from "@/lib/supabase-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Calendar, Users, Gift, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export const dynamic = 'force-dynamic';

type Event = {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  image_url?: string | null;
  participant_count?: number;
};

type Prize = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  category: string | null;
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const fetchEvent = async () => {
      // Only fetch in browser environment
      if (typeof window === 'undefined') return;
      
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*, image_url")
        .eq("id", params.id)
        .single();

      if (eventError || !eventData) {
        router.push("/");
        return;
      }

      // Get participant count
      const { count, error: countError } = await supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventData.id);

      // If count query fails, fetch all rows and count
      let participantCount = count ?? 0;
      if (countError || count === null) {
        const allParticipants = await fetchAllRows(
          supabase.from("participants").select("id").eq("event_id", eventData.id)
        );
        participantCount = allParticipants.length;
      }

      setEvent({ ...eventData, participant_count: participantCount });

      // Get prizes
      const prizesData = await fetchAllRows(
        supabase
          .from("prizes")
          .select("*")
          .eq("event_id", eventData.id)
          .order("created_at", { ascending: true })
      );

      if (prizesData) {
        setPrizes(prizesData);
      }

      // Check if user is already a participant
      if (user) {
        // Get user's facebook_login record
        const { data: facebookLogin } = await supabase
          .from("facebook_logins")
          .select("id")
          .or(`email.eq.${user.email},fb_username.eq.${user.email}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (facebookLogin) {
          const { data: participant } = await supabase
            .from("participants")
            .select("id")
            .eq("event_id", eventData.id)
            .eq("facebook_login_id", facebookLogin.id)
            .single();

          setIsParticipant(!!participant);
        }
      }

      setLoading(false);
    };

    fetchEvent();
  }, [params.id, router]);

  useEffect(() => {
    if (!event || event.status !== "running") return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(event.end_date).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining(
          `${days}d ${hours}h ${minutes}m ${seconds}s`
        );
      } else {
        setTimeRemaining("Event Ended");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [event]);

  const handleJoinEvent = async () => {
    if (typeof window === 'undefined') return;
    
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to join this event",
        variant: "destructive",
      });
      return;
    }

    if (!event) return;

    setJoining(true);

    try {
      // Get or create facebook_login record
      let facebookLoginId: string | null = null;
      
      const { data: existingLogin } = await supabase
        .from("facebook_logins")
        .select("id")
        .or(`email.eq.${user.email},fb_username.eq.${user.email}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingLogin) {
        facebookLoginId = existingLogin.id;
      } else {
        // Create new facebook_login record if it doesn't exist
        const { data: newLogin, error: insertError } = await supabase
          .from("facebook_logins")
          .insert({
            email: user.email || null,
            fb_username: user.email || null,
            first_name: user.user_metadata?.full_name?.split(" ")[0] || null,
            last_name: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
          })
          .select("id")
          .single();

        if (insertError || !newLogin) {
          throw new Error("Failed to create user record");
        }
        facebookLoginId = newLogin.id;
      }

      if (!facebookLoginId) {
        throw new Error("Could not get or create user record");
      }

      const { error } = await supabase.from("participants").insert({
        event_id: event.id,
        facebook_login_id: facebookLoginId,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Joined",
            description: "You have already joined this event",
          });
          setIsParticipant(true);
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "You have successfully joined the event",
        });
        setIsParticipant(true);
        setEvent({
          ...event,
          participant_count: (event.participant_count || 0) + 1,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join event",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Event Image */}
        {event.image_url && (
          <div className="relative mb-8 h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Event Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <Badge
              variant={
                event.status === "running"
                  ? "success"
                  : event.status === "upcoming"
                  ? "default"
                  : "secondary"
              }
              className="text-sm"
            >
              {event.status.toUpperCase()}
            </Badge>
            {isParticipant && (
              <Badge variant="outline" className="gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Joined
              </Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {event.title}
          </h1>
          <p className="text-lg text-muted-foreground">{event.description}</p>
        </div>

        {/* Event Info Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Start Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  {formatDate(event.start_date)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                End Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  {formatDate(event.end_date)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  {event.participant_count || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Countdown Timer (for running events) */}
        {event.status === "running" && timeRemaining && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="flex items-center justify-center gap-4 py-6">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Remaining</p>
                  <p className="text-2xl font-bold">{timeRemaining}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Join Button */}
        {event.status === "running" && (
          <div className="mb-8">
            {isParticipant ? (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="flex items-center gap-4 py-6">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold">You&apos;re in!</p>
                    <p className="text-sm text-muted-foreground">
                      You have successfully joined this event. Good luck!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={handleJoinEvent}
                disabled={joining}
                size="lg"
                className="w-full gap-2 text-lg"
              >
                {joining ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5" />
                    Join Lucky Draw
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {event.status === "upcoming" && (
          <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-semibold">Event Not Started</p>
                <p className="text-sm text-muted-foreground">
                  This event will start on {formatDate(event.start_date)}. Check back
                  then to join!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prizes Section */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Prizes</h2>
          {prizes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prizes.map((prize, index) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                    {prize.image_url && (
                      <div className="relative h-48 w-full overflow-hidden bg-muted">
                        <Image
                          src={prize.image_url}
                          alt={prize.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="line-clamp-2">{prize.name}</CardTitle>
                        {prize.category && (
                          <Badge variant="outline">{prize.category}</Badge>
                        )}
                      </div>
                      {prize.description && (
                        <CardDescription className="line-clamp-3">
                          {prize.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No prizes listed for this event yet.
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}

