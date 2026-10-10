/* Pages individuelles de l'équipe : présentation (bios.json), carte de contact et formulaire de message. */

// Adresse du worker qui envoie les messages (voir worker/contact-worker.js).
// Tant que cette valeur est vide, le formulaire ouvre le programme de messagerie du visiteur.
const CONTACT_URL = "https://exyro-contact.ced-j-account.workers.dev";

const B = document.body;
const D = B.dataset;

// 1) Présentation de la personne
fetch(D.bios).then((r) => (r.ok ? r.json() : {})).then((all) => {
  const bio = (all[D.slug] || {});
  const text = (bio[D.lang] || bio.fr || "").trim();
  const el = document.getElementById("bio");
  if (text) { el.textContent = text; } else { el.classList.add("empty"); }
}).catch(() => {});

// 2) Carte de contact (.vcf)
document.getElementById("vcardBtn").addEventListener("click", () => {
  const vcf = [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${D.name}`, `N:${D.name.split(" ").slice(1).join(" ")};${D.name.split(" ")[0]};;;`,
    "ORG:EXYRO", `TITLE:${D.role}`,
    `TEL;TYPE=WORK,VOICE:${D.phone}`, `EMAIL;TYPE=WORK:${D.email}`,
    `ADR;TYPE=WORK:;;${D.street};${D.city.replace(/^\d+\s/, "")};;${D.city.split(" ")[0]};Belgique`,
    "URL:https://www.exyro.be", "END:VCARD",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([vcf], { type: "text/vcard" }));
  const a = document.createElement("a");
  a.href = url; a.download = D.slug + ".vcf"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});

// 3) Formulaire
const form = document.getElementById("msgForm");
const status = document.getElementById("formStatus");
const openedAt = Date.now();

function setStatus(msg, cls) { status.textContent = msg; status.className = "status " + (cls || ""); }

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(form).entries());
  if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email.trim()) || !f.message.trim()) {
    return setStatus(D.required, "ko");
  }
  if (f.website) return; // champ piège : un robot l'a rempli
  const btn = form.querySelector("button[type=submit]");

  if (!CONTACT_URL) {
    const subject = encodeURIComponent("Message depuis exyro.be");
    const body = encodeURIComponent(`${f.message}\n\n${f.name}${f.phone ? "\n" + f.phone : ""}\n${f.email}`);
    window.location.href = `mailto:${D.email}?subject=${subject}&body=${body}`;
    return;
  }

  btn.disabled = true; setStatus(D.sending);
  try {
    const res = await fetch(CONTACT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: D.slug, lang: D.lang, name: f.name, email: f.email, phone: f.phone || "", message: f.message, website: f.website || "", elapsed: Date.now() - openedAt }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    form.reset(); setStatus(D.ok, "ok");
  } catch (err) {
    console.error("EXYRO contact:", err);
    setStatus(D.ko, "ko");
  } finally { btn.disabled = false; }
});
