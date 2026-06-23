import ImpressumClient from './impressum-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableValidation: true,
};

export default function ImpressumPage() {
  return <ImpressumClient />;
}
