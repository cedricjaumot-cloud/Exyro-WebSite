# Site vitrine EXYRO — version légère

Site statique (HTML/CSS/JS pur, zéro dépendance, zéro build) conforme au
BrandBook EXYRO 2026 : couleurs Ardoise Nuit / Signal Blue / Acier, typo
Montserrat pour les titres.

## Contenu

- `index.html` — page unique (hero, chiffres clés, services, assistant IA, contact)
- `assistant.js` — widget de chat, démo locale (aucune clé API, fonctionne partout)
- `assets/` — logos SVG et favicon repris de tes fichiers de marque
- `api/chat.js` — fonction serverless Vercel pour brancher une vraie IA générative (Claude) plus tard
- `worker/chat-worker.js` — alternative Cloudflare Worker si le site reste sur GitHub Pages

## Pourquoi cette architecture

Ton site actuel (exyro.be) est en Next.js — normal pour le portail propriétaires/locataires
prévu dans ton plan Exyro+Nexyo (deck "Projet Web"). Mais pour une **vitrine seule**,
HTML/CSS/JS statique :
- charge en quelques dizaines de ms (pas de framework JS à télécharger)
- s'héberge gratuitement sur GitHub Pages, sans serveur à maintenir
- reste 100% compatible avec la refonte Next.js prévue en Phase 1 de ton planning 17 semaines : tu pourras réutiliser ces mêmes tokens de couleur/typo dans `packages/design-tokens/`

L'assistant IA fonctionne dès maintenant en mode démo (réponses locales sur
indexation, préavis, garantie locative, état des lieux, impayés, multi-biens).
Pour une vraie IA générative capable de répondre à n'importe quelle question,
il faut un backend qui garde la clé API secrète — jamais dans le HTML/JS
servi au navigateur. Deux options prêtes à l'emploi sont fournies (`api/chat.js`
pour Vercel, `worker/chat-worker.js` pour Cloudflare) ; il suffit de :
1. déployer l'un des deux avec ta clé Anthropic en variable d'environnement
2. dans `assistant.js`, remplacer `askLocalKnowledge(userText)` par un
   `fetch()` vers cet endpoint

## Déployer sur GitHub Pages (sous ton compte)

Je n'ai pas accès à ton GitHub (aucun connecteur configuré côté Claude), donc
ces commandes sont à lancer toi-même :

```bash
# 1. Dans un nouveau dossier ou un repo existant
git init exyro-site-preview
cd exyro-site-preview
# copie index.html, assistant.js, assets/, api/, worker/, README.md ici

git add .
git commit -m "Vitrine EXYRO - version légère on-brand"

# 2. Créer le repo sur GitHub (remplace <compte> par cedricjaumot-cloud ou autre)
gh repo create <compte>/exyro-site-preview --public --source=. --push
# ou manuellement : créer le repo sur github.com puis
git remote add origin https://github.com/<compte>/exyro-site-preview.git
git branch -M main
git push -u origin main

# 3. Activer GitHub Pages
# Sur github.com : Settings > Pages > Source = "Deploy from branch" > main > /root
# Le site sera visible sur https://<compte>.github.io/exyro-site-preview/
```

Pour brancher un nom de domaine (ex. preview.exyro.be), ajoute un fichier
`CNAME` contenant le sous-domaine et configure un enregistrement CNAME chez
ton fournisseur DNS (Cloudflare, vu ton architecture prévue) vers
`<compte>.github.io`.

## Prochaine étape suggérée

Si tu valides cette direction visuelle, elle peut directement nourrir la
Phase 1 ("Vitrine exyro.be", S1-S4) de ton plan Next.js : mêmes couleurs,
même typo, mêmes sections, juste migrées en composants React/Tailwind pour
brancher ensuite le portail propriétaires/locataires (Phase 3).
