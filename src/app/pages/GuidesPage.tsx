import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { listGuides } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { Guide, GuideCategory } from '../../lib/database.types';
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Home,
  Languages,
  Loader2,
  Plane,
  ShieldCheck,
} from 'lucide-react';

const CATEGORIES: { id: GuideCategory | 'all'; label: string; icon: typeof BookOpen }[] = [
  { id: 'all', label: 'All guides', icon: BookOpen },
  { id: 'saqa', label: 'Qualifications (SAQA)', icon: ShieldCheck },
  { id: 'visa', label: 'Visas', icon: Plane },
  { id: 'university', label: 'University applications', icon: GraduationCap },
  { id: 'accommodation', label: 'Accommodation', icon: Home },
];

export const GuidesPage = () => {
  const { language } = useLanguage();
  const [category, setCategory] = useState<GuideCategory | 'all'>('all');
  const [open, setOpen] = useState<Guide | null>(null);

  const { data: guides, loading, error } = useAsyncData<Guide[]>(
    () => listGuides(language, category),
    [],
    [language, category],
  );

  // --- reading view ---------------------------------------------------------
  if (open) {
    const translated = open.language === language;
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setOpen(null)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to guides
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">{open.title}</h1>
          {open.summary && <p className="text-lg text-slate-600 mb-6">{open.summary}</p>}

          {!translated && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Languages className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This guide has not been translated into your chosen language yet, so the English
                version is shown.
              </p>
            </div>
          )}

          <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            {open.body.split('\n\n').map((para, i) => (
              <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
                {para}
              </p>
            ))}
          </article>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
            <h2 className="font-bold text-blue-900 mb-1">Check the official source</h2>
            <p className="text-sm text-blue-800 mb-3">
              Requirements, fees and closing dates change, and differ between institutions and
              countries. Treat the official source as authoritative, not this page.
            </p>
            {open.sources.length > 0 ? (
              <ul className="space-y-2">
                {open.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 underline"
                    >
                      {s.label}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-blue-800">
                Confirm details directly with the institution concerned.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- index ----------------------------------------------------------------
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Guides</h1>
        <p className="text-slate-600 mb-8">
          Orientation on qualifications, visas, university applications and accommodation.
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  category === c.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {c.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No guides here yet</h3>
            <p className="text-slate-600">Try another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((g) => {
              const meta = CATEGORIES.find((c) => c.id === g.category);
              const Icon = meta?.icon ?? BookOpen;
              return (
                <button
                  key={g.id}
                  onClick={() => setOpen(g)}
                  className="text-left bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase">
                      {meta?.label ?? g.category}
                    </span>
                    {g.language !== language && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        EN
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{g.title}</h3>
                  {g.summary && <p className="text-sm text-slate-600">{g.summary}</p>}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-8">
          These guides orient you and point to the official authority. They are not legal or
          immigration advice.
        </p>
      </div>
    </div>
  );
};
