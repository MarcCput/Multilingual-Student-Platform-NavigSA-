import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type { NotificationPrefs } from '../../lib/database.types';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  CheckCircle,
  Edit,
  Save,
  X,
  MessageSquare,
  Bell,
  Lock,
  AlertCircle,
  Loader2,
  LogOut,
} from 'lucide-react';

const NOTIFICATION_FIELDS: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
  {
    key: 'application_updates',
    label: 'Application updates',
    desc: 'Get notified about your application status',
  },
  {
    key: 'document_verification',
    label: 'Document verification',
    desc: 'Alerts when documents are verified or rejected',
  },
  {
    key: 'new_messages',
    label: 'New messages',
    desc: 'Notifications for new messages from providers',
  },
  {
    key: 'deadline_reminders',
    label: 'Deadline reminders',
    desc: 'Reminders for upcoming application deadlines',
  },
];

export const ProfilePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country_of_origin: '',
    field_of_study: '',
    intended_start_year: new Date().getFullYear(),
  });

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    application_updates: true,
    document_verification: true,
    new_messages: true,
    deadline_reminders: true,
  });

  const [passwords, setPasswords] = useState({ next: '', confirm: '' });

  useEffect(() => {
    if (!profile) return;
    setForm({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone: profile.phone ?? '',
      country_of_origin: profile.country_of_origin ?? '',
      field_of_study: profile.field_of_study ?? '',
      intended_start_year: profile.intended_start_year ?? new Date().getFullYear(),
    });
    if (profile.notification_prefs) setPrefs(profile.notification_prefs);
  }, [profile]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
  ];

  const save = async (patch: Record<string, unknown>, successText: string) => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(user.id, patch);
      await refreshProfile();
      setMessage({ kind: 'ok', text: successText });
    } catch (err) {
      setMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Could not save your changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    await save(form, 'Profile saved.');
    setIsEditing(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwords.next.length < 6) {
      setMessage({ kind: 'err', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setMessage({ kind: 'err', text: 'The two passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.next });
      if (error) throw new Error(error.message);
      setPasswords({ next: '', confirm: '' });
      setMessage({ kind: 'ok', text: 'Password updated.' });
    } catch (err) {
      setMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Could not update the password.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const initials =
    [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?';

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Your profile';

  const isVerified = profile?.verification_status === 'verified';

  const inputClass =
    'w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('profile.title')}</h1>
          <p className="text-slate-600">Manage your account settings and preferences</p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl p-4 flex items-start gap-2 border ${
              message.kind === 'ok'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.kind === 'ok' ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">{initials}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{fullName}</h2>
                <p className="text-sm text-slate-600 mb-3 break-all">{user?.email}</p>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      isVerified
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {t(`status.${profile?.verification_status ?? 'pending'}`)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMessage(null);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <MessageSquare className="w-10 h-10 mb-3 opacity-90" />
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4">Contact our support team for assistance</p>
              <button className="w-full bg-white text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm">
                Contact Support
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={user?.email ?? ''}
                        disabled
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Your sign-in email is managed by Supabase Auth and can&apos;t be changed here.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`${inputClass} pl-10`}
                        placeholder="+27 123 456 7890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Country of Origin
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={form.country_of_origin}
                        onChange={(e) => setForm({ ...form, country_of_origin: e.target.value })}
                        disabled={!isEditing}
                        className={`${inputClass} pl-10`}
                      >
                        <option value="">Select your country</option>
                        <option>Angola</option>
                        <option>Mozambique</option>
                        <option>Nigeria</option>
                        <option>Zimbabwe</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Identity Verification</h3>
                  {isVerified ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-green-900">Identity Verified</h4>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          {profile?.verified_at && (
                            <p className="text-sm text-green-700">
                              Your identity was verified on{' '}
                              {new Date(profile.verified_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-900 mb-1">
                            Verification {profile?.verification_status ?? 'pending'}
                          </h4>
                          <p className="text-sm text-amber-700">
                            Upload your identity documents from the Documents page. A reviewer will
                            mark your profile verified once they check them.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                </div>

                <div className="p-6 space-y-6">
                  <form onSubmit={handleUpdatePassword}>
                    <h3 className="font-bold text-slate-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwords.next}
                          onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                          autoComplete="new-password"
                          className={inputClass}
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          autoComplete="new-password"
                          className={inputClass}
                          placeholder="••••••••"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        You&apos;re already signed in, so Supabase doesn&apos;t ask for your current
                        password here.
                      </p>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Update Password
                      </button>
                    </div>
                  </form>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Two-Factor Authentication</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">Protect Your Account</h4>
                          <p className="text-sm text-blue-700">
                            Supabase supports TOTP two-factor auth. Enable the MFA provider in your
                            project&apos;s Auth settings, then wire up the enrollment flow.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {NOTIFICATION_FIELDS.map((item) => (
                        <label
                          key={item.key}
                          className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={prefs[item.key]}
                            onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{item.label}</div>
                            <div className="text-sm text-slate-600">{item.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">WhatsApp Notifications</h3>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 mb-2">WhatsApp Updates</h4>
                          <p className="text-sm text-green-700">
                            {profile?.phone
                              ? `We'll reach you on ${profile.phone}. Update it on the Profile tab.`
                              : 'Add a phone number on the Profile tab to receive WhatsApp updates.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <button
                      onClick={() => save({ notification_prefs: prefs }, 'Notification preferences saved.')}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Language</label>
                    <div className="grid grid-cols-2 gap-3">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code as any)}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            language === lang.code
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900">{lang.name}</span>
                            {language === lang.code && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Study Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Field of Study
                        </label>
                        <select
                          value={form.field_of_study}
                          onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Intended Start Year
                        </label>
                        <select
                          value={form.intended_start_year}
                          onChange={(e) =>
                            setForm({ ...form, intended_start_year: Number(e.target.value) })
                          }
                          className={inputClass}
                        >
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                          <option value={2028}>2028</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <button
                      onClick={() =>
                        save(
                          {
                            field_of_study: form.field_of_study,
                            intended_start_year: form.intended_start_year,
                            preferred_language: language,
                          },
                          'Preferences saved.',
                        )
                      }
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
