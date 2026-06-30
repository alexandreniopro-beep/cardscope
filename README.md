# CardScope

Scanne. Estime. Collectionne. Décide.

Ce projet assemble en une base Next.js cohérente l'ensemble des blocs de code
fournis. Comme plusieurs fichiers existaient en 2-3 versions successives
(prototype local → cloud → API), j'ai gardé **la version la plus aboutie de
chaque fichier** et recâblé les pages pour qu'elles soient cohérentes entre
elles. Détail des choix ci-dessous.

## Installation

```bash
npm install
cp .env.local.example .env.local
# renseigne NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Sans Supabase configuré, l'app fonctionne quand même : `lib/collectionCloud.ts`
et `lib/getCollectionCloud.ts` retombent automatiquement sur `localStorage`
(mode démo hors-ligne).

## Configurer Supabase (optionnel mais recommandé)

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Exécute `supabase/schema.sql` dans l'éditeur SQL du projet.
3. Active "Email OTP" dans Authentication → Providers.
4. Copie l'URL et la clé anon dans `.env.local`.

## Structure

```
app/
  page.tsx                 accueil
  scan/page.tsx             caméra → /api/scan → sauvegarde collection
  collection/page.tsx       liste de la collection (cloud ou locale)
  card/[id]/page.tsx        détail + graphique de prix
  dashboard/page.tsx        portfolio, top cartes, opportunités
  strategy/page.tsx         recommandations IA par carte
  vide-grenier/page.tsx     scan → décision BUY/PASS/WATCH
  multi-scan/page.tsx       scan d'un lot → verdict global
  login/page.tsx            connexion Supabase (magic link)
  api/scan/route.ts         reconnaissance carte + prix (serveur)
  api/price/route.ts        prix de marché seul (serveur)
components/
  CameraScanner.tsx          accès caméra + capture
  PriceChart.tsx              graphique recharts
lib/
  scanner.ts                  IA mock (reconnaissance) + prix réel — SERVEUR UNIQUEMENT
  pricing/realPrice.ts        scraping eBay + cache 6h — SERVEUR UNIQUEMENT
  scraper/ebay.ts              parsing HTML eBay (cheerio) — SERVEUR UNIQUEMENT
  mockMarket.ts                historique de prix simulé (pour les graphiques)
  storage.ts                   fallback localStorage
  collectionCloud.ts           écriture Supabase (+ fallback local)
  getCollectionCloud.ts        lecture Supabase (+ fallback local)
  garageSaleEngine.ts          décision BUY/PASS/WATCH
  batchScanner.ts               verdict sur un lot de cartes
  strategy/engine.ts            moteur de recommandation HOLD/SELL/GRADE/BUY_MORE
  portfolio.ts, topCards.ts, opportunities.ts   calculs du dashboard
```

## Décisions de fusion (versions multiples → version finale)

- **`lib/scanner.ts`** existait en 3 versions (mock pur → mock + marché
  simulé → mock + scraping réel). J'ai gardé la dernière, et je l'ai rendue
  strictement serveur (elle est appelée depuis `app/api/scan/route.ts`, plus
  jamais importée directement par un composant `"use client"` — le scraping
  eBay ne peut de toute façon pas tourner dans le navigateur).
- **`lib/realMarket.ts` / `realMarketEngine.ts` / `marketProviders.ts`**
  (bloc "marché réel" v1, à données simulées en dur) ont été **supprimés** :
  ils étaient redondants avec `lib/pricing/realPrice.ts`, qui fait le même
  travail mais avec un vrai scraping + cache. Si tu veux brancher une vraie
  API (TCGPlayer, Cardmarket) plus tard, c'est `realPrice.ts` qu'il faut
  étendre.
- **`app/collection/page.tsx`** : gardé la version "cloud", avec fallback
  local automatique si personne n'est connecté.
- **`app/vide-grenier/page.tsx` et `multi-scan/page.tsx`** : à l'origine ces
  pages importaient `analyzeCard` (et donc le scraping) directement dans un
  composant client. Recâblées pour appeler `/api/scan` à la place — sinon le
  build casse (cheerio + fetch vers ebay.com ne fonctionnent pas côté
  navigateur, et il y aurait un blocage CORS).
- **`lib/garageSaleEngine.ts` / `batchScanner.ts`** : transformés en
  fonctions pures (`evaluateGarageDeal`, `evaluateBatch`) qui prennent un
  résultat déjà analysé, plutôt que de relancer une analyse en interne — la
  page fait l'appel réseau, ces fonctions ne font que la décision.
- **`app/strategy/page.tsx`** : le fichier original s'arrêtait en plein
  milieu (`rarity: c.rarity || "Rare",`). Complété avec l'affichage de
  l'action recommandée, le raisonnement, la confiance et l'objectif de prix
  à 6 mois, en m'appuyant sur `lib/strategy/engine.ts` tel quel.
- **`lib/opportunities.ts`** comparait `c.price` à `c.marketPrice`, un champ
  qui n'existe nulle part dans le schéma de la table `collections`. Rendu
  asynchrone : il interroge maintenant `/api/price` pour chaque carte et
  compare au prix stocké.
- Quelques fautes de frappe d'extension corrigées : `.t` → `.ts`,
  `PriceChart.ts` → `.tsx` (le fichier contient du JSX).

## ⚠️ À savoir avant d'aller plus loin

- **Reconnaissance d'image** : `lib/scanner.ts` retourne toujours
  "Dracaufeu ex" en dur — c'est un mock. Pour une vraie reconnaissance, il
  faudra entraîner/brancher un modèle (TensorFlow.js côté client, ou un
  service de vision côté serveur) et remplacer cette fonction.
- **Scraping eBay** : `lib/scraper/ebay.ts` parse le HTML public d'eBay.
  C'est fragile (la structure de page peut changer à tout moment) et peut
  contrevenir aux conditions d'utilisation d'eBay selon l'usage que tu en
  fais. Pour un produit en production, mieux vaut une API officielle
  (eBay Browse/Marketplace Insights API, TCGPlayer API, Cardmarket API).
- **RLS Supabase** : les policies dans `supabase/schema.sql` limitent
  chaque utilisateur à ses propres cartes. Pense à les vérifier si tu changes
  le schéma.

## Lancer le projet

```bash
npm install
npm run dev
# puis ouvre http://localhost:3000 sur un appareil avec caméra
```

La caméra nécessite HTTPS ou `localhost` pour fonctionner dans le
navigateur (contrainte standard des navigateurs, pas de CardScope).
