import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import CTASection from "@/components/CTASection";
import { FadeInOnLoad, FadeInOnView } from "@/components/services/FadeIn";
import UpgradeCheckoutCta from "@/components/services/UpgradeCheckoutCta";
import ServiceQuoteForm from "@/components/services/ServiceQuoteForm";
import { getServiceContent } from "@/lib/wixServices";
import FAQSection from "@/components/FAQSection";
import { serviceFaqsBySlug } from "@/lib/faqData";

const HERO_IMAGE = "/images/services/golf-card-services.webp";

const CHECKLIST_COLUMNS = [
  ["Tune-ups", "Battery testing and replacement"],
  ["Accessory installation", "Oil and filter change"],
  ["Winterization", "Steering alignment"],
  ["Annual Inspections", "Tire repair, and more"],
];

const ZIGZAG_IMAGE_POOL = [
  "/images/services/repair.jpg",
  "/images/services/winterization.jpg",
  "/images/services/upgrades.png",
];

// Wix Data collection changes show up within this window without a redeploy.
export const revalidate = 3600;

export default async function ServiceDetail({ params }) {
  const { slug } = await params;
  const content = await getServiceContent(slug);
  if (!content) notFound();

  const { hero, intro, zigzag, closing } = content;

  return (
    <div data-service-slug={slug}>
      <section className="relative flex items-center h-auto min-h-[640px] sm:min-h-[600px] lg:h-[600px] bg-foreground text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.22]">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover object-[center_30%]" />
        </div>
        <div className="relative w-full max-w-[1440px] mx-auto px-[30px] py-16 lg:py-0 lg:pt-[10px]">
          <FadeInOnLoad className="max-w-2xl mt-12">
            <h1 className="font-montserrat font-extrabold uppercase text-4xl leading-tight tracking-wide sm:text-5xl lg:text-[60px] lg:leading-[72px] lg:tracking-[1.2px] mb-6">
              {hero.heading}
            </h1>
            <p className="font-montserrat font-normal text-white/80 text-base leading-relaxed lg:text-[20px] lg:leading-[29px] lg:tracking-normal mb-8">
              {hero.paragraph}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto px-6 py-2 rounded-lg bg-[#0DA2E7] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733] hover:bg-[#0DA2E7]/90 transition-colors text-center"
            >
              {hero.ctaLabel}
            </Link>
          </FadeInOnLoad>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-[25px]">
          <h2 className="font-montserrat font-bold text-3xl leading-tight lg:text-[36px] lg:leading-[40px] mb-4">
            {intro.heading}
          </h2>
          <div className="pt-[18.75px] space-y-4">
            {intro.paragraphs.map((p) => (
              <p key={p} className="text-muted-foreground text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {false && (
        <section className="bg-[#F5F5F5] py-[60px]">
          <div className="max-w-[1400px] mx-auto px-[25px]">
            <h3 className="font-montserrat font-bold text-2xl sm:text-3xl text-[#0E1110] mb-8">
              Lorem Ipsum is simply:
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
              {CHECKLIST_COLUMNS.map((column, i) => (
                <ul key={i} className="space-y-3">
                  {column.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm sm:text-base text-[#6D7875]">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#6D7875] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-[25px]">
          <div className="space-y-20 sm:space-y-28 lg:space-y-36">
            {zigzag.items.map((item, i) => {
              const isReversed = i % 2 === 0;
              return (
                <FadeInOnView
                  key={item.title}
                  className={`grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-start ${isReversed ? "lg:direction-rtl" : ""}`}
                >
                  <div className={isReversed ? "lg:order-2" : ""}>
                    <h3 className="font-montserrat font-bold text-3xl sm:text-4xl mb-4">
                      {item.title}
                    </h3>
                    {item.paragraphs.map((p) => (
                      <p key={p} className="text-muted-foreground text-lg leading-relaxed mb-4">
                        {p}
                      </p>
                    ))}
                    {item.bullets && (
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-6">
                        {item.bullets.map((b) => (
                          <div key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col items-start gap-4">
                      {/* {slug === "upgrades" && <UpgradeCheckoutCta />} */}
                      {slug === "upgrades" ? (
                        <Link href="/contact" className="w-full sm:w-auto">
                          <Button
                            variant="outline"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors h-12 w-full sm:w-auto px-4 py-2 border-[#0DA2E7]/30 text-[#0DA2E7] hover:bg-[#0DA2E7] hover:text-white hover:border-[#0DA2E7]"
                          >
                            Plan Your Upgrade
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Link
                          href="/contact"
                          className="inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0DA2E7] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733] hover:bg-[#0DA2E7]/90 transition-colors"
                        >
                          Schedule a Service
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    className={`relative group ${isReversed ? "lg:order-1" : ""}`}
                  >
                    <div className="absolute -inset-4 bg-accent/5 rounded-[2.5rem] transform rotate-2 transition-transform group-hover:rotate-1" />
                    <div className="relative rounded-3xl aspect-[4/3] overflow-hidden bg-muted shadow-2xl">
                      <img
                        src={ZIGZAG_IMAGE_POOL[i % ZIGZAG_IMAGE_POOL.length]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </FadeInOnView>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-[25px]">
          <div className="grid lg:grid-cols-12 gap-6 items-start ">
            <div className="col-span-5">
              <h2 className="font-montserrat font-bold uppercase text-2xl sm:text-4xl mb-6">
                Our Service Center
              </h2>
              <p className="font-montserrat font-bold text-xl mb-3">SNH Golf Carts LLC</p>
              <p className="text-muted-foreground text-[18px]">574 Mammoth Rd Bldg B-2,</p>
              <p className="text-muted-foreground text-[18px] mb-6">Londonderry, NH 03053</p>

              <p className="font-montserrat font-bold mb-1 text-lg">Business Hours</p>
              <p className="text-muted-foreground text-[18px]">Mon : 9:00AM – 5:00PM</p>
              <p className="text-muted-foreground text-[18px]">Tue : Closed</p>
              <p className="text-muted-foreground text-[18px]">Wed - Fri : 9:00AM – 5:00PM</p>
              <p className="text-muted-foreground text-[18px]">Sat : 10:00AM – 5:00PM</p>
              <p className="text-muted-foreground text-[18px] mb-6">Sun : 10:00AM – 3:00PM</p>

              <p className="font-montserrat font-bold mb-1 text-lg">Contact US</p>
              <p className="text-muted-foreground text-[18px]">Email : info@snhgolfcarts.com</p>
              <p className="text-muted-foreground text-[18px] mb-6">Phone : (603) 777-7831</p>
            </div>

            <div className="col-span-7" >
              <div className="rounded-2xl overflow-hidden border border-border w-full h-[484px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2921.433744715386!2d-71.407091!3d42.926982!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e24d005fae9693%3A0x3acb317d61226cca!2sSNH%20Golf%20Carts%20LLC!5e0!3m2!1sen!2sus!4v1777472561810!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SNH Golf Carts service center location map"
                />
              </div>
            </div>
          </div>
            <div className="mt-10 sm:mt-16">
            <h2 className="font-montserrat font-bold text-2xl sm:text-3xl mb-4">
              {closing.heading}
            </h2>
            <div className="space-y-4 mb-6">
              {closing.paragraphs.map((p) => (
                <p key={p} className="text-muted-foreground text-base leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto px-6 py-2 rounded-lg bg-[#0DA2E7] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733] hover:bg-[#0DA2E7]/90 transition-colors"
            >
              {closing.ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* On-page conversion path. Every other CTA on this page sends the
          visitor to /contact, which costs a click on the most engaged traffic
          on the site — this captures them where they already are. */}
      {serviceFaqsBySlug[slug] && (
        <FAQSection faqs={serviceFaqsBySlug[slug]} variant="services" />
      )}

      <ServiceQuoteForm slug={slug} />

      <CTASection />
    </div>
  );
}
