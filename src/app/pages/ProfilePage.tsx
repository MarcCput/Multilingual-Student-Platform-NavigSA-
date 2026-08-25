import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
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
  CreditCard,
  HelpCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('profile.title')}</h1>
          <p className="text-slate-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">JD</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">John Doe</h2>
                <p className="text-sm text-slate-600 mb-3">john.doe@email.com</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                    <CheckCircle className="w-3 h-3" />
                    {t('status.verified')}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
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
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <MessageSquare className="w-10 h-10 mb-3 opacity-90" />
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Contact our support team for assistance
              </p>
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue="John"
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue="Doe"
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        defaultValue="john.doe@email.com"
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        defaultValue="+27 123 456 7890"
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Country of Origin</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        defaultValue="Angola"
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                      >
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
                      <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        <Save className="w-4 h-4" />
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
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-green-900">Identity Verified</h4>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-sm text-green-700 mb-2">
                          Your identity has been verified on May 12, 2026
                        </p>
                        <div className="text-xs text-green-600">
                          Documents verified: Passport, Proof of Residence
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Two-Factor Authentication</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">Protect Your Account</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Add an extra layer of security with two-factor authentication
                          </p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Enable 2FA
                          </button>
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
                      {[
                        { label: 'Application updates', desc: 'Get notified about your application status' },
                        { label: 'Document verification', desc: 'Alerts when documents are verified or rejected' },
                        { label: 'New messages', desc: 'Notifications for new messages from providers' },
                        { label: 'Deadline reminders', desc: 'Reminders for upcoming application deadlines' },
                      ].map((item, index) => (
                        <label key={index} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                          <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-blue-600 rounded" />
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
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-green-900">WhatsApp Connected</h4>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-sm text-green-700 mb-3">
                            Receive instant updates via WhatsApp at +27 123 456 7890
                          </p>
                          <button className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm">
                            Manage Settings
                          </button>
                        </div>
                      </div>
                    </div>
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
                            {language === lang.code && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Study Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Field of Study</label>
                        <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                          <option>Computer Science</option>
                          <option>Engineering</option>
                          <option>Business & Management</option>
                          <option>Medicine & Health Sciences</option>
                          <option>Arts & Humanities</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Intended Start Year</label>
                        <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                          <option>2026</option>
                          <option>2027</option>
                          <option>2028</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
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
