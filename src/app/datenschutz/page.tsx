import DatenschutzClient from './datenschutz-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableValidation: true,
};

export default function DatenschutzPage() {
  return <DatenschutzClient />;
}
