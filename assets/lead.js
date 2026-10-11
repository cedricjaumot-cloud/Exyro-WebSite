/* Formulaire "Déléguer mon bien" : envoi vers le worker (qui crée l'opportunité dans Odoo CRM). */

// Adresse du worker (voir worker/lead-worker.js).
// Tant que cette valeur est vide, le formulaire ouvre le programme de messagerie du visiteur.
const LEAD_URL = "https://exyro-lead.ced-j-account.workers.dev";

(function () {
  const form = document.getElementById("leadForm");
  if (!form) return;
  const D = form.dataset;
  const status = document.getElementById("leadStatus");
  const openedAt = Date.now();
  const setStatus = (m, c) => { status.textContent = m; status.className = "lead-status " + (c || ""); };
  const label = (name) => {
    const el = form.elements[name];
    return el && el.selectedOptions ? el.selectedOptions[0].textContent : "";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form).entries());
    if (f.website) return; // champ piège : un robot l'a rempli
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email.trim()) || !f.address.trim() || !form.elements.consent.checked) {
      return setStatus(D.required, "ko");
    }

    if (!LEAD_URL) {
      const subject = encodeURIComponent(D.subject);
      const body = encodeURIComponent(
        `${f.address}\n${label("type")} / ${label("situation")}\n\n${f.message || ""}\n\n${f.name}${f.phone ? "\n" + f.phone : ""}\n${f.email}`);
      window.location.href = `mailto:${D.mailto}?subject=${subject}&body=${body}`;
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; setStatus(D.sending);
    try {
      const res = await fetch(LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: D.lang, name: f.name, email: f.email, phone: f.phone || "", address: f.address,
          type: f.type, situation: f.situation, message: f.message || "", consent: true,
          website: f.website || "", elapsed: Date.now() - openedAt,
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.innerHTML = `<div class="lead-done"><strong>${D.okTitle}</strong><span>${D.okText}</span></div>`;
    } catch (err) {
      console.error("EXYRO lead:", err);
      setStatus(D.ko, "ko");
      btn.disabled = false;
    }
  });
})();
