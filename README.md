# 🌍 CO₂-Rechner für Umweltmentoren

Ein moderner, interaktiver CO₂-Rechner für Schulen und Umweltmentoren, entwickelt mit **Next.js (App Router)**, **React 19**, **Prisma ORM**, **Tailwind CSS** und **Supabase** (PostgreSQL). 

Dieses Tool hilft Schülerinnen und Schülern dabei, ihren jährlichen CO₂-Fußabdruck in den vier Hauptkategorien **Mobilität**, **Ernährung**, **Energie** und **Konsum** spielerisch zu ermitteln, mit dem deutschen Durchschnitt zu vergleichen und konkrete Klimaschutz-Versprechen abzugeben.

---

## ⚡ Hauptmerkmale

### 🧑‍🎓 Schüler-Bereich (Quiz & Urkunde)
- **Anonymer Login:** Einfacher Einstieg über einen anonymen, 8-stelligen Zugangscode (`XXXX-XXXX`). Keine E-Mail-Adresse oder persönliche Daten erforderlich.
- **Flexible Quiz-Modi:** Drei anpassbare Längen (Kurz: 10 Fragen, Mittel: 30 Fragen, Lang: 60 Fragen).
- **Interaktive Beantwortung:** Unterstützung verschiedener Fragetypen (Slider, Auswahllisten, Radio-Buttons, Zahleneingaben) mit Echtzeit-Feedback, Einheiten (km, kg, kWh) und hilfreichen Infotexten.
- **Echtzeit-Berechnung:** Jede Antwort berechnet direkt den CO₂-Ausstoß auf Basis hinterlegter Emissionsfaktoren.
- **Persönliche Auswertung:** Grafische Darstellung des Fußabdrucks nach Kategorien sowie ein direkter Vergleich mit dem Bundesdurchschnitt (ca. 10,5 Tonnen/Jahr).
- **Klima-Versprechen & Urkunde:** Schüler:innen können konkrete, alltagsnahe Versprechen abgeben und eine personalisierte Urkunde (PDF-Druckansicht) erstellen.

### 👩‍🏫 Lehrer- & Schul-Dashboard
- **Klassenverwaltung:** Erstellen neuer Klassen und Festlegen des Quiz-Modus.
- **Code-Generierung:** Automatisches Erstellen von anonymen Zugangscodes für ganze Klassen.
- **Visuelle Klassenanalyse:** Detaillierte Statistiken und Recharts-Diagramme über die Durchschnittswerte der Klassen.
- **Gamification & Abzeichen (Badges):** Freischalten von Klassen-Badges basierend auf den Antworten der Schüler:innen (z. B. *Veggie-Helden*, *Pedal-Pioniere*, *Ökostrom-Vorreiter*).

### 👑 Super-Admin-Dashboard
- **Lizenzverwaltung:** Generieren und Verwalten von Schullizenzen.
- **Aktivitätskontrolle:** Aktivieren/Deaktivieren von Lizenzen und Übersicht über die Gesamtzahlen teilnehmender Schulen.

---

## 🏆 Klassen-Abzeichen (Gamification)

Um den Teamgeist zu stärken und Klimaschutz spielerisch zu vermitteln, kann jede Klasse folgende Abzeichen freischalten:

| Abzeichen | Name | Voraussetzung |
| :---: | :--- | :--- |
| 🥬 | **Veggie-Helden** | Mindestens 50% der Klasse ernähren sich vegetarisch oder vegan. |
| 🚲 | **Pedal-Pioniere** | Mindestens 50% nutzen das Fahrrad, gehen zu Fuß oder nutzen E-Scooter für den Schulweg. |
| ⚡ | **Ökostrom-Vorreiter** | Mindestens 50% beziehen zu Hause 100% Ökostrom. |
| 👕 | **Second-Hand-Saver** | Mindestens 50% kaufen Kleidung bevorzugt Second-Hand. |
| ✈️ | **Bodenständige Klasse**| Mindestens 60% sind im letzten Jahr nicht geflogen. |
| 🌱 | **CO₂-Sparer** | Der Klassendurchschnitt liegt unter 8,4t CO₂/Jahr (20% unter DE-Schnitt). |
| 🌟 | **Klima-Champions** | Hervorragender Klassendurchschnitt von unter 6,0t CO₂/Jahr. |

---

## 🛠️ Technologie-Stack

