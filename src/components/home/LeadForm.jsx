"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Wrench,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

const BUDGET_OPTIONS = [
  "Under $8,000",
  "$8,000 – $10,000",
  "$10,000 – $12,000",
  "$12,000+",
  "Not sure yet",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Business hours by day of week (0 = Sun ... 6 = Sat). Tuesday is closed.
const BUSINESS_HOURS = {
  0: { open: 10, close: 15 }, // Sun: 10:00AM – 3:00PM
  1: { open: 9, close: 17 }, // Mon: 9:00AM – 5:00PM
  2: null, // Tue: Closed
  3: { open: 9, close: 17 }, // Wed: 9:00AM – 5:00PM
  4: { open: 9, close: 17 }, // Thu: 9:00AM – 5:00PM
  5: { open: 9, close: 17 }, // Fri: 9:00AM – 5:00PM
  6: { open: 10, close: 17 }, // Sat: 10:00AM – 5:00PM
};

const formatHour = (hour) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
};

// Last bookable slot starts one hour before close so the appointment fits within business hours.
const getTimesForDate = (date) => {
  if (!date) return [];
  const hours = BUSINESS_HOURS[date.getDay()];
  if (!hours) return [];
  const slots = [];
  for (let h = hours.open; h < hours.close; h++) slots.push(formatHour(h));
  return slots;
};

