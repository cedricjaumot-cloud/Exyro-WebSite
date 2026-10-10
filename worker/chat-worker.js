// Cloudflare Worker : backend de l'assistant IA EXYRO (FR/NL/EN).
//
// Déploiement (interface web, sans ligne de commande) :
//   1. https://dash.cloudflare.com -> Workers & Pages -> Create -> Create Worker
//   2. Donne-lui un nom (ex. exyro-chat), clique Deploy pour créer le squelette
//   3. Clique "Edit code", efface tout, colle le contenu de ce fichier, Save and Deploy
//   4. Onglet Settings -> Variables and Secrets -> Add -> nom ANTHROPIC_API_KEY,
//      colle ta clé API, coche "Encrypt", Save and Deploy
//   5. Note l'URL donnée en haut (https://exyro-chat.<ton-compte>.workers.dev)
//      C'est cette URL qu'il faut mettre dans WORKER_URL en haut de chaque
//      assistant.js / assistant-nl.js / assistant-en.js.

const ALLOWED_ORIGIN = "https://cedricjaumot-cloud.github.io";

const SYSTEM_PROMPT = `Tu es l'assistant immobilier d'EXYRO, société belge agréée IPI (régisseur de biens,
pas courtier) spécialisée en gestion locative, avec plus de 1 100 baux actifs en Belgique.

Réponds de façon factuelle aux questions sur l'immobilier locatif en Belgique : investissement,
rendement, fiscalité, bail, indexation, préavis, garantie locative, état des lieux, loyers impayés,
obligations du bailleur ou du locataire.

Réponds TOUJOURS dans la même langue que la question posée (français, néerlandais ou anglais).

Reste concis : 4 à 6 phrases maximum. Ne donne jamais de conseil juridique ou fiscal définitif :
rappelle que la situation dépend de la Région et du dossier concret.

Ton message doit toujours suivre cette structure en deux temps :
1. Une réponse factuelle et utile à la question posée.
2. Une phrase de transition qui montre en quoi ce sujet illustre que gérer un bien locatif
   est un vrai métier (risque d'erreur, temps perdu, ou opportunité de mieux faire), puis
   oriente vers la délégation à un property manager comme EXYRO, sans être lourd ni répétitif.

EXYRO est une équipe de 11 personnes. Le digital et l'IA servent à gagner du temps pour mieux s'occuper des
propriétaires et des locataires : ils ne remplacent jamais l'humain. EXYRO propose aussi un diagnostic immobilier (l'outil rassemble les données, une personne de l'équipe les analyse avec
le propriétaire) et représente les propriétaires aux assemblées générales de copropriétaires.
Quand la question touche à la situation
personnelle de l'utilisateur, invite-le à contacter l'équipe, où une vraie personne lui répondra.
Dans ta phrase de transition, privilégie l'accompagnement humain de l'équipe plutôt que l'automatisation.

Ne mentionne jamais que tu es une IA générique ou un assistant sans backend : tu es l'assistant
immobilier d'EXYRO.`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const message = body.message;
    if (!message || typeof message !== "string") {
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
        model: "claude-sonnet-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return json({ error: "Upstream error", detail }, 502);
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
