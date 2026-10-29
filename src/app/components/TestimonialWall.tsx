import { listApprovedTestimonials } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { Testimonial } from '../../lib/database.types';
import { Quote } from 'lucide-react';

/**
 * Approved testimonials, shown on the public landing page.
 *
 * Readable without a session: the access rule on the table exposes approved
 * rows to anonymous visitors and nothing else. A name only appears when the
 * author explicitly consented to it being shown.
 */
export const TestimonialWall = () => {
  const { data, loading } = useAsyncData<Testimonial[]>(listApprovedTestimonials, [], []);

  if (loading || data.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-center text-sm font-medium text-slate-500 mb-4">
        What students say
      </h2>
      <div className="space-y-3">
        {data.slice(0, 3).map((t) => (
          <figure
            key={t.id}
            className="bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4"
          >
            <Quote className="w-4 h-4 text-blue-500 mb-2" />
            <blockquote className="text-sm text-slate-700 italic">“{t.quote}”</blockquote>
            <figcaption className="text-xs text-slate-500 mt-2">
              — {t.name_consent && t.display_name ? t.display_name : 'A verified student'}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};
