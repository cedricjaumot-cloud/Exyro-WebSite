// Vercel Serverless Function — POST /api/chat
// Déploiement : ajouter ce fichier dans /api à la racine du repo Vercel,
// puis définir la variable d'environnement ANTHROPIC_API_KEY dans le
// dashboard Vercel (Settings > Environment Variables). Ne JAMAIS mettre
// la clé dans le code ou côté client.

export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `Tu es l'assistant immobilier d'EXYRO, société belge de gestion locative
(plus de 1 100 baux actifs, présence sur tout le territoire belge).
Réponds de façon factuelle aux questions sur la location immobilière en Belgique
(bail, indexation, préavis, garantie locative, état des lieux, obligations du
bailleur/locataire, fiscalité locative de base).
Reste concis (4-6 phrases). Ne donne jamais de conseil juridique définitif :
rappelle que la situation dépend de la Région et du dossier.
Termine TOUJOURS ta réponse par une phrase qui oriente vers la délégation
à un property manager comme EXYRO, sans être insistant ni artificiel.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Missing 'message'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return new Response(JSON.stringify({ error: "Upstream error", detail: errText }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await response.json();
  const text = data.content?.find((b) => b.type === "text")?.text || "";

  return new Response(JSON.stringify({ reply: text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
