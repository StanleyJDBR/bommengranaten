# ☠️ Bommen & Granaten — SvelteKit Scorebord

Een PWA scorebord voor het dobbelspel **Bommen & Granaten**, gebouwd met SvelteKit + Drizzle ORM + Turso.

## Stack

| Onderdeel  | Technologie                |
|------------|---------------------------|
| Frontend   | SvelteKit + TypeScript     |
| Styling    | Tailwind CSS               |
| Database   | Turso (SQLite, gratis)     |
| ORM        | Drizzle ORM                |
| Hosting    | Vercel (gratis)            |

---

## Aan de slag

### 1. Installeer dependencies

```bash
npm install
```

### 2. Maak een Turso database aan

[Maak een gratis Turso account](https://turso.tech) en installeer de CLI:

```bash
# Turso CLI installeren
curl -sSfL https://get.tur.so/install.sh | bash

# Inloggen
turso auth login

# Database aanmaken
turso db create bommen-granaten

# Je database URL ophalen
turso db show bommen-granaten --url

# Auth token aanmaken
turso db tokens create bommen-granaten
```

### 3. Stel omgevingsvariabelen in

Kopieer `.env.example` naar `.env` en vul je Turso-gegevens in:

```bash
cp .env.example .env
```

```env
DATABASE_URL=libsql://bommen-granaten-jouw-naam.turso.io
DATABASE_AUTH_TOKEN=jouw-token
```

### 4. Migreer de database

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start de ontwikkelserver

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployen op Vercel

### 1. Zet de code op GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/jouw-naam/bommen-granaten.git
git push -u origin main
```

### 2. Importeer in Vercel

1. Ga naar [vercel.com](https://vercel.com) en log in met GitHub
2. Klik **Add New → Project**
3. Selecteer je repository
4. Vercel herkent SvelteKit automatisch

### 3. Voeg omgevingsvariabelen toe in Vercel

Ga naar **Settings → Environment Variables** en voeg toe:
- `DATABASE_URL` → jouw Turso URL
- `DATABASE_AUTH_TOKEN` → jouw Turso token

### 4. Deploy!

Vercel deployt automatisch bij elke push naar `main`. Je app is live op `https://jouw-project.vercel.app`.

---

## Projectstructuur

```
src/
├── lib/
│   ├── components/
│   │   ├── Scoreboard.svelte     ← Ranglijst met voortgangsbalken
│   │   ├── TurnPanel.svelte      ← Beurt invoer + kaart selectie
│   │   └── CardSelector.svelte   ← Piratenkaarten grid
│   ├── stores/
│   │   └── game.ts               ← Centrale spelstate (Svelte stores)
│   └── db/
│       ├── schema.ts             ← Drizzle database schema
│       └── index.ts              ← Database verbinding
└── routes/
    ├── +page.svelte              ← Spel (setup / speelbord / eindscherm)
    ├── +layout.svelte            ← App shell
    ├── stats/
    │   └── +page.svelte          ← Statistieken pagina
    └── api/
        ├── games/+server.ts      ← POST /api/games
        └── stats/+server.ts      ← GET /api/stats
```

---

## Uitbreidingsideeën

- [ ] Spelerprofielen met avatar upload
- [ ] Dobbelstenen animaties
- [ ] Realtime multiplayer via SvelteKit WebSockets
- [ ] Push notificaties (PWA)
- [ ] Grafiek van scores per ronde
