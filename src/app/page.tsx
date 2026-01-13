"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import MarionetteAnimation from "@/components/MarionetteAnimation";

function isValidSpanishPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return /^[679]\d{8}$/.test(cleaned);
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-02-12T00:00:00").getTime();

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
  const [showAnimation, setShowAnimation] = useState(true);
  const [formData, setFormData] = useState({
    nom: "",
    cognoms: "",
    telefon: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showFinalPhoto, setShowFinalPhoto] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleAnimationEnd = useCallback(() => {
    setShowAnimation(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPhoneError(null);

    if (!isValidSpanishPhone(formData.telefon)) {
      setPhoneError("Número invàlid. Ha de tenir 9 dígits i començar per 6, 7 o 9.");
      return;
    }

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
        }),
      });

      if (response.ok) {
        setShowFinalPhoto(true);
      } else {
        const error = await response.json();
        if (error.code === "PHONE_EXISTS") {
          setPhoneError(error.message);
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

  if (showAnimation) {
    return <MarionetteAnimation onAnimationEnd={handleAnimationEnd} />;
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
    <main className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-black border border-white rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          12/02, XX:XX,???
        </h1>

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
              className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              placeholder="hola"
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
              className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              placeholder="Corre a apuntarte..."
            />
          </div>

          <div>
            <label htmlFor="telefon" className="block text-sm font-medium text-white mb-1">
              Numero de telefon
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
              placeholder="Escriu el teu numero bé..."
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center">
            Festa privada. +18. 10€ per la comuna de la barra lliure.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Enviant..." : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}
