import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../../lib/api';
import { User, Shield, Settings, Check, Upload, Camera, AlertCircle, Loader2 } from 'lucide-react';

const UNIVERSITIES = [
  'University of Cape Town',
  'University of Witwatersrand',
  'Stellenbosch University',
  'University of Pretoria',
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
] as const;

export const OnboardingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    country_of_origin: '',
    phone: '',
    preferred_language: 'en' as 'en' | 'pt' | 'fr' | 'es',
    id_document_type: 'Passport',
    id_document_number: '',
    field_of_study: '',
    preferred_universities: [] as string[],
    intended_start_year: new Date().getFullYear(),
  });

  // Seed the form from the profile row once it loads, so returning here
  // shows what was already saved instead of blank fields.
  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      first_name: profile.first_name ?? prev.first_name,
      last_name: profile.last_name ?? prev.last_name,
      country_of_origin: profile.country_of_origin ?? prev.country_of_origin,
      phone: profile.phone ?? prev.phone,
      preferred_language: profile.preferred_language ?? prev.preferred_language,
      id_document_type: profile.id_document_type ?? prev.id_document_type,
      id_document_number: profile.id_document_number ?? prev.id_document_number,
      field_of_study: profile.field_of_study ?? prev.field_of_study,
      preferred_universities: profile.preferred_universities?.length
        ? profile.preferred_universities
        : prev.preferred_universities,
      intended_start_year: profile.intended_start_year ?? prev.intended_start_year,
    }));
  }, [profile]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleUniversity = (uni: string) =>
    setForm((prev) => ({
      ...prev,
      preferred_universities: prev.preferred_universities.includes(uni)
        ? prev.preferred_universities.filter((u) => u !== uni)
        : [...prev.preferred_universities, uni],
    }));

  const steps = [
    { number: 1, label: t('onboarding.step1'), icon: User },
    { number: 2, label: t('onboarding.step2'), icon: Shield },
    { number: 3, label: t('onboarding.step3'), icon: Settings },
  ];

  const handleNext = async () => {
    setError(null);

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { ...form, onboarding_completed: true });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('onboarding.welcome')}</h1>
          <p className="text-slate-600">Let&apos;s set up your profile in a few simple steps</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span
                      className={`mt-2 text-xs sm:text-sm text-center ${
                        isCurrent ? 'text-blue-700 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => set('first_name', e.target.value)}
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => set('last_name', e.target.value)}
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Country of Origin</label>
                <select
                  value={form.country_of_origin}
                  onChange={(e) => set('country_of_origin', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select your country</option>
                  <option>Angola</option>
                  <option>Mozambique</option>
                  <option>Nigeria</option>
                  <option>Zimbabwe</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={inputClass}
                  placeholder="+27 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Language</label>
                <select
                  value={form.preferred_language}
                  onChange={(e) => set('preferred_language', e.target.value as typeof form.preferred_language)}
                  className={inputClass}
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Identity Verification</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Why verify?</h3>
                    <p className="text-sm text-blue-700">
                      Verification helps us ensure secure access to services and builds trust with providers.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                <select
                  value={form.id_document_type}
                  onChange={(e) => set('id_document_type', e.target.value)}
                  className={inputClass}
                >
                  <option>Passport</option>
                  <option>National ID</option>
                  <option>Student ID</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Number</label>
                <input
                  type="text"
                  value={form.id_document_number}
                  onChange={(e) => set('id_document_number', e.target.value)}
                  className={inputClass}
                  placeholder="Enter document number"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                Upload your ID scans from the{' '}
                <span className="font-medium text-slate-900">Documents</span> page once setup is
                done — they go straight into your private storage bucket.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Upload Front</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Upload Back</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center opacity-60">
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Take Selfie for Verification</p>
                <p className="text-xs text-slate-500 mt-1">Look straight at the camera</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Study Preferences</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Intended Field of Study</label>
                <select
                  value={form.field_of_study}
                  onChange={(e) => set('field_of_study', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select field</option>
                  <option>Engineering</option>
                  <option>Business &amp; Management</option>
                  <option>Medicine &amp; Health Sciences</option>
                  <option>Arts &amp; Humanities</option>
                  <option>Science &amp; Technology</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Universities</label>
                <div className="space-y-2">
                  {UNIVERSITIES.map((uni) => (
                    <label
                      key={uni}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.preferred_universities.includes(uni)}
                        onChange={() => toggleUniversity(uni)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-slate-700">{uni}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Intended Start Year</label>
                <select
                  value={form.intended_start_year}
                  onChange={(e) => set('intended_start_year', Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                  <h3 className="font-medium text-slate-900">You&apos;re all set!</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Click complete to save your profile and access your personalized dashboard.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              className={`px-6 py-2 rounded-xl transition-colors ${
                currentStep === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              disabled={currentStep === 1}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {currentStep === 3 ? t('onboarding.complete') : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