const inputCls = (hasError) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all font-sans
   bg-white/20 text-white placeholder-white/60
   ${hasError ? "border-red-400/60" : "border-white/30"}
   focus:border-accent focus:ring-2 focus:ring-accent/20`;

function MiniCalendar({ selected, onSelect }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const monthName = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isPast = (d) => {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return date < t;
  };

  // SNH Golf Carts is closed on Tuesdays
  const isClosedDay = (d) => new Date(year, month, d).getDay() === 2;

  const isDisabled = (d) => isPast(d) || isClosedDay(d);

  const isSelected = (d) =>
    selected &&
    d &&
    selected.getDate() === d &&
    selected.getMonth() === month &&
    selected.getFullYear() === year;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white/50" />
        </button>
        <span className="text-sm font-semibold text-white font-display">
          {monthName}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white/50" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-white/30 uppercase py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => (
          <div
            key={i}
            className="aspect-square flex items-center justify-center"
          >
            {d ?
              <button
                disabled={isDisabled(d)}
                onClick={() => onSelect(new Date(year, month, d))}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all
                  ${isSelected(d) ? "bg-accent text-white font-bold shadow-lg shadow-accent/30" : ""}
                  ${!isSelected(d) && !isDisabled(d) ? "hover:bg-white/10 text-white/80" : ""}
                  ${isDisabled(d) ? "text-white/20 cursor-not-allowed" : ""}
                `}
              >
                {d}
              </button>
            : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function LeadForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [appointmentType, setAppointmentType] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    cartInterest: "",
    budget: "",
    serviceDescription: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const validateStep1 = () => {
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

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (appointmentType === "cart") {
      if (!form.cartInterest.trim())
        e.cartInterest = "Please describe your interest";
      if (!form.budget) e.budget = "Please select a budget range";
      if (!selectedDate) e.date = "Please select a date";
      if (!selectedTime) e.time = "Please select a time";
    } else {
      if (!form.serviceDescription.trim())
        e.serviceDescription = "Please describe the issue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleTypeSelect = (type) => {
    if (!validateStep1()) return;
    setAppointmentType(type);
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setSubmitting(true);
    const dateStr =
      selectedDate ?
        selectedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
    const message =
      appointmentType === "cart" ?
        `Cart Appointment\nInterest: ${form.cartInterest}\nBudget: ${form.budget}\nDate: ${dateStr}\nTime: ${selectedTime}`
      : `Service Request\n${form.serviceDescription}`;

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          formName:
            appointmentType === "cart" ? "Sales Appointment" : (
              "Service Request"
            ),
          message: message,
          metadata: {
            budget_1: form.budget,
            cart_interest: form.cartInterest,
            appointment_time: selectedTime,
            appointment_date: dateStr,
          },
        }),
      });

      const resData = await response.json();

      if (resData.success || resData.contactId) {
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "book_appointment", {
            form_name: "Book Appointment",
            page_location: window.location.href,
          });
        }
        router.push("/thank-you");
      } else {
        alert("Something went wrong. Please try again or call us.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again or call us.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="w-full max-w-[420px] rounded-2xl overflow-hidden backdrop-blur-xl border border-white/30 shadow-2xl"
      style={{ background: "rgba(255,255,255,0.18)" }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <span className="text-accent text-[10px] font-bold uppercase tracking-[0.2em] font-sans">
            Book with SNH Golf Carts LLC
          </span>
        </div>
        <h2 className="text-white font-display font-bold text-xl leading-tight mb-1">
          Schedule an Appointment
        </h2>
        <p className="text-white/40 text-xs font-sans">
          Sales visit or service call — we are ready.
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{
                background:
                  step >= s ? "hsl(var(--accent))" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 min-h-[340px] overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="space-y-3 mb-5">
                {[
                  {
                    key: "name",
                    label: "Full Name",
                    type: "text",
                    placeholder: "John Smith",
                  },
                  {
                    key: "phone",
                    label: "Phone Number",
                    type: "tel",
                    placeholder: "603-777-7831",
                  },
                  {
                    key: "email",
                    label: "Email Address",
                    type: "email",
                    placeholder: "john@email.com",
                  },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-1 font-sans">
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className={inputCls(errors[key])}
                    />
                    {errors[key] && (
                      <p className="text-red-400 text-[10px] mt-0.5">
                        {errors[key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-3 font-sans">
                What brings you in?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    type: "cart",
                    icon: ShoppingCart,
                    title: "Cart Appointment",
                    sub: "Test drive or purchase",
                  },
                  {
                    type: "service",
                    icon: Wrench,
                    title: "Service Request",
                    sub: "Repair or battery upgrade",
                  },
                ].map(({ type, icon: Icon, title, sub }) => (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-accent hover:bg-accent/10 transition-all text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-accent/20 flex items-center justify-center transition-colors border border-white/10 group-hover:border-accent/40">
                      <Icon className="w-5 h-5 text-white/50 group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white font-display">
                        {title}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5 font-sans">
                        {sub}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-white/10">
                <Shield className="w-3 h-3 text-white/20" />
                <p className="text-[10px] text-white/30 font-sans">
                  Your info is never shared or sold. Ever.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2A: CART ── */}
          {step === 2 && appointmentType === "cart" && (
            <motion.div
              key="step2a"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-accent mb-4 transition-colors font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-1 font-sans">
                    Cart Interest
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4-seater, street legal, lifted..."
                    value={form.cartInterest}
                    onChange={(e) => {
                      set("cartInterest", e.target.value);
                      if (errors.cartInterest)
                        setErrors({ ...errors, cartInterest: null });
                    }}
                    className={inputCls(errors.cartInterest)}
                  />
                  {errors.cartInterest && (
                    <p className="text-red-400 text-[10px] mt-1">
                      {errors.cartInterest}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-1 font-sans">
                    Budget
                  </label>
                  <select
                    value={form.budget}
                    onChange={(e) => {
                      set("budget", e.target.value);
                      if (errors.budget) setErrors({ ...errors, budget: null });
                    }}
                    className={inputCls(errors.budget) + " cursor-pointer"}
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <option value="" style={{ background: "#0f1f18" }}>
                      Select budget range
                    </option>
                    {BUDGET_OPTIONS.map((o) => (
                      <option
                        key={o}
                        value={o}
                        style={{ background: "#0f1f18" }}
                      >
                        {o}
                      </option>
                    ))}
                  </select>
                  {errors.budget && (
                    <p className="text-red-400 text-[10px] mt-1">
                      {errors.budget}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-2 font-sans">
                  Pick a Date
                </p>
                <div
                  className={
                    errors.date ? "p-3 rounded-xl border border-red-400/30" : ""
                  }
                >
                  <MiniCalendar
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setSelectedTime(null);
                      if (errors.date) setErrors({ ...errors, date: null });
                    }}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.date}</p>
                )}
              </div>

              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-2 font-sans">
                    Available Times
                  </p>
                  <div
                    className={`grid grid-cols-4 gap-1.5 ${errors.time ? "p-2 rounded-xl border border-red-400/30" : ""}`}
                  >
                    {getTimesForDate(selectedDate).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedTime(t);
                          if (errors.time) setErrors({ ...errors, time: null });
                        }}
                        className={`text-[10px] font-semibold py-1.5 rounded-lg border transition-all font-sans
                          ${
                            selectedTime === t ?
                              "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                            : "border-white/10 text-white/50 hover:border-accent hover:text-accent hover:bg-accent/10"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.time && (
                    <p className="text-red-400 text-[10px] mt-1">
                      {errors.time}
                    </p>
                  )}
                </motion.div>
              )}

              {selectedTime && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  {submitting ?
                    "Submitting..."
                  : <>
                      Confirm Appointment <ArrowRight className="w-4 h-4" />
                    </>
                  }
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── STEP 2B: SERVICE ── */}
          {step === 2 && appointmentType === "service" && (
            <motion.div
              key="step2b"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-accent mb-4 transition-colors font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-white/90 uppercase tracking-wider mb-1 font-sans">
                  Describe the Issue
                </label>
                <textarea
                  rows={6}
                  placeholder="Tell us what's going on with your cart — make, model, symptoms, etc."
                  value={form.serviceDescription}
                  onChange={(e) => set("serviceDescription", e.target.value)}
                  className={
                    inputCls(errors.serviceDescription) + " resize-none"
                  }
                />
                {errors.serviceDescription && (
                  <p className="text-red-400 text-[10px] mt-0.5">
                    Please describe the issue.
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                {submitting ?
                  "Sending..."
                : <>
                    Send Service Request <ArrowRight className="w-4 h-4" />
                  </>
                }
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
