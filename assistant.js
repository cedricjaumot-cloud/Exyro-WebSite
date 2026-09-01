/**
 * Assistant IA EXYRO - démo front-end.
 *
 * Cette version fonctionne sans backend : elle reconnaît des sujets courants
 * de l'investissement et de la location en Belgique et répond avec une base
 * de connaissances locale. Chaque sujet a sa propre accroche (pas un pitch
 * générique recyclé) pour porter le message : investir dans l'immobilier
 * est accessible et malin, mais bien le gérer est un vrai métier qui
 * protège le rendement.
 *
 * Pour une vraie IA générative (réponses libres, pas seulement les sujets
 * ci-dessous), il faut appeler un backend qui détient la clé API : jamais
 * le client. Voir /api/chat.js (Vercel) ou /worker/chat-worker.js (Cloudflare)
 * fournis à côté de ce fichier : il suffit de remplacer askLocalKnowledge()
 * par un fetch('/api/chat', {...}) vers cet endpoint.
 */

const KNOWLEDGE_BASE = [
  {
    id: "debuter",
    keywords: ["débuter", "commencer", "premier investissement", "se lancer", "accessible", "débutant"],
    question: "Se lancer dans l'investissement locatif",
    answer:
      "Investir dans l'immobilier locatif reste l'un des placements les plus accessibles en Belgique : il n'est pas nécessaire d'avoir un gros capital pour démarrer, un premier achat avec un financement bien structuré suffit souvent à lancer un premier bien. C'est aussi un placement tangible, qui se rembourse en grande partie grâce aux loyers perçus plutôt que sur vos seuls revenus.",
    pitch:
      "La partie difficile n'est presque jamais l'achat : c'est tout ce qui vient après, trouver le bon locataire, suivre le bail, réagir vite en cas de souci, qui détermine si le placement reste rentable sur la durée. C'est précisément là qu'EXYRO change la donne : vous investissez, EXYRO gère."
  },
  {
    id: "rendement",
    keywords: ["rendement", "rentabilité", "rentable", "rapport locatif"],
    question: "Rendement d'un investissement locatif",
    answer:
      "Un investissement locatif en Belgique dégage généralement un rendement brut entre 3 et 6% par an selon la région et le type de bien, avant charges, précompte immobilier et éventuelle vacance locative. Le rendement net, une fois les frais de gestion et d'entretien déduits, se calcule sur le loyer réellement perçu sur l'année, pas sur le loyer affiché.",
    pitch:
      "C'est justement là que ça se joue : deux biens identiques peuvent afficher deux rendements très différents selon la qualité de la gestion, vacance locative évitée, charges bien répercutées, sinistres bien suivis. Une bonne gestion n'est pas un coût : c'est ce qui protège votre rendement."
  },
  {
    id: "indexation",
    keywords: ["index", "indexer", "indexation"],
    question: "Indexation du loyer",
    answer:
      "En Belgique, l'indexation annuelle du loyer suit l'indice santé et dépend de la date anniversaire du bail. Depuis 2022-2023, des plafonds régionaux existent selon le score PEB du logement (surtout en Wallonie et à Bruxelles) : un bien mal classé énergétiquement peut voir son indexation réduite, voire bloquée. Le calcul se fait avec l'indice du mois précédant l'anniversaire, divisé par l'indice de référence au moment de la signature.",
    pitch:
      "Beaucoup de propriétaires oublient une indexation, ou se trompent dans le calcul, et perdent plusieurs centaines d'euros par an sans même s'en rendre compte. C'est exactement le genre de détail qu'EXYRO suit systématiquement pour vous, bail après bail, année après année."
  },
  {
    id: "fiscalite",
    keywords: ["fiscalité", "impôt", "précompte", "revenus locatifs", "taxation"],
    question: "Fiscalité des revenus locatifs",
    answer:
      "En Belgique, les revenus d'un bien loué à usage résidentiel sont en principe taxés sur base du revenu cadastral indexé, pas sur le loyer réellement perçu, sauf si le bien est loué à une société ou affecté à un usage professionnel, où le loyer réel entre en compte. Le précompte immobilier reste dû chaque année, que le bien soit loué ou non.",
    pitch:
      "C'est un point sur lequel beaucoup de propriétaires se perdent, surtout dès qu'ils ont plusieurs biens dans des Régions différentes aux règles distinctes. EXYRO ne remplace pas votre comptable, mais centralise tous les documents nécessaires pour que votre déclaration reste simple."
  },
  {
    id: "preavis",
    keywords: ["préavis", "preavis", "résilier", "resilier", "quitter", "sortie du bail"],
    question: "Préavis du locataire",
    answer:
      "Pour un bail de résidence principale de 9 ans, le locataire peut résilier à tout moment moyennant un préavis de 3 mois. S'il part durant les 3 premières années, une indemnité dégressive est due au propriétaire (1, puis 0,5 mois de loyer selon l'année). Les règles diffèrent pour les baux de courte durée et varient légèrement entre Régions.",
    pitch:
      "Un préavis mal formulé ou mal calculé peut vous coûter cher, ou au contraire vous priver d'une indemnité à laquelle vous aviez droit. EXYRO gère cette procédure à votre place, dans les règles, à chaque départ de locataire."
  },
  {
    id: "garantie",
    keywords: ["garantie", "caution"],
    question: "Garantie locative",
    answer:
      "La garantie locative est généralement plafonnée à 2 ou 3 mois de loyer selon la formule choisie (compte individualisé, garantie bancaire, ou via le CPAS). Elle doit être placée sur un compte bloqué au nom du locataire et ne peut être débloquée qu'avec l'accord des deux parties ou une décision de justice.",
    pitch:
      "Mal placée ou mal documentée, une garantie locative devient une source de litige au moment du départ du locataire, ou pire, un montant que vous ne parvenez plus à récupérer facilement. EXYRO s'assure qu'elle est constituée et débloquée dans les règles."
  },
  {
    id: "edl",
    keywords: ["état des lieux", "etat des lieux", "edl"],
    question: "État des lieux",
    answer:
      "L'état des lieux d'entrée est obligatoire et doit être réalisé de manière contradictoire, dans les meilleurs délais après la remise des clés, idéalement local par local et avec photos datées. C'est ce document qui protège le propriétaire en cas de dégâts constatés à la sortie : sans EDL d'entrée valable, le logement est présumé reçu en bon état.",
    pitch:
      "Un état des lieux d'entrée bâclé, c'est souvent un propriétaire qui se retrouve à payer des réparations qui ne lui incombaient pas. EXYRO réalise des états des lieux contradictoires et documentés, avec le locataire, à chaque entrée et sortie."
  },
  {
    id: "loyer-impaye",
    keywords: ["impayé", "impaye", "retard de loyer", "locataire ne paie pas"],
    question: "Loyer impayé",
    answer:
      "Face à un impayé, l'ordre habituel est : rappel amiable, mise en demeure écrite avec accusé de réception, puis, en l'absence de solution, saisine du juge de paix pour obtenir la résiliation du bail et le recouvrement. Les délais judiciaires belges peuvent s'étaler sur plusieurs mois, ce qui pèse vite sur la trésorerie d'un propriétaire seul.",
    pitch:
      "Face à un impayé, chaque semaine compte. Un propriétaire seul perd souvent un temps précieux à comprendre la procédure ; EXYRO l'enclenche immédiatement et la mène jusqu'au bout, à votre place."
  },
  {
    id: "syndic",
    keywords: ["syndic", "copropriété", "assemblée générale"],
    question: "Différence entre syndic et gestion locative",
    answer:
      "Le syndic gère les parties communes d'un immeuble en copropriété (charges communes, assemblées générales, travaux collectifs). La gestion locative concerne, elle, la relation entre vous et votre locataire sur votre lot privatif : bail, loyer, état des lieux, sinistres. Ce sont deux métiers distincts, parfois exercés par des sociétés différentes.",
    pitch:
      "EXYRO est agréé IPI en tant qu'agent immobilier régisseur de biens : notre métier, c'est exclusivement la gestion locative de votre bien, pas le syndic de votre immeuble ni le courtage (achat ou vente)."
  },
  {
    id: "multi-biens",
    keywords: ["plusieurs biens", "multi-biens", "portefeuille", "plusieurs appartements"],
    question: "Gestion de plusieurs biens",
    answer:
      "Gérer un bien locatif seul est faisable. Gérer 5, 10 ou 30 biens en parallèle, avec des baux à des dates différentes, des indexations à suivre, des états des lieux à planifier et des sinistres à traiter, devient rapidement un travail à temps partiel, voire plus.",
    pitch:
      "C'est justement pour ça qu'EXYRO existe : un seul interlocuteur pour tout votre portefeuille, quelle que soit sa taille, avec la même rigueur sur chaque bien."
  }
];

const FALLBACK_ANSWER =
  "C'est une question spécifique à votre situation, et le contexte belge (Région, type de bail, date de signature) change souvent la réponse.";
const FALLBACK_PITCH =
  "Un investissement locatif reste un excellent placement, à condition d'être bien accompagné dans sa gestion au quotidien. Déléguez ce suivi à un property manager comme EXYRO : nous gérons déjà plus de 1 100 baux partout en Belgique, avec un seul interlocuteur et une veille légale continue.";

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

// Renseigne ici l'URL de ton Worker une fois déployé (voir worker/chat-worker.js).
// Tant que c'est vide, l'assistant reste sur la démo locale (10 sujets).
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
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("EXYRO assistant: Worker returned", res.status, errText);
      return null;
    }
    const data = await res.json();
    return data.reply || null;
  } catch (err) {
    console.error("EXYRO assistant: fetch to Worker failed", err);
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

  // Repli : base de connaissances locale (10 sujets), toujours disponible.
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
