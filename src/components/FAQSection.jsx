"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import SectionHeading from "@/components/SectionHeading";

export default function FAQSection({
  faqs,
  label = "FAQ",
  title = "Frequently Asked Questions",
  description,
  variant = "default",
}) {
  if (!faqs?.length) return null;

  const isServices = variant === "services";

  return (
    <section className={isServices ? "py-12 sm:py-16" : "pb-24"}>
      <div
        className={
          isServices
            ? "max-w-[1400px] mx-auto px-[25px]"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        }
      >
        <SectionHeading label={label} title={title} description={description} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-base font-semibold text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
