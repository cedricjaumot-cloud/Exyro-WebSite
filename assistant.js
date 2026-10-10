/**
 * Assistant EXYRO : questions générales sur la location et l'investissement immobilier en Belgique.
 *
 * Fonctionnement : la question part vers le Worker (voir worker/chat-worker.js), qui détient la clé API.
 * Si le Worker est injoignable, une base locale prend le relais (repli).
 * Les réponses sont rédigées en Markdown simple (gras, listes) et converties en HTML lisible ci-dessous.
 */

const LANG = "fr";
const WORKER_URL = "https://exyrowebsite-chat.ced-j-account.workers.dev";
const GREETING = "Bonjour, je réponds à vos questions générales sur la location et l'investissement immobilier en Belgique. Choisissez un sujet ou posez votre question. Pour votre situation personnelle, une personne de l'équipe prend le relais.";
const FALLBACK_ANSWER = "Je n'ai pas de réponse prête pour cette question, et le contexte belge (Région, type de bail, date de signature) change souvent la réponse. Choisissez un des sujets proposés, reformulez, ou écrivez directement à l'équipe : **gestion@exyro.be**.";

const KNOWLEDGE_BASE = [
  {
    "id": "bail",
    "keywords": [
      "signer un bail",
      "signature du bail",
      "avant de signer",
      "bail"
    ],
    "question": "Signer un bail : à quoi faire attention ?",
    "answer": "Avant de signer un bail, quelques points méritent toute votre attention :\n- **Un écrit, toujours** : le bail de résidence principale doit être écrit et enregistré (en principe par le bailleur, gratuitement pour une résidence principale).\n- **La durée** : 9 ans (avec possibilités de sortie anticipée), courte durée de 3 ans maximum, ou longue durée.\n- **Le loyer, les charges et l'indexation** : précisez si les charges sont forfaitaires ou en provision, et la date d'indexation.\n- **La garantie locative** : en général 2 mois de loyer maximum, sur un compte bloqué (jusqu'à 3 mois avec une garantie bancaire).\n- **L'état des lieux d'entrée** : contradictoire, détaillé, idéalement avec photos datées.\n- **Le certificat PEB** et les annexes obligatoires de votre Région.\n- **L'assurance incendie** et la répartition des petites réparations.\nLes règles varient selon la Région. Pour vérifier : le site de votre Région (Wallonie, Bruxelles Logement, Wonen Vlaanderen), SPF Finances (enregistrement) et notaire.be."
  },
  {
    "id": "candidat",
    "keywords": [
      "candidat",
      "dossier locataire",
      "informations demander",
      "documents demander"
    ],
    "question": "Quelles informations demander à un candidat locataire ?",
    "answer": "Vous pouvez demander ce qui est **nécessaire et proportionné** pour évaluer sa capacité à payer le loyer et à entretenir le bien :\n- son identité et ses coordonnées, le nombre d'occupants ;\n- des preuves de revenus : fiches de paie récentes, contrat de travail ou avis d'imposition ;\n- éventuellement les coordonnées de son ancien bailleur ;\n- la date d'entrée souhaitée.\nÀ éviter : l'état de santé, l'origine, la religion, les opinions, la vie privée, des relevés bancaires complets ou toute question discriminatoire. La législation anti-discrimination et le RGPD s'appliquent, et certaines Régions précisent les documents que vous pouvez exiger.\nConservez uniquement le dossier du candidat retenu et supprimez les autres.\nPour vérifier : Autorité de protection des données (autoriteprotectiondonnees.be), Unia (unia.be) et le site de votre Région."
  },
  {
    "id": "deces",
    "keywords": [
      "décès",
      "deces",
      "décédé",
      "mort du",
      "mort d'un"
    ],
    "question": "Que faire en cas de décès du bailleur ou du locataire ?",
    "answer": "Le bail ne s'arrête pas automatiquement.\n- **Décès du locataire** : le bail se poursuit avec ses héritiers ou avec les personnes qui occupaient le bien (conjoint, cohabitant légal…). Les héritiers peuvent en général y mettre fin moyennant un préavis, selon des conditions propres à chaque Région. Le loyer reste dû jusqu'à la fin du bail.\n- **Décès du bailleur** : le bail se poursuit avec les héritiers ou le nouveau propriétaire. Le locataire ne doit pas quitter les lieux et paie son loyer à l'adresse indiquée par les nouveaux propriétaires. La garantie locative suit le bail.\nDans les deux cas : écrivez rapidement à l'autre partie, ne changez pas les serrures, ne vous faites pas justice vous-même et faites un état des lieux à la fin du bail.\nUne succession est souvent complexe : un notaire est le bon interlocuteur. Pour vérifier : notaire.be et le site de votre Région."
  },
  {
    "id": "conflit",
    "keywords": [
      "conflit",
      "litige",
      "désaccord",
      "désaccord",
      "dispute",
      "juge de paix"
    ],
    "question": "Que faire en cas de conflit avec mon locataire ou mon propriétaire ?",
    "answer": "Avancez par étapes :\n1. **Parlez-en d'abord**, rapidement et calmement : beaucoup de litiges se règlent à ce stade.\n2. **Confirmez par écrit** (courrier recommandé ou e-mail avec preuve) : décrivez le problème et ce que vous demandez.\n3. **Cherchez une solution amiable** : selon votre Région, une commission paritaire locative ou un service de conciliation ou de médiation peut aider.\n4. **En dernier recours**, le **juge de paix** est compétent pour les litiges de bail ; une tentative de conciliation précède souvent la procédure.\nGardez toutes les preuves : bail, états des lieux, photos, échanges, preuves de paiement.\nPour vérifier : le site de votre Région et justice.belgium.be (justice de paix)."
  },
  {
    "id": "investir",
    "keywords": [
      "pourquoi investir",
      "investir dans l'immobilier",
      "investissement immobilier",
      "investir"
    ],
    "question": "Pourquoi investir dans l'immobilier ?",
    "answer": "Investir dans l'immobilier locatif, c'est se constituer un **actif tangible** qui produit un revenu régulier. Avant de vous lancer, posez-vous ces questions :\n- **Quel est votre objectif ?** Un capital à terme, un revenu complémentaire, la transmission, la retraite…\n- **Quel horizon ?** L'immobilier se pense sur 10 à 20 ans, pas sur 2 ans.\n- **Quelle capacité d'épargne et d'emprunt ?** Que pouvez-vous y consacrer sans fragiliser votre budget ?\n- **Quel rendement net** après frais d'acquisition, charges, précompte immobilier, vacance et travaux ?\n- **Quelle solidité du bien et de l'emplacement ?** Demande locative, état du bâtiment, score PEB.\nLes atouts : un loyer indexé, une protection relative contre l'inflation, la possibilité d'utiliser le crédit. Les risques : capital immobilisé, vacance, impayés, travaux, taux d'intérêt, évolution de la réglementation.\nPour vérifier : notaire.be (frais d'acquisition) et SPF Finances (fiscalité). Cette réflexion doit toujours se faire avec votre situation personnelle en tête."
  },
  {
    "id": "levier",
    "keywords": [
      "effet de levier",
      "levier",
      "emprunt",
      "crédit hypothécaire",
      "prêt hypothécaire"
    ],
    "question": "L'effet de levier du crédit, expliqué simplement",
    "answer": "L'effet de levier consiste à utiliser le **crédit de la banque** pour acquérir un bien plus important que ce que vos fonds propres permettent, tout en laissant le loyer et l'évolution de la valeur travailler pour vous.\nExemple simplifié et théorique, frais d'acquisition mis de côté, avec 100 000 € de fonds propres :\n- **Sans crédit** : vous achetez un bien de 100 000 €. Si sa valeur augmente de 3 %, vous gagnez 3 000 €.\n- **Avec crédit** : vous achetez un bien de 400 000 € (100 000 € d'apport et 300 000 € d'emprunt). Pour la même hausse de 3 %, la valeur augmente de 12 000 €, soit quatre fois plus pour le même capital de départ.\nLe levier amplifie aussi les risques : si la valeur baisse ou si le bien reste vide, la mensualité reste due. Gardez toujours une marge de sécurité sur votre capacité de remboursement, et tenez compte des intérêts, des charges et des taux variables.\nCes calculs dépendent de votre situation : parlez-en à votre banque et à un notaire. Pour vérifier : notaire.be."
  },
  {
    "id": "bitcoin",
    "keywords": [
      "bitcoin",
      "crypto",
      "btc"
    ],
    "question": "Immobilier ou bitcoin : comment réfléchir ?",
    "answer": "Ce ne sont pas des placements de même nature. La bonne question n'est pas « lequel est le meilleur », mais « lequel correspond à mon objectif et à ma tolérance au risque ».\n- **Immobilier locatif** : un actif tangible, un **revenu régulier** (loyer indexé), la possibilité d'emprunter, une valeur généralement moins volatile. En contrepartie : capital immobilisé, frais d'acquisition élevés, gestion et travaux, risque de vacance ou d'impayé, revente lente.\n- **Bitcoin** : liquide, accessible avec un petit montant, avec un potentiel de forte hausse. En contrepartie : **très volatil**, aucun revenu, pas de valeur d'usage, un cadre réglementaire et fiscal encore mouvant, et un risque de perte importante, voire totale.\nBeaucoup d'investisseurs prudents construisent d'abord une base solide (épargne de précaution, patrimoine immobilier) et ne consacrent aux actifs très spéculatifs qu'une petite part qu'ils pourraient perdre.\nCeci n'est pas un conseil en investissement. Pour vérifier : FSMA (fsma.be), qui publie des mises en garde sur les crypto-actifs."
  },
  {
    "id": "debuter",
    "keywords": [
      "débuter",
      "commencer",
      "premier investissement",
      "se lancer",
      "accessible",
      "débutant"
    ],
    "question": "Se lancer dans l'investissement locatif",
    "answer": "Investir dans l'immobilier locatif reste l'un des placements les plus accessibles en Belgique : il n'est pas nécessaire d'avoir un gros capital pour démarrer, un premier achat avec un financement bien structuré suffit souvent à lancer un premier bien. C'est aussi un placement tangible, qui se rembourse en grande partie grâce aux loyers perçus plutôt que sur vos seuls revenus."
  },
  {
    "id": "rendement",
    "keywords": [
      "rendement",
      "rentabilité",
      "rentable",
      "rapport locatif"
    ],
    "question": "Rendement d'un investissement locatif",
    "answer": "Un investissement locatif en Belgique dégage généralement un rendement brut entre 3 et 6% par an selon la région et le type de bien, avant charges, précompte immobilier et éventuelle vacance locative. Le rendement net, une fois les frais de gestion et d'entretien déduits, se calcule sur le loyer réellement perçu sur l'année, pas sur le loyer affiché."
  },
  {
    "id": "indexation",
    "keywords": [
      "index",
      "indexer",
      "indexation"
    ],
    "question": "Indexation du loyer",
    "answer": "En Belgique, l'indexation annuelle du loyer suit l'indice santé et dépend de la date anniversaire du bail. Depuis 2022-2023, des plafonds régionaux existent selon le score PEB du logement (surtout en Wallonie et à Bruxelles) : un bien mal classé énergétiquement peut voir son indexation réduite, voire bloquée. Le calcul se fait avec l'indice du mois précédant l'anniversaire, divisé par l'indice de référence au moment de la signature."
  },
  {
    "id": "fiscalite",
    "keywords": [
      "fiscalité",
      "impôt",
      "précompte",
      "revenus locatifs",
      "taxation"
    ],
    "question": "Fiscalité des revenus locatifs",
    "answer": "En Belgique, les revenus d'un bien loué à usage résidentiel sont en principe taxés sur base du revenu cadastral indexé, pas sur le loyer réellement perçu, sauf si le bien est loué à une société ou affecté à un usage professionnel, où le loyer réel entre en compte. Le précompte immobilier reste dû chaque année, que le bien soit loué ou non."
  },
  {
    "id": "preavis",
    "keywords": [
      "préavis",
      "preavis",
      "résilier",
      "resilier",
      "quitter",
      "sortie du bail"
    ],
    "question": "Préavis du locataire",
    "answer": "Pour un bail de résidence principale de 9 ans, le locataire peut résilier à tout moment moyennant un préavis de 3 mois. S'il part durant les 3 premières années, une indemnité dégressive est due au propriétaire (1, puis 0,5 mois de loyer selon l'année). Les règles diffèrent pour les baux de courte durée et varient légèrement entre Régions."
  },
  {
    "id": "garantie",
    "keywords": [
      "garantie",
      "caution"
    ],
    "question": "Garantie locative",
    "answer": "La garantie locative est généralement plafonnée à 2 ou 3 mois de loyer selon la formule choisie (compte individualisé, garantie bancaire, ou via le CPAS). Elle doit être placée sur un compte bloqué au nom du locataire et ne peut être débloquée qu'avec l'accord des deux parties ou une décision de justice."
  },
  {
    "id": "edl",
    "keywords": [
      "état des lieux",
      "etat des lieux",
      "edl"
    ],
    "question": "État des lieux",
    "answer": "L'état des lieux d'entrée est obligatoire et doit être réalisé de manière contradictoire, dans les meilleurs délais après la remise des clés, idéalement local par local et avec photos datées. C'est ce document qui protège le propriétaire en cas de dégâts constatés à la sortie : sans EDL d'entrée valable, le logement est présumé reçu en bon état."
  },
  {
    "id": "loyer-impaye",
    "keywords": [
      "impayé",
      "impaye",
      "retard de loyer",
      "locataire ne paie pas"
    ],
    "question": "Loyer impayé",
    "answer": "Face à un impayé, l'ordre habituel est : rappel amiable, mise en demeure écrite avec accusé de réception, puis, en l'absence de solution, saisine du juge de paix pour obtenir la résiliation du bail et le recouvrement. Les délais judiciaires belges peuvent s'étaler sur plusieurs mois, ce qui pèse vite sur la trésorerie d'un propriétaire seul."
  },
  {
    "id": "syndic",
    "keywords": [
      "syndic",
      "copropriété",
      "assemblée générale"
    ],
    "question": "Différence entre syndic et gestion locative",
    "answer": "Le syndic gère les parties communes d'un immeuble en copropriété (charges communes, assemblées générales, travaux collectifs). La gestion locative concerne, elle, la relation entre vous et votre locataire sur votre lot privatif : bail, loyer, état des lieux, sinistres. Ce sont deux métiers distincts, parfois exercés par des sociétés différentes."
  },
  {
    "id": "multi-biens",
    "keywords": [
      "plusieurs biens",
      "multi-biens",
      "portefeuille",
      "plusieurs appartements"
    ],
    "question": "Gestion de plusieurs biens",
    "answer": "Gérer un bien locatif seul est faisable. Gérer 5, 10 ou 30 biens en parallèle, avec des baux à des dates différentes, des indexations à suivre, des états des lieux à planifier et des sinistres à traiter, devient rapidement un travail à temps partiel, voire plus."
  },
  {
    "id": "valorisation",
    "keywords": [
      "travaux",
      "rénovation",
      "renovation",
      "valorisation",
      "améliorer mon bien",
      "entretien"
    ],
    "question": "Faut-il faire des travaux dans mon bien loué ?",
    "answer": "Pas toujours, et c'est tout l'art du calcul : un investissement n'a de sens que s'il se retrouve à la fois dans le loyer et dans la valeur du bien. Faire 50 000 € de travaux qui n'augmentent le loyer que de 100 €/mois et la valeur du bien que de 35 000 €, c'est souvent moins rentable que de vendre en l'état. À l'inverse, une rénovation ciblée (cuisine, salle de bain, performance énergétique) peut valoriser bien plus que son coût."
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
