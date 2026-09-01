import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { createApplication, deleteApplication, listApplications } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { Application } from '../../lib/database.types';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';

export const ApplicationsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    university: '',
    program: '',
    deadline: '',
    requirements_total: 8,
    next_step: '',
  });

  const {
    data: applications,
    loading,
    error,
    reload,
  } = useAsyncData<Application[]>(
    () => (user ? listApplications(user.id) : Promise.resolve([])),
    [],
    [user?.id],
  );

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

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const avgProgress = applications.length
    ? Math.round(applications.reduce((sum, app) => sum + app.progress, 0) / applications.length)
    : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setSaving(true);
    try {
      await createApplication(user.id, {
        university: draft.university,
        program: draft.program,
        deadline: draft.deadline || null,
        requirements_total: draft.requirements_total,
        next_step: draft.next_step || null,
      });
      setDraft({ university: '', program: '', deadline: '', requirements_total: 8, next_step: '' });
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create the application.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete the application.');
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('applications.title')}</h1>
            <p className="text-slate-600">Track and manage your university applications</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="hidden sm:inline">{showForm ? 'Cancel' : 'New Application'}</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4"
          >
            <h2 className="font-bold text-slate-900">New Application</h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">University</label>
                <input
                  required
                  value={draft.university}
                  onChange={(e) => setDraft({ ...draft, university: e.target.value })}
                  className={inputClass}
                  placeholder="University of Cape Town"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Program</label>
                <input
                  required
                  value={draft.program}
                  onChange={(e) => setDraft({ ...draft, program: e.target.value })}
                  className={inputClass}
                  placeholder="BSc Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                <input
                  type="date"
                  value={draft.deadline}
                  onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Requirements
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.requirements_total}
                  onChange={(e) =>
                    setDraft({ ...draft, requirements_total: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Next Step</label>
              <input
                value={draft.next_step}
                onChange={(e) => setDraft({ ...draft, next_step: e.target.value })}
                className={inputClass}
                placeholder="Gather required documents"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Application
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-slate-900">{applications.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-blue-700">
              {applications.filter((a) => a.status === 'in-progress').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-700">
              {applications.filter((a) => a.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Avg Progress</div>
            <div className="text-2xl font-bold text-slate-900">{avgProgress}%</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-4 border-b border-slate-200">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'in-progress', 'pending', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'in-progress'
                    ? 'In Progress'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredApplications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{app.university}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                            app.status,
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          {t(`status.${app.status === 'in-progress' ? 'inProgress' : app.status}`)}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{app.program}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {app.deadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-500">Deadline</div>
                              <div className="font-medium text-slate-900">
                                {new Date(app.deadline).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-xs text-slate-500">Requirements</div>
                            <div className="font-medium text-slate-900">
                              {app.requirements_completed}/{app.requirements_total}
                            </div>
                          </div>
                        </div>
                        {app.submitted_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <div>
                              <div className="text-xs text-slate-500">Submitted</div>
                              <div className="font-medium text-slate-900">
                                {new Date(app.submitted_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600">Overall Progress</span>
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

                      {app.next_step && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-xs font-medium text-blue-900 mb-1">Next Step</div>
                              <div className="text-sm text-blue-700">{app.next_step}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleDelete(app.id)}
                        title="Delete application"
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-600 mb-6">
              {applications.length === 0
                ? 'Create your first application to start tracking your journey'
                : 'Try adjusting your filters'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
