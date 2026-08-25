import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Lock, Globe } from 'lucide-react';

export const LoginPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
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

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isLogin ? t('login.title') : t('login.signup')}
          </h2>
          <p className="text-slate-600 mb-6">{t('login.subtitle')}</p>

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
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('login.forgot')}
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
            >
              {isLogin ? t('login.signin') : t('login.signup')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-blue-600 font-medium">{t('login.signup')}</span></>
              ) : (
                <>Already have an account? <span className="text-blue-600 font-medium">{t('login.signin')}</span></>
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
