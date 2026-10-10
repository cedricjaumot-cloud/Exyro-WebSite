/**
 * Assistant EXYRO : questions générales sur la location et l'investissement immobilier en Belgique.
 *
 * Fonctionnement : la question part vers le Worker (voir worker/chat-worker.js), qui détient la clé API.
 * Si le Worker est injoignable, une base locale prend le relais (repli).
 * Les réponses sont rédigées en Markdown simple (gras, listes) et converties en HTML lisible ci-dessous.
 */

const LANG = "en";
const WORKER_URL = "https://exyrowebsite-chat.ced-j-account.workers.dev";
const GREETING = "Hello, I answer your general questions about renting and property investment in Belgium. Pick a topic or ask your own question. For your personal situation, a member of the team takes over.";
const FALLBACK_ANSWER = "I don't have a ready answer to this question, and the Belgian context (Region, type of lease, signing date) often changes the answer. Pick one of the suggested topics, rephrase, or write directly to the team: **beheer@exyro.be**.";

const KNOWLEDGE_BASE = [
  {
    "id": "bail",
    "keywords": [
      "sign a lease",
      "signing a lease",
      "before signing",
      "lease",
      "tenancy agreement"
    ],
    "question": "Signing a lease: what should I watch for?",
    "answer": "Before signing a lease, a few points deserve your full attention:\n- **Always in writing**: a lease for a main residence must be written and registered (in principle by the landlord, free of charge for a main residence).\n- **The term**: 9 years (with early-exit options), short-term of 3 years at most, or long-term.\n- **Rent, charges and indexation**: state whether charges are a fixed sum or an advance payment, and the indexation date.\n- **The rental deposit**: generally 2 months' rent at most, on a blocked account (up to 3 months with a bank guarantee).\n- **The entry inspection report**: joint, detailed, ideally with dated photos.\n- **The EPC certificate** and the mandatory annexes required by your Region.\n- **Fire insurance** and who pays for small repairs.\nRules vary by Region. To check: your Region's website (Wallonia, Brussels Housing, Wonen Vlaanderen), FPS Finance (registration) and notaire.be."
  },
  {
    "id": "candidat",
    "keywords": [
      "candidate tenant",
      "prospective tenant",
      "tenant application",
      "what information",
      "what documents"
    ],
    "question": "What information can I ask a candidate tenant for?",
    "answer": "You may ask for what is **necessary and proportionate** to assess whether they can pay the rent and look after the property:\n- identity and contact details, number of occupants;\n- proof of income: recent payslips, employment contract or tax assessment;\n- possibly the contact details of their previous landlord;\n- the desired move-in date.\nTo avoid: health status, origin, religion, opinions, private life, full bank statements or any discriminatory question. Anti-discrimination law and the GDPR apply, and some Regions specify which documents you may require.\nKeep only the file of the chosen candidate and delete the others.\nTo check: the Data Protection Authority (dataprotectionauthority.be), Unia (unia.be) and your Region's website."
  },
  {
    "id": "deces",
    "keywords": [
      "death",
      "dies",
      "died",
      "passes away",
      "deceased"
    ],
    "question": "What to do if the landlord or the tenant dies?",
    "answer": "The lease does not end automatically.\n- **Death of the tenant**: the lease continues with their heirs or with the people who lived in the property (spouse, legal cohabitant…). Heirs can generally end it with a notice period, under conditions that differ by Region. Rent remains due until the lease ends.\n- **Death of the landlord**: the lease continues with the heirs or the new owner. The tenant does not have to leave and pays rent to the address given by the new owners. The deposit follows the lease.\nIn both cases: write promptly to the other party, do not change the locks, do not take matters into your own hands, and carry out an inspection report at the end of the lease.\nAn estate is often complex: a notary is the right person to talk to. To check: notaire.be and your Region's website."
  },
  {
    "id": "conflit",
    "keywords": [
      "conflict",
      "dispute",
      "disagreement",
      "justice of the peace"
    ],
    "question": "What to do in a dispute with my tenant or landlord?",
    "answer": "Go step by step:\n1. **Talk first**, quickly and calmly: many disputes are settled at this stage.\n2. **Confirm in writing** (registered letter or email with proof): describe the problem and what you are asking for.\n3. **Look for an amicable solution**: depending on your Region, a joint rental committee or a conciliation or mediation service can help.\n4. **As a last resort**, the **justice of the peace** has jurisdiction over lease disputes; an attempt at conciliation often comes before the proceedings.\nKeep all evidence: lease, inspection reports, photos, correspondence, proof of payment.\nTo check: your Region's website and justice.belgium.be (justice of the peace)."
  },
  {
    "id": "investir",
    "keywords": [
      "why invest",
      "invest in property",
      "invest in real estate",
      "property investment",
      "invest"
    ],
    "question": "Why invest in property?",
    "answer": "Investing in rental property means building a **tangible asset** that produces regular income. Before you start, ask yourself:\n- **What is your goal?** Capital over time, extra income, passing wealth on, retirement…\n- **What time horizon?** Property is a 10 to 20-year matter, not a 2-year one.\n- **What saving and borrowing capacity?** What can you commit without weakening your budget?\n- **What net yield** after acquisition costs, charges, property tax, vacancy and works?\n- **How solid are the property and its location?** Rental demand, condition of the building, EPC score.\nThe strengths: indexed rent, relative protection against inflation, the option to use credit. The risks: tied-up capital, vacancy, unpaid rent, works, interest rates, changing regulation.\nTo check: notaire.be (acquisition costs) and FPS Finance (taxation). This reflection should always be made with your personal situation in mind."
  },
  {
    "id": "levier",
    "keywords": [
      "leverage",
      "mortgage",
      "borrow",
      "loan"
    ],
    "question": "The leverage effect of credit, explained simply",
    "answer": "Leverage means using the **bank's credit** to acquire a larger property than your own funds would allow, while rent and value growth work for you.\nSimplified, theoretical example, ignoring acquisition costs, with €100,000 of your own funds:\n- **Without credit**: you buy a €100,000 property. If its value rises by 3%, you gain €3,000.\n- **With credit**: you buy a €400,000 property (€100,000 down payment and €300,000 loan). For the same 3% rise, the value increases by €12,000, four times more for the same starting capital.\nLeverage also amplifies risk: if the value falls or the property stays empty, the monthly repayment is still due. Always keep a safety margin on your repayment capacity, and take interest, charges and variable rates into account.\nThese calculations depend on your situation: discuss them with your bank and a notary. To check: notaire.be."
  },
  {
    "id": "bitcoin",
    "keywords": [
      "bitcoin",
      "crypto",
      "btc"
    ],
    "question": "Property or bitcoin: how to think about it?",
    "answer": "They are not investments of the same nature. The right question is not \"which is better\" but \"which fits my goal and my risk tolerance\".\n- **Rental property**: a tangible asset, **regular income** (indexed rent), the option to borrow, a value that is generally less volatile. On the other hand: tied-up capital, high acquisition costs, management and works, risk of vacancy or unpaid rent, slow resale.\n- **Bitcoin**: liquid, accessible with a small amount, with potential for sharp rises. On the other hand: **very volatile**, no income, no use value, a regulatory and tax framework that is still evolving, and a risk of heavy or even total loss.\nMany prudent investors first build a solid base (emergency savings, property) and put only a small share they could afford to lose into highly speculative assets.\nThis is not investment advice. To check: the FSMA (fsma.be), which publishes warnings about crypto-assets."
  },
  {
    "id": "start",
    "keywords": [
      "start",
      "begin",
      "first investment",
      "getting started",
      "accessible",
      "beginner"
    ],
    "question": "Getting started with rental investment",
    "answer": "Investing in rental property remains one of the most accessible investments in Belgium: you don't need a large amount of capital to start, a first purchase with well-structured financing is often enough to launch a first property. It's also a tangible asset, largely repaid through the rent collected rather than your own income alone."
  },
  {
    "id": "yield",
    "keywords": [
      "yield",
      "return",
      "profitable",
      "rental return"
    ],
    "question": "Return on a rental investment",
    "answer": "A rental investment in Belgium typically generates a gross yield of between 3 and 6% per year depending on the region and type of property, before charges, property tax and any vacancy periods. Net yield, once management and maintenance costs are deducted, is calculated on the rent actually collected over the year, not the advertised rent."
  },
  {
    "id": "indexation",
    "keywords": [
      "index",
      "indexation"
    ],
    "question": "Rent indexation",
    "answer": "In Belgium, annual rent indexation follows the health index and depends on the lease's anniversary date. Since 2022-2023, regional caps apply based on the property's EPC/EPB rating (mainly in Wallonia and Brussels): a poorly rated property may see its indexation reduced, or even blocked. The calculation uses the index for the month before the anniversary, divided by the reference index at signature."
  },
  {
    "id": "tax",
    "keywords": [
      "tax",
      "taxation",
      "property tax",
      "rental income"
    ],
    "question": "Taxation of rental income",
    "answer": "In Belgium, income from a property let for residential use is in principle taxed based on the indexed cadastral income, not the actual rent collected, unless the property is let to a company or used professionally, in which case the actual rent applies. Property tax remains due every year, whether the property is let or not."
  },
  {
    "id": "notice",
    "keywords": [
      "notice period",
      "terminate",
      "leave",
      "end the lease"
    ],
    "question": "Tenant's notice period",
    "answer": "For a 9-year main residence lease, the tenant can terminate at any time with 3 months' notice. If they leave within the first 3 years, a decreasing compensation is owed to the landlord (1, then 0.5 months' rent depending on the year). Rules differ for short-term leases and vary slightly between Regions."
  },
  {
    "id": "deposit",
    "keywords": [
      "deposit",
      "guarantee"
    ],
    "question": "Rental deposit",
    "answer": "The rental deposit is generally capped at 2 or 3 months' rent depending on the chosen formula (individualised account, bank guarantee, or via the CPAS/OCMW). It must be placed in an account blocked in the tenant's name and can only be released with the agreement of both parties or a court decision."
  },
  {
    "id": "inspection",
    "keywords": [
      "inspection report",
      "condition report"
    ],
    "question": "Inspection report",
    "answer": "The move-in inspection report is mandatory and must be carried out jointly by both parties, ideally shortly after the keys are handed over, room by room and with dated photos. This document protects the landlord in case of damage found at move-out: without a valid move-in report, the property is presumed to have been received in good condition."
  },
  {
    "id": "arrears",
    "keywords": [
      "unpaid rent",
      "arrears",
      "tenant not paying"
    ],
    "question": "Unpaid rent",
    "answer": "When facing arrears, the usual order is: a friendly reminder, a written formal notice sent by registered post, and, if no solution is found, referral to the justice of the peace to obtain termination of the lease and recovery of the debt. Belgian court timelines can stretch over several months, which quickly weighs on a lone landlord's cash flow."
  },
  {
    "id": "syndic",
    "keywords": [
      "syndic",
      "co-ownership",
      "general meeting"
    ],
    "question": "Syndic versus property management",
    "answer": "The syndic manages the common areas of a building under co-ownership (shared charges, general meetings, collective works). Property management, on the other hand, concerns the relationship between you and your tenant for your private unit: lease, rent, inspection reports, claims. These are two distinct professions, sometimes carried out by different companies."
  },
  {
    "id": "portfolio",
    "keywords": [
      "several properties",
      "portfolio",
      "multiple apartments"
    ],
    "question": "Managing several properties",
    "answer": "Managing one rental property alone is manageable. Managing 5, 10 or 30 properties at once, with leases on different dates, indexations to track, inspection reports to schedule and claims to handle, quickly becomes a part-time job, or more."
  },
  {
    "id": "renovation",
    "keywords": [
      "renovation",
      "renovate",
      "improve my property",
      "value creation",
      "maintenance work"
    ],
    "question": "Should I renovate my rental property?",
    "answer": "Not always, and that's exactly the calculation that matters: an investment only makes sense if it pays off in both the rent and the property's value. Spending €50,000 on works that only raise the rent by €100/month and the value by €35,000 is often less profitable than selling as-is. Conversely, a targeted renovation (kitchen, bathroom, energy performance) can add far more value than it costs."
  }
];

