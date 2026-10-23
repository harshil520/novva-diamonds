"use client";

import React, { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Loader2 } from "lucide-react";
import type { Diamond } from "@/types/diamond";
import { siteConfig } from "@/config/config";
import { getConciergeWhatsAppUrl, getDiamondWhatsAppUrl } from "@/lib/whatsapp";
import { EASE_LUXE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button, ArrowGlyph } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useToast } from "@/components/providers/ToastProvider";

export type EnquiryTopic = "Specific Stone" | "Custom Sourcing" | "Bulk / Trade" | "Certification" | "General";

const TOPICS: EnquiryTopic[] = ["Specific Stone", "Custom Sourcing", "Bulk / Trade", "Certification", "General"];

const TOPIC_LABELS: Record<EnquiryTopic, string> = {
  "Specific Stone": "A listed diamond",
  "Custom Sourcing": "Find me a diamond",
  "Bulk / Trade": "Bulk order",
  Certification: "Certificates",
  General: "Other",
};

interface Props {
  diamond?: Diamond | null;
  topic?: EnquiryTopic;
  compact?: boolean;
}

type Errors = Partial<Record<"name" | "email" | "message", string>>;

function defaultMessage(diamond?: Diamond | null) {
  if (!diamond) return "";
  return `Please share the price, a video and delivery details for the ${diamond.carat.toFixed(
    2
  )} ct ${diamond.shape} (${diamond.color} / ${diamond.clarity}, ${diamond.certification.laboratory} ${
    diamond.certification.certificateNumber
  }).`;
}

export default function EnquiryForm({ diamond, topic, compact = false }: Props) {
  const uid = useId();
  const toast = useToast();
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    inquiryType: topic ?? (diamond ? "Specific Stone" : "General"),
    message: defaultMessage(diamond),
  });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key as keyof Errors]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!values.name.trim()) e.name = "Please tell us your name.";
    if (!values.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = "Please enter a valid email.";
    if (!values.message.trim()) e.message = "A line or two about what you are looking for.";
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`${uid}-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setState("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, diamondId: diamond?.id ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "We could not send your enquiry.");
      setReference(data.referenceId);
      setState("sent");
      toast({ tone: "success", title: "Enquiry received", description: "We will reply soon." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "We could not send your enquiry.";
      setServerError(msg);
      setState("idle");
      toast({ tone: "error", title: "Not sent", description: "Please try again or message us on WhatsApp." });
    }
  };

  const whatsapp = diamond ? getDiamondWhatsAppUrl(diamond) : getConciergeWhatsAppUrl({ topic: "general" });

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_LUXE }}
          className="py-6 text-center"
        >
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE_LUXE }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory"
          >
            <Check className="h-6 w-6" strokeWidth={1.5} />
          </motion.span>
          <h3 className="display mt-6 text-3xl">Thank you{values.name ? `, ${values.name.split(" ")[0]}` : ""}.</h3>
          <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-mute">
            We have your enquiry and will reply soon.
          </p>
          {reference && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(reference).then(
                  () => toast({ tone: "info", title: "Reference copied" }),
                  () => undefined
                );
              }}
              className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[12.5px] text-ink-soft transition-colors hover:border-ink/40"
            >
              <span className="text-mute">Reference</span>
              <span className="numeric font-medium tracking-wide">{reference}</span>
              <Copy className="h-3.5 w-3.5 text-mute" strokeWidth={1.5} />
            </button>
          )}
          <div className="mt-8">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw inline-flex items-center gap-2 text-[13.5px] font-medium"
            >
              <WhatsAppIcon size={15} /> Or chat on WhatsApp
            </a>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          <div className={cn("grid gap-5", !compact && "sm:grid-cols-2")}>
            <Field id={`${uid}-name`} label="Full name" required error={errors.name}>
              <input id={`${uid}-name`} autoComplete="name" value={values.name} onChange={set("name")} className={inputCls(errors.name)} data-autofocus />
            </Field>
            <Field id={`${uid}-email`} label="Email" required error={errors.email}>
              <input id={`${uid}-email`} type="email" autoComplete="email" value={values.email} onChange={set("email")} className={inputCls(errors.email)} />
            </Field>
            <Field id={`${uid}-phone`} label="Phone or WhatsApp">
              <input id={`${uid}-phone`} type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} className={inputCls()} />
            </Field>
            <Field id={`${uid}-country`} label="Delivery country">
              <select id={`${uid}-country`} value={values.country} onChange={set("country")} className={cn(inputCls(), "appearance-none")}>
                <option value="">Select…</option>
                {siteConfig.shipping.markets.map((m) => (
                  <option key={m.code} value={m.name}>
                    {m.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>

          <fieldset>
            <legend className="mb-2.5 text-[12px] text-mute">What is this about?</legend>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setValues((v) => ({ ...v, inquiryType: t }))}
                  aria-pressed={values.inquiryType === t}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors duration-300",
                    values.inquiryType === t ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft hover:border-ink/40"
                  )}
                >
                  {TOPIC_LABELS[t]}
                </button>
              ))}
            </div>
          </fieldset>

          {diamond && (
            <div className="flex items-center justify-between rounded-2xl bg-porcelain/70 px-4 py-3 text-[12.5px]">
              <span className="text-mute">Diamond ID</span>
              <span className="numeric font-medium tracking-wide">{diamond.id}</span>
            </div>
          )}

          <Field id={`${uid}-message`} label="Message" required error={errors.message}>
            <textarea
              id={`${uid}-message`}
              rows={compact ? 3 : 4}
              value={values.message}
              onChange={set("message")}
              placeholder="Shape, carat, colour, clarity…"
              className={cn(inputCls(errors.message), "resize-none py-3 leading-relaxed")}
            />
          </Field>

          {serverError && (
            <p role="alert" className="rounded-2xl border border-danger/25 bg-danger/5 px-4 py-3 text-[13px] text-danger">
              {serverError}{" "}
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="underline">
                Message us on WhatsApp instead.
              </a>
            </p>
          )}

          <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11.5px] leading-relaxed text-faint">We never share your details.</p>
            <Button type="submit" size="lg" disabled={state === "sending"} className="sm:min-w-[190px]">
              {state === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending
                </>
              ) : (
                <>
                  Send enquiry <ArrowGlyph />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function inputCls(error?: string) {
  return cn(
    "h-12 w-full rounded-xl border bg-paper px-4 text-[14px] text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-faint",
    error ? "border-danger/60 focus:border-danger" : "border-line hover:border-line-strong focus:border-ink focus:shadow-[0_0_0_4px_rgb(18_18_18/0.05)]"
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] text-mute">
        {label}
        {required && <span className="text-champagne"> *</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-[12px] text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
