'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Copy,
  Clock,
  Mic,
  Grid,
  Layers,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Tv,
  ArrowRight,
  Eye,
  FileText,
  Volume2,
} from 'lucide-react';

export interface TvCueCard {
  id: number;
  slideNumber: number;
  slideTitle: string;
  timeSlot: string;
  duration: string;
  title: string;
  speakers: ('paul' | 'jona')[];
  category: 'slide' | 'defense' | 'tech';
  
  // Moderatorseite (Was der Sprecher auf der Karte liest)
  moderator: {
    segmentBadge: string;
    beamerTrigger: string;
    regieInstruction: string;
    speechLines: {
      speaker: 'paul' | 'jona';
      speakerName: string;
      quote: string;
      highlights: string[];
      stageAction?: string;
    }[];
    bulletPoints: {
      label: string;
      text: string;
      highlight?: boolean;
    }[];
    partnerCue: string;
  };

  // Kamerarückseite (Was das Publikum und die Kameras sehen, wenn die Karte vor der Brust gehalten wird)
  cameraBack: {
    showTitle: string;
    subTitle: string;
    venue: string;
    date: string;
    hosts: string;
    tagline: string;
    badgeText: string;
  };
}

export const TV_CUE_CARDS: TvCueCard[] = [
  {
    id: 1,
    slideNumber: 1,
    slideTitle: 'FOLIE 1: TITEL & TEAM',
    timeSlot: '00:00 – 02:00',
    duration: '2 Min',
    title: 'Begrüßung & Der Einstieg',
    speakers: ['paul', 'jona'],
    category: 'slide',
    moderator: {
      segmentBadge: 'SEGMENT 01 · OPENING & MISSION',
      beamerTrigger: '⌨️ [BEAMER: LEERTASTE ➔ FOLIE 2]',
      regieInstruction: 'Feste Stimme, offenes Lächeln, direkter Blickkontakt zu Staatssekretär Andreas Deuschle & Plenum!',
      speechLines: [
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Sehr geehrter Herr Staatssekretär Deuschle, liebe Vertreterinnen und Vertreter des Ministeriums und der Jugendstiftung, liebe Mentorinnen und Mentoren, liebe Lehrkräfte!“',
          highlights: ['Sehr geehrter Herr Staatssekretär Deuschle', 'liebe Lehrkräfte'],
          stageAction: 'Aufrechte Haltung, offene Hände, freundlicher Blick ins Plenum.',
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Wir freuen uns riesig, heute hier im Innenministerium zu stehen. Mein Name ist Paul Kaiser...“',
          highlights: ['Mein Name ist Paul Kaiser'],
        },
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„... und mein Name ist Jona Noack. Wir beide sind Schüler und Umweltmentoren des Kurses 2025/2026. Als wir gestartet sind, hatten wir ein klares Ziel: Kein Projekt für die Schublade – sondern ein echtes Werkzeug für ganz Baden-Württemberg im Unterricht!“',
          highlights: ['Jona Noack', 'Kein Projekt für die Schublade', 'ganz Baden-Württemberg'],
          stageAction: 'Tritt einen Schritt vor, spricht engagiert und selbstbewusst.',
        },
      ],
      bulletPoints: [
        {
          label: 'Herzliche Begrüßung',
          text: 'Förmliche Würdigung von Staatssekretär Deuschle, Ministerium & Jugendstiftung.',
        },
        {
          label: 'Der Mentorinnen-Auftrag',
          text: 'Entwickelt von Schülern für Schüler im Rahmen der Ausbildung 2025/26.',
        },
        {
          label: 'Dauerhafter Nutzen',
          text: 'Keine Eintagsfliege: Digitale Plattform für den echten Schulbetrieb in BW.',
          highlight: true,
        },
      ],
      partnerCue: '👉 JONA leitet über zur Problemstellung ➔ Paul drückt Beamer-Taste.',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'JUGEND-KLIMABILANZ & UNTERRICHT',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: 'KLIMASCHUTZ GREIFBAR MACHEN',
      badgeText: 'LIVE-VORTRAG 13:15 UHR',
    },
  },
  {
    id: 2,
    slideNumber: 2,
    slideTitle: 'FOLIE 2: DAS PROBLEM',
    timeSlot: '02:00 – 04:30',
    duration: '2,5 Min',
    title: 'Das Dilemma bisheriger Rechner im Unterricht',
    speakers: ['jona', 'paul'],
    category: 'slide',
    moderator: {
      segmentBadge: 'SEGMENT 02 · DAS PROBLEM & DIE LÖSUNG',
      beamerTrigger: '⌨️ [BEAMER: LEERTASTE ➔ FOLIE 3 (QR-CODE)]',
      regieInstruction: 'Authentische Schüler-Perspektive einnehmen. Bei „Heizöl“ schmunzeln – Lehrkräfte nicken garantiert!',
      speechLines: [
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Lehrkraft sagt: ‚Heute berechnen wir alle unseren Fußabdruck!‘ – und nach genau drei Minuten bricht das Chaos aus!“',
          highlights: ['Heute berechnen wir alle unseren Fußabdruck', 'nach drei Minuten bricht das Chaos aus'],
          stageAction: 'Schritt nach vorn, lebendige Schilderung einer typischen Unterrichtsstunde.',
        },
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„1. Für Erwachsene gebaut: Wer kennt als 14-Jähriger die Heizöl-Liter oder Kilowattstunden der Eltern?\n2. Datenschutz: Accounts, Passwörter, Tracking – an Schulen in BW ein absolutes No-Go!\n3. Kein Klassenverbund: Jeder sitzt isoliert vor 8,4 Tonnen, ohne gemeinsame Auswertung.“',
          highlights: ['Für Erwachsene gebaut', 'Datenschutz', 'absolutes No-Go', 'Kein Klassenverbund'],
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Deshalb haben wir gesagt: Das muss doch besser gehen! Alltagsnah, 100% datenschutzkonform und perfekt für eine normale 45-Minuten-Stunde! Wir zeigen Ihnen keine Tabellen – wir probieren das jetzt alle gemeinsam live aus!“',
          highlights: ['Das muss doch besser gehen', '100% datenschutzkonform', '45-Minuten-Stunde', 'live ausprobieren'],
          stageAction: 'Übernimmt dynamisch, hebt das eigene Smartphone in die Hand.',
        },
      ],
      bulletPoints: [
        {
          label: 'Hürde 1: Überforderung',
          text: 'Erwachsenen-Rechner fragen nach Nebenkostenabrechnungen – Schüler wissen das nicht.',
        },
        {
          label: 'Hürde 2: DSGVO-Sperre',
          text: 'Login-Zwang, E-Mails & Tracking verhindern den legalen Schuleinsatz in BW.',
          highlight: true,
        },
        {
          label: 'Hürde 3: Isolierte Daten',
          text: 'Keine Klassen-Aggregation für Lehrkräfte am Beamer.',
        },
      ],
      partnerCue: '👉 PAUL zückt das Smartphone ➔ Beamer schaltet auf Folie 3 (Riesen-QR-Code).',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'WARUM BISHERIGE RECHNER SCHEITERN',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: 'VOM PROBLEM ZUR LÖSUNG',
      badgeText: 'PROBLEM & DIDAKTIK',
    },
  },
  {
    id: 3,
    slideNumber: 3,
    slideTitle: 'FOLIE 3: QR-CODE & SAALTEST',
    timeSlot: '04:30 – 08:30',
    duration: '4 Min',
    title: 'Die Live-Mitmachrunde im Saal 🔥',
    speakers: ['paul', 'jona'],
    category: 'slide',
    moderator: {
      segmentBadge: 'SEGMENT 03 · INTERAKTIVER SAAL-TEST',
      beamerTrigger: '⌨️ [BEAMER: LEERTASTE ➔ FOLIE 4]',
      regieInstruction: 'Smartphone hochhalten! 60–90 Sekunden Stille bewusst aushalten – der ganze Saal scannt und tippt!',
      speechLines: [
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Wir bitten jetzt alle im Saal – von den Mentorinnen über die Lehrkräfte bis zu Herrn Staatssekretär Deuschle: Bitte nehmen Sie Ihr Smartphone zur Hand und öffnen Sie die Kamera!“',
          highlights: ['Smartphone zur Hand', 'öffnen Sie die Kamera', 'Staatssekretär Deuschle'],
          stageAction: 'Hält eigenes Smartphone hoch, zeigt auf den Riesen-QR-Code auf der Leinwand.',
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Scannen Sie den QR-Code hier auf der Leinwand. Keine App, kein Passwort! Tippen Sie einfach auf ‚Als Gast testen‘.“',
          highlights: ['Keine App, kein Passwort', 'Als Gast testen'],
        },
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Sie sehen jetzt unseren 10-Fragen-Quick-Check. Keine Fragen nach Heizöl, sondern nach Ihrem Alltag: Anreise, Ernährung, Streaming. In unter zwei Minuten haben Sie Ihr Jahresergebnis in Kilo CO₂ und Ihre Urkunde!“',
          highlights: ['10-Fragen-Quick-Check', 'unter zwei Minuten', 'Urkunde'],
          stageAction: 'Kommentiert locker und beruhigend, während im Saal getippt wird.',
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Wer hat sein Ergebnis schon auf dem Display? Einmal kurz die Hand heben! ... Fantastisch, fast der halbe Saal! Sie sehen direkt: Bäume zur Bindung und Autokilometer-Vergleiche.“',
          highlights: ['kurz die Hand heben', 'Fast der halbe Saal', 'Bäume zur Bindung'],
          stageAction: 'Blickt lächelnd durch die Reihen, zählt Handzeichen, nickt anerkennend.',
        },
      ],
      bulletPoints: [
        {
          label: 'Publikums-Aktivierung',
          text: 'Alle 150 Teilnehmer scannen gleichzeitig den Beamer – sofortige Aha-Erlebnisse.',
        },
        {
          label: 'Barrierefreiheit',
          text: 'Webbasiert ohne Download, sofort einsatzbereit auf iOS und Android.',
          highlight: true,
        },
        {
          label: 'Echte Vergleiche',
          text: 'CO₂-Werte werden greifbar in Bäume, Bus- und Flugkilometer übersetzt.',
        },
      ],
      partnerCue: '👉 PAUL fragt nach Handzeichen ➔ leitet über zu Umweltbundesamt-Zahlen.',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'LIVE-MITMACHRUNDE IM SAAL',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: '100% SMARTPHONE-INTERAKTION',
      badgeText: 'LIVE-EXPERIMENT 🔥',
    },
  },
  {
    id: 4,
    slideNumber: 4,
    slideTitle: 'FOLIE 4: DIDAKTIK & 3 MODI',
    timeSlot: '08:30 – 11:00',
    duration: '2,5 Min',
    title: 'Wissenschaft, 4,4 t UBA-Pauschale & 3 Spielmodi ⭐',
    speakers: ['paul', 'jona'],
    category: 'slide',
    moderator: {
      segmentBadge: 'SEGMENT 04 · WISSENSCHAFT & MODI',
      beamerTrigger: '⌨️ [BEAMER: LEERTASTE ➔ FOLIE 5]',
      regieInstruction: 'Wissenschaftliche Seriosität betonen. Die 1.200 kg öffentliche Infrastruktur direkt an Deuschle adressieren!',
      speechLines: [
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Was Sie gerade erlebt haben, basiert auf fundierter Umweltforschung: Alle Umrechnungsfaktoren stammen aus validierten Datenbanken des Umweltbundesamts (UBA) und GEMIS.“',
          highlights: ['Umweltbundesamt (UBA)', 'GEMIS', 'fundierter Umweltforschung'],
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„⭐ DER DURCHBRUCH: Die 4,4-Tonnen-Basispauschale! Viele Rechner rechnen sich schön (1,5 t = Unsinn!). Bei uns trägt jeder 1.200 kg unvermeidbare öffentliche Infrastruktur – Straßen, Schulen, Krankenhäuser. Klimaschutz ist Bürger- UND Staatsaufgabe!“',
          highlights: ['4,4-Tonnen-Basispauschale', '1.200 kg öffentliche Infrastruktur', 'Bürger- UND Staatsaufgabe'],
          stageAction: 'Blickkontakt zu Andreas Deuschle, betont die gemeinsame Verantwortung.',
        },
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Weil jeder Schultag anders ist, haben wir 3 flexible Spielmodi gebaut:\n• 10 Fragen (Quick-Check, 2 Min): Für den schnellen Stundeneinstieg.\n• 30 Fragen (Standard, 8-10 Min): Für reguläre Geo- oder Biostunden.\n• 60 Fragen (Detail, 25 Min): Für Projekttage, Umwelt-AGs und Schulaudits.“',
          highlights: ['10 Fragen (Quick-Check)', '30 Fragen (Standard)', '60 Fragen (Detail)'],
          stageAction: 'Erläutert die didaktische Flexibilität für Lehrerinnen und Lehrer.',
        },
      ],
      bulletPoints: [
        {
          label: '⭐ 4.400 kg UBA-Pauschale',
          text: '1.200 kg Öffentliche Hand + 1.400 kg Konsum + 800 kg Wohnen + 600 kg Essen + 400 kg Mobilität.',
          highlight: true,
        },
        {
          label: 'Keine Schönrechnerei',
          text: 'Realistische Gesamtergebnisse zwischen 6 und 11 Tonnen CO₂ pro Kopf.',
        },
        {
          label: 'Pädagogische Stufen',
          text: 'Vom schnellen Einstieg bis zur vertieften Projektarbeit modular wählbar.',
        },
      ],
      partnerCue: '👉 JONA stellt die 3 Modi vor ➔ schaltet weiter zum Lehrer-Dashboard.',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'WISSENSCHAFT & DIDAKTIK',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: 'UBA-STANDARD & 3 SPIELMODI',
      badgeText: 'FORSCHUNG & DATEN ⭐',
    },
  },
  {
    id: 5,
    slideNumber: 5,
    slideTitle: 'FOLIE 5: DASHBOARD & DSGVO',
    timeSlot: '11:00 – 13:00',
    duration: '2 Min',
    title: 'Lehrer-Dashboard, 100% DSGVO & Handabdruck 🔒',
    speakers: ['jona', 'paul'],
    category: 'slide',
    moderator: {
      segmentBadge: 'SEGMENT 05 · DASHBOARD & DATENSCHUTZ',
      beamerTrigger: '⌨️ [BEAMER: LEERTASTE ➔ FOLIE 6]',
      regieInstruction: 'Wortlaut „100% DSGVO-konform ohne Schüler-Accounts“ ist Musik in den Ohren von Ministerium und Schulleitern!',
      speechLines: [
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Der eigentliche pädagogische Hebel entsteht durch unser Lehrkräfte-Dashboard: Die Lehrkraft generiert mit einem Klick einen anonymen Klassencode – zum Beispiel KL-8B-KLIMA. Schüler tippen ihn ein – und der Beamer zeigt live den Klassendurchschnitt!“',
          highlights: ['Lehrkräfte-Dashboard', 'anonymen Klassencode', 'Beamer zeigt live den Klassendurchschnitt'],
          stageAction: 'Zeigt auf das Dashboard-Visual auf der Beamerleinwand.',
        },
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Und jetzt das Entscheidende für Baden-Württemberg: Die App ist zu 100% DSGVO-konform! Keine Schüler-Accounts, keine E-Mails, keine Passwörter. Schülernamen für Urkunden existieren ausschließlich lokal im Browser-RAM – null Server-Speicherung!“',
          highlights: ['100% DSGVO-konform', 'Keine Schüler-Accounts', 'lokal im Browser-RAM', 'null Server-Speicherung'],
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Ganz wichtig: Keine Schuldgefühle erzeugen, sondern Handeln anstoßen! Unser Simulator fragt: ‚Was passiert bei 2 Tagen Veggie oder Radfahren?‘ Der Rechner zeigt: 350 kg CO₂ Ersparnis! Dieses Ziel wird auf die Urkunde gedruckt – so wird aus dem Fußabdruck ein Handabdruck!“',
          highlights: ['Keine Schuldgefühle erzeugen', 'Handeln anstoßen', 'Handabdruck', 'Urkunde'],
          stageAction: 'Zeigt motiviert auf das Versprechen & die Urkunde.',
        },
      ],
      bulletPoints: [
        {
          label: 'Live-Klassenstatistik',
          text: 'Balkendiagramme nach Sektoren zeigen auf einen Blick die Stärken und Hebel der Klasse.',
        },
        {
          label: '🔒 100% DSGVO-Sicherheit',
          text: 'Keine Speicherung von Schülernamen auf Datenbanken – vollständiger Schutz persönlicher Daten.',
          highlight: true,
        },
        {
          label: 'Handabdruck-Urkunde',
          text: 'Motivierender Ausdruck mit persönlichem Klimaversprechen für das Klassenzimmer.',
        },
      ],
      partnerCue: '👉 PAUL schließt den Handabdruck ab ➔ leitet über zum großen Finale.',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'LEHRER-DASHBOARD & 100% DSGVO',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: 'SICHER · ANONYM · WIRKSAM',
      badgeText: 'LEHRER-PORTAL 🔒',
    },
  },
  {
    id: 6,
    slideNumber: 6,
    slideTitle: 'FOLIE 6: FINALE & DEUSCHLE',
    timeSlot: '13:00 – 15:00',
    duration: '2 Min',
    title: 'Fazit, Einladung & Feierliche Übergabe an Deuschle 🏆',
    speakers: ['jona', 'paul'],
    category: 'slide',
    moderator: {
      segmentBadge: 'SEGMENT 06 · FINALE & WORTÜBERGABE',
      beamerTrigger: 'Beamer bleibt auf Abschlussfolie stehen (Präsentation beendet)',
      regieInstruction: 'Feierliches Finale: Aufrechte Haltung, synchron mit Jona und Paul verbeugen, Handgeste zu Andreas Deuschle, Applaus abwarten!',
      speechLines: [
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Unsere Botschaft heute ist ganz einfach: Klimaschutz an Schulen scheitert nicht am Willen der Jugendlichen und auch nicht am Engagement der Lehrkräfte. Er scheiterte bisher oft an komplizierten Werkzeugen. Mit unserem CO₂-Rechner steht ab heute ein kostenloses Tool für alle Schulen in Baden-Württemberg bereit!“',
          highlights: ['scheitert nicht am Willen', 'kostenloses Tool für alle Schulen in Baden-Württemberg'],
          stageAction: 'Blickkontakt durch das gesamte Auditorium, spricht klar und getragen.',
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Wenn Sie Lehrkraft oder Mentor sind: Besuchen Sie uns gleich an unserer Stellwand im Projekte-Markt – wir richten Ihnen gerne direkt einen Schulzugang ein! Wir danken der Jugendstiftung, dem Ministerium und unserem Mentorenkurs.“',
          highlights: ['Besuchen Sie uns an unserer Stellwand', 'Schulzugang einrichten', 'Vielen Dank'],
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Und nun freuen wir uns ganz besonders auf den Impuls und das Gespräch mit Herrn Staatssekretär Andreas Deuschle! Vielen Dank!“',
          highlights: ['Herrn Staatssekretär Andreas Deuschle', 'Vielen Dank!'],
          stageAction: 'Offene Handgeste zu Staatssekretär Andreas Deuschle. Beide lächeln, verbeugen sich synchron, warten auf den Applaus.',
        },
      ],
      bulletPoints: [
        {
          label: 'Schlüsselfertig für BW',
          text: 'Kostenloses Angebot an alle Schulen im Land zur sofortigen Nutzung.',
        },
        {
          label: 'Einladung Stellwand',
          text: 'Handouts, Verlaufspläne und direkte Lehrer-Accounts am Stand im Markt der Möglichkeiten.',
        },
        {
          label: '🏆 Punktlandung um 13:30',
          text: 'Exakte Einhaltung des Zeitplans für den nachfolgenden Programmpunkt mit Herrn Deuschle.',
          highlight: true,
        },
      ],
      partnerCue: '👉 SYNCHRONE VERBEUGUNG ➔ Handgeste zu Deuschle ➔ Applaus abwarten!',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'FEIERLICHE ABSCHLUSSPRÄSENTATION',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: 'GEMEINSAM CO₂ SENKEN AN JEDER SCHULE',
      badgeText: 'ÜBERGABE DEUSCHLE 🏆',
    },
  },
  {
    id: 7,
    slideNumber: 0,
    slideTitle: 'EXTRA: Q&A DEFENSE',
    timeSlot: 'Nach dem Vortrag',
    duration: 'Joker',
    title: 'Q&A Defense: Schlagfertige Antworten auf Publikumsfragen ❓',
    speakers: ['jona', 'paul'],
    category: 'defense',
    moderator: {
      segmentBadge: 'JOKER-KARTE · Q&A DEFENSE',
      beamerTrigger: 'Folie 5/6 als Standbild im Hintergrund',
      regieInstruction: 'Souverän, gelassen, faktenstark. Nie defensiv wirken – wir sind didaktisch und technisch perfekt vorbereitet!',
      speechLines: [
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Frage 1 (Datenschutz an Schulen): Zu 100% DSGVO-konform. Schüler geben weder Namen noch E-Mail an. Teilnahme über anonymen Einmal-Code. Urkundennamen werden ausschließlich lokal im Browser-RAM eingesetzt – null Server-Speicherung!“',
          highlights: ['100% DSGVO-konform', 'weder Namen noch E-Mail', 'anonymer Einmal-Code', 'null Server-Speicherung'],
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Frage 2 (Warum 7–9 Tonnen Gesamtergebnis?): Wissenschaftlicher UBA-Standard: Jeder Bürger hat 1.200 kg unvermeidbare öffentliche Infrastruktur (Straßen, Schulen, Krankenhäuser) + 3.200 kg Grundbedarf. Das verhindert Schönrechnerei!“',
          highlights: ['Wissenschaftlicher UBA-Standard', '1.200 kg unvermeidbare öffentliche Infrastruktur', 'verhindert Schönrechnerei'],
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER',
          quote:
            '„Frage 3 (Kosten für Schulen?): Exakt 0,00 Euro. Gemeinwohl- und Schülerprojekt von uns Umweltmentoren. Dauerhaft kostenlos, werbefrei und ohne Lizenzgebühren für Schulen in BW.“',
          highlights: ['Exakt 0,00 Euro', 'Dauerhaft kostenlos, werbefrei'],
        },
        {
          speaker: 'jona',
          speakerName: 'JONA NOACK',
          quote:
            '„Frage 4 (Bildungsplan BW?): Passt ideal in die Leitperspektive BNE (Bildung für nachhaltige Entwicklung), Geographie (Kl. 7-10), Biologie/BNT und Gemeinschaftskunde.“',
          highlights: ['Leitperspektive BNE', 'Geographie', 'Biologie', 'Gemeinschaftskunde'],
        },
      ],
      bulletPoints: [
        {
          label: 'DSGVO Argument',
          text: 'Vollständig konform mit dem Landesdatenschutzgesetz Baden-Württemberg.',
        },
        {
          label: 'UBA Argument',
          text: 'Wissenschaftliche Validierung beugt methodischer Kritik vor.',
        },
        {
          label: 'Kosten Argument',
          text: 'Freie Bildungsressource (OER) für alle staatlichen und freien Schulen.',
        },
      ],
      partnerCue: '👉 Je nach Frage antwortet Jona (Didaktik/DSGVO) oder Paul (UBA/Kosten).',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'Q&A DEFENSE & FRAGENKATALOG',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: 'FAKTENBASIERT · SICHER · SOUVERÄN',
      badgeText: 'Q&A JOKER ❓',
    },
  },
  {
    id: 8,
    slideNumber: 0,
    slideTitle: 'EXTRA: HOTKEYS & NOTFALL',
    timeSlot: 'Backstage / Notfall',
    duration: 'Technik',
    title: 'Laptop-Hotkeys & Saal-Notfallplan ⌨️',
    speakers: ['jona', 'paul'],
    category: 'tech',
    moderator: {
      segmentBadge: 'TECHNIK-KARTE · HOTKEYS & NOTFALL',
      beamerTrigger: 'F, LEERTASTE, ⬅️, ➡️, 1-6',
      regieInstruction: 'Laptop steht am Rednerpult im Blickfeld. Vor Beginn Taste F drücken (Browser-Vollbild)!',
      speechLines: [
        {
          speaker: 'paul',
          speakerName: 'PAUL & JONA',
          quote:
            '„Tasten-Steuerung:\n• F = Vollbildmodus aktivieren / beenden\n• LEERTASTE oder ➡️ = Nächste Folie\n• ⬅️ = Vorherige Folie\n• Tasten 1 bis 6 = Direkt zu Folie 1 bis 6 springen.“',
          highlights: ['F = Vollbildmodus', 'LEERTASTE = Nächste Folie', '1 bis 6 = Direkt springen'],
        },
        {
          speaker: 'paul',
          speakerName: 'PAUL KAISER (WLAN-NOTFALL)',
          quote:
            '„Notfallspruch bei schlechtem Handynetz im Saal: ‚Wer gerade kein Netz hat, schaut einfach bei der Nachbarin aufs Display oder probiert es nachher an unserer Stellwand aus!‘“',
          highlights: ['schaut einfach bei der Nachbarin aufs Display', 'nachher an unserer Stellwand'],
        },
      ],
      bulletPoints: [
        {
          label: 'Timing-Checkpoints',
          text: '02:00 Begrüßung ➔ 04:30 Problem ➔ 08:30 Saaltest ➔ 11:00 Didaktik ➔ 13:00 Dashboard ➔ 15:00 Punktlandung Deuschle!',
          highlight: true,
        },
        {
          label: 'Beamer-Hänger',
          text: 'Einfach die Zifferntaste der Folie drücken (z. B. Taste 3 für den QR-Code) – springt sofort dorthin.',
        },
      ],
      partnerCue: '👉 Laptop unauffällig bedienen ➔ keine Hektik aufkommen lassen.',
    },
    cameraBack: {
      showTitle: 'CO₂-RECHNER FÜR SCHULEN',
      subTitle: 'LAPTOP-HOTKEYS & NOTFALLPLAN',
      venue: 'Innenministerium Baden-Württemberg · Stuttgart',
      date: 'Freitag, 25. September 2026',
      hosts: 'Jona Noack & Paul Kaiser · Umweltmentoren',
      tagline: 'TECHNISCHE SICHERHEIT AM PULP',
      badgeText: 'HOTKEYS ⌨️',
    },
  },
];

