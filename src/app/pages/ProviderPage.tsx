import { useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getMyProvider, registerProvider, uploadAccreditation } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { Provider, ServiceCategory } from '../../lib/database.types';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'translation', label: 'Translation' },
  { value: 'visa', label: 'Visa support' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'legal', label: 'Legal services' },
];

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png'];

export const ProviderPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    business_name: '',
    registration_number: '',
    contact_email: '',
    contact_phone: '',
    category: 'translation' as ServiceCategory,
    description: '',
    location: '',
  });

  const {
    data: provider,
    loading,
    reload,
  } = useAsyncData<Provider | null>(
    () => (user ? getMyProvider(user.id) : Promise.resolve(null)),
    null,
    [user?.id],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (file) {
      if (!ACCEPTED.includes(file.type)) {
        setError('Accreditation must be a PDF, JPG or PNG.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setError('That file is larger than 10MB.');
        return;
      }
    }

    setSaving(true);
    try {
      let accreditation_path: string | null = null;
      if (file) accreditation_path = await uploadAccreditation(user.id, file);

      await registerProvider(user.id, {
        business_name: form.business_name,
        registration_number: form.registration_number || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        category: form.category,
        description: form.description || null,
        location: form.location || null,
        accreditation_path,
      });
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your registration.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // --- already registered: show the current standing -----------------------
  if (provider) {
    const tone =
      provider.status === 'verified'
        ? { bg: 'bg-green-50', bd: 'border-green-200', tx: 'text-green-800', Icon: ShieldCheck }
        : provider.status === 'rejected'
        ? { bg: 'bg-red-50', bd: 'border-red-200', tx: 'text-red-800', Icon: XCircle }
        : { bg: 'bg-amber-50', bd: 'border-amber-200', tx: 'text-amber-800', Icon: Clock };

    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('nav.provider')}</h1>
          <p className="text-slate-600 mb-8">Your service provider registration</p>

          <div className={`rounded-xl border p-6 mb-6 ${tone.bg} ${tone.bd}`}>
            <div className="flex items-start gap-3">
              <tone.Icon className={`w-6 h-6 flex-shrink-0 ${tone.tx}`} />
              <div>
                <h2 className={`font-bold mb-1 ${tone.tx}`}>
                  {provider.status === 'verified'
                    ? 'Verified provider'
                    : provider.status === 'rejected'
                    ? 'Registration not approved'
                    : 'Pending verification'}
                </h2>
                <p className={`text-sm ${tone.tx}`}>
                  {provider.status === 'verified'
                    ? 'Your services are visible in the marketplace and students can book them.'
                    : provider.status === 'rejected'
                    ? provider.rejection_reason ?? 'An administrator did not approve this registration.'
                    : 'An administrator is reviewing your details. Your listing stays hidden from students until it is approved.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Registered details</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Business name', provider.business_name],
                ['Category', provider.category],
                ['Registration number', provider.registration_number],
                ['Location', provider.location],
                ['Contact email', provider.contact_email],
                ['Contact phone', provider.contact_phone],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-slate-900 font-medium">{v || '—'}</dd>
                </div>
              ))}
            </dl>
            {provider.description && (
              <>
                <dt className="text-slate-500 text-sm mt-4">Description</dt>
                <dd className="text-slate-700 text-sm mt-1">{provider.description}</dd>
              </>
            )}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm text-slate-600">
              {provider.accreditation_path ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Accreditation document on file
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  No accreditation document was uploaded
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- registration form ----------------------------------------------------
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Register as a service provider</h1>
        <p className="text-slate-600 mb-8">
          List your services to international students applying to South African universities.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Every provider is checked before being listed. Your registration starts as
            <span className="font-medium"> pending verification</span> and stays hidden from
            students until an administrator approves it.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business name
              </label>
              <input
                required
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className={inputClass}
                placeholder="TranslateRight SA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company registration number
              </label>
              <input
                value={form.registration_number}
                onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                className={inputClass}
                placeholder="2019/123456/07"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ServiceCategory })
                }
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
                placeholder="Cape Town"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact email
              </label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className={inputClass}
                placeholder="hello@example.co.za"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact phone
              </label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                className={inputClass}
                placeholder="+27 21 000 0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              What do you offer?
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="Describe your service, turnaround times and who it is for."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Accreditation document
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {file ? file.name : 'Upload your accreditation or registration certificate'}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, JPG or PNG, up to 10MB</p>
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Stored privately. Only you and the reviewing administrator can open it.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Building2 className="w-5 h-5" />
            )}
            Submit registration
          </button>
        </form>
      </div>
    </div>
  );
};