- **Frontend & Backend:** [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS (mit modernen UI-Effekten wie Glassmorphismus, Partikelfeldern, sanften Übergängen und Dark/Light-Mode)
- **Datenbank:** [Supabase](https://supabase.com/) (gehostete PostgreSQL-Datenbank)
- **Datenbank-Zugriff:** [Prisma ORM](https://www.prisma.io/) (mit Custom Output Path in `src/generated/prisma`)
- **Visualisierungen:** Recharts (responsive Diagramme)

---

## 📂 Projektstruktur

```text
├── prisma/
│   ├── schema.prisma      # Datenbank-Schema (Supabase PostgreSQL)
│   └── seed.ts            # Datenbank-Seeding (SuperAdmin & 60 Quiz-Fragen)
├── src/
│   ├── app/               # Next.js App Router (Pages, API-Routen & Layouts)
│   │   ├── admin/         # Super-Admin Dashboard
│   │   ├── api/           # Backend-Endpoints (Auth, Schule, Quiz, Stats)
│   │   ├── login/         # Authentifizierungs-Schnittstellen
│   │   ├── quiz/          # Quiz-Schnittstelle für Schüler:innen
│   │   ├── results/       # Testergebnisse & Urkunden-Generator
│   │   └── school/        # Dashboard für Lehrer:innen & Klassenanalysen
│   ├── components/        # Wiederverwendbare UI-Komponenten (ParticleField, TiltCard, etc.)
│   ├── generated/         # Generierter Prisma-Client
│   └── lib/               # Utility-Funktionen, Authentifizierung & Badge-Logik
└── package.json           # npm-Skripte & Projektabhängigkeiten
```

---

## ⚙️ Umgebungsvariablen

Erstelle im Projekt-Hauptverzeichnis eine Datei namens `.env` (siehe `.env.example` als Vorlage):

```env
# Supabase PostgreSQL – Pooled Connection (für die App)
DATABASE_URL="postgresql://postgres.[PROJEKT-REF]:[PASSWORT]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase PostgreSQL – Direct Connection (für Prisma Migrationen)
DIRECT_URL="postgresql://postgres.[PROJEKT-REF]:[PASSWORT]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Geheimer Schlüssel für JWT-Authentifizierung (für Sessions)
JWT_SECRET="dein-super-sicheres-geheimnis"

# Initialer Super-Admin Account
ADMIN_EMAIL="admin@co2rechner.de"
ADMIN_PASSWORD="changeme123"
```

Die Supabase-Verbindungs-URLs findest du in deinem Supabase-Dashboard unter:  
**Project Settings → Database → Connection String → URI**

---

## 🚀 Erste Schritte

### 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com/) und erstelle ein kostenloses Konto.
2. Erstelle ein neues Projekt und wähle eine Region (z. B. `eu-central-1` für Frankfurt).
3. Notiere dir das Datenbank-Passwort.
4. Gehe zu **Project Settings → Database → Connection String** und kopiere die URIs.
5. Trage die Werte in deine `.env`-Datei ein.

### 2. Repository klonen & Abhängigkeiten installieren
```bash
npm install
```

### 3. Datenbank konfigurieren

Prisma Client generieren und Schema in die Supabase-Datenbank übertragen:

```bash
# Prisma Client generieren
npx prisma generate

# Schema in die Supabase-Datenbank übertragen
npm run db:push

# Standarddaten seeden (Super-Admin & Fragenkatalog)
npm run db:seed
```

### 4. Entwicklungsserver starten
```bash
npm run dev
```
Öffne nun [http://localhost:3000](http://localhost:3000) im Browser.

---

## ☁️ Deployment (z. B. Vercel)

### Vercel

1. Verbinde dein GitHub-Repository mit [Vercel](https://vercel.com/).
2. Füge die Umgebungsvariablen (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) in den Vercel-Projekteinstellungen hinzu.
3. Vercel erkennt Next.js automatisch und deployt die App.

### Andere Plattformen

Die App kann auf jeder Plattform deployt werden, die Node.js unterstützt (Netlify, Railway, etc.):

```bash
npm run build
npm run start
```

---

## 📝 Wichtige npm-Skripte

- `npm run dev` – Startet den Next.js-Entwicklungsserver.
- `npm run build` – Erstellt den optimierten Produktions-Build.
- `npm run start` – Startet den Next.js-Produktionsserver.
- `npm run lint` – Führt die ESLint-Prüfungen aus.
- `npm run db:push` – Synchronisiert das Datenbankschema mit Supabase.
- `npm run db:seed` – Befüllt die Datenbank mit den Standard-Klimaschutzfragen und dem Super-Admin-Account.
- `npm run db:studio` – Öffnet die grafische Prisma-Studio-Oberfläche zur Datenverwaltung.
