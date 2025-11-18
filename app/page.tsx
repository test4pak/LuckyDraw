import { Hero } from "@/components/home/hero";
import { PrizesPreview } from "@/components/home/prizes-preview";
import { FeaturesSection } from "@/components/home/features-section";
import { EventsSection } from "@/components/home/events-section";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <PrizesPreview />
      <FeaturesSection />
      <EventsSection />
    </div>
  );
}

