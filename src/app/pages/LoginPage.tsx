import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { session, profile, loading: authLoading, signIn, signUp, resetPassword } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip the form. Send first-time users through onboarding.
  useEffect(() => {
    if (authLoading || !session) return;
    navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding', { replace: true });
  }, [authLoading, session, profile?.onboarding_completed, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured yet. Add your project URL and anon key to .env.local, then restart the dev server.',
      );
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        // The effect above redirects once the session lands.
      } else {
        const { needsEmailConfirmation } = await signUp(email, password);
        if (needsEmailConfirmation) {
          setNotice(`We sent a confirmation link to ${email}. Click it, then sign in.`);
          setIsLogin(true);
          setPassword('');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);
    if (!email) {
      setError('Enter your email address first, then click Forgot Password.');
      return;
    }
    try {
      await resetPassword(email);
      setNotice(`If an account exists for ${email}, a reset link is on its way.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset email.');
    }
  };

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'pt', name: 'PT' },
    { code: 'fr', name: 'FR' },
    { code: 'es', name: 'ES' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              language === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-white/50 text-slate-700 hover:bg-white'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('app.name')}</h1>
          <p className="text-slate-600">{t('app.tagline')}</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Supabase not connected</div>
              Copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to{' '}
              <code className="bg-amber-100 px-1 rounded">.env.local</code>, paste your project
              URL and anon key, then restart the dev server.
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isLogin ? t('login.title') : t('login.signup')}
          </h2>
          <p className="text-slate-600 mb-6">{t('login.subtitle')}</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {notice && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-green-700">{notice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="student@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-slate-500 mt-2">At least 6 characters.</p>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('login.forgot')}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? t('login.signin') : t('login.signup')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setNotice(null);
              }}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {isLogin ? (
                <>
                  Don&apos;t have an account?{' '}
                  <span className="text-blue-600 font-medium">{t('login.signup')}</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="text-blue-600 font-medium">{t('login.signin')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Verified Providers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
