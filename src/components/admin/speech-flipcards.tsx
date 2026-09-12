'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  Presentation,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Copy,
  Clock,
  Mic,
  Maximize2,
  Grid,
  Square,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Info,
} from 'lucide-react';

export interface SpeechCardItem {
  id: number;
  slideNumber: number;
  slideTitle: string;
  timeSlot: string;
  title: string;
  speakers: ('paul' | 'jona')[];
  category: 'slide' | 'defense' | 'tech';
  front: {
    stageFocus: string;
    beamerKey: string;
    openings: {
      speaker: 'paul' | 'jona';
      speakerName: string;
      quote: string;
      note?: string;
    }[];
    cues: string[];
    partnerHandover?: string;
  };
  back: {
    bulletPoints: {
      speaker?: 'paul' | 'jona';
      label?: string;
      text: string;
      highlight?: boolean;
    }[];
    regieNotes: string[];
    ubaNote?: string;
    handoverSentence: string;
    beamerAction: string;
  };
}

export const SPEECH_CARDS: SpeechCardItem[] = [
  {
    id: 1,
    slideNumber: 1,
    slideTitle: 'Folie 1: Titel & Team',
    timeSlot: '00:00 – 02:00',
    title: 'Begrüßung & Der Einstieg',
    speakers: ['paul', 'jona'],
    category: 'slide',
    front: {
      stageFocus: 'Große Begrüßung im Innenministerium & Vorstellung',
      beamerKey: 'LEERTASTE ➔ Folie 2',
      openings: [
        {
          speaker: 'paul',
          speakerName: 'Paul Kaiser',
          quote:
            '„Sehr geehrter Herr Staatssekretär Deuschle, liebe Vertreterinnen und Vertreter des Kultusministeriums und der Jugendstiftung, liebe Mentorinnen und Mentoren, liebe Lehrkräfte!“',
          note: 'Mit fester Stimme, Blick ins Plenum, freundliches Lächeln.',
        },
        {
          speaker: 'jona',
          speakerName: 'Jona Noack',
          quote:
            '„... und mein Name ist Jona Noack. Wir beide sind Schüler und Umweltmentoren des Kurses 2025/2026.“',
          note: 'Übernimmt nahtlos, betont den Praxisanspruch.',
        },
      ],
      cues: [
        'Paul: Freude über den Auftritt im Innenministerium Stuttgart.',
        'Paul Vorstellung: „Mein Name ist Paul Kaiser...“',
        'Jona Mission: Kein theoretisches Projekt für die Schublade!',
        'Jona Vision: Ein dauerhaftes Werkzeug für ganz Baden-Württemberg im echten Unterricht.',
      ],
      partnerHandover: 'Jona schließt ab ➔ leitet über zur Folie 2 (Problemstellung).',
    },
    back: {
      bulletPoints: [
        {
          speaker: 'paul',
          label: 'Begrüßung',
          text: 'Förmliche und herzliche Begrüßung von Staatssekretär Andreas Deuschle, Ministerium & Jugendstiftung.',
        },
        {
          speaker: 'jona',
          label: 'Kernbotschaft',
          text: 'Als wir vor knapp einem Jahr starteten, wollten wir kein verstaubendes Projekt, sondern ein praxisnahes Werkzeug für echte Schulklassen.',
        },
        {
          speaker: 'jona',
          label: 'Landesweiter Einsatz',
          text: 'Zielgruppe: Gymnasien, Realschulen, Gemeinschaftsschulen in ganz BW ab Klasse 7.',
        },
      ],
      regieNotes: [
        '👁️ Blickkontakt zu Staatssekretär Deuschle und ins gesamte Plenum.',
        '🧘 Aufrechte Haltung, offene Gestik, ruhiges Anfangstempo (nicht hetzen!).',
        '⏳ Zeitlimit: Exakt 2:00 Minuten nicht überschreiten.',
      ],
      handoverSentence:
        '„Jona erklärt, warum bisherige Online-Rechner an Schulen regelmäßig scheitern.“',
      beamerAction: 'LEERTASTE oder PFEIL RECHTS ➔ Folie 2 einblenden.',
    },
  },
  {
    id: 2,
    slideNumber: 2,
    slideTitle: 'Folie 2: Warum Rechner scheitern',
    timeSlot: '02:00 – 04:30',
    title: 'Das Problem aus Schülersicht & Unsere Vision',
    speakers: ['jona', 'paul'],
    category: 'slide',
    front: {
      stageFocus: '3 Hürden im Unterricht & Der Lösungsansatz',
      beamerKey: 'LEERTASTE ➔ Folie 3 (QR-Code)',
      openings: [
        {
          speaker: 'jona',
          speakerName: 'Jona Noack',
          quote:
            '„Lehrkraft sagt: ‚Heute berechnen wir unseren Fußabdruck!‘ – und nach genau drei Minuten bricht das Chaos aus.“',
          note: 'Schritt nach vorn, authentische Schülerperspektive.',
        },
        {
          speaker: 'paul',
          speakerName: 'Paul Kaiser',
          quote: '„Deshalb haben wir uns gesagt: Das muss doch besser gehen!“',
          note: 'Zustimmendes Nicken, übernimmt dynamisch.',
        },
      ],
      cues: [
        '1. Rechner für Erwachsene: Wer kennt als 14-Jähriger die Heizöl-Liter oder kWh der Eltern?',
        '2. Datenschutz: Accounts, E-Mails, Tracking – No-Go an Schulen in BW!',
        '3. Fehlender Klassenbezug: Schüler sitzen isoliert vor einer Zahl wie „8,4 t“ – keine gemeinsame Auswertung.',
        'Paul: Unsere Lösung: Alltagsnah, 100% anonym, passend für die 45-Minuten-Stunde!',
      ],
      partnerHandover: 'Paul: „Wir zeigen keine Tabellen – wir probieren das jetzt alle gemeinsam live aus!“',
    },
    back: {
      bulletPoints: [
        {
          speaker: 'jona',
          label: 'Hürde 1',
          text: 'Komplexe Erwachsenen-Fragen überfordern Jugendliche (Heizkostenabrechnung, Gastherme, Stromzähler).',
        },
        {
          speaker: 'jona',
          label: 'Hürde 2',
          text: 'Strenge Datenschutzvorgaben in Baden-Württemberg verbieten kommerzielle Rechner mit Account-Zwang oder Werbe-Cookies.',
        },
        {
          speaker: 'jona',
          label: 'Hürde 3',
          text: 'Keine pädagogische Klassenführung: Lehrkraft hat keinen Überblick über die Verteilung der Klasse.',
        },
        {
          speaker: 'paul',
          label: 'Unsere Antwort',
          text: 'Alltagsfragen (Fahrrad, Streaming, Kantinenessen) + anonyme Teilnahme + Live-Beamer-Dashboard.',
        },
      ],
      regieNotes: [
        '🎭 Bei „Heizöl-Liter“ leicht schmunzeln – das Publikum und die Lehrkräfte werden nicken!',
        '🔥 Paul übernimmt das Wort mit Energie und Vorfreude auf das Experiment.',
      ],
      handoverSentence:
        '„Paul bittet das gesamte Plenum, das Smartphone zu zücken.“',
      beamerAction: 'LEERTASTE ➔ Folie 3 (Riesiger QR-Code für den Saal).',
    },
  },
  {
    id: 3,
    slideNumber: 3,
    slideTitle: 'Folie 3: Live-Mitmachrunde',
    timeSlot: '04:30 – 08:30',
    title: 'Die Live-Mitmachrunde im Saal 🔥',
    speakers: ['paul', 'jona'],
    category: 'slide',
    front: {
      stageFocus: 'Highlight: Der ganze Saal rechnet live mit',
      beamerKey: 'LEERTASTE ➔ Folie 4 (Didaktik)',
      openings: [
        {
          speaker: 'paul',
          speakerName: 'Paul Kaiser',
          quote:
            '„Wir bitten jetzt alle im Saal – von den Mentorinnen und Mentoren über die Lehrkräfte bis hin zu Herrn Staatssekretär Deuschle: Bitte nehmen Sie Ihr Smartphone zur Hand!“',
          note: 'Smartphone hochhalten, animierende Geste ins Publikum.',
        },
        {
          speaker: 'jona',
          speakerName: 'Jona Noack',
          quote:
            '„Sie sehen jetzt unseren 10-Fragen-Quick-Check. Keine Fragen nach Heizöl, sondern nach Ihrem Alltag – in unter 2 Minuten!“',
          note: 'Begleitet locker, während der Saal tippt.',
        },
      ],
      cues: [
        'Paul: QR-Code auf Beamer scannen. Keine App, kein Passwort!',
        'Auf Button „Als Gast testen“ tippen.',
        'Jona moderiert: 10 Fragen zu Anreise heute, Fleischkonsum, Streaming.',
        'Paul (nach 90s): Handzeichen-Check! „Wer hat sein Ergebnis schon?“',
        'Auswertung: Konkrete Äquivalente statt nackter Zahlen (Bäume & Autokilometer).',
      ],
      partnerHandover: 'Paul bittet um Handzeichen ➔ leitet über zu den wissenschaftlichen Grundlagen.',
    },
    back: {
      bulletPoints: [
        {
          speaker: 'paul',
          label: 'Aufforderung',
          text: 'Alle im Saal scannen die Großleinwand. Wichtig: „Keine Installation, kein Account nötig!“',
        },
        {
          speaker: 'jona',
          label: 'Live-Moderation',
          text: 'Während alle tippen: Erklären, wie unkompliziert die Fragen gestaltet sind (10 Fragen Quick-Check).',
        },
        {
          speaker: 'paul',
          label: 'Handzeichen-Interaktion',
          text: '„Wer hat sein Ergebnis schon auf dem Display? Einmal kurz die Hand heben!“ ➔ „Fantastisch, fast der halbe Saal!“',
          highlight: true,
        },
        {
          speaker: 'paul',
          label: 'Ergebnis-Visualisierung',
          text: 'Ergebnisse werden sofort in greifbare Bilder übersetzt: z. B. 45 gepflanzte Buchen oder 3.200 km Zugfahrt.',
        },
      ],
      regieNotes: [
        '⏱️ Die 60 bis 90 Sekunden Stille beim Tippen bewusst aushalten – das Publikum ist voll engagiert!',
        '😊 Blickkontakt halten, lächeln, zwei Schritte zur Seite treten, um nicht im Projektor-Licht zu stehen.',
      ],
      handoverSentence:
        '„Paul erläutert die fundierten Umweltbundesamt-Daten und die 4,4-Tonnen-Basispauschale.“',
      beamerAction: 'LEERTASTE ➔ Folie 4 (Didaktischer Aufbau & UBA-Pauschale).',
    },
  },
  {
    id: 4,
    slideNumber: 4,
    slideTitle: 'Folie 4: Didaktik & 3 Spielmodi',
    timeSlot: '08:30 – 11:00',
    title: 'Wissenschaft, 4,4 t UBA-Pauschale & 3 Spielmodi ⭐',
    speakers: ['paul', 'jona'],
    category: 'slide',
    front: {
      stageFocus: 'UBA-Validierung, 4,4 t Pauschale & modulare Modi',
      beamerKey: 'LEERTASTE ➔ Folie 5 (Dashboard)',
      openings: [
        {
          speaker: 'paul',
          speakerName: 'Paul Kaiser',
          quote:
            '„Was Sie gerade erlebt haben, basiert auf echter Umweltforschung: Alle Faktoren stammen aus den Datenbanken des Umweltbundesamts (UBA) und GEMIS.“',
          note: 'Wissenschaftliche Seriosität betonen.',
        },
        {
          speaker: 'jona',
          speakerName: 'Jona Noack',
          quote:
            '„Weil jeder Schultag anders ist, haben wir die App modular in drei Spielmodi aufgeteilt: 10, 30 oder 60 Fragen.“',
          note: 'Didaktische Flexibilität für Lehrkräfte aufzeigen.',
        },
      ],
      cues: [
        'Paul: 4 Sektoren: Mobilität, Ernährung, Energie, Konsum.',
        '⭐ DER DURCHBRUCH: Die 4,4-Tonnen-UBA-Basispauschale!',
        '1.200 kg feste öffentliche Infrastruktur (Straßen, Schulen, Spitäler). Verhindert Schönrechnerei (1,7 t = Unsinn!).',
        'Jona: Modus 1 (10Q Quick, 2 Min) ➔ Modus 2 (30Q Standard, 8 Min) ➔ Modus 3 (60Q Detail, 25 Min).',
      ],
      partnerHandover: 'Jona schließt die Modi ab ➔ leitet zum Lehrer-Dashboard und DSGVO über.',
    },
    back: {
      bulletPoints: [
        {
          speaker: 'paul',
          label: '⭐ UBA-Basispauschale (4.400 kg)',
          text: 'Herkömmliche Rechner addieren oft nur Teilfragen und zeigen unrealistische 1,5 bis 2 Tonnen. Unser Rechner integriert die offizielle UBA-Grundpauschale von 4,4 t pro Kopf.',
          highlight: true,
        },
        {
          speaker: 'paul',
          label: 'Öffentliche Infrastruktur (1.200 kg)',
          text: 'Jeder Bundesbürger trägt anteilig 1.200 kg für Straßennetz, Schulen, Krankenhäuser und Verwaltung. Wichtiges Signal an die Politik!',
        },
        {
          speaker: 'jona',
          label: 'Modus 1 (10 Fragen)',
          text: 'Quick-Check in 2–3 Min. Perfekt als Einstieg in die Schulstunde ohne Vorbereitung.',
        },
        {
          speaker: 'jona',
          label: 'Modus 2 (30 Fragen)',
          text: 'Standard-Check in 8–10 Min für reguläre Fachstunden (Geographie, Biologie, BNT).',
        },
        {
          speaker: 'jona',
          label: 'Modus 3 (60 Fragen)',
          text: 'Detail-Audit in 25 Min für Projekttage, Umwelt-AGs und Schulentwicklung.',
        },
      ],
      regieNotes: [
        '💡 Die 1.200 kg öffentliche Infrastruktur direkt an Staatssekretär Deuschle adressieren: Klimaschutz ist Bürger- UND Staatsaufgabe!',
        '📊 Klare Differenzierung der 3 Modi – Lehrkräfte lieben Unterrichts-Flexibilität.',
      ],
      ubaNote:
        'UBA-Faktoren: 1.200 kg Öffentl. Infrastruktur + 1.400 kg Konsum-Basis + 800 kg Wohn-Sockel + 600 kg Ernährungs-Basis + 400 kg Mobilitäts-Sockel = 4.400 kg Basis.',
      handoverSentence:
        '„Jona zeigt das Lehrkräfte-Dashboard und die 100% DSGVO-Sicherheit.“',
      beamerAction: 'LEERTASTE ➔ Folie 5 (Dashboard & Urkunden).',
    },
  },
  {
    id: 5,
    slideNumber: 5,
    slideTitle: 'Folie 5: Dashboard & Urkunden',
    timeSlot: '11:00 – 13:00',
    title: 'Lehrer-Dashboard, 100% DSGVO & Handabdruck',
    speakers: ['jona', 'paul'],
    category: 'slide',
    front: {
      stageFocus: 'Klassen-Analytics, Datenschutz & Simulator',
      beamerKey: 'LEERTASTE ➔ Folie 6 (Abschluss)',
      openings: [
        {
          speaker: 'jona',
          speakerName: 'Jona Noack',
          quote:
            '„Der eigentliche pädagogische Hebel entsteht durch unser Lehrkräfte-Dashboard: Mit einem einzigen Klick generiert die Lehrkraft einen anonymen Klassencode.“',
          note: 'Wichtigstes Argument für Ministerium & Lehrkräfte.',
        },
        {
          speaker: 'paul',
          speakerName: 'Paul Kaiser',
          quote:
            '„Ganz wichtig: Keine Schuldgefühle erzeugen, sondern Handeln anstoßen! Unser Simulator macht aus dem Fußabdruck einen echten Handabdruck.“',
          note: 'Positive Psychologie und Motivation.',
        },
      ],
      cues: [
        'Jona: Klassencode (z. B. „KL-8B-KLIMA“) an die Tafel schreiben.',
        'Beamer zeigt in Echtzeit den Klassendurchschnitt & Hebel.',
        '🔒 100% DSGVO: Keine Schüler-Accounts. Namen auf Urkunden nur lokal im Browser-RAM!',
        'Paul: Interaktiver Simulator: „Was spart 2x Veggie oder Radfahren?“ (-350 kg CO₂ / 28 Bäume).',
        'Klimaschutz-Versprechen wird auf die druckbare Urkunde übernommen.',
      ],
      partnerHandover: 'Paul: „So wird aus dem Fußabdruck ein wirksamer Handabdruck!“ ➔ Folie 6.',
    },
    back: {
      bulletPoints: [
        {
          speaker: 'jona',
          label: 'Echtzeit-Klassenauswertung',
          text: 'Lehrer sehen aggregierte Sektoren-Balken: Wo schneidet die Klasse gut ab, wo gibt es noch Sparpotential?',
        },
        {
          speaker: 'jona',
          label: '100% DSGVO-Garantie',
          text: 'Keine Registrierung, keine Mailadresse, keine Passwörter für Schüler. Vollständig konform mit den Schulvorgaben Baden-Württembergs.',
          highlight: true,
        },
        {
          speaker: 'paul',
          label: 'Maßnahmen-Simulator',
          text: 'Gamification statt Frust: Schüler simulieren konkrete Verhaltensänderungen und sehen den CO₂-Rückgang live.',
        },
        {
          speaker: 'paul',
          label: 'Offizielle Schüler-Urkunde',
          text: 'Schüler drucken am Ende eine personalisierte Urkunde mit ihrem persönlichen Klimaversprechen aus.',
        },
      ],
      regieNotes: [
        '🔒 Betonung „Keine Speicherung von Schülernamen auf Servern“ begeistert Schulleiter und Datenschutzbeauftragte!',
        '📜 Urkunde als physischer Erfolgsnachweis im Klassenzimmer hervorheben.',
      ],
      handoverSentence:
        '„Jona fasst zusammen und Paul übergibt an Staatssekretär Andreas Deuschle.“',
      beamerAction: 'LEERTASTE ➔ Folie 6 (Rollout, Dank & Übergabe).',
    },
  },
  {
    id: 6,
    slideNumber: 6,
    slideTitle: 'Folie 6: Rollout & Dank',
    timeSlot: '13:00 – 15:00',
    title: 'Fazit, Einladung an Stellwand & Übergabe an Deuschle 🏆',
    speakers: ['jona', 'paul'],
    category: 'slide',
    front: {
      stageFocus: 'Großes Finale, Danksagung & Wortübergabe',
      beamerKey: 'Präsentation stoppt auf Abschlussfolie',
      openings: [
        {
          speaker: 'jona',
          speakerName: 'Jona Noack',
          quote:
            '„Unsere Botschaft heute ist ganz einfach: Klimaschutz an Schulen scheitert nicht am Willen der Jugendlichen und auch nicht am Engagement der Lehrkräfte.“',
          note: 'Blickkontakt ins gesamte Auditorium.',
        },
        {
          speaker: 'paul',
          speakerName: 'Paul Kaiser',
          quote:
            '„Besuchen Sie uns gleich an unserer Stellwand im Projekte-Markt – wir richten Ihnen gerne direkt einen Schulzugang ein!“',
          note: 'Einladung zum Mitmachen, Blick zu Deuschle.',
        },
      ],
      cues: [
        'Jona: Rechner steht ab heute kostenlos für alle Schulen in BW bereit.',
        'Paul: Einladung zur Stellwand im Markt der Möglichkeiten (Handouts liegen bereit).',
        'Paul: Dank an Jugendstiftung, Ministerium & Mentorenkurs.',
        '🎤 DIE FEIERLICHE ÜBERGABE AN STAATSSEKRETÄR ANDREAS DEUSCHLE!',
      ],
      partnerHandover: 'Übergabesatz wörtlich sprechen ➔ Verbeugung ➔ Applaus abwarten.',
    },
    back: {
      bulletPoints: [
        {
          speaker: 'jona',
          label: 'Kernbotschaft zum Abschluss',
          text: 'Klimaschutz scheiterte oft an unzugänglichen Tools. Unser Rechner bietet eine schlüsselfertige, didaktische Lösung.',
        },
        {
          speaker: 'paul',
          label: 'Einladung Projekte-Markt',
          text: 'Stellwand mit Live-Demo, QR-Plakaten, Unterrichts-Verlaufsplänen und direkter Lizenz-Einrichtung für Schulen.',
        },
        {
          speaker: 'paul',
          label: 'Danksagung',
          text: 'Dank an die Jugendstiftung Baden-Württemberg, das Kultusministerium und den Mentorenkurs 2025/2026.',
        },
        {
          speaker: 'paul',
          label: 'Wörtlicher Übergabesatz',
          text: '„Und nun freuen wir uns ganz besonders auf den Impuls und das Gespräch mit Herrn Staatssekretär Andreas Deuschle! Vielen Dank!“',
          highlight: true,
        },
      ],
      regieNotes: [
        '👏 Verbeugung gemeinsam synchron mit Jona und Paul.',
        '🤝 Offene Handgeste zu Staatssekretär Andreas Deuschle richten.',
        '😊 Lächeln und den Applaus des Saals wirken lassen.',
      ],
      handoverSentence:
        '„Überleitung zum nächsten Programmpunkt: Rede & Talk mit Staatssekretär Deuschle.“',
      beamerAction: 'Beamer bleibt auf Folie 6 stehen (keine Taste drücken).',
    },
  },
  {
    id: 7,
    slideNumber: 0,
    slideTitle: 'Q&A Defense (Fragen abfangen)',
    timeSlot: 'Nach dem Vortrag / Nachfragen',
    title: 'Q&A Defense: Schlagfertige Antworten auf Publikumsfragen',
    speakers: ['jona', 'paul'],
    category: 'defense',
    front: {
      stageFocus: 'Souveräne Antworten auf die 4 häufigsten Fragen',
      beamerKey: 'Optional Beamer auf Folie 5/6 belassen',
      openings: [
        {
          speaker: 'jona',
          speakerName: 'Jona Noack',
          quote:
            '„Datenschutz und Bildungsplan BW sind unsere stärksten didaktischen Argumente.“',
          note: 'Ruhig und faktenbasiert antworten.',
        },
        {
          speaker: 'paul',
          speakerName: 'Paul Kaiser',
          quote:
            '„Kostenlos für alle Schulen und 100% transparent nach UBA-Standards.“',
          note: 'Gemeinwohl- und Schüleranspruch unterstreichen.',
        },
      ],
      cues: [
        '❓ Frage 1: Wie ist der Datenschutz an Schulen geregelt? 👉 Jona antwortet (100% DSGVO).',
        '❓ Frage 2: Warum liegt der CO₂-Wert bei 7 bis 9 Tonnen? 👉 Paul antwortet (4,4t UBA Pauschale).',
        '❓ Frage 3: Was kostet das Tool für Schulen? 👉 Paul antwortet (Dauerhaft 0,00 Euro).',
        '❓ Frage 4: Passt das in den Bildungsplan BW? 👉 Jona antwortet (BNE Leitperspektive, Geo/Bio/GK).',
      ],
      partnerHandover: 'Je nach Frage übernimmt Jona (Didaktik/DSGVO) oder Paul (Wissenschaft/Kosten).',
    },
    back: {
      bulletPoints: [
        {
          speaker: 'jona',
          label: 'Antwort Datenschutz (DSGVO)',
          text: '„Zu 100% DSGVO-konform. Schüler geben weder Namen noch E-Mail an. Die Teilnahme erfolgt über einen anonymen Einmal-Code. Urkundennamen werden ausschließlich lokal im Browser-RAM eingesetzt – null Server-Speicherung!“',
          highlight: true,
        },
        {
          speaker: 'paul',
          label: 'Antwort 7–9 Tonnen (UBA-Basis)',
          text: '„Wissenschaftlicher UBA-Standard: Jeder Bürger hat 1.200 kg unvermeidbare öffentliche Infrastruktur (Straßen, Schulen, Krankenhäuser) + 3.200 kg Grundbedarfe. Das verhindert Schönfärberei und zeigt die Realität!“',
          highlight: true,
        },
        {
          speaker: 'paul',
          label: 'Antwort Kosten & Trägerschaft',
          text: '„Exakt 0,00 Euro. Gemeinwohl- und Schülerprojekt von uns Umweltmentoren. Dauerhaft kostenlos, werbefrei und ohne Lizenzgebühren für Schulen in BW.“',
        },
        {
          speaker: 'jona',
          label: 'Antwort Bildungsplan Baden-Württemberg',
          text: '„Passt perfekt in die Leitperspektive BNE (Bildung für nachhaltige Entwicklung), Geographie (Kl. 7–10), Biologie/BNT und Gemeinschaftskunde.“',
        },
      ],
      regieNotes: [
        '🎓 Nie defensiv oder unsicher wirken. Wir haben alle Fakten wissenschaftlich und juristisch wasserdicht vorbereitet.',
      ],
      handoverSentence:
        '„Bei tiefergehenden Schulfragen: Gerne an die Stellwand im Projekte-Markt verweisen!“',
      beamerAction: 'Keine Folienänderung notwendig.',
    },
  },
  {
    id: 8,
    slideNumber: 0,
    slideTitle: 'Hotkeys & Saal-Notfallplan',
    timeSlot: 'Technik-Backup für die Bühne',
    title: 'Tastatur-Hotkeys & Saal-Notfallplan ⌨️',
    speakers: ['jona', 'paul'],
    category: 'tech',
    front: {
      stageFocus: 'Schnelle Tastatur-Shortcuts & Notfall-Szenarien',
      beamerKey: 'F, LEERTASTE, ⬅️, ➡️, 1-6',
      openings: [
        {
          speaker: 'paul',
          speakerName: 'Paul & Jona',
          quote:
            '„Laptop steht griffbereit am Rednerpult: Leertaste schaltet zuverlässig weiter.“',
          note: 'Vor Beginn Vollbild mit Taste F aktivieren.',
        },
      ],
      cues: [
        '⌨️ LEERTASTE oder ➡️: Nächste Folie',
        '⌨️ ⬅️ (Pfeil links): Vorherige Folie',
        '⌨️ F: Vollbildmodus aktivieren / beenden',
        '⌨️ Tasten 1 bis 6: Direkt zur jeweiligen Folie springen',
        '📶 Notfall WLAN: Paul moderiert locker („einfach beim Nachbarn mitschauen“).',
      ],
      partnerHandover: 'Laptop während des Vortrags unauffällig im Blick behalten.',
    },
    back: {
      bulletPoints: [
        {
          label: 'Notfall 1: Schlechter WLAN-Empfang im Saal',
          text: 'Paul sagt locker ins Mikrofon: „Wer gerade kein Handynetz hat, schaut einfach bei der Nachbarin mit aufs Display oder probiert es nachher an unserer Stellwand aus!“',
          highlight: true,
        },
        {
          label: 'Notfall 2: Beamer hängt oder zeigt falsche Folie',
          text: 'Einfach die Zifferntaste drücken (z. B. Taste „3“ für den QR-Code oder Taste „1“ für Start) – die Folie springt sofort an die richtige Stelle.',
        },
        {
          label: 'Timing-Checkpoints für 15 Minuten',
          text: '02:00 Begrüßung fertig ➔ 04:30 Problem erklärt ➔ 08:30 Saaltest fertig ➔ 11:00 Didaktik & UBA ➔ 13:00 Dashboard & Urkunde ➔ 15:00 Punktlandung Deuschle!',
          highlight: true,
        },
      ],
      regieNotes: [
        '⏱️ Die 15 Minuten sind strikt getaktet: Um 13:30 Uhr MUSS die Übergabe an Andreas Deuschle erfolgen.',
      ],
      handoverSentence:
        '„Ruhe bewahren – souveränes Auftreten begeistert das Innenministerium!“',
      beamerAction: 'Notfalls Taste F drücken, um Browser-Fullscreen zu erzwingen.',
    },
  },
];

