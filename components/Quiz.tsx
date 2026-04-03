import { useState } from 'react';
import { SportType } from '../types/gym';

interface QuizOption {
  label: string;
  scores: Partial<Record<SportType, number>>;
}

interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    text: 'What is your main goal?',
    options: [
      { label: '🛡️  Self-defense', scores: { BJJ: 2, 'Muay Thai': 2, Karate: 1 } },
      { label: '🏆  Competition', scores: { Boxing: 2, MMA: 2, BJJ: 1 } },
      { label: '💪  Fitness & weight loss', scores: { Boxing: 2, 'Muay Thai': 2, Karate: 1 } },
      { label: '🧘  Discipline & stress relief', scores: { Karate: 2, BJJ: 1, 'Muay Thai': 1 } },
    ],
  },
  {
    text: 'Do you prefer striking or grappling?',
    options: [
      { label: '👊  Striking — punching and kicking', scores: { Boxing: 2, 'Muay Thai': 2, Karate: 1 } },
      { label: '🤼  Grappling — holds and takedowns', scores: { BJJ: 3, MMA: 1 } },
      { label: '🤷  Both, or not sure yet', scores: { MMA: 2, BJJ: 1, 'Muay Thai': 1 } },
    ],
  },
  {
    text: 'What is your experience level?',
    options: [
      { label: '🌱  Complete beginner', scores: { Karate: 2, BJJ: 1 } },
      { label: '🏃  Other sports, but no martial arts', scores: { Boxing: 1, 'Muay Thai': 1, BJJ: 1 } },
      { label: '⚡  Martial arts or combat sports experience', scores: { MMA: 2, Boxing: 1 } },
    ],
  },
  {
    text: 'How intense do you want training?',
    options: [
      { label: '🌊  Light and technical — learn the art', scores: { Karate: 2, BJJ: 2 } },
      { label: '🔥  Moderate — good workout, some challenge', scores: { BJJ: 1, 'Muay Thai': 1, Boxing: 1 } },
      { label: '💥  Intense — push me hard', scores: { Boxing: 2, MMA: 2, 'Muay Thai': 1 } },
    ],
  },
  {
    text: 'What environment suits you?',
    options: [
      { label: '🎯  Calm and technical — chess-like', scores: { BJJ: 2, Karate: 2 } },
      { label: '🎶  Energetic and social — team spirit', scores: { Boxing: 1, 'Muay Thai': 1, MMA: 1 } },
      { label: '🥊  Competitive — I want to test myself', scores: { MMA: 2, Boxing: 2 } },
    ],
  },
];

const SPORT_DESCRIPTIONS: Record<SportType, string> = {
  Karate:      'Traditional striking art. Discipline, technique, and self-improvement.',
  BJJ:         'Ground-based grappling. Leverage over strength — ideal for self-defense.',
  Boxing:      'The sweet science. Exceptional cardio and technical striking.',
  'Muay Thai': '8 limbs: punches, kicks, elbows, knees. High-energy and effective.',
  MMA:         'Mixed Martial Arts. The complete fighter\'s path.',
};

interface QuizProps {
  onComplete: (sports: string[]) => void;
  onClose: () => void;
}

export default function Quiz({ onComplete, onClose }: QuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizOption[]>([]);
  const [result, setResult] = useState<SportType[] | null>(null);

  const handleAnswer = (option: QuizOption) => {
    const newAnswers = [...answers, option];
    if (step < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      const totals: Record<SportType, number> = { Karate: 0, BJJ: 0, Boxing: 0, 'Muay Thai': 0, MMA: 0 };
      for (const a of newAnswers) {
        for (const [sport, pts] of Object.entries(a.scores)) {
          totals[sport as SportType] += pts ?? 0;
        }
      }
      const sorted = (Object.entries(totals) as [SportType, number][])
        .sort(([, a], [, b]) => b - a)
        .filter(([, score]) => score > 0)
        .slice(0, 2)
        .map(([sport]) => sport);
      setResult(sorted);
    }
  };

  const handleBack = () => { setAnswers(answers.slice(0, -1)); setStep(step - 1); };

  const progress = result ? 100 : (step / QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="w-full max-w-lg flex flex-col overflow-hidden"
        style={{
          background: '#141414',
          border: '1px solid #2A2A2A',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.9)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink-100 uppercase tracking-widest">
                Find Your Style
              </h2>
              <p className="text-xs text-ink-600 mt-0.5">Discover your ideal martial art</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full text-ink-400 hover:text-ink-200 transition-colors"
              style={{ background: '#1E1E1E' }}
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full rounded-full h-1" style={{ background: '#1E1E1E' }}>
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#C96A3D' }}
            />
          </div>
          {!result && (
            <p className="text-xs text-ink-600 mt-2">
              Question {step + 1} of {QUESTIONS.length}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          {!result ? (
            <>
              <p className="font-display font-semibold text-base text-ink-100 uppercase tracking-wide mb-4">
                {QUESTIONS[step].text}
              </p>
              <div className="space-y-2">
                {QUESTIONS[step].options.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleAnswer(option)}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-sm text-ink-200 transition-all min-h-[52px]"
                    style={{
                      background: '#1E1E1E',
                      border: '1px solid #2A2A2A',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,106,61,0.5)';
                      (e.currentTarget as HTMLElement).style.color = '#F0EDE8';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#2A2A2A';
                      (e.currentTarget as HTMLElement).style.color = '#C8C4BE';
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button onClick={handleBack} className="mt-4 text-xs text-ink-600 hover:text-ink-400 underline">
                  ← Back
                </button>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🥋</div>
                <p className="text-xs text-ink-600 uppercase tracking-widest mb-2">Recommended for you</p>
                <p className="font-display font-bold text-2xl uppercase tracking-wide" style={{ color: '#C96A3D' }}>
                  {result.join(' + ')}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {result.map((sport) => (
                  <div
                    key={sport}
                    className="rounded-xl px-4 py-3"
                    style={{ background: '#1E1E1E', border: '1px solid rgba(201,106,61,0.2)' }}
                  >
                    <p className="font-display font-semibold text-sm text-ink-100 uppercase tracking-wide mb-0.5">
                      {sport}
                    </p>
                    <p className="text-xs text-ink-400">{SPORT_DESCRIPTIONS[sport]}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onComplete(result)}
                className="w-full font-display font-semibold text-sm py-4 rounded-xl transition-all uppercase tracking-widest mb-2"
                style={{ background: '#C96A3D', color: '#0B0B0B' }}
              >
                Show me matching gyms →
              </button>
              <button onClick={onClose} className="w-full py-2 text-xs text-ink-600 hover:text-ink-400">
                Close without filtering
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
