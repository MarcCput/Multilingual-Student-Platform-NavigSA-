import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  cancelBooking,
  createBooking,
  createReview,
  listBookings,
  listServices,
} from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { BookingWithService, Service } from '../../lib/database.types';
import {
  Calendar,
  CalendarPlus,
  CheckCircle,
  Clock,
  Loader2,
  Star,
  X,
  XCircle,
  AlertCircle,
  Ticket,
} from 'lucide-react';

/** Local datetime string for <input type="datetime-local"> min — blocks past slots. */
function nowForInput(): string {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

const statusStyle = (s: string) =>
  s === 'completed'
    ? 'text-green-700 bg-green-50 border-green-200'
    : s === 'confirmed'
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : s === 'cancelled'
    ? 'text-slate-600 bg-slate-100 border-slate-200'
    : 'text-amber-700 bg-amber-50 border-amber-200';

const statusIcon = (s: string) =>
  s === 'completed' ? <CheckCircle className="w-4 h-4" />
  : s === 'confirmed' ? <CheckCircle className="w-4 h-4" />
  : s === 'cancelled' ? <XCircle className="w-4 h-4" />
  : <Clock className="w-4 h-4" />;

export const BookingsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [draft, setDraft] = useState({ service_id: '', scheduled_for: '', notes: '' });

  const [reviewFor, setReviewFor] = useState<BookingWithService | null>(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const {
    data: bookings,
    loading,
    error,
    reload,
  } = useAsyncData<BookingWithService[]>(
    () => (user ? listBookings(user.id) : Promise.resolve([])),
    [],
    [user?.id],
  );

  const { data: services } = useAsyncData<Service[]>(listServices, [], []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMessage(null);

    if (new Date(draft.scheduled_for) <= new Date()) {
      setMessage({ kind: 'err', text: 'Choose a date and time in the future.' });
      return;
    }

    setSaving(true);
    try {
      const made = await createBooking(user.id, {
        service_id: draft.service_id,
        scheduled_for: new Date(draft.scheduled_for).toISOString(),
        notes: draft.notes || null,
      });
      setMessage({
        kind: 'ok',
        text: `Booking confirmed. Your reference is ${made.reference}.`,
      });
      setDraft({ service_id: '', scheduled_for: '', notes: '' });
      setShowForm(false);
      reload();
    } catch (err) {
      setMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Could not create the booking.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (b: BookingWithService) => {
    if (!window.confirm(`Cancel booking ${b.reference}?`)) return;
    try {
      await cancelBooking(b.id);
      reload();
    } catch (err) {
      setMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Could not cancel.',
      });
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewFor) return;
    setSaving(true);
    setMessage(null);
    try {
      await createReview(user.id, {
        booking_id: reviewFor.id,
        service_id: reviewFor.service_id,
        rating: review.rating,
        comment: review.comment || null,
      });
      setMessage({ kind: 'ok', text: 'Thank you — your review has been posted.' });
      setReviewFor(null);
      setReview({ rating: 5, comment: '' });
      reload();
    } catch (err) {
      setMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Could not post the review.',
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';

  const upcoming = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.scheduled_for) > new Date(),
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('nav.bookings')}</h1>
            <p className="text-slate-600">Book a service and track your appointments</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
          >
            {showForm ? <X className="w-5 h-5" /> : <CalendarPlus className="w-5 h-5" />}
            <span className="hidden sm:inline">{showForm ? 'Cancel' : 'New Booking'}</span>
          </button>
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

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4"
          >
            <h2 className="font-bold text-slate-900">Book a service</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
                <select
                  required
                  value={draft.service_id}
                  onChange={(e) => setDraft({ ...draft, service_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Choose a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.provider} ({s.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date and time
                </label>
                <input
                  type="datetime-local"
                  required
                  min={nowForInput()}
                  value={draft.scheduled_for}
                  onChange={(e) => setDraft({ ...draft, scheduled_for: e.target.value })}
                  className={inputClass}
                />
                <p className="text-xs text-slate-500 mt-2">Past dates cannot be selected.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes for the provider (optional)
              </label>
              <textarea
                rows={2}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                className={inputClass}
                placeholder="Anything the provider should know in advance"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Booking
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total bookings</div>
            <div className="text-2xl font-bold text-slate-900">{bookings.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Upcoming</div>
            <div className="text-2xl font-bold text-blue-700">{upcoming.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-700">
              {bookings.filter((b) => b.status === 'completed').length}
            </div>
          </div>
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
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings yet</h3>
              <p className="text-slate-600 mb-6">
                Book a verified provider from the marketplace to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Make a booking
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {bookings.map((b) => {
                const reviewed = (b.reviews?.length ?? 0) > 0;
                return (
                  <div key={b.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-bold text-slate-900">
                            {b.services?.name ?? 'Service'}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusStyle(
                              b.status,
                            )}`}
                          >
                            {statusIcon(b.status)}
                            {b.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{b.services?.provider}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-500">Reference</div>
                        <div className="font-mono text-sm font-medium text-slate-900 flex items-center gap-1">
                          <Ticket className="w-3.5 h-3.5 text-slate-400" />
                          {b.reference}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(b.scheduled_for).toLocaleString()}
                      </span>
                      {b.services?.price && (
                        <span className="font-medium text-blue-700">{b.services.price}</span>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                        {b.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancel(b)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Cancel booking
                        </button>
                      )}
                      {b.status === 'completed' && !reviewed && (
                        <button
                          onClick={() => setReviewFor(b)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Star className="w-4 h-4" />
                          Leave a review
                        </button>
                      )}
                      {reviewed && (
                        <span className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          You rated this {b.reviews?.[0]?.rating}/5
                        </span>
                      )}
                    </div>

                    {reviewFor?.id === b.id && (
                      <form
                        onSubmit={handleReview}
                        className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3"
                      >
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReview({ ...review, rating: n })}
                                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                                className="p-1"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    n <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Comment (optional)
                          </label>
                          <textarea
                            rows={2}
                            value={review.comment}
                            onChange={(e) => setReview({ ...review, comment: e.target.value })}
                            className={inputClass}
                            placeholder="How was the service?"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                          >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Post review
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewFor(null)}
                            className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