// ---- Rendu Markdown simple -> HTML (échappe d'abord tout le HTML) ----
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function inline(s) {
  return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderMarkdown(text) {
  const lines = escapeHtml(text).split(/\r?\n/);
  let html = "";
  let list = null;
  let para = [];
  const flushPara = () => {
    if (para.length) { html += "<p>" + inline(para.join("<br>")) + "</p>"; para = []; }
  };
  const closeList = () => { if (list) { html += "</" + list + ">"; list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const num = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || num) {
      flushPara();
      const type = bullet ? "ul" : "ol";
      if (list !== type) { closeList(); html += "<" + type + ">"; list = type; }
      html += "<li>" + inline((bullet || num)[1]) + "</li>";
    } else if (line === "") {
      flushPara(); closeList();
    } else {
      closeList(); para.push(line); flushPara();
    }
  }
  flushPara(); closeList();
  return html;
}

// ---- Base locale (repli) ----
function findEntry(text) {
  const q = text.toLowerCase();
  return KNOWLEDGE_BASE.find((e) => e.keywords.some((k) => q.includes(k))) || null;
}

// ---- Interface ----
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const askTopics = document.getElementById("askTopics");

function addMessage(html, role) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerHTML = html;
  chatLog.appendChild(div);
  if (role === "bot") { chatLog.scrollTop = div.offsetTop - 12; }
  else { chatLog.scrollTop = chatLog.scrollHeight; }
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

async function askAI(userText) {
  if (!WORKER_URL) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, lang: LANG }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error("EXYRO assistant: Worker returned", res.status);
      return null;
    }
    const data = await res.json();
    return data.reply || null;
  } catch (err) {
    console.error("EXYRO assistant: fetch to Worker failed", err);
    return null;
  }
}

let busy = false;

async function respondTo(userText, topicId) {
  if (busy) return;
  busy = true;
  addMessage("<p>" + escapeHtml(userText) + "</p>", "user");
  showTyping();

  const aiReply = await askAI(userText);
  hideTyping();

  if (aiReply) {
    addMessage(renderMarkdown(aiReply), "bot");
  } else {
    const entry = (topicId && KNOWLEDGE_BASE.find((k) => k.id === topicId)) || findEntry(userText);
    addMessage(renderMarkdown(entry ? entry.answer : FALLBACK_ANSWER), "bot");
  }
  busy = false;
}

addMessage("<p>" + escapeHtml(GREETING) + "</p>", "bot");
chatLog.scrollTop = 0;

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  respondTo(text);
});

askTopics.addEventListener("click", (e) => {
  const btn = e.target.closest(".ask-topic");
  if (!btn) return;
  const entry = KNOWLEDGE_BASE.find((k) => k.id === btn.dataset.q);
  if (entry) {
    if (window.matchMedia("(max-width: 900px)").matches) {
      document.querySelector(".chat").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    respondTo(entry.question, entry.id);
  }
});
