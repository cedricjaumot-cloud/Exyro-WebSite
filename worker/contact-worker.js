// Cloudflare Worker : envoi des messages écrits depuis les pages individuelles de l'équipe (exyro.be/equipe/...).
//
// Principe : le visiteur remplit le formulaire, le worker vérifie le message puis l'envoie par e-mail
// à la personne concernée via Brevo (service d'envoi que vous utilisez déjà pour exyro.be).
// L'adresse du destinataire est fixée ICI, jamais envoyée par le navigateur : personne ne peut s'en servir
// pour envoyer des e-mails à d'autres adresses.
//
// Déploiement : voir les étapes données dans la conversation.
//   - Créer un nouveau worker (par exemple "exyro-contact"), coller ce code, Deploy.
//   - Settings -> Variables and Secrets -> Secret BREVO_API_KEY (clé API Brevo).
//   - Copier l'URL du worker dans CONTACT_URL, en haut de assets/equipe.js.

const ALLOWED_ORIGINS = [
  "https://www.exyro.be",
  "https://exyro.be",
  "https://cedricjaumot-cloud.github.io",
];

// Expéditeur : une adresse de votre domaine exyro.be, validée dans Brevo.
const SENDER = { name: "Site exyro.be", email: "site@exyro.be" };

const RECIPIENTS = {
  "adam-el-idrissi": { name: "Adam El Idrissi", email: "adam.elidrissi@exyro.be" },
  "cedric-jaumot": { name: "Cedric Jaumot", email: "cedric.jaumot@exyro.be" },
  "edouard-buyck": { name: "Edouard Buyck", email: "edouard.buyck@exyro.be" },
  "lien-vanderper": { name: "Lien Vanderper", email: "lien.vanderper@exyro.be" },
  "marine-capelle": { name: "Marine Capelle", email: "marine.capelle@exyro.be" },
  "odile-snickers": { name: "Odile Snickers", email: "odile.snickers@exyro.be" },
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(request) });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const origin = request.headers.get("Origin");
    if (!ALLOWED_ORIGINS.includes(origin)) return reply(request, { error: "Forbidden" }, 403);

    let b;
    try { b = await request.json(); } catch { return reply(request, { error: "Invalid JSON" }, 400); }

    // Robots : champ piège rempli, ou formulaire envoyé en moins de 3 secondes -> on fait comme si c'était parti.
    if (b.website || (typeof b.elapsed === "number" && b.elapsed < 3000)) return reply(request, { ok: true }, 200);

    const to = RECIPIENTS[b.slug];
    const name = String(b.name || "").trim().slice(0, 120);
    const email = String(b.email || "").trim().slice(0, 200);
    const phone = String(b.phone || "").trim().slice(0, 40);
    const message = String(b.message || "").trim().slice(0, 4000);
    if (!to || !name || !/^\S+@\S+\.\S+$/.test(email) || !message) return reply(request, { error: "Invalid input" }, 400);

    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const html =
      `<p><strong>${esc(name)}</strong> vous a écrit depuis votre page sur exyro.be.</p>` +
      `<p>E-mail : ${esc(email)}${phone ? "<br>Téléphone : " + esc(phone) : ""}</p>` +
      `<hr><p style="white-space:pre-wrap">${esc(message)}</p>` +
      `<hr><p style="color:#888;font-size:12px">Répondez directement à ce message : la réponse ira à ${esc(email)}.</p>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: to.email, name: to.name }],
        replyTo: { email, name },
        subject: `Message via exyro.be de ${name}`,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error("Brevo error", res.status, await res.text());
      return reply(request, { error: "Send failed" }, 502);
    }
    return reply(request, { ok: true }, 200);
  },
};

function cors(request) {
  const o = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function reply(request, obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...cors(request) } });
}
