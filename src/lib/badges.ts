import { QuizResponse, QuizQuestion } from '@/generated/prisma/client';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unit: string;
}

type ResponseWithQuestion = {
  numericalValue: number;
  question: {
    orderIndex: number;
  };
};

interface StudentWithResponses {
  id: string;
  responses: ResponseWithQuestion[];
}

export function calculateClassBadges(
  students: StudentWithResponses[],
  classAverageCo2: number
): Badge[] {
  const totalCompleted = students.length;
  if (totalCompleted === 0) {
    return getEmptyBadges();
  }

  // Count matches for each badge criteria
  let veggieCount = 0;
  let pedalCount = 0;
  let oekoCount = 0;
  let secondHandCount = 0;
  let noFlightCount = 0;

  students.forEach((student) => {
    student.responses.forEach((r) => {
      const order = r.question.orderIndex;
      const val = r.numericalValue;

      // Veggie (Question 16: Vegan = 1000, Veggie = 1200)
      if (order === 16 && val <= 1200) {
        veggieCount++;
      }
      // Green Schulweg (Question 2: Zu Fuß = 0, Rad = 0, E-Bike = 0.005)
      if (order === 2 && (val === 0 || val === 0.005)) {
        pedalCount++;
      }
      // Ökostrom (Question 33: 100% Ökostrom = -400)
      if (order === 33 && val === -400) {
        oekoCount++;
      }
      // Second Hand (Question 47: Often = -100, Sometimes = -30)
      if (order === 47 && (val === -100 || val === -30)) {
        secondHandCount++;
      }
      // No flights (Question 7: Gar nicht = 0)
      if (order === 7 && val === 0) {
        noFlightCount++;
      }
    });
  });

  const veggiePercent = Math.round((veggieCount / totalCompleted) * 100);
  const pedalPercent = Math.round((pedalCount / totalCompleted) * 100);
  const oekoPercent = Math.round((oekoCount / totalCompleted) * 100);
  const secondHandPercent = Math.round((secondHandCount / totalCompleted) * 100);
  const noFlightPercent = Math.round((noFlightCount / totalCompleted) * 100);

  const badges: Badge[] = [
    {
      id: 'veggie_heroes',
      title: 'Veggie-Helden',
      description: 'Mindestens 50% der Klasse ernähren sich vegetarisch oder vegan.',
      icon: '🥬',
      color: 'from-green-500 to-emerald-500',
      unlocked: veggiePercent >= 50,
      progress: veggiePercent,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'pedal_pioneers',
      title: 'Pedal-Pioniere',
      description: 'Mindestens 50% der Klasse nutzen das Fahrrad, gehen zu Fuß oder nutzen E-Scooter für den Schulweg.',
      icon: '🚲',
      color: 'from-blue-500 to-cyan-500',
      unlocked: pedalPercent >= 50,
      progress: pedalPercent,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'green_power',
      title: 'Ökostrom-Vorreiter',
      description: 'Mindestens 50% der Klasse beziehen zu Hause 100% Ökostrom.',
      icon: '⚡',
      color: 'from-amber-500 to-orange-500',
      unlocked: oekoPercent >= 50,
      progress: oekoPercent,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'second_hand',
      title: 'Second-Hand-Saver',
      description: 'Mindestens 50% der Klasse kaufen Kleidung bevorzugt Second-Hand.',
      icon: '👕',
      color: 'from-purple-500 to-pink-500',
      unlocked: secondHandPercent >= 50,
      progress: secondHandPercent,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'no_flights',
      title: 'Bodenständige Klasse',
      description: 'Mindestens 60% der Klasse sind im letzten Jahr nicht geflogen.',
      icon: '✈️',
      color: 'from-teal-500 to-emerald-500',
      unlocked: noFlightPercent >= 60,
      progress: noFlightPercent,
      target: 60,
      unit: '% der Klasse',
    },
    {
      id: 'co2_saver',
      title: 'CO₂-Sparer',
      description: 'Der Klassendurchschnitt liegt unter 8.4t CO₂/Jahr (20% unter DE-Schnitt).',
      icon: '🌱',
      color: 'from-emerald-500 to-teal-500',
      unlocked: classAverageCo2 > 0 && classAverageCo2 <= 8400,
      // Target is 8400 or lower. Scale progress between 10500 (0% progress) and 8400 (100% progress)
      progress: classAverageCo2 === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((10500 - classAverageCo2) / (10500 - 8400)) * 100))),
      target: 100,
      unit: 't CO₂',
    },
    {
      id: 'climate_champions',
      title: 'Klima-Champions',
      description: 'Hervorragender Klassendurchschnitt von unter 6.0t CO₂/Jahr.',
      icon: '🌟',
      color: 'from-yellow-400 to-amber-500',
      unlocked: classAverageCo2 > 0 && classAverageCo2 <= 6000,
      // Target is 6000 or lower. Scale progress between 10500 (0% progress) and 6000 (100% progress)
      progress: classAverageCo2 === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((10500 - classAverageCo2) / (10500 - 6000)) * 100))),
      target: 100,
      unit: 't CO₂',
    },
  ];

  return badges;
}

export function getEmptyBadges(): Badge[] {
  return [
    {
      id: 'veggie_heroes',
      title: 'Veggie-Helden',
      description: 'Mindestens 50% der Klasse ernähren sich vegetarisch oder vegan.',
      icon: '🥬',
      color: 'from-green-500 to-emerald-500',
      unlocked: false,
      progress: 0,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'pedal_pioneers',
      title: 'Pedal-Pioniere',
      description: 'Mindestens 50% der Klasse nutzen das Fahrrad, gehen zu Fuß oder nutzen E-Scooter für den Schulweg.',
      icon: '🚲',
      color: 'from-blue-500 to-cyan-500',
      unlocked: false,
      progress: 0,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'green_power',
      title: 'Ökostrom-Vorreiter',
      description: 'Mindestens 50% der Klasse beziehen zu Hause 100% Ökostrom.',
      icon: '⚡',
      color: 'from-amber-500 to-orange-500',
      unlocked: false,
      progress: 0,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'second_hand',
      title: 'Second-Hand-Saver',
      description: 'Mindestens 50% der Klasse kaufen Kleidung bevorzugt Second-Hand.',
      icon: '👕',
      color: 'from-purple-500 to-pink-500',
      unlocked: false,
      progress: 0,
      target: 50,
      unit: '% der Klasse',
    },
    {
      id: 'no_flights',
      title: 'Bodenständige Klasse',
      description: 'Mindestens 60% der Klasse sind im letzten Jahr nicht geflogen.',
      icon: '✈️',
      color: 'from-teal-500 to-emerald-500',
      unlocked: false,
      progress: 0,
      target: 60,
      unit: '% der Klasse',
    },
    {
      id: 'co2_saver',
      title: 'CO₂-Sparer',
      description: 'Der Klassendurchschnitt liegt unter 8.4t CO₂/Jahr (20% unter DE-Schnitt).',
      icon: '🌱',
      color: 'from-emerald-500 to-teal-500',
      unlocked: false,
      progress: 0,
      target: 100,
      unit: 't CO₂',
    },
    {
      id: 'climate_champions',
      title: 'Klima-Champions',
      description: 'Hervorragender Klassendurchschnitt von unter 6.0t CO₂/Jahr.',
      icon: '🌟',
      color: 'from-yellow-400 to-amber-500',
      unlocked: false,
      progress: 0,
      target: 100,
      unit: 't CO₂',
    },
  ];
}
