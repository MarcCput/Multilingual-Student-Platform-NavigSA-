import { useState } from 'react';
import { listProviderBookings, setBookingStatus } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { BookingStatus, Provider, ProviderBooking } from '../../lib/database.types';
import { AlertCircle, Calendar, CheckCircle, Inbox, Loader2, Ticket, XCircle } from 'lucide-react';

const tone = (s: BookingStatus) =>
  s === 'completed'
    ? 'text-green-700 bg-green-50 border-green-200'
    : s === 'confirmed'
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : s === 'cancelled'
    ? 'text-slate-600 bg-slate-100 border-slate-200'
    : 'text-amber-700 bg-amber-50 border-amber-200';

/**
 * Bookings for a provider's own services. This is where a booking moves from
 * pending to confirmed to completed - and a student can only leave a review
 * once it is completed, so this screen is what makes reviews reachable.
 *
 * Student details are not shown: the database does not let a provider read
 * another person's profile, and a reference plus the notes is enough to act on.
 */
export const ProviderBookings = ({ provider }: { provider: Provider }) => {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: bookings, loading, reload } = useAsyncData<ProviderBooking[]>(
    () => listProviderBookings(provider.id),
    [],
    [provider.id],
  );

  const move = async (b: ProviderBooking, status: BookingStatus) => {
    setBusy(b.id);
    setError(null);
    try {
      await setBookingStatus(b.id, status);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the booking.');
    } finally {
      setBusy(null);
    }
  };

  // Only a verified provider may act on bookings; the database enforces this.
  const canAct = provider.status === 'verified';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="p-6 border-b border-slate-200">
        <h3 className="font-bold text-slate-900">Bookings for my services</h3>
        <p className="text-sm text-slate-600">
          {canAct
            ? 'Confirm bookings, and mark them completed once the work is done so students can review you.'
            : 'You will be able to manage bookings once your registration is verified.'}
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center">
          <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">No bookings yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {bookings.map((b) => (
            <div key={b.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-slate-900">{b.services?.name ?? 'Service'}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${tone(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(b.scheduled_for).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Ticket className="w-4 h-4 text-slate-400" />
                      {b.reference}
                    </span>
                  </div>
                  {b.notes && (
                    <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
                      {b.notes}
                    </p>
                  )}
                </div>
              </div>

              {canAct && (b.status === 'pending' || b.status === 'confirmed') && (
                <div className="flex gap-2 mt-3">
                  {b.status === 'pending' && (
                    <button
                      disabled={busy === b.id}
                      onClick={() => move(b, 'confirmed')}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg disabled:opacity-60"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <button
                      disabled={busy === b.id}
                      onClick={() => move(b, 'completed')}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg disabled:opacity-60"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark completed
                    </button>
                  )}
                  <button
                    disabled={busy === b.id}
                    onClick={() => {
                      if (window.confirm(`Cancel booking ${b.reference}?`)) move(b, 'cancelled');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
