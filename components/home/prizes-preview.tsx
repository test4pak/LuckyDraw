"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Award, Users, Clock, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Secure",
    description: "Your data and participation are protected with enterprise-grade security measures",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Real-time updates and instant notifications for all draw results and winners",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Award,
    title: "Verified Winners",
    description: "Transparent selection process with verified winners and fair distribution",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Growing Community",
    description: "Join thousands of participants across Pakistan in exciting lucky draw events",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Clock,
    title: "Regular Events",
    description: "New events launched frequently with fresh prizes and exciting opportunities",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Fair Chances",
    description: "Equal opportunity for all participants with transparent and fair selection",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: CheckCircle2,
    title: "Trusted Platform",
    description: "Verified and trusted by thousands of users with proven track record",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Premium Experience",
    description: "Modern interface with seamless user experience and professional service",
    gradient: "from-amber-500 to-yellow-500",
  },
];

export function PrizesPreview() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full glass-effect px-4 py-2 text-xs font-medium text-primary border border-primary/20 shadow-lg shadow-primary/20 mb-4"
        >
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span className="text-glow">Why Choose Us</span>
        </motion.div>
        <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
          Trusted & Reliable Platform
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg px-4">
          Experience the best in lucky draw events with our secure, transparent, and user-friendly platform
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 relative z-10">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-2 border-border/50 transition-all duration-500 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/40 hover:glow-primary bg-gradient-to-br from-card/95 via-card/85 to-card/70 backdrop-blur-2xl glass-dark perspective-1000 h-full" style={{ transformStyle: "preserve-3d" }}>
                <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-3 sm:mb-4 inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-2xl ring-2 ring-white/20`}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 drop-shadow-lg" />
                  </motion.div>
                  <h3 className="mb-2 text-lg sm:text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground flex-grow">
                    {feature.description}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
