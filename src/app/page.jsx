import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesOverview from "@/components/home/ServicesOverview";
import WhyChooseUs from "@/components/home/WhyChooseUs";

import GoogleReviews from "@/components/home/GoogleReviews";

import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import { homeFaqs } from "@/lib/faqData";

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.snhgolfcarts.com/#organization",
        "name": "SNH Golf Carts LLC",
        "url": "https://www.snhgolfcarts.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.snhgolfcarts.com/Logo-png-b.png"
        },
        "description": "Veteran-owned electric golf cart dealer in Londonderry, NH. New & used carts, rentals, repairs, and battery replacement across Southern NH.",
        "telephone": "+1-603-777-7831",
        "email": "info@snhgolfcarts.com",
        "sameAs": [
          "https://www.instagram.com/snhgolfcarts/",
          "https://www.facebook.com/profile.php?id=100085891995936",
          "https://share.google/qhJKzIP77xtGCT68V"
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://www.snhgolfcarts.com/#localbusiness",
        "name": "SNH Golf Carts LLC",
        "image": "https://www.snhgolfcarts.com/Logo-png-b.png",
        "url": "https://www.snhgolfcarts.com/",
        "telephone": "+1-603-777-7831",
        "email": "info@snhgolfcarts.com",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "574 Mammoth Rd, Building B-2",
          "addressLocality": "Londonderry",
          "addressRegion": "NH",
          "postalCode": "03053",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 42.8651,
          "longitude": -71.3745
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "22",
          "bestRating": "5"
        },
        "sameAs": [
          "https://www.instagram.com/snhgolfcarts/",
          "https://www.facebook.com/profile.php?id=100085891995936",
          "https://share.google/qhJKzIP77xtGCT68V"
        ]
      }
    ]
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <HeroSection />
      <FeaturedProducts />
      <ServicesOverview />
      <WhyChooseUs />

      <FAQSection faqs={homeFaqs} />
      <GoogleReviews />
      <CTASection />
    </div>
  );
}