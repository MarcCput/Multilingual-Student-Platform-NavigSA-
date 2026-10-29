import { useState } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { NotificationRow, NotificationType } from '../../lib/database.types';
import {
  Bell,
  BellOff,
  CalendarClock,
  CheckCheck,
  FileText,
  Loader2,
  Shield,
  Ticket,
  Info,
} from 'lucide-react';

const ICON: Record<NotificationType, typeof Bell> = {
  application_status: FileText,
  booking: Ticket,
  deadline_reminder: CalendarClock,
  provider_status: Shield,
  document_status: FileText,
  system: Info,
};

const TINT: Record<NotificationType, string> = {
  application_status: 'bg-blue-50 text-blue-600',
  booking: 'bg-indigo-50 text-indigo-600',
  deadline_reminder: 'bg-amber-50 text-amber-600',
  provider_status: 'bg-green-50 text-green-600',
  document_status: 'bg-slate-100 text-slate-600',
  system: 'bg-slate-100 text-slate-600',
};

const FILTERS = ['all', 'unread', 'deadline_reminder', 'booking', 'application_status'] as const;

export const NotificationsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload, setData } = useAsyncData<NotificationRow[]>(
    () => (user ? listNotifications(user.id) : Promise.resolve([])),
    [],
    [user?.id],
  );

  const unread = data.filter((n) => !n.read_at);

  const shown = data.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read_at;
    return n.type === filter;
  });

  const handleRead = async (n: NotificationRow) => {
    if (n.read_at) return;
    // optimistic: the row greys out immediately, then we persist
    setData(
      data.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)),
    );
    try {
      await markNotificationRead(n.id);
    } catch {
      reload();
    }
  };

  const handleReadAll = async () => {
    if (!user || unread.length === 0) return;
    setBusy(true);
    try {
      await markAllNotificationsRead(user.id);
      reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('nav.notifications')}</h1>
            <p className="text-slate-600">
              {unread.length > 0
                ? `${unread.length} unread`
                : 'You are up to date'}
            </p>
          </div>
          {unread.length > 0 && (
            <button
              onClick={handleReadAll}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f === 'all'
                ? 'All'
                : f === 'unread'
                ? `Unread${unread.length ? ` (${unread.length})` : ''}`
                : f === 'deadline_reminder'
                ? 'Deadlines'
                : f === 'booking'
                ? 'Bookings'
                : 'Applications'}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : shown.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BellOff className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nothing here</h3>
              <p className="text-slate-600">
                {data.length === 0
                  ? 'Updates about your applications, documents and bookings will appear here.'
                  : 'No notifications match this filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {shown.map((n) => {
                const Icon = ICON[n.type] ?? Bell;
                const body = (
                  <div
                    className={`p-5 flex items-start gap-4 transition-colors ${
                      n.read_at ? 'bg-white' : 'bg-blue-50/40'
                    } hover:bg-slate-50`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        TINT[n.type] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className={`mb-1 ${
                            n.read_at ? 'text-slate-700' : 'font-semibold text-slate-900'
                          }`}
                        >
                          {n.title}
                        </h3>
                        {!n.read_at && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        )}
                      </div>
                      {n.body && <p className="text-sm text-slate-600">{n.body}</p>}
                      <span className="text-xs text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => handleRead(n)} className="block">
                    {body}
                  </Link>
                ) : (
                  <button key={n.id} onClick={() => handleRead(n)} className="block w-full text-left">
                    {body}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Deadline reminders are raised automatically each morning for applications closing within
          seven days.
        </p>
      </div>
    </div>
  );
};
