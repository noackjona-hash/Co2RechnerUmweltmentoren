import LoginClient from './login-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableValidation: true,
};

export default function LoginPage() {
  return <LoginClient />;
}
