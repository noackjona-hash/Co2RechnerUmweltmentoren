import HomeClient from './home-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableValidation: true,
};

export default function HomePage() {
  return <HomeClient />;
}
