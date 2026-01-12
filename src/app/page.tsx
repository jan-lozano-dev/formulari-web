"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    nom: "",
    cognoms: "",
    telefon: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Formulari de Registre
        </h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="El teu nom"
            />
          </div>

          <div>
            <label htmlFor="cognoms" className="block text-sm font-medium text-gray-700 mb-1">
              Cognoms
            </label>
            <input
              type="text"
              id="cognoms"
              value={formData.cognoms}
              onChange={(e) => setFormData({ ...formData, cognoms: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Els teus cognoms"
            />
          </div>

          <div>
            <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
              Numero de telefon
            </label>
            <input
              type="tel"
              id="telefon"
              value={formData.telefon}
              onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
              required
              pattern="[0-9]*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="123456789"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Enviant..." : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}
