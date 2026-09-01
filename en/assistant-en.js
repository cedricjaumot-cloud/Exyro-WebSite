/**
 * EXYRO AI assistant - front-end demo (EN).
 * See assistant.js (FR version) for full documentation on wiring a real
 * backend (api/chat.js or worker/chat-worker.js).
 */

const KNOWLEDGE_BASE = [
  {
    id: "start",
    keywords: ["start", "begin", "first investment", "getting started", "accessible", "beginner"],
    question: "Getting started with rental investment",
    answer:
      "Investing in rental property remains one of the most accessible investments in Belgium: you don't need a large amount of capital to start, a first purchase with well-structured financing is often enough to launch a first property. It's also a tangible asset, largely repaid through the rent collected rather than your own income alone.",
    pitch:
      "The hard part is almost never the purchase: it's everything that comes after, finding the right tenant, tracking the lease, reacting quickly when something goes wrong, that determines whether the investment stays profitable over time. That's exactly where EXYRO makes the difference: you invest, EXYRO manages."
  },
  {
    id: "yield",
    keywords: ["yield", "return", "profitable", "rental return"],
    question: "Return on a rental investment",
    answer:
      "A rental investment in Belgium typically generates a gross yield of between 3 and 6% per year depending on the region and type of property, before charges, property tax and any vacancy periods. Net yield, once management and maintenance costs are deducted, is calculated on the rent actually collected over the year, not the advertised rent.",
    pitch:
      "That's exactly where it plays out: two identical properties can show very different yields depending on the quality of management, vacancy avoided, charges correctly passed on, claims properly followed up. Good management isn't a cost: it's what protects your yield."
  },
  {
    id: "indexation",
    keywords: ["index", "indexation"],
    question: "Rent indexation",
    answer:
      "In Belgium, annual rent indexation follows the health index and depends on the lease's anniversary date. Since 2022-2023, regional caps apply based on the property's EPC/EPB rating (mainly in Wallonia and Brussels): a poorly rated property may see its indexation reduced, or even blocked. The calculation uses the index for the month before the anniversary, divided by the reference index at signature.",
    pitch:
      "Many landlords miss an indexation, or get the calculation wrong, and lose several hundred euros a year without even realising it. That's exactly the kind of detail EXYRO tracks systematically for you, lease after lease, year after year."
  },
  {
    id: "tax",
    keywords: ["tax", "taxation", "property tax", "rental income"],
    question: "Taxation of rental income",
    answer:
      "In Belgium, income from a property let for residential use is in principle taxed based on the indexed cadastral income, not the actual rent collected, unless the property is let to a company or used professionally, in which case the actual rent applies. Property tax remains due every year, whether the property is let or not.",
    pitch:
      "This is a point where many landlords lose track, especially once they have several properties across different Regions with their own rules. EXYRO doesn't replace your accountant, but centralises all the documents needed to keep your tax return simple."
  },
  {
    id: "notice",
    keywords: ["notice period", "terminate", "leave", "end the lease"],
    question: "Tenant's notice period",
    answer:
      "For a 9-year main residence lease, the tenant can terminate at any time with 3 months' notice. If they leave within the first 3 years, a decreasing compensation is owed to the landlord (1, then 0.5 months' rent depending on the year). Rules differ for short-term leases and vary slightly between Regions.",
    pitch:
      "A badly worded or miscalculated notice can cost you money, or deprive you of compensation you were entitled to. EXYRO handles this procedure on your behalf, by the book, every time a tenant leaves."
  },
  {
    id: "deposit",
    keywords: ["deposit", "guarantee"],
    question: "Rental deposit",
    answer:
      "The rental deposit is generally capped at 2 or 3 months' rent depending on the chosen formula (individualised account, bank guarantee, or via the CPAS/OCMW). It must be placed in an account blocked in the tenant's name and can only be released with the agreement of both parties or a court decision.",
    pitch:
      "A poorly placed or poorly documented deposit quickly becomes a source of dispute when the tenant leaves, or worse, an amount you can no longer easily recover. EXYRO makes sure it's set up and released correctly."
  },
  {
    id: "inspection",
    keywords: ["inspection report", "condition report"],
    question: "Inspection report",
    answer:
      "The move-in inspection report is mandatory and must be carried out jointly by both parties, ideally shortly after the keys are handed over, room by room and with dated photos. This document protects the landlord in case of damage found at move-out: without a valid move-in report, the property is presumed to have been received in good condition.",
    pitch:
      "A rushed move-in inspection often means the landlord ends up paying for repairs that weren't theirs to cover. EXYRO carries out joint, well-documented inspection reports with the tenant at every move-in and move-out."
  },
  {
    id: "arrears",
    keywords: ["unpaid rent", "arrears", "tenant not paying"],
    question: "Unpaid rent",
    answer:
      "When facing arrears, the usual order is: a friendly reminder, a written formal notice sent by registered post, and, if no solution is found, referral to the justice of the peace to obtain termination of the lease and recovery of the debt. Belgian court timelines can stretch over several months, which quickly weighs on a lone landlord's cash flow.",
    pitch:
      "When facing arrears, every week counts. A landlord acting alone often loses valuable time understanding the procedure; EXYRO starts it immediately and sees it through, on your behalf."
  },
  {
    id: "syndic",
    keywords: ["syndic", "co-ownership", "general meeting"],
    question: "Syndic versus property management",
    answer:
      "The syndic manages the common areas of a building under co-ownership (shared charges, general meetings, collective works). Property management, on the other hand, concerns the relationship between you and your tenant for your private unit: lease, rent, inspection reports, claims. These are two distinct professions, sometimes carried out by different companies.",
    pitch:
      "EXYRO is licensed by the IPI as a property manager (régisseur de biens): our activity is exclusively the rental management of your property, not the syndic role for your building, nor brokerage (buying or selling)."
  },
  {
    id: "portfolio",
    keywords: ["several properties", "portfolio", "multiple apartments"],
    question: "Managing several properties",
    answer:
      "Managing one rental property alone is manageable. Managing 5, 10 or 30 properties at once, with leases on different dates, indexations to track, inspection reports to schedule and claims to handle, quickly becomes a part-time job, or more.",
    pitch:
      "That's exactly why EXYRO exists: a single point of contact for your entire portfolio, whatever its size, with the same rigour applied to every property."
  }
];