export default function SpeechFlipcards() {
  // Flip states: true = camera back, false = moderator front
  const [flippedCards, setFlippedCards] = useState<{ [cardId: number]: boolean }>({});
  // View mode: 'hand' (deck in hand) or 'desk' (all cards on presenter desk)
  const [viewMode, setViewMode] = useState<'hand' | 'desk'>('hand');
  // Current card index in hand stack mode
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Speaker filter
  const [speakerFilter, setSpeakerFilter] = useState<'all' | 'paul' | 'jona' | 'defense'>('all');
  // Copied state
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  // Broadcast prompter stopwatch
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerStatusColor = (secs: number) => {
    if (secs < 12 * 60) return 'text-emerald-500';
    if (secs < 14 * 60) return 'text-amber-500';
    return 'text-destructive animate-pulse';
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  // Toggle single card flip
  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Flip all cards
  const flipAllCards = (toBack: boolean) => {
    const updated: { [cardId: number]: boolean } = {};
    TV_CUE_CARDS.forEach((card) => {
      updated[card.id] = toBack;
    });
    setFlippedCards(updated);
  };

  const areAllFlipped = TV_CUE_CARDS.every((c) => flippedCards[c.id]);

  // Filter cards
  const filteredCards = TV_CUE_CARDS.filter((card) => {
    if (speakerFilter === 'paul') return card.speakers.includes('paul');
    if (speakerFilter === 'jona') return card.speakers.includes('jona');
    if (speakerFilter === 'defense') return card.category === 'defense' || card.category === 'tech';
    return true;
  });

  // Ensure index is within range
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
  }, [filteredCards.length, currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (viewMode !== 'hand') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
      } else if (e.key === ' ' || e.key === 'Enter') {
        const current = filteredCards[currentIndex];
        if (current) {
          toggleFlip(current.id);
        }
      }
    },
    [viewMode, filteredCards, currentIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(text);
    setTimeout(() => setCopiedQuote(null), 2000);
  };

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  return (
    <div className="space-y-6">
      {/* ── BROADCAST HEADER TOOLBAR ── */}
      <div className="bg-card border-2 border-border rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                ON AIR · 13:15 UHR
              </span>
              <span className="paper-stamp text-[10px] font-mono uppercase bg-muted">
                Innenministerium Stuttgart · 25.09.2026
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Bühnenmoderation vor Staatssekretär Deuschle
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <Tv className="w-6 h-6 text-foreground" />
              <span>Fernseh-Moderationskarten: Jona & Paul</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Echte, kartonierte TV-Moderationskarten wie in Nachrichtensendungen und Talkshows.
              Mit <strong>Moderator-Vorderseite</strong> (extragroße Teleprompter-Schrift, Textmarker, Regie-Cues) und 
              der offiziellen <strong>Kamera-Rückseite</strong> (das elegante Umweltmentoren-Logo, das der Saal sieht, wenn du die Karte hältst).
            </p>
          </div>

          {/* Quick PDF & Presentation Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/presentation"
              target="_blank"
              className="paper-btn-primary !min-h-[40px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 font-bold shadow-sm"
            >
              <Presentation className="w-4 h-4" />
              <span>Beamer-Präsentation ↗</span>
            </Link>

            <a
              href="/materials/06_Moderationskarten_Buehnenkarten_DIN_A6.pdf"
              download="06_Moderationskarten_Buehnenkarten_DIN_A6.pdf"
              className="paper-btn-secondary !min-h-[40px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5 font-semibold"
              title="Druckbares DIN A6 Moderationskarten PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Karten PDF (A6)</span>
            </a>

            <a
              href="/materials/07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf"
              download="07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf"
              className="paper-btn-secondary !min-h-[40px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5 font-semibold"
              title="Wort-für-Wort-Sprechtext PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sprechtext (A4)</span>
            </a>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-border">
          {/* Speaker Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">Rollen:</span>
            <button
              type="button"
              onClick={() => setSpeakerFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                speakerFilter === 'all'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Alle 8 TV-Karten
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('paul')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                speakerFilter === 'paul'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white"></span>
              <span>Nur Paul</span>
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('jona')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                speakerFilter === 'jona'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              <span>Nur Jona</span>
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('defense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                speakerFilter === 'defense'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Q&A & Notfall</span>
            </button>
          </div>

          {/* View Mode & Studio Stopwatch */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Studio Stopwatch */}
            <div className="flex items-center gap-2 bg-zinc-950 text-white px-3 py-1.5 rounded-xl text-xs font-mono border border-zinc-800 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span className={`font-bold tracking-wider text-sm ${getTimerStatusColor(timerSeconds)}`}>
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[10px] text-zinc-500">/ 15:00</span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-200 transition-colors ml-0.5"
                title={isTimerRunning ? 'Stoppuhr anhalten' : 'Stoppuhr starten (15 Min Training)'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={handleTimerReset}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
                title="Stoppuhr zurücksetzen"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* View Switcher: In Hand vs Desk */}
            <div className="flex items-center bg-muted/80 border border-border p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('hand')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 font-bold ${
                  viewMode === 'hand'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="In der Hand (TV-Kartenstapel mit Weiter-Geste)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>In der Hand (Stapel)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('desk')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 font-bold ${
                  viewMode === 'desk'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Auf dem Pult (Alle 8 Karten nebeneinander)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Auf dem Pult (Alle 8)</span>
              </button>
            </div>

            {/* Flip All Button */}
            {viewMode === 'desk' && (
              <button
                type="button"
                onClick={() => flipAllCards(!areAllFlipped)}
                className="paper-btn-secondary !min-h-[34px] !text-xs !py-1 !px-2.5 flex items-center gap-1 font-semibold"
                title="Alle Karten wenden"
              >
                <RotateCw className="w-3 h-3" />
                <span>{areAllFlipped ? 'Alle zur Moderatorseite' : 'Alle zur Kameraseite'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODUS 1: IN DER HAND (AUTHENTISCHER TV-KARTENSTAPEL)
      ══════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'hand' && currentCard && (
        <div className="space-y-6">
          {/* Deck Action Controller */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card border-2 border-border rounded-2xl p-3.5 shadow-sm">
            {/* Card selector pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="font-mono text-xs text-muted-foreground font-bold mr-1">Karte:</span>
              {filteredCards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                    idx === currentIndex
                      ? 'bg-foreground text-background scale-105 shadow-sm'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={card.title}
                >
                  {card.id.toString().padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* Stack Gestures */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleFlip(currentCard.id)}
                className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 font-bold cursor-pointer"
                title="Karte umdrehen: Wechselt zwischen Moderatorseite (Text) und Kamerarückseite (Logo)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>
                  {flippedCards[currentCard.id]
                    ? '👉 Zur Moderatorseite'
                    : '📺 Zur Kamerarückseite'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1))
                }
                className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3 flex items-center gap-1 font-semibold"
                title="Vorherige Karte aus dem Stapel holen"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Zurück</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0))
                }
                className="paper-btn-primary !min-h-[38px] !text-xs !py-1.5 !px-4 flex items-center gap-1.5 font-black shadow-md cursor-pointer"
                title="TV-Geste: Karte nach hinten stecken und nächste Karte vorziehen"
              >
                <span>Nächste Karte</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Realistic TV Moderator Card Stack in Hand */}
          <div className="relative max-w-4xl mx-auto py-4 px-2">
            {/* Background layered cards to simulate physical card stack in moderator hands */}
            <div
              className="absolute inset-x-6 top-8 bottom-0 rounded-3xl bg-zinc-300/60 dark:bg-zinc-800/60 border-2 border-zinc-400/50 dark:border-zinc-700/50 shadow-lg transform rotate-1 pointer-events-none transition-transform"
              style={{ zIndex: 1 }}
            />
            <div
              className="absolute inset-x-4 top-6 bottom-2 rounded-3xl bg-zinc-200/80 dark:bg-zinc-850 border-2 border-zinc-300 dark:border-zinc-700 shadow-xl transform -rotate-1 pointer-events-none transition-transform"
              style={{ zIndex: 2 }}
            />

            {/* The Active Top TV Card */}
            <div className="relative" style={{ zIndex: 10 }}>
              <TvHostCueCard
                card={currentCard}
                isFlipped={!!flippedCards[currentCard.id]}
                onFlip={() => toggleFlip(currentCard.id)}
                onNextCard={() =>
                  setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0))
                }
                onCopyQuote={handleCopy}
                isCopied={copiedQuote !== null}
                isLarge
              />
            </div>
          </div>

          {/* Stack Navigation & Hotkey Help */}
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-3">
              <span>
                Karte <strong>{currentIndex + 1}</strong> von <strong>{filteredCards.length}</strong>
              </span>
              <span>·</span>
              <span className="hidden sm:inline">
                Tasten: <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-bold">Leertaste</kbd> = Wenden,{' '}
                <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-bold">→</kbd> = Nächste Karte
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-950 dark:text-zinc-100 font-bold">
              <span>Bühnentipp:</span>
              <span className="text-muted-foreground font-normal">
                Karten locker mit den Daumen an den Rändern halten, Blick 1 Sekunde heben!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODUS 2: AUF DEM PULT (ALLE 8 TV-KARTEN NEBENEINANDER)
      ══════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'desk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((card) => (
            <div key={card.id} className="w-full">
              <TvHostCueCard
                card={card}
                isFlipped={!!flippedCards[card.id]}
                onFlip={() => toggleFlip(card.id)}
                onCopyQuote={handleCopy}
                isCopied={copiedQuote !== null}
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer Info Box */}
      <div className="bg-muted/40 border-2 border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-foreground shrink-0" />
          <span>
            Offizieller Leitfaden Umweltmentoren BW: Die Karten sind exakt auf den 15-Minuten-Slot von 13:15 bis 13:30 Uhr abgestimmt.
          </span>
        </div>
        <div className="text-left sm:text-right shrink-0">
          UBA-Grundpauschale: <strong className="text-foreground">4,4 Tonnen CO₂/Kopf</strong> (inkl. 1.200 kg Öffentliche Hand)
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TV HOST CUE CARD (AUTHENTISCHE FERNSEH-MODERATIONSKARTE)
// ══════════════════════════════════════════════════════════════════════════════

