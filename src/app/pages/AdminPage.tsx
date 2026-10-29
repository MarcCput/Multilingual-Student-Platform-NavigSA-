import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  adminListActions,
  adminListProviders,
  adminListTestimonials,
  adminSearchUsers,
  adminSetProviderStatus,
  adminSetSuspended,
  adminSetTestimonialStatus,
} from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type {
  AdminAction,
  AdminUserRow,
  Provider,
  Testimonial,
} from '../../lib/database.types';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquareQuote,
  ScrollText,
  Search,
  ShieldCheck,
  Users,
  XCircle,
  Ban,
  RotateCcw,
} from 'lucide-react';

type Tab = 'users' | 'providers' | 'testimonials' | 'log';

export const AdminPage = () => {
  const { profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const users = useAsyncData<AdminUserRow[]>(() => adminSearchUsers(search), [], [search]);
  const providers = useAsyncData<Provider[]>(adminListProviders, [], []);
  const testimonials = useAsyncData<Testimonial[]>(adminListTestimonials, [], []);
  const log = useAsyncData<AdminAction[]>(adminListActions, [], []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // The database refuses these operations to anyone who is not an admin; this
  // just avoids showing a screen full of empty tables to everyone else.
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const run = async (key: string, fn: () => Promise<void>, after: () => void, ok: string) => {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      setMsg({ kind: 'ok', text: ok });
      after();
      log.reload();
    } catch (err) {
      setMsg({
        kind: 'err',
        text: err instanceof Error ? err.message : 'That action failed.',
      });
    } finally {
      setBusy(null);
    }
  };

  const pendingProviders = providers.data.filter((p) => p.status === 'pending').length;
  const pendingTestimonials = testimonials.data.filter((t) => t.status === 'pending').length;

  const TABS: { id: Tab; label: string; icon: typeof Users; badge?: number }[] = [
    { id: 'users', label: 'Accounts', icon: Users },
    { id: 'providers', label: 'Providers', icon: ShieldCheck, badge: pendingProviders },
    {
      id: 'testimonials',
      label: 'Testimonials',
      icon: MessageSquareQuote,
      badge: pendingTestimonials,
    },
    { id: 'log', label: 'Audit log', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Administration</h1>
        <p className="text-slate-600 mb-8">
          Manage accounts, verify providers and moderate content. Every action here is recorded.
        </p>

        {msg && (
          <div
            className={`mb-6 rounded-xl p-4 flex items-start gap-2 border ${
              msg.kind === 'ok'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {msg.kind === 'ok' ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span className="text-sm">{msg.text}</span>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === tb.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tb.label}
                {tb.badge ? (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      tab === tb.id ? 'bg-white/25' : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {tb.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* ---------------------------------------------------- accounts */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(query.trim());
              }}
              className="p-4 border-b border-slate-200 flex gap-2"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email or business…"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Search
              </button>
            </form>

            {users.loading ? (
              <div className="p-16 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : users.data.length === 0 ? (
              <div className="p-12 text-center text-slate-600">No accounts found.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {users.data.map((u) => (
                  <div key={u.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-900">
                          {[u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unnamed'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                        {u.suspended && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-700 border border-red-200">
                            suspended
                          </span>
                        )}
                        {u.provider_business && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                            {u.provider_business} · {u.provider_status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 break-all">{u.email}</p>
                      <p className="text-xs text-slate-400">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      disabled={busy === u.id}
                      onClick={() => {
                        const reason = u.suspended
                          ? null
                          : window.prompt('Reason for suspending this account?');
                        if (!u.suspended && reason === null) return;
                        run(
                          u.id,
                          () => adminSetSuspended(u.id, !u.suspended, reason),
                          users.reload,
                          u.suspended ? 'Account reactivated.' : 'Account suspended.',
                        );
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors disabled:opacity-60 ${
                        u.suspended
                          ? 'text-green-700 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {busy === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : u.suspended ? (
                        <RotateCcw className="w-4 h-4" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                      {u.suspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------- providers */}
        {tab === 'providers' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {providers.loading ? (
              <div className="p-16 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : providers.data.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                No provider registrations yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {providers.data.map((p) => (
                  <div key={p.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-900">{p.business_name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs border ${
                              p.status === 'verified'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : p.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {p.category}
                          {p.location ? ` · ${p.location}` : ''}
                          {p.registration_number ? ` · ${p.registration_number}` : ''}
                        </p>
                        {p.description && (
                          <p className="text-sm text-slate-600 mt-2">{p.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          {p.accreditation_path
                            ? 'Accreditation document attached'
                            : 'No accreditation document'}
                        </p>
                      </div>
                      {p.status !== 'verified' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            disabled={busy === p.id}
                            onClick={() =>
                              run(
                                p.id,
                                () => adminSetProviderStatus(p.id, 'verified'),
                                providers.reload,
                                `${p.business_name} is now verified and visible.`,
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg disabled:opacity-60"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Verify
                          </button>
                          <button
                            disabled={busy === p.id}
                            onClick={() => {
                              const reason = window.prompt('Why is this being rejected?');
                              if (reason === null) return;
                              run(
                                p.id,
                                () => adminSetProviderStatus(p.id, 'rejected', reason),
                                providers.reload,
                                'Registration rejected.',
                              );
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-60"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------ testimonials */}
        {tab === 'testimonials' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {testimonials.loading ? (
              <div className="p-16 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : testimonials.data.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                No testimonials have been submitted.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {testimonials.data.map((tm) => (
                  <div key={tm.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-slate-800 italic mb-2">“{tm.quote}”</p>
                      <p className="text-xs text-slate-500">
                        {tm.name_consent
                          ? `Shown as: ${tm.display_name || 'Unnamed'}`
                          : 'No consent to show a name — will display anonymously'}
                        {' · '}
                        <span className="uppercase">{tm.status}</span>
                      </p>
                    </div>
                    {tm.status !== 'approved' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          disabled={busy === tm.id}
                          onClick={() =>
                            run(
                              tm.id,
                              () => adminSetTestimonialStatus(tm.id, 'approved'),
                              testimonials.reload,
                              'Testimonial approved and now public.',
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg disabled:opacity-60"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          disabled={busy === tm.id}
                          onClick={() =>
                            run(
                              tm.id,
                              () => adminSetTestimonialStatus(tm.id, 'rejected'),
                              testimonials.reload,
                              'Testimonial rejected.',
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-60"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- audit log */}
        {tab === 'log' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {log.loading ? (
              <div className="p-16 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : log.data.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                No administrative actions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {log.data.map((a) => (
                  <div key={a.id} className="p-4 flex items-start gap-3">
                    <ScrollText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-mono text-sm text-slate-900">{a.action}</span>
                      <span className="text-sm text-slate-500">
                        {' '}
                        on {a.target_table}
                        {a.target_id ? ` · ${a.target_id.slice(0, 8)}` : ''}
                      </span>
                      <div className="text-xs text-slate-400">
                        {new Date(a.created_at).toLocaleString()}
                        {a.detail && Object.keys(a.detail).length > 0
                          ? ` · ${JSON.stringify(a.detail)}`
                          : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