const FALLBACK_ANSWER =
  "This is a question specific to your situation, and the Belgian context (Region, lease type, signature date) often changes the answer.";
const FALLBACK_PITCH =
  "A rental investment remains an excellent asset, provided it's well managed day to day. Hand this off to a property manager like EXYRO: we already manage over 1,100 leases across Belgium, with a single point of contact and ongoing legal monitoring.";

function findEntry(text) {
  const q = text.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((k) => q.includes(k))) {
      return entry;
    }
  }
  return null;
}

function askLocalKnowledge(userText) {
  const entry = findEntry(userText);
  if (entry) return { answer: entry.answer, pitch: entry.pitch };
  return { answer: FALLBACK_ANSWER, pitch: FALLBACK_PITCH };
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

// Fill in your Worker URL here once deployed (see worker/chat-worker.js).
// While this is empty, the assistant stays on the local demo (10 topics).
const WORKER_URL = "https://exyrowebsite-chat.ced-j-account.workers.dev";

async function askAI(userText) {
  if (!WORKER_URL) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.reply || null;
  } catch {
    return null;
  }
}

async function respondTo(userText) {
  addMessage(escapeHtml(userText), "user");
  showTyping();

  const aiReply = await askAI(userText);
  hideTyping();

  if (aiReply) {
    addMessage(aiReply.replace(/\n/g, "<br>"), "bot");
    return;
  }

  // Fallback: local knowledge base (10 topics), always available.
  const { answer, pitch } = askLocalKnowledge(userText);
  const html = `${answer}<br><br><strong class="pitch">${pitch}</strong>`;
  addMessage(html, "bot");
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
