import { useState } from 'react';
import { createService, listMyServices, setServiceActive } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { Provider, Service, ServiceCategory } from '../../lib/database.types';
import { AlertCircle, EyeOff, Eye, Loader2, Plus, Package, ShieldCheck, X } from 'lucide-react';

/**
 * A provider's own listings. Services can be drafted while the registration is
 * still pending, but the marketplace only shows them once an administrator has
 * verified the provider, so nothing here can reach students early.
 */
export const ProviderServices = ({ provider }: { provider: Provider }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    location: provider.location ?? '',
    delivery_time: '',
  });

  const { data: services, loading, reload } = useAsyncData<Service[]>(
    () => listMyServices(provider.id),
    [],
    [provider.id],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createService(provider.id, {
        name: form.name.trim(),
        category: provider.category as ServiceCategory,
        description: form.description.trim() || null,
        price: form.price.trim() || null,
        location: form.location.trim() || null,
        delivery_time: form.delivery_time.trim() || null,
      });
      setForm({ ...form, name: '', description: '', price: '', delivery_time: '' });
      setOpen(false);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the service.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s: Service) => {
    setBusy(s.id);
    setError(null);
    try {
      await setServiceActive(s.id, !s.is_active);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the service.');
    } finally {
      setBusy(null);
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';

  const listed = provider.status === 'verified';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">My services</h3>
          <p className="text-sm text-slate-600">
            {listed
              ? 'Active services are visible to students in the marketplace.'
              : 'You can draft services now. They stay hidden until your registration is verified.'}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
        >
          {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {open ? 'Cancel' : 'Add service'}
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {open && (
        <form onSubmit={handleCreate} className="p-6 border-b border-slate-200 space-y-4 bg-slate-50">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Service name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Certified document translation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="What is included and who it is for"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
                placeholder="R 450"
              />
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Delivery time</label>
              <input
                value={form.delivery_time}
                onChange={(e) => setForm({ ...form, delivery_time: e.target.value })}
                className={inputClass}
                placeholder="2-3 days"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Category is fixed to your registration ({provider.category}). Ratings and the verified
            shield are set by NavigSA, not by you.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save service
          </button>
        </form>
      )}

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">You have not listed any services yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {services.map((s) => (
            <div key={s.id} className="p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`font-semibold ${s.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.name}
                  </span>
                  {s.verified && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                  {!s.is_active && (
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                      switched off
                    </span>
                  )}
                  {s.is_active && !listed && (
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                      hidden until verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {[s.price, s.location, s.delivery_time].filter(Boolean).join(' · ') || '—'}
                </p>
                {s.description && <p className="text-sm text-slate-500 mt-1">{s.description}</p>}
              </div>
              <button
                disabled={busy === s.id}
                onClick={() => toggle(s)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg whitespace-nowrap disabled:opacity-60"
              >
                {busy === s.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : s.is_active ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {s.is_active ? 'Switch off' : 'Switch on'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
