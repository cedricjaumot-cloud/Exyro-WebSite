/**
 * Assistant IA EXYRO — démo front-end.
 *
 * Cette version fonctionne sans backend : elle reconnaît des sujets courants
 * de la location en Belgique et répond avec une base de connaissances locale,
 * en orientant systématiquement vers un property manager EXYRO.
 *
 * Pour une vraie IA générative (réponses libres, pas seulement les sujets
 * ci-dessous), il faut appeler un backend qui détient la clé API — jamais
 * le client. Voir /api/chat.js (Vercel) ou /worker/chat-worker.js (Cloudflare)
 * fournis à côté de ce fichier : il suffit de remplacer askLocalKnowledge()
 * par un fetch('/api/chat', {...}) vers cet endpoint.
 */

const EXYRO_PITCH = "Déléguez ce suivi à un property manager comme EXYRO : nous gérons déjà plus de 1 100 baux partout en Belgique, avec un seul interlocuteur et une veille légale continue.";

const KNOWLEDGE_BASE = [
  {
    id: "indexation",
    keywords: ["index", "indexer", "indexation"],
    question: "Indexation du loyer",
    answer:
      "En Belgique, l'indexation annuelle du loyer suit l'indice santé et dépend de la date anniversaire du bail. Depuis 2022-2023, des plafonds régionaux existent selon le score PEB du logement (surtout en Wallonie et à Bruxelles) : un bien mal classé énergétiquement peut voir son indexation réduite, voire bloquée. Le calcul se fait avec l'indice du mois précédant l'anniversaire, divisé par l'indice de référence au moment de la signature."
  },
  {
    id: "preavis",
    keywords: ["préavis", "preavis", "résilier", "resilier", "quitter", "sortie du bail"],
    question: "Préavis du locataire",
    answer:
      "Pour un bail de résidence principale de 9 ans, le locataire peut résilier à tout moment moyennant un préavis de 3 mois. S'il part durant les 3 premières années, une indemnité dégressive est due au propriétaire (1, puis 0,5 mois de loyer selon l'année). Les règles diffèrent pour les baux de courte durée et varient légèrement entre Régions."
  },
  {
    id: "garantie",
    keywords: ["garantie", "caution"],
    question: "Garantie locative",
    answer:
      "La garantie locative est généralement plafonnée à 2 ou 3 mois de loyer selon la formule choisie (compte individualisé, garantie bancaire, ou via le CPAS). Elle doit être placée sur un compte bloqué au nom du locataire et ne peut être débloquée qu'avec l'accord des deux parties ou une décision de justice."
  },
  {
    id: "edl",
    keywords: ["état des lieux", "etat des lieux", "edl"],
    question: "État des lieux",
    answer:
      "L'état des lieux d'entrée est obligatoire et doit être réalisé de manière contradictoire, dans les meilleurs délais après la remise des clés, idéalement local par local et avec photos datées. C'est ce document qui protège le propriétaire en cas de dégâts constatés à la sortie : sans EDL d'entrée valable, le logement est présumé reçu en bon état."
  },
  {
    id: "loyer-impaye",
    keywords: ["impayé", "impaye", "retard de loyer", "locataire ne paie pas"],
    question: "Loyer impayé",
    answer:
      "Face à un impayé, l'ordre habituel est : rappel amiable, mise en demeure écrite avec accusé de réception, puis, en l'absence de solution, saisine du juge de paix pour obtenir la résiliation du bail et le recouvrement. Les délais judiciaires belges peuvent s'étaler sur plusieurs mois, ce qui pèse vite sur la trésorerie d'un propriétaire seul."
  },
  {
    id: "multi-biens",
    keywords: ["plusieurs biens", "multi-biens", "portefeuille", "plusieurs appartements"],
    question: "Gestion de plusieurs biens",
    answer:
      "Gérer un bien locatif seul est faisable. Gérer 5, 10 ou 30 biens en parallèle - avec des baux à des dates différentes, des indexations à suivre, des états des lieux à planifier et des sinistres à traiter - devient rapidement un travail à temps plein."
  }
];

const FALLBACK_ANSWER =
  "C'est une question spécifique à votre situation locative, et le contexte belge (Région, type de bail, date de signature) change souvent la réponse.";

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
