"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Calendar, Users, Trophy, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  contact_no: string | null;
  city: string | null;
};

type ParticipantEvent = {
  id: string;
  event_id: string;
  joined_at: string;
  events: {
    id: string;
    title: string;
    description: string;
    status: string;
    end_date: string;
    image_url?: string | null;
  };
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [participatedEvents, setParticipatedEvents] = useState<ParticipantEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/");
        return;
      }

      // Fetch user profile from facebook_logins using email
      const { data: userData } = await supabase
        .from("facebook_logins")
        .select("id, first_name, last_name, email, contact_no, city")
        .or(`email.eq.${authUser.email},fb_username.eq.${authUser.email}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (userData) {
        setUser({
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          contact_no: userData.contact_no,
          city: userData.city,
        });
      }

      // Fetch participated events using facebook_login_id
      if (userData) {
        try {
          const participants = await fetchAllRows(
            supabase
              .from("participants")
              .select(
                `
                id,
                event_id,
                joined_at,
                events (
                  id,
                  title,
                  description,
                  status,
                  end_date,
                  image_url
                )
              `
              )
              .eq("facebook_login_id", userData.id)
              .order("joined_at", { ascending: false })
          );

          if (participants) {
            setParticipatedEvents(participants);
          }
        } catch (error) {
          console.error("Error fetching participants:", error);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="w-full flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge variant="success">Active</Badge>;
      case "upcoming":
        return <Badge variant="default">Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
          Dashboard
        </h1>

        {/* User Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {user.first_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.first_name || user.email || "User"}
                </h3>
                <p className="text-muted-foreground">{user.email || "No email"}</p>
                {user.contact_no && (
                  <p className="text-sm text-muted-foreground">{user.contact_no}</p>
                )}
                {user.city && (
                  <p className="text-sm text-muted-foreground">{user.city}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participated Events */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold">My Events</h2>
          {participatedEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {participatedEvents.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                    {participant.events.image_url && (
                      <div className="relative h-48 w-full overflow-hidden bg-muted">
                        <Image
                          src={participant.events.image_url}
                          alt={participant.events.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="line-clamp-2">
                          {participant.events.title}
                        </CardTitle>
                        {getStatusBadge(participant.events.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {participant.events.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Ends: {formatDate(participant.events.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Gift className="h-4 w-4" />
                          <span>Joined: {formatDate(participant.joined_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/events/${participant.events.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-lg font-medium">No events joined yet</p>
                <p className="mb-6 text-center text-muted-foreground">
                  Start participating in lucky draw events to see them here!
                </p>
                <Button asChild>
                  <Link href="/">
                    Browse Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}

