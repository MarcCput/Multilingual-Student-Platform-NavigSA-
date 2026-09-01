import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';
import { listApplications, listDocuments, listServices } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { Application, DocumentWithApplication, Service } from '../../lib/database.types';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  MessageSquare,
  Star,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';

export const DashboardPage = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const { data: applications, loading: appsLoading } = useAsyncData<Application[]>(
    () => (user ? listApplications(user.id) : Promise.resolve([])),
    [],
    [user?.id],
  );

  const { data: documents, loading: docsLoading } = useAsyncData<DocumentWithApplication[]>(
    () => (user ? listDocuments(user.id) : Promise.resolve([])),
    [],
    [user?.id],
  );

  const { data: services } = useAsyncData<Service[]>(listServices, [], []);

  const inProgress = applications.filter((a) => a.status === 'in-progress');
  const completed = applications.filter((a) => a.status === 'completed');
  const verifiedDocs = documents.filter((d) => d.status === 'verified');
  const avgProgress = applications.length
    ? Math.round(applications.reduce((sum, a) => sum + a.progress, 0) / applications.length)
    : 0;

  const recentApplications = applications.slice(0, 3);
  const recentDocuments = documents.slice(0, 3);
  const recommendedServices = services.slice(0, 3);

  const firstName = profile?.first_name?.trim();
  const greeting = firstName ? `${t('dashboard.welcome')}, ${firstName}!` : t('dashboard.welcome');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{greeting}</h1>
          <p className="text-slate-600">Track your applications and explore helpful services</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Total Applications</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{applications.length}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{completed.length} completed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">In Progress</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{inProgress.length}</div>
            <div className="text-xs text-slate-500 mt-1">{avgProgress}% avg progress</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Documents</span>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
            <div className="text-xs text-green-600 mt-1">{verifiedDocs.length} verified</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Services</span>
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{services.length}</div>
            <div className="text-xs text-blue-600 mt-1">available to book</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">{t('dashboard.applications')}</h2>
                  <Link
                    to="/applications"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {appsLoading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-600 mb-4">You have no applications yet.</p>
                  <Link
                    to="/applications"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create your first application
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1">{app.university}</h3>
                          <p className="text-sm text-slate-600">{app.program}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                            app.status,
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          {t(`status.${app.status === 'in-progress' ? 'inProgress' : app.status}`)}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium text-slate-900">{app.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              app.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${app.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {app.deadline && (
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Deadline: {new Date(app.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">{t('dashboard.services')}</h2>
              </div>

              <div className="divide-y divide-slate-200">
                {recommendedServices.map((service) => (
                  <div key={service.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{service.name}</h3>
                          {service.verified && <Shield className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{service.provider}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-slate-900">
                              {service.rating}
                            </span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-sm font-medium text-blue-700">{service.price}</span>
                        </div>
                      </div>
                      <Link
                        to="/marketplace"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
                {recommendedServices.length === 0 && (
                  <div className="p-12 text-center text-slate-600">
                    No services in the catalogue yet — run the seed migration to add them.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <MessageSquare className="w-10 h-10 mb-4 opacity-90" />
              <h3 className="text-lg font-bold mb-2">{t('whatsapp.connect')}</h3>
              <p className="text-sm text-blue-100 mb-4">
                Get instant updates and support via WhatsApp
              </p>
              <button className="w-full bg-white text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Connect Now
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">{t('dashboard.documents')}</h2>
              </div>

              {docsLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              ) : recentDocuments.length === 0 ? (
                <div className="p-6 text-sm text-slate-600 text-center">No documents yet.</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 truncate pr-2">
                          {doc.name}
                        </span>
                        {doc.status === 'verified' ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 border-t border-slate-200">
                <Link
                  to="/documents"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                >
                  View all documents
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {profile?.verification_status === 'verified' ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <Shield className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Profile Verified</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Your identity has been verified. This helps build trust with service providers.
                </p>
                {profile.verified_at && (
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified on {new Date(profile.verified_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                <Shield className="w-8 h-8 text-amber-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Verification Pending</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Upload your identity documents so we can verify your profile.
                </p>
                <Link
                  to="/documents"
                  className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  Upload documents
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
