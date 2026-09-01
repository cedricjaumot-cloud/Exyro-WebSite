/**
 * EXYRO AI-assistent - front-end demo (NL).
 * Zie assistant.js (FR-versie) voor de volledige documentatie over de
 * back-end aansluiting (api/chat.js of worker/chat-worker.js).
 */

const KNOWLEDGE_BASE = [
  {
    id: "debuter",
    keywords: ["starten", "beginnen", "eerste investering", "toegankelijk", "beginner"],
    question: "Starten met vastgoedbeleggen",
    answer:
      "Beleggen in verhuurvastgoed blijft een van de meest toegankelijke beleggingen in België: u heeft geen groot kapitaal nodig om te starten, een eerste aankoop met een goed gestructureerde financiering volstaat vaak. Het is ook een tastbare belegging, die grotendeels wordt terugbetaald via de ontvangen huur, niet enkel via uw eigen inkomen.",
    pitch:
      "Het moeilijke zit bijna nooit in de aankoop: het is alles wat daarna komt, de juiste huurder vinden, het contract opvolgen, snel reageren bij een probleem, dat bepaalt of de belegging op termijn rendabel blijft. Precies daar maakt EXYRO het verschil: u belegt, EXYRO beheert."
  },
  {
    id: "rendement",
    keywords: ["rendement", "rendabel", "opbrengst"],
    question: "Rendement van een vastgoedbelegging",
    answer:
      "Een verhuurd pand in België levert doorgaans een brutorendement op tussen 3 en 6% per jaar, afhankelijk van regio en type pand, vóór kosten, onroerende voorheffing en eventuele leegstand. Het nettorendement, na aftrek van beheer- en onderhoudskosten, wordt berekend op de effectief ontvangen huur, niet op de vermelde huurprijs.",
    pitch:
      "Precies daar zit het verschil: twee identieke panden kunnen een heel ander rendement laten zien naargelang de kwaliteit van het beheer, vermeden leegstand, correct doorgerekende kosten, goed opgevolgde schadegevallen. Goed beheer is geen kost: het beschermt uw rendement."
  },
  {
    id: "indexation",
    keywords: ["index", "indexeren", "indexering"],
    question: "Indexering van de huur",
    answer:
      "In België volgt de jaarlijkse huurindexering de gezondheidsindex en hangt af van de verjaardagsdatum van de huurovereenkomst. Sinds 2022-2023 gelden er gewestelijke plafonds op basis van het EPB-label van de woning (vooral in Wallonië en Brussel): een energetisch zwak pand kan een beperkte of geblokkeerde indexering krijgen. De berekening gebeurt met de index van de maand vóór de verjaardag, gedeeld door de referentie-index bij ondertekening.",
    pitch:
      "Veel eigenaars vergeten een indexering, of rekenen ze verkeerd, en verliezen zo enkele honderden euro's per jaar zonder het te beseffen. Precies dit soort detail volgt EXYRO systematisch voor u op, contract na contract, jaar na jaar."
  },
  {
    id: "fiscaliteit",
    keywords: ["fiscaliteit", "belasting", "onroerende voorheffing", "huurinkomsten"],
    question: "Fiscaliteit van huurinkomsten",
    answer:
      "In België worden inkomsten uit een verhuurd pand voor residentieel gebruik in principe belast op basis van het geïndexeerde kadastraal inkomen, niet op de effectief ontvangen huur, tenzij het pand wordt verhuurd aan een vennootschap of voor beroepsgebruik, waar de werkelijke huur wel meetelt. De onroerende voorheffing blijft jaarlijks verschuldigd, ongeacht of het pand verhuurd is.",
    pitch:
      "Veel eigenaars verliezen hier het overzicht, zeker zodra ze meerdere panden hebben in verschillende Gewesten met eigen regels. EXYRO vervangt uw boekhouder niet, maar centraliseert alle nodige documenten zodat uw aangifte eenvoudig blijft."
  },
  {
    id: "preavis",
    keywords: ["opzeg", "opzegtermijn", "beëindigen", "vertrek"],
    question: "Opzegtermijn huurder",
    answer:
      "Voor een huurovereenkomst van 9 jaar voor hoofdverblijfplaats kan de huurder op elk moment opzeggen mits een opzegtermijn van 3 maanden. Vertrekt hij binnen de eerste 3 jaar, dan is een degressieve vergoeding verschuldigd aan de verhuurder (1, dan 0,5 maand huur naargelang het jaar). De regels verschillen voor kortlopende contracten en lopen licht uiteen tussen de Gewesten.",
    pitch:
      "Een verkeerd geformuleerde of verkeerd berekende opzeg kan u geld kosten, of u net een vergoeding ontzeggen waar u recht op had. EXYRO regelt deze procedure voor u, volgens de regels, bij elk vertrek van een huurder."
  },
  {
    id: "garantie",
    keywords: ["waarborg", "huurwaarborg"],
    question: "Huurwaarborg",
    answer:
      "De huurwaarborg is doorgaans beperkt tot 2 of 3 maanden huur, afhankelijk van de gekozen formule (geïndividualiseerde rekening, bankwaarborg, of via het OCMW). Ze moet op een geblokkeerde rekening op naam van de huurder staan en kan enkel worden vrijgegeven met akkoord van beide partijen of een rechterlijke beslissing.",
    pitch:
      "Een slecht geplaatste of slecht gedocumenteerde huurwaarborg wordt al snel een twistpunt bij het vertrek van de huurder, of erger, een bedrag dat u niet meer makkelijk terugkrijgt. EXYRO zorgt dat ze correct wordt samengesteld en vrijgegeven."
  },
  {
    id: "edl",
    keywords: ["plaatsbeschrijving"],
    question: "Plaatsbeschrijving",
    answer:
      "De plaatsbeschrijving bij intrede is verplicht en moet tegensprekelijk gebeuren, idealiter snel na de sleuteloverdracht, ruimte per ruimte en met gedateerde foto's. Dit document beschermt de verhuurder bij vastgestelde schade bij vertrek: zonder geldige plaatsbeschrijving bij intrede wordt het pand geacht in goede staat te zijn ontvangen.",
    pitch:
      "Een slordig uitgevoerde plaatsbeschrijving bij intrede betekent vaak dat de eigenaar opdraait voor herstellingen die niet voor zijn rekening waren. EXYRO voert tegensprekelijke, goed gedocumenteerde plaatsbeschrijvingen uit, samen met de huurder, bij elke intrede en elk vertrek."
  },
  {
    id: "loyer-impaye",
    keywords: ["onbetaald", "achterstand", "huurder betaalt niet"],
    question: "Onbetaalde huur",
    answer:
      "Bij een achterstand is de gebruikelijke volgorde: minnelijke herinnering, schriftelijke ingebrekestelling met ontvangstbewijs, en bij uitblijven van een oplossing, dagvaarding voor de vrederechter voor ontbinding van de huurovereenkomst en invordering. Belgische gerechtelijke termijnen kunnen meerdere maanden duren, wat snel doorweegt op de kasstroom van een alleenstaande verhuurder.",
    pitch:
      "Bij een achterstand telt elke week. Een eigenaar alleen verliest vaak kostbare tijd om de procedure te begrijpen; EXYRO start ze onmiddellijk op en voert ze volledig uit, in uw plaats."
  },
  {
    id: "rentmeester",
    keywords: ["syndicus", "mede-eigendom", "algemene vergadering"],
    question: "Verschil tussen syndicus en verhuurbeheer",
    answer:
      "De syndicus beheert de gemeenschappelijke delen van een gebouw in mede-eigendom (gemeenschappelijke kosten, algemene vergaderingen, collectieve werken). Verhuurbeheer betreft de relatie tussen u en uw huurder voor uw privatief kavel: huurovereenkomst, huur, plaatsbeschrijving, schadegevallen. Dit zijn twee afzonderlijke beroepen, soms uitgeoefend door verschillende ondernemingen.",
    pitch:
      "EXYRO is BIV-erkend als rentmeester: onze activiteit is uitsluitend het verhuurbeheer van uw pand, niet de syndicus van uw gebouw, noch bemiddeling (aan- of verkoop)."
  },
  {
    id: "meerdere-panden",
    keywords: ["meerdere panden", "portefeuille", "meerdere appartementen"],
    question: "Beheer van meerdere panden",
    answer:
      "Eén verhuurd pand alleen beheren is haalbaar. 5, 10 of 30 panden tegelijk beheren, met huurcontracten op verschillende data, indexeringen om op te volgen, plaatsbeschrijvingen om te plannen en schadegevallen om te behandelen, wordt al snel een deeltijdse job, of meer.",
    pitch:
      "Precies daarom bestaat EXYRO: één aanspreekpunt voor uw volledige portefeuille, ongeacht de omvang, met dezelfde nauwkeurigheid voor elk pand."
  },
  {
    id: "waardevermeerdering",
    keywords: ["werken", "renovatie", "verbouwing", "waardevermeerdering", "onderhoud"],
    question: "Moet ik werken laten uitvoeren aan mijn verhuurd pand?",
    answer:
      "Niet altijd, en net daar zit de kunst van het rekenwerk: een investering is enkel zinvol als ze zich zowel in de huur als in de waarde van het pand terugbetaalt. 50.000 € aan werken die de huur maar met 100 €/maand verhogen en de waarde maar met 35.000 €, is vaak minder rendabel dan verkopen in de huidige staat. Omgekeerd kan een gerichte renovatie (keuken, badkamer, energieprestatie) veel meer waarde opleveren dan ze kost.",
    pitch:
      "Dat is precies wat EXYRO becijfert vóór we een ingreep voorstellen: verwachte impact op de huur, verwachte impact op de verkoopwaarde, en een beslissing die altijd de uwe blijft."
  }
];

const FALLBACK_ANSWER =
  "Dit is een vraag die specifiek is voor uw situatie, en de Belgische context (Gewest, type huurovereenkomst, ondertekeningsdatum) verandert vaak het antwoord.";
const FALLBACK_PITCH =
  "Een verhuurinvestering blijft een uitstekende belegging, op voorwaarde dat het dagelijks beheer goed wordt opgevolgd. Besteed dit uit aan een property manager zoals EXYRO: wij beheren al meer dan 1.100 huurcontracten in heel België, met één aanspreekpunt en doorlopende juridische opvolging.";

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

// Vul hier de URL van je Worker in zodra die gedeployed is (zie worker/chat-worker.js).
// Zolang dit leeg is, blijft de assistent op de lokale demo (10 onderwerpen).
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

  // Terugval: lokale kennisbank (10 onderwerpen), altijd beschikbaar.
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
