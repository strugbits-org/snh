"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CalendarDays, Users, MapPin, PartyPopper, TreePine, Building, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import { rentalFaqs } from "@/lib/faqData";

const RENTALS_HERO = "https://media.base44.com/images/public/69d94b2ecf7e326359363f38/65d314f70_generated_a29c42be.png";

const USE_CASES = [
  { icon: PartyPopper, title: "Events & Weddings", desc: "Make your special day memorable with stylish golf cart transportation for your guests." },
  { icon: TreePine, title: "Vacations & Campgrounds", desc: "Cruise around campgrounds, resorts, and vacation spots with ease and comfort." },
  { icon: Building, title: "Community & Property", desc: "Perfect for gated communities, large properties, and neighborhood cruising." },
  { icon: MapPin, title: "Golf Courses", desc: "Premium carts for the course — comfortable, quiet, and packed with features." },
];

const RENTAL_FEATURES = [
  "Easy online booking",
  "Multiple models available",
  "100% street-legal LSVs",
  "Delivery available",
  "Daily & weekly rates",
  "Fully insured fleet",
];

export default function Rentals() {
  return (
    <div>
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={RENTALS_HERO} alt="Golf course aerial view" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Rentals
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
              Rent a Golf Cart for Any Occasion
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-lg">
              Whether you're hosting an event, enjoying a vacation, or need short-term transportation — 
              we've got the perfect ride for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://www.sargeslsvrentals.com/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 h-14 text-base">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Book a Rental
                </Button>
              </a>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-white/30 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white">$125</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Starting At / Day</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Fleet Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Street Legal</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Use Cases"
            title="Perfect for Every Occasion"
            description="Our rental fleet is versatile enough for any situation. Here's how our customers use our carts."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-2xl p-8 border border-border text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <uc.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{uc.title}</h3>
                <p className="text-sm text-muted-foreground">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeading
                label="What's Included"
                title="Hassle-Free Rental Experience"
                center={false}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {RENTAL_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <a href="https://www.sargeslsvrentals.com/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-8">
                  Reserve Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-muted">
              <img src={RENTALS_HERO} alt="Rental golf carts" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <FAQSection faqs={rentalFaqs} />
      <CTASection />
    </div>
  );
}