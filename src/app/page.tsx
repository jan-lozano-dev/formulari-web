"use client";

import { useState, useCallback } from "react";
import MarionetteAnimation from "@/components/MarionetteAnimation";

export default function Home() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [formData, setFormData] = useState({
    nom: "",
    cognoms: "",
    telefon: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAnimationEnd = useCallback(() => {
    setShowAnimation(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

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
        setMessage({ type: "success", text: "Registre completat correctament!" });
        setFormData({ nom: "", cognoms: "", telefon: "" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Error en el registre" });
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
              onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
              required
              pattern="[0-9]*"
              className="w-full px-3 py-2 border border-white rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              placeholder="Escriu el teu numero bé..."
            />
          </div>

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
