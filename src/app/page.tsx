"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

function isValidSpanishPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return /^[679]\d{8}$/.test(cleaned);
}

// Event time: March 12 2026 at 22:30 CET = 21:30 UTC (before DST switch on March 29)
const TARGET_DATE = new Date("2026-03-12T21:30:00Z").getTime();

function calcTimeLeft() {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) return null; // null signals the event has started
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function Countdown() {
  // undefined = not yet hydrated (server + client render the same empty state)
  // null      = event has started
  // object    = countdown running
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof calcTimeLeft> | undefined>(undefined);

  useEffect(() => {
    // Only runs on the client — avoids server/client hydration mismatch
    setTimeLeft(calcTimeLeft());
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft === undefined) return null;
  if (!timeLeft) {
    return (
      <p className="text-center mt-8 flicker" style={{ color: '#9eff00', fontFamily: '"Extenda 100 Yotta", sans-serif', fontSize: '1.8rem', letterSpacing: '0.1em', textShadow: '0 0 30px rgba(158,255,0,0.4)' }}>
        GAUDEIX DE LA FESTA
      </p>
    );
  }

  return (
    <div className="text-center mt-8">
      <p style={{ color: 'rgba(158,255,0,0.4)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Queda
      </p>
      <div className="flex justify-center gap-6">
        {[
          { value: String(timeLeft.days), label: 'dies' },
          { value: String(timeLeft.hours).padStart(2, '0'), label: 'hores' },
          { value: String(timeLeft.minutes).padStart(2, '0'), label: 'min' },
          { value: String(timeLeft.seconds).padStart(2, '0'), label: 'seg' },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span style={{ color: '#9eff00', fontFamily: '"Extenda 100 Yotta", sans-serif', fontSize: '3rem', lineHeight: 1, textShadow: '0 0 20px rgba(158,255,0,0.5)' }}>
              {value}
            </span>
            <span style={{ color: 'rgba(158,255,0,0.35)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState({
    nom: "",
    cognoms: "",
    telefon: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showFinalPhoto, setShowFinalPhoto] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  // Honeypot ref: hidden from real users, bots will fill it automatically
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Fetch remaining spots on load
  useEffect(() => {
    fetch("/api/registre/count")
      .then((r) => r.json())
      .then((data) => setRemaining(data.remaining))
      .catch(() => null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPhoneError(null);
    setEmailError(null);

    let hasError = false;

    if (!isValidSpanishPhone(formData.telefon)) {
      setPhoneError("Número invàlid. Ha de tenir 9 dígits i començar per 6, 7 o 9.");
      hasError = true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError("Correu electrònic invàlid.");
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/registre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          cognoms: formData.cognoms,
          telefon: parseInt(formData.telefon.replace(/\s/g, ""), 10),
          email: formData.email,
          website: honeypotRef.current?.value ?? "",
        }),
      });

      if (response.ok) {
        // Decrement remaining locally so the count stays accurate without a refetch
        setRemaining((r) => (r !== null ? r - 1 : null));
        setShowFinalPhoto(true);
      } else {
        const error = await response.json();
        if (error.code === "PHONE_EXISTS") {
          setPhoneError(error.message);
        } else if (error.code === "EMAIL_EXISTS") {
          setEmailError(error.message);
        } else {
          setMessage({ type: "error", text: error.message || "Error en el registre" });
        }
      }
    } catch {
      setMessage({ type: "error", text: "Error de connexió" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show full capacity screen before rendering the form
  if (remaining === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black p-4 scanline">
        <div className="fade-up text-center">
          <p style={{ color: 'rgba(158,255,0,0.4)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            — accés tancat —
          </p>
          <h1 style={{ color: '#9eff00', fontFamily: '"Extenda 100 Yotta", sans-serif', fontSize: 'clamp(3.5rem, 18vw, 7rem)', lineHeight: 0.88, textShadow: '0 0 60px rgba(158,255,0,0.25)' }}>
            AFORAMENT<br />COMPLET
          </h1>
          <p style={{ color: 'rgba(158,255,0,0.3)', marginTop: '2rem', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
            Gràcies pel teu interès.<br />Les inscripcions estan tancades.
          </p>
        </div>
      </main>
    );
  }

  if (showFinalPhoto) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black p-4 scanline">
        <div className="fade-up w-full max-w-sm">
          <div style={{ border: '1px solid rgba(158,255,0,0.25)', boxShadow: '0 0 60px rgba(158,255,0,0.08)' }}>
            <Image
              src="/fotoAxerumGranFinal.jpeg"
              alt="Registre completat"
              width={500}
              height={500}
              className="max-w-full h-auto block"
            />
          </div>
          <Countdown />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black px-6 py-10 scanline">

      {/* Top divider */}
      <div className="w-full max-w-md mb-6 fade-up" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(158, 255, 0, 0.2)' }} />
          <span style={{ color: 'rgba(158, 255, 0, 0.45)', fontFamily: '"Extenda 100 Yotta", sans-serif', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            accés privat
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(158, 255, 0, 0.2)' }} />
        </div>
      </div>

      {/* Title */}
      <div className="w-full max-w-md mb-8 fade-up flicker" style={{ animationDelay: '80ms' }}>
        <h1 style={{ fontFamily: '"Extenda 100 Yotta", sans-serif', color: '#9eff00', fontSize: 'clamp(3rem, 14vw, 5.5rem)', lineHeight: 0.88, letterSpacing: '-0.01em', textShadow: '0 0 80px rgba(158, 255, 0, 0.18)' }}>
          LLISTA<br />CONVIDATS<br />HUERTO
        </h1>
      </div>

      {/* Form container */}
      <div className="w-full max-w-md relative fade-up" style={{ animationDelay: '160ms', border: '1px solid rgba(158, 255, 0, 0.18)', padding: '2rem', background: 'rgba(158, 255, 0, 0.015)' }}>
        {/* Corner brackets */}
        <span style={{ position: 'absolute', top: -1, left: -1, display: 'block', width: 10, height: 10, borderTop: '2px solid #9eff00', borderLeft: '2px solid #9eff00' }} />
        <span style={{ position: 'absolute', top: -1, right: -1, display: 'block', width: 10, height: 10, borderTop: '2px solid #9eff00', borderRight: '2px solid #9eff00' }} />
        <span style={{ position: 'absolute', bottom: -1, left: -1, display: 'block', width: 10, height: 10, borderBottom: '2px solid #9eff00', borderLeft: '2px solid #9eff00' }} />
        <span style={{ position: 'absolute', bottom: -1, right: -1, display: 'block', width: 10, height: 10, borderBottom: '2px solid #9eff00', borderRight: '2px solid #9eff00' }} />

        {message && (
          <div
            role="alert"
            className="mb-6 p-3 text-xs tracking-wider"
            style={{ border: '1px solid', borderColor: message.type === 'error' ? 'rgba(255,80,80,0.4)' : 'rgba(158,255,0,0.4)', color: message.type === 'error' ? '#ff6060' : '#9eff00', background: message.type === 'error' ? 'rgba(255,80,80,0.05)' : 'rgba(158,255,0,0.05)' }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label htmlFor="nom" className="block mb-2" style={{ color: 'rgba(158, 255, 0, 0.5)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Nom
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              maxLength={100}
              autoComplete="given-name"
              className="neon-input"
              placeholder="Joan"
            />
          </div>

          <div>
            <label htmlFor="cognoms" className="block mb-2" style={{ color: 'rgba(158, 255, 0, 0.5)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Cognoms
            </label>
            <input
              type="text"
              id="cognoms"
              value={formData.cognoms}
              onChange={(e) => setFormData({ ...formData, cognoms: e.target.value })}
              required
              maxLength={100}
              autoComplete="family-name"
              className="neon-input"
              placeholder="Garcia"
            />
          </div>

          <div>
            <label htmlFor="telefon" className="block mb-2" style={{ color: 'rgba(158, 255, 0, 0.5)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Telèfon
            </label>
            <input
              type="tel"
              id="telefon"
              value={formData.telefon}
              onChange={(e) => {
                setFormData({ ...formData, telefon: e.target.value });
                setPhoneError(null);
              }}
              required
              maxLength={12}
              inputMode="numeric"
              autoComplete="tel"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? "telefon-error" : undefined}
              className="neon-input"
              placeholder="6XX XXX XXX"
            />
            {phoneError && (
              <p id="telefon-error" role="alert" className="mt-2 text-xs tracking-wide" style={{ color: '#ff6060' }}>{phoneError}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block mb-2" style={{ color: 'rgba(158, 255, 0, 0.5)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Correu
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setEmailError(null);
              }}
              required
              maxLength={254}
              autoComplete="email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className="neon-input"
              placeholder="nom@exemple.com"
            />
            {emailError && (
              <p id="email-error" role="alert" className="mt-2 text-xs tracking-wide" style={{ color: '#ff6060' }}>{emailError}</p>
            )}
          </div>

          {/* Honeypot */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />

          <p className="text-center" style={{ color: 'rgba(158, 255, 0, 0.22)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Festa privada · +18
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !formData.nom || !formData.cognoms || !formData.telefon || !formData.email}
            className="neon-btn"
          >
            {isSubmitting ? "ENVIANT..." : "REGISTRAR"}
          </button>
        </form>
      </div>

      {/* Bottom text */}
      <p className="mt-6 fade-up" style={{ animationDelay: '280ms', color: '#9eff00', fontFamily: '"Extenda 100 Yotta", sans-serif', fontSize: '0.9rem', letterSpacing: '0.15em' }}>
        més info per privat
      </p>

    </main>
  );
}
