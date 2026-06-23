import QuizClient from './quiz-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableValidation: true,
};

export default function Page() {
  return <QuizClient />;
}
