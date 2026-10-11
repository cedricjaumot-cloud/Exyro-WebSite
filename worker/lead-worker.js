// Cloudflare Worker : demandes "Déléguer mon bien" envoyées depuis exyro.be (FR, NL, EN).
//
// Principe : le visiteur remplit le formulaire, le worker vérifie la demande puis
//   1) crée une opportunité dans le CRM Odoo (étape "Nouveau"), attribuée selon la langue :
//        FR -> Marine, NL -> Edouard, EN -> Adam
//   2) envoie un e-mail d'alerte (Brevo) au responsable et à la boîte générale.
// Si Odoo est indisponible, l'e-mail part quand même : aucune demande ne se perd.
//
// Déploiement : voir les étapes données dans la conversation.
//   - Nouveau worker (par exemple "exyro-lead"), coller ce code, Deploy.
//   - Settings -> Variables and Secrets -> deux secrets :
//        ODOO_API_KEY  (clé API de l'utilisateur Odoo "Site web")
//        BREVO_API_KEY (la même clé Brevo que pour exyro-contact)
//   - Copier l'URL du worker dans LEAD_URL, en haut de assets/lead.js.

const ALLOWED_ORIGINS = [
  "https://www.exyro.be",
  "https://exyro.be",
  "https://cedricjaumot-cloud.github.io",
];

const ODOO_URL = "https://exyro-be.odoo.com";
const SENDER = { name: "Site exyro.be", email: "site@exyro.be" };

// Responsable de chaque langue : e-mail = identifiant (login) de l'utilisateur dans Odoo.
const OWNERS = {
  fr: { name: "Marine Capelle", email: "marine.capelle@exyro.be", inbox: "gestion@exyro.be" },
  nl: { name: "Edouard Buyck", email: "edouard.buyck@exyro.be", inbox: "beheer@exyro.be" },
  en: { name: "Adam El Idrissi", email: "adam.elidrissi@exyro.be", inbox: "beheer@exyro.be" },
};

const TYPES = {
  appartement: "Appartement", maison: "Maison", immeuble: "Immeuble de rapport",
  commerce: "Commerce / bureau", autre: "Autre",
};
const SITUATIONS = {
  loue: "Déjà loué", vacant: "Vacant, à mettre en location",
  achat: "En cours d'achat", reflexion: "Je me renseigne",
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

    const lang = OWNERS[b.lang] ? b.lang : "fr";
    const owner = OWNERS[lang];
    const clean = (v, n) => String(v || "").trim().slice(0, n);
    const name = clean(b.name, 120);
    const email = clean(b.email, 200);
    const phone = clean(b.phone, 40);
    const address = clean(b.address, 250);
    const type = TYPES[b.type] ? b.type : "autre";
    const situation = SITUATIONS[b.situation] ? b.situation : "reflexion";
    const message = clean(b.message, 4000);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !address || !b.consent) {
      return reply(request, { error: "Invalid input" }, 400);
    }

    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const lines = [
      ["Bien", address],
      ["Type de bien", TYPES[type]],
      ["Situation", SITUATIONS[situation]],
      ["Langue du site", lang.toUpperCase()],
    ];
    const details =
      "<ul>" + lines.map(([k, v]) => `<li><strong>${k} :</strong> ${esc(v)}</li>`).join("") + "</ul>" +
      (message ? `<p style="white-space:pre-wrap">${esc(message)}</p>` : "");

    // 1) Odoo CRM
    let odooOk = false, leadId = null, odooError = "";
    try {
      const call = async (model, method, body) => {
        const r = await fetch(`${ODOO_URL}/json/2/${model}/${method}`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8", Authorization: "bearer " + env.ODOO_API_KEY },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error(`${model}.${method} HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
        return r.json();
      };
      let userId = false;
      try {
        const u = await call("res.users", "search_read", {
          domain: ["|", ["login", "=", owner.email], ["email", "=", owner.email]],
          fields: ["id"], limit: 1,
        });
        if (Array.isArray(u) && u[0]) userId = u[0].id;
      } catch (e) { console.error("Odoo user lookup", String(e)); }

      const vals = {
        name: `Site web : ${name} (${TYPES[type]})`,
        type: "opportunity",
        contact_name: name,
        email_from: email,
        phone: phone || false,
        referred: "Site exyro.be",
        description: details,
      };
      if (userId) vals.user_id = userId;
      const created = await call("crm.lead", "create", { vals_list: [vals] });
      leadId = Array.isArray(created) ? created[0] : created;
      odooOk = !!leadId;
    } catch (e) {
      odooError = String(e);
      console.error("Odoo error", odooError);
    }

    // 2) E-mail d'alerte
    const status = odooOk
      ? `<p style="color:#1F7A4D"><strong>Opportunité créée dans Odoo CRM</strong> (n° ${leadId}).</p>`
      : `<p style="color:#B3261E"><strong>Attention : l'opportunité n'a pas pu être créée dans Odoo.</strong> Encodez cette demande à la main.</p>`;
    const html =
      `<p><strong>${esc(name)}</strong> souhaite déléguer un bien via exyro.be.</p>` + status +
      `<p>E-mail : ${esc(email)}${phone ? "<br>Téléphone : " + esc(phone) : ""}</p>` + details +
      `<hr><p style="color:#888;font-size:12px">Répondez directement à ce message : la réponse ira à ${esc(email)}.</p>`;
    let mailOk = false;
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: SENDER,
          to: [{ email: owner.email, name: owner.name }, { email: owner.inbox }],
          replyTo: { email, name },
          subject: `Nouvelle demande de gestion : ${name}`,
          htmlContent: html,
        }),
      });
      mailOk = res.ok;
      if (!res.ok) console.error("Brevo error", res.status, await res.text());
    } catch (e) { console.error("Brevo error", String(e)); }

    if (!odooOk && !mailOk) return reply(request, { error: "Send failed" }, 502);
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