export default function SpeechFlipcards() {
  // Flip states for each card
  const [flippedCards, setFlippedCards] = useState<{ [cardId: number]: boolean }>({});
  // Mode: 'grid' or 'focus' (single card stage mode)
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  // Current card index in focus mode
  const [currentFocusIndex, setCurrentFocusIndex] = useState<number>(0);
  // Filter by speaker/topic
  const [speakerFilter, setSpeakerFilter] = useState<'all' | 'paul' | 'jona' | 'defense'>('all');
  // Copied state
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Stage timer state for practicing
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

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  // Toggle single card flip
  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Flip all cards to front or back
  const flipAllCards = (toBack: boolean) => {
    const updated: { [cardId: number]: boolean } = {};
    SPEECH_CARDS.forEach((card) => {
      updated[card.id] = toBack;
    });
    setFlippedCards(updated);
  };

  // Check if all filtered are currently flipped
  const areAllFlipped = SPEECH_CARDS.every((c) => flippedCards[c.id]);

  // Filter cards
  const filteredCards = SPEECH_CARDS.filter((card) => {
    if (speakerFilter === 'paul') return card.speakers.includes('paul');
    if (speakerFilter === 'jona') return card.speakers.includes('jona');
    if (speakerFilter === 'defense') return card.category === 'defense' || card.category === 'tech';
    return true;
  });

  // Handle keyboard navigation in Focus mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (viewMode !== 'focus') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentFocusIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentFocusIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === ' ' || e.key === 'Enter') {
        const currentCard = filteredCards[currentFocusIndex];
        if (currentCard) {
          toggleFlip(currentCard.id);
        }
      }
    },
    [viewMode, filteredCards, currentFocusIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCopyQuote = (cardId: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER TOOLBAR ── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="paper-stamp text-[10px] font-mono uppercase bg-muted">
                25.09.2026 · 13:15 – 13:30 Uhr
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Bühnenauftritt & Moderation
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Mic className="w-5 h-5 text-foreground" />
              <span>Bühnen-Flipcards: Jona & Paul</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Interaktive 3D-Spickzettel für den 15-Minuten-Bühnenvortrag vor Staatssekretär Andreas Deuschle.
              Karten zum Üben im Fokus-Modus oder zum Umdrehen im Raster.
            </p>
          </div>

          {/* Quick PDF & Presentation Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/presentation"
              target="_blank"
              className="paper-btn-primary !min-h-[38px] !text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 font-semibold"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Präsentation testen ↗</span>
            </Link>

            <a
              href="/materials/06_Moderationskarten_Buehnenkarten_DIN_A6.pdf"
              download="06_Moderationskarten_Buehnenkarten_DIN_A6.pdf"
              className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5 font-medium"
              title="Druckbares DIN A6 PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Karten PDF (A6)</span>
            </a>

            <a
              href="/materials/07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf"
              download="07_Buehnen_Sprechtext_Wort_fuer_Wort_DIN_A4.pdf"
              className="paper-btn-secondary !min-h-[38px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5 font-medium"
              title="Kompletter Sprechtext DIN A4 PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sprechtext (A4)</span>
            </a>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
          {/* Speaker Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">Filter:</span>
            <button
              type="button"
              onClick={() => setSpeakerFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                speakerFilter === 'all'
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Alle Karten (8)
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('paul')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                speakerFilter === 'paul'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Nur Paul</span>
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('jona')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                speakerFilter === 'jona'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Nur Jona</span>
            </button>
            <button
              type="button"
              onClick={() => setSpeakerFilter('defense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                speakerFilter === 'defense'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Q&A & Notfall</span>
            </button>
          </div>

          {/* View Mode & Timer */}
          <div className="flex items-center gap-2">
            {/* 15-Minute Stage Practice Timer */}
            <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-2.5 py-1 rounded-xl text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-bold">{formatTimer(timerSeconds)}</span>
              <span className="text-[10px] text-muted-foreground">/ 15:00</span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1 hover:bg-muted rounded text-foreground transition-colors ml-1"
                title={isTimerRunning ? 'Timer anhalten' : 'Timer starten (15 Min Training)'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={handleTimerReset}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Timer zurücksetzen"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* View Switcher: Grid vs Focus */}
            <div className="flex items-center bg-muted/60 border border-border p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-card text-foreground shadow-xs font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Raster-Übersicht aller Karten"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Raster</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('focus')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  viewMode === 'focus'
                    ? 'bg-card text-foreground shadow-xs font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Bühnen-Fokusmodus (1 Karte im Großformat)"
              >
                <Square className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bühne</span>
              </button>
            </div>

            {/* Flip All Button */}
            {viewMode === 'grid' && (
              <button
                type="button"
                onClick={() => flipAllCards(!areAllFlipped)}
                className="paper-btn-secondary !min-h-[34px] !text-xs !py-1 !px-2.5 flex items-center gap-1"
                title="Alle Karten gleichzeitig wenden"
              >
                <RotateCw className="w-3 h-3" />
                <span>{areAllFlipped ? 'Alle Vorderseite' : 'Alle wenden'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BÜHNEN-FOKUSMODUS (EINZELKARTE GROSSFORMAT FÜRS REDNERPULT) ── */}
      {viewMode === 'focus' && (
        <div className="space-y-4">
          {/* Stage Navigator Bar */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentFocusIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                disabled={currentFocusIndex === 0}
                className="paper-btn-secondary !min-h-[36px] !text-xs !py-1 !px-3 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Zurück</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentFocusIndex((prev) =>
                    prev < filteredCards.length - 1 ? prev + 1 : prev
                  )
                }
                disabled={currentFocusIndex >= filteredCards.length - 1}
                className="paper-btn-secondary !min-h-[36px] !text-xs !py-1 !px-3 disabled:opacity-30"
              >
                <span>Weiter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card selector pills */}
            <div className="hidden md:flex items-center gap-1">
              {filteredCards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => setCurrentFocusIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-colors ${
                    idx === currentFocusIndex
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {card.id}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>
                Karte {currentFocusIndex + 1} von {filteredCards.length}
              </span>
              <span className="hidden sm:inline">· [Leertaste = Umdrehen]</span>
            </div>
          </div>

          {/* Focused Large Card Render */}
          {filteredCards[currentFocusIndex] && (
            <div className="max-w-3xl mx-auto">
              <SingleFlipCard
                card={filteredCards[currentFocusIndex]}
                isFlipped={!!flippedCards[filteredCards[currentFocusIndex].id]}
                onFlip={() => toggleFlip(filteredCards[currentFocusIndex].id)}
                isLarge
                onCopyQuote={handleCopyQuote}
                isCopied={copiedId === filteredCards[currentFocusIndex].id}
              />
            </div>
          )}
        </div>
      )}

      {/* ── RASTER-ANSICHT (ALLE 8 KARTEN ZUM DURCHSCROLLEN & FLIPPEN) ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((card) => (
            <SingleFlipCard
              key={card.id}
              card={card}
              isFlipped={!!flippedCards[card.id]}
              onFlip={() => toggleFlip(card.id)}
              onCopyQuote={handleCopyQuote}
              isCopied={copiedId === card.id}
            />
          ))}
        </div>
      )}

      {/* Footer Info Box */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-foreground shrink-0" />
          <span>
            Bühnen-Regel: Pro Karte maximal 2 bis 2,5 Minuten reden. Blickkontakt zu Staatssekretär Andreas Deuschle halten!
          </span>
        </div>
        <div className="text-left sm:text-right shrink-0">
          UBA-Standard 2026: <strong className="text-foreground">4,4 t Basispauschale</strong> (1,2 t Öffentl. Infrastruktur)
        </div>
      </div>
    </div>
  );
}

// ── EINZELNE 3D FLIPCARD KOMPONENTE ──
interface SingleFlipCardProps {
  card: SpeechCardItem;
  isFlipped: boolean;
  onFlip: () => void;
  isLarge?: boolean;
  onCopyQuote: (cardId: number, text: string) => void;
  isCopied: boolean;
}

function SingleFlipCard({
  card,
  isFlipped,
  onFlip,
  isLarge = false,
  onCopyQuote,
  isCopied,
}: SingleFlipCardProps) {
  return (
    <div
      className={`perspective-1000 w-full transition-all duration-300 ${
        isLarge ? 'min-h-[520px]' : 'min-h-[480px]'
      }`}
    >
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-500 ease-out rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ minHeight: isLarge ? '520px' : '480px' }}
      >
        {/* ══════════════════════════════════════════════════════════════
            VORDERSEITE (FRONT): Wörtlicher Einstieg & Sofort-Blick
        ══════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Top Badge Bar */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black bg-foreground text-background px-2 py-0.5 rounded">
                  KARTE {card.id.toString().padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                  {card.slideTitle}
                </span>
                <span className="font-mono text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3" />
                  {card.timeSlot}
                </span>
              </div>

              {/* Speaker Badges */}
              <div className="flex items-center gap-1.5">
                {card.speakers.includes('paul') && (
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                    🔵 Paul
                  </span>
                )}
                {card.speakers.includes('jona') && (
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                    🟢 Jona
                  </span>
                )}
              </div>
            </div>

            {/* Card Title */}
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground leading-snug">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {card.front.stageFocus}
              </p>
            </div>

            {/* Wörtliche Einstiegssätze (Literal Quotes) */}
            <div className="space-y-2.5">
              {card.front.openings.map((opening, idx) => {
                const isPaul = opening.speaker === 'paul';
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs leading-relaxed transition-colors ${
                      isPaul
                        ? 'bg-blue-50/50 border-blue-200/80 dark:bg-blue-950/20 dark:border-blue-900/60'
                        : 'bg-emerald-50/50 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                          isPaul ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {opening.speakerName} · Wörtlicher Einstieg:
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopyQuote(card.id, opening.quote)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Einstiegssatz kopieren"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <blockquote className="font-serif text-[13px] sm:text-sm font-semibold text-foreground italic">
                      {opening.quote}
                    </blockquote>
                    {opening.note && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Regie: {opening.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Cues on Stage */}
            <div className="space-y-1.5 pt-1">
              <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Kernstichpunkte für den 0,5-Sekunden-Blick:
              </span>
              <ul className="space-y-1 text-xs text-foreground/90 font-medium">
                {card.front.cues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-foreground/40 font-bold">•</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Flip Trigger & Handover */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-2 mt-4">
            <div className="text-[11px] font-mono text-muted-foreground truncate">
              {card.front.partnerHandover ? (
                <span>👉 {card.front.partnerHandover}</span>
              ) : (
                <span>⌨️ {card.front.beamerKey}</span>
              )}
            </div>

            <button
              type="button"
              onClick={onFlip}
              className="paper-btn-primary !min-h-[36px] !text-xs !py-1.5 !px-3 flex items-center gap-1.5 font-semibold shrink-0 cursor-pointer shadow-xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rückseite (Details) ↷</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RÜCKSEITE (BACK): Vertiefung, UBA-Fakten, Regie & Hotkeys
        ══════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-zinc-950 text-white border-2 border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Top Back Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-white text-zinc-950 px-2 py-0.5 rounded">
                  RÜCKSEITE · KARTE {card.id.toString().padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  Wissenschaft & Regie
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                {card.timeSlot}
              </span>
            </div>

            {/* In-Depth Bullet Points */}
            <div className="space-y-2.5">
              <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Ausführliche Sprechpunkte & Begründungen:
              </span>
              <div className="space-y-2">
                {card.back.bulletPoints.map((bp, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                      bp.highlight
                        ? 'bg-zinc-900 border-emerald-500/50 text-zinc-100 shadow-xs'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    {bp.label && (
                      <strong className="font-mono text-[11px] text-white block mb-0.5">
                        {bp.label}
                      </strong>
                    )}
                    <p>{bp.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* UBA Fact Box if present */}
            {card.back.ubaNote && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl text-xs text-emerald-200 space-y-1">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Umweltbundesamt Basispauschale</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans">{card.back.ubaNote}</p>
              </div>
            )}

            {/* Regie & Körpersprache */}
            <div className="space-y-1 bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-300">
              <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Regie & Körpersprache auf der Bühne:
              </span>
              <ul className="space-y-0.5 text-[11px]">
                {card.back.regieNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Handover & Beamer Trigger */}
            <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400">
                <span>Signal für Partner & Saal:</span>
                <span className="text-white font-bold">{card.back.beamerAction}</span>
              </div>
              <p className="font-serif text-xs sm:text-sm font-semibold text-emerald-300 italic">
                {card.back.handoverSentence}
              </p>
            </div>
          </div>

          {/* Bottom Flip Trigger Back */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2 mt-4">
            <span className="text-[11px] font-mono text-zinc-400">
              Beamer-Taste: <strong className="text-white">{card.front.beamerKey}</strong>
            </span>

            <button
              type="button"
              onClick={onFlip}
              className="bg-white text-zinc-950 hover:bg-zinc-200 !min-h-[36px] !text-xs !py-1.5 !px-3.5 rounded-lg flex items-center gap-1.5 font-bold shrink-0 cursor-pointer shadow-sm transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Vorderseite ↶</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
