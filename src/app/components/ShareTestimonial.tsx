import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitTestimonial } from '../../lib/api';
import { CheckCircle, Loader2, MessageSquareQuote } from 'lucide-react';

/**
 * Lets a signed-in student submit a testimonial. It is held as "pending" until
 * an administrator approves it, and the student's name is only ever shown if
 * they tick the consent box.
 */
export const ShareTestimonial = () => {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState('');
  const [consent, setConsent] = useState(false);

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await submitTestimonial(user.id, {
        quote: quote.trim(),
        display_name: displayName,
        name_consent: consent,
      });
      setSent(true);
      setQuote('');
      setConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your testimonial.');
    } finally {
      setSaving(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
        <h3 className="font-bold text-slate-900 mb-2">Thank you</h3>
        <p className="text-sm text-slate-600">
          Your testimonial has been sent for review. It appears on the home page once an
          administrator approves it.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <MessageSquareQuote className="w-8 h-8 text-blue-600 mb-3" />
      <h3 className="font-bold text-slate-900 mb-2">Share your story</h3>
      <p className="text-sm text-slate-600 mb-4">
        Tell other international students how NavigSA helped.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Write a testimonial
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <textarea
            required
            minLength={20}
            rows={4}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="What made the difference for you?"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded"
            />
            <span>
              Show my name{displayName ? ` (${displayName})` : ''} with this quote. Leave
              unticked to appear anonymously.
            </span>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Send for review
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
