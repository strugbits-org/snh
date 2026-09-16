"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Send } from "lucide-react";
import { extractProductDetails } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const PHONE_DISPLAY = "603-777-7831";
const PHONE_HREF = "tel:6037777831";

// Sentinel so a product legitimately named "Other" could never collide with it.
const OTHER_MODEL = "__other__";

const SERVICE_OPTIONS = [
  "Repair & Maintenance",
  "Winterization",
  "Upgrades & Customization"
];

// Preselect the service the visitor is already reading about, so the only
// fields left to fill are their own details.
const SERVICE_BY_SLUG = {
  repair: "Repair & Maintenance",
  winterization: "Winterization",
  upgrades: "Upgrades & Customization",
};

export default function ServiceQuoteForm({ slug }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    cart_model: "",
    service_needed: SERVICE_BY_SLUG[slug] || "",
  });
  // Free-text model, shown only when "Other" is picked — mirrors how the
  // waiver modal handles a vehicle that isn't in the catalog.
  const [otherModel, setOtherModel] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Same source and filtering as the waiver modal's vehicle dropdown, so the
  // options stay in step with the live catalog instead of being hardcoded.
  useEffect(() => {
    let active = true;

    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => {
        if (!active || !res.products) return;

        const names = res.products
          .map((p) => extractProductDetails(p, res.collections || []))
          .filter(
            (p) =>
              !p.isAccessory &&
              p.fullName?.toLowerCase() !== "speed upgrade service",
          )
          .map((p) => p.fullName)
          .filter(Boolean);

        setVehicles([...new Set(names)].sort((a, b) => a.localeCompare(b)));
      })
      .catch((err) => console.error("Error fetching vehicles:", err));

    return () => {
      active = false;
    };
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // What actually gets submitted for cart_model.
  const resolvedCartModel =
    form.cart_model === OTHER_MODEL ? otherModel.trim() : form.cart_model;

  const validate = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (!form.name.trim()) e.name = "Full name is required";

    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (phoneDigits.length < 10)
      e.phone = "Please enter a valid 10-digit phone number";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email))
      e.email = "Please enter a valid email address";

    if (!form.service_needed) e.service_needed = "Please select a service";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          formName: "Service Quote",
          metadata: {
            service_needed: form.service_needed,
            cart_model: resolvedCartModel,
            // Not a form field — recorded on the Wix contact note so you can
            // see which service page produced the lead.
            service_page: slug,
          },
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setErrors({});
        const serviceEvents = {
          repair: "repair_service_request",
          winterization: "winterization_request",
        };
        trackEvent(serviceEvents[slug] || "service_quote_submit", {
          form_name: `Service Quote - ${slug}`,
          service_needed: form.service_needed,
          page_location: window.location.href,
        });
        router.push("/thank-you");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Service quote form error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Request a Quote
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
            Get a Quote for Your Cart
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Tell us what you need and we&apos;ll get back to you with a quote.
            Prefer to talk it through? Call us directly.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`rounded-xl h-12 ${errors.name ? "border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  type="tel"
                  placeholder="603-777-7831"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={`rounded-xl h-12 ${errors.phone ? "border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`rounded-xl h-12 ${errors.email ? "border-red-500 focus:ring-red-200" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cart Make / Model</Label>
                <Select
                  value={form.cart_model}
                  onValueChange={(v) => updateField("cart_model", v)}
                >
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_MODEL}>Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.cart_model === OTHER_MODEL && (
                  <Input
                    placeholder="Enter your cart make & model"
                    value={otherModel}
                    onChange={(e) => setOtherModel(e.target.value)}
                    className="rounded-xl h-12 mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Service Needed *</Label>
                <Select
                  value={form.service_needed}
                  onValueChange={(v) => updateField("service_needed", v)}
                >
                  <SelectTrigger
                    className={`rounded-xl h-12 ${errors.service_needed ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service_needed && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.service_needed}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 h-14 text-base"
              >
                <Send className="w-5 h-5 mr-2" />
                {submitting ? "Sending..." : "Request a Quote"}
              </Button>

              {/* Click-to-call. Picked up automatically by the delegated
                  phone_call_click listener in <Analytics />. */}
              <a href={PHONE_HREF} className="sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-14 text-base w-full"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call {PHONE_DISPLAY}
                </Button>
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
