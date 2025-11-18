"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Award, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "100% Secure",
    description: "Your data and participation are completely secure with industry-standard encryption.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get notified immediately when results are announced. No waiting, no delays.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Award,
    title: "Fair & Transparent",
    description: "All draws are conducted fairly with complete transparency. Everyone has an equal chance.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Trusted Platform",
    description: "Join thousands of satisfied participants who trust LuckyDraw.pk for exciting prizes.",
    color: "from-green-500 to-emerald-500",
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center relative z-10"
      >
        <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
          Why Choose LuckyDraw.pk?
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg px-4">
          We make winning easy, secure, and fun for everyone
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
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
              <Card className="h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/40 hover:glow-primary border-2 border-border/50 bg-gradient-to-br from-card/95 via-card/85 to-card/70 backdrop-blur-2xl glass-dark group perspective-1000" style={{ transformStyle: "preserve-3d" }}>
                <CardHeader className="p-4 sm:p-6">
                  <div
                    className={`mb-3 sm:mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-2xl ring-2 ring-white/20`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-lg" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <CardDescription className="text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