interface TvHostCueCardProps {
  card: TvCueCard;
  isFlipped: boolean;
  onFlip: () => void;
  onNextCard?: () => void;
  onCopyQuote: (text: string) => void;
  isCopied: boolean;
  isLarge?: boolean;
}

function TvHostCueCard({
  card,
  isFlipped,
  onFlip,
  onNextCard,
  onCopyQuote,
  isCopied,
  isLarge = false,
}: TvHostCueCardProps) {
  // Helper to render text with yellow/blue/green highlighter markers
  const renderHighlightedQuote = (quote: string, highlights: string[]) => {
    let parts: { text: string; isHighlight: boolean }[] = [{ text: quote, isHighlight: false }];

    highlights.forEach((hl) => {
      const newParts: { text: string; isHighlight: boolean }[] = [];
      parts.forEach((p) => {
        if (p.isHighlight) {
          newParts.push(p);
        } else {
          const split = p.text.split(hl);
          split.forEach((seg, sIdx) => {
            if (seg) newParts.push({ text: seg, isHighlight: false });
            if (sIdx < split.length - 1) {
              newParts.push({ text: hl, isHighlight: true });
            }
          });
        }
      });
      parts = newParts;
    });

    return (
      <span>
        {parts.map((part, i) =>
          part.isHighlight ? (
            <mark
              key={i}
              className="bg-amber-200/90 dark:bg-amber-400/30 text-zinc-950 dark:text-amber-100 font-bold px-1 py-0.5 rounded shadow-xs mx-0.5"
            >
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div
      className={`perspective-1000 w-full transition-all duration-300 ${
        isLarge ? 'min-h-[580px]' : 'min-h-[540px]'
      }`}
    >
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-500 ease-out rounded-3xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ minHeight: isLarge ? '580px' : '540px' }}
      >
        {/* ══════════════════════════════════════════════════════════════════════
            VORDERSEITE (MODERATOR-ANSICHT / PROMPTER-SEITE)
            Thick cardboard look with authentic studio ring hole & highlighters
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#ffffff] dark:bg-[#0f0e11] text-zinc-950 dark:text-zinc-50 border-[6px] border-[#d4d4d8] dark:border-[#27272a] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between overflow-y-auto font-sans select-text">
          {/* Cardboard Header Bar with Punched Ring Hole */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-zinc-950/20 dark:border-zinc-700/60 pb-3">
              <div className="flex items-center gap-3">
                {/* Metallic Ring Punched Hole */}
                <div
                  className="w-6 h-6 rounded-full border-2 border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-800 shadow-inner flex items-center justify-center shrink-0"
                  title="Ring-Lochung der Moderationskarte"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-350 dark:bg-zinc-900 border border-zinc-400/50"></div>
                </div>

                {/* Card Number Stamp */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-2.5 py-1 rounded-lg uppercase shadow-xs">
                    KARTE {card.id.toString().padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest hidden sm:inline">
                    {card.moderator.segmentBadge}
                  </span>
                </div>
              </div>

              {/* Time & Speaker Pills */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 flex items-center gap-1 shadow-xs">
                  <Clock className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>{card.timeSlot}</span>
                </span>

                <div className="flex items-center gap-1">
                  {card.speakers.includes('paul') && (
                    <span className="font-mono text-[10px] font-black tracking-wider text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-200 px-2 py-1 rounded-md border border-blue-300 dark:border-blue-800">
                      🔵 PAUL
                    </span>
                  )}
                  {card.speakers.includes('jona') && (
                    <span className="font-mono text-[10px] font-black tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200 px-2 py-1 rounded-md border border-emerald-300 dark:border-emerald-800">
                      🟢 JONA
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Segment Title & Slide Indicator */}
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight leading-tight">
                {card.title}
              </h3>
              <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                {card.slideTitle}
              </span>
            </div>

            {/* Studio Regie Box (Director Notes) */}
            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-2.5 rounded-r-xl text-xs text-amber-950 dark:text-amber-200 font-sans leading-relaxed flex items-start gap-2">
              <span className="font-mono text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                REGIE
              </span>
              <p className="font-medium">{card.moderator.regieInstruction}</p>
            </div>

            {/* Teleprompter Speech Lines with Highlighter Markers */}
            <div className="space-y-3 pt-1">
              {card.moderator.speechLines.map((line, idx) => {
                const isPaul = line.speaker === 'paul';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border-2 text-xs sm:text-sm leading-relaxed ${
                      isPaul
                        ? 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/60'
                        : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          isPaul
                            ? 'text-blue-800 dark:text-blue-300'
                            : 'text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isPaul ? 'bg-blue-600' : 'bg-emerald-600'
                          }`}
                        ></span>
                        {line.speakerName}:
                      </span>

                      <button
                        type="button"
                        onClick={() => onCopyQuote(line.quote)}
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
                        title="Zitat in Zwischenablage kopieren"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="font-serif text-[14px] sm:text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {renderHighlightedQuote(line.quote, line.highlights)}
                    </div>

                    {line.stageAction && (
                      <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-2 italic flex items-center gap-1">
                        <span>👉 [Bühnen-Aktion: {line.stageAction}]</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick-Glance Studio Bullet Points */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="font-mono text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                STUDIO-STICHWÖRTER FÜR DEN 0,2-SEKUNDEN-BLICK:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {card.moderator.bulletPoints.map((bp, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-xl border text-[11px] leading-tight ${
                      bp.highlight
                        ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-400 dark:border-zinc-600 font-bold text-zinc-950 dark:text-white'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <strong className="block font-mono text-[10px] uppercase text-zinc-900 dark:text-zinc-200 mb-0.5">
                      • {bp.label}
                    </strong>
                    <span>{bp.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Card Footer: Handover & Flip Actions */}
          <div className="pt-4 border-t-2 border-zinc-950/20 dark:border-zinc-700/60 flex items-center justify-between gap-3 mt-4">
            <div className="space-y-0.5 truncate">
              <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                {card.moderator.partnerCue}
              </div>
              <div className="font-mono text-[11px] text-zinc-500">
                {card.moderator.beamerTrigger}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onNextCard && (
                <button
                  type="button"
                  onClick={onNextCard}
                  className="paper-btn-secondary !min-h-[36px] !text-xs !py-1 !px-3 font-bold"
                  title="Nächste Karte"
                >
                  <span>Weiter ➔</span>
                </button>
              )}

              <button
                type="button"
                onClick={onFlip}
                className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 !min-h-[38px] !text-xs !py-1.5 !px-3.5 rounded-xl flex items-center gap-1.5 font-black shadow-md cursor-pointer transition-all"
                title="Wendet die Karte zur offiziellen TV-Kameraseite"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Kamera-Rückseite ↷</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            RÜCKSEITE (KAMERA- & PUBLIKUMS-ANSICHT / TV-STUDIO LOGO)
            This is what the camera and audience see when the host holds the card!
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white border-[6px] border-zinc-700 rounded-3xl p-7 sm:p-10 shadow-2xl flex flex-col justify-between overflow-hidden font-sans select-none relative">
          {/* Subtle Studio Geometric Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* Big Stylized Card Watermark */}
          <div className="absolute right-6 bottom-4 font-mono text-[120px] sm:text-[180px] font-black text-white/5 pointer-events-none leading-none select-none">
            {card.id.toString().padStart(2, '0')}
          </div>

          {/* Top Camera Header Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              {/* Metallic Ring Punched Hole */}
              <div className="w-6 h-6 rounded-full border-2 border-zinc-500 bg-zinc-800 shadow-inner flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-700"></div>
              </div>

              <div>
                <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-emerald-400 block">
                  LAND BADEN-WÜRTTEMBERG
                </span>
                <span className="font-mono text-xs font-black tracking-wider text-zinc-300">
                  UMWELTMENTORINNEN & UMWELTMENTOREN
                </span>
              </div>
            </div>

            <span className="font-mono text-xs font-black bg-white text-zinc-950 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {card.cameraBack.badgeText}
            </span>
          </div>

          {/* Centerpiece: Iconic TV Show Logo & Branding */}
          <div className="relative z-10 my-auto text-center space-y-3 py-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700 shadow-inner mb-2">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
                {card.cameraBack.showTitle}
              </h2>
              <p className="font-mono text-xs sm:text-sm font-bold tracking-widest text-emerald-400 uppercase">
                {card.cameraBack.subTitle}
              </p>
            </div>

            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto rounded-full my-3"></div>

            <div className="space-y-0.5 text-xs text-zinc-400 font-mono">
              <p className="text-zinc-200 font-bold">{card.cameraBack.venue}</p>
              <p>{card.cameraBack.date}</p>
            </div>
          </div>

          {/* Bottom Camera Footer Bar */}
          <div className="relative z-10 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">MODERATION TEAM:</span>
              <strong className="text-white text-xs sm:text-sm tracking-wide">
                {card.cameraBack.hosts}
              </strong>
            </div>

            <button
              type="button"
              onClick={onFlip}
              className="bg-white text-zinc-950 hover:bg-zinc-200 !min-h-[38px] !text-xs !py-1.5 !px-4 rounded-xl flex items-center gap-1.5 font-black shadow-lg cursor-pointer transition-all"
              title="Wendet die Karte zurück zur Moderator-Sprecherseite"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Moderatorseite ↶</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
