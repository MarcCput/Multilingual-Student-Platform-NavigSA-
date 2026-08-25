import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ExternalLink,
  MoreVertical,
  TrendingUp
} from 'lucide-react';

export const ApplicationsPage = () => {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState('all');

  const applications = [
    {
      id: 1,
      university: 'University of Cape Town',
      program: 'BSc Computer Science',
      status: 'in-progress',
      progress: 65,
      deadline: '2026-08-15',
      submittedDate: null,
      requirements: {
        total: 8,
        completed: 5,
      },
      nextStep: 'Upload English proficiency certificate',
    },
    {
      id: 2,
      university: 'Stellenbosch University',
      program: 'BCom Business Management',
      status: 'pending',
      progress: 30,
      deadline: '2026-09-01',
      submittedDate: null,
      requirements: {
        total: 10,
        completed: 3,
      },
      nextStep: 'Complete online application form',
    },
    {
      id: 3,
      university: 'University of Witwatersrand',
      program: 'BA Economics',
      status: 'completed',
      progress: 100,
      deadline: '2026-07-30',
      submittedDate: '2026-05-10',
      requirements: {
        total: 9,
        completed: 9,
      },
      nextStep: 'Awaiting university response',
    },
    {
      id: 4,
      university: 'University of Pretoria',
      program: 'BEng Mechanical Engineering',
      status: 'pending',
      progress: 15,
      deadline: '2026-08-30',
      submittedDate: null,
      requirements: {
        total: 12,
        completed: 2,
      },
      nextStep: 'Gather required documents',
    },
  ];

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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('applications.title')}</h1>
            <p className="text-slate-600">Track and manage your university applications</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Application</span>
          </button>
        </div>

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
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(applications.reduce((sum, app) => sum + app.progress, 0) / applications.length)}%
            </div>
          </div>
        </div>

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
                  {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredApplications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 text-lg">{app.university}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {t(`status.${app.status === 'in-progress' ? 'inProgress' : app.status}`)}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{app.program}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-xs text-slate-500">Deadline</div>
                          <div className="font-medium text-slate-900">{new Date(app.deadline).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-xs text-slate-500">Requirements</div>
                          <div className="font-medium text-slate-900">{app.requirements.completed}/{app.requirements.total}</div>
                        </div>
                      </div>
                      {app.submittedDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-xs text-slate-500">Submitted</div>
                            <div className="font-medium text-slate-900">{new Date(app.submittedDate).toLocaleDateString()}</div>
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

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-blue-900 mb-1">Next Step</div>
                          <div className="text-sm text-blue-700">{app.nextStep}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <ExternalLink className="w-5 h-5 text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or create a new application</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
