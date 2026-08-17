// Cloudflare Worker — alternative à /api/chat.js si le site est servi
// depuis GitHub Pages (qui n'exécute pas de code serveur) plutôt que Vercel.
//
// Déploiement :
//   1. wrangler login
//   2. wrangler secret put ANTHROPIC_API_KEY
//   3. wrangler deploy
// Le Worker expose une URL du type https://exyro-chat.<compte>.workers.dev
// que assistant.js appelle en fetch() depuis GitHub Pages (CORS ouvert
// uniquement vers exyro.be ci-dessous — à ajuster).

const ALLOWED_ORIGIN = "https://www.exyro.be";

const SYSTEM_PROMPT = `Tu es l'assistant immobilier d'EXYRO, société belge de gestion locative
(plus de 1 100 baux actifs, présence sur tout le territoire belge).
Réponds de façon factuelle aux questions sur la location immobilière en Belgique.
Reste concis (4-6 phrases) et termine toujours par une phrase orientant vers
la délégation à un property manager comme EXYRO.`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { message } = await request.json();
    if (!message) {
      return json({ error: "Missing 'message'" }, 400);
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!upstream.ok) {
      return json({ error: "Upstream error" }, 502);
    }

    const data = await upstream.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    return json({ reply: text }, 200);
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
