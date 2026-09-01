/**
 * EXYRO AI assistant - front-end demo (EN).
 * See assistant.js (FR version) for full documentation on wiring a real
 * backend (api/chat.js or worker/chat-worker.js).
 */

const EXYRO_PITCH = "Hand this off to a property manager like EXYRO: we already manage over 1,100 leases across Belgium, with a single point of contact and ongoing legal monitoring.";

const KNOWLEDGE_BASE = [
  {
    id: "indexation",
    keywords: ["index", "indexation"],
    question: "Rent indexation",
    answer:
      "In Belgium, annual rent indexation follows the health index and depends on the lease's anniversary date. Since 2022-2023, regional caps apply based on the property's EPC/EPB rating (mainly in Wallonia and Brussels): a poorly rated property may see its indexation reduced, or even blocked. The calculation uses the index for the month before the anniversary, divided by the reference index at signature."
  },
  {
    id: "preavis",
    keywords: ["notice", "terminate", "leave", "end the lease"],
    question: "Tenant's notice period",
    answer:
      "For a 9-year main residence lease, the tenant can terminate at any time with 3 months' notice. If they leave within the first 3 years, a decreasing compensation is owed to the landlord (1, then 0.5 months' rent depending on the year). Rules differ for short-term leases and vary slightly between Regions."
  },
  {
    id: "garantie",
    keywords: ["deposit", "guarantee"],
    question: "Rental deposit",
    answer:
      "The rental deposit is generally capped at 2 or 3 months' rent depending on the chosen formula (individualised account, bank guarantee, or via the CPAS/OCMW). It must be placed in an account blocked in the tenant's name and can only be released with the agreement of both parties or a court decision."
  },
  {
    id: "edl",
    keywords: ["inspection report", "condition report"],
    question: "Inspection report",
    answer:
      "The move-in inspection report is mandatory and must be carried out jointly by both parties, ideally shortly after the keys are handed over, room by room and with dated photos. This document protects the landlord in case of damage found at move-out: without a valid move-in report, the property is presumed to have been received in good condition."
  },
  {
    id: "loyer-impaye",
    keywords: ["unpaid rent", "arrears", "tenant not paying"],
    question: "Unpaid rent",
    answer:
      "When facing arrears, the usual order is: a friendly reminder, a written formal notice sent by registered post, and, if no solution is found, referral to the justice of the peace to obtain termination of the lease and recovery of the debt. Belgian court timelines can stretch over several months, which quickly weighs on a lone landlord's cash flow."
  },
  {
    id: "multi-biens",
    keywords: ["several properties", "portfolio", "multiple apartments"],
    question: "Managing several properties",
    answer:
      "Managing one rental property alone is manageable. Managing 5, 10 or 30 properties at once, with leases on different dates, indexations to track, inspection reports to schedule and claims to handle, quickly becomes a full-time job."
  }
];

const FALLBACK_ANSWER =
  "This is a question specific to your situation, and the Belgian context (Region, lease type, signature date) often changes the answer.";

function findAnswer(text) {
  const q = text.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((k) => q.includes(k))) {
      return entry.answer;
    }
  }
  return null;
}

function askLocalKnowledge(userText) {
  const found = findAnswer(userText);
  return found || FALLBACK_ANSWER;
}

// ---- UI wiring ----
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const suggestions = document.getElementById("suggestions");

function addMessage(text, role) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerHTML = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "typing";
  div.id = "typingIndicator";
  div.innerHTML = "<span></span><span></span><span></span>";
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

function respondTo(userText) {
  addMessage(escapeHtml(userText), "user");
  showTyping();
  const delay = 500 + Math.random() * 500;
  setTimeout(() => {
    hideTyping();
    const answer = askLocalKnowledge(userText);
    const html = `${answer}<br><br><strong class="pitch">${EXYRO_PITCH}</strong>`;
    addMessage(html, "bot");
  }, delay);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  respondTo(text);
});

suggestions.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const entry = KNOWLEDGE_BASE.find((k) => k.id === chip.dataset.q);
  if (entry) respondTo(entry.question);
});
