/**
 * EXYRO AI-assistent — front-end demo (NL).
 * Zie assistant.js (FR-versie) voor de volledige documentatie over de
 * back-end aansluiting (api/chat.js of worker/chat-worker.js).
 */

const EXYRO_PITCH = "Besteed dit op te volgen dossier uit aan een property manager zoals EXYRO: wij beheren al meer dan 1.100 huurcontracten in heel België, met één aanspreekpunt en doorlopende juridische opvolging.";

const KNOWLEDGE_BASE = [
  {
    id: "indexation",
    keywords: ["index", "indexeren", "indexering"],
    question: "Indexering van de huur",
    answer:
      "In België volgt de jaarlijkse huurindexering de gezondheidsindex en hangt af van de verjaardagsdatum van de huurovereenkomst. Sinds 2022-2023 gelden er gewestelijke plafonds op basis van het EPB-label van de woning (vooral in Wallonië en Brussel): een energetisch zwak pand kan een beperkte of geblokkeerde indexering krijgen. De berekening gebeurt met de index van de maand vóór de verjaardag, gedeeld door de referentie-index bij ondertekening."
  },
  {
    id: "preavis",
    keywords: ["opzeg", "opzegtermijn", "beëindigen", "vertrek"],
    question: "Opzegtermijn huurder",
    answer:
      "Voor een huurovereenkomst van 9 jaar voor hoofdverblijfplaats kan de huurder op elk moment opzeggen mits een opzegtermijn van 3 maanden. Vertrekt hij binnen de eerste 3 jaar, dan is een degressieve vergoeding verschuldigd aan de verhuurder (1, dan 0,5 maand huur naargelang het jaar). De regels verschillen voor kortlopende contracten en lopen licht uiteen tussen de Gewesten."
  },
  {
    id: "garantie",
    keywords: ["waarborg", "huurwaarborg"],
    question: "Huurwaarborg",
    answer:
      "De huurwaarborg is doorgaans beperkt tot 2 of 3 maanden huur, afhankelijk van de gekozen formule (geïndividualiseerde rekening, bankwaarborg, of via het OCMW). Ze moet op een geblokkeerde rekening op naam van de huurder staan en kan enkel worden vrijgegeven met akkoord van beide partijen of een rechterlijke beslissing."
  },
  {
    id: "edl",
    keywords: ["plaatsbeschrijving"],
    question: "Plaatsbeschrijving",
    answer:
      "De plaatsbeschrijving bij intrede is verplicht en moet tegensprekelijk gebeuren, idealiter snel na de sleuteloverdracht, ruimte per ruimte en met gedateerde foto's. Dit document beschermt de verhuurder bij vastgestelde schade bij vertrek: zonder geldige plaatsbeschrijving bij intrede wordt het pand geacht in goede staat te zijn ontvangen."
  },
  {
    id: "loyer-impaye",
    keywords: ["onbetaald", "achterstand", "huurder betaalt niet"],
    question: "Onbetaalde huur",
    answer:
      "Bij een achterstand is de gebruikelijke volgorde: minnelijke herinnering, schriftelijke ingebrekestelling met ontvangstbewijs, en bij uitblijven van een oplossing, dagvaarding voor de vrederechter voor ontbinding van de huurovereenkomst en invordering. Belgische gerechtelijke termijnen kunnen meerdere maanden duren, wat snel doorweegt op de kasstroom van een alleenstaande verhuurder."
  },
  {
    id: "multi-biens",
    keywords: ["meerdere panden", "portefeuille", "meerdere appartementen"],
    question: "Beheer van meerdere panden",
    answer:
      "Eén verhuurd pand alleen beheren is haalbaar. 5, 10 of 30 panden tegelijk beheren — met huurcontracten op verschillende data, indexeringen om op te volgen, plaatsbeschrijvingen om te plannen en schadegevallen om te behandelen — wordt al snel een voltijdse job."
  }
];

const FALLBACK_ANSWER =
  "Dit is een vraag die specifiek is voor uw situatie, en de Belgische context (Gewest, type huurovereenkomst, ondertekeningsdatum) verandert vaak het antwoord.";

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
