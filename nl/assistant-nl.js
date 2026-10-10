/**
 * Assistant EXYRO : questions générales sur la location et l'investissement immobilier en Belgique.
 *
 * Fonctionnement : la question part vers le Worker (voir worker/chat-worker.js), qui détient la clé API.
 * Si le Worker est injoignable, une base locale prend le relais (repli).
 * Les réponses sont rédigées en Markdown simple (gras, listes) et converties en HTML lisible ci-dessous.
 */

const LANG = "nl";
const WORKER_URL = "https://exyrowebsite-chat.ced-j-account.workers.dev";
const GREETING = "Hallo, ik beantwoord uw algemene vragen over verhuur en vastgoedbeleggingen in België. Kies een onderwerp of stel uw vraag. Voor uw persoonlijke situatie neemt een persoon van het team het over.";
const FALLBACK_ANSWER = "Ik heb geen kant-en-klaar antwoord op deze vraag, en de Belgische context (Gewest, type huurovereenkomst, ondertekeningsdatum) verandert vaak het antwoord. Kies een van de voorgestelde onderwerpen, herformuleer, of schrijf rechtstreeks naar het team: **beheer@exyro.be**.";

const KNOWLEDGE_BASE = [
  {
    "id": "bail",
    "keywords": [
      "huurcontract",
      "huurovereenkomst",
      "contract tekenen",
      "ondertekenen"
    ],
    "question": "Een huurovereenkomst ondertekenen: waarop letten?",
    "answer": "Voor u een huurovereenkomst ondertekent, verdienen enkele punten uw volle aandacht:\n- **Altijd schriftelijk**: de huurovereenkomst voor een hoofdverblijfplaats moet schriftelijk zijn en geregistreerd worden (in principe door de verhuurder, gratis voor een hoofdverblijfplaats).\n- **De duur**: 9 jaar (met mogelijkheden tot vervroegd vertrek), korte duur van maximaal 3 jaar, of lange duur.\n- **Huur, kosten en indexering**: vermeld of de kosten forfaitair of als voorschot worden aangerekend, en de indexeringsdatum.\n- **De huurwaarborg**: doorgaans maximaal 2 maanden huur, op een geblokkeerde rekening (tot 3 maanden bij een bankgarantie).\n- **De plaatsbeschrijving bij intrede**: tegensprekelijk, gedetailleerd, bij voorkeur met gedateerde foto's.\n- **Het EPC-attest** en de verplichte bijlagen van uw Gewest.\n- **De brandverzekering** en de verdeling van kleine herstellingen.\nDe regels verschillen per Gewest. Om na te gaan: de website van uw Gewest (Wonen Vlaanderen, Wallonië, Brussel Huisvesting), FOD Financiën (registratie) en notaris.be."
  },
  {
    "id": "candidat",
    "keywords": [
      "kandidaat",
      "huurder dossier",
      "welke informatie vragen",
      "documenten vragen"
    ],
    "question": "Welke informatie mag ik vragen aan een kandidaat-huurder?",
    "answer": "U kunt vragen wat **noodzakelijk en evenredig** is om te beoordelen of iemand de huur kan betalen en het pand kan onderhouden:\n- identiteit en contactgegevens, aantal bewoners;\n- bewijzen van inkomen: recente loonfiches, arbeidscontract of aanslagbiljet;\n- eventueel de gegevens van de vorige verhuurder;\n- de gewenste intredingsdatum.\nTe vermijden: gezondheidstoestand, afkomst, geloof, opvattingen, privéleven, volledige bankuittreksels of elke discriminerende vraag. De antidiscriminatiewetgeving en de AVG zijn van toepassing, en sommige Gewesten bepalen welke documenten u mag eisen.\nBewaar enkel het dossier van de gekozen kandidaat en verwijder de andere.\nOm na te gaan: Gegevensbeschermingsautoriteit (gegevensbeschermingsautoriteit.be), Unia (unia.be) en de website van uw Gewest."
  },
  {
    "id": "deces",
    "keywords": [
      "overlijden",
      "overleden",
      "sterfgeval",
      "dood van"
    ],
    "question": "Wat bij overlijden van de verhuurder of de huurder?",
    "answer": "De huurovereenkomst eindigt niet automatisch.\n- **Overlijden van de huurder**: de huur loopt door met de erfgenamen of met de personen die het pand bewoonden (echtgenoot, wettelijk samenwonende…). De erfgenamen kunnen er doorgaans een einde aan maken met een opzeggingstermijn, onder voorwaarden die per Gewest verschillen. De huur blijft verschuldigd tot het einde van de overeenkomst.\n- **Overlijden van de verhuurder**: de huur loopt door met de erfgenamen of de nieuwe eigenaar. De huurder hoeft niet te vertrekken en betaalt zijn huur op het adres dat de nieuwe eigenaars meedelen. De huurwaarborg volgt de huurovereenkomst.\nIn beide gevallen: schrijf snel naar de andere partij, verander de sloten niet, zorg niet zelf voor \"recht\" en maak een plaatsbeschrijving op het einde van de huur.\nEen nalatenschap is vaak complex: een notaris is de juiste gesprekspartner. Om na te gaan: notaris.be en de website van uw Gewest."
  },
  {
    "id": "conflit",
    "keywords": [
      "conflict",
      "geschil",
      "meningsverschil",
      "vrederechter"
    ],
    "question": "Wat bij een conflict met mijn huurder of verhuurder?",
    "answer": "Ga stap voor stap te werk:\n1. **Praat er eerst over**, snel en rustig: veel geschillen worden in dit stadium opgelost.\n2. **Bevestig schriftelijk** (aangetekende brief of e-mail met bewijs): beschrijf het probleem en wat u vraagt.\n3. **Zoek een minnelijke oplossing**: naargelang uw Gewest kan een paritaire huurcommissie of een bemiddelings- of verzoeningsdienst helpen.\n4. **Als laatste redmiddel** is de **vrederechter** bevoegd voor huurgeschillen; een poging tot verzoening gaat de procedure vaak vooraf.\nBewaar alle bewijzen: huurovereenkomst, plaatsbeschrijvingen, foto's, briefwisseling, betalingsbewijzen.\nOm na te gaan: de website van uw Gewest en justice.belgium.be (vredegerecht)."
  },
  {
    "id": "investir",
    "keywords": [
      "waarom investeren",
      "investeren in vastgoed",
      "vastgoed investeren",
      "investeren"
    ],
    "question": "Waarom investeren in vastgoed?",
    "answer": "Investeren in verhuurvastgoed betekent een **tastbaar actief** opbouwen dat een regelmatig inkomen oplevert. Stel uzelf vooraf deze vragen:\n- **Wat is uw doel?** Kapitaal op termijn, een aanvullend inkomen, overdracht, pensioen…\n- **Welke horizon?** Vastgoed denk je in 10 tot 20 jaar, niet in 2 jaar.\n- **Welke spaar- en leencapaciteit?** Wat kunt u inzetten zonder uw budget te verzwakken?\n- **Welk nettorendement** na aankoopkosten, lasten, onroerende voorheffing, leegstand en werken?\n- **Hoe degelijk zijn het pand en de ligging?** Huurvraag, staat van het gebouw, EPC-score.\nDe troeven: een geïndexeerde huur, een relatieve bescherming tegen inflatie, de mogelijkheid om krediet te gebruiken. De risico's: vastgelegd kapitaal, leegstand, wanbetaling, werken, rente, evoluerende regelgeving.\nOm na te gaan: notaris.be (aankoopkosten) en FOD Financiën (fiscaliteit). Deze afweging maakt u steeds met uw persoonlijke situatie in gedachten."
  },
  {
    "id": "levier",
    "keywords": [
      "hefboom",
      "hefboomeffect",
      "lening",
      "hypothecair"
    ],
    "question": "Het hefboomeffect van krediet, eenvoudig uitgelegd",
    "answer": "Het hefboomeffect betekent dat u het **krediet van de bank** gebruikt om een groter pand te kopen dan uw eigen middelen toelaten, terwijl de huur en de waardeontwikkeling voor u werken.\nVereenvoudigd en theoretisch voorbeeld, aankoopkosten buiten beschouwing, met 100 000 € eigen middelen:\n- **Zonder krediet**: u koopt een pand van 100 000 €. Stijgt de waarde met 3 %, dan wint u 3 000 €.\n- **Met krediet**: u koopt een pand van 400 000 € (100 000 € inbreng en 300 000 € lening). Bij dezelfde stijging van 3 % neemt de waarde toe met 12 000 €, vier keer meer voor hetzelfde startkapitaal.\nDe hefboom versterkt ook de risico's: daalt de waarde of blijft het pand leeg, dan blijft de maandelijkse aflossing verschuldigd. Houd altijd een veiligheidsmarge op uw terugbetalingscapaciteit en houd rekening met interesten, lasten en variabele rentes.\nDeze berekeningen hangen af van uw situatie: bespreek ze met uw bank en een notaris. Om na te gaan: notaris.be."
  },
  {
    "id": "bitcoin",
    "keywords": [
      "bitcoin",
      "crypto",
      "btc"
    ],
    "question": "Vastgoed of bitcoin: hoe afwegen?",
    "answer": "Het zijn beleggingen van een verschillende aard. De juiste vraag is niet \"welke is de beste\", maar \"welke past bij mijn doel en mijn risicobereidheid\".\n- **Verhuurvastgoed**: een tastbaar actief, een **regelmatig inkomen** (geïndexeerde huur), de mogelijkheid om te lenen, een doorgaans minder volatiele waarde. Daartegenover: vastgelegd kapitaal, hoge aankoopkosten, beheer en werken, risico op leegstand of wanbetaling, trage verkoop.\n- **Bitcoin**: liquide, toegankelijk met een klein bedrag, met potentieel voor sterke stijgingen. Daartegenover: **zeer volatiel**, geen inkomen, geen gebruikswaarde, een regelgevend en fiscaal kader dat nog evolueert, en een risico op groot of zelfs volledig verlies.\nVeel voorzichtige beleggers bouwen eerst een stevige basis op (spaarbuffer, vastgoed) en besteden slechts een klein deel, dat ze kunnen missen, aan zeer speculatieve activa.\nDit is geen beleggingsadvies. Om na te gaan: FSMA (fsma.be), die waarschuwingen over cryptoactiva publiceert."
  },
  {
    "id": "debuter",
    "keywords": [
      "starten",
      "beginnen",
      "eerste investering",
      "toegankelijk",
      "beginner"
    ],
    "question": "Starten met vastgoedbeleggen",
    "answer": "Beleggen in verhuurvastgoed blijft een van de meest toegankelijke beleggingen in België: u heeft geen groot kapitaal nodig om te starten, een eerste aankoop met een goed gestructureerde financiering volstaat vaak. Het is ook een tastbare belegging, die grotendeels wordt terugbetaald via de ontvangen huur, niet enkel via uw eigen inkomen."
  },
  {
    "id": "rendement",
    "keywords": [
      "rendement",
      "rendabel",
      "opbrengst"
    ],
    "question": "Rendement van een vastgoedbelegging",
    "answer": "Een verhuurd pand in België levert doorgaans een brutorendement op tussen 3 en 6% per jaar, afhankelijk van regio en type pand, vóór kosten, onroerende voorheffing en eventuele leegstand. Het nettorendement, na aftrek van beheer- en onderhoudskosten, wordt berekend op de effectief ontvangen huur, niet op de vermelde huurprijs."
  },
  {
    "id": "indexation",
    "keywords": [
      "index",
      "indexeren",
      "indexering"
    ],
    "question": "Indexering van de huur",
    "answer": "In België volgt de jaarlijkse huurindexering de gezondheidsindex en hangt af van de verjaardagsdatum van de huurovereenkomst. Sinds 2022-2023 gelden er gewestelijke plafonds op basis van het EPB-label van de woning (vooral in Wallonië en Brussel): een energetisch zwak pand kan een beperkte of geblokkeerde indexering krijgen. De berekening gebeurt met de index van de maand vóór de verjaardag, gedeeld door de referentie-index bij ondertekening."
  },
  {
    "id": "fiscaliteit",
    "keywords": [
      "fiscaliteit",
      "belasting",
      "onroerende voorheffing",
      "huurinkomsten"
    ],
    "question": "Fiscaliteit van huurinkomsten",
    "answer": "In België worden inkomsten uit een verhuurd pand voor residentieel gebruik in principe belast op basis van het geïndexeerde kadastraal inkomen, niet op de effectief ontvangen huur, tenzij het pand wordt verhuurd aan een vennootschap of voor beroepsgebruik, waar de werkelijke huur wel meetelt. De onroerende voorheffing blijft jaarlijks verschuldigd, ongeacht of het pand verhuurd is."
  },
  {
    "id": "preavis",
    "keywords": [
      "opzeg",
      "opzegtermijn",
      "beëindigen",
      "vertrek"
    ],
    "question": "Opzegtermijn huurder",
    "answer": "Voor een huurovereenkomst van 9 jaar voor hoofdverblijfplaats kan de huurder op elk moment opzeggen mits een opzegtermijn van 3 maanden. Vertrekt hij binnen de eerste 3 jaar, dan is een degressieve vergoeding verschuldigd aan de verhuurder (1, dan 0,5 maand huur naargelang het jaar). De regels verschillen voor kortlopende contracten en lopen licht uiteen tussen de Gewesten."
  },
  {
    "id": "garantie",
    "keywords": [
      "waarborg",
      "huurwaarborg"
    ],
    "question": "Huurwaarborg",
    "answer": "De huurwaarborg is doorgaans beperkt tot 2 of 3 maanden huur, afhankelijk van de gekozen formule (geïndividualiseerde rekening, bankwaarborg, of via het OCMW). Ze moet op een geblokkeerde rekening op naam van de huurder staan en kan enkel worden vrijgegeven met akkoord van beide partijen of een rechterlijke beslissing."
  },
  {
    "id": "edl",
    "keywords": [
      "plaatsbeschrijving"
    ],
    "question": "Plaatsbeschrijving",
    "answer": "De plaatsbeschrijving bij intrede is verplicht en moet tegensprekelijk gebeuren, idealiter snel na de sleuteloverdracht, ruimte per ruimte en met gedateerde foto's. Dit document beschermt de verhuurder bij vastgestelde schade bij vertrek: zonder geldige plaatsbeschrijving bij intrede wordt het pand geacht in goede staat te zijn ontvangen."
  },
  {
    "id": "loyer-impaye",
    "keywords": [
      "onbetaald",
      "achterstand",
      "huurder betaalt niet"
    ],
    "question": "Onbetaalde huur",
    "answer": "Bij een achterstand is de gebruikelijke volgorde: minnelijke herinnering, schriftelijke ingebrekestelling met ontvangstbewijs, en bij uitblijven van een oplossing, dagvaarding voor de vrederechter voor ontbinding van de huurovereenkomst en invordering. Belgische gerechtelijke termijnen kunnen meerdere maanden duren, wat snel doorweegt op de kasstroom van een alleenstaande verhuurder."
  },
  {
    "id": "rentmeester",
    "keywords": [
      "syndicus",
      "mede-eigendom",
      "algemene vergadering"
    ],
    "question": "Verschil tussen syndicus en verhuurbeheer",
    "answer": "De syndicus beheert de gemeenschappelijke delen van een gebouw in mede-eigendom (gemeenschappelijke kosten, algemene vergaderingen, collectieve werken). Verhuurbeheer betreft de relatie tussen u en uw huurder voor uw privatief kavel: huurovereenkomst, huur, plaatsbeschrijving, schadegevallen. Dit zijn twee afzonderlijke beroepen, soms uitgeoefend door verschillende ondernemingen."
  },
  {
    "id": "meerdere-panden",
    "keywords": [
      "meerdere panden",
      "portefeuille",
      "meerdere appartementen"
    ],
    "question": "Beheer van meerdere panden",
    "answer": "Eén verhuurd pand alleen beheren is haalbaar. 5, 10 of 30 panden tegelijk beheren, met huurcontracten op verschillende data, indexeringen om op te volgen, plaatsbeschrijvingen om te plannen en schadegevallen om te behandelen, wordt al snel een deeltijdse job, of meer."
  },
  {
    "id": "waardevermeerdering",
    "keywords": [
      "werken",
      "renovatie",
      "verbouwing",
      "waardevermeerdering",
      "onderhoud"
    ],
    "question": "Moet ik werken laten uitvoeren aan mijn verhuurd pand?",
    "answer": "Niet altijd, en net daar zit de kunst van het rekenwerk: een investering is enkel zinvol als ze zich zowel in de huur als in de waarde van het pand terugbetaalt. 50.000 € aan werken die de huur maar met 100 €/maand verhogen en de waarde maar met 35.000 €, is vaak minder rendabel dan verkopen in de huidige staat. Omgekeerd kan een gerichte renovatie (keuken, badkamer, energieprestatie) veel meer waarde opleveren dan ze kost."
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
