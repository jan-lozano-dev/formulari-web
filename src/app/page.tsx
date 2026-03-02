"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

function isValidSpanishPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return /^[679]\d{8}$/.test(cleaned);
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-03-12T00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-white text-center mt-6">
      <p className="text-sm text-gray-400 mb-2">Queda...</p>
      <div className="flex justify-center gap-4 text-2xl font-bold">
        <div className="flex flex-col items-center">
          <span>{timeLeft.days}</span>
          <span className="text-xs text-gray-400">dies</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="text-xs text-gray-400">hores</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="text-xs text-gray-400">min</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="text-xs text-gray-400">seg</span>
        </div>
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          cognoms: formData.cognoms,
          telefon: parseInt(formData.telefon, 10),
          email: formData.email,
          website: honeypotRef.current?.value ?? "",
        }),
      });

      if (response.ok) {
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
      <main className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="w-full max-w-md bg-black border border-white rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Aforament complet</h1>
          <p className="text-gray-400">Gràcies pel teu interès. Les inscripcions estan tancades.</p>
        </div>
      </main>
    );
  }

  if (showFinalPhoto) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <Image
          src="/foto-final.png"
          alt="Registre completat"
          width={500}
          height={500}
          className="max-w-full h-auto"
          priority
        />
        <Countdown />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-black border border-white rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Axerum Vilanova: 12/03, 22:30
        </h1>
        {remaining !== null && (
          <p className={`text-center text-sm mb-4 ${remaining < 50 ? "text-red-400" : "text-gray-400"}`}>
            {remaining < 50 ? `⚠ Queden ${remaining} llocs!` : `Queden ${remaining} llocs`}
          </p>
        )}

        {message && (
          <div
            className={`mb-4 p-3 rounded border ${
              message.type === "success"
                ? "border-white text-white"
                : "border-gray-500 text-gray-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-white mb-1">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              placeholder="Joan"
            />
          </div>

          <div>
            <label htmlFor="cognoms" className="block text-sm font-medium text-white mb-1">
              Cognoms
            </label>
            <input
              type="text"
              id="cognoms"
              value={formData.cognoms}
              onChange={(e) => setFormData({ ...formData, cognoms: e.target.value })}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              placeholder="Corre a apuntar-te..."
            />
          </div>

          <div>
            <label htmlFor="telefon" className="block text-sm font-medium text-white mb-1">
              Número de telèfon
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
              pattern="[0-9]*"
              className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              placeholder="Escriu el teu número bé..."
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Correu electrònic
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
              className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              placeholder="nom@exemple.com"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Honeypot: invisible to users, bots fill it and get silently rejected */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />

          <p className="text-xs text-gray-400 text-center">
            Festa privada. +18.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !formData.nom || !formData.cognoms || !formData.telefon || !formData.email}
            className="w-full bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Enviant..." : "Enviar"}
          </button>
        </form>
      </div>
      <p className="text-sm text-gray-400 text-center mt-4">
        Entrada gratuïta abans de les 12 amb inscripció i carnet universitari.<br />
        2x1 en cubates abans de les 00:00.
      </p>
    </main>
  );
}
