import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { listServices } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { Service } from '../../lib/database.types';
import { Search, Shield, Star, MapPin, CheckCircle, MessageSquare, Heart, Loader2 } from 'lucide-react';

export const MarketplacePage = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'translation', label: 'Translation' },
    { id: 'visa', label: 'Visa Support' },
    { id: 'accommodation', label: 'Accommodation' },
    { id: 'tutoring', label: 'Tutoring' },
    { id: 'legal', label: 'Legal Services' },
  ];

  const { data: services, loading, error } = useAsyncData<Service[]>(listServices, [], []);

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('marketplace.title')}</h1>
          <p className="text-slate-600">{t('marketplace.subtitle')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('marketplace.search')}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {service.featured && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Featured Service
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{service.name}</h3>
                      {service.verified && (
                        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{service.provider}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Heart className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-slate-900">{service.rating}</span>
                    <span className="text-slate-500">({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500">Starting at</div>
                    <div className="text-lg font-bold text-blue-700">{service.price}</div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Contact
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3 h-3" />
                  <span>Delivery: {service.delivery_time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No services found</h3>
            <p className="text-slate-600">
              {services.length === 0
                ? "The catalogue is empty — run 0003_seed_services.sql to populate it."
                : "Try adjusting your search or filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
