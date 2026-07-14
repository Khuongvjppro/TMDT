"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "How do I create a candidate or employer profile?",
    answer: "You can click on 'Register' in the top-right header, select either Candidate or Employer, and complete the registration form. Candidates can immediately upload portfolios, and employers can start creating job drafts.",
  },
  {
    question: "How does the matching score work?",
    answer: "JobFinder compares candidate skill tags, experience, and location preferences with the job requirements set by employers. Matches above 80% receive recommendation highlights in recruiter dashboards.",
  },
  {
    question: "What should I do if I forget my password?",
    answer: "Go to the Login page and click on 'Forgot Password'. Enter your registered email address, and we will send a password reset link to recover your account.",
  },
  {
    question: "How can I purchase premium hiring packages?",
    answer: "Employers can access package options by navigating to the Billing section within their dashboard. We support a variety of payment methods including mockup credit cards and banking links.",
  },
];

const CATEGORIES = [
  "General Inquiry",
  "Account & Login issues",
  "Billing & Packages",
  "Job Posting Help",
  "Bug Report",
];

export default function ContactPage() {
  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: CATEGORIES[0],
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.subject.trim()) newErrors.subject = "Subject is required";
    if (!form.message.trim()) {
      newErrors.message = "Message cannot be empty";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate database delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTicketId(`JF-${Math.floor(100000 + Math.random() * 900000)}`);
      setForm({
        name: "",
        email: "",
        category: CATEGORIES[0],
        subject: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <section className="space-y-12 py-8 relative">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-10 -z-10 h-[450px] w-[450px] rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

      {/* Header Info */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/50 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm backdrop-blur-sm">
          <span>Support Center</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          How can we{" "}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent bg-clip-text text-transparent">
            help you
          </span>{" "}
          today?
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Have an inquiry, billing issue, or need help with recruitment? Submit a ticket below or browse our quick answers.
        </p>
      </div>

      {/* Primary Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left Side: Support Channels & FAQs */}
        <div className="space-y-8">
          {/* Quick Channels Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900">Direct Contact Channels</h2>
            <div className="space-y-4 text-xs">
              {/* Address */}
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Office Location</p>
                  <p className="text-slate-500 mt-0.5">District 5, Ho Chi Minh City, Vietnam</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Email Support</p>
                  <p className="text-slate-500 mt-0.5">support@jobfinder.tmdt.com</p>
                </div>
              </div>

              {/* Hotline */}
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Hotline</p>
                  <p className="text-slate-500 mt-0.5">+84 (0) 28 3835 4409 (Mon - Fri, 8 AM - 5 PM)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible FAQs */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between p-4 text-left font-bold text-slate-900 transition-colors hover:bg-slate-50 text-sm"
                    >
                      <span>{faq.question}</span>
                      <span
                        className={`ml-2 text-slate-400 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] border-t border-slate-100" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="p-4 text-xs leading-relaxed text-slate-500 bg-slate-50/50">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Form / Success Card */}
        <div className="relative">
          {submitSuccess ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-6 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <svg className="h-8 w-8 animate-bounce" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">Support Ticket Created!</h3>
                <p className="text-sm text-slate-500">
                  Thank you for reaching out. We have logged your request under ticket ID:
                </p>
                <div className="inline-block rounded-xl bg-slate-100 px-4 py-2 font-mono text-sm font-bold text-slate-700 border border-slate-200">
                  {ticketId}
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                A copy of this ticket has been generated. Our team typically responds within 2-4 business hours.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="w-full rounded-2xl bg-brand-500 py-3 text-xs font-bold text-white shadow hover:bg-brand-600 transition"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Open Support Ticket</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label htmlFor="name" className="text-[11px] uppercase font-bold text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className={`w-full rounded-xl border px-4 py-3 text-xs outline-none transition focus:ring-2 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                    }`}
                  />
                  {errors.name && <p className="text-[10px] font-bold text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-[11px] uppercase font-bold text-slate-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="yourname@domain.com"
                    className={`w-full rounded-xl border px-4 py-3 text-xs outline-none transition focus:ring-2 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                    }`}
                  />
                  {errors.email && <p className="text-[10px] font-bold text-red-500">{errors.email}</p>}
                </div>

                {/* Category & Subject */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="category" className="text-[11px] uppercase font-bold text-slate-500">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject" className="text-[11px] uppercase font-bold text-slate-500">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleInputChange}
                      placeholder="Summary of inquiry"
                      className={`w-full rounded-xl border px-4 py-3 text-xs outline-none transition focus:ring-2 ${
                        errors.subject
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                      }`}
                    />
                    {errors.subject && <p className="text-[10px] font-bold text-red-500">{errors.subject}</p>}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label htmlFor="message" className="text-[11px] uppercase font-bold text-slate-500">
                    Detailed Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleInputChange}
                    placeholder="Provide full description of your issue or request..."
                    className={`w-full rounded-xl border px-4 py-3 text-xs outline-none transition focus:ring-2 resize-none ${
                      errors.message
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                    }`}
                  />
                  {errors.message && <p className="text-[10px] font-bold text-red-500">{errors.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 rounded-2xl bg-brand-500 py-3 text-xs font-bold text-white shadow transition hover:bg-brand-600 disabled:bg-brand-300"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
