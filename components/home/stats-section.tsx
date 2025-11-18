"use client";

import { motion } from "framer-motion";
import { Users, Gift, Calendar, Trophy } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Participants",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Gift,
    value: "500+",
    label: "Prizes Awarded",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Calendar,
    value: "50+",
    label: "Events Completed",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Trophy,
    value: "PKR 5M+",
    label: "Total Prize Value",
    color: "from-green-500 to-emerald-500",
  },
];

export function StatsSection() {
  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Our Impact
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Join thousands of winners who have already claimed their prizes
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold md:text-4xl">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

