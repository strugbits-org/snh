"use client";
import { Award, ShieldCheck, Heart, Users, Target, Star } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import { aboutFaqs } from "@/lib/faqData";

const ABOUT_IMAGE = "https://media.base44.com/images/public/69d94b2ecf7e326359363f38/8084cf4d5_about-page.png";

const VALUES = [
  { icon: ShieldCheck, title: "Integrity", desc: "We operate with honesty and transparency in every transaction." },
  { icon: Heart, title: "Customer First", desc: "Your satisfaction drives everything we do. We're not happy until you are." },
  { icon: Star, title: "Quality", desc: "We only carry premium brands and stand behind every product we sell." },
  { icon: Target, title: "Excellence", desc: "Military-grade discipline applied to every aspect of our business." },
];

const STATS = [
  { value: "500+", label: "Carts Sold" },
  { value: "15+", label: "Years Experience" },
  { value: "1000+", label: "Happy Customers" },
  { value: "4.9★", label: "Average Rating" },
];

export default function About() {
  return (
    <div>
      <section className="pt-32 pb-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                About Us
              </span>
              <h1 className="font-display font-bold text-4xl sm:text-5xl mb-6 leading-tight">
                Veteran-Owned. <br />
                <span className="text-accent">Customer-Focused.</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                At SNH Golf Carts LLC, we're passionate about providing high-quality golf carts 
                and LSVs to our customers. As a veteran-owned business serving Londonderry, NH and 
                surrounding communities, we prioritize customer satisfaction above all else.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We aim to assist you in selecting the perfect vehicle for your needs — whether 
                you're looking for a new or used golf cart, need service or repairs, or want to 
                rent a cart for a special event. Our focus is on integrity, reliability, and 
                delivering an exceptional experience from start to finish.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl overflow-hidden aspect-[4/3]"
            >
              <img src={ABOUT_IMAGE} alt="SNH Golf Carts showroom" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Our Values"
            title="What Drives Us"
            description="The principles that guide everything we do at SNH Golf Carts LLC."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 border border-border text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <val.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{val.title}</h3>
                <p className="text-sm text-muted-foreground">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection faqs={aboutFaqs} />
      <CTASection />
    </div>
  );
}